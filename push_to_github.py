#!/usr/bin/env python3
"""Push local changes to GitHub using the Git Data API."""
import hashlib, json, os, subprocess, time, base64, tempfile

TOKEN = "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"
REPO = "EnJirad/velnox"
BRANCH = "main"
PROJECT_ROOT = "/home/daytona/codebase"
SKIP_FILES = {".env.local", ".env", ".env.example", "push_to_github.py"}

def api_call(method, url, data=None):
    cmd = [
        "curl", "-s", "-X", method,
        "-H", f"Authorization: token {TOKEN}",
        "-H", "Accept: application/vnd.github.v3+json"
    ]
    if data:
        body = json.dumps(data)
        tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        tmp.write(body)
        tmp.close()
        cmd.extend(["-H", "Content-Type: application/json", "-d", f"@{tmp.name}"])
    cmd.append(url)
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        return json.loads(result.stdout) if result.stdout.strip() else {}
    finally:
        if data:
            os.unlink(tmp.name)

def get_blob_sha(content_bytes):
    header = f"blob {len(content_bytes)}\0".encode()
    return hashlib.sha1(header + content_bytes).hexdigest()

def main():
    ref_data = api_call("GET", f"https://api.github.com/repos/{REPO}/git/ref/heads/{BRANCH}")
    head_sha = ref_data["object"]["sha"]
    print(f"Remote HEAD: {head_sha}")

    tree_data = api_call("GET", f"https://api.github.com/repos/{REPO}/git/trees/{head_sha}?recursive=1")
    remote_tree = {}
    for item in tree_data.get("tree", []):
        if item["type"] == "blob":
            remote_tree[item["path"]] = item["sha"]
    print(f"Remote files: {len(remote_tree)}")

    skip_dirs = {"node_modules", ".git", "__pycache__", ".tmp", ".cache", "dist", ".vite"}
    local_files = {}
    for dirpath, dirnames, filenames in os.walk(PROJECT_ROOT):
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        for fname in filenames:
            if fname in SKIP_FILES or fname.endswith(".local"):
                continue
            full_path = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(full_path, PROJECT_ROOT)
            try:
                with open(full_path, "rb") as f:
                    content = f.read()
                local_files[rel_path] = {
                    "sha": get_blob_sha(content),
                    "content": content,
                    "size": len(content)
                }
            except:
                pass
    print(f"Local files: {len(local_files)}")

    changed = []
    for p, info in sorted(local_files.items()):
        remote_sha = remote_tree.get(p)
        if remote_sha is None:
            changed.append((p, info))
            print(f"  NEW: {p} ({info['size']} bytes)")
        elif remote_sha != info["sha"]:
            changed.append((p, info))
            print(f"  MODIFIED: {p} ({info['size']} bytes)")

    deleted = []
    for p in remote_tree:
        if p not in local_files and not p.startswith("node_modules/"):
            deleted.append(p)
            print(f"  DELETED: {p}")

    if not changed and not deleted:
        print("\nNo changes detected.")
        return

    print(f"\nUploading {len(changed)} changed blobs...")
    blob_map = {}
    for i, (p, info) in enumerate(changed):
        data = api_call("POST", f"https://api.github.com/repos/{REPO}/git/blobs", {
            "content": base64.b64encode(info["content"]).decode(),
            "encoding": "base64"
        })
        if "sha" in data:
            blob_map[p] = data["sha"]
            print(f"  [{i+1}/{len(changed)}] {p} -> {data['sha'][:12]}")
        else:
            print(f"  [{i+1}/{len(changed)}] FAILED: {p}: {data}")
        time.sleep(0.3)

    full = dict(remote_tree)
    full.update(blob_map)
    for d in deleted:
        full.pop(d, None)
    tree_items = [{"path": p, "mode": "100644", "type": "blob", "sha": s} for p, s in full.items()]

    new_tree = api_call("POST", f"https://api.github.com/repos/{REPO}/git/trees", {
        "base_tree": head_sha,
        "tree": tree_items
    })
    tree_sha = new_tree.get("sha")
    if not tree_sha:
        print(f"Tree error: {new_tree}")
        return
    print(f"\nTree: {tree_sha}")

    commit = api_call("POST", f"https://api.github.com/repos/{REPO}/git/commits", {
        "message": "feat: profile avatar backend upload + CORS + debug tracing + mobile language switcher",
        "tree": tree_sha,
        "parent": [head_sha]
    })
    commit_sha = commit.get("sha")
    if not commit_sha:
        print(f"Commit error: {commit}")
        return
    print(f"Commit: {commit_sha}")

    result = api_call("PATCH", f"https://api.github.com/repos/{REPO}/git/refs/heads/{BRANCH}", {
        "sha": commit_sha
    })
    if result.get("ref"):
        print(f"\nPUSHED! https://github.com/{REPO}/commit/{commit_sha[:12]}")
    else:
        print("Retrying with force...")
        result = api_call("PATCH", f"https://api.github.com/repos/{REPO}/git/refs/heads/{BRANCH}", {
            "sha": commit_sha,
            "force": True
        })
        if result.get("ref"):
            print(f"\nPUSHED (force)! https://github.com/{REPO}/commit/{commit_sha[:12]}")
        else:
            print(f"Ref error: {result}")

main()

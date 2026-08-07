ใน `apps/shop/lib/api-client.ts` แก้ type ของ uploadImage:

จาก:
  folder: 'products' | 'avatars' | 'shops'
เป็น:
  folder: 'products' | 'avatars' | 'shops' | 'slips'

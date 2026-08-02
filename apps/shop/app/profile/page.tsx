import { ProfileView } from './profile-view';
import { RequireAuth } from '@/components/require-auth';

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileView />
    </RequireAuth>
  );
}

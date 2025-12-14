import { verifyAdmin } from '@/lib/auth';

export async function fetchUser() {
  const session = await verifyAdmin();
  return session?.user || null;
}

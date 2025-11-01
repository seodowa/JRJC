import { getSession } from '@/lib';

export async function fetchUser() {
  const session = await getSession();
  return session?.user || null;
}

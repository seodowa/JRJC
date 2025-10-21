import { getSession } from '@/lib';

export async function getUser() {
  const session = await getSession();
  return session?.user || null;
}

import AdminLoginForm from "../../../components/admin/AdminLoginForm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib";
import { ALLOWED_ADMIN_ROLES } from "@/lib/auth-config";

export default async function AdminSU() {
  // Use the centralized, secure getSession() function.
  // This function now handles decryption, expiration, AND stale-session checks.
  const session = await getSession();

  // If the session is valid and the user has an admin role, redirect to the dashboard.
  if (session?.user && ALLOWED_ADMIN_ROLES.includes(session.user.account_type)) {
    redirect("/adminSU/dashboard");
  }

  // Otherwise, the session is invalid, stale, or the user is not an admin.
  // In all these cases, we should show the login form.
  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-paper lg:grid-cols-2">
      <figure className="relative hidden lg:block">
        <img src="/images/BG.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <figcaption className="num absolute bottom-6 left-8 bg-ink/70 px-3 py-1.5 text-xs text-paper">
          JRJC Rent-a-Car — Bukidnon
        </figcaption>
      </figure>
      <div className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-20">
        <div className="flex items-center gap-3">
          <img src="/images/jrjc_logo.png" alt="" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-2xl font-semibold tracking-tight">JRJC</span>
          <span className="num text-[11px] tracking-[0.12em] text-ink-2 uppercase">Admin</span>
        </div>
        <AdminLoginForm />
        <p className="num text-xs text-ink-2">Staff access only.</p>
      </div>
    </div>
  );
}

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
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative
                 bg-[url('/images/BG.webp')] bg-cover bg-center bg-no-repeat
                 overflow-hidden" /* Background image */
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#D1F8EF]/50 to-[#D1F8EF]/100" /*Gradient Filter*/ />
      <div className="z-10 flex flex-col md:flex-row justify-center items-center 
                      gap-6 sm:gap-8 md:gap-20 lg:gap-40 xl:gap-60 2xl:gap-80
                      w-full max-w-7xl px-4 sm:px-6 md:px-8">
        <img 
          src="/images/jrjc_logo.png" // Placeholder for logo image
          alt="Logo"
          className="w-full max-w-[150px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px]
                     h-auto object-contain"
        /> 
        <AdminLoginForm />
      </div>
    </div>
  );
}
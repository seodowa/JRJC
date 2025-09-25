import LoginForm from "../components/LoginForm";

export default function AdminSU() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative
                 bg-[url('/images/kentb_car_gradient.webp')] bg-cover bg-center bg-no-repeat
                 overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="z-10 flex flex-col md:flex-row justify-center items-center 
                      gap-6 sm:gap-8 md:gap-20 lg:gap-40 xl:gap-80 2xl:gap-120
                      w-full max-w-7xl px-4 sm:px-6 md:px-8">
        <img 
          src="/images/logo-placeholder.webp"
          alt="Logo"
          className="w-full max-w-[150px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px]
                     h-auto object-contain"
        />
        <LoginForm />
      </div>
    </div>
  );
}
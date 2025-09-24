import LoginForm from "../components/LoginForm";

export default function AdminSU() {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: "url('/images/kentb_car_gradient.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/70" /> {/* Dark overlay */}
      <div className="z-10"> {/* Ensure form appears above the background */}
        <LoginForm />
      </div>
    </div>
  );
}
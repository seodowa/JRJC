'use client';
import PasswordInput from './PasswordInput';

export default function LoginForm() {
    return (
        <div className="my-10 grid h-full max-w-lg flex-col place-items-center gap-4 rounded-2xl 
                outline-[0.50px] outline-offset-[-0.50px] outline-white/20 
                bg-black/5 backdrop-blur-sm shadow-lg shadow-black/25 p-20">
            <h1 className="mb-4 text-4xl font-bold text-blacks">Login</h1>
            <form className="flex flex-col items-center justify-evenly space-y-4">
                <input 
                    className="rounded-3xl border border-white/30 bg-white p-2 
                              text-black placeholder:font-normal placeholder-black/70 backdrop-blur-sm shadow-lg" 
                    type="text" 
                    name="username" 
                    placeholder="Username" 
                />
                
                <PasswordInput 
                    name="password"
                    placeholder="Password"
                />
                
                <a className="underline self-end text-sm -mt-3.5" href="#">Forgot Password?</a>
                <button 
                    className="mb-4 max-w-36 rounded-4xl border border-white/30 bg-[#8BFFF1]/40 px-4 py-2 
                              text-black hover:bg-[#8BFFF1] transition-colors duration-200" 
                    type="submit">
                    Login
                </button>
            </form>
        </div>
    );
}
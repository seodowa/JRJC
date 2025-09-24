export default function LoginForm() {
    return (
        <div className="my-10 grid h-full max-w-90 flex-col place-items-center gap-4 rounded-4xl 
                        outline-[0.50px] outline-offset-[-0.50px] outline-white 
                        bg-white/20 backdrop-blur-sm p-15">
            <h1 className="mb-4 text-4xl font-bold text-white">Login</h1>
            <form className="flex flex-col items-center justify-evenly space-y-4">
                <input 
                    className="font-bold rounded-3xl border border-white/30 bg-white/10 p-2 
                              text-white placeholder-white/70 backdrop-blur-sm" 
                    type="text" 
                    name="username" 
                    placeholder="Username" 
                />
                <input 
                    className="font-bold rounded-3xl border border-white/30 bg-white/10 p-2 
                              text-white placeholder-white/70 backdrop-blur-sm" 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                />
                <button 
                    className="mb-4 rounded-4xl border border-white/30 bg-white/10 px-5 py-2 
                              text-white hover:bg-white/20 transition-colors duration-200" 
                    type="submit">
                    Login
                </button>
            </form>
        </div>
    );
}
export default function LoginForm() {
    return (
        <div className="grid template-columns-1 gap-4 place-items-center ">
            <h1>Login</h1>
            <form>
                <label>
                    <input className="border border-black rounded-3xl p-2" 
                    type="text" name="username" placeholder="Username"/>
                </label>
                <br />
                <label>
                    <input className="border border-black rounded-3xl p-2" 
                    type="text" name="password" placeholder="Password"/>
                </label>
                <br />
                <button className="border border-black rounded-2xl p-2" 
                type="submit">Login</button>
            </form>
        </div>
    );
}
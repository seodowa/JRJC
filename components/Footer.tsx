import "@/app/globals.css";
import FbIcon from "./icons/FbIcon";
import EmailIcon from "./icons/EmailIcon";
import CallIcon from "./icons/CallIcon";


export default function Footer() {
    const ICONSIZE = 25;
    const FBLINK = "https://www.facebook.com/profile.php?id=61555492203800";
  
    return (
    <section id="footer" className="h-auto relative bg-footer-color flex flex-col items-center py-10">
        <h1 className="font-semibold text-xl text-center text-white pb-6">Contact Us</h1>
        <div className="w-screen flex justify-center items-center text-white">
            <ul className="flex gap-4 flex-col *:flex *:flex-row *:w-full *:gap-2 *:text-nowrap sm:flex-row">
                <li>
                    <FbIcon size={ICONSIZE}/>
                    <a href={FBLINK} className="hover:text-gray-300">JRJC Car Rental</a>
                </li>
                <li>
                    <EmailIcon size={ICONSIZE}/>
                    <p>jasperj0y0903@gmail.com</p>
                </li>
                <li>
                    <CallIcon size={ICONSIZE}/>
                    <p>+63 967 653 6176</p>
                </li>
            </ul>
        </div>
    </section>
  );
}
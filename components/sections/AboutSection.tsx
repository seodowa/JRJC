import "@/app/globals.css";

export default function AboutSection() {
  return (
    <section id="about" className="min-h-screen relative -z-100 bg-secondary-50 flex flex-col items-center pt-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl py-8 text-center font-main-font">About Us</h1>
        <div className="flex h-100 font-secondary-font px-4 max-w-7xl text-md/normal sm:text-xl/normal text-justify">
          <p className="leading-relaxed">
            At <span><strong>JRJC Car Rental</strong></span>, we're driven by a simple goal: to get you where you need to go in a car you can trust.
            As a local, independent rental agency, we offer a personal touch you won't find elsewhere. Our focus is on providing a small, 
            carefully maintained fleet of vehicles at competitive, straightforward prices. We believe in treating our customers like neighbors, because that’s exactly what you are.
            Choose JRJC for a hassle-free rental experience built on reliability, honesty, and a genuine commitment to your satisfaction. 
            Your journey starts with us.
          </p>
          
        </div>
    </section>
  );
}
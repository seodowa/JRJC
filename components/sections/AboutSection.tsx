import "@/app/globals.css";

export default function AboutSection() {
  return (
    <section id="about" className="min-h-screen relative -z-100 bg-secondary-50 flex flex-col items-center pt-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl py-8 text-center font-main-font">About Us</h1>
        <div className="flex h-100 font-secondary-font px-4 max-w-7xl text-md/normal sm:text-xl/normal text-justify">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tempor vehicula erat a hendrerit. Sed id ligula sit amet sapien molestie cursus. Maecenas sed ex tellus. Nullam tempor ligula magna, in lobortis diam lacinia vel. Curabitur efficitur neque vel tellus interdum, vel imperdiet nisl mattis. Curabitur sollicitudin at est eu cursus. Nulla nibh augue, pharetra nec sem quis, feugiat facilisis mauris. Aenean dapibus lacus eros, id sagittis enim sodales vel. Etiam pretium lorem arcu, eu scelerisque nibh lacinia ac. In hac habitasse platea dictumst. Ut malesuada lorem purus, sodales molestie enim mollis eget.
        </div>
    </section>
  );
}
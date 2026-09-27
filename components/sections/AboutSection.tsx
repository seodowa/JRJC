"use client";

import { useCMS } from "@/app/(client)/context/CMSContext";

export default function AboutSection() {
  const { getText } = useCMS();

  const title = getText('about', 'title', 'About Us');
  const content = getText('about', 'content',
    `At <span><strong>JRJC Car Rental</strong></span>, we're driven by a simple goal: to get you where you need to go in a car you can trust.
    As a local, independent rental agency, we offer a personal touch you won't find elsewhere. Our focus is on providing a small, 
    carefully maintained fleet of vehicles at competitive, straightforward prices. We believe in treating our customers like neighbors, because that’s exactly what you are.
    Choose JRJC for a hassle-free rental experience built on reliability, honesty, and a genuine commitment to your satisfaction. 
    Your journey starts with us.`
  );

  return (
    <section id="about" className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8 lg:px-16 lg:py-28">
      <div className="grid grid-cols-1 gap-6 border-t border-ink pt-6 md:grid-cols-12">
        <div className="eyebrow md:col-span-2">03 — About</div>
        <h2 className="text-4xl leading-none sm:text-5xl md:col-span-4 md:text-[3.5rem]">{title}</h2>
        <div
          className="max-w-2xl text-lg leading-relaxed text-ink-2 md:col-span-6 [&_strong]:font-medium [&_strong]:text-ink"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}

"use client";

import { useCMS } from "@/app/(client)/context/CMSContext";
import { buttonClass } from "../ui/button";

const STEPS = ["Pick a car", "Choose dates", "Pay via GCash"];

export default function HeroSection() {
  const { getText, getImage } = useCMS();

  const subtitle = getText('hero', 'subtitle', 'Car Rental Services');
  const mainImage = getImage('hero', 'main_image', '/images/BG.webp');

  return (
    <section id="hero" className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 pt-10 pb-20 sm:px-8 md:grid-cols-12 md:gap-6 md:pt-16 lg:px-16 lg:pb-24">
      <div className="flex flex-col gap-7 md:col-span-6 md:self-end lg:col-span-5">
        <p className="eyebrow">{subtitle} — Bukidnon, PH</p>
        <h1 className="text-[3.25rem] leading-[0.98] font-normal tracking-[-0.035em] sm:text-7xl lg:text-[5.25rem]">
          Good cars for <em className="pr-[0.1em] text-forest">long</em> roads.
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-ink-2">
          Pick a car, choose your dates, and pay through GCash. We confirm by text and email.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="/book" className={buttonClass("primary", "lg")}>Book a car</a>
          <a href="/tracker" className={buttonClass("secondary", "lg")}>Track a booking</a>
        </div>
        <ol className="mt-2 grid grid-cols-3 gap-4 border-t border-line pt-5">
          {STEPS.map((step, i) => (
            <li key={step} className="flex flex-col gap-1.5">
              <span className="num text-xs text-clay">0{i + 1}</span>
              <span className="text-[15px]">{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <figure className="flex flex-col gap-3 md:col-span-6 lg:col-span-6 lg:col-start-7">
        <img
          src={mainImage}
          alt="JRJC rental cars"
          className="aspect-[4/3] w-full rounded-sm object-cover md:aspect-auto md:h-[560px]"
        />
        <figcaption className="num flex justify-between text-xs text-ink-2">
          <span>Fig. 01 — The fleet</span>
          <span>Bukidnon, Philippines</span>
        </figcaption>
      </figure>
    </section>
  );
}

import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-[60vh] bg-gradient-to-r from-green-600 to-teal-500 text-white flex items-center justify-center overflow-hidden">
      {/* Background image – replace public/hero.jpg with your own lab photo */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero.jpg')" }} />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black opacity-30" />
      <div className="relative z-10 max-w-2xl text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
          Premium Clinical Laboratory Automation
        </h1>
        <p className="text-lg md:text-xl mb-6 drop-shadow-md">
          Fast, accurate, eco‑friendly diagnostics powered by AI and smart robotics.
        </p>
        <Link
          href="/book"
          className="inline-block bg-white text-teal-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition"
        >
          Book a Free Demo
        </Link>
      </div>
    </section>
  );
}

"use client"

import React, { useEffect, useRef } from 'react';

export default function LandingSection() {
  const titleRef = useRef();
  const subtitleRef = useRef();
  const ctaRef = useRef();

  useEffect(() => {
    // Animate elements when component mounts
    const subtitleElement = subtitleRef.current;
    const ctaElement = ctaRef.current;

    if (subtitleElement && ctaElement) {
      subtitleElement.style.opacity = '0';
      subtitleElement.style.transform = 'translateY(20px)';
      ctaElement.style.opacity = '0';
      ctaElement.style.transform = 'translateY(20px)';

      setTimeout(() => {
        subtitleElement.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        subtitleElement.style.opacity = '1';
        subtitleElement.style.transform = 'translateY(0)';
      }, 600);

      setTimeout(() => {
        ctaElement.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        ctaElement.style.opacity = '1';
        ctaElement.style.transform = 'translateY(0)';
      }, 900);
    }
  }, []);

  return (
    <section className="container relative h-full w-full flex flex-col pt-56 items-start px-6 text-start mx-auto">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30" />
      <div className="relative z-10 max-w-md">
        <p 
          ref={subtitleRef} 
          className="text-xl md:text-2xl text-yellow-300 mb-10"
          style={{ opacity: 1, transform: 'translateY(20px)' }}
        >
          We craft immersive digital solutions that blend creativity with technology to deliver meaningful outcomes for forward-thinking brands.
        </p>
        
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <p className="text-gray-400 text-sm mb-2">Scroll to explore</p>
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-gray-400 rounded-full animate-pulse-down" />
        </div>
      </div>
      
      {/* Custom animation for scroll indicator */}
      <style jsx>{`
        @keyframes pulseDown {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(6px);
            opacity: 0.5;
          }
        }
        .animate-pulse-down {
          animation: pulseDown 1.5s infinite;
        }
      `}</style>
    </section>
  );
}
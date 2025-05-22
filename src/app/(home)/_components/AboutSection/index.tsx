"use client"
import React, { useRef, useEffect } from 'react';

export default function AboutSection() {
  const titleRef = useRef();
  const contentRef = useRef();
  const statsRef = useRef();

  useEffect(() => {
    const titleElement = titleRef.current;
    const contentElement = contentRef.current;
    const statsElement = statsRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (titleElement) observer.observe(titleElement);
    if (contentElement) observer.observe(contentElement);
    if (statsElement) observer.observe(statsElement);

    return () => {
      if (titleElement) observer.unobserve(titleElement);
      if (contentElement) observer.unobserve(contentElement);
      if (statsElement) observer.unobserve(statsElement);
    };
  }, []);

  return (
    <section className="relative h-full w-full flex flex-col justify-center px-6 md:px-12 lg:px-24">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent" />

      <div className="container mx-auto relative z-10 grid md:grid-cols-2 gap-12 md:gap-24 items-center">
        <div>
          <h2
            ref={titleRef}
            className="text-3xl md:text-5xl font-bold text-white mb-8 fade-in-up"
          >
            Crafting Digital Excellence Since 2015
          </h2>
          
          <div 
            ref={contentRef} 
            className="text-gray-300 space-y-4 fade-in-up delay-200"
          >
            <p className="text-lg text-gray-600">
              We&apos;re a team of passionate developers and designers who love creating beautiful and functional web experiences. Our mission is to help businesses grow through innovative digital solutions.
            </p>
            <p>
              We partner with forward-thinking brands and organizations to develop digital products,
              immersive websites, and interactive experiences that set new standards in their respective industries.
            </p>
            <p>
              Our approach is collaborative, iterative, and focused on delivering exceptional quality and value.
              We're not just building websites or apps – we're crafting the future of digital interaction.
            </p>
          </div>
        </div>

        <div 
          ref={statsRef} 
          className="fade-in-up delay-400"
        >
          <div className="grid grid-cols-2 gap-8">
            {/* Stat 1 */}
            <div className="stat-card">
              <h3 className="text-5xl md:text-6xl font-bold text-white mb-2">94%</h3>
              <p className="text-gray-400 text-sm">Client retention rate showcasing our commitment to building lasting partnerships</p>
            </div>
            
            {/* Stat 2 */}
            <div className="stat-card">
              <h3 className="text-5xl md:text-6xl font-bold text-white mb-2">67+</h3>
              <p className="text-gray-400 text-sm">Design and development awards recognizing our creative excellence</p>
            </div>
            
            {/* Stat 3 */}
            <div className="stat-card">
              <h3 className="text-5xl md:text-6xl font-bold text-white mb-2">8+</h3>
              <p className="text-gray-400 text-sm">Years of experience pushing the boundaries of digital innovation</p>
            </div>
            
            {/* Stat 4 */}
            <div className="stat-card">
              <h3 className="text-5xl md:text-6xl font-bold text-white mb-2">150+</h3>
              <p className="text-gray-400 text-sm">Projects delivered across diverse industries and global markets</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        .fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .delay-200 {
          transition-delay: 200ms;
        }
        
        .delay-400 {
          transition-delay: 400ms;
        }
        
        .animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        
        .stat-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
        }
      `}</style>
    </section>
  );
}
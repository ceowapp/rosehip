"use client"

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress, Html } from '@react-three/drei';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader'
import Scene from './_components/Scene';
import LandingSection from './_components/LandingSection';
import AboutSection from './_components/AboutSection';
import ProjectsSection from './_components/ProjectsSection';
import ContactSection from './_components/ContactSection';
import { motion } from 'framer-motion';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const scrollContainer = useRef(null);
  const sections = [
    { id: 'landing', component: LandingSection },
    { id: 'about', component: AboutSection },
    { id: 'projects', component: ProjectsSection },
    { id: 'contact', component: ContactSection }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainer.current) {
        const container = scrollContainer.current;
        const scrollPosition = container.scrollTop;
        const windowHeight = window.innerHeight;
        
        sections.forEach((section, index) => {
          const sectionElement = document.getElementById(section.id);
          if (sectionElement) {
            const sectionTop = sectionElement.offsetTop;
            const sectionHeight = sectionElement.offsetHeight;
            
            if (scrollPosition >= sectionTop - windowHeight * 0.5 &&
                scrollPosition < sectionTop + sectionHeight) {
              container.style.scrollSnapType = 'none';
              setTimeout(() => {
                container.style.scrollSnapType = 'y mandatory';
              }, 100);
            }
          }
        });
      }
    };

    if (scrollContainer.current) {
      scrollContainer.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer.current) {
        scrollContainer.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [sections]);

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      <div 
        ref={scrollContainer}
        className="h-full w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
      >
        {/* 3D Background Canvas */}
        <div className="fixed inset-0 z-0">
          <Suspense fallback={<Loader />}>
            <Scene />
          </Suspense>
        </div>

        {/* Content Sections */}
        <div className="relative z-10">
          <Navbar sections={sections.map(section => section.id)} />
          
          <div className="snap-start h-screen w-full">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="h-screen snap-start"
              >
                <section.component />
              </section>
            ))}
          </div>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}
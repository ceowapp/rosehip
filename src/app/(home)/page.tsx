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

export default function App() {
  const scrollContainer = useRef();
  const [currentSection, setCurrentSection] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const sections = ['home', 'about', 'projects', 'contact'];

  useEffect(() => {
    if (scrollContainer.current) {
      const handleScroll = () => {
        const scrollTop = scrollContainer.current.scrollTop;
        const height = scrollContainer.current.clientHeight;
        const section = Math.floor((scrollTop + height / 2) / height);
        setCurrentSection(Math.min(section, sections.length - 1));
      };

      scrollContainer.current.addEventListener('scroll', handleScroll);
      return () => {
        if (scrollContainer.current) {
          scrollContainer.current.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [loaded]);

  const scrollToSection = (index) => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTo({
        top: index * scrollContainer.current.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      <div 
        ref={scrollContainer}
        className="h-full w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
      >
        {/* 3D Background Canvas */}
        <div className="fixed inset-0 z-0">
          <Suspense fallback={<Loader />}>
            <Scene currentSection={currentSection} />
          </Suspense>
        </div>

        {/* Content Sections */}
     
        <div className="relative z-10">
          <Navbar currentSection={currentSection} scrollToSection={scrollToSection} sections={sections} />
          
          <div className="snap-start h-screen w-full">
            <LandingSection />
          </div>
          
          <div className="snap-start h-screen w-full">
            <AboutSection />
          </div>
          
          <div className="snap-start h-screen w-full">
            <ProjectsSection />
          </div>
          
          <div className="snap-start h-screen w-full">
            <ContactSection />
          </div>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}
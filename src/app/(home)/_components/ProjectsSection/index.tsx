"use client"

import React, { useState, useRef, useEffect } from 'react';

// Project data
const projects = [
  {
    id: 1,
    title: 'Nebula',
    category: 'Web Experience',
    description: 'An award-winning interactive experience exploring the frontiers of WebGL and 3D animation for an innovative tech startup.',
    image: '/project1.jpg', // You would replace these with your actual images
    color: '#ffbada' // Pink
  },
  {
    id: 2,
    title: 'Prism',
    category: 'E-commerce Platform',
    description: 'A revolutionary e-commerce platform that redefined online shopping experiences through immersive product visualization.',
    image: '/project2.jpg',
    color: '#bcc1ff' // Blue
  },
  {
    id: 3,
    title: 'Meridian',
    category: 'Mobile Application',
    description: 'A cutting-edge mobile application that bridges physical and digital interactions for a global lifestyle brand.',
    image: '/project3.jpg',
    color: '#ceff92' // Green
  },
  {
    id: 4,
    title: 'Horizon',
    category: 'Digital Campaign',
    description: 'An integrated digital campaign that leveraged interactive storytelling to drive engagement across multiple platforms.',
    image: '/project4.jpg',
    color: '#fdd5a8' // Orange
  }
];

export default function ProjectsSection() {
  const [activeProject, setActiveProject] = useState(0);
  const projectsRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Set up refs array
  useEffect(() => {
    cardsRef.current = cardsRef.current.slice(0, projects.length);
  }, []);

  // Animation on section visibility
  useEffect(() => {
    const projectsElement = projectsRef.current;

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

    if (projectsElement) observer.observe(projectsElement);

    return () => {
      if (projectsElement) observer.unobserve(projectsElement);
    };
  }, []);

  // Handle project change
  const handleProjectClick = (index) => {
    setActiveProject(index);
  };

  return (
    <section 
      ref={projectsRef}
      className="relative h-full w-full flex flex-col justify-center px-6 md:px-12 lg:px-24"
    >
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent" />

      <div className="container mx-auto relative z-10">
        <h2 
          ref={titleRef}
          className="text-3xl md:text-5xl font-bold text-white mb-12 fade-in-up"
        >
          Featured Projects
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              ref={el => cardsRef.current[index] = el}
              className={`project-card fade-in-up cursor-pointer ${activeProject === index ? 'active' : ''}`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => handleProjectClick(index)}
            >
              <div 
                className="project-card-inner h-full rounded-2xl overflow-hidden relative"
                style={{ 
                  backgroundColor: `${project.color}10`, 
                  borderColor: activeProject === index ? project.color : 'transparent',
                }}
              >
                {/* Project thumbnail with overlay */}
                <div className="relative h-48 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(/api/placeholder/400/320)`,
                      filter: 'brightness(0.8)'
                    }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70" />
                </div>
                
                {/* Content area */}
                <div className="p-6">
                  <span className="text-sm text-gray-400 uppercase tracking-widest">{project.category}</span>
                  <h3 className="text-xl font-semibold text-white mt-1 mb-3">{project.title}</h3>
                  <p className="text-gray-300 text-sm">
                    {project.description}
                  </p>
                </div>
                
                {/* Interactive elements */}
                <div className="absolute bottom-6 right-6">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeProject === index 
                        ? 'bg-white' 
                        : 'bg-white bg-opacity-20'
                    }`}
                  >
                    <svg 
                      className={`w-4 h-4 transition-all duration-300 ${
                        activeProject === index ? 'text-black' : 'text-white'
                      }`} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View all projects button */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 border border-white text-white font-medium rounded-full transition-all duration-300 hover:bg-white hover:bg-opacity-10 transform hover:scale-105">
            View All Work
          </button>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        .fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .project-card {
          transition: transform 0.4s ease-out, opacity 0.4s ease-out;
        }
        
        .project-card-inner {
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        
        .project-card:hover .project-card-inner,
        .project-card.active .project-card-inner {
          transform: translateY(-8px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </section>
  );
}
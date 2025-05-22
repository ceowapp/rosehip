"use client"

import React, { useState, useRef, useEffect } from 'react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    services: []
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const sectionRef = useRef();
  const titleRef = useRef();
  const formRef = useRef();
  const infoRef = useRef();
  
  // Services options
  const serviceOptions = [
    { id: 'web-development', label: 'Web Development' },
    { id: 'experience-design', label: 'Experience Design' },
    { id: 'digital-strategy', label: 'Digital Strategy' },
    { id: 'branding', label: 'Branding & Identity' }
  ];
  
  // Animation on section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          titleRef.current.classList.add('animate-in');
          
          setTimeout(() => {
            formRef.current.classList.add('animate-in');
          }, 200);
          
          setTimeout(() => {
            infoRef.current.classList.add('animate-in');
          }, 400);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle checkbox changes
  const handleServiceToggle = (serviceId) => {
    const updatedServices = formData.services.includes(serviceId)
      ? formData.services.filter(id => id !== serviceId)
      : [...formData.services, serviceId];
      
    setFormData({
      ...formData,
      services: updatedServices
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send the form data to your backend
    console.log('Form submitted:', formData);
    setFormSubmitted(true);
    
    // Reset form after submission (in a real app, you'd do this after successful API response)
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        services: []
      });
      setFormSubmitted(false);
    }, 3000);
  };

  return (
    <section 
      ref={sectionRef}
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
          Let's Create Something Amazing
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div 
            ref={formRef}
            className="fade-in-up"
          >
            {formSubmitted ? (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-2xl p-8 text-center">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-2xl font-semibold text-white mb-2">Thank You!</h3>
                <p className="text-gray-300">
                  Your message has been received. We'll be in touch with you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-gray-400 text-sm mb-2">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-black bg-opacity-40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-gray-400 text-sm mb-2">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-black bg-opacity-40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Company Field */}
                <div>
                  <label htmlFor="company" className="block text-gray-400 text-sm mb-2">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-black bg-opacity-40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                {/* Services Checkboxes */}
                <div>
                  <p className="text-gray-400 text-sm mb-3">Services of Interest</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {serviceOptions.map(service => (
                      <div key={service.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={service.id}
                          checked={formData.services.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                          className="w-4 h-4 rounded border-gray-700 text-white focus:ring-white focus:ring-offset-0"
                        />
                        <label htmlFor={service.id} className="ml-2 text-sm text-gray-300">{service.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-gray-400 text-sm mb-2">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full bg-black bg-opacity-40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                {/* Submit Button */}
                <div className="text-right">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-white text-black font-medium rounded-full transition-all duration-300 hover:bg-opacity-90 transform hover:scale-105"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Contact Information */}
          <div 
            ref={infoRef} 
            className="fade-in-up"
          >
            <div className="space-y-8">
              {/* Location */}
              <div className="backdrop-blur-md bg-white bg-opacity-5 rounded-2xl p-6 border border-white border-opacity-10">
                <div className="flex items-start">
                  <div className="bg-white bg-opacity-10 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Visit Us</h4>
                    <p className="text-gray-400">
                      123 Design Studio Street<br />
                      San Francisco, CA 94103<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Email */}
              <div className="backdrop-blur-md bg-white bg-opacity-5 rounded-2xl p-6 border border-white border-opacity-10">
                <div className="flex items-start">
                  <div className="bg-white bg-opacity-10 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Email Us</h4>
                    <p className="text-gray-400">
                      hello@rosehip.xyz<br />
                      projects@rosehip.xyz
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Phone */}
              <div className="backdrop-blur-md bg-white bg-opacity-5 rounded-2xl p-6 border border-white border-opacity-10">
                <div className="flex items-start">
                  <div className="bg-white bg-opacity-10 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Call Us</h4>
                    <p className="text-gray-400">
                      +1 (415) 555-1234<br />
                      +1 (415) 555-5678
                    </p>
                  </div>
                </div>
              </div>
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
        
        .animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
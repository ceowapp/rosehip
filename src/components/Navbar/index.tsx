import React, { useState, useEffect } from 'react';

export default function Navbar({ currentSection, scrollToSection, sections }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-4 bg-black bg-opacity-70 backdrop-blur-md' : 'py-6'
      }`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div onClick={() => scrollToSection(0)} className="cursor-pointer">
            <h1 className="text-white text-2xl font-semibold">Rosehip</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {sections.map((section, index) => (
              <button
                key={section}
                onClick={() => scrollToSection(index)}
                className={`text-sm uppercase tracking-widest transition-colors duration-300 ${
                  currentSection === index
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-95 backdrop-blur-md transform transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        } md:hidden`}
      >
        <div className="flex flex-col h-full justify-center items-center space-y-8 p-4">
          {sections.map((section, index) => (
            <button
              key={section}
              onClick={() => {
                scrollToSection(index);
                setMenuOpen(false);
              }}
              className={`text-xl uppercase tracking-widest transition-colors duration-300 ${
                currentSection === index
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      {/* Section Indicator */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-30 hidden lg:block">
        <div className="flex flex-col space-y-4">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className="w-3 h-3 rounded-full border border-white transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: currentSection === index ? 'white' : 'transparent',
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
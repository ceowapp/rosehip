import React from 'react';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-[999] pb-10">
      <div className="relative max-w-7xl mx-auto flex justify-between items-end">
        {/* Liquid Button */}
        <a
          href="/liquid"
          className="inline-flex relative py-2.5 px-3.75 leading-none text-white hover:opacity-80 transition-opacity duration-300"
        >
          <div className="absolute inset-0">
            {/* Left and Bottom Lines */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-0 top-0 right-0 border-b border-white origin-left w-12" />
              <div className="absolute left-0 top-0 bottom-0 border-r border-white origin-bottom" />
              <div className="absolute left-0 bottom-0 right-0 border-t border-white origin-left w-12" />
            </div>
            {/* Right and Top Lines */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute right-0 top-0 border-b border-white origin-right w-12" />
              <div className="absolute right-0 top-0 bottom-0 border-l border-white origin-top" />
              <div className="absolute right-0 bottom-0 border-t border-white origin-right w-12" />
            </div>
          </div>
          <div className="relative z-10">Liquid</div>
        </a>

        {/* Venture Button */}
        <a
          href="/venture"
          className="inline-flex relative py-2.5 px-3.75 leading-none text-white hover:opacity-80 transition-opacity duration-300"
        >
          <div className="absolute inset-0">
            {/* Left and Bottom Lines */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-0 top-0 right-0 border-b border-white origin-left w-12" />
              <div className="absolute left-0 top-0 bottom-0 border-r border-white origin-bottom" />
              <div className="absolute left-0 bottom-0 right-0 border-t border-white origin-left w-12" />
            </div>
            {/* Right and Top Lines */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute right-0 top-0 border-b border-white origin-right w-12" />
              <div className="absolute right-0 top-0 bottom-0 border-l border-white origin-top" />
              <div className="absolute right-0 bottom-0 border-t border-white origin-right w-12" />
            </div>
          </div>
          <div className="relative z-10">Venture</div>
        </a>

      </div>
    </footer>
  );
};

export default Footer;
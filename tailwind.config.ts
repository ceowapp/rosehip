import type { Config } from "tailwindcss";
const plugin = require('tailwindcss/plugin');
const { nextui } = require("@nextui-org/react");

function animationDelayPlugin({ matchUtilities, theme }) {
  matchUtilities(
    {
      "animation-delay": (value) => {
        return {
          "animation-delay": value,
        };
      },
    },
    {
      values: theme("transitionDelay"),
    }
  );
}

function maskEffectHoverPlugin({ addUtilities }) {
  addUtilities({
    '.mask-nature-sprite': {
      '-webkit-mask': 'url("https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png")',
      'mask': 'url("https://raw.githubusercontent.com/robin-dela/css-mask-animation/master/img/nature-sprite.png")',
      '-webkit-mask-size': '2300% 100%',
      'mask-size': '2300% 100%',
    },
    '.mask-gradient-card': {
      '-webkit-mask-image': 'radial-gradient(circle at 60% 5%, black 0%, black 15%, transparent 60%)',
      'mask-image': 'radial-gradient(circle at 60% 5%, black 0%, black 15%, transparent 60%)',
    },
  });
}


function parentSiblingHoverPlugin({ addVariant, e }) {
  addVariant('parent-sibling-hover', ({ modifySelectors, separator }) => {
    modifySelectors(({ className }) => {
      return `.parent-sibling:hover ~ .parent .${e(`parent-sibling-hover${separator}${className}`)}`;
    });
  });
}

export default {
  mode: 'jit',
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    container: {
      center: true,
      padding: {
        '2xl': '2rem',
        DEFAULT: '1rem',
        lg: '2rem',
        md: '2rem',
        sm: '1rem',
        xl: '2rem',
      },
    },
    extend: {
      screens: {
        'maxphonexs': { max: '360px' },
        'minphonexs1': { min: '360px' },
        'minphonexs2': { min: '375px' },
        'minphonemd1': { min: '420px' },
        'minphonemd2': { min: '480px' },
        'minphonemd3': { min: '500px' },
        'maxphonemd1': { max: '480px' },
        'maxphonemd2': { max: '500px' },
        'maxtabletmd1': { max: '768px' },
        'mintabletmd2': { min: '840px' },
        'mintabletmd3': { min: '900px' },
        'mintabletlg': { min: '1024px' },
        'maxtabletlg': { max: '1024px' },
        'maxlaptopmd': { max: '1280px' },
        'maxlaptoplg': { max: '1440px' },
        'minlaptoplg': { min: '1440px' },
        '3xl': { max: '1920px' },
        '4xl': { max: '2560px' },
      },
      transitionProperty: {
        'transform': 'transform',
      },
      borderImage: {
        'conic': 'conic-gradient(from 90deg, rgba(168, 239, 255, 0.1) rgba(168, 239, 255, 1) 0.1turn, rgba(168, 239, 255, 1) 0.15turn, rgba(168, 239, 255, 0.1) 0.25turn)',
      },
      maskImage: {
        'linear-gradient': 'linear-gradient(180deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 50%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.5) 100%)',
      },
      backgroundImage: {
        'hero-title-gradient': "linear-gradient(91.21deg, #D1FBFF 0%, #6AA0FF 48%, #89FBFF 100%)",
        "text-gradient-blue": "linear-gradient(88.18deg, #0945EB 0%, #67D1FF 77.46%)",
        "technology-card-gradient": "linear-gradient(135deg, #EDFCFF 0%, #94C8F6 100%)",
        'gradient-radial': 'radial-gradient(circle at 65% 15%, white 1px, aqua 3%, darkblue 60%, aqua 100%)',
        '404-bg': "url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')",
        'hero-background-top': "url('/global/images/hero/hero-background-top.png')",
        'hero-background-top-mask': "url('/global/images/hero/hero-background-top-mask.png')",
        'hero-gradient-top': 'linear-gradient(180deg, #b7a4fb00 0, #b7a4fb 100%, #8562ff 100%, #8562ff00 0%)',
        'hero-gradient-bottom-line': 'linear-gradient(180deg,rgba(183,164,251,0) 0,rgba(183,164,251,.5) 100%,rgba(133,98,255,.5) 100%,rgba(133,98,255,0) 0%)',
        'hero-gradient-bottom-ray': 'linear-gradient(180deg,rgba(255,255,255,0) 10.42%,rgba(255,255,255,.1) 26.56%,rgba(255,255,255,0) 37.5%)',
      },
      spacing: {
        '400px': '400px',
      },
      fontFamily: {
        arvo: ['Arvo', 'serif'],
        jeju: ['JejuMyeongjo', 'serif'],
      },
      height: {
        '88': '88px',
      },
      maxWidth: {
        'large-screen': '1280px',
        'medium-screen': '846px',
      },
      colors: {
        buttonColor: '#7A73FF',
        contentTitle: '#178DDF',
        contentDescription: '#454545',
        cardDescription: '#6D6D6D',
        heroBackground: '#0a0118',
        offer: '#0A2540',
        teriary: '#0A599A',
        cream: '#F5F5F5',
        gravel: '#4E4E4E',
        iridium: '#3F3F3F',
        orange: '#FFA947',
        peach: '#FFE0BD',
        platinum: '#E6E6E6',
        ghost: '#CDCDCD',
        grandis: '#FFC989',
        porcelain: '#F1F1F1',
        ironside: '#636363',
        lightGrey: '#F5F5F5',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      keyframes: {
        'bg-card-transition': {
          '0%': { backgroundColor: 'white' },
          '50%': { backgroundColor: '#bfdbfe' },
          '100%': { backgroundColor: '#0945EB' },
        },
        'tile': {
          '0%, 12.5%, 100%': {
            opacity: '1',
          },
          '25%, 82.5%': {
            opacity: '0',
          },
        },
        'gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'aniMask': {
          from: {
            maskPosition: '0 0',
            WebkitMaskPosition: '0 0',
          },
          to: {
            maskPosition: '100% 0',
            WebkitMaskPosition: '100% 0',
          },
        },
        'aniMask2': {
          from: {
            maskPosition: '100% 0',
            WebkitMaskPosition: '100% 0',
          },
          to: {
            maskPosition: '0 0',
            WebkitMaskPosition: '0 0',
          },
        },
        'moveTxt': {
          '0%': { top: '0px' },
          '20%': { top: '-50px' },
          '40%': { top: '-100px' },
          '60%': { top: '-150px' },
          '80%': { top: '-200px' },
        },
        'float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
        'open-full-sidebar': {
          from: { width: '60px' },
          to: { width: '100%' },
        },
        'open-sidebar': {
          from: { width: '60px' },
          to: { width: '300px' },
        },
        'close-sidebar': {
          from: { width: '300px' },
          to: { width: '60px' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'topAnimation': {
          '0%': { transform: 'translateY(-202px)' },
          '33%, 100%': { transform: 'translateY(202px)' },
        },
        'lineAnimation': {
          '0%, 100%': { transform: 'translateY(-400px)' },
          '99%': { transform: 'translateY(400px)' },
        },
        'bottomRayAnimation': {
          '0%, 49.01%': { transform: 'translateY(-530px)' },
          '68.61%, 88.21%': { transform: 'translateY(0)' },
          '99%': { transform: 'translateY(530px)' },
          '100%': { transform: 'translateY(-530px)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'jello-horizontal': {
          '0%,100%': { transform: 'scale3d(1, 1, 1)' },
          '30%': { transform: 'scale3d(1.25, 0.75, 1)' },
          '40%': { transform: 'scale3d(0.75, 1.25, 1)' },
          '50%': { transform: 'scale3d(1.15, 0.85, 1)' },
          '65%': { transform: 'scale3d(0.95, 1.05, 1)' },
          '75%': { transform: 'scale3d(1.05, 0.95, 1)' },
        },
        'focuse': {
          '0%': { transform: 'scale(0.8)', opacity: 1 },
          '75%': { transform: 'scale(1.2)', opacity: 0 },
          '100%': { transform: 'scale(1.2)', opacity: 0 },
        },
        'bounce': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-8px)' },
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'bounce': 'bounce 1.4s infinite',
        'tile': 'tile 8s infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'aniMask': 'aniMask 0.7s steps(22) forwards',
        'aniMask2': 'aniMask2 0.7s steps(22) forwards',
        'moveTxt': 'moveTxt 5s ease infinite 1s',
        'gradient': 'gradient 5s ease infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        'open-sidebar': 'open-sidebar 0.2s ease-out',
        'open-full-sidebar': 'open-full-sidebar 0.2s ease-out',
        'close-sidebar': 'close-sidebar 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'topAnimation': 'topAnimation 6s infinite cubic-bezier(.62,.62,.28,.67)',
        'lineAnimation': 'lineAnimation 4s infinite cubic-bezier(.62,.62,.14,1)',
        'bottomRayAnimation': 'bottomRayAnimation 10.2s infinite cubic-bezier(.62,.62,0,1)',
        'marquee': 'marquee 25s linear infinite',
        'scroll': 'scroll 40s linear infinite',
        'jello-horizontal': 'jello-horizontal 0.9s both',
        'focuse': 'focuse 1.5s linear infinite',
        'bg-card-transition': 'bg-card-transition 0.5s ease-in-out forwards',
      },
    },
  },
  variants: {
    extend: {
      animation: ['hover', 'focus'],
      scale: ['hover'],
    },
  },
  plugins: [
    require('@tailwindcss/typography'), 
    parentSiblingHoverPlugin,
    maskEffectHoverPlugin,
    animationDelayPlugin,
    require('tailwindcss-border-image'),
    require("tailwindcss-animate"),
    require('tailwind-scrollbar-hide'),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".border-gradient-blue": {
          borderWidth: "2px",
          borderImage: "linear-gradient(88.18deg, #5280FF 0%, #67D1FF 77.46%)",
          borderImageSlice: "1",
        },
        ".border-gradient-blue": {
          borderWidth: "2px",
          borderImage: "linear-gradient(88.18deg, #5280FF 0%, #67D1FF 77.46%)",
          borderImageSlice: "1",
        },
      });
    }),
    nextui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#006FEE",
            },
          },
        },
        dark: {
          colors: {
            background: "#000000",
            foreground: "#ECEDEE",
            primary: {
              foreground: "#FFFFFF",
              DEFAULT: "#006FEE",
            },
          },
        },
        mytheme: {
          extend: "dark",
          colors: {
            primary: {
              DEFAULT: "#BEF264",
              foreground: "#000000",
            },
            focus: "#BEF264",
          },
        },
      },
    }),
  ],
} satisfies Config;





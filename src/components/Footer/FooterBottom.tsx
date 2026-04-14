import React from "react";
import Link from "next/link";

const FooterBottom = () => {
  return (
    <div className="bg-black py-7 dark:bg-black">
      <div className="container max-w-[1390px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center space-x-0 lg:space-x-12 space-y-4 lg:space-y-0 w-full">
          
          <div className="text-center lg:text-left whitespace-nowrap order-last lg:order-first">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} Charter Informatika. <span className="hidden sm:inline">Minden jog fenntartva.</span>
            </p>
          </div>

          <a href="mailto:info@szenzor24.hu" className="flex items-center space-x-2 text-base text-white hover:text-gray-300 transition-colors whitespace-nowrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M3 6.5C3 5.67157 3.67157 5 4.5 5H19.5C20.3284 5 21 5.67157 21 6.5V17.5C21 18.3284 20.3284 19 19.5 19H4.5C3.67157 19 3 18.3284 3 17.5V6.5Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 6.5L12 12.5L3 6.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>info@szenzor24.hu</span>
          </a>

          <Link
            href="https://www.facebook.com/charterai"
            target="_blank"
            className="text-white opacity-90 hover:opacity-100 flex items-center shrink-0"
            aria-label="Facebook oldala"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 13.5H16.5L17.5 9.5H14V7.5C14 6.47 14 5.5 16 5.5H17.5V2.14C17.174 2.097 15.943 2 14.643 2C11.928 2 10 3.657 10 6.7V9.5H7V13.5H10V22H14V13.5Z" />
            </svg>
          </Link>

          <a href="tel:+36705939167" className="flex items-center space-x-2 text-base text-white hover:text-gray-300 transition-colors whitespace-nowrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M22 16.92V20.5C22 21.3284 21.3284 22 20.5 22C10.3876 22 2 13.6124 2 3.5C2 2.67157 2.67157 2 3.5 2H7.08C7.53043 2 7.93914 2.21071 8.17678 2.58579L10.3 6.2C10.5 6.5 10.45 6.9 10.17 7.15L8.54 8.54C9.84 11.11 12.89 14.16 15.46 15.46L16.85 13.83C17.1 13.55 17.5 13.5 17.8 13.7L21.42 15.82C21.796 16.058 22 16.466 22 16.92Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>+36 70 593 9167</span>
          </a>

          <Link href="#" className="text-base text-white hover:text-gray-300 transition-colors whitespace-nowrap">
            Adatvédelmi irányelvek
          </Link>

          <Link href="#" className="text-base text-white hover:text-gray-300 transition-colors whitespace-nowrap">
            Felhasználási feltételek
          </Link>

        </div>
      </div>
    </div>
  );
};

export default FooterBottom;

import React from 'react';
import kritiName from '../assets/kriti_name.svg';
import techLogo from '../assets/tech.png';
import swcLogo from '../assets/swc.svg';
import backImg from '../assets/back.png'

const NewFooter = () => {
  return (
    <footer className="relative w-full h-[757px] min-h-[600px] overflow-hidden">
      <img src={backImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0">
        <div className='container mx-auto px-[126px] py-[120px] h-full'>
          <div className='flex justify-between items-start gap-12 h-full'>
            {/* Left Section */}
            <div className='flex-1 pt-12'>
              <h2 className='bebas-neue-regular text-[#93BBFF] text-[48px] md:text-[48px] font-semibold mb-4'>
                Ready to Compete?
              </h2>
              <h1 className='bebas-neue-regular text-white text-[80px] md:text-[110px] font-semibold leading-tight'>
                Dive into<br /> the
                <img src={techLogo} alt="Tech Logo" className='inline-block w-20 ml-10' />
                <img src={swcLogo} alt="Tech Logo" className='inline-block w-20 ml-10' /><br />
                Challenges<br />
              </h1>
            </div>

            {/* Right Section */}
            <div className='flex-1 flex flex-col items-end pt-12 gap-[85px]'>
              <img src={kritiName} alt="Kriti Logo" className='h-[105px] mb-4' />
              <div className='flex flex-col items-end gap-[22px] w-3xs'>
                <a href="#" className='text-white font-mono text-[24px]/[29.74px] tracking-[-0.22px] hover:text-[#93BBFF] transition-colors cursor-pointer'>
                  Problem Statements
                </a>
                <a href="#" className='text-white font-mono text-[24px]/[29.74px] hover:text-[#93BBFF] transition-colors cursor-pointer'>
                  Rulebook
                </a>
                <a href="#" className='text-white font-mono text-[24px]/[29.74px] hover:text-[#93BBFF] transition-colors cursor-pointer'>
                  Discord
                </a>
                <a href="#" className='text-black font-mono text-[24px]/[29.74px] text-center font-semibold tracking-[-0.22px] bg-[#93BBFF] w-full px-3 py-4 mt-[44px] rounded-md hover:bg-[#7AABEF] transition-colors cursor-pointer'>
                  Register Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;

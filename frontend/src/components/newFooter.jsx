import React from 'react';
import kritiName from '../assets/kriti_name.svg';
import techLogo from '../assets/tech.png';
import swcLogo from '../assets/swc.svg';
import backImg from '../assets/back.png'

const NewFooter = () => {
  return (
    <footer className="relative w-full h-auto lg:h-[757px] min-h-[500px] lg:min-h-[600px] overflow-hidden">
      <img src={backImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0">
        <div className='container mx-auto px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[126px] py-8 sm:py-12 md:py-16 lg:py-20 xl:py-[120px] h-full'>
          <div className='flex flex-col lg:flex-row justify-between items-start gap-6 sm:gap-8 lg:gap-12 h-full'>
            {/* Left Section */}
            <div className='flex-1 pt-2 sm:pt-4 lg:pt-12 w-full'>
              <h2 className='bebas-neue-regular text-[#93BBFF] text-[28px] sm:text-[36px] md:text-[42px] lg:text-[48px] font-semibold mb-2 sm:mb-3 lg:mb-4 leading-tight'>
                Ready to Compete?
              </h2>
              <h1 className='bebas-neue-regular text-white text-[36px] sm:text-[48px] md:text-[64px] lg:text-[80px] xl:text-[110px] font-semibold leading-[1.1]'>
                Dive into<br /> the
                <img src={techLogo} alt="Tech Logo" className='inline-block w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 ml-2 sm:ml-4 md:ml-6 lg:ml-10 object-contain' />
                <img src={swcLogo} alt="SWC Logo" className='inline-block w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 ml-2 sm:ml-4 md:ml-6 lg:ml-10 object-contain' /><br />
                Challenges<br />
              </h1>
            </div>

            {/* Right Section */}
            <div className='flex-1 flex flex-col items-start lg:items-end pt-2 sm:pt-4 lg:pt-12 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-[85px] w-full'>
              <img src={kritiName} alt="Kriti Logo" className='h-[50px] sm:h-[70px] md:h-[90px] lg:h-[105px] mb-1 sm:mb-2 lg:mb-4 object-contain' />
              <div className='flex flex-col items-start lg:items-end gap-3 sm:gap-4 lg:gap-[22px] w-full lg:w-auto'>
                <a href="#" className='text-white font-mono text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] tracking-[-0.22px] hover:text-[#93BBFF] transition-colors cursor-pointer'>
                  Problem Statements
                </a>
                <a href="#" className='text-white font-mono text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] hover:text-[#93BBFF] transition-colors cursor-pointer'>
                  Rulebook
                </a>
                <a href="#" className='text-white font-mono text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] hover:text-[#93BBFF] transition-colors cursor-pointer'>
                  Discord
                </a>
                <a href="#" className='text-black font-mono text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] text-center font-semibold tracking-[-0.22px] bg-[#93BBFF] w-full lg:w-auto lg:min-w-[200px] px-6 sm:px-8 py-3 lg:py-4 mt-4 sm:mt-6 lg:mt-[44px] rounded-md hover:bg-[#7AABEF] transition-colors cursor-pointer'>
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

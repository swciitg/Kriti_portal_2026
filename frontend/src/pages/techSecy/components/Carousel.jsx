import React, { useRef, useState, useEffect } from "react";

export function CarouselDefault() {
  const carouselRef = useRef(null);
  const [index, setIndex] = useState(0);

  const slides = [
    "./image1.png",
    "./image2.png",
    "./image3.png",
    "./image4.png",
    "./image5.png",
  ];

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return setIndex(0);
      const pct = el.scrollLeft / maxScroll;
      const approx = Math.round(pct * (slides.length - 1));
      setIndex(approx);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  const scrollBy = (dir = 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const distance = Math.max(el.clientWidth * 0.8, 240);
    el.scrollBy({ left: distance * dir, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <style>{`
          .carousel-no-scrollbar::-webkit-scrollbar { display: none; }
          .carousel-no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

        <div
          ref={carouselRef}
          className="carousel-no-scrollbar flex gap-4 py-6 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory"
        >
          {slides.map((src, i) => (
            <div
              key={i}
              className="snap-start flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-96 bg-white rounded-lg shadow overflow-hidden"
            >
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                className="w-full h-56 object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Previous button */}
      <button
        onClick={() => scrollBy(-1)}
        aria-label="Previous"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="m15 18-6-6 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={() => scrollBy(1)}
        aria-label="Next"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="m9 18 6-6-6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

// Footer.jsx
import swc from "../assets/swc.svg";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <span className="text-gray-700 font-medium text-sm md:text-base">
            Developed and Maintained by Student Web Committee IITG
          </span>
          <img
            src={swc}
            alt="SWC Logo"
            className="w-8 h-8 hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>
    </footer>
  );
}

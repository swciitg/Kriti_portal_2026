import swc from '../assets/swc.svg'
export default function Footer() {
  return (
    <footer className="w-full absolute bottom-0 flex justify-center gap-2 items-center py-4 text-center text-md text-gray-600 bg-white font-semibold">
      <span>Developed and Maintained by Student Web Committee IITG</span>
      <img src={swc} alt='' className='w-8 h-8'/>
    </footer>
  )
}

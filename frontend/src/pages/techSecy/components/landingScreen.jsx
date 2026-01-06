import techSecy_bg from "../../../assets/techSecy_bg.png"
import kriti_name from "../../../assets/kriti_name.svg"

export default function TechSecyLandingScreen() {
    return (
        <>  
            <div className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4" 
                style={{ backgroundImage: `url(${techSecy_bg})` }}>
                
                {/* KRITI Logo */}
                <img 
                    src={kriti_name} 
                    alt="KRITI" 
                    className="w-[90%] max-w-[1200px] mb-4 mt-32"
                />
                
                {/* Text Content */}
                <div className="text-center -mt-16 md:-mt-24 lg:-mt-32 mb-24">
                    <h2 className="text-[#9BB4D9] text-xl sm:text-2xl md:text-4xl lg:text-5xl tracking-wide mb-4 md:mb-6" 
                        style={{ }}>
                        THE ULTIMATE
                    </h2>
                    <h1 className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold tracking-wide mb-6 md:mb-10" 
                        style={{ }}>
                        TECH BATTLE
                    </h1>
                    <p className="text-[#9BB4D9] text-3xl md:text-5xl lg:text-6xl tracking-wider" 
                        style={{ }}>
                        2026
                    </p>
                </div>
            </div>
        </>
    )
}
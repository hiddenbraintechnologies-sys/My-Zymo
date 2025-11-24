import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";

export default function Hero() {
  return (
    <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
      <img 
        src={heroImage} 
        alt="Celebration" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      
      <div className="relative h-full flex flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 md:mb-8 leading-tight">
          Plan Your Perfect Gathering
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl max-w-4xl text-white/95 font-light">
          From college reunions to birthday bashes, organize unforgettable celebrations with ease
        </p>
      </div>
    </div>
  );
}

import Image from 'next/image';

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-10 w-10 flex-shrink-0">
        <Image 
          src="/mubas-logo.jpg" 
          alt="MUBAS Logo" 
          fill
          className="object-contain rounded"
          priority
        />
      </div>
      <span className="font-bold text-lg font-headline whitespace-nowrap">
        MUBAS Hub
      </span>
    </div>
  );
};

export default Logo;
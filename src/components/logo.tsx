import { GraduationCap } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <GraduationCap className="h-6 w-6 text-primary" />
      <span className="font-bold text-lg font-headline">MUBAS Hub</span>
    </div>
  );
};

export default Logo;

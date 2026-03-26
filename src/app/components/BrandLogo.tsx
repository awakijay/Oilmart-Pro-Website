import logo from '../assets/oilmartpro-logo-colored.png';
import { cn } from './ui/utils';

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  padded?: boolean;
};

export function BrandLogo({ className, imageClassName, padded = false }: BrandLogoProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center',
        padded && 'rounded-xl bg-gray-100 px-3 py-2 shadow-sm',
        className,
      )}
    >
      <img
        src={logo}
        alt="OilmartPro"
        className={cn('h-5 w-50 object-contain', imageClassName)}
      />
    </div>
  );
}

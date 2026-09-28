'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Vehicle } from '@/types';
import { getVehicleImageUrl, getVehicleImageAlt } from '@/lib/utils/vehicleImages';
import { Car } from 'lucide-react';

interface VehicleImageProps {
  vehicle?: Partial<Vehicle> | null;
  className?: string;
  aspectRatio?: 'video' | 'wide' | 'square' | 'auto' | '16:9' | '4:3';
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
}

export const VehicleImage: React.FC<VehicleImageProps> = ({
  vehicle,
  className = '',
  aspectRatio = 'video',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const src = getVehicleImageUrl(vehicle);
  const alt = getVehicleImageAlt(vehicle);

  const aspectClass = {
    video: 'aspect-[16/9]',
    '16:9': 'aspect-[16/9]',
    wide: 'aspect-[21/9]',
    square: 'aspect-square',
    '4:3': 'aspect-[4/3]',
    auto: '',
  }[aspectRatio];

  if (hasError) {
    return (
      <div
        className={`relative w-full h-full min-h-[160px] bg-slate-900 flex flex-col items-center justify-center text-slate-500 overflow-hidden ${aspectClass} ${className}`}
      >
        <Car className="w-12 h-12 stroke-[1] text-slate-700" />
        <span className="text-[11px] font-medium tracking-wide mt-2 text-slate-400">
          {vehicle?.brand} {vehicle?.model}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-950 ${aspectClass} ${className}`}
    >
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoaded(true)}
          className={`object-cover object-center transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-xs'
          }`}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          priority={priority}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-auto object-cover transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-xs'
          }`}
        />
      )}
    </div>
  );
};

'use client';

import Image from 'next/image';

export function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-700 h-16">
      <div className="absolute inset-0 bg-indigo-600">
        <Image 
          alt="" 
          className="w-full h-full object-cover opacity-20"
          src="/assets/fbb708135a0984d5871ea0257d008ce6b8e4060b.png"
          fill
          unoptimized
        />
      </div>
      <div className="relative z-10 px-8 flex items-center h-full">
        <p className="text-white">Welcome to Incentive Management System</p>
      </div>
    </div>
  );
}
import React from 'react';
import { useProgress, Html } from '@react-three/drei';

export default function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white">
        <div className="text-4xl font-medium mb-4">{Math.round(progress)}%</div>
        <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Html>
  );
}
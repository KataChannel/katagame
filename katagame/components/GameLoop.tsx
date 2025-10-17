'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/gameStore';

const GameLoop = () => {
  const updateResources = useGameStore((state) => state.updateResources);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update resources every second
    intervalRef.current = setInterval(() => {
      updateResources();
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateResources]);

  return null; // This component doesn't render anything
};

export default GameLoop;
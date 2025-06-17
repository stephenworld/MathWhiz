"use client";

import React, { useEffect, useState } from 'react';
import SparkleIcon from '../icons/SparkleIcon';

const ConfettiPiece = ({ id, style }: { id: string, style: React.CSSProperties }) => (
  <div
    key={id}
    className="absolute rounded-full animate-fall opacity-0"
    style={style}
  >
    <SparkleIcon className="w-full h-full" />
  </div>
);

const ConfettiAnimation = () => {
  const [pieces, setPieces] = useState<Array<{ id: string, style: React.CSSProperties }>>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 15 + 8; // 8px to 23px
      const colors = ['#29ABE2', '#29E29A', '#FFD700', '#FF69B4', '#FFFFFF']; // Primary, Accent, Gold, Pink, White
      return {
        id: `confetti-${i}-${Date.now()}`,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * -50 - 50}px`, // Start above screen
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          animationName: 'fall',
          animationDuration: `${Math.random() * 2 + 3}s`, // 3-5 seconds
          animationDelay: `${Math.random() * 1}s`,
          animationTimingFunction: 'ease-out',
          animationIterationCount: '1',
          animationFillMode: 'forwards',
          transform: `rotate(${Math.random() * 360}deg)`,
          borderRadius: Math.random() > 0.5 ? '50%' : '0%', // Mix circles and squares
        },
      };
    });
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 6000); // Clear after animation ends
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(0vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(${Math.random() * 720}deg);
            opacity: 0;
          }
        }
      `}</style>
      {pieces.map(piece => (
        // Using simple div with background color for confetti pieces for performance
        // Using SparkleIcon might be too heavy for many pieces.
        <div
          key={piece.id}
          className="absolute"
          style={piece.style}
        />
      ))}
    </div>
  );
};

export default ConfettiAnimation;

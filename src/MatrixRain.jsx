import React, { useEffect, useRef } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // "Ghostly" characters (Katakana + Latin)
    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789:・."=*+-<>';
    const charArray = chars.split('');
    
    const fontSize = 24;
    const columns = width / fontSize;
    
    // Array to track the y-coordinate of each column
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start at random heights above screen
    }

    const draw = () => {
      // Semi-transparent black background to create the "trail" effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0f0'; // Default Matrix Green
      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Randomly pick a character
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // GhostNet Colors: varying shades of Cyan and Green
        const isCyan = Math.random() > 0.8;
        ctx.fillStyle = isCyan ? '#22d3ee' : '#0ea5e9'; // Cyan / Sky Blue
        
        // Randomly brighter characters (glitch effect)
        if (Math.random() > 0.98) ctx.fillStyle = '#fff'; 

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly after it crosses screen
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33); // ~30 FPS

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none opacity-50"
      style={{ zIndex: 0 }} 
    />
  );
};

export default MatrixRain;

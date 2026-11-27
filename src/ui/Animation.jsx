'use client';

import { useEffect, useRef } from 'react';

const WIDTH = 600;
const HEIGHT = 600;
const PARTICLE_COUNT = 101;
const TRAIL_WIDTH = 4;
const ROTATE_SPEED = 0.02;

function generateColor() {
  const hexSet = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += hexSet[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createParticle(x, y) {
  return {
    x,
    y,
    color: generateColor(),
    theta: Math.random() * Math.PI * 2,
    radius: Math.random() * 150,
  };
}

export default function Animation() {
  const canvasRef = useRef(null);

  // Everything touching window/canvas lives in useEffect: it only runs in the
  // browser, never during Next.js server-side rendering.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx.globalAlpha = 0.5;

    const cursor = { x: WIDTH / 2, y: HEIGHT / 2 };
    const particles = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(cursor.x, cursor.y),
    );

    // Convert viewport coordinates to canvas coordinates.
    const moveCursor = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      cursor.x = clientX - rect.left;
      cursor.y = clientY - rect.top;
    };
    const handleMouseMove = (e) => moveCursor(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      e.preventDefault(); // only blocks scrolling while touching the canvas
      moveCursor(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    let frameId;
    const draw = () => {
      ctx.fillStyle = 'rgb(0 0 0 / 5%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        const prevX = p.x;
        const prevY = p.y;
        p.theta += ROTATE_SPEED;
        p.x = cursor.x + Math.cos(p.theta) * p.radius;
        p.y = cursor.y + Math.sin(p.theta) * p.radius;

        ctx.beginPath();
        ctx.lineWidth = TRAIL_WIDTH;
        ctx.strokeStyle = p.color;
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      frameId = requestAnimationFrame(draw);
    };
    draw();

    // Cleanup on unmount (and on React Strict Mode's double-invoke in dev).
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
}

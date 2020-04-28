import React, { useRef, useEffect } from "react";

function CanvasComponent({ width, height, balls }) {
  const canvasRef = useRef();

  function resetCanvas(ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#4397AC";
  }

  function drawFrame(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();
  }

  function drawBall(ctx, { rx, ry, r }) {
    ctx.beginPath();
    ctx.arc(rx * width, ry * height, r * width, 0, 2 * Math.PI);
    ctx.fill();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    drawFrame(ctx);
    balls.forEach(ball => {
      drawBall(ctx, ball);
    });
    return () => resetCanvas(ctx);
  }, [balls, width, height]);

  return <canvas width={width} height={height} ref={canvasRef} />;
}
export default CanvasComponent;

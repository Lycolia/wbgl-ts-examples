import { useEffect, useRef } from 'react';
import { renderGL } from './render';

export const Triangle = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvasEl = canvasRef.current as unknown;
    renderGL(canvasEl as HTMLCanvasElement);
  });

  return <canvas ref={canvasRef} width="1000" height="800" />;
};

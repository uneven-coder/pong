import { useRef } from 'react';

const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');


    
    return <canvas ref={canvasRef} width={800} height={600} />;
}
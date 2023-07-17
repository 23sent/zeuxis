import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { main } from './Example/main';

let lastRender = 0;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRateRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (canvasRef.current) {
  //     const array = new Uint32Array(100 * 100);
  //     for (let i = 0; i < array.length; i++)
  //       array[i] = 0xff000000 | (Math.sin(i * 0.0001) * 0xffffff);

  //     // create ImageData instance
  //     const iData = new ImageData(new Uint8ClampedArray(array.buffer), 100, 100);
  //     const ctx = canvasRef.current.getContext('2d');
  //     ctx?.putImageData(iData, 0, 0);
  //   }
  // }, []);

  useEffect(() => {
    function render(buffer: Uint8ClampedArray) {
      if (canvasRef.current && frameRateRef.current) {
        // create ImageData instance
        const iData = new ImageData(buffer, 100, 100);
        const ctx = canvasRef.current.getContext('2d');
        ctx?.putImageData(iData, 0, 0);

        const time = window.performance.now();
        const passed = time - lastRender;
        frameRateRef.current.innerText = `${((1 / passed) * 1000).toFixed()} fps`;
        lastRender = time;
      }
    }
    const zeuxis = main(render);

    return () => {
      cancelAnimationFrame(zeuxis);
    };
  }, []);

  return (
    <div className="App">
      <canvas
        ref={canvasRef}
        width={100}
        height={100}
        style={{ margin: '50px auto', border: '1px solid black' } as React.CSSProperties}
      />
      <div ref={frameRateRef}></div>
    </div>
  );
}

export default App;

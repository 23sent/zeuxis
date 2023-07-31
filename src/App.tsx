import React, { useEffect, useRef } from 'react';
import './App.css';
import Main from './Example/main';
import { Renderer, resizeImageBuffer } from './Zeuxis';

const RATIO = 1;
const BUFFER_W = 16 * 50;
const BUFFER_H = 9 * 50;
const CANVAS_WIDTH = BUFFER_W * RATIO;
const CANVAS_HEIGHT = BUFFER_H * RATIO;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function render(b: Uint8ClampedArray, renderer: Renderer) {
      if (canvasRef.current && frameRateRef.current) {
        // Create ImageData instance
        const iData = new ImageData(resizeImageBuffer(b, BUFFER_W, BUFFER_H, RATIO), CANVAS_WIDTH, CANVAS_HEIGHT);
        const ctx = canvasRef.current.getContext('2d');
        ctx?.putImageData(iData, 0, 0);

        frameRateRef.current.innerText = `${renderer.fps.toFixed()} fps, ${renderer.frameCount} total frame count`;
      }
    }

    Main.setViewportSize(BUFFER_W, BUFFER_H);
    Main.setRenderCallback(render);

    return () => {
      Main.stop();
    };
  }, []);

  return (
    <div key="app" className="App">
      <canvas
        key="canvas"
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ margin: '50px auto', border: '1px solid black' } as React.CSSProperties}
      />
      <div key="info" ref={frameRateRef}></div>

      <button onClick={() => Main.start()}>Start</button>
      <div style={{ margin: '4px' }}></div>
      <button onClick={() => Main.stop()}>Stop</button>
      <div style={{ margin: '4px' }}></div>
      <button onClick={() => (Main.renderer.WIREFRAME = !Main.renderer.WIREFRAME)}>Line/Fill</button>
    </div>
  );
}

export default App;

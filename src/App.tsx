import React, { useEffect, useRef } from 'react';
import './App.css';
import * as main from './Example/main';
import { resizeImageBuffer } from './Zeuxis';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function render(b: Uint8ClampedArray) {
      if (canvasRef.current && frameRateRef.current) {
        // Create ImageData instance
        const iData = new ImageData(resizeImageBuffer(b, 250, 250, 2), 500, 500);
        const ctx = canvasRef.current.getContext('2d');
        ctx?.putImageData(iData, 0, 0);

        frameRateRef.current.innerText = `${main.fps.toFixed()} fps, ${main.frameCount} total frame count`;
      }
    }

    main.setViewportSize(250, 250);
    main.setRenderCallback(render);

    return () => {
      main.stop();
    };
  }, []);

  return (
    <div key="app" className="App">
      <canvas
        key="canvas"
        ref={canvasRef}
        width={500}
        height={500}
        style={{ margin: '50px auto', border: '1px solid black' } as React.CSSProperties}
      />
      <div key="info" ref={frameRateRef}></div>

      <button onClick={() => main.start()}>Start</button>
      <div style={{ margin: '4px' }}></div>
      <button onClick={() => main.stop()}>Stop</button>
    </div>
  );
}

export default App;

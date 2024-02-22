import Main from './Example/main';
import { Renderer, resizeImageBuffer } from './Zeuxis';

export function setTo(obj: any, options: any) {
  for (let key in options) {
    const value = options[key];
    if (typeof value === 'object') {
      setTo(obj[key], value);
    } else {
      obj[key] = value;
    }
  }
}

export function create(tag: string, options: any) {
  const element = document.createElement(tag);
  setTo(element, options);
  return element;
}

const RATIO = 2;
const BUFFER_W = 16 * 25;
const BUFFER_H = 9 * 25;
const CANVAS_WIDTH = BUFFER_W * RATIO;
const CANVAS_HEIGHT = BUFFER_H * RATIO;

export function setupCanvas(root: HTMLElement) {
  const canvas = create('canvas', {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    style: { width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` },
  }) as HTMLCanvasElement;

  const frameRate = create('div', { innerText: '0' });

  function render(b: Uint8ClampedArray, renderer: Renderer) {
    if (canvas && frameRate) {
      // Create ImageData instance
      const iData = new ImageData(
        resizeImageBuffer(b, BUFFER_W, BUFFER_H, RATIO),
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
      );
      const ctx = canvas.getContext('2d');
      ctx?.putImageData(iData, 0, 0);

      frameRate.innerText = `${renderer.fps.toFixed()} fps, ${
        renderer.frameCount
      } total frame count`;
    }
  }

  Main.setViewportSize(BUFFER_W, BUFFER_H);
  Main.setRenderCallback(render);

  const button = create('button', { onclick: () => Main.start(), innerText: 'Start' });
  const buttonStop = create('button', { onclick: () => Main.stop(), innerText: 'Stop' });

  root.appendChild(frameRate);
  root.appendChild(canvas);
  root.appendChild(button);
  root.appendChild(buttonStop);
}
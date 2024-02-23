import MyScene from './Example/MyScene';
import { Renderer, resizeImageBuffer } from './Zeuxis';

declare global {
  interface HTMLElement {
    setTo(options: any): this;
  }
}

HTMLElement.prototype.setTo = function (options: any) {
  return setTo(this, options);
};

export function setTo<T>(obj: T, options: Partial<T>): T {
  for (let key in options) {
    const value = options[key];
    if (typeof value === 'object') {
      setTo(obj[key], value);
    } else {
      // @ts-ignore
      obj[key] = value;
    }
  }

  return obj;
}

export function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: any,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.setTo(options);
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
    style: {
      width: `${CANVAS_WIDTH}px`,
      // height: `${CANVAS_HEIGHT}px`,
      maxWidth: 'calc(100vw - 1rem)',
      aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
      alignSelf: 'center',
    },
  });

  const frameRate = create('div', {
    innerText: `0 fps, 0 total frame count`,
  });

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

  MyScene.setViewportSize(BUFFER_W, BUFFER_H);
  MyScene.setRenderCallback(render);

  const button = create('button', {
    onclick: function () {
      if (MyScene.isRun) MyScene.stop();
      else MyScene.start();
      if (MyScene.isRun) {
        this.innerText = 'Stop';
        canvas.classList.add('running');
      } else {
        this.innerText = 'Start';
        canvas.classList.remove('running');
      }
    },
    innerText: 'Start',
  });

  const wireframeButton = create('button', {
    innerText: 'Line / Fill',
    onclick: () => {
      MyScene.renderer.WIREFRAME = !MyScene.renderer.WIREFRAME;
    },
  });

  const info = create('pre', {
    innerText:
      `Move camera with A, W, S, D keys and rotate with Q, E, 1, 2. \n` +
      `Zoom in/out with mouse wheel.`,
  });

  root.appendChild(frameRate);
  root.appendChild(canvas);
  root.appendChild(button);
  root.appendChild(wireframeButton);
  root.appendChild(info);

  setTimeout(() => {
    button.click();
  }, 250);
}

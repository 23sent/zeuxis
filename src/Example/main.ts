import { Camera, Color, Mesh, Renderer, Vector3, Vertex } from '../Zeuxis';
import { OBJLoader, TextureLoader } from '../Zeuxis/loaders';
import { MyShader } from './MyShader';

const renderer = new Renderer(100, 100);
const objects = new Array<Mesh>();

const triangle = Mesh.fromArrays(
  [new Vertex([-0.9, 0, 0.8]), new Vertex([0, 0.5, 0.8]), new Vertex([0.9, 0, 0.8])],
  [0, 1, 2],
);
const triangle2 = Mesh.fromArrays(
  [new Vertex([-0.3, 0, 1], [0, 0]), new Vertex([0.6, 0.5, 1], [0, 1]), new Vertex([1.5, 0, 1], [1, 0])],
  [0, 1, 2],
);

const shader = new MyShader();
const camera = new Camera(Camera.Types.Perspective);
camera.setPosition(new Vector3(0, 0, -2));

let lastRenderTime = 0;
let nextFrameId = 0;
let renderCallback: (buffer: Uint8ClampedArray) => void = (b: Uint8ClampedArray) => console.log(frameCount);

let cube = new Mesh(0, 0);

/**
 * Test Models
 * Cube
 *  https://raw.githubusercontent.com/bulletphysics/bullet3/master/data/cube.obj
 *  https://gist.githubusercontent.com/MaikKlein/0b6d6bb58772c13593d0a0add6004c1c/raw/48cf9c6d1cdd43cc6862d7d34a68114e2b93d497/cube.obj
 * Pyramid
 *  https://raw.githubusercontent.com/erik/obj-viewer/master/models/pyramid.obj
 */
OBJLoader('./assets/cube.obj').then((obj) => {
  cube = Mesh.fromArrays(
    obj.vertices.map((v) => new Vertex(v.position, v.textCoord)),
    obj.indices,
  );
});

let texture: ImageData;
TextureLoader('./assets/container.jpg').then((m) => {
  texture = m;
});

function initControls() {
  document.addEventListener('wheel', (e: WheelEvent) => {
    const v = e.deltaY / 1000;
    camera.move(new Vector3(0, 0, v));
  });

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const cameraSpeed = 0.5;
    if (e.key === 'w') {
      camera.move(new Vector3(0, 1, 0).multiply(cameraSpeed));
    }
    if (e.key === 's') {
      camera.move(new Vector3(0, -1, 0).multiply(cameraSpeed));
    }
    if (e.key === 'a') {
      camera.move(new Vector3(-1, 0, 0).multiply(cameraSpeed));
    }
    if (e.key === 'd') {
      camera.move(new Vector3(1, 0, 0).multiply(cameraSpeed));
    }

    if (e.key === 'e') {
      camera.rotate(new Vector3(0, -0.5, 0));
    }

    if (e.key === 'q') {
      camera.rotate(new Vector3(0, 0.5, 0));
    }

    if (e.key === 'e') {
      camera.rotate(new Vector3(0, 0, -0.5));
    }

    if (e.key === 'q') {
      camera.rotate(new Vector3(0, 0, 0.5));
    }
  });
}

initControls();

export let frameCount = 0;
export let fps = 0;

export function addObject(obj: Mesh) {
  objects.push(obj);
}

export function setViewportSize(w: number, h: number) {
  camera.aspect = w / h;
  renderer.setViewportSize(w, h);
}

export function setRenderCallback(render: (buffer: Uint8ClampedArray) => void) {
  renderCallback = render;
}

export function start() {
  renderer.fillBuffer(new Color(0, 0, 0, 0));

  renderer.shader = shader;
  shader.texture = texture;
  shader.viewProjectionMatrix = camera.getViewProjectionMatrix();

  // shader.fragColor = new Color(255, 0, 0);
  // renderer.drawMesh(triangle);
  // shader.fragColor = new Color(0, 255, 0);
  // renderer.drawMesh(triangle2);

  // renderer.drawMesh(cube);
  shader.fragColor = new Color(255, 0, 0);
  // renderer.drawMesh(Mesh.QuadMesh);
  renderer.drawMesh(cube);

  // renderer.drawMesh(triangle2);

  renderCallback(renderer.switchBuffer());

  const time = window.performance.now();
  fps = (1 / (time - lastRenderTime)) * 1000;
  lastRenderTime = time;
  frameCount++;
  nextFrameId = requestAnimationFrame(() => start());
}

export function stop() {
  cancelAnimationFrame(nextFrameId);
}

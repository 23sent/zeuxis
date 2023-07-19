import { Camera, Color, Mesh, Renderer, Vector3, Vertex } from '../Zeuxis';
import { OBJLoader } from '../Zeuxis/loaders';
import { MyShader } from './MyShader';

const renderer = new Renderer(100, 100);
const objects = new Array<Mesh>();

const triangle = Mesh.fromArrays(
  [new Vertex([-0.9, 0, 0.8]), new Vertex([0, 0.5, 0.8]), new Vertex([0.9, 0, 0.8])],
  [0, 1, 2],
);
const triangle2 = Mesh.fromArrays(
  [new Vertex([-0.3, 0, 1]), new Vertex([0.6, 0.5, 1]), new Vertex([1.5, 0, 1])],
  [0, 1, 2],
);

const shader = new MyShader();
const camera = new Camera(Camera.Types.Perspective);

document.addEventListener('wheel', (ev: WheelEvent) => {
  const v = ev.deltaY / 1000;
  camera.setPosition(new Vector3(0, 0, camera.position.z + v));
});

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
// OBJLoader('https://raw.githubusercontent.com/erik/obj-viewer/master/models/pyramid.obj').then((obj) => {
//   console.log(obj);
//   cube = Mesh.fromArrays(
//     obj.vertices.map((v) => new Vertex(v.position)),
//     obj.indices,
//   );
// });

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
  shader.viewProjectionMatrix = camera.getViewProjectionMatrix();

  shader.fragColor = new Color(255, 0, 0);
  // renderer.drawMesh(triangle);
  // shader.fragColor = new Color(0, 255, 0);
  // renderer.drawMesh(triangle2);

  renderer.drawMesh(cube);

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

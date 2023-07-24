import { render } from 'react-dom';
import { Camera, Color, Matrix4x4, Mesh, Renderer, Vector3, Vertex } from '../Zeuxis';
import { OBJLoader, TextureLoader } from '../Zeuxis/loaders';
import { MyShader } from './MyShader';
import { Quaternion } from '../Zeuxis/math/Quaternion';

const renderer = new Renderer(100, 100);
renderer.WIREFRAME = false;

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
// shader.transform = new Matrix4x4().translate(0, -0.1, 0).multiply(new Matrix4x4().scale(10, 10, 10));

const camera = new Camera(Camera.Types.Perspective);
camera.setPosition(new Vector3(0, 0, -2));

let nextFrameId = 0;
let renderCallback: (buffer: Uint8ClampedArray, r: Renderer) => void = (b: Uint8ClampedArray, r: Renderer) =>
  console.log(r.fps);

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
    const cameraSpeed = 1 * renderer.deltaTime;
    if (e.key === 'w') {
      camera.move(new Vector3(0, cameraSpeed, 0));
    }
    if (e.key === 's') {
      camera.move(new Vector3(0, -cameraSpeed, 0));
    }
    if (e.key === 'a') {
      camera.move(new Vector3(-cameraSpeed, 0, 0));
    }
    if (e.key === 'd') {
      camera.move(new Vector3(cameraSpeed, 0, 0));
    }

    if (e.key === 'e') {
      camera.rotate(new Vector3(0, -25 * cameraSpeed, 0));
    }

    if (e.key === 'q') {
      camera.rotate(new Vector3(0, 25 * cameraSpeed, 0));
    }

    if (e.key === '1') {
      camera.rotate(new Vector3(-25 * cameraSpeed, 0, 0));
    }

    if (e.key === '2') {
      camera.rotate(new Vector3(25 * cameraSpeed, 0, 0));
    }
  });
}

initControls();

export function addObject(obj: Mesh) {
  objects.push(obj);
}

export function setViewportSize(w: number, h: number) {
  camera.aspect = w / h;
  renderer.setViewportSize(w, h);
}

export function setRenderCallback(render: (buffer: Uint8ClampedArray, renderer: Renderer) => void) {
  renderCallback = render;
}

export function start() {
  renderer.fillBuffer(new Color(0, 0, 0, 0));

  renderer.shader = shader;

  // Rotate over time
  // shader.transform = shader.transform.multiply(
  //   Matrix4x4.axisAngle(new Vector3(0, 1, 0), 1 * renderer.deltaTime),
  // );
  shader.transform = shader.transform.multiply(
    Matrix4x4.fromQuaternion(Quaternion.fromEuler(0, 30 * renderer.deltaTime, 0)),
  );

  shader.texture = texture;
  shader.viewProjectionMatrix = camera.getViewProjectionMatrix();

  shader.fragColor = new Color(0, 0, 255);
  // renderer.drawMesh(triangle);
  // shader.fragColor = new Color(0, 255, 0);
  // renderer.drawMesh(triangle2);

  // renderer.drawMesh(cube);
  shader.fragColor = new Color(255, 0, 0);
  // renderer.drawMesh(Mesh.QuadMesh);
  renderer.drawMesh(cube);
  // renderer.drawMesh(triangle2);

  renderCallback(renderer.switchBuffer(), renderer);

  nextFrameId = requestAnimationFrame(() => start());
}

export function stop() {
  cancelAnimationFrame(nextFrameId);
}

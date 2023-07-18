import { Camera, Color, Matrix4x4, Mesh, Renderer, Shader, Vector3 } from '../Zeuxis';
import { Vertex } from '../Zeuxis/api/Vertex';
import { MyShader } from './MyShader';

const res = new Vector3(1, 2, 3).add(new Vector3(1, 2, 3));

const m = new Matrix4x4();
m.set(3, 0, 5);

const renderer = new Renderer(100, 100);
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
  // camera.setPosition(new Vector3(camera.position.x + v, 0, 0));
  camera.setPosition(new Vector3(0, 0, camera.position.z + v));
});

export function main(render: (buffer: Uint8ClampedArray) => void): number {
  renderer.fillBuffer(new Color(0, 0, 0, 0));

  renderer.shader = shader;
  shader.viewProjectionMatrix = camera.getViewProjectionMatrix();
  shader.fragColor = new Color(255, 0, 0);

  renderer.drawMesh(triangle);

  shader.fragColor = new Color(0, 255, 0);
  renderer.drawMesh(triangle2);

  render(renderer.switchBuffer());

  return requestAnimationFrame(() => main(render));
}

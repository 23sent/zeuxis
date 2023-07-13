import { Color, Matrix4x4, Mesh, Renderer, Vector3 } from '../Zeuxis';
import { Vertex } from '../Zeuxis/api/Vertex';

const res = new Vector3(1, 2, 3).add(new Vector3(1, 2, 3));

const m = new Matrix4x4();
m.set(3, 0, 5);
console.log(m);

const renderer = new Renderer(100, 100);
const triangle = Mesh.fromArrays(
  [new Vertex([-1, 0, 0]), new Vertex([0, 0, 0]), new Vertex([1, 0, 0])],
  [0, 1, 2],
);

export function main(render: (buffer: Uint8ClampedArray) => void): number {
  renderer.fillBuffer(new Color(0, 0, 0, 0));
  renderer.drawMesh(triangle);

  render(renderer.switchBuffer());

  return requestAnimationFrame(() => main(render));
}

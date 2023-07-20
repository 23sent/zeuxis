import { Vector2, Vector3 } from '../math';

export class Vertex {
  public position: Vector3;
  public texCoord?: Vector2;
  public normal?: Vector2;

  constructor(p: Vector3 | number[], t?: Vector2 | number[], n?: Vector3 | number[]) {
    this.position = new Vector3(p);
    if (t !== undefined) {
      this.texCoord = new Vector2(t);
    }
    if (n !== undefined) {
      this.normal = new Vector3(n);
    }
  }
}

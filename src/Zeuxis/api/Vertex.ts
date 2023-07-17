import { Vector3 } from '../math';

export class Vertex {
  public position: Vector3;

  constructor(p: Vector3 | number[]) {
    this.position = new Vector3(p);
  }
}

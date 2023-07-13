export class Matrix4x4 {
  matrix: Array<number>;

  constructor() {
    this.matrix = new Array(4 * 4);
    this.matrix.fill(0);
  }

  get(x: number, y: number): number {
    return this.matrix[y * 4 + x];
  }

  set(x: number, y: number, value: number) {
    this.matrix[y * 4 + x] = value;
  }
}

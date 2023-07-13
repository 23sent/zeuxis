type MatrixConstructor<T extends Matrix> = { new (): T };

export abstract class Matrix {
  matrix: Array<number>;

  constructor(
    public readonly ROWS: number = 2,
    public readonly COLS: number = 2,
  ) {
    this.matrix = new Array(this.ROWS * this.COLS);
    this.matrix.fill(0);
  }

  get(x: number, y: number): number {
    return this.matrix[y * this.COLS + x];
  }

  set(x: number, y: number, value: number) {
    this.matrix[y * this.COLS + x] = value;
  }

  // Abstract Methods
  abstract get transpose(): Matrix;
  abstract multiply(v: Matrix | number): Matrix;

  // Static Operation
  static Multiply<T extends Matrix>(
    this: MatrixConstructor<T>,
    a: T,
    b: T,
  ): T {
    if (a.COLS !== b.ROWS)
      throw new Error('Invalid matrix multiplication. ');

    const result = new this();

    return result;
  }

  static MultiplyScalar<T extends Matrix>(
    this: MatrixConstructor<T>,
    a: T,
    b: number,
  ): T {
    const result = new this();
    for (let i = 0; i < a.ROWS * a.COLS; i++) {
      result.matrix[i] = a.matrix[i] * b;
    }
    return result;
  }

  static Transpose<T extends Matrix>(
    this: MatrixConstructor<T>,
    src: T,
  ): T {
    const result = new this();

    for (let i = 0; i < src.ROWS * src.COLS; i++) {
      let row = Math.floor(i / src.ROWS);
      let col = i % src.ROWS;
      result.matrix[i] = src.matrix[src.COLS * col + row];
    }

    return result;
  }
}

import { Vector3 } from '../Vector';

export class Matrix3x3 {
  private readonly ROWS: number = 3;
  private readonly COLS: number = 3;
  _data: Float32Array = new Float32Array(9);

  constructor(a?: Matrix3x3 | Array<number> | Array<Array<number>> | Float32Array) {
    if (a instanceof Array) {
      this.setData(a.flat());
    } else if (a instanceof Matrix3x3) {
      this.setData(a._data);
    } else {
      this.setData(Matrix3x3.identity._data);
    }
  }

  setData(array: number[] | Float32Array) {
    for (let i = 0; i < array.length && i < this._data.length; i++) {
      this._data[i] = array[i];
    }
  }

  get(y: number, x: number): number {
    return this._data[y * this.COLS + x];
  }

  set(y: number, x: number, value: number) {
    this._data[y * this.COLS + x] = value;
  }

  get length(): number {
    return this._data.length;
  }

  get transpose(): Matrix3x3 {
    return Matrix3x3.Transpose(this);
  }

  multiply(v: number | Matrix3x3): Matrix3x3 {
    if (v instanceof Matrix3x3) return Matrix3x3.Multiply(this, v);
    else return Matrix3x3.MultiplyScalar(this, v);
  }

  determinant(): number {
    // minor_x -> Minor of first row, col x
    const minor_0 = this.get(1, 1) * this.get(2, 2) - this.get(1, 2) * this.get(2, 1);
    const minor_1 = this.get(1, 0) * this.get(2, 2) - this.get(1, 2) * this.get(2, 0);
    const minor_2 = this.get(1, 0) * this.get(2, 1) - this.get(1, 1) * this.get(2, 0);

    return this.get(0, 0) * minor_0 - this.get(0, 1) * minor_1 + this.get(0, 2) * minor_2;
  }

  inverse(): Matrix3x3 {
    const det = this.determinant();

    if (det === 0) return new Matrix3x3();

    const oneOverDet = 1 / det;

    // minor_yx -> Minor of row y, col x
    const minor_01 = this.get(1, 1) * this.get(2, 2) - this.get(1, 2) * this.get(2, 1);
    const minor_00 = this.get(1, 0) * this.get(2, 2) - this.get(1, 2) * this.get(2, 0);
    const minor_02 = this.get(1, 0) * this.get(2, 1) - this.get(1, 1) * this.get(2, 0);

    const minor_10 = this.get(0, 1) * this.get(2, 2) - this.get(0, 2) * this.get(2, 1);
    const minor_11 = this.get(0, 0) * this.get(2, 2) - this.get(0, 2) * this.get(2, 0);
    const minor_12 = this.get(0, 0) * this.get(2, 1) - this.get(0, 1) * this.get(2, 0);

    const minor_20 = this.get(0, 1) * this.get(1, 2) - this.get(0, 2) * this.get(1, 1);
    const minor_21 = this.get(0, 0) * this.get(1, 2) - this.get(0, 2) * this.get(1, 0);
    const minor_22 = this.get(0, 0) * this.get(1, 1) - this.get(0, 1) * this.get(1, 0);

    return new Matrix3x3([
      +minor_00 * oneOverDet,
      -minor_01 * oneOverDet,
      +minor_02 * oneOverDet,

      -minor_10 * oneOverDet,
      +minor_11 * oneOverDet,
      -minor_12 * oneOverDet,

      +minor_20 * oneOverDet,
      -minor_21 * oneOverDet,
      +minor_22 * oneOverDet,
    ]);
  }

  multiplyVec3(v: Vector3): Vector3 {
    const x = v.x;
    const y = v.y;
    const z = v.z;

    return new Vector3(
      this._data[0] * x + this._data[4] * y + this._data[8] * z,
      this._data[1] * x + this._data[5] * y + this._data[9] * z,
      this._data[2] * x + this._data[6] * y + this._data[10] * z,
    );
  }

  // Static Operation
  static Multiply(a: Matrix3x3, b: Matrix3x3): Matrix3x3 {
    if (a.COLS !== b.ROWS) throw new Error('Invalid matrix multiplication.');

    const result = new Matrix3x3();
    for (let x = 0; x < result.COLS; x++) {
      for (let y = 0; y < result.ROWS; y++) {
        let t = 0;
        for (let k = 0; k < a.COLS; k++) {
          t += a.get(y, k) * b.get(x, k);
        }
        result.set(y, x, t);
      }
    }

    return result;
  }

  static MultiplyScalar(a: Matrix3x3, b: number): Matrix3x3 {
    const result = new Matrix3x3();

    for (let i = 0; i < a.ROWS * a.COLS; i++) {
      result._data[i] = a._data[i] * b;
    }
    return result;
  }

  static Transpose(src: Matrix3x3): Matrix3x3 {
    const result = new Matrix3x3();

    for (let i = 0; i < src.ROWS * src.COLS; i++) {
      let row = Math.floor(i / src.ROWS);
      let col = i % src.ROWS;
      result._data[i] = src._data[src.COLS * col + row];
    }

    return result;
  }

  static readonly identity = Object.freeze(
    new Matrix3x3([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]),
  );
}

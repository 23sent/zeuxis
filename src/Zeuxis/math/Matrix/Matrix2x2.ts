export class Matrix2x2 {
  private readonly ROWS: number = 2;
  private readonly COLS: number = 2;
  _data: Float64Array = new Float64Array(4);

  constructor(a?: Matrix2x2 | Array<number> | Array<Array<number>> | Float32Array) {
    if (a instanceof Array) {
      this.setData(a.flat());
    } else if (a instanceof Matrix2x2) {
      this.setData(a._data);
    } else {
      this.setData(Matrix2x2.identity._data);
    }
  }

  setData(array: number[] | Float64Array) {
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

  get transpose(): Matrix2x2 {
    return Matrix2x2.Transpose(this);
  }

  multiply(v: number | Matrix2x2): Matrix2x2 {
    if (v instanceof Matrix2x2) return Matrix2x2.Multiply(this, v);
    else return Matrix2x2.MultiplyScalar(this, v);
  }

  determinant(): number {
    return this._data[0] * this._data[3] - this._data[1] * this._data[2];
  }

  inverse(): Matrix2x2 {
    const det = this.determinant();

    if (det === 0) return new Matrix2x2();

    const oneOverDet = 1 / det;

    return new Matrix2x2([
      +this._data[3] * oneOverDet,
      -this._data[1] * oneOverDet,
      -this._data[2] * oneOverDet,
      +this._data[0] * oneOverDet,
    ]);
  }

  minor(): Matrix2x2 {
    return new Matrix2x2([this._data[3], this._data[2], this._data[1], this._data[0]]);
  }

  // Static Operation
  static Multiply(a: Matrix2x2, b: Matrix2x2): Matrix2x2 {
    if (a.COLS !== b.ROWS) throw new Error('Invalid matrix multiplication.');

    const result = new Matrix2x2();
    for (let x = 0; x < result.COLS; x++) {
      for (let y = 0; y < result.ROWS; y++) {
        let t = 0;
        for (let k = 0; k < a.COLS; k++) {
          t += a.get(y, k) * b.get(k, x);
        }
        result.set(y, x, t);
      }
    }

    return result;
  }

  static MultiplyScalar(a: Matrix2x2, b: number): Matrix2x2 {
    const result = new Matrix2x2();

    for (let i = 0; i < a.ROWS * a.COLS; i++) {
      result._data[i] = a._data[i] * b;
    }
    return result;
  }

  static Transpose(src: Matrix2x2): Matrix2x2 {
    const result = new Matrix2x2();

    for (let i = 0; i < src.ROWS * src.COLS; i++) {
      let row = Math.floor(i / src.ROWS);
      let col = i % src.ROWS;
      result._data[i] = src._data[src.COLS * col + row];
    }

    return result;
  }

  // Static
  static readonly identity = Object.freeze(
    new Matrix2x2([
      [1, 0],
      [0, 1],
    ]),
  );
}

// const test = new Matrix2x2([
//   [1, 2],
//   [3, 4],
// ]);

// const inverse = test.inverse();

// console.log('Det: ', test.determinant());
// console.log(inverse);
// console.log(test.multiply(inverse));

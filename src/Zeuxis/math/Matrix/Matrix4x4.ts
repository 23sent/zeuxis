import { Quaternion } from '../Quaternion';
import { Vector3, Vector4 } from '../Vector';

export class Matrix4x4 {
  public readonly ROWS: number = 4;
  public readonly COLS: number = 4;
  _data: Float32Array = new Float32Array(16);

  constructor(a?: Matrix4x4 | Array<number> | Array<Array<number>> | Float32Array) {
    if (a instanceof Array) {
      this.setData(a.flat());
    } else if (a instanceof Matrix4x4) {
      this.setData(a._data);
    } else {
      this.setData(Matrix4x4.identity._data);
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

  get transpose(): Matrix4x4 {
    return Matrix4x4.Transpose(this);
  }

  multiply(v: number | Matrix4x4): Matrix4x4 {
    if (v instanceof Matrix4x4) return Matrix4x4.Multiply(this, v);
    else return Matrix4x4.MultiplyScalar(this, v);
  }

  determinant(): number {
    // det_ab -> Determinant of [2a 2b 3a 3b] matrix (2x2)
    const det_01 = this.get(2, 0) * this.get(3, 1) - this.get(2, 1) * this.get(3, 0);
    const det_02 = this.get(2, 0) * this.get(3, 2) - this.get(2, 2) * this.get(3, 0);
    const det_03 = this.get(2, 0) * this.get(3, 3) - this.get(2, 3) * this.get(3, 0);

    const det_12 = this.get(2, 1) * this.get(3, 2) - this.get(2, 2) * this.get(3, 1);
    const det_13 = this.get(2, 1) * this.get(3, 3) - this.get(2, 3) * this.get(3, 1);

    const det_23 = this.get(2, 2) * this.get(3, 3) - this.get(2, 3) * this.get(3, 2);

    const minor_0 = this.get(1, 1) * det_23 - this.get(1, 2) * det_13 + this.get(1, 3) * det_12;
    const minor_1 = this.get(1, 0) * det_23 - this.get(1, 2) * det_03 + this.get(1, 3) * det_02;
    const minor_2 = this.get(1, 0) * det_13 - this.get(1, 1) * det_03 + this.get(1, 3) * det_01;
    const minor_3 = this.get(1, 0) * det_12 - this.get(1, 1) * det_02 + this.get(1, 2) * det_01;

    return (
      this.get(0, 0) * minor_0 -
      this.get(0, 1) * minor_1 +
      this.get(0, 2) * minor_2 -
      this.get(0, 3) * minor_3
    );
  }

  inverse(): Matrix4x4 {
    const det = this.determinant();

    if (det === 0) return new Matrix4x4();

    const oneOverDet = 1 / det;

    // det_i_j_k_t -> Determinant of a [this._data[i], this._data[j], this._data[k], this._data[t]] (2x2 matrix)
    const det_9_10_13_14 = this._data[9] * this._data[14] - this._data[10] * this._data[13];
    const det_9_11_13_15 = this._data[9] * this._data[15] - this._data[11] * this._data[13];
    const det_10_11_14_15 = this._data[10] * this._data[15] - this._data[11] * this._data[14];

    const det_8_10_12_14 = this._data[8] * this._data[14] - this._data[10] * this._data[12];
    const det_8_11_12_15 = this._data[8] * this._data[15] - this._data[11] * this._data[12];

    const det_8_9_12_13 = this._data[8] * this._data[13] - this._data[9] * this._data[12];

    const det_5_6_13_14 = this._data[5] * this._data[14] - this._data[6] * this._data[13];
    const det_5_7_13_15 = this._data[5] * this._data[15] - this._data[7] * this._data[13];
    const det_6_7_14_15 = this._data[6] * this._data[15] - this._data[7] * this._data[14];

    const det_4_6_12_14 = this._data[4] * this._data[14] - this._data[6] * this._data[12];
    const det_4_7_12_15 = this._data[4] * this._data[15] - this._data[7] * this._data[12];

    const det_4_5_12_13 = this._data[4] * this._data[13] - this._data[5] * this._data[12];

    const det_5_6_9_10 = this._data[5] * this._data[10] - this._data[6] * this._data[9];
    const det_5_7_9_11 = this._data[5] * this._data[11] - this._data[7] * this._data[9];
    const det_6_7_10_11 = this._data[6] * this._data[11] - this._data[7] * this._data[10];

    const det_4_6_8_10 = this._data[4] * this._data[10] - this._data[6] * this._data[8];
    const det_4_7_8_11 = this._data[4] * this._data[11] - this._data[7] * this._data[8];

    const det_4_5_8_9 = this._data[4] * this._data[9] - this._data[5] * this._data[8];

    // minor_yx -> Minor of row y, col x
    const minor_00 =
      this._data[5] * det_10_11_14_15 -
      this._data[6] * det_9_11_13_15 +
      this._data[7] * det_9_10_13_14;
    const minor_01 =
      this._data[4] * det_10_11_14_15 -
      this._data[6] * det_8_11_12_15 +
      this._data[7] * det_8_10_12_14;
    const minor_02 =
      this._data[4] * det_9_11_13_15 -
      this._data[5] * det_8_11_12_15 +
      this._data[7] * det_8_9_12_13;
    const minor_03 =
      this._data[4] * det_9_10_13_14 -
      this._data[5] * det_8_10_12_14 +
      this._data[6] * det_8_9_12_13;

    const minor_10 =
      this._data[1] * det_10_11_14_15 -
      this._data[2] * det_9_11_13_15 +
      this._data[3] * det_9_10_13_14;
    const minor_11 =
      this._data[0] * det_10_11_14_15 -
      this._data[2] * det_8_11_12_15 +
      this._data[3] * det_8_10_12_14;
    const minor_12 =
      this._data[0] * det_9_11_13_15 -
      this._data[1] * det_8_11_12_15 +
      this._data[3] * det_8_9_12_13;
    const minor_13 =
      this._data[0] * det_9_10_13_14 -
      this._data[1] * det_8_10_12_14 +
      this._data[2] * det_8_9_12_13;

    const minor_20 =
      this._data[1] * det_6_7_14_15 - this._data[2] * det_5_7_13_15 + this._data[3] * det_5_6_13_14;
    const minor_21 =
      this._data[0] * det_6_7_14_15 - this._data[2] * det_4_7_12_15 + this._data[3] * det_4_6_12_14;
    const minor_22 =
      this._data[0] * det_5_7_13_15 - this._data[1] * det_4_7_12_15 + this._data[3] * det_4_5_12_13;
    const minor_23 =
      this._data[0] * det_5_6_13_14 - this._data[1] * det_4_6_12_14 + this._data[2] * det_4_5_12_13;

    const minor_30 =
      this._data[1] * det_6_7_10_11 - this._data[2] * det_5_7_9_11 + this._data[3] * det_5_6_9_10;
    const minor_31 =
      this._data[0] * det_6_7_10_11 - this._data[2] * det_4_7_8_11 + this._data[3] * det_4_6_8_10;

    const minor_32 =
      this._data[0] * det_5_7_9_11 - this._data[1] * det_4_7_8_11 + this._data[3] * det_4_5_8_9;
    const minor_33 =
      this._data[0] * det_5_6_9_10 - this._data[1] * det_4_6_8_10 + this._data[2] * det_4_5_8_9;

    return new Matrix4x4([
      +minor_00 * oneOverDet,
      -minor_10 * oneOverDet,
      +minor_20 * oneOverDet,
      -minor_30 * oneOverDet,

      -minor_01 * oneOverDet,
      +minor_11 * oneOverDet,
      -minor_21 * oneOverDet,
      +minor_31 * oneOverDet,

      +minor_02 * oneOverDet,
      -minor_12 * oneOverDet,
      +minor_22 * oneOverDet,
      -minor_32 * oneOverDet,

      -minor_03 * oneOverDet,
      +minor_13 * oneOverDet,
      -minor_23 * oneOverDet,
      +minor_33 * oneOverDet,
    ]);
  }

  translate(x: Vector3 | number, y?: number, z?: number): Matrix4x4 {
    const result = new Matrix4x4(this);

    if (x instanceof Vector3) {
      z = x.z;
      y = x.y;
      x = x.x;
    } else {
      y = y ?? 0;
      z = z ?? 0;
    }

    result._data[12] += this._data[0] * x + this._data[4] * y + this._data[8] * z;
    result._data[13] += this._data[1] * x + this._data[5] * y + this._data[9] * z;
    result._data[14] += this._data[2] * x + this._data[6] * y + this._data[10] * z;
    result._data[15] += this._data[3] * x + this._data[7] * y + this._data[11] * z;

    return result;
  }

  scale(x: Vector3 | number, y?: number, z?: number): Matrix4x4 {
    const result = new Matrix4x4(this);

    if (x instanceof Vector3) {
      z = x.z;
      y = x.y;
      x = x.x;
    } else {
      y = y ?? 0;
      z = z ?? 0;
    }

    result._data[0] *= x;
    result._data[1] *= x;
    result._data[2] *= x;
    result._data[3] *= x;

    result._data[4] *= y;
    result._data[5] *= y;
    result._data[6] *= y;
    result._data[7] *= y;

    result._data[8] *= z;
    result._data[9] *= z;
    result._data[10] *= z;
    result._data[11] *= z;

    return result;
  }

  // Static Operation
  static Multiply(a: Matrix4x4, b: Matrix4x4): Matrix4x4 {
    if (a.COLS !== b.ROWS) throw new Error('Invalid matrix multiplication.');

    const result = new Matrix4x4();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let t = 0;
        for (let k = 0; k < 4; k++) {
          t += a._data[4 * i + k] * b._data[4 * k + j];
        }
        result._data[4 * i + j] = t;
      }
    }

    return result;
  }

  static MultiplyScalar(a: Matrix4x4, b: number): Matrix4x4 {
    const result = new Matrix4x4();

    for (let i = 0; i < a.ROWS * a.COLS; i++) {
      result._data[i] = a._data[i] * b;
    }
    return result;
  }

  static Transpose(src: Matrix4x4): Matrix4x4 {
    const result = new Matrix4x4();

    for (let i = 0; i < src.ROWS * src.COLS; i++) {
      let row = Math.floor(i / src.ROWS);
      let col = i % src.ROWS;
      result._data[i] = src._data[src.COLS * col + row];
    }

    return result;
  }

  static fromQuaternion(q: Quaternion): Matrix4x4 {
    // From glm
    const qxx = q.x * q.x;
    const qyy = q.y * q.y;
    const qzz = q.z * q.z;
    const qxz = q.x * q.z;
    const qxy = q.x * q.y;
    const qyz = q.y * q.z;
    const qwx = q.w * q.x;
    const qwy = q.w * q.y;
    const qwz = q.w * q.z;

    return new Matrix4x4([
      [1 - 2 * (qyy + qzz), 2 * (qxy + qwz), 2 * (qxz - qwy), 0],
      [2 * (qxy - qwz), 1 - 2 * (qxx + qzz), 2 * (qyz + qwx), 0],
      [2 * (qxz + qwy), 2 * (qyz - qwx), 1 - 2 * (qxx + qyy), 0],
      [0, 0, 0, 1],
    ]);
  }

  static axisAngle(axis: Vector3, radian: number): Matrix4x4 {
    const normalized = axis.normalized();

    const c = Math.cos(radian);
    const s = Math.sin(radian);
    const t = 1.0 - Math.cos(radian);
    const x = normalized.x;
    const y = normalized.y;
    const z = normalized.z;

    return new Matrix4x4([
      [t * (x * x) + c, t * x * y + s * z, t * x * z - s * y, 0.0],
      [t * x * y - s * z, t * (y * y) + c, t * y * z + s * x, 0.0],
      [t * x * z + s * y, t * y * z - s * x, t * (z * z) + c, 0.0],
      [0.0, 0.0, 0.0, 1.0],
    ]);
  }

  /**
   * Generates orthogprahic projection matrix for Left Handed and Z axis of NDC is between [-1, 1]
   * @param left
   * @param right
   * @param bottom
   * @param top
   * @param zNear
   * @param zFar
   * @returns
   */
  static ortho(
    left: number,
    right: number,
    bottom: number,
    top: number,
    zNear: number,
    zFar: number,
  ): Matrix4x4 {
    const m00 = 2.0 / (right - left);
    const m11 = 2.0 / (top - bottom);
    const m22 = 1.0 / (zFar - zNear);
    const m30 = (left + right) / (left - right);
    const m31 = (top + bottom) / (bottom - top);
    const m32 = zNear / (zNear - zFar);

    return new Matrix4x4([
      [m00, 0, 0, 0],
      [0, m11, 0, 0],
      [0, 0, m22, 0],
      [m30, m31, m32, 1],
    ]);
  }

  /**
   * Generates perspective projection matrix for Left Handed and Z axis of NDC is between [-1, 1]
   * @param fov_degree Field of view in degree
   * @param aspect width / height of screen
   * @param zNear distance from the viewer to the near clipping plane (positive)
   * @param zFar distance from the viewer to the far clipping plane (positive)
   * @returns
   */
  static perspective(fov_degree: number, aspect: number, zNear: number, zFar: number): Matrix4x4 {
    const fov_rad = fov_degree * (Math.PI / 180);

    const fovY = 1 / Math.tan(fov_rad / 2);
    const fovX = fovY / aspect;
    const zRange = zFar - zNear;

    const m00 = fovX;
    const m11 = fovY;
    const m22 = zFar / zRange;
    const m32 = -((zFar * zNear) / zRange);

    return new Matrix4x4([
      [m00, 0, 0, 0],
      [0, m11, 0, 0],
      [0, 0, m22, 1],
      [0, 0, m32, 0],
    ]);
  }

  static readonly identity = Object.freeze(
    new Matrix4x4([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]),
  );
}

// const test = new Matrix4x4([
//   [1, 9, 2, 8],
//   [3, 7, 4, 6],
//   [5, 1, 2, 3],
//   [4, 5, 6, 7],
// ]);

// const inverse = test.inverse();

// console.log('Det: ', test.determinant());
// console.log(inverse);
// console.log(test.multiply(inverse));

// const test = new Matrix4x4();
// const translated = test.translate(5, 4, 3);
// const scaled = test.scale(0.5, 0.5, 0.5);
// console.log(scaled);

// const quat = Quaternion.fromEuler(30, 30, 30);
// console.log(quat);

// const test = Matrix4x4.fromQuaternion(quat);
// console.log(test);

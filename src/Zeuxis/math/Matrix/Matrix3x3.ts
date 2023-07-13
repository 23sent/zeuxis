import { Matrix } from './Matrix';

export class Matrix3x3 extends Matrix {
  constructor() {
    super(3, 3);
  }

  get transpose(): Matrix3x3 {
    return Matrix3x3.Transpose(this);
  }

  multiply(v: number | Matrix3x3): Matrix3x3 {
    if (v instanceof Matrix3x3) return Matrix3x3.Multiply(this, v);
    else return Matrix3x3.MultiplyScalar(this, v);
  }
}

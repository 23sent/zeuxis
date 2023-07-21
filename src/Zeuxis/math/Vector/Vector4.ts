// Implemented according (and thanks) to "Game Physics Cookbook - Gabor Szauer"

import { Matrix4x4 } from '../Matrix';
import { Vector3 } from './Vector3';

export class Vector4 {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  constructor(x: number | Vector3 | Vector4 | number[] = 0, y: number = 0, z: number = 0, w: number = 0) {
    if (x instanceof Vector4) {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
      this.w = x.w;
    } else if (x instanceof Vector3) {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
      this.w = 1;
    } else if (x instanceof Array) {
      this.x = x[0] || 0;
      this.y = x[1] || 0;
      this.z = x[2] || 0;
      this.w = x[4] || 0;
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
  }

  // Operations
  add(v: Vector4 | number): Vector4 {
    if (v instanceof Vector4) {
      return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    } else {
      return new Vector4(this.x + v, this.y + v, this.z + v, this.w + v);
    }
  }

  substract(v: Vector4 | number): Vector4 {
    if (v instanceof Vector4) {
      return new Vector4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    } else {
      return new Vector4(this.x - v, this.y - v, this.z - v, this.w - v);
    }
  }

  multiply(v: Vector4 | Matrix4x4 | number): Vector4 {
    if (v instanceof Vector4) {
      return new Vector4(this.x * v.x, this.y * v.y, this.z * v.z, this.w * v.w);
    } else if (v instanceof Matrix4x4) {
      const x = this.x;
      const y = this.y;
      const z = this.z;
      const w = this.w;

      return new Vector4(
        v._data[0] * x + v._data[4] * y + v._data[8] * z + v._data[12] * w,
        v._data[1] * x + v._data[5] * y + v._data[9] * z + v._data[13] * w,
        v._data[2] * x + v._data[6] * y + v._data[10] * z + v._data[14] * w,
        v._data[3] * x + v._data[7] * y + v._data[11] * z + v._data[15] * w,
      );
    } else {
      return new Vector4(this.x * v, this.y * v, this.z * v, this.w * v);
    }
  }

  divide(v: Vector4 | number): Vector4 {
    if (v instanceof Vector4) {
      return new Vector4(this.x / v.x, this.y / v.y, this.z / v.z, this.w / v.w);
    } else {
      return new Vector4(this.x / v, this.y / v, this.z / v, this.w / v);
    }
  }

  equals(v: Vector4): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z && this.w === v.w;
  }

  dot(v: Vector4): number {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  distance(v: Vector4): number {
    return this.substract(v).magnitude;
  }

  normalized(): Vector4 {
    return this.multiply(1 / this.magnitude);
  }

  angle(v: Vector4): number {
    const m = Math.sqrt(this.magnitudeSq * v.magnitudeSq);
    return Math.acos(this.dot(v) / m);
  }

  // Getters
  get magnitude(): number {
    return Math.sqrt(this.dot(this));
  }

  get magnitudeSq(): number {
    return this.dot(this);
  }

  // Static Getters
  static fromVector3(v: Vector3, w: number = 1) {
    return new Vector4(v.x, v.y, v.z, w);
  }
}

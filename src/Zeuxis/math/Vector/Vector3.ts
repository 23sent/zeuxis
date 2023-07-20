// Implemented according (and thanks) to "Game Physics Cookbook - Gabor Szauer"

import { Vector4 } from './Vector4';

export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number | Vector3 | Vector4 | number[] = 0, y: number = 0, z: number = 0) {
    if (x instanceof Vector3 || x instanceof Vector4) {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    } else if (x instanceof Array) {
      this.x = x[0] || 0;
      this.y = x[1] || 0;
      this.z = x[2] || 0;
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  // Operations
  add(v: Vector3 | number): Vector3 {
    if (v instanceof Vector3) {
      return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    } else {
      return new Vector3(this.x + v, this.y + v, this.z + v);
    }
  }

  substract(v: Vector3 | number): Vector3 {
    if (v instanceof Vector3) {
      return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    } else {
      return new Vector3(this.x - v, this.y - v, this.z - v);
    }
  }

  multiply(v: Vector3 | number): Vector3 {
    if (v instanceof Vector3) {
      return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    } else {
      return new Vector3(this.x * v, this.y * v, this.z * v);
    }
  }

  equals(v: Vector3): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector3): Vector3 {
    return new Vector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
  }

  distance(v: Vector3): number {
    return this.substract(v).magnitude;
  }

  normalized(): Vector3 {
    return this.multiply(1 / this.magnitude);
  }

  angle(v: Vector3): number {
    const m = Math.sqrt(this.magnitudeSq * v.magnitudeSq);
    return Math.acos(this.dot(v) / m);
  }

  toHomogeneous(v: Vector3): Vector4 {
    return new Vector4(v);
  }

  // Getters
  get magnitude(): number {
    return Math.sqrt(this.dot(this));
  }

  get magnitudeSq(): number {
    return this.dot(this);
  }

  // Static Getters
  static get Zero(): Vector3 {
    return Object.freeze(new Vector3(0, 0, 0));
  }
  static get One(): Vector3 {
    return Object.freeze(new Vector3(1, 1, 1));
  }
  static get Up(): Vector3 {
    return Object.freeze(new Vector3(0, 1, 0));
  }
  static get Down(): Vector3 {
    return Object.freeze(new Vector3(0, -1, 0));
  }
  static get Left(): Vector3 {
    return Object.freeze(new Vector3(-1, 0, 0));
  }
  static get Right(): Vector3 {
    return Object.freeze(new Vector3(1, 0, 0));
  }
  static get Back(): Vector3 {
    return Object.freeze(new Vector3(0, 0, -1));
  }
  static get Forward(): Vector3 {
    return Object.freeze(new Vector3(0, 0, 1));
  }
}

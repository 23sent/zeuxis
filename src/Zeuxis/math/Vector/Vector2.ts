// Implemented according (and thanks) to "Game Physics Cookbook - Gabor Szauer"

export class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // Operations
  add(v: Vector2 | number): Vector2 {
    if (v instanceof Vector2) {
      return new Vector2(this.x + v.x, this.y + v.y);
    } else {
      return new Vector2(this.x + v, this.y + v);
    }
  }

  substract(v: Vector2 | number): Vector2 {
    if (v instanceof Vector2) {
      return new Vector2(this.x - v.x, this.y - v.y);
    } else {
      return new Vector2(this.x - v, this.y - v);
    }
  }

  multiply(v: Vector2 | number): Vector2 {
    if (v instanceof Vector2) {
      return new Vector2(this.x * v.x, this.y * v.y);
    } else {
      return new Vector2(this.x * v, this.y * v);
    }
  }

  equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  distance(v: Vector2): number {
    return this.substract(v).magnitude;
  }

  normalized(): Vector2 {
    return this.multiply(1 / this.magnitude);
  }

  angle(v: Vector2): number {
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
  static get Zero(): Vector2 {
    return Object.freeze(new Vector2(0, 0));
  }
  static get One(): Vector2 {
    return Object.freeze(new Vector2(1, 1));
  }
  static get Up(): Vector2 {
    return Object.freeze(new Vector2(0, 1));
  }
  static get Down(): Vector2 {
    return Object.freeze(new Vector2(0, -1));
  }
  static get Left(): Vector2 {
    return Object.freeze(new Vector2(-1, 0));
  }
  static get Right(): Vector2 {
    return Object.freeze(new Vector2(1, 0));
  }
}

import { Vector3 } from './Vector';

export class Quaternion {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   *
   * @param x degree
   * @param y degree
   * @param z degree
   * @returns rotation in zyx order
   */
  static fromEuler(v: number | Vector3, y?: number, z?: number) {
    let x;
    if (v instanceof Vector3) {
      x = v.x;
      y = v.y;
      z = v.z;
    } else {
      x = v;
      y = y || 0;
      z = z || 0;
    }

    x = x * (Math.PI / 180);
    y = y * (Math.PI / 180);
    z = z * (Math.PI / 180);

    const sx = Math.sin(x * 0.5);
    const cx = Math.cos(x * 0.5);
    const sy = Math.sin(y * 0.5);
    const cy = Math.cos(y * 0.5);
    const sz = Math.sin(z * 0.5);
    const cz = Math.cos(z * 0.5);

    return new Quaternion(
      sx * cy * cz - cx * sy * sz,
      cx * sy * cz + sx * cy * sz,
      cx * cy * sz - sx * sy * cz,
      cx * cy * cz + sx * sy * sz,
    );
  }

  static readonly identity: Quaternion = Object.freeze(new Quaternion(0, 0, 0, 1));
}

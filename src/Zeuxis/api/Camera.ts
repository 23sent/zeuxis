import { Matrix4x4, Vector3 } from '../math';
import { Quaternion } from '../math/Quaternion';

export interface Camera {
  calculateViewMatrix(): void;
  setPosition(v: Vector3): void;
  setRotation(v: Vector3): void;
  getViewProjectionMatrix(): Matrix4x4;
}

export class OrthographicCamera implements Camera {
  private _position: Vector3 = new Vector3(0, 0, -0.1);
  private _rotation: Vector3 = new Vector3(0, 0, 0);

  private _projection: Matrix4x4 = new Matrix4x4();
  private _view: Matrix4x4 = new Matrix4x4();

  constructor() {
    const aspectRatio = 100 / 100;
    this._projection = Matrix4x4.ortho(-aspectRatio, aspectRatio, -1.0, 1.0, -1.0, 1.0);

    this.calculateViewMatrix();
  }

  get position(): Vector3 {
    return this._position;
  }

  setProjection(p: Matrix4x4) {
    this._projection = p;
  }

  calculateViewMatrix() {
    const translate = new Matrix4x4().translate(this._position); // Translation
    const rotate = Matrix4x4.fromQuaternion(Quaternion.fromEuler(this._rotation)); // Rotation

    const transform = translate.multiply(rotate);

    this._view = transform.inverse();
  }

  setPosition(v: Vector3) {
    this._position = v;
    this.calculateViewMatrix();
  }

  setRotation(v: Vector3) {
    this._rotation = v;
    this.calculateViewMatrix();
  }

  getViewProjectionMatrix(): Matrix4x4 {
    return this._projection.multiply(this._view);
  }
}

export class PerspectiveCamera implements Camera {
  private _position: Vector3 = new Vector3(0, 0, 0);
  private _rotation: Vector3 = new Vector3(0, 0, 0);

  private _projection: Matrix4x4 = new Matrix4x4();
  private _view: Matrix4x4 = new Matrix4x4();

  constructor() {
    const aspectRatio = 100 / 100;
    this._projection = Matrix4x4.perspective(90, aspectRatio, 0.1, 100);

    this.calculateViewMatrix();
  }
  get position(): Vector3 {
    return this._position;
  }
  // TODO: setProjectionMatrix

  calculateViewMatrix() {
    const translate = new Matrix4x4().translate(this._position); // Translation
    const rotate = Matrix4x4.fromQuaternion(Quaternion.fromEuler(this._rotation)); // Rotation

    const transform = translate.multiply(rotate);

    this._view = transform.inverse();
  }

  setPosition(v: Vector3) {
    this._position = v;
    this.calculateViewMatrix();
  }

  setRotation(v: Vector3) {
    this._rotation = v;
    this.calculateViewMatrix();
  }

  getViewProjectionMatrix(): Matrix4x4 {
    return this._projection.multiply(this._view);
  }
}

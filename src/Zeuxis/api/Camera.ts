import { Matrix4x4, Vector3 } from '../math';
import { Quaternion } from '../math/Quaternion';
import { mat4, quat } from 'gl-matrix';

enum ProjectionType {
  Orthographic,
  Perspective,
}

export class Camera {
  static readonly Types = ProjectionType;

  private _projectionType: ProjectionType;

  private _position: Vector3 = new Vector3(0, 0, -1);
  private _rotation: Vector3 = new Vector3(0, 0, 0);
  private _aspect: number = 1;

  private _projection: Matrix4x4 = new Matrix4x4();
  private _view: Matrix4x4 = new Matrix4x4();

  constructor(pT: ProjectionType = ProjectionType.Perspective) {
    this._projectionType = pT;
    this._aspect = 100 / 100;

    this.calculateProjectionMatrix();
    this.calculateViewMatrix();
  }

  get position(): Vector3 {
    return this._position;
  }

  calculateProjectionMatrix() {
    if (this._projectionType === ProjectionType.Perspective) {
      this._projection = Matrix4x4.perspective(90, this._aspect, 0.1, 20);
    } else if (this._projectionType === ProjectionType.Orthographic) {
      this._projection = Matrix4x4.ortho(-this._aspect, this._aspect, -1.0, 1.0, -1.0, 1.0);
    }
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
    return this._view.multiply(this._projection);
  }
}

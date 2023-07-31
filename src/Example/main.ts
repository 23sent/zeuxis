import { Camera, Color, Matrix4x4, Mesh, Renderer, Vector3, Vector4, Vertex } from '../Zeuxis';
import { OBJLoader } from '../Zeuxis/loaders';
import { MyShader } from './MyShader';
import { Quaternion } from '../Zeuxis/math/Quaternion';

/**
 * Test Models
 * Cube
 *  https://raw.githubusercontent.com/bulletphysics/bullet3/master/data/cube.obj
 *  https://gist.githubusercontent.com/MaikKlein/0b6d6bb58772c13593d0a0add6004c1c/raw/48cf9c6d1cdd43cc6862d7d34a68114e2b93d497/cube.obj
 * Pyramid
 *  https://raw.githubusercontent.com/erik/obj-viewer/master/models/pyramid.obj
 */

const triangle = Mesh.fromArrays(
  [new Vertex([-0.9, 0, 0.8]), new Vertex([0, 0.5, 0.8]), new Vertex([0.9, 0, 0.8])],
  [0, 1, 2],
);
const triangle2 = Mesh.fromArrays(
  [new Vertex([-0.5, 0, 0], [0, 0]), new Vertex([0.5, 1, 0], [0, 1]), new Vertex([0.5, 0, 0], [1, 0])],
  [0, 1, 2],
);

let cube = new Mesh(0, 0);
let bunny = new Mesh(0, 0);
let face = new Mesh(0, 0);
let texture: ImageData;

class Main {
  private static instance: Main;

  static getInstance(): Main {
    if (!Main.instance) {
      Main.instance = new Main();
    }

    return Main.instance;
  }

  renderer: Renderer = new Renderer(100, 100);
  shader = new MyShader();
  camera = new Camera(Camera.Types.Perspective);
  nextFrameId = 0;
  isRun = false;

  renderCallback: (buffer: Uint8ClampedArray, r: Renderer) => void = (b: Uint8ClampedArray, r: Renderer) =>
    console.log(r.fps);

  private constructor() {
    this.renderer.WIREFRAME = false;
    this.camera.setPosition(new Vector3(0, 0, -2));

    OBJLoader('./assets/cube.obj').then((obj) => {
      cube = Mesh.fromArrays(
        obj.vertices.map((v) => new Vertex(v.position, v.textCoord, v.normal)),
        obj.indices,
      );
    });

    OBJLoader('./assets/african_head.obj').then((obj) => {
      face = Mesh.fromArrays(
        obj.vertices.map((v) => new Vertex(v.position, v.textCoord, v.normal)),
        obj.indices,
      );
    });

    OBJLoader('./assets/bunny.obj').then((obj) => {
      bunny = Mesh.fromArrays(
        obj.vertices.map((v) => new Vertex(v.position, v.textCoord, v.normal)),
        obj.indices,
      );
    });

    // TextureLoader('./assets/container.jpg').then((m) => {
    //   texture = m;
    // });

    this.initControls();
  }

  initControls() {
    document.addEventListener('wheel', (e: WheelEvent) => {
      const v = e.deltaY / 1000;
      this.camera.move(new Vector3(0, 0, v));
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      const cameraSpeed = 0.5 * this.renderer.deltaTime;
      if (e.key === 'w') {
        this.camera.move(new Vector3(0, cameraSpeed, 0));
      }
      if (e.key === 's') {
        this.camera.move(new Vector3(0, -cameraSpeed, 0));
      }
      if (e.key === 'a') {
        this.camera.move(new Vector3(-cameraSpeed, 0, 0));
      }
      if (e.key === 'd') {
        this.camera.move(new Vector3(cameraSpeed, 0, 0));
      }

      if (e.key === 'e') {
        this.camera.rotate(new Vector3(0, -100 * this.renderer.deltaTime, 0));
      }

      if (e.key === 'q') {
        this.camera.rotate(new Vector3(0, 100 * this.renderer.deltaTime, 0));
      }

      if (e.key === '1') {
        this.camera.rotate(new Vector3(-100 * this.renderer.deltaTime, 0, 0));
      }

      if (e.key === '2') {
        this.camera.rotate(new Vector3(100 * this.renderer.deltaTime, 0, 0));
      }
    });
  }

  setViewportSize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.renderer.setViewportSize(w, h);
  }

  setRenderCallback(render: (buffer: Uint8ClampedArray, renderer: Renderer) => void) {
    this.renderCallback = render;
  }

  start() {
    if (this.isRun) return;
    this.shader.transform = Matrix4x4.fromQuaternion(Quaternion.fromEuler(new Vector3(0, 180, 0)));

    this.isRun = true;
    this.run();
  }

  private run() {
    if (!this.isRun) return;

    this.renderer.fillBuffer(new Color(0, 0, 0, 0));

    this.renderer.shader = this.shader;

    // Rotate over time
    // this.shader.transform = this.shader.transform.multiply(
    //   Matrix4x4.fromQuaternion(Quaternion.fromEuler(0, 30 * this.renderer.deltaTime, 0)),
    // );
    this.shader.transformInverseTranspose = this.shader.transform.inverse().transpose();

    this.shader.lightPosition = new Vector3(
      new Vector4(this.shader.lightPosition).multiply(
        Matrix4x4.fromQuaternion(Quaternion.fromEuler(0, 30 * this.renderer.deltaTime, 0)),
      ),
    );

    this.shader.texture = texture;
    this.shader.viewProjectionMatrix = this.camera.getViewProjectionMatrix();

    // this.shader.fragColor = new Color(0, 0, 255);
    // this.renderer.drawMesh(triangle);
    // this.shader.fragColor = new Color(0, 255, 0);
    // this.renderer.drawMesh(triangle2);

    this.shader.fragColor = new Color(255, 0, 0);
    this.renderer.drawMesh(cube);

    // this.shader.fragColor = new Color(255, 255, 0);
    // this.renderer.drawMesh(bunny);

    this.shader.fragColor = new Color(255, 0, 0);
    // this.renderer.drawMesh(face);

    // this.shader.fragColor = new Color(255, 255, 0);
    // this.renderer.drawMesh(bunny);

    // this.shader.fragColor = new Color(255, 0, 0);
    // this.renderer.drawMesh(cube);

    // this.shader.fragColor = new Color(255, 255, 0);
    // this.renderer.drawMesh(bunny);
    // this.renderer.drawMesh(triangle2);

    this.renderCallback(this.renderer.switchBuffer(), this.renderer);

    cancelAnimationFrame(this.nextFrameId);
    this.nextFrameId = requestAnimationFrame(() => this.run());
  }

  stop() {
    this.isRun = false;
    cancelAnimationFrame(this.nextFrameId);
  }
}

export default Main.getInstance();

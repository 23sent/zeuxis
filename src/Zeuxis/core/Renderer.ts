import { Color, Mesh, PerspectiveCamera, OrthographicCamera, Vertex } from '../api';
import { Matrix4x4, Vector2, Vector3, Vector4 } from '../math';

const camera = new OrthographicCamera();
console.log(camera.getViewProjectionMatrix()._data);

document.addEventListener('wheel', (ev: WheelEvent) => {
  const v = ev.deltaY / 1000;
  // camera.setPosition(new Vector3(camera.position.x + v, 0, 0));
  // console.log(camera.position.x);

  camera.setPosition(new Vector3(0, 0, camera.position.z + v));
  console.log(camera.position.z);
});

export class Renderer {
  buffer: Uint8ClampedArray;

  constructor(public width: number, public height: number) {
    this.buffer = new Uint8ClampedArray(width * height * 4);
  }

  clearBuffer(): void {
    for (let i = 0; i < this.buffer.length; i++) this.buffer[i] = 0;
  }

  fillBuffer(color: Color): void {
    for (let i = 0; i < this.buffer.length; i += 4) {
      this.buffer[i] = color.red;
      this.buffer[i + 1] = color.green;
      this.buffer[i + 2] = color.blue;
      this.buffer[i + 3] = color.alpha;
    }
  }

  // TODO: Not working properly
  // Check vector * matrix operation
  // Check model -> view -> projection transformation
  drawMesh(mesh: Mesh<Vertex>): void {
    for (let i = 0; i < mesh.indicies.length; i++) {
      const vertexIndex = mesh.indicies[i];
      const vertex = mesh.verticies[vertexIndex];

      // To Camera Space
      const pCamera = camera.getViewProjectionMatrix().multiplyVec4(new Vector4(vertex.position));
      console.log(pCamera.w);

      // To Screen Space
      const pScreen = new Vector2(pCamera.x / pCamera.z, pCamera.y / pCamera.z);
      // console.log(pScreen);

      if (Math.abs(pScreen.x) > this.width || Math.abs(pScreen.y) > this.height) continue;

      // To Normalized device coordinates
      const pNDC = new Vector2((pScreen.x + this.width / 2) / this.width, (pScreen.y + this.height / 2) / this.height);

      // To rasterized coordinates
      const pRaster = new Vector2(Math.floor(pNDC.x * this.width), Math.floor((1 - pNDC.y) * this.height));

      const bufferIndex = ((pRaster.y + 1) * this.width + (pRaster.x + 1)) * 4;

      this.buffer[bufferIndex + 0] = 255;
      this.buffer[bufferIndex + 1] = 0;
      this.buffer[bufferIndex + 2] = 0;
      this.buffer[bufferIndex + 3] = 255;
    }
  }

  switchBuffer(): Uint8ClampedArray {
    return this.buffer;
  }
}

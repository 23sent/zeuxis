import { Color, Mesh, Vertex } from '../api';

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

  drawMesh(mesh: Mesh<Vertex>): void {
    for (let i = 0; i < mesh.indicies.length; i++) {
      const vertexIndex = mesh.indicies[i];
      const vertex = mesh.verticies[vertexIndex];
      const pixelX = (this.width / 2) * vertex.position[0] + this.width / 2;
      const pixelY = (this.height / 2) * vertex.position[1] + this.height / 2;
      const bufferIndex = ((pixelY + 1) * this.width + (pixelX + 1)) * 4;

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

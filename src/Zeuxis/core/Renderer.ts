import { Color, Mesh, Vertex } from '../api';
import { Vector2, Vector3, Vector4 } from '../math';
import { Shader } from './Shader';

/**
 * Resources
 * https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix
 *
 */

export class Renderer {
  buffer: Uint8ClampedArray = new Uint8ClampedArray();
  zBuffer: Float32Array = new Float32Array();
  shader: Shader = new Shader();

  constructor(public width: number, public height: number) {
    this.setViewportSize(width, height);
  }

  setViewportSize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.buffer = new Uint8ClampedArray(width * height * 4);
    this.zBuffer = new Float32Array(width * height);

    this.clearDepthBuffer();
  }

  clearDepthBuffer() {
    for (let i = 0; i < this.zBuffer.length; i++) this.zBuffer[i] = Infinity;
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

  getBarycentricCoords(a: Vector3, b: Vector3, c: Vector3, p: Vector3): Vector3 {
    const v0 = b.substract(a);
    const v1 = c.substract(a);
    const v2 = p.substract(a);
    const d00 = v0.dot(v0);
    const d01 = v0.dot(v1);
    const d11 = v1.dot(v1);
    const d20 = v2.dot(v0);
    const d21 = v2.dot(v1);
    const det = d00 * d11 - d01 * d01;
    const v = (d11 * d20 - d01 * d21) / det;
    const w = (d00 * d21 - d01 * d20) / det;
    const u = 1.0 - v - w;
    return new Vector3(u, v, w);
  }

  drawMesh(mesh: Mesh<Vertex>): void {
    loop: for (let i = 0; i < mesh.indicies.length; i += 3) {
      const corners = new Array<Vector3>(3);
      const v1 = mesh.verticies[mesh.indicies[i + 0]];
      const v2 = mesh.verticies[mesh.indicies[i + 1]];
      const v3 = mesh.verticies[mesh.indicies[i + 2]];

      for (let j = 0; j < 3; j++) {
        const vertexIndex = mesh.indicies[i + j];
        const vertex = mesh.verticies[vertexIndex];
        this.drawPoint(vertex);

        // Apply Vertex Shader
        const vsOutput = this.shader.vertexShader(vertex);
        const clipSpace = vsOutput.clip_space_position;

        // if (
        //   clipSpace.w <= 0 ||
        //   clipSpace.x < -clipSpace.w ||
        //   clipSpace.x > clipSpace.w ||
        //   clipSpace.y < -clipSpace.w ||
        //   clipSpace.y > clipSpace.w ||
        //   clipSpace.z < -clipSpace.w ||
        //   clipSpace.z > clipSpace.w
        // ) {
        //   continue loop;
        // }

        if (clipSpace.w <= 0 || clipSpace.z < -clipSpace.w || clipSpace.z > clipSpace.w) {
          continue loop;
        }

        // To Normalized Display Coordinates space
        const NDCSpace = new Vector3(
          clipSpace.x / clipSpace.w,
          clipSpace.y / clipSpace.w,
          clipSpace.z / clipSpace.w,
        );

        // To rasterized coordinates
        const rasterSpace = new Vector3(
          Math.floor((NDCSpace.x + 1) * 0.5 * (this.width - 1)),
          Math.floor((1 - (NDCSpace.y + 1) * 0.5) * (this.height - 1)),
          NDCSpace.z,
        );

        corners[j] = rasterSpace;
      }

      const point = new Vector3();
      for (let index = 0; index < this.buffer.length; index += 4) {
        const pixelIndex = index / 4;
        point.x = pixelIndex % this.width;
        point.y = Math.floor(pixelIndex / this.height);

        const barycentric = this.getBarycentricCoords(corners[0], corners[1], corners[2], point);
        point.z = barycentric.x * corners[0].z + barycentric.y * corners[1].z + barycentric.z * corners[2].z;

        if (barycentric.x >= 0 && barycentric.y >= 0 && barycentric.z >= 0) {
          let uv;
          if (v1.texCoord && v2.texCoord && v3.texCoord) {
            uv = new Vector2(
              barycentric.x * v1.texCoord.x + barycentric.y * v2.texCoord.x + barycentric.z * v3.texCoord.x,
              barycentric.x * v1.texCoord.y + barycentric.y * v2.texCoord.y + barycentric.z * v3.texCoord.y,
            );
          }
          const fsOutput = this.shader.fragmentShader({ uv: uv });
          const color = fsOutput.fragment_color;

          if (this.zBuffer[pixelIndex] < point.z) continue;
          else this.zBuffer[pixelIndex] = point.z;

          this.buffer[index + 0] = color.red;
          this.buffer[index + 1] = color.green;
          this.buffer[index + 2] = color.blue;
          this.buffer[index + 3] = color.alpha;
        }
      }
    }
  }

  drawPoint(vertex: Vertex) {
    // Apply Vertex Shader
    const vsOutput = this.shader.vertexShader(vertex);
    const clipSpace = vsOutput.clip_space_position;

    if (
      clipSpace.w <= 0 ||
      clipSpace.x < -clipSpace.w ||
      clipSpace.x > clipSpace.w ||
      clipSpace.y < -clipSpace.w ||
      clipSpace.y > clipSpace.w ||
      clipSpace.z < -clipSpace.w ||
      clipSpace.z > clipSpace.w
    )
      return;

    // To Normalized Display Coordinates space
    const NDCSpace = new Vector3(
      clipSpace.x / clipSpace.w,
      clipSpace.y / clipSpace.w,
      clipSpace.z / clipSpace.w,
    );

    // To rasterized coordinates
    const rasterSpace = new Vector2(
      Math.floor((NDCSpace.x + 1) * 0.5 * (this.width - 1)),
      Math.floor((1 - (NDCSpace.y + 1) * 0.5) * (this.height - 1)),
    );

    // Draw Point
    const bufferIndex = (rasterSpace.y * this.width + rasterSpace.x) * 4;

    //  Apply fragment shader
    const fsOutput = this.shader.fragmentShader({});
    const color = fsOutput.fragment_color;

    this.buffer[bufferIndex + 0] = color.red;
    this.buffer[bufferIndex + 1] = color.green;
    this.buffer[bufferIndex + 2] = color.blue;
    this.buffer[bufferIndex + 3] = color.alpha;
  }

  switchBuffer(): Uint8ClampedArray {
    this.clearDepthBuffer();
    return this.buffer;
  }
}

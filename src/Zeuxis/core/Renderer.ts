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
      // Verticies
      const v1 = mesh.verticies[mesh.indicies[i + 0]];
      const v2 = mesh.verticies[mesh.indicies[i + 1]];
      const v3 = mesh.verticies[mesh.indicies[i + 2]];

      // Apply vertex shader
      const vsOutput1 = this.shader.vertexShader(v1);
      const vsOutput2 = this.shader.vertexShader(v2);
      const vsOutput3 = this.shader.vertexShader(v3);

      // Clip Space Coordinates
      const c1 = vsOutput1.clip_space_position;
      const c2 = vsOutput2.clip_space_position;
      const c3 = vsOutput3.clip_space_position;

      // Clip triangle if at least one vertex is outisde
      if (c1.w <= 0 || c1.z < -c1.w || c1.z > c1.w) continue loop;
      if (c2.w <= 0 || c2.z < -c2.w || c2.z > c2.w) continue loop;
      if (c3.w <= 0 || c3.z < -c3.w || c3.z > c3.w) continue loop;

      // If texture coords exists
      let t1, t2, t3;
      if (v1.texCoord && v2.texCoord && v3.texCoord) {
        t1 = new Vector3(v1.texCoord, 1).divide(c1.w);
        t2 = new Vector3(v2.texCoord, 1).divide(c2.w);
        t3 = new Vector3(v3.texCoord, 1).divide(c3.w);
      }

      // Normalized Display Coordinates (ranges:  x[-1, 1], y[-1, 1], z[-1, 1],  left handed)
      const n1 = new Vector3(c1.x / c1.w, c1.y / c1.w, c1.z / c1.w);
      const n2 = new Vector3(c2.x / c2.w, c2.y / c2.w, c2.z / c2.w);
      const n3 = new Vector3(c3.x / c3.w, c3.y / c3.w, c3.z / c3.w);

      // Screen Space Coordinates
      const r1 = new Vector3(
        Math.floor((n1.x + 1) * 0.5 * (this.width - 1)),
        Math.floor((1 - (n1.y + 1) * 0.5) * (this.height - 1)),
        n1.z,
      );
      const r2 = new Vector3(
        Math.floor((n2.x + 1) * 0.5 * (this.width - 1)),
        Math.floor((1 - (n2.y + 1) * 0.5) * (this.height - 1)),
        n2.z,
      );
      const r3 = new Vector3(
        Math.floor((n3.x + 1) * 0.5 * (this.width - 1)),
        Math.floor((1 - (n3.y + 1) * 0.5) * (this.height - 1)),
        n3.z,
      );

      // Bounding box of triangle
      const minX = Math.min(r1.x, r2.x, r3.x);
      const maxX = Math.max(r1.x, r2.x, r3.x);
      const minY = Math.min(r1.y, r2.y, r3.y);
      const maxY = Math.max(r1.y, r2.y, r3.y);
      const startPixelIndex = Math.max(0, Math.min(this.buffer.length, (minY * this.width + minX) * 4));
      const endPixelIndex = Math.max(0, Math.min(this.buffer.length, (maxY * this.width + maxX) * 4));

      for (let index = startPixelIndex; index < endPixelIndex; index += 4) {
        const pixelIndex = index / 4;

        const point = new Vector3();
        point.x = pixelIndex % this.width;
        point.y = Math.floor(pixelIndex / this.height);

        const barycentric = this.getBarycentricCoords(r1, r2, r3, point);
        point.z = barycentric.x * r1.z + barycentric.y * r2.z + barycentric.z * r3.z;

        if (barycentric.x >= 0 && barycentric.y >= 0 && barycentric.z >= 0) {
          let uv;
          if (t1 && t2 && t3) {
            // perpective correct interpolation for texture
            const wt = barycentric.x * t1.z + barycentric.y * t2.z + barycentric.z * t3.z;
            uv = new Vector2(
              (barycentric.x * t1.x + barycentric.y * t2.x + barycentric.z * t3.x) / wt,
              (barycentric.x * t1.y + barycentric.y * t2.y + barycentric.z * t3.y) / wt,
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

  drawLine(v1: Vertex, v2: Vertex) {}

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

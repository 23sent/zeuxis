import { Color, Mesh, Vertex } from '../api';
import { Vector2, Vector3, Vector4 } from '../math';
import { Shader } from './Shader';

/**
 * Resources
 *    https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix
 *    https://medium.com/@aminere/software-rendering-from-scratch-f60127a7cd58
 *
 *  Clipping
 *    https://fabiensanglard.net/polygon_codec/clippingdocument/Clipping.pdf
 *    https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=497a973878c87e357ff4741b394eb106eb510177
 */

export class Renderer {
  buffer: Uint8ClampedArray = new Uint8ClampedArray();
  zBuffer: Float32Array = new Float32Array();
  shader: Shader = new Shader();

  deltaTime: number = 1;
  lastTime: number = 0;
  fps: number = 0;
  frameCount: number = 0;
  elapsedTime: number = 0;

  WIREFRAME = false;

  RASTERIZATION_ALGORITHM: 'BARYCENTRIC' | 'EDGE_WALKING' = 'BARYCENTRIC';

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
    for (let i = 0; i < mesh.indicies.length; i += 3) {
      // Verticies
      const v1 = mesh.verticies[mesh.indicies[i + 0]];
      const v2 = mesh.verticies[mesh.indicies[i + 1]];
      const v3 = mesh.verticies[mesh.indicies[i + 2]];

      this.vertexShading(v1, v2, v3);
    }
  }

  private vertexShading(v1: Vertex, v2: Vertex, v3: Vertex) {
    // Apply vertex shader
    v1._vsOutput = this.shader.vertexShader(v1);
    v2._vsOutput = this.shader.vertexShader(v2);
    v3._vsOutput = this.shader.vertexShader(v3);

    this.vertexPostProcess(v1, v2, v3);
  }

  private vertexPostProcess(v1: Vertex, v2: Vertex, v3: Vertex) {
    if (!v1._vsOutput || !v2._vsOutput || !v3._vsOutput) return;

    // Clip Space Coordinates
    const c1 = v1._vsOutput.clip_space_position;
    const c2 = v2._vsOutput.clip_space_position;
    const c3 = v3._vsOutput.clip_space_position;

    const c1IsOutside =
      c1.w <= 0 || c1.x < -c1.w || c1.x > c1.w || c1.y < -c1.w || c1.y > c1.w || c1.z < -c1.w || c1.z > c1.w;
    const c2IsOutside =
      c2.w <= 0 || c2.x < -c2.w || c2.x > c2.w || c2.y < -c2.w || c2.y > c2.w || c2.z < -c2.w || c2.z > c2.w;
    const c3IsOutside =
      c3.w <= 0 || c3.x < -c3.w || c3.x > c3.w || c3.y < -c3.w || c3.y > c3.w || c3.z < -c3.w || c3.z > c3.w;

    if (c1IsOutside && c2IsOutside && c3IsOutside) return;
    else if (!c1IsOutside && !c2IsOutside && !c3IsOutside) this.rasterization(v1, v2, v3);
    // TODO: CLIPPING USING HOMOGENEOUS COORDINATES

    // this.rasterization(v1, v2, v3);
  }

  private rasterization(v1: Vertex, v2: Vertex, v3: Vertex) {
    if (!v1._vsOutput || !v2._vsOutput || !v3._vsOutput) return;

    // Clip Space Coordinates
    const c1 = v1._vsOutput.clip_space_position;
    const c2 = v2._vsOutput.clip_space_position;
    const c3 = v3._vsOutput.clip_space_position;

    // Normalized Display Coordinates (ranges:  x[-1, 1], y[-1, 1], z[-1, 1],  left handed)
    const n1 = new Vector3(c1.x / c1.w, c1.y / c1.w, c1.z / c1.w);
    const n2 = new Vector3(c2.x / c2.w, c2.y / c2.w, c2.z / c2.w);
    const n3 = new Vector3(c3.x / c3.w, c3.y / c3.w, c3.z / c3.w);

    // Caculate face normal
    const faceNormal = n2.substract(n1).cross(n3.substract(n1));
    // Apply back-face culling
    if (faceNormal.z > 0) {
      return;
    }

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

    if (this.WIREFRAME) {
      // Bresenham's line drawing algorithm
      this.rasterizeLine(r1, r2);
      this.rasterizeLine(r2, r3);
      this.rasterizeLine(r3, r1);
    } else if (this.RASTERIZATION_ALGORITHM === 'EDGE_WALKING') {
      // TODO
    } else if (this.RASTERIZATION_ALGORITHM === 'BARYCENTRIC') {
      // Edge Equation Testing rasterization

      // Bounding box of triangle
      const minX = Math.min(r1.x, r2.x, r3.x);
      const maxX = Math.max(r1.x, r2.x, r3.x);
      const minY = Math.min(r1.y, r2.y, r3.y);
      const maxY = Math.max(r1.y, r2.y, r3.y);
      const startPixelIndex = Math.max(0, Math.min(this.buffer.length, (minY * this.width + minX) * 4));
      const endPixelIndex = Math.max(0, Math.min(this.buffer.length, (maxY * this.width + maxX) * 4));

      // Calculate interpolated vertex shader outputs for every fragment
      // and pass them to fragment shader
      for (let index = startPixelIndex; index < endPixelIndex; index += 4) {
        const pixelIndex = index / 4;

        const point = new Vector3();
        point.x = pixelIndex % this.width;
        point.y = Math.floor(pixelIndex / this.height);

        const barycentric = this.getBarycentricCoords(r1, r2, r3, point);
        point.z = barycentric.x * r1.z + barycentric.y * r2.z + barycentric.z * r3.z;

        if (barycentric.x >= 0 && barycentric.y >= 0 && barycentric.z >= 0) {
          // Apply perspective correct interpolation for vertex shader outputs
          const fragmentShaderInput: any = {};
          for (let key in v1._vsOutput) {
            const k1 = v1._vsOutput[key];
            const k2 = v2._vsOutput[key];
            const k3 = v3._vsOutput[key];
            if (k1 instanceof Vector2 && k2 instanceof Vector2 && k3 instanceof Vector2) {
              const i1 = new Vector3(k1.x / c1.w, k1.y / c1.w, 1 / c1.w);
              const i2 = new Vector3(k2.x / c1.w, k2.y / c1.w, 1 / c1.w);
              const i3 = new Vector3(k3.x / c1.w, k3.y / c1.w, 1 / c1.w);
              const wt = barycentric.x * i1.z + barycentric.y * i2.z + barycentric.z * i3.z;

              fragmentShaderInput[key] = new Vector3(
                (barycentric.x * i1.x + barycentric.y * i2.x + barycentric.z * i3.x) / wt,
                (barycentric.x * i1.y + barycentric.y * i2.y + barycentric.z * i3.y) / wt,
              );
            }
          }

          this.fragmentShading(point, fragmentShaderInput);
        }
      }
    }
  }

  fragmentShading(fragment: Vector3, fragmentShaderInput: any) {
    const pixelIndex = fragment.y * this.width + fragment.x;
    const bufferIndex = pixelIndex * 4;
    // Fragment Shading
    const fsOutput = this.shader.fragmentShader(fragmentShaderInput);
    const color = fsOutput.fragment_color;

    // TODO: Color blending
    // Per-Sample operations
    if (this.zBuffer[pixelIndex] < fragment.z) return;
    else this.zBuffer[pixelIndex] = fragment.z;

    this.buffer[bufferIndex + 0] = color.red;
    this.buffer[bufferIndex + 1] = color.green;
    this.buffer[bufferIndex + 2] = color.blue;
    this.buffer[bufferIndex + 3] = color.alpha;
  }

  // Mostly for debug
  rasterizeLine(r1: Vector3, r2: Vector3, color: Color = new Color(0, 0, 0)) {
    let x0 = r1.x,
      y0 = r1.y;
    let x1 = r2.x,
      y1 = r2.y;

    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;

    while (true && y0 < this.height && x0 < this.width) {
      this.fragmentShading(new Vector3(x0, y0, 1), {});

      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * error;
      if (e2 >= dy) {
        if (x0 === x1) break;
        error = error + dy;
        x0 = x0 + sx;
      }
      if (e2 <= dx) {
        if (y0 === y1) break;
        error = error + dx;
        y0 = y0 + sy;
      }
    }
  }

  // Only for debug
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

    const bufferIndex = (rasterSpace.y * this.width + rasterSpace.x) * 4;

    //  Apply fragment shader
    const fsOutput = this.shader.fragmentShader({});
    // const color = fsOutput.fragment_color;
    const color = new Color(255, 0, 0);

    // Apply per-sample operations
    this.buffer[bufferIndex + 0] = color.red;
    this.buffer[bufferIndex + 1] = color.green;
    this.buffer[bufferIndex + 2] = color.blue;
    this.buffer[bufferIndex + 3] = color.alpha;
  }

  switchBuffer(): Uint8ClampedArray {
    this.clearDepthBuffer();

    const time = performance.now();
    this.deltaTime = (time - this.lastTime) / 1000;
    this.fps = 1 / this.deltaTime;
    this.frameCount += 1;
    this.lastTime = time;

    return this.buffer;
  }
}

import { Color, Mesh, Vertex } from '../api';
import { Vector2, Vector3, Vector4 } from '../math';
import { Shader } from './Shader';

/**
 * Resources
 * https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix
 *
 */

export class Renderer {
  // TODO: depth buffer

  buffer: Uint8ClampedArray;

  private _shader: Shader = new Shader();

  constructor(public width: number, public height: number) {
    this.buffer = new Uint8ClampedArray(width * height * 4);
  }

  get shader(): Shader {
    return this._shader;
  }

  set shader(s: Shader) {
    this._shader = s;
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

  edgeFunction(a: Vector2, b: Vector2, c: Vector2): boolean {
    return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x) <= 0;
  }

  drawMesh(mesh: Mesh<Vertex>): void {
    loop: for (let i = 0; i < mesh.indicies.length; i += 3) {
      const corners = new Array<Vector2>(3);

      for (let j = 0; j < 3; j++) {
        const vertexIndex = mesh.indicies[i + j];
        const vertex = mesh.verticies[vertexIndex];
        this.drawPoint(vertex);

        // Apply Vertex Shader
        const vsOutput = this._shader.vertexShader(vertex);
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
        const rasterSpace = new Vector2(
          Math.floor((NDCSpace.x + 1) * 0.5 * (this.width - 1)),
          Math.floor((1 - (NDCSpace.y + 1) * 0.5) * (this.height - 1)),
        );

        corners[j] = rasterSpace;
      }

      // Draw Point
      // const bufferIndex = (rasterSpace.y * this.width + rasterSpace.x) * 4;

      // // Apply fragment shader
      // const fsOutput = this._shader.fragmentShader(vsOutput);
      // const color = fsOutput.fragment_color;

      // this.buffer[bufferIndex + 0] = color.red;
      // this.buffer[bufferIndex + 1] = color.green;
      // this.buffer[bufferIndex + 2] = color.blue;
      // this.buffer[bufferIndex + 3] = color.alpha;

      const point = new Vector2();
      for (let index = 0; index < this.buffer.length; index += 4) {
        const i = index / 4;
        point.x = i % this.width;
        point.y = Math.floor(i / this.height);

        let inside = true;
        inside = inside && this.edgeFunction(corners[0], corners[1], point);
        inside = inside && this.edgeFunction(corners[1], corners[2], point);
        inside = inside && this.edgeFunction(corners[2], corners[0], point);

        const fsOutput = this._shader.fragmentShader({ clip_space_position: new Vector4() });
        const color = fsOutput.fragment_color;

        if (inside) {
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
    const vsOutput = this._shader.vertexShader(vertex);
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
    const fsOutput = this._shader.fragmentShader(vsOutput);
    const color = fsOutput.fragment_color;

    this.buffer[bufferIndex + 0] = color.red;
    this.buffer[bufferIndex + 1] = color.green;
    this.buffer[bufferIndex + 2] = color.blue;
    this.buffer[bufferIndex + 3] = color.alpha;
  }

  switchBuffer(): Uint8ClampedArray {
    return this.buffer;
  }
}

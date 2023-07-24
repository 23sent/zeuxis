import {
  Color,
  FragmentShaderOutput,
  Matrix4x4,
  Shader,
  Vector2,
  Vector4,
  Vertex,
  VertexShaderOutput,
} from '../Zeuxis';

export class MyShader extends Shader {
  // Uniform Variables
  transform: Matrix4x4 = new Matrix4x4();
  viewProjectionMatrix: Matrix4x4 = new Matrix4x4();
  fragColor: Color = new Color(0, 0, 0, 255);
  texture?: ImageData;

  // Shaders
  vertexShader(vertex: Vertex): VertexShaderOutput {
    // To Clip Space
    const clipSpace = new Vector4(vertex.position).multiply(
      this.transform.multiply(this.viewProjectionMatrix),
    );

    return {
      clip_space_position: clipSpace,
      texture_coords: vertex.texCoord,
    };
  }

  fragmentShader({ texture_coords }: any): FragmentShaderOutput {
    let fragment_color = this.fragColor;

    if (this.texture && texture_coords) {
      const tx = new Vector2(
        Math.floor(texture_coords.x * this.texture?.width),
        Math.floor(texture_coords.y * this.texture?.height),
      );
      const index = (tx.y * this.texture.width + tx.x) * 4;

      fragment_color = new Color(
        this.texture.data[index + 0],
        this.texture.data[index + 1],
        this.texture.data[index + 2],
        this.texture.data[index + 3],
      );
    }
    return {
      fragment_color,
    };
  }
}

import {
  Color,
  FragmentShaderOutput,
  Matrix4x4,
  Shader,
  Vector4,
  Vertex,
  VertexShaderOutput,
} from '../Zeuxis';

export class MyShader extends Shader {
  // Uniform Variables
  viewProjectionMatrix: Matrix4x4 = new Matrix4x4();
  fragColor: Color = new Color(0, 0, 0, 255);

  // Shaders
  vertexShader(vertex: Vertex): VertexShaderOutput {
    // To Clip Space
    const clipSpace = new Vector4(vertex.position).multiply(this.viewProjectionMatrix);

    return {
      clip_space_position: clipSpace,
    };
  }

  fragmentShader(input: VertexShaderOutput): FragmentShaderOutput {
    return {
      fragment_color: this.fragColor,
    };
  }
}

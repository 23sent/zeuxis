import { Color, Vertex } from '../api';
import { Vector4 } from '../math';

export interface VertexShaderOutput {
  clip_space_position: Vector4;
  [x: string | number | symbol]: unknown;
}

export interface FragmentShaderOutput {
  fragment_color: Color;
}

export class Shader {
  vertexShader(vertex: Vertex): VertexShaderOutput {
    return {
      clip_space_position: new Vector4(vertex.position),
    };
  }

  fragmentShader(input: any): FragmentShaderOutput {
    return { fragment_color: new Color(0, 0, 0) };
  }
}

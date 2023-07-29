import {
  Color,
  FragmentShaderOutput,
  Matrix4x4,
  Shader,
  Vector2,
  Vector3,
  Vector4,
  Vertex,
  VertexShaderOutput,
} from '../Zeuxis';

export class MyShader extends Shader {
  // Uniform Variables
  transform: Matrix4x4 = new Matrix4x4();
  transformInverseTranspose: Matrix4x4 = new Matrix4x4();

  viewProjectionMatrix: Matrix4x4 = new Matrix4x4();
  fragColor: Color = new Color(0, 0, 0, 255);
  texture?: ImageData;
  viewProjectionMIT: Matrix4x4 = new Matrix4x4();

  lightPosition: Vector3 = new Vector3(0, 5, -15);
  lightColor: Color = new Color(1, 0, 0);

  // Shaders
  vertexShader(vertex: Vertex): VertexShaderOutput {
    // To Clip Space
    const clipSpace = new Vector4(vertex.position).multiply(this.transform.multiply(this.viewProjectionMatrix));

    const fragmentPosition = new Vector4(vertex.position).multiply(this.transform);

    const normal = new Vector4(vertex.normal).multiply(this.transformInverseTranspose);

    return {
      clip_space_position: clipSpace,
      texture_coords: vertex.texCoord,
      normal_coords: new Vector3(normal),
      frag_position: new Vector3(fragmentPosition),
    };
  }

  fragmentShader({ texture_coords, normal_coords, frag_position }: any): FragmentShaderOutput {
    let fragment_color = this.fragColor;

    // Off texture for now
    // if (this.texture && texture_coords) {
    //   const tx = new Vector2(
    //     Math.floor(texture_coords.x * this.texture?.width),
    //     Math.floor(texture_coords.y * this.texture?.height),
    //   );
    //   const index = (tx.y * this.texture.width + tx.x) * 4;

    //   fragment_color = new Color(
    //     this.texture.data[index + 0],
    //     this.texture.data[index + 1],
    //     this.texture.data[index + 2],
    //     this.texture.data[index + 3],
    //   );
    // }

    if (normal_coords && frag_position) {
      // Ambiant Light Example
      const ambientStrength = 0.004;
      const ambiant = new Vector3(10, 0, 0).multiply(ambientStrength);
      // const color = ambiant.multiply(new Vector3(fragment_color.r, fragment_color.g, fragment_color.b));
      // fragment_color = new Color(color.x, color.y, color.z, fragment_color.a);

      // diffuse light example
      const normal = normal_coords.normalized();
      const lightDir = this.lightPosition.substract(frag_position).normalized();
      const diff = Math.max(lightDir.dot(normal), 0);
      const diffuse = this.lightColor.toVec3().multiply(diff);
      // fragment_color = Color.fromVec(diffuse.multiply(fragment_color.toVec3()), fragment_color.alpha);

      const effect = ambiant.add(diffuse);
      fragment_color = Color.fromVec(effect.multiply(fragment_color.toVec3()), fragment_color.alpha);
    }

    return {
      fragment_color,
    };
  }
}

import { FileLoader } from './Loader';

export interface ObjVertex {
  position: number[];
  textCoord?: number[];
  normal?: number[];
}

export interface ObjMesh {
  vertices: ObjVertex[];
  indices: number[];
}

export async function OBJParser(content: string) {
  const lines = content?.split('\n');
  // Store what's in the object file here
  const cachedVertices = [];
  const cachedFaces = [];
  const cachedNormals = [];
  const cachedUvs = [];

  // Read out data from file and store into appropriate source buckets
  for (const untrimmedLine of lines) {
    const line = untrimmedLine.trim(); // remove whitespace
    const [startingChar, ...data] = line.split(/\s+/);
    switch (startingChar) {
      case 'v':
        console.log(data);
        cachedVertices.push(data.map(parseFloat));
        break;
      case 'vt':
        cachedUvs.push(data.map(Number));
        break;
      case 'vn':
        cachedNormals.push(data.map(parseFloat));
        break;
      case 'f':
        cachedFaces.push(data);
        break;
    }
  }

  const cache: any = {};

  const mesh: ObjMesh = { vertices: [], indices: [] };
  for (let face of cachedFaces) {
    for (let vrtxStr of face) {
      vrtxStr = vrtxStr.trim();

      if (cache[vrtxStr] !== undefined) {
        mesh.indices.push(cache[vrtxStr]);
      } else {
        const [vrtx, uv, vn] = vrtxStr.split('/').map((v) => Number(v));

        mesh.vertices.push({
          position: cachedVertices[vrtx - 1],
          textCoord: cachedUvs?.[uv - 1],
          normal: cachedNormals?.[vn - 1],
        });

        mesh.indices.push(mesh.vertices.length - 1);

        cache[vrtxStr] = mesh.vertices.length - 1;
      }
    }
  }

  return mesh;
}

export async function OBJLoader(filepath: string) {
  const content = await FileLoader(filepath);
  return OBJParser(content);
}

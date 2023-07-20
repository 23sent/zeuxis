import { Vertex } from './Vertex';

export class Mesh<T extends Vertex = Vertex> {
  verticies: Array<T>;
  indicies: Uint16Array;

  constructor(vertexCount: number, indexCount: number) {
    this.verticies = new Array(vertexCount);
    this.indicies = new Uint16Array(indexCount);
  }

  static fromArrays<T extends Vertex>(verticies: Array<T>, indicies: Array<number>): Mesh<T> {
    const mesh = new this<T>(verticies.length, indicies.length);
    mesh.verticies = verticies;
    mesh.indicies.set(indicies);
    return mesh;
  }

  getVertex(index: number): T {
    return this.verticies[this.indicies[index]];
  }

  static QuadMesh: Mesh = Mesh.fromArrays(
    [
      new Vertex([+0.5, +0.5, 0.0], [1, 1]),
      new Vertex([+0.5, -0.5, 0.0], [1, 0]),
      new Vertex([-0.5, -0.5, 0.0], [0, 0]),
      new Vertex([-0.5, +0.5, 0.0], [0, 1]),
    ],
    [0, 1, 3, 1, 2, 3],
  );
}

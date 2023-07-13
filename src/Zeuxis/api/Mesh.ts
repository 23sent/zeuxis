import { Vertex } from './Vertex';

export class Mesh<T extends Vertex> {
  verticies: Array<T>;
  indicies: Uint16Array;

  constructor(vertexCount: number, indexCount: number) {
    this.verticies = new Array(vertexCount);
    this.indicies = new Uint16Array(indexCount * 3);
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
}

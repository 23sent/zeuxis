export class Color {
  constructor(public r: number = 0, public g: number = 0, public b: number = 0, public a: number = 255) {}

  get red() {
    return this.r;
  }
  get green() {
    return this.g;
  }
  get blue() {
    return this.b;
  }
  get alpha() {
    return this.a;
  }

  set red(v: number) {
    this.r = v;
  }
  set green(v: number) {
    this.g = v;
  }
  set blue(v: number) {
    this.b = v;
  }
  set alpha(v: number) {
    this.a = v;
  }

  static get black(): Color {
    return Object.freeze(new Color(0, 0, 0));
  }
  static get white(): Color {
    return Object.freeze(new Color(255, 255, 255));
  }
  static get red(): Color {
    return Object.freeze(new Color(255, 0, 0));
  }
  static get green(): Color {
    return Object.freeze(new Color(0, 255, 0));
  }
  static get blue(): Color {
    return Object.freeze(new Color(0, 0, 255));
  }
}

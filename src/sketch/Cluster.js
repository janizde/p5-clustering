export default function (s) {
  return class Cluster {
    constructor(center, color) {
      this.center = center;
      this.color = color;
    }

    draw() {
      s.fill(this.color);
      s.ellipse(this.center.x, this.center.y, 10, 10);
    }
  }
}

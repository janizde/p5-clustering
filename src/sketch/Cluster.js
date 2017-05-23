export default function (s) {
  return class Cluster {
    constructor(center, color) {
      this.center = center;
      this.color = color;
      console.log(color);
    }

    draw() {
      s.fill(this.color);
      s.stroke(s.color(255, 0, 0, 255));
      s.ellipse(this.center.x, this.center.y, 10, 10);
    }
  }
}

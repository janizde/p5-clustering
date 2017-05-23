export default function (s) {
  return class Point {
    constructor(pos) {
      this.pos = pos;
      this.cluster = null;
    };

    get color() {
      if (!this.cluster) {
        return s.color(255, 255, 255, 255);
      }

      return this.cluster.color;
    }

    draw() {
      s.fill(this.color);
      s.noStroke();
      s.ellipse(this.pos.x, this.pos.y, 5, 5);
    }
  }
}

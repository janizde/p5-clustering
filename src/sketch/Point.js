export default function (s) {
  return class Point {

    static OPACITY = 150;

    constructor(pos) {
      this.pos = pos;
      this.cluster = null;
    };

    get color() {
      if (!this.cluster) {
        return s.color(255, 255, 255, Point.OPACITY);
      }

      const c = this.cluster.color;
      return s.color(
        s.red(c),
        s.green(c),
        s.blue(c),
        Point.OPACITY,
      );
    }

    draw() {
      const color = this.color;
      s.noStroke();
      s.fill(color);
      s.ellipse(this.pos.x, this.pos.y, 5, 5);
    }
  }
}

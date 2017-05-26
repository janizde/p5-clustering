export default function (s) {
  return class Cluster {
    constructor(color, point = null) {
      this.color = color;
      this.children = [];
      this.parent = null;
      this.point = point;

      this.points = [];
      this.center = null;
      this.radius = 0;
    }

    lock() {
      this.points = this.retrievePoints();
      this.center = this.createCenter();
      this.radius = this.createRadius();
    }

    retrievePoints() {
      if (this.point) {
        return [this.point];
      }

      return this.children.reduce((points, child) => points.concat(child.retrievePoints()), []);
    }

    createCenter() {
      if (this.point) {
        return this.point.pos;
      }

      return this.points.reduce((center, p) => s.createVector(
        center.x + (p.pos.x / this.points.length),
        center.y + (p.pos.y / this.points.length)
      ), s.createVector(0, 0));
    }

    createRadius(center) {
      return this.points.reduce((r, p) => Math.max(r, p.pos.dist(this.center)), 0);
    }

    draw() {
      if (this.point) {
        s.fill(this.color);
        s.ellipse(this.point.pos.x, this.point.pos.y, 5, 5);
      } else {
        s.fill(s.color(
          s.red(this.color),
          s.green(this.color),
          s.blue(this.color),
          50
        ));

        s.ellipseMode(s.RADIUS);
        s.ellipse(this.center.x, this.center.y, this.radius, this.radius);
        s.ellipseMode(s.CENTER);

        this.children.forEach(c => c.draw());
      }
    }

    merge(other) {
      s.colorMode(s.HSB, 255, 255, 255, 255);
      const color = s.color(
        (s.hue(this.color) + s.hue(other.color)) / 2,
        255,
        255,
        255,
      );

      const cluster = new Cluster(color);
      s.colorMode(s.RGB, 255, 255, 255, 255);
      cluster.children.push(this);
      cluster.children.push(other);

      this.parent = cluster;
      other.parent = cluster;

      cluster.lock();
      return cluster;
    }

    proximitySingleLink(other, matrix) {
      const thisPoints = this.points;
      const otherPoints = other.points;

      let min = Infinity;
      for (let i = 0; i < thisPoints.length; ++i) {
        const pi = thisPoints[i];
        for (let j = 0; j < otherPoints.length; ++j) {
          const pj = otherPoints[j];
          const prox = matrix.get(pi.id, pj.id);

          if (prox < min) {
            min = prox;
          }
        }
      }

      return min;
    }

    static createInitialClusters(points) {
      s.colorMode(s.HSB, 255, 255, 255, 255);
      const clusters = points.map(p => {
        const c = new Cluster(s.color(Math.floor(s.random(256)), 255, 255, 255), p);
        c.lock();
        return c;
      });
      s.colorMode(s.RGB, 255, 255, 255, 255);
      return clusters;
    }
  }
}

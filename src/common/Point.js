export default function (s) {
  return class Point {

    static OPACITY = 200;

    constructor(pos, id = null) {
      this.id = id;
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

    static createRandomPoints(numPoints) {
      const points = [];
      for (let i = 0; i < numPoints; ++i) {
        const x = s.random(s.width);
        const y = s.random(s.height);
        points.push(new Point(s.createVector(x, y), points.length));
      }

      return points;
    }

    static createHotspotPoints(numPoints, numHotspots) {
      if (numHotspots < 1) {
        return Point.createRandomPoints(numPoints);
      }

      const randomVector = () => s.createVector(s.random(s.width), s.random(s.height));
      const distanceBase = s.width / numHotspots;

      const threshold = s.width / (numHotspots * 2);
      const hotspots = [];
      for (let added = 0; added < numHotspots;) {
        const pos = randomVector();

        if (hotspots.findIndex(h => pos.dist(h.pos) < threshold) < 0) {
          hotspots.push({
            pos,
            strength: s.random(),
          });

          added++;
        }
      }

      const points = [];
      for (let added = 0; added < numPoints;) {
        if (s.random() < .05) {
          points.push(new Point(s.createVector(s.random(s.width), s.random(s.height)), points.length));
          added++;
          continue;
        }

        const hotspotIdx = Math.floor(s.random(hotspots.length));
        const h = hotspots[hotspotIdx];

        if (s.random() > h.strength) {
          continue;
        }

        const angle = s.random(s.TWO_PI);
        const direction = s.createVector(s.sin(angle), s.cos(angle));
        const distance = distanceBase * s.random() * h.strength;
        direction.mult(distance);
        const pos = s.createVector(
          h.pos.x + direction.x,
          h.pos.y + direction.y
        );

        points.push(new Point(pos, points.length));
        added++;
      }

      return points;
    }
  }
}

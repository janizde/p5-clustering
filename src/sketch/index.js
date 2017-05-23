import createPointClass from './Point';
import createClusterClass from './Cluster';

export default function sketch(s) {
  const Point = createPointClass(s);
  const Cluster = createClusterClass(s);

  const clusters = [];
  const points = [];
  const k = 3;
  const numPoints = 200;

  const width = 500;
  const height = 500;

  s.setup = () => {
    s.createCanvas(width, height);

    createPoints();
    createClusters();
  };

  s.draw = () => {
    s.background(0);
    points.forEach(p => p.draw());
    clusters.forEach(c => c.draw());
  };

  const createPoints = () => {
    for (let i = 0; i < numPoints; ++i) {
      const x = s.random(width);
      const y = s.random(height);
      points.push(new Point(s.createVector(x, y)));
    }
  };

  const createClusters = () => {
    s.colorMode(s.HSB);
    for (let i = 0; i < k; ++i) {
      const color = s.color(i * 73 % 256, 255, 255, 50);
      const center = points[Math.floor(s.random(points.length))];
      clusters.push(new Cluster(center.pos, color));
    }
    s.colorMode(s.RGB);
  };

  const assignPoints = () => {
    points.forEach(p => {
      let closest = {
        cluster: null,
        distance: Infinity,
      };

      clusters.forEach(c => {
        const dist = c.center.dist(p.pos);
        if (dist < closest.distance) {
          closest = {
            cluster: c,
            distance: dist,
          };
        }
      });

      p.cluster = closest.cluster;
    });
  };
}

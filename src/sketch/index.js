import createPointClass from './Point';
import createClusterClass from './Cluster';

export default function sketch(s) {
  const Point = createPointClass(s);
  const Cluster = createClusterClass(s);

  const clusters = [];
  const points = [];
  const k = 5;
  const numPoints = 2000;

  const width = 500;
  const height = 500;

  const actionsPerFrame = 10;

  let generator;

  s.setup = () => {
    s.createCanvas(width, height);

    createPoints();
    createClusters();

    generator = runner();
  };

  s.draw = () => {
    s.background(0);
    points.forEach(p => p.draw());
    clusters.forEach(c => c.draw());


    for (let i = 0; i < actionsPerFrame; ++i) {
      const result = generator.next();
      if (result.done === true) {
        s.noLoop();
        break;
      }
    }
  };

  const createPoints = () => {
    for (let i = 0; i < numPoints; ++i) {
      const x = s.random(width);
      const y = s.random(height);
      points.push(new Point(s.createVector(x, y)));
    }
  };

  const createClusters = () => {
    s.colorMode(s.HSB, 255, 255, 255, 255);
    for (let i = 0; i < k; ++i) {
      const color = s.color(i * 73 % 256, 255, 255);
      const center = points[Math.floor(s.random(points.length))];
      clusters.push(new Cluster(center.pos, color));
    }
    s.colorMode(s.RGB, 255, 255, 255, 255);
  };

  function* assignPoints () {
    let changes = 0;
    for (let i = 0; i < points.length; ++i) {
      const p = points[i];

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

      const hasChanged = p.cluster !== closest.cluster;

      if (hasChanged) {
        changes++;
      }

      p.cluster = closest.cluster;

      if (hasChanged) {
        yield true;
      }
    }

    return changes;
  }

  function* updateClusterCenters() {
    for (let i = 0; i < clusters.length; ++i) {
      const c = clusters[i];

      const clusterPoints = points.filter(p => p.cluster === c);

      if (clusterPoints.length < 1) {
        continue;
      }

      c.center = clusterPoints.reduce(
        (acc, p) => s.createVector(acc.x + (p.pos.x / clusterPoints.length), acc.y + (p.pos.y / clusterPoints.length)),
        s.createVector(0, 0)
      );

      yield true;
    }
  }

  function* runner () {
    let changes = 0;
    do {
      yield* updateClusterCenters();
      changes = yield* assignPoints();
      console.log(`${changes} changes`);
    } while (changes > 0);
  }
}

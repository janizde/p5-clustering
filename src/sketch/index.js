import State from './State';
import createPointClass from './Point';
import createClusterClass from './Cluster';

export const defaultConfig = {
  NUM_CLUSTERS: 5,
  NUM_POINTS: 50,
  ACTIONS_PER_FRAME: 10,
  CANVAS_SIZE: 750,
};

export function createDefaultSketch() {
  return createSketch(defaultConfig);
}

export default function createSketch(config) {
  const {
    NUM_CLUSTERS,
    NUM_POINTS,
    ACTIONS_PER_FRAME,
    CANVAS_SIZE,
  } = config;

  return function sketch(s) {
    const Point = createPointClass(s);
    const Cluster = createClusterClass(s);

    const clusters = [];
    const points = [];

    const state = new State(['CREATE_POINTS', 'CREATE_CLUSTERS', 'DO_CLUSTERING', 'FINISHED']);

    let generator;

    s.setup = () => {
      s.createCanvas(CANVAS_SIZE, CANVAS_SIZE);

      state.on('ENTER_CREATE_CLUSTERS', () => {
        createClusters();
        state.next();
      });

      state.on('ENTER_DO_CLUSTERING', () => {
        generator = clusterer();
      });

      state.on('ENTER_CREATE_POINTS', () => {
        createRandomPoints();
      });

      const btnFinishPoints = s.createButton('Finish setting points');
      btnFinishPoints.mousePressed(() => {
        state.nextIfCurrent('CREATE_POINTS');
      });

      state.init();
    };

    s.draw = () => {
      s.background(0);
      points.forEach(p => p.draw());
      clusters.forEach(c => c.draw());

      if (state.isCurrent('DO_CLUSTERING')) {
        for (let i = 0; i < ACTIONS_PER_FRAME; ++i) {
          generator.next();
        }
      }
    };

    let lastMousePointPosition = null;
    s.mousePressed = () => {
      const pos = s.createVector(s.mouseX, s.mouseY);
      points.push(new Point(pos));
      lastMousePointPosition = pos;
    };

    s.mouseMoved = () => {
      if (!lastMousePointPosition) {
        return;
      }

      const pos = s.createVector(s.mouseX, s.mouseY);

      if (pos.dist(lastMousePointPosition) < 15) {
        return;
      }

      points.push(new Point(pos));
      lastMousePointPosition = pos;
    };

    s.mouseReleased = () => {
      lastMousePointPosition = null;
    };

    const createRandomPoints = () => {
      for (let i = 0; i < NUM_POINTS; ++i) {
        const x = s.random(CANVAS_SIZE);
        const y = s.random(CANVAS_SIZE);
        points.push(new Point(s.createVector(x, y)));
      }
    };

    const createClusters = () => {
      s.colorMode(s.HSB, 255, 255, 255, 255);
      for (let i = 0; i < NUM_CLUSTERS; ++i) {
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

    function* clusterer () {
      do {
        yield* updateClusterCenters();
        yield* assignPoints();
      } while (true);
    }
  };
}


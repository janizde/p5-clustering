import State from './State';
import createPointClass from './Point';
import createClusterClass from './Cluster';

export const defaultConfig = {
  NUM_CLUSTERS: 5,
  NUM_POINTS: 1000,
  NUM_HOTSPOTS: 5,
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
    NUM_HOTSPOTS,
    ACTIONS_PER_FRAME,
    CANVAS_SIZE,
  } = config;

  return function sketch(s) {
    const Point = createPointClass(s);
    const Cluster = createClusterClass(s);

    const clusters = [];
    let points = [];

    const state = new State(['CREATE_POINTS', 'CREATE_CLUSTERS', 'DO_CLUSTERING', 'FINISHED']);

    let generator;

    /**
     * SETUP
     */
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
        if (NUM_HOTSPOTS >= 1) {
          points = Point.createHotspotPoints(NUM_POINTS, NUM_HOTSPOTS);
        } else {
          points = Point.createRandomPoints(NUM_POINTS);
        }
      });

      const btnFinishPoints = s.createButton('Finish setting points');
      btnFinishPoints.mousePressed(() => {
        state.nextIfCurrent('CREATE_POINTS');
      });

      state.init();
    };

    /**
     * DRAW
     */
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

    /**
     * Mouse actions
     */
    (() => {
      const validatePos = pos => pos.x >= 0 && pos.x <= CANVAS_SIZE && pos.y >= 0 && pos.y <= CANVAS_SIZE;

      let lastMousePointPosition = null;
      s.mousePressed = () => {
        const pos = s.createVector(s.mouseX, s.mouseY);

        if (!validatePos(pos)) {
          return;
        }

        points.push(new Point(pos));
        lastMousePointPosition = pos;
      };

      s.mouseMoved = () => {
        if (!lastMousePointPosition) {
          return;
        }

        const pos = s.createVector(s.mouseX, s.mouseY);

        if (!validatePos(pos)) {
          return;
        }

        if (pos.dist(lastMousePointPosition) < 15) {
          return;
        }

        points.push(new Point(pos));
        lastMousePointPosition = pos;
      };

      s.mouseReleased = () => {
        lastMousePointPosition = null;
      };

    })();

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


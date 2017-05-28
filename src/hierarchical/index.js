import State from './../common/State';
import ProximityMatrix from './ProximityMatrix';
import createPointClass from './../common/Point';
import createClusterClass from './Cluster';

export const defaultConfig = {
  CANVAS_SIZE: 750,
  NUM_POINTS: 0,
  NUM_HOTSPOTS: 5,
  NUM_CLUSTERS: 5,
  DRAW_MODE: 'CIRCLES',
  PROXIMITY_METHOD: 'SINGLE_LINK',
};

export function createDefaultSketch() {
  return createSketch(defaultConfig);
}

export default function createSketch(config) {
  const {
    CANVAS_SIZE,
    NUM_POINTS,
    NUM_HOTSPOTS,
    NUM_CLUSTERS,
    DRAW_MODE,
    PROXIMITY_METHOD,
  } = config;

  return function (s) {
    const Point = createPointClass(s);
    const Cluster = createClusterClass(s);
    const state = new State(['CREATE_POINTS', 'DO_CLUSTERING']);

    let points = [];
    let clusters = [];
    let parentClusters = [];
    let generator;
    let proximityMatrix = null;

    s.setup = () => {
      const canvas = s.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
      canvas.parent('canvas-container');

      setupControls();

      state.on('ENTER_CREATE_POINTS', () => {
        if (NUM_POINTS < 1) {
          return;
        }

        if (NUM_HOTSPOTS < 1) {
          points = Point.createRandomPoints(NUM_POINTS);
        } else {
          points = Point.createHotspotPoints(NUM_POINTS, NUM_HOTSPOTS);
        }
      });

      state.on('LEAVE_CREATE_POINTS', () => {
        clusters = Cluster.createInitialClusters(points);
        parentClusters = clusters.slice();
        proximityMatrix = ProximityMatrix.createFromPoints(points);
      });

      state.init();

      generator = clusterer();
    };

    s.draw = () => {
      s.background(s.color(0, 0, 0, 255));

      if (state.isCurrent('CREATE_POINTS')) {
        points.forEach(p => p.draw());
      } else {
        parentClusters.forEach(c => c.draw(null, DRAW_MODE));
        generator.next();
      }
    };

    function* clusterer() {
      while (parentClusters.length > NUM_CLUSTERS) {
        let closest = {
          i: null,
          j: null,
          prox: Infinity,
        };

        for (let i = 0; i < parentClusters.length; ++i) {
          for (let j = 0; j < i; ++j) {
            const ci = parentClusters[i];
            const cj = parentClusters[j];

            let prox;
            switch (PROXIMITY_METHOD) {
              case 'COMPLETE_LINK':
                prox = ci.proximityCompleteLink(cj, proximityMatrix);
                break;

              case 'AVERAGE':
                prox = ci.proximityAverage(cj, proximityMatrix);
                break;

              case 'CENTROIDS':
                prox = ci.proximityCentroid(cj);
                break;

              default:
                prox = ci.proximitySingleLink(cj, proximityMatrix);
                break;
            }

            if (prox < closest.prox) {
              closest = { i, j, prox };
            }
          }
        }

        const ci = parentClusters[closest.i];
        const cj = parentClusters[closest.j];
        const merged = ci.merge(cj);
        parentClusters.splice(closest.i, 1);
        parentClusters.splice(closest.j, 1);
        parentClusters.push(merged);

        yield true;
      }
    }

    /**
     * Mouse actions
     */
    (() => {
      const validatePos = pos => pos.x >= 0 && pos.x <= CANVAS_SIZE && pos.y >= 0 && pos.y <= CANVAS_SIZE;

      let lastMousePointPosition = null;
      s.mousePressed = () => {
        if (!state.isCurrent('CREATE_POINTS')) {
          return;
        }

        const pos = s.createVector(s.mouseX, s.mouseY);

        if (!validatePos(pos)) {
          return;
        }

        points.push(new Point(pos, points.length));
        lastMousePointPosition = pos;
      };

      s.mouseMoved = () => {
        if (
          !state.isCurrent('CREATE_POINTS')
          || !lastMousePointPosition
        ) {
          return;
        }

        const pos = s.createVector(s.mouseX, s.mouseY);

        if (!validatePos(pos)) {
          return;
        }

        if (pos.dist(lastMousePointPosition) < 15) {
          return;
        }

        points.push(new Point(pos, points.length));
        lastMousePointPosition = pos;
      };

      s.mouseReleased = () => {
        lastMousePointPosition = null;
      };
    })();

    function setupControls() {
      const instruction = s.createP();
      instruction.parent('controls');
      const buttonNext = s.createButton();
      buttonNext.parent('controls');

      let onClick = () => {};

      buttonNext.mousePressed(() => onClick());

      state.on('ENTER_CREATE_POINTS', () => {
        instruction.html('Click in the canvas or drag the mouse to create new points.');
        buttonNext.html('Start clustering');
        onClick = () => {
          state.nextIfCurrent('CREATE_POINTS');
        };
      });

      state.on('LEAVE_CREATE_POINTS', () => {
        onClick = null;
        instruction.remove();
        buttonNext.remove();
      });
    }
  };
}

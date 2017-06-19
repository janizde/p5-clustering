import State from './../common/State';
import ProximityMatrix from './ProximityMatrix';
import createPointClass from './../common/Point';
import createClusterClass from './Cluster';

export const defaultConfig = {
  CANVAS_SIZE: 750,
  NUM_POINTS: 0,
  NUM_HOTSPOTS: 5,
  HOTSPOT_NOISE: .05,
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
    HOTSPOT_NOISE,
    NUM_CLUSTERS,
    DRAW_MODE,
    PROXIMITY_METHOD,
  } = config;

  return function (s) {
    const Point = createPointClass(s);
    const Cluster = createClusterClass(s);
    const state = new State(['CREATE_POINTS', 'DO_CLUSTERING', 'FINISHED_CLUSTERING']);

    let points = [];
    let clusters = [];
    let generator;
    let proximityMatrix = null;
    let clusterProximityMatrix = null;
    let clustersLabel = null;

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
          points = Point.createHotspotPoints(NUM_POINTS, NUM_HOTSPOTS, HOTSPOT_NOISE);
        }
      });

      state.on('LEAVE_CREATE_POINTS', () => {
        clusters = Cluster.createInitialClusters(points);
        proximityMatrix = ProximityMatrix.createFromPoints(points);
        clusterProximityMatrix = new ProximityMatrix();

        clustersLabel = s.createP();
        clustersLabel.parent('controls');
      });

      state.init();

      generator = clusterer();
    };

    s.draw = () => {
      s.background(s.color(0, 0, 0, 255));

      if (state.isCurrent('CREATE_POINTS')) {
        points.forEach(p => p.draw());
      } else {
        const drawShape = DRAW_MODE === 'COLORS' && state.isCurrent('FINISHED_CLUSTERING');
        clusters.forEach(c => c.draw(null, DRAW_MODE, drawShape));
        clustersLabel.html(`${clusters.length} Clusters`);
        generator.next();
      }
    };

    function* clusterer() {
      while (clusters.length > NUM_CLUSTERS) {
        let closest = {
          i: null,
          j: null,
          prox: Infinity,
        };

        for (let i = 0; i < clusters.length; ++i) {
          for (let j = 0; j < i; ++j) {
            const ci = clusters[i];
            const cj = clusters[j];

            let prox = clusterProximityMatrix.get(ci.id, cj.id);

            if (prox === null) {
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

              clusterProximityMatrix.set(ci.id, cj.id, prox);
            }

            if (prox < closest.prox) {
              closest = { i, j, prox };
            }
          }
        }

        const ci = clusters[closest.i];
        const cj = clusters[closest.j];
        const merged = ci.merge(cj);
        clusters.splice(closest.i, 1);
        clusters.splice(closest.j, 1);
        clusters.push(merged);

        yield true;
      }

      state.next();
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

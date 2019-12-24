import p5 from 'p5';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import createSketchHierarchical from './hierarchical';
import createSketchKMeans, { createDefaultSketch } from './k-means';
import createControls from './controls';

let currentSketch = new p5(createDefaultSketch());

createControls(config => {
  currentSketch.remove();

  switch (config.ALGORITHM) {
    case 'K_MEANS':
      currentSketch = new p5(createSketchKMeans(config));
      break;

    case 'HIERARCHICAL':
      currentSketch = new p5(createSketchHierarchical(config));
      break;
  }
});

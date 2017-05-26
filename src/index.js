import p5 from 'p5';
import 'p5/lib/addons/p5.dom';
import 'babel-polyfill';

import createSketch, { createDefaultSketch } from './hierarchical';
import createControls from './controls';

let currentSketch = new p5(createDefaultSketch());

createControls(config => {
  currentSketch.remove();
  currentSketch = new p5(createSketch(config));
});

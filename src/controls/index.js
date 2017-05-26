import Quicksettings from 'quicksettings';

import { defaultConfig } from './../k-means';

export default function createControls(onUpdate) {
  // TODO: re-enable
  return;

  const config = {
    ...defaultConfig,
  };

  const settings = Quicksettings.create(0, 0, 'Clustering Parameters');
  settings.bindRange('NUM_CLUSTERS', 0, 100, 5, 1, config);
  settings.bindRange('NUM_POINTS', 0, 5000, 200, 10, config);
  settings.bindRange('ACTIONS_PER_FRAME', 1, 20, 10, 1, config);
  settings.bindRange('CANVAS_SIZE', 500, 1000, 500, 10, config);
  settings.addButton('APPLY', () => onUpdate({ ...config }));
}

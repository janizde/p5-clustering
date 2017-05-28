import Quicksettings from 'quicksettings';

import { defaultConfig } from './../k-means';

export default function createControls(onUpdate) {
  const config = {
    ...defaultConfig,
    ALGORITHM: 'K_MEANS',
  };

  let lastConfig = { ...config };

  const settings = Quicksettings.create(null, null, 'Clustering Parameters', document.getElementById('quicksettings'));
  settings.setDraggable(false);

  settings.bindDropDown('ALGORITHM', ['K_MEANS', 'HIERARCHICAL'], config);
  settings.bindRange('NUM_CLUSTERS', 0, 100, 5, 1, config);
  settings.bindRange('NUM_POINTS', 0, 5000, 200, 10, config);
  settings.bindRange('ACTIONS_PER_FRAME', 1, 20, 10, 1, config);
  settings.bindRange('CANVAS_SIZE', 500, 1000, 500, 10, config);

  settings.setGlobalChangeHandler(() => {
    if (
      lastConfig.ALGORITHM === 'HIERARCHICAL'
      && config.ALGORITHM === 'K_MEANS'
    ) {
      settings.showControl('ACTIONS_PER_FRAME');
    }

    if (
      lastConfig.ALGORITHM === 'K_MEANS'
      && config.ALGORITHM === 'HIERARCHICAL'
    ) {
      settings.hideControl('ACTIONS_PER_FRAME');
    }

    lastConfig = { ...config };
  });

  settings.addButton('APPLY', () => onUpdate({ ...config }));
}

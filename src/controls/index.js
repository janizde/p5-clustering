import Quicksettings from 'quicksettings';

import { defaultConfig as defaultConfigKMeans } from './../k-means';
import { defaultConfig as defaultConfigHierarchical } from './../hierarchical';

export default function createControls(onUpdate) {
  const config = {
    ...defaultConfigKMeans,
    ALGORITHM: 'K_MEANS',
  };

  let lastConfig = { ...config };

  const settings = Quicksettings.create(null, null, 'Clustering Parameters', document.getElementById('quicksettings'));
  settings.setDraggable(false);

  settings.bindDropDown('ALGORITHM', ['K_MEANS', 'HIERARCHICAL'], config);
  settings.bindDropDown('DRAW_MODE', ['CIRCLES', 'COLORS'], config);
  settings.bindDropDown('PROXIMITY_METHOD', ['SINGLE_LINK', 'COMPLETE_LINK', 'AVERAGE', 'CENTROIDS'], config);
  settings.bindRange('NUM_CLUSTERS', 0, 100, 5, 1, config);
  settings.bindRange('NUM_POINTS', 0, 5000, 200, 10, config);
  settings.bindRange('NUM_HOTSPOTS', 0, 20, 5, 1, config);
  settings.bindRange('ACTIONS_PER_FRAME', 1, 20, 10, 1, config);
  settings.bindRange('CANVAS_SIZE', 500, 1000, 500, 10, config);

  settings.hideControl('DRAW_MODE');
  settings.hideControl('PROXIMITY_METHOD');

  settings.setGlobalChangeHandler(() => {
    if (
      lastConfig.ALGORITHM === 'HIERARCHICAL'
      && config.ALGORITHM === 'K_MEANS'
    ) {
      Object.assign(config, defaultConfigKMeans);
      settings.showControl('ACTIONS_PER_FRAME');
      settings.hideControl('DRAW_MODE');
      settings.hideControl('PROXIMITY_METHOD');
    }

    if (
      lastConfig.ALGORITHM === 'K_MEANS'
      && config.ALGORITHM === 'HIERARCHICAL'
    ) {
      Object.assign(config, defaultConfigHierarchical);
      settings.hideControl('ACTIONS_PER_FRAME');
      settings.showControl('DRAW_MODE');
      settings.showControl('PROXIMITY_METHOD');
    }

    lastConfig = { ...config };
  });

  settings.addButton('APPLY', () => onUpdate({ ...config }));
}

import Quicksettings from 'quicksettings';

import { defaultConfig as defaultConfigKMeans } from './../k-means';
import { defaultConfig as defaultConfigHierarchical } from './../hierarchical';

export default function createControls(onUpdate) {
  let config = {
    ...defaultConfigKMeans,
    ALGORITHM: 'K_MEANS',
  };

  const settings = Quicksettings.create(null, null, 'Clustering Parameters', document.getElementById('quicksettings'));
  settings.setDraggable(false);

  const createUpdateCallback = (title, callback = null) => value => {
    if (
      typeof value === 'object'
      && value.hasOwnProperty('value')
    ) {
      value = value.value;
    }

    const oldValue = config[title];
    config = {
      ...config,
      [title]: value,
    };

    if (callback) {
      callback(value, oldValue);
    }
  };

  const setControlValue = (name, value) => {
    const control = settings._controls[name].control;
    if (control.selectedIndex === undefined) {
      settings.setValue(name, value);
      return;
    }

    const { options } = control;
    for (let i = 0; i < options.length; ++i) {
      if (options[i].label === value) {
        settings.setValue(name, i);
        break;
      }
    }
  };

  const mergeConfig = newConfig => {
    const merged = { ...config };
    Object.keys(newConfig).forEach(key => {
      merged[key] = newConfig[key];
      setControlValue(key, merged[key]);
    });

    config = merged;
  };

  settings.addDropDown('ALGORITHM', ['K_MEANS', 'HIERARCHICAL'], createUpdateCallback('ALGORITHM', (value, oldValue) => {
    if (
      oldValue === 'HIERARCHICAL'
      && value === 'K_MEANS'
    ) {
      settings.showControl('ACTIONS_PER_FRAME');
      settings.hideControl('DRAW_MODE');
      settings.hideControl('PROXIMITY_METHOD');
      mergeConfig(defaultConfigKMeans);
    } else if (
      oldValue === 'K_MEANS'
      && value === 'HIERARCHICAL'
    ) {
      settings.hideControl('ACTIONS_PER_FRAME');
      settings.showControl('DRAW_MODE');
      settings.showControl('PROXIMITY_METHOD');
      mergeConfig(defaultConfigHierarchical);
    }
  }));

  settings.addDropDown('DRAW_MODE', ['CIRCLES', 'COLORS'], createUpdateCallback('DRAW_MODE'));
  settings.addDropDown('PROXIMITY_METHOD', ['SINGLE_LINK', 'COMPLETE_LINK', 'AVERAGE', 'CENTROIDS'], createUpdateCallback('PROXIMITY_METHOD'));
  settings.addRange('NUM_CLUSTERS', 0, 100, 5, 1, createUpdateCallback('NUM_CLUSTERS'));
  settings.addRange('NUM_POINTS', 0, 5000, 200, 10, createUpdateCallback('NUM_POINTS'));
  settings.addRange('NUM_HOTSPOTS', 0, 20, 5, 1, createUpdateCallback('NUM_HOTSPOTS'));
  settings.addRange('HOTSPOT_NOISE', 0, 1, .05, .01, createUpdateCallback('HOTSPOT_NOISE'));
  settings.addRange('ACTIONS_PER_FRAME', 1, 20, 10, 1, createUpdateCallback('ACTIONS_PER_FRAME'));
  settings.addRange('CANVAS_SIZE', 500, 1000, 500, 10, createUpdateCallback('CANVAS_SIZE'));

  settings.hideControl('DRAW_MODE');
  settings.hideControl('PROXIMITY_METHOD');

  const setConfig = newConfig => {
    Object.keys(newConfig).forEach(key => {
      const val = newConfig[key];
      settings.setValue(key, val);
    });
  };

  settings.addButton('APPLY', () => onUpdate({ ...config }));
}

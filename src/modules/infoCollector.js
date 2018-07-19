import autobind from 'autobind-decorator';
import BaseModule from './base';

export default class InfoCollector extends BaseModule {
  moduleName = 'info'
  updateInterval = 3000

  init() {
    this.update();
  }

  @autobind
  update() {
    window.requestIdleCallback(() => {
      const data = {
        location: window.location.href,
        userAgent: window.navigator.userAgent,
        screen: `${screen.width} * ${screen.height}`,
        viewport: `${window.innerWidth} * ${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio,
      };
      this.setSelfData(data);
      setTimeout(this.update, this.updateInterval);
    });
  }
}

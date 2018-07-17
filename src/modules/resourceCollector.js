import autobind from 'autobind-decorator';
import BaseModule from './base';
import { getUrlFilename } from '../utils';

const performance = window.webkitPerformance || window.performance;
const hasResourceTiming = performance && typeof performance.getEntries === 'function';

export default class ResourceCollector extends BaseModule {
  moduleName = 'resource'
  updateInterval = 3000

  init() {
    if (!hasResourceTiming) return;

    this.data = {};
    this.getSelfData().then((data) => {
      // 若存在数据且没有刷新页面，即connectionId没变
      if (data && data.connectionId === this.gugu.connectionId) {
        // 重连
        this.handleDataChange(data);
        this.update();
      } else {
        // 不存在则初始化数据
        this.setInitData();
      }
      this.onSelfDataChange(this.handleDataChange);
    });
  }
  setInitData() {
    this.setSelfData({
      connectionId: this.gugu.connectionId,
      resources: [],
    }).then(this.update);
  }
  @autobind
  handleDataChange(data) {
    this.data = data;
  }

  shouldUpdate(entries) {
    // TODO: 更细致的diff
    return this.data.resources.length !== entries.length;
  }

  @autobind
  update() {
    window.requestIdleCallback(() => {
      const entries = performance.getEntries()
        .filter(e => e.entryType === 'resource' && e.initiatorType !== 'xmlhttprequest')
        .filter(this.gugu.connector.shouldResourceUpdate)
        .map(entry => ({
          name: getUrlFilename(entry.name),
          duration: entry.duration,
          url: entry.name,
          initiatorType: entry.initiatorType,
        }));
      if (this.shouldUpdate(entries)) {
        this.updateSelfData({
          resources: entries,
        });
      }
      setTimeout(this.update, this.updateInterval);
    });
  }
}

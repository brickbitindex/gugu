export default class BaseModule {
  constructor(gugu) {
    this.gugu = gugu;
    Object.defineProperty(this, 'selfDataKey', {
      get: () => `${this.moduleName}/${this.gugu.uuid}`,
    });
    setTimeout(() => {
      this.init();
    }, 0);
  }
  init() {}
  setData(key, data) {
    return this.gugu.connector.setData(key, data);
  }
  getData(key) {
    return this.gugu.connector.getData(key);
  }
  updateData(key, data) {
    return this.gugu.connector.updateData(key, data);
  }
  onDataChange(key, callback) {
    this.gugu.connector.onDataChange(key, callback);
  }
  onceDataChange(key, callback) {
    this.gugu.connector.onceDataChange(key, callback);
  }

  setSelfData(data) {
    return this.setData(this.selfDataKey, data);
  }
  getSelfData() {
    return this.getData(this.selfDataKey);
  }
  updateSelfData(data) {
    return this.gugu.connector.updateData(this.selfDataKey, data);
  }
  onSelfDataChange(callback) {
    this.onDataChange(this.selfDataKey, callback);
  }
  onceSelfDataChange(callback) {
    this.onceDataChange(this.selfDataKey, callback);
  }
}

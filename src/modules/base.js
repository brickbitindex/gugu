export default class BaseModule {
  constructor(gugu) {
    this.gugu = gugu;
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
  onDataChange(key, callback) {
    this.gugu.connector.onDataChange(key, callback);
  }
  onceDataChange(key, callback) {
    this.gugu.connector.onceDataChange(key, callback);
  }

  setSelfData(data) {
    return this.setData(`${this.moduleName}/${this.gugu.uuid}`, data);
  }
  getSelfData() {
    return this.getData(`${this.moduleName}/${this.gugu.uuid}`);
  }
  onSelfDataChange(callback) {
    this.onDataChange(`${this.moduleName}/${this.gugu.uuid}`, callback);
  }
  onceSelfDataChange(callback) {
    this.onceDataChange(`${this.moduleName}/${this.gugu.uuid}`, callback);
  }
}

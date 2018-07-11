export default class LocalConnector {
  constructor() {
    this.store = {};
    this.events = {};
    this.onceEvents = {};
  }
  setData(key, data) {
    this.store[key] = data;
    if (this.events[key]) {
      this.events[key].forEach((callback) => {
        callback(data);
      });
    }
    if (this.onceEvents[key]) {
      this.onceEvents[key].forEach((callback) => {
        callback(data);
      });
      delete this.onceEvents[key];
    }
  }
  getData(key) {
    return this.store[key];
  }
  onDataChange(key, callback) {
    if (this.events[key]) {
      this.events[key].push(callback);
    } else {
      this.events[key] = [callback];
    }
  }
  onceDataChange(key, callback) {
    if (this.onceEvents[key]) {
      this.onceEvents[key].push(callback);
    } else {
      this.onceEvents[key] = [callback];
    }
  }
}

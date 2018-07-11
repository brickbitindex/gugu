import autobind from 'autobind-decorator';
import BaseModule from './base';

const TICK_BLOCK = 3000;
const DISCONNECT_BLOCK = 5000;

export default class ConnectionPool extends BaseModule {
  moduleName = 'connection'

  init() {
    this.data = {
      connections: [],
    };
    this.onSelfDataChange(this.handleTickChange);
    this.tick();

    setInterval(this.tick, TICK_BLOCK);
  }

  @autobind
  tick() {
    const tick = new Date().getTime();
    // 去除断开连接的端
    const connections = this.data.connections.filter(c => tick - c.tick < DISCONNECT_BLOCK);
    const data = {
      tick,
      connections,
    };
    this.setSelfData(data);
  }

  @autobind
  handleTickChange(data) {
    this.data = data;
  }
}

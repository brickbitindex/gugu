import autobind from 'autobind-decorator';
import BaseModule from './base';

const TICK_BLOCK = 3000;
const DISCONNECT_BLOCK = 10000;

export default class ConnectionPool extends BaseModule {
  moduleName = 'connection'

  init() {
    this.data = {};
    this.getSelfData().then((data) => {
      if (data) {
        this.handleTickChange(data);
      } else {
        this.handleTickChange({
          connections: {},
        });
      }
      this.onSelfDataChange(this.handleTickChange);
      this.tick(!data);
      setInterval(this.tick, TICK_BLOCK);
    });
  }

  @autobind
  tick(ifCreate) {
    const tick = new Date().getTime();
    // 去除断开连接的端
    const connections = {};
    Object.keys(this.data.connections).filter(id => tick - this.data.connections[id] < DISCONNECT_BLOCK).forEach((id) => {
      connections[id] = this.data.connections[id];
    });
    const data = {
      tick,
      connections,
    };
    if (ifCreate) {
      this.setSelfData(data);
    } else {
      this.updateSelfData(data);
    }
  }

  @autobind
  handleTickChange(data) {
    this.data = data;
  }
}

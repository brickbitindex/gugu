import autobind from 'autobind-decorator';
import BaseModule from './base';
import { JSONEncoder } from '../utils';

// connections结构：
// {
//   [remoteId]: [command],
// }

// command结构：
// {
//   id: [uuid],
//   pending: true|false,
//   success: true|false,
//   command: 'command',
//   response: 'JSON_DATA'|'ERROR_DATA'
// }

/* eslint no-eval: 0 */
const geval = eval;

function getErrorInfo(e) {
  const ret = {
    message: e.message,
    stack: e.stack,
    lineNumber: 0,
    columnNumber: 0,
  };
  if (e.lineNumber !== undefined && e.columnNumber !== undefined) {
    // firefox
    ret.lineNumber = e.lineNumber;
    ret.columnNumber = e.columnNumber;
  } else if (e.line !== undefined && e.column !== undefined) {
    // safari
    ret.lineNumber = e.line;
    ret.columnNumber = e.column;
  } else {
    // other
    const stacks = e.stack.split('\n');
    const evalStack = stacks.find(v => v.indexOf('eval') > -1);
    let lc = evalStack.match(/(:\d+)?:\d+\)?/ig);
    if (lc) {
      // [':2539:14)', ':1:1)'] -> ':1:1)' -> ':1:1' -> ['', '1', '1'] -> ['1', '1']
      lc = lc[lc.length - 1].slice(0, -1).split(':').slice(1);
      if (lc[0]) ret.lineNumber = parseInt(lc[0], 10);
      if (lc[1]) ret.columnNumber = parseInt(lc[1], 10);
    }
  }
  return ret;
}

export default class CommandReducer extends BaseModule {
  moduleName = 'command'

  init() {
    this.data = {};
    this.getSelfData().then((data) => {
      // 若存在数据且没有刷新页面，即connectionId没变
      if (data && data.connectionId === this.gugu.connectionId) {
        // 重连
        this.handleDataChange(data);
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
      connections: {
        aaa: {
          id: 'ddd',
          pending: true,
          success: false,
          command: '1+',
          response: null,
        },
      },
    });
  }

  @autobind
  handleDataChange(data) {
    this.checkCommands(data.connections);
    this.data = data;
  }

  checkCommands(connectionsObj) {
    Object.keys(connectionsObj).forEach((remoteId) => {
      const command = connectionsObj[remoteId];
      if (command.pending) {
        // 如果未执行，则执行
        setTimeout(() => {
          let response;
          try {
            response = {
              response: JSONEncoder(geval(command.command)),
              success: true,
            };
          } catch (e) {
            response = {
              response: getErrorInfo(e),
              success: false,
            };
          }
          this.updateSelfData({
            [`connections.${remoteId}.pending`]: true,
            [`connections.${remoteId}.success`]: response.success,
            [`connections.${remoteId}.response`]: response.response,
          });
        }, 0);
      }
    });
  }
}

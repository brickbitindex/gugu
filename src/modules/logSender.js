import BaseModule from './base';
import { JSONEncoder, getUuid, now } from '../utils';

const wrapNames = ['log', 'info', 'warn'];

// ie8-9 console.xxx is an object
if (Function.prototype.bind && window.console && typeof console.log === 'object') {
  wrapNames.forEach((method) => {
    console[method] = Function.prototype.call.bind(console[method], console);
  });
}

export default class LogSender extends BaseModule {
  moduleName = 'log'

  init() {
    wrapNames.forEach((method) => {
      this[method] = console[method] = this.factory.bind(this, console[method], method);
    });
  }

  factory(origin, type, ...args) {
    origin(...args);

    const data = {
      id: getUuid(),
      createTime: now(),
      type,
      args: args.map(arg => JSONEncoder(arg)),
      // TODO: 浏览器兼容性，这里的2是因为包装了1层，重构这部分时需要注意
      caller: new Error().stack.split('\n')[2].trim(),
    };

    this.setSelfData(data);
  }
}

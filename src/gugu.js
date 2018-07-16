import ConnectionPool from './modules/connectionPool';
import CommandReducer from './modules/commandReducer';
import LogSender from './modules/logSender';
import XhrCollector from './modules/xhrCollector';
import { getUuid } from './utils';

export default class Gugu {
  constructor(uuid, config, connector) {
    this.uuid = uuid;
    this.connectionId = getUuid();
    this.config = config;
    this.connector = connector;

    this.connectionPool = new ConnectionPool(this);
    this.commandReducer = new CommandReducer(this);
    this.logSender = new LogSender(this);
    this.networkCollector = new XhrCollector(this);
  }
}

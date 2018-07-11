import ConnectionPool from './modules/connectionPool';

export default class Gugu {
  constructor(uuid, config, connector) {
    this.uuid = uuid;
    this.config = config;
    this.connector = connector;

    this.connectionPool = new ConnectionPool(this);
  }
}

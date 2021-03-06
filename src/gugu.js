import ConnectionPool from './modules/connectionPool';
import CommandReducer from './modules/commandReducer';
import LogSender from './modules/logSender';
import XhrCollector from './modules/xhrCollector';
import ResourceCollector from './modules/resourceCollector';
import InfoCollector from './modules/infoCollector';
import FeatureDetector from './modules/featureDetector';
import Tracker from './modules/tracker';
import Replayer from './modules/replayer';
import View from './view';
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
    this.resourceCollector = new ResourceCollector(this);
    this.infoCollector = new InfoCollector(this);
    this.featureDetector = new FeatureDetector(this);
    this.tracker = new Tracker(this);
    this.replayer = new Replayer(this);

    this.view = new View(this);
  }
}

import autobind from 'autobind-decorator';
import * as xpath from 'simple-xpath-position';
import BaseModule from './base';

const performance = window.webkitPerformance || window.performance;
const start = new Date();
const now = (performance && performance.now) ? () => performance.now() : () => new Date() - start;

export default class Tracker extends BaseModule {
  moduleName = 'records'
  events = []
  startAt = -1
  startPos = []

  init() {
  }

  start() {
    this.events = [];
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('focus', this.handleFocus, true);
    window.addEventListener('blur', this.handleBlur, true);
    window.addEventListener('keypress', this.handleKeypress);
    this.startPos = [window.scrollX, window.screenY];
    this.startAt = now();
  }

  end() {
    this.endAt = now();
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.removeEventListener('touchend', this.handleTouchEnd, { passive: true });
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('focus', this.handleFocus, true);
    window.removeEventListener('blur', this.handleBlur, true);
    window.removeEventListener('keypress', this.handleKeypress);
    const payload = {
      events: this.events,
      startAt: this.startAt,
      endAt: this.endAt,
      startPos: this.startPos,
    };
    this.setSelfData(payload);
  }

  @autobind
  handleMouseDown(e) {
    if (this.touch) return;
    const info = this.getBaseInfo('mousedown', e);
    this.events.push(info);
  }
  @autobind
  handleMouseUp(e) {
    if (this.touch) return;
    const info = this.getBaseInfo('mouseup', e);
    this.events.push(info);
  }
  @autobind
  handleTouchStart(e) {
    this.touch = true;
    const info = this.getBaseInfo('touchstart', e);
    this.events.push(info);
  }
  @autobind
  handleTouchEnd(e) {
    const info = this.getBaseInfo('touchend', e);
    this.events.push(info);
  }
  @autobind
  handleScroll(e) {
    // const _now = now();
    // if (_now - this.lastScroll < 200) return;
    // this.lastScroll = _now;
    const info = this.getBaseInfo('scroll', e, [window.scrollX, window.scrollY]);
    this.events.push(info);
  }
  @autobind
  handleFocus(e) {
    if (e.target === window) return;
    const info = this.getBaseInfo('focus', e);
    this.events.push(info);
  }
  @autobind
  handleBlur(e) {
    if (e.target === window) return;
    const info = this.getBaseInfo('blur', e);
    this.events.push(info);
  }
  @autobind
  handleKeypress(e) {
    const info = this.getBaseInfo('keypress', e, e.charCode);
    this.events.push(info);
  }

  getBaseInfo(type, e, data) {
    const target = e.target;
    const path = xpath.fromNode(target);
    const ret = {
      type,
      path,
      time: now(),
    };
    if (data) ret.data = data;
    return ret;
  }
}

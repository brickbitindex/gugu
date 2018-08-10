/* eslint operator-assignment: 0 */
/* eslint no-param-reassign: 0 */
import autobind from 'autobind-decorator';
import * as xpath from 'simple-xpath-position';
import BaseModule from './base';

function triggerMouseEvent(node, eventType) {
  const e = document.createEvent('MouseEvents');
  e.initEvent(eventType, true, true);
  node.dispatchEvent(e);
  if (eventType === 'mousedown') {
    node.click();
  }
}

function triggerTouchEvent(node, eventType) {
  let e;
  try {
    e = document.createEvent('TouchEvent');
    e.initTouchEvent(eventType, true, true);
  } catch (err) {
    try {
      e = document.createEvent('UIEvent');
      e.initUIEvent(eventType, true, true);
    } catch (err2) {
      e = document.createEvent('Event');
      e.initEvent(eventType, true, true);
    }
  }
  node.dispatchEvent(e);
  if (eventType === 'touchend') {
    node.click();
  }
}

function triggerInputEvent(node, data) {
  const type = data[0];
  if (type === 'insert') {
    node.value = node.value + data[1];
  } else if (type === 'delete') {
    node.value = data[1];
  } else if (type === 'paste') {
    node.value = data[1];
  }
}

export default class Replayer extends BaseModule {
  moduleName = 'replay'

  init() {
    this.data = {};
    this.setInitData();
  }
  setInitData() {
    this.setSelfData({}).then(() => {
      this.onSelfDataChange(this.handleDataChange);
    });
  }
  parseCode(record) {
    try {
      if (!record.startAt || !record.endAt || !record.startPos || !record.events) return null;
      const timeline = [];
      record.events.forEach((event, i) => {
        let offset = 0;
        if (i > 0) {
          offset = event.time - record.events[i - 1].time;
        }
        timeline.push({
          offset,
          type: event.type,
          data: event.data,
          path: event.path,
        });
      });
      return timeline;
    } catch (e) {
      return null;
    }
  }
  @autobind
  handleDataChange(data) {
    const timeline = this.parseCode(data);
    if (timeline) {
      this.replay(timeline);
    }
  }
  replay(timeline) {
    if (timeline.length === 0) return;
    this.replayEvent(timeline, 0);
  }
  replayEvent(events, i) {
    const event = events[i];
    setTimeout(() => {
      let element;
      if (event.path && event.path.length > 0) {
        element = xpath.toNode(event.path, document);
      } else {
        element = window;
      }
      if (!element) return;
      switch (event.type) {
        case 'mousedown':
          triggerMouseEvent(element, 'mousedown');
          break;
        case 'mouseup':
          triggerMouseEvent(element, 'mouseup');
          break;
        case 'touchstart':
          triggerTouchEvent(element, 'touchstart');
          break;
        case 'touchend':
          triggerTouchEvent(element, 'touchend');
          break;
        case 'scroll':
          window.scrollTo(event.data[0], event.data[1]);
          break;
        case 'focus':
          element.focus();
          break;
        case 'blur':
          element.blur();
          break;
        case 'input':
          triggerInputEvent(element, event.data);
          break;
        default:
          break;
      }

      if (i < events.length - 1) {
        this.replayEvent(events, i + 1);
      } else {
        alert('finish');
      }
    }, event.offset);
  }
}

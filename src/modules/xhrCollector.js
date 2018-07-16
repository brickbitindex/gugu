import autobind from 'autobind-decorator';
import BaseModule from './base';
import { getUuid, now, getUrlFilename } from '../utils';

const performance = window.webkitPerformance || window.performance;
const hasResourceTiming = performance && typeof performance.getEntries === 'function';

const winXhrProto = window.XMLHttpRequest.prototype;
const xhrOrigSend = winXhrProto.send;
const xhrOrigOpen = winXhrProto.open;

const origin = window.location.origin;

function fullUrl(url) {
  // 直接写http的跨域资源
  if (url.indexOf('http') === 0) return url;
  // 直接写//的相对协议
  if (url.indexOf('//') === 0) return window.location.protocol + url;
  let _url = url;
  // 相对地址
  if (url.indexOf('/') !== 0) _url = window.location.pathname.split('/').slice(0, -1).join('/') + '/' + url;
  return origin + _url;
}

function getXhrObject(sign, data) {
  return {
    ...sign,
    name: '',
    status: 'pending',
    type: 'unknown',
    subType: 'unknown',
    size: 0,
    data: '',
    startTime: now(),
    endTime: 0,
    resHeaders: {},
    resTxt: '',
    done: false,
    ...data,
  };
}

function getGuguXhrSign(url, method) {
  return {
    id: getUuid(),
    method,
    url,
    fullUrl: fullUrl(url),
  };
}

function getType(contentType) {
  if (!contentType) return 'unknown';

  const type = contentType.split(';')[0].split('/');

  return {
    type: type[0],
    subType: type[type.length - 1] || '',
  };
}

function lenToUtf8Bytes(str) {
  const m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}

function isCrossOrig(url) {
  return !(url.indexOf(origin) === 0);
}

function getSize(xhr, headersOnly, url) {
  let size = 0;
  function getStrSize() {
    if (!headersOnly) {
      const resType = xhr.responseType;
      if (resType === '' || resType === 'text') {
        const resTxt = xhr.responseText;
        if (resTxt) size = lenToUtf8Bytes(resTxt);
      }
      if (resType === 'arraybuffer') size = xhr.response.byteLength;
      if (resType === 'blob') size = xhr.response.size;
    }
  }

  if (isCrossOrig(url)) {
    getStrSize();
  } else {
    try {
      size = parseFloat(xhr.getResponseHeader('Content-Length'));
    } catch (e) {
      getStrSize();
    }
  }

  if (isNaN(size)) size = 0;

  if (size === 0) getStrSize();

  if (size < 1024) return size + 'B';

  return (size / 1024).toFixed(1) + 'KB';
}

function getHeaders(xhr) {
  const raw = xhr.getAllResponseHeaders();
  const lines = raw.split('\n');

  const ret = {};

  lines.forEach((line) => {
    const _line = line.trim();
    if (_line === '') return;
    const [key, val] = _line.split(':', 2);
    ret[key] = val.trim();
  });

  return ret;
}

export default class xhrCollector extends BaseModule {
  moduleName = 'xhr'

  init() {
    this.data = {};
    this.xhrRemoteCreated = false;
    this.xhrQueueBeforeRemoteCreated = [];
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

    const self = this;

    winXhrProto.open = function open(method, url) {
      const xhr = this;
      // 判断是否需要上传
      if (self.gugu.connector.shouldXHRupdate(url, method, xhr)) {
        // 为监控的xhr增加一个标记
        xhr._guguxhr_ = getGuguXhrSign(url, method);
        xhr.addEventListener('readystatechange', () => {
          switch (xhr.readyState) {
            case 2:
              self.handleXHRHeaderReceived(xhr);
              break;
            case 4:
              self.handleXHRDone(xhr);
              break;
            default: break;
          }
        });
      }

      /* eslint-disable */
      xhrOrigOpen.apply(this, arguments);
      /* eslint-enable */
    };

    winXhrProto.send = function send(data) {
      const xhr = this;
      if (xhr._guguxhr_) {
        self.handleCreateXHR(xhr, data);
      }

      /* eslint-disable */
      xhrOrigSend.apply(this, arguments);
      /* eslint-enable */
    };
  }
  setInitData() {
    const resources = {};
    this.xhrQueueBeforeRemoteCreated.forEach((xhrObj) => {
      resources[xhrObj.id] = { ...xhrObj };
    });
    this.setSelfData({
      connectionId: this.gugu.connectionId,
      resources,
    }).then(() => {
      // 将远端根对象已创建置于true
      this.xhrRemoteCreated = true;
    });
  }
  @autobind
  handleDataChange(data) {
    this.data = data;
  }

  handleCreateXHR(xhr, data = null) {
    const sign = xhr._guguxhr_;
    const xhrObj = getXhrObject(sign, {
      name: getUrlFilename(sign.url),
      data,
    });
    if (this.xhrRemoteCreated) {
      // 已在远端创建
      this.updateSelfData({
        [`resources.${sign.id}`]: xhrObj,
      });
    } else {
      // 未创建则缓存下来，当xhrRemoteCreated被置true时一次性上传
      this.xhrQueueBeforeRemoteCreated.push(xhrObj);
    }
  }

  handleXHRHeaderReceived(xhr) {
    const sign = xhr._guguxhr_;
    const type = getType(xhr.getResponseHeader('Content-Type'));
    const data = {
      type: type.type,
      subType: type.subType,
      size: getSize(xhr, true, sign.fullUrl),
      resHeaders: getHeaders(xhr),
    };

    if (this.xhrRemoteCreated) {
      // 已在远端创建，则更改
      const updateData = {};
      Object.keys(data).forEach((key) => {
        updateData[`resources.${sign.id}.${key}`] = data[key];
      });
      this.updateSelfData(updateData);
    } else {
      // 未创建则进入缓存
      const i = this.xhrQueueBeforeRemoteCreated.findIndex(xhrObj => xhrObj.id === sign.id);
      this.xhrQueueBeforeRemoteCreated[i] = {
        ...this.xhrQueueBeforeRemoteCreated[i],
        ...data,
      };
    }
  }

  handleXHRDone(xhr) {
    const sign = xhr._guguxhr_;
    const resType = xhr.responseType;
    const resTxt = (resType === '' || resType === 'text') ? xhr.responseText : '';
    const data = {
      status: xhr.status,
      done: true,
      size: getSize(xhr, false, sign.fullUrl),
      endTime: now(),
      resTxt,
    };
    if (this.xhrRemoteCreated) {
      // 已在远端创建，则更改
      const updateData = {};
      Object.keys(data).forEach((key) => {
        updateData[`resources.${sign.id}.${key}`] = data[key];
      });
      this.updateSelfData(updateData);
    } else {
      // 未创建则进入缓存
      const i = this.xhrQueueBeforeRemoteCreated.findIndex(xhrObj => xhrObj.id === sign.id);
      this.xhrQueueBeforeRemoteCreated[i] = {
        ...this.xhrQueueBeforeRemoteCreated[i],
        ...data,
      };
    }
  }
}

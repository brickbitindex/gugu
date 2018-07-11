import { getCurrentScriptSrc, getUuid } from './utils';
import Gugu from './gugu';
import TestConnector from './localConnector';

function initGugu(uuid, queryobj, connector) {
  window.__gugu__ = new Gugu(uuid, queryobj, connector);
}

// test
window.__gugu_connector__ = new TestConnector();

// 获取当前执行的gugu的js文件的url
const url = getCurrentScriptSrc();
if (url) {
  const querys = url.replace(/^[^?]+\??/, '').split(/[&?]/).map(q => q.split('='));
  // 取得url配置
  const queryobj = {};
  for (let i = 0; i < querys.length; i += 1) {
    queryobj[querys[i][0]] = querys[i][1];
  }

  const uuid = queryobj.uuid || getUuid();

  // 判断是否有connector
  if (window.__gugu_connector__) {
    initGugu(uuid, queryobj, window.__gugu_connector__);
  } else {
    window.__gugu_init__ = initGugu.bind(this, uuid, queryobj);
  }
}

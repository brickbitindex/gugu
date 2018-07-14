function stringEncoder(str, maxLength = 50) {
  if (str.length > maxLength) {
    const halfMaxLength = (maxLength - 3) / 2;
    return str.slice(0, halfMaxLength) + '...' + str.slice(-halfMaxLength);
  }
  return str;
}

/**
 * 包装器，这个包装器拥有如下功能
 *   - 基础类型全部返回
 *   - string过长切割
 *   - object deep copy
 *   - object层级深度过深切断
 */
function encoder(obj, deep = 0, maxDeep = 5) {
  let ret;
  const type = typeof obj;
  if (
    obj === null ||
    type === 'boolean' ||
    type === 'number'
  ) {
    ret = obj;
  } else if (type === 'string') {
    ret = stringEncoder(obj);
  } else if (type === 'function') {
    ret = '[Function]';
  } else if (type === 'object') {
    ret = {};
    if (deep === maxDeep) return '[Object]';
    Object.keys(obj).forEach((key) => {
      ret[key] = encoder(obj[key], deep + 1, maxDeep);
    });
  } else {
    ret = '[Unknown content]';
  }
  return ret;
}

function JSONEncoder(obj, deep = 0, maxDeep = 5) {
  return JSON.stringify(encoder(obj, deep, maxDeep));
}

function getCurrentScriptSrc() {
  // for firefox, chrome, edge, some mobile browser
  //   see: http://caniuse.com/#search=document.currentScript
  if (document.currentScript) return document.currentScript.src;
  const err = new Error();
  // all firefox
  //   see: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error/fileName
  if (err.fileName) return err.fileName;
  // process stack
  let stack;
  if (err.stack) {
    stack = err.stack;
  } else {
    // ie, error.stack gets the trace information when the error is raised
    try {
      /* eslint-disable */
      a.b.c();
      /* eslint-enable */
    } catch (e) {
      stack = e.stack;
      if (window.opera) {
        // opera 9 has no e.stack, but e.backtrace, use e.toString()
        stack = (String(err).match(/of linked script \S+/g) || []).join(' ');
      }
    }
  }
  if (stack) {
    // if we get stack string, examples:
    // chrome23:
    //  at http://113.93.50.63/data.js:4:1
    // firefox17:
    // @http://113.93.50.63/query.js:4
    // opera12:
    // @http://113.93.50.63/data.js:4
    // IE10:
    //   at Global code (http://113.93.50.63/data.js:4:1)
    //
    stack = stack.split(/[@ ]/g).pop(); // get content after last line, last space or last @
    stack = stack[0] === '(' ? stack.slice(1, -1) : stack;
    return stack.replace(/(:\d+)?:\d+$/i, ''); // remove line number and char number
  }
  // otherwise, for ie8-10, search in head tag
  const nodes = document.head.getElementsByTagName('script');
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.readyState === 'interactive') {
      return node.src;
    }
  }
  return null;
}

/* eslint no-bitwise: 0 */
function getUuid() {
  return 'xxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export {
  JSONEncoder,
  getCurrentScriptSrc,
  getUuid,
};

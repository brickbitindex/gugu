import { appendHTML } from '../utils';
import template from './highlightDom.html';

// jquery offset
function offset($el) {
  // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
  // Support: IE <=11 only
  // Running getBoundingClientRect on a
  // disconnected node in IE throws an error
  if (!$el.getClientRects().length) {
    return { top: 0, left: 0, width: 0, height: 0 };
  }

  const rect = $el.getBoundingClientRect();

  const doc = $el.ownerDocument;
  const docElem = doc.documentElement;
  const win = doc.defaultView;

  return {
    top: Math.round((rect.top + win.pageYOffset) - docElem.clientTop),
    left: Math.round((rect.left + win.pageXOffset) - docElem.clientLeft),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}

/* eslint no-param-reassign:0 */
function css($el, key, value, unit = 'px') {
  $el.style[key] = value + unit;
}

const querySelector = selector => document.querySelector(selector);

export default function highlighDom($el) {
  // 找到高亮框
  let $highlight = document.getElementById('guHighlight');
  if (!$el && $highlight) {
    css($highlight, 'opacity', 0, '');
    return {};
  }
  if (!$highlight) {
    appendHTML(document.body, template);
  }
  // 各个元素
  $highlight = querySelector('#guHighlight');
  const $margin = querySelector('#guHighlight .gu-margin');
  const $padding = querySelector('#guHighlight .gu-padding');
  const $content = querySelector('#guHighlight .gu-content');
  const $size = querySelector('#guHighlight .gu-size');

  const { left, top, width, height } = offset($el);
  css($highlight, 'left', left);
  css($highlight, 'top', top);
  // 这里的长宽包含border和padding，但是不包含margin
  css($highlight, 'width', width);
  css($highlight, 'height', height);

  const computedStyle = getComputedStyle($el, '');
  const getNumStyle = name => parseFloat(computedStyle.getPropertyValue(name));
  // margin
  const ml = getNumStyle('margin-left');
  const mr = getNumStyle('margin-right');
  const mt = getNumStyle('margin-top');
  const mb = getNumStyle('margin-bottom');
  css($margin, 'left', -ml);
  css($margin, 'top', -mt);
  css($margin, 'width', width + ml + mr);
  css($margin, 'height', height + mt + mb);
  // border
  const bl = getNumStyle('border-left-width');
  const br = getNumStyle('border-right-width');
  const bt = getNumStyle('border-top-width');
  const bb = getNumStyle('border-bottom-width');
  // padding
  const bw = width - bl - br;
  const bh = height - bt - bb;
  css($padding, 'left', bl);
  css($padding, 'top', bt);
  css($padding, 'width', bw);
  css($padding, 'height', bh);
  // content
  const pl = getNumStyle('padding-left');
  const pr = getNumStyle('padding-right');
  const pt = getNumStyle('padding-top');
  const pb = getNumStyle('padding-bottom');
  css($content, 'left', bl + pl);
  css($content, 'top', bt + pt);
  css($content, 'width', bw - pl - pr);
  css($content, 'height', bh - pt - pb);
  // tooltip
  css($size, 'left', -ml);
  css($size, 'bottom', `calc(100% + ${mt}px)`, '');
  const { id, className } = $el;
  querySelector('#guHighlight .gu-size .tag-text').innerHTML = $el.tagName.toLowerCase();
  querySelector('#guHighlight .gu-size .id-text').innerHTML = id ? `#${id}` : '';
  let classes = '';
  if (typeof className === 'string' && className.length > 0) {
    classes = '.' + className.replace(/\s+/g, '.');
  }
  querySelector('#guHighlight .gu-size .cls-text').innerHTML = classes;
  querySelector('#guHighlight .gu-size .size-text').innerHTML = `${width} × ${height}`;

  return {
    w: bw - pl - pr,
    h: bh - pt - pb,
    ml,
    mr,
    mt,
    mb,
    bl,
    br,
    bt,
    bb,
    pl,
    pr,
    pt,
    pb,
  };
}

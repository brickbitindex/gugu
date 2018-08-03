import autobind from 'autobind-decorator';
import { str2DOMElement } from '../utils';
import template from './template.html';
import styleStr from './style.scss';
import BaseModule from '../modules/base';
import highlightDom from './highlightDom';
import { getComputedStyle, removeDefComputedStyle, getMatchedCSSRules, getDomStructureInfo } from './utils';

export default class View extends BaseModule {
  mode = null;
  moduleName = 'element'

  selectedElement = null

  constructor(gugu) {
    super(gugu);
    document.addEventListener('DOMContentLoaded', () => {
      // 插入样式和dom
      // icon
      const icon = document.createElement('link');
      icon.rel = 'stylesheet';
      icon.href = '//at.alicdn.com/t/font_770790_0swojcv9pka.css';
      document.head.appendChild(icon);
      document.head.appendChild(str2DOMElement(`<style>${styleStr}</style>`));
      document.body.appendChild(str2DOMElement(template));

      this.$panel = document.getElementById('gu');

      this.initEvent();
      this.onSelfDataChange(this.handleDataChange);
    });
  }

  initEvent() {
    document.getElementById('guIcon').addEventListener('click', this.toggleOpen, false);
    document.getElementById('guSelect').addEventListener('click', this.toggleSelect, false);
  }

  @autobind
  toggleOpen(open) {
    if (open === true) {
      this.$panel.classList.add('open');
    } else if (open === false) {
      this.$panel.classList.remove('open');
    } else {
      this.$panel.classList.toggle('open');
    }
  }

  @autobind
  toggleSelect(e) {
    if (this.mode !== 'select') {
      this.toggleOpen(false);
      this.$panel.classList.add('mode-select');
      this.mode = 'select';
      document.body.addEventListener('click', this.handleClickElement, false);
    } else {
      this.$panel.classList.remove('mode-select');
      this.mode = null;
      document.body.removeEventListener('click', this.handleClickElement, false);
      this.handleCancelSelectElement();
    }
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  wrapInfo(info) {
    return {
      command: [],
      info,
      connectionId: this.gugu.connectionId,
    };
  }

  @autobind
  handleClickElement(e) {
    const $el = e.target;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!$el) return;
    this.handleSelectElement($el);
  }

  handleSelectElement($el) {
    // 箱模型
    const info = highlightDom($el);
    // 基础信息
    info.tag = $el.tagName.toLowerCase();
    info.className = $el.className;
    info.id = $el.id;
    // computedStyle
    let computedStyle = getComputedStyle($el);
    computedStyle = removeDefComputedStyle(computedStyle);
    info.computedStyle = computedStyle;
    // 样式表
    const styleSheets = getMatchedCSSRules($el);
    info.styleSheets = styleSheets;
    // style属性
    info.styleAttr = $el.getAttribute('style');
    // dom层级信息
    info.structure = getDomStructureInfo($el);

    this.selectedElement = $el;
    this.setSelfData(this.wrapInfo(info));
  }

  handleCancelSelectElement() {
    this.selectedElement = null;
    const $highlight = document.getElementById('guHighlight');
    $highlight.remove();
  }

  @autobind
  handleDataChange(data) {
    if (data.connectionId !== this.gugu.connectionId) return;
    const argv = data.command;
    if (argv.length > 0) {
      const command = argv[0];
      const args = argv.slice(1);
      this.receiveCommand(command, args);
    }
  }

  receiveCommand(command, args) {
    if (!this.selectedElement) return;
    // 修改模型
    if (command === 'element.style' && args.length === 1) {
      this.handleChangeElementStyle(...args);
    }
    // 选择关联DOM
    if (command === 'element.select' && args.length === 2) {
      this.handleRemoteSelectElement(...args);
    }
  }

  handleChangeElementStyle(style) {
    this.selectedElement.setAttribute('style', style);
    window.requestIdleCallback(() => {
      this.handleSelectElement(this.selectedElement);
    });
  }

  handleRemoteSelectElement(type, index) {
    if (type === 'parent') {
      let parent = this.selectedElement.parentNode;
      for (let i = 0; i < index; i += 1) {
        parent = parent.parentNode;
      }
      window.requestIdleCallback(() => {
        this.handleSelectElement(parent);
      });
    } else if (type === 'brothers') {
      const parent = this.selectedElement.parentNode;
      const children = parent.children;
      const $brother = children[index];
      window.requestIdleCallback(() => {
        this.handleSelectElement($brother);
      });
    }
  }
}

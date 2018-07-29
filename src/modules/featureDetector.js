import autobind from 'autobind-decorator';
import BaseModule from './base';
// import connectStore from '../connectStore';

export default class FeatureDetector extends BaseModule {
  moduleName = 'feature'

  init() {
    window[`f${this.gugu.connectionId}_result`] = this.getResult;
    window[`f${this.gugu.connectionId}_error`] = this.getError;
    this.data = {};
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
  }

  setInitData() {
    this.setSelfData({
      connectionId: this.gugu.connectionId,
      docId: null,
      doc: null,
      result: null,
      resultId: null,
      error: null,
      errorId: null,
    });
  }

  @autobind
  handleDataChange(data) {
    this.checkDoc(data);
    this.data = data;
  }

  checkDoc(data) {
    if (data.docId === this.data.docId) return;
    const doc = data.doc;
    if (doc && doc.length > 0) {
      window.requestIdleCallback(() => {
        let $script = document.getElementById('f' + this.gugu.connectionId);
        if ($script) {
          document.body.removeChild($script);
        }
        $script = document.createElement('script');
        $script.type = 'text/javascript';
        $script.id = 'f' + this.gugu.connectionId;
        $script.innerHTML = `function test() {
          ${doc}
        };
        try {
          test();
          window.f${this.gugu.connectionId}_result();
        } catch (e) {
          window.f${this.gugu.connectionId}_error(e);
        }
        `;
        document.body.appendChild($script);
      });
    }
  }

  @autobind
  getResult() {
    this.updateSelfData({
      result: JSON.stringify(window.Modernizr),
      resultId: this.data.docId,
    });
  }

  @autobind
  getError(e) {
    this.updateSelfData({
      error: e.message,
      errorId: this.data.docId,
    });
  }
}

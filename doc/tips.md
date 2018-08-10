# 注意点

## gugu

1. 实现一个`connectionId`受益无穷，这可以用来判定是否是刷新页面还是断线重连。

## base module

1. `set`, `get`, `update`方法应该是要实现的，`set`和`update`不同

## connection pool

1. 设定一个最大远端断线时间，清理一下是很有好处的，节省带宽

## command reducer

1. 每个浏览器对错误的包装不一致，处理具体可以看代码
2. 需要对远端传来的命令的执行不应该影响主线程，使用`requestIdleCallback`来处理这个问题

## log sender

1. 通过包装层数来选择触发的脚本

## xhr collector

1. CORS请求的state可能永远是0，且它不触发onload事件，且它不触发readyState为4，即使浏览器开发工具中为200。
2. 需要对connector实现一个`shouldXHRUpdate`接口来判断是否需要忽略某些请求的监听。
3. 获取资源尺寸是个难题，参见`getSize`

## resource collector

1. 若浏览器支持，其实是可以采用`PerformanceObserver`来监听变化，然而浏览器兼容性不佳。
2. 通过`entryType === resource`可以实现entry的过滤。
3. Chrome 60以后，多支持了一种entry叫`PerformancePaintTiming`，可能对性能分析有用。

## feature detector

1. 需要将接受到的脚本包裹在`try...catch`中，并构造回调获取最终结果和错误。

## view

1. http://krasimirtsonev.com/blog/article/Convert-HTML-string-to-DOM-element
2. `document.write`会写入html字符串到`document`中，然而一些特殊的tag例如`style`会被写到`head`中，不知道为啥，w3c标准似乎也没写。
3. `document.styleSheets[i].cssRules`在`Chorme 64`的某个版本之后，若产生CORS问题，会报错，具体Commit是这个：https://chromium.googlesource.com/chromium/src/+/a4ebe08c91e29140e700c7bae9b94f27a786d1ca，所以需要用`try...catch`来处理获得cssRule。
4. 使用`insertAdjacentHTML`來實例化HTML。

## tracker

1. 注意`mouse`和`touch`
2. https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/now
3. http://blog.inching.org/JavaScript/2014-08-19-javascript-key-event-simulate.html
4. https://www.outsystems.com/blog/javascript-events-unmasked-how-to-create-input-mask-for-mobile.html android里沒有keypress
5. keycode 229問題

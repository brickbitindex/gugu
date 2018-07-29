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

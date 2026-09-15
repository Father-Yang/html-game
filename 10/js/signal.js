/**
 * Signal.js
 * 引擎级信号系统 —— 零 GC 热路径 / O(1) 移除 / 支持 once / 支持批量清理
 */

class Signal {
  // ── 静态 ID 计数器 ──
  static #idCounter = 0;

  // ── 实例字段 ──
  id = 0;
  name = '';

  #listeners = [];        // { fn, once, alive, target }
  #pendingRemove = [];
  #dispatching = false;

  constructor(name = '') {
    this.id = Signal.#idCounter++;
    this.name = name;
  }

  // ── 连接 ──

  /**
   * 持续监听
   * @param {Function} fn 回调
   * @param {*} target 上下文对象（用于批量断开）
   */
  connect(fn, target = null) {
    this.#listeners.push({
      fn,
      once: false,
      alive: true,
      target
    });
  }

  /**
   * 一次性监听
   * @param {Function} fn
   * @param {*} target
   */
  once(fn, target = null) {
    this.#listeners.push({
      fn,
      once: true,
      alive: true,
      target
    });
  }

  // ── 断开 ──

  /**
   * 断开指定回调
   * @param {Function} fn
   * @param {*} target
   */
  disconnect(fn, target = null) {
    for (const l of this.#listeners) {
      if (l.fn === fn && l.target === target) {
        l.alive = false;
        if (this.#dispatching) {
          this.#pendingRemove.push(l);
        }
      }
    }
  }

  /**
   * 断开某 target 的所有监听（对象销毁时调用）
   * @param {*} target
   */
  disconnectTarget(target) {
    for (const l of this.#listeners) {
      if (l.target === target) {
        l.alive = false;
      }
    }
  }

  /**
   * 清空所有监听
   */
  clear() {
    this.#listeners.length = 0;
    this.#pendingRemove.length = 0;
  }

  // ── 派发 ──

  /**
   * 触发信号（热路径，零分配）
   * @param {...any} args
   */
  emit(...args) {
    this.#dispatching = true;

    const arr = this.#listeners;
    for (let i = 0; i < arr.length; i++) {
      const l = arr[i];
      if (!l.alive) continue;

      // 按参数数量走不同分支，避免 apply 创建临时数组
      switch (args.length) {
        case 0: l.fn.call(l.target); break;
        case 1: l.fn.call(l.target, args[0]); break;
        case 2: l.fn.call(l.target, args[0], args[1]); break;
        case 3: l.fn.call(l.target, args[0], args[1], args[2]); break;
        case 4: l.fn.call(l.target, args[0], args[1], args[2], args[3]); break;
        default: l.fn.apply(l.target, args); break;
      }

      if (l.once) l.alive = false;
    }

    this.#dispatching = false;

    // 批量清理已死的 listener（O(1) 交换删除）
    if (this.#pendingRemove.length > 0) {
      for (const dead of this.#pendingRemove) {
        const idx = this.#listeners.indexOf(dead);
        if (idx >= 0) {
          const last = this.#listeners[this.#listeners.length - 1];
          this.#listeners[idx] = last;
          this.#listeners.pop();
        }
      }
      this.#pendingRemove.length = 0;
    }
  }

  // ── 查询 ──

  /**
   * 当前活跃监听数量
   * @returns {number}
   */
  get listenerCount() {
    let c = 0;
    for (const l of this.#listeners) if (l.alive) c++;
    return c;
  }

  /**
   * 是否有活跃监听
   * @returns {boolean}
   */
  get hasListeners() {
    for (const l of this.#listeners) if (l.alive) return true;
    return false;
  }
}
import { isEqual } from "lodash";
const orignalSetItem = localStorage.setItem;
localStorage.setItem = function (key, newValue) {
  const setItemEvent = new Event("setItemEvent");
  setItemEvent.newValue = newValue;
  window.dispatchEvent(setItemEvent);
  orignalSetItem.apply(this, arguments);
};
const localStorageMock = (function (win) {
  var storage = win.localStorage; // 用闭包实现局部对象storage
  return {
    setItem: function (key, value) {
      var setItemEvent = new Event("setItemEvent");
      var oldValue = storage[key];
      setItemEvent.key = key;
      if (!isEqual(oldValue, value)) {
        // 新旧值深度判断，派发监听事件
        setItemEvent.newValue = value;
        setItemEvent.oldValue = oldValue;
        win.dispatchEvent(setItemEvent);
        storage[key] = value;
        return true;
      }
      return false;
    },
    getItem: function (key) {
      return storage[key];
    },
    removeItem: function (key) {
      storage[key] = null;
      return true;
    },
    clear: function () {
      storage.clear();
      return true;
    },
    key: function (index) {
      return storage.key(index);
    },
  };
})(window);
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

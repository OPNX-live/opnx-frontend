export const storage = {
  set(name, data) {
    window.sessionStorage.setItem(name, JSON.stringify(data));
  },
  get(name) {
    return JSON.parse(window.sessionStorage.getItem(name));
  },
  getValue(name) {
    return window.sessionStorage.getItem(name);
  }
};
export const localStorage = {
  set(name, data) {
    window.localStorage.setItem(name, JSON.stringify(data));
  },
  get(name) {
    return window.localStorage.getItem(name)?JSON.parse(window.localStorage.getItem(name)):"";
  },
  getValue(name) {
    return window.localStorage.getItem(name);
  }
};

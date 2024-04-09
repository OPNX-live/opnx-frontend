let timer:any;
let timers:any;

export const debounce = (fn:Function, delay:number) => {
  return (...args: any) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(null, args);
    }, delay);
  };
};

export const debounces=(fn:Function, delay:number) => {
  return (...args: any) => {
    if (timers) {
      clearTimeout(timers);
    }
    timers = setTimeout(() => {
      fn.apply(null, args);
    }, delay);
  };
};
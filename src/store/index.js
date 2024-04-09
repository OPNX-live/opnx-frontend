import { applyMiddleware, createStore, compose } from "redux";
import reducers from "./reducers/publicReducer";
import thunk from "redux-thunk";
import _throttle from "lodash/throttle";
import encrypt from "./Crypto";

const loadState = () => {
  let state;
  if (localStorage.getItem("user-console")) {
    state = encrypt.Decrypt(localStorage.getItem("user-console"));
  } else {
    state = localStorage.getItem("user-console");
  }

  return state ? JSON.parse(state) : undefined;
};

const saveState = (state) => {
  localStorage.setItem(
    "user-console",
    encrypt.Encrypt(JSON.stringify(state) ? JSON.stringify(state) : "")
  );
};
const middlewares = compose(
  applyMiddleware(thunk),
  !!window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : (f) => f
);
export const initStore = (initialState) =>
  createStore(reducers, initialState, middlewares);
const store = initStore(loadState());
store.subscribe(
  //保存数据
  _throttle(() => {
    const stateToSave = store.getState();
    saveState(stateToSave);
  }, 1000)
);
export default store;

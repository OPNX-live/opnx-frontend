const createHistory = require("history").createBrowserHistory;

export default createHistory({ basename: process.env.REACT_APP_ROUTER });

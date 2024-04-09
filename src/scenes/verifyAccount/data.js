export const GetRequest = () => {
  var obg = {},
    a = "";
  if (window.location.search.substr(1)) {
    (a = window.location.search.substr(1)) ||
      (a = window.location.hash.split("?")[1]);

    a.split(/&/g).forEach(function (item) {
      obg[(item = item.split("="))[0]] = item[1];
    });
  } else {
    obg = false;
  }

  return obg;
};

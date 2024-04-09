export const filterValue = (list, key) => {
  let prevValue = {};
  list.forEach((i) => {
    if (i.accountName === key) {
      prevValue = i;
      return;
    }
  });
  return prevValue;
};
export const filterUserBlance = (data = [], searchValue) => {
  if (searchValue) {
    const arr = [];
    data.forEach((i) => {
      if (i.coin.toUpperCase().indexOf(searchValue.toUpperCase()) !== -1) {
        arr.push(i);
      }
    });
    return arr;
  } else {
    return data;
  }
};
export const filterHideSmall = (data) => {
  const fiflterData = [];
  data &&
    data.map((i) => {
      if (Math.abs(i.totalBalance) > 0.0001) {
        fiflterData.push(i);
      }
      return false;
    });
  return fiflterData;
};
const coinTop = ["OX", "oUSD", "USDT"];
export const dataSort = (data) => {
  data &&
    data
      .sort((a, b) => {
        return (
          a.coin.toLowerCase().charCodeAt() - b.coin.toLowerCase().charCodeAt()
        );
      })
      .sort((a, b) => {
        if (coinTop.includes(b.coin) || coinTop.includes(a.coin)) {
          return coinTop.indexOf(b.coin) - coinTop.indexOf(a.coin);
        }
        return a.coin.localeCompare(b.coin);
      });
  
  return data;
};

import { Decimal } from "decimal.js";
export const toThousands = function (num) {
  num = (num || 0)?.toString();
  var result = "",
    counter = 0,
    numSplit;

  if (num?.indexOf("%") !== -1) {
    return num;
  }
  numSplit = num?.split(".")[0];

  if (num?.indexOf("-") !== -1) {
    numSplit = numSplit?.slice(1);
  }

  for (var i = numSplit?.length - 1; i >= 0; i--) {
    counter++;
    result = numSplit?.charAt(i) + result;
    if (!(counter % 3) && i !== 0) {
      result = "," + result;
    }
  }

  if (num?.indexOf("-") !== -1) {
    result = "-" + result;
  }

  if (num?.indexOf(".") !== -1) {
    result = result + "." + num?.split(".")[1];
  }

  return result;
};

export const toThousandsV2 = function (amount, toFixed = 4) {
  amount = amount.toString().split(".");
  var str = amount[0];
  var arr = [];
  for (var i = 0; i < Math.round(str.length / 3); i++) {
    arr.push(str.substring(str.length - 3 * (i + 1), str.length - i * 3));
  }
  arr.reverse();
  return `${arr.join(",")}${amount[1] ? "." : ""}${
    amount[1].substr(0, toFixed) || ""
  }`;
};

//eslint-disable-next-line
Number.prototype.toFixed = function (d) {
  var s = this + "";
  if (!d) d = 0;
  if (s.indexOf(".") === -1) s += ".";
  s += new Array(d + 1).join("0");
  if (new RegExp("^(-|\\+)?(\\d+(\\.\\d{0," + (d + 1) + "})?)\\d*$").test(s)) {
    let s = "0" + RegExp.$2,
      pm = RegExp.$1,
      a = RegExp.$3.length,
      b = true;
    if (a === d + 2) {
      a = s.match(/\d/g);
      if (parseInt(a[a.length - 1]) > 4) {
        for (var i = a.length - 2; i >= 0; i--) {
          a[i] = parseInt(a[i]) + 1;
          if (a[i] === 10) {
            a[i] = 0;
            b = i !== 1;
          } else break;
        }
      }
      s = a.join("").replace(new RegExp("(\\d+)(\\d{" + d + "})\\d$"), "$1.$2");
    }
    if (b) s = s.substr(1);
    return (pm + s).replace(/\.$/, "");
  }
  return this + "";
};

export const toAccuracy = function (num) {
  let str = num.toString();
  const index = str.indexOf(".");
  if (index > -1) {
    return str.slice(0, index + 5);
  }
  return str;
};
export const toAccuracyNum = function (num) {
  let str = num?.toString();
  // eslint-disable-next-line
  if (num != 0 && str) {
    const index = str?.indexOf(".");
    if (index > -1) {
      return str.slice(0, index + 9);
    }
  } else {
    str = 0;
  }
  return str;
};
export const toCoinAccuracy = function (num, i) {
  const str = num.toString();
  const index = str.indexOf(".");
  if (i) {
    if (index > -1) {
      return str.split(".")[0] + "." + str.split(".")[1].slice(0, i);
    }
  }
  return str;
};
export const DecimalNum = (num1, num2, type) => {
  if (type === "mul") {
    return JSON.parse(JSON.stringify(new Decimal(num1).mul(new Decimal(num2))));
  } else if (type === "sub") {
    return JSON.parse(JSON.stringify(new Decimal(num1).sub(new Decimal(num2))));
  } else if (type === "div") {
    return JSON.parse(JSON.stringify(new Decimal(num1).div(new Decimal(num2))));
  } else if (type === "add") {
    return JSON.parse(JSON.stringify(new Decimal(num1).add(new Decimal(num2))));
  }
};

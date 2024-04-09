export function toLocaleString(num) {
  num = Number(num).toFixed(4);
  num =
    Number(num.split(".")[0]).toLocaleString("en") + "." + num.split(".")[1];
  return num;
}
export function toLocaleNumberString(num) {
  num=num.toString()
  const Num = num.split(".").length
  if(Num>1){
    return Number(num.split(".")[0]).toLocaleString() + "." + num.split(".")[1]
  }else{
    return  Number(num).toLocaleString()
  }
}
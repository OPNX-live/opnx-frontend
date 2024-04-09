import moment from "moment";
export const PrevDay = (days: number, type: "days" | "weeks" | "months") => {
  return [
    moment().subtract(days, type).format("YYYY-MM-DD 00:00:00"),
    moment().format("YYYY-MM-DD 00:00:00"),
  ];
};

export const switchValue = (value: string) => {
  switch (value) {
    case "1d":
      return [
        moment(new Date()).add(-1, "days").format("YYYY-MM-DD 00:00:00"),
        moment(new Date()).add(-1, "days").format("YYYY-MM-DD 00:00:00"),
      ];
    case "1w":
      return PrevDay(1, "weeks");
    case "2w":
      return PrevDay(2, "weeks");
    case "1m":
      return PrevDay(1, "months");
    case "3m":
      return PrevDay(3, "months");
    default:
      return [""];
  }
};
export const comparedDate = (date: string[]) => {
  const [startDate, endDate] = date;
  // prevThreeMonthsDdate["结束时间"，“结束时间-3个月”]
  const prevThreeMonthsDdate = [
    moment(endDate).format("YYYY-MM-DD"),
    moment(endDate).subtract(3, "months").format("YYYY-MM-DD"),
  ];
  return moment(startDate).isBetween(
    prevThreeMonthsDdate[1],
    prevThreeMonthsDdate[0],
    undefined,
    "[]"
  );
};
export const typeConvert = (type: string) => {
  switch (type) {
    case "Spot":
      return "EXPORT_SPOT";
    case "Futures":
      return "EXPORT_FUTURE";
    case "Repo":
      return "EXPORT_REPO";
    case "Spread":
      return "EXPORT_SPREAD";
    default:
      return "EXPORT_SPOT";
  }
};
// 判断两个时间是否超过三个月
export const isRangeDateDiffThree = (date: string[]) => {
  const res = { startTime: date[0], endTime: date[0] };
  return moment(res.endTime).diff(moment(res.startTime), "months");
};

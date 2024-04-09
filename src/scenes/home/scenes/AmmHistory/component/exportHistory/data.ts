import moment from "moment";
export const PrevDay = (days: number, type: "days" | "weeks") => {
  return [
    moment().subtract(days, type).add(1, "days").format("YYYY-MM-DD 00:00:00"),
    moment().format("YYYY-MM-DD 00:00:00")
  ];
};

export const switchValue = (value: string) => {
  switch (value) {
    case "1d":
      return [
        moment(new Date()).add(-1, "days").format("YYYY-MM-DD 00:00:00"),
        moment(new Date()).add(-1, "days").format("YYYY-MM-DD 00:00:00")
      ];
    case "1w":
      return PrevDay(1, "weeks");
    default:
      return [""];
  }
};
export const comparedDate = (date: string[]) => {
  const [startDate, endDate] = date;
  // prevOneWeekDdate["结束时间"，“结束时间-1周”]
  const prevOneWeekDdate = [
    moment(endDate).format("YYYY-MM-DD"),
    moment(endDate).subtract(1, "weeks").add(1, "days").format("YYYY-MM-DD")
  ];
  return moment(startDate).isBetween(
    prevOneWeekDdate[1],
    prevOneWeekDdate[0],
    undefined,
    "[]"
  );
};

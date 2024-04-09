import moment from "moment";
export const switchDate = (value: string) => {
  return {
    start: moment.utc().add(-value, "days").format("YYYY-MM-DD"),
    end: moment.utc().format("YYYY-MM-DD"),
  };
};

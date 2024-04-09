import moment from "moment";
export const convertToDateString = date => {
  let converted = moment(date).utc();
  return converted.format("dddd MMMM DD, HH:mm UTC");
};


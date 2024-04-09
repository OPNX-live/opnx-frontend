import moment from "moment";
export const rounding = (date: any) => {
  const hh = Number(moment(date).format("HH"));
  const prevDate = moment(date).format("YYYY/MM/DD");
  if (hh >= 3 && hh <= 5) {
    return prevDate + " 04:00";
  } else if (hh >= 11 && hh <= 13) {
    return prevDate + " 12:00";
  } else if (hh >= 19 && hh <= 21) {
    return prevDate + " 20:00";
  } else {
    return moment(date).format("YYYY/MM/DD HH:mm");
  }
};
export const style = {
  content: '""',
  position: "absolute",
  bottom: "-2px",
  width: "100%",
  left: "50%",
  borderBottom: `4px solid #7222D9`,
  borderRadius: "2px",
  transition: ".2s ease-in-out",
};

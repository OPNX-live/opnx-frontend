import { ExclamationCircleOutlined, LeftOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { ReactComponent as ProfitLossAnalysisHide } from "assets/image/VectorProfitLossAnalysisHide.svg";
import { ReactComponent as ProfitLossAnalysisShow } from "assets/image/VectorProfitLossAnalysisShow.svg";
import history from "router/history";
import "./ProfitLossAnalysis.scss";
import { Tooltip, DatePicker } from "antd";
import { AssetChar } from "./components/assetChart";
import DisgiramBox from "./components/DisgiramBox/DisgiramBox";
import { getTodayPnl, InquireBalance, UserData } from "service/http/http";
import { toThousands } from "utils";
import { switchDate } from "./data";
import moment from "moment";
import { WrappedComponentProps, injectIntl } from "react-intl";
const { RangePicker } = DatePicker;

type ILoginPropsState = ReturnType<typeof mapStateToProps>;
export const ProfitLossAnalysis = (
  props: ILoginPropsState & WrappedComponentProps
) => {
  const [dateActive, setDateActive] = useState("7");
  const [pnl, setPnl] = useState({
    pnlRatio: "",
    todayPnl: "0",
  });
  const [date, setDate] = useState(switchDate("6"));
  const [balance, setBalance] = useState({
    marketValue: "--",
    tradingType: "USD",
    balance: "--",
  });
  const [hide, setHide] = useState(false);
  const tabClick = (e: string) => {
    setDateActive(e);
    switch (e) {
      case "7":
        setDate(switchDate("6"));
        return;
      case "30":
        setDate(switchDate("29"));
        return;
      default:
        return;
    }
  };
  const onChangeDate = (value: any, formatString: string[]) => {
    setDate({ start: formatString[0], end: formatString[1] });
  };
  useEffect(() => {
    init();
    const setting = window.location.search;
    if (setting.includes("iOS") || setting.includes("android")) {
      window.document.getElementsByClassName(
        "ant-layout-header"
        // @ts-ignore
      )[0].style.display = "none";
      window.document.getElementsByClassName(
        "profitLossAnalysis-container-header-balance"
        // @ts-ignore
      )[0].style.display = "none";
    }
    // alert(localStorage.getItem('user'));
  }, []);
  const init = async () => {
    getTodayPnl().then((res) => {
      setPnl(res.data);
    });
    const userData = await UserData();
    const balance = await InquireBalance(userData.data.accountId);
    setBalance(balance.data);
  };
  return (
    <div className="profitLossAnalysis">
      <div className="profitLossAnalysis-top"></div>
      <div className="profitLossAnalysis-container">
        <div className="profitLossAnalysis-container-header">
          <div
            className="profitLossAnalysis-container-header-balance"
            onClick={() => history.push("/home/walletManagement/balance")}
          >
            <LeftOutlined /> {props.intl.formatMessage({ id: "Balance" })}
          </div>
          <div className="profitLossAnalysis-container-header-title">
            <span>
              {" "}
              {props.intl.formatMessage({ id: "ProfitLossAnalysis" })}
            </span>
            <div
              className="profitLossAnalysis-container-header-hide"
              onClick={() => setHide(!hide)}
            >
              {hide ? <ProfitLossAnalysisHide /> : <ProfitLossAnalysisShow />}
              <span> {props.intl.formatMessage({ id: "HideBalance" })}</span>
            </div>
          </div>
          <div className="profitLossAnalysis-container-balance">
            <div className="profitLossAnalysis-container-balance-item">
              <p> {props.intl.formatMessage({ id: "EstimatedBalance" })}</p>
              <span className="profitLossAnalysis-container-balance-item-l1">
                {hide
                  ? balance.tradingType === "USDT"
                    ? toThousands(balance.marketValue)
                    : toThousands(balance.balance)
                  : "******"}
                <span>{balance.tradingType}</span>
              </span>
            </div>
            <div className="profitLossAnalysis-container-balance-item">
              <p>
                {props.intl.formatMessage({ id: "PNL" })}{" "}
                <Tooltip
                  color="white"
                  getPopupContainer={(r) => r}
                  title={props.intl.formatMessage({ id: "TodayPnl" })}
                >
                  <ExclamationCircleOutlined />
                </Tooltip>
              </p>
              <span className="profitLossAnalysis-container-balance-item-l1">
                {hide
                  ? Number(pnl.todayPnl) > 0
                    ? `+$${
                        pnl.todayPnl ? toThousands(Number(pnl.todayPnl)) : "0"
                      }`
                    : +pnl.todayPnl === 0
                    ? "$" + Number(pnl.todayPnl)
                    : "$-" +
                      (pnl.todayPnl
                        ? toThousands(`${Number(pnl.todayPnl)}`).split("-")[1]
                        : "0")
                  : "******"}
                {hide ? (
                  <span
                    style={{
                      color:
                        +pnl.pnlRatio > 0
                          ? "#2EBD85"
                          : +pnl.pnlRatio === 0
                          ? "white"
                          : "#F73461",
                    }}
                  >
                    {pnl.pnlRatio !== null
                      ? +pnl.pnlRatio > 0
                        ? `+${(+pnl.pnlRatio * 100).toFixed(2)}%`
                        : `${(+pnl.pnlRatio * 100).toFixed(2)}%`
                      : "--"}
                  </span>
                ) : (
                  <span>******</span>
                )}
              </span>
            </div>
          </div>
          <div className="profitLossAnalysis-container-date" id="date">
            <div
              onClick={tabClick.bind(null, "7")}
              className={`profitLossAnalysis-container-date-item ${
                dateActive === "7"
                  ? "profitLossAnalysis-container-date-item-active"
                  : ""
              }`}
            >
              {props.intl.formatMessage({ id: "Last7days" })}
            </div>
            <div
              onClick={tabClick.bind(null, "30")}
              className={`profitLossAnalysis-container-date-item ${
                dateActive === "30"
                  ? "profitLossAnalysis-container-date-item-active"
                  : ""
              }`}
            >
              {props.intl.formatMessage({ id: "Last30days" })}
            </div>
            <div
              onClick={tabClick.bind(null, "Customize")}
              className={`profitLossAnalysis-container-date-item ${
                dateActive === "Customize"
                  ? "profitLossAnalysis-container-date-item-active"
                  : ""
              }`}
            >
              {props.intl.formatMessage({ id: "Customize" })}
            </div>
            {dateActive === "Customize" ? (
              <RangePicker
                getPopupContainer={(t) => t}
                allowClear={false}
                onChange={onChangeDate}
                disabledDate={(current) =>
                  current && current > moment().endOf("day")
                }
              />
            ) : null}
          </div>
        </div>
        <div className="profitLossAnalysis-chart">
          <div className="profitLossAnalysis-chart-left">
            <DisgiramBox date={date} hide={hide} pnl={pnl} balance={balance} />
          </div>
          <div className="profitLossAnalysis-chart-right">
            <AssetChar date={date} hide={hide} intl={props.intl} />
          </div>
        </div>
        <ul className="profitLossAnalysis-container-footer">
          <li>{props.intl.formatMessage({ id: "profit_1" })}</li>
          <li>{props.intl.formatMessage({ id: "profit_2" })}</li>
          <li>{props.intl.formatMessage({ id: "profit_3" })}</li>
        </ul>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IGlobalT) => ({
  isLogin: state.isLogin,
});

const mapDispatchToProps = {};
ProfitLossAnalysis.displayName = "ProfitLossAnalysis";
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(React.memo(ProfitLossAnalysis)));

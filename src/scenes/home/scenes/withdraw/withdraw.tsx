import React, { useReducer, createContext, useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Select, message } from "antd";
import Warning from "assets/image/warning.svg";
import SubmitWithdraw from "./component/submitWithdraw/submitWithdraw";
import {
  IWithdrawState,
  withdrawStatus,
  IWithdrawProps,
  Inetwork,
} from "./data";
import {
  setWihdrawCoin,
  setDashboardUserData,
} from "store/actions/publicAction";
import {
  havePosition,
  getWithdrawFee,
  UserData,
  getBanlance,
  withdrawLimit,
  getNetwork,
  getAccuracy,
  homeBalanceChar,
  withdrawCoinList,
} from "service/http/http";
import { messageError, toAccuracyNum, toThousands } from "utils";
import RecentHistory from "components/recentHistory/RecentHistory";
import { TwoFAModal } from "../dashboard/components/TwoFAModal/TwoFAModal";
import SwitchModel from "./component/switchAccountModel/index";
import { injectIntl, WrappedComponentProps } from "react-intl";
import day from "dayjs";
import utc from "dayjs/plugin/utc";
import "./withdraw.scss";
import { CloseOutlined } from "@ant-design/icons/lib/icons";
import dayjs from "dayjs";

day.extend(utc);
const { Option } = Select;
export const WithdrawContainerContext =
  createContext<IWithdrawState>(withdrawStatus);
type IWithdrawPropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
type IWithdrawDispatchState = ReturnType<typeof mapDispatchToProps>;
function Withdraw(props: IWithdrawPropsState & IWithdrawDispatchState) {
  const [WithdrawState, WithdrawDispatch] = useReducer(
    (state: IWithdrawState, action: any) => {
      switch (action.type) {
        case "coinData":
          return { ...state, coinData: action.coinData };
        case "coin":
          return { ...state, coin: action.coin };
        case "showPosition":
          return { ...state, showPosition: action.showPosition };
        case "wfaModelVisable":
          return { ...state, wfaModelVisable: action.wfaModelVisable };
        case "withdrawFee":
          return { ...state, withdrawFee: action.withdrawFee };
        case "withdrawLimit":
          return { ...state, withdrawLimit: action.withdrawLimit };
        case "switchVisable":
          return { ...state, switchVisable: action.switchVisable };
        case "withdrawBalance":
          return { ...state, withdrawBalance: action.withdrawBalance };
        case "coinNetwork":
          return { ...state, coinNetwork: action.coinNetwork };
        case "coinAccuracy":
          return { ...state, coinAccuracy: action.coinAccuracy };
        case "warningUsd":
          return { ...state, warningUsd: action.warningUsd };
        default:
          return state;
      }
    },
    withdrawStatus
  );
  const { dashboardUserData, setDashboardUserData, withdrawCoin } = props;
  useEffect(() => {
    WithdrawDispatch({ type: "coin", coin: withdrawCoin });
    WithdrawDispatch({
      type: "withdrawBalance",
      withdrawBalance: withdrawStatus.withdrawBalance,
    });
    withdrawCoinList()
      .then((res) => {
        if (res && res.success) {
          WithdrawDispatch({ type: "coinData", coinData:res.data});
          getWithdrawFee(withdrawCoin).then((result) => {
            result &&
              WithdrawDispatch({
                type: "withdrawFee",
                withdrawFee: result.data,
              });
          });
          return getBanlance(withdrawCoin);
        } else {
          message.warning(res.message);
        }
      })
      .then((rest) => {
        if (rest && rest.success) {
          const data: IWithdrawBlance = {
            availableBalance: rest.data.availableBalance,
            reserved: rest.data.reserved,
            totalBalance: rest.data.totalBalance,
          };
          WithdrawDispatch({ type: "withdrawBalance", withdrawBalance: data });
        } else {
          rest && message.warning(messageError(rest.code));
        }
      });
  }, [dashboardUserData.tradingType, withdrawCoin, props.refresh]);
  useEffect(() => {
    havePosition().then((res) => {
      res.success &&
        WithdrawDispatch({ type: "showPosition", showPosition: res.data });
    });
    UserData().then((res) => {
      if (res.success) {
        setDashboardUserData(res.data);
        res.data.enableTfa &&
          WithdrawDispatch({ type: "wfaModelVisable", wfaModelVisable: false });
        !res.data.enableTfa &&
          WithdrawDispatch({ type: "wfaModelVisable", wfaModelVisable: true });
        if (!res.data.isMainAccount) {
          WithdrawDispatch({ type: "switchVisable", switchVisable: true });
        }
      } else {
        message.warning(res.message);
      }
    });
    getAccuracy().then((res) => {
      res.success &&
        WithdrawDispatch({ type: "coinAccuracy", coinAccuracy: res.data });
    });
  }, [setDashboardUserData]);
  useEffect(() => {
    withdrawLimit().then((res) => {
      if (res.success) {
        WithdrawDispatch({ type: "withdrawLimit", withdrawLimit: res.data });
      }
    });
  }, [props.refresh]);
  useEffect(() => {
    WithdrawDispatch({
      type: "coinNetwork",
      coinNetwork: [{ netWorks: [{ network: "--" }] }],
    });
    WithdrawDispatch({
      type: "hasTwoPartAddress",
      hasTwoPartAddress: false,
    });
    getNetwork(props.withdrawCoin).then((res) => {
      if (res.success) {
        if (res.data) {
          const withdrawNetwork = res.data.filter(
            (i: { isWithdrawal: boolean | null }) => i.isWithdrawal
          );
          filterData(withdrawNetwork).length &&
            WithdrawDispatch({
              type: "coinNetwork",
              coinNetwork: withdrawNetwork[0].netWorks
                ? filterData(withdrawNetwork)
                : [{ netWorks: [{ network: "--" }] }],
            });
        }
      } else {
        WithdrawDispatch({
          type: "coinNetwork",
          coinNetwork: [{ netWorks: [{ network: "--" }] }],
        });
        message.warning(res.message);
      }
    });
  }, [props.withdrawCoin]);
  const filterData = (data: Inetwork[]) => {
    const newNetwork: Inetwork[] = [];
    data.forEach((i: Inetwork) => {
      if (
        newNetwork.every((e) => e.netWorks[0].network !== i.netWorks[0].network)
      ) {
        return newNetwork.push(i);
      }
    });
    return newNetwork;
  };
  useEffect(() => {
    homeBalanceChar().then((res) => {
      if (res.success) {
        const totals = res.data.datas.find((i: any) => i.name === "USD");
        if (Number(totals?.avlQuantity) < 0) {
          WithdrawDispatch({
            type: "warningUsd",
            warningUsd: true,
          });
          !localStorage.get("warningUsd") &&
            localStorage.set("warningUsd", false);
        }
      }
    });
  }, []);
  const closeClick = () => {
    WithdrawDispatch({
      type: "warningUsd",
      warningUsd: false,
    });
    localStorage.set("warningUsd", true);
  };
  const handleChange = (e: string) => {
    WithdrawDispatch({ type: "coin", coin: e });
    props.setWithdrawCoin(e);
  };
  const renderCoin = useMemo(()=>{
    if(WithdrawState.coinData.length&&WithdrawState.coin){
      const coinName=WithdrawState.coinData.find(i=>i.code===WithdrawState.coin)
      if(coinName){
        return coinName.name

      }
      return "--"
    }
    return "--"

  },[WithdrawState.coinData,WithdrawState.coin])
  return (
    <div className="withdraw" id="withdraw">
      <div className="withdraw-title">
        {props.intl.formatMessage({ id: "Withdraw" })}
      </div>
      <div className="withdraw-box">
        <div className="withdraw-box-left">
          <div className="left-box">
            {!WithdrawState.withdrawLimit.noLimit ? <div className="withdraw-limt">
              <div className="withdraw-limit-top">
                <span>
                Weekly Limit
                </span>
                {/* <span></span> */}
                <div className="withdraw-limit-bottom">
                  <span>
                    {WithdrawState.withdrawLimit.withdrawalAmount}
                  </span>
                  <span> / {WithdrawState.withdrawLimit.limit} USDT</span>
                </div>

              </div>
            </div> : null}

            <div className="withdraw-coin">
              <span className="coin">
                {props.intl.formatMessage({ id: "Coin" })}
              </span>
              <Select
                showSearch
                defaultValue={
                  props.withdrawCoin
                    ? props.withdrawCoin
                    : WithdrawState.coinData[0].code
                }
                className="withdraw-select"
                getPopupContainer={(triggerNode) => triggerNode}
                onChange={handleChange}
              >
                {WithdrawState.coinData.map((item:{code:string,name:string}, index: number) => {
                  return (
                    <Option key={index} value={item.code}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </div>
            <div className="withdraw-balance">
              <div className="withdraw-total">
                <span>
                  {props.intl.formatMessage({ id: "Total_balance" })}:
                </span>
                <span>
                  {WithdrawState.withdrawBalance.totalBalance === "--"
                    ? "--"
                    : toThousands(
                      toAccuracyNum(
                        WithdrawState.withdrawBalance.totalBalance
                      )
                    )}{" "}
                  {renderCoin}
                </span>
              </div>
              <div className="withdraw-total">
                <span>{props.intl.formatMessage({ id: "Reserved" })}:</span>
                <span>
                  {WithdrawState.withdrawBalance.reserved === "--"
                    ? "--"
                    : toThousands(
                      toAccuracyNum(WithdrawState.withdrawBalance.reserved)
                    )}{" "}
                  {renderCoin}
                </span>
              </div>
              <div className="withdraw-total">
                <span>
                  {props.intl.formatMessage({ id: "Available_balance" })}:
                </span>
                <span>
                  {WithdrawState.withdrawBalance.availableBalance === "--"
                    ? "--"
                    : toThousands(
                      toAccuracyNum(
                        WithdrawState.withdrawBalance.availableBalance
                      )
                    )}{" "}
                  {renderCoin}
                </span>
              </div>
            </div>
          </div>
          {WithdrawState.showPosition && (
            <div className="withdraw-warning">
              <div className="withdraw-warning-content">
                <img src={Warning} alt="warning" />
                <div>
                  {props.intl.formatMessage({ id: "withdraw_position" })}
                </div>
              </div>
              <div className="warning-content">
                {props.intl.formatMessage({
                  id: "withdraw_position_information1",
                })}
                {props.intl.formatMessage({
                  id: "withdraw_position_information2",
                })}
              </div>
            </div>
          )}
          {WithdrawState.warningUsd && !localStorage.get("warningUsd") && (
            <div className="warning-usd">
              <div className="warning-box">
                <div className="withdraw-warning-content">
                  <img src={Warning} alt="warning" />
                  <div>
                    {props.intl.formatMessage({
                      id: "WARNING",
                    })}
                  </div>
                </div>
                <CloseOutlined onClick={closeClick} />
              </div>
              <div className="warning-content">
                {props.intl.formatMessage({
                  id: "warn_text",
                })}
              </div>
            </div>
          )}
        </div>
        <div className="withdraw-box-right">
          <WithdrawContainerContext.Provider value={WithdrawState}>
            <SubmitWithdraw renderCoin={renderCoin} />
          </WithdrawContainerContext.Provider>
        </div>
        <div className="flex-box" style={{ flex: "0.2" }}></div>
      </div>
      <RecentHistory type="Withdrawal" />
      {WithdrawState.switchVisable && (
        <SwitchModel
          visable={WithdrawState.switchVisable}
          onCloseModel={() => {
            WithdrawDispatch({
              type: "switchVisable",
              switchVisable: false,
            });
          }}
        />
      )}
      {WithdrawState.wfaModelVisable ? (
        <TwoFAModal
          visible={WithdrawState.wfaModelVisable}
          intl={props.intl}
          dashboardUserData={props.dashboardUserData}
          handlerCallback={() => {
            WithdrawDispatch({
              type: "wfaModelVisable",
              wfaModelVisable: false,
            });
          }}
        />
      ) : null}
    </div>
  );
}
const mapStateToProps = (state: any) => {
  return {
    withdrawCoin: state.withdrawCoin,
    dashboardUserData: state.dashboardUserData,
    refresh: state.refresh,
    users: state.users,
    kycOpened: state.kycInfo?.kycOpened,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setWithdrawCoin(data: string) {
      dispatch(setWihdrawCoin(data));
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl((Withdraw)));

import React, {
  createContext,
  useReducer,
  useEffect,
  useState,
  memo,
  useMemo,
} from "react";
import { connect } from "react-redux";
import { Select, message } from "antd";
import DepositAddress from "./component/depositAddress/index";
import RecentHistory from "components/recentHistory/RecentHistory";
import {
  DepositState,
  IDepositState,
  IDepositProps,
  EnumTradingType,
} from "./data";
import "./index.scss";
import {
  coinBalance,
  UserData,
  getDepositBanlance,
  depositCoinList,
} from "service/http/http";
import { messageError, toAccuracyNum, toThousands } from "utils";
import {
  setDepositCoin,
  setDashboardUserData,
  setUser,
} from "store/actions/publicAction";
import store from "store";
import { injectIntl, WrappedComponentProps } from "react-intl";
import HocDisable from "../HocDisable/HocDisable";
// import isAddress from "utils/isAddress";
const pathArr = window.location.search.substring(1).split("&");
let coin = "";
pathArr.forEach((item, idx) => {
  if (item.indexOf("coin=") !== -1) {
    coin = pathArr[idx].split("code=")[1];
  } else {
    coin = "BCH";
  }
});

window.location.search && coin && store.dispatch(setDepositCoin(coin));
type IDepositPropsState = ReturnType<typeof mapStateToProps>;
type IDepositDispatchState = ReturnType<typeof mapDispatchToProps> &
  WrappedComponentProps;
const { Option } = Select;

export const ContainerContext = createContext<IDepositState>(DepositState);
const Deposit = memo<IDepositPropsState & IDepositDispatchState>(
  ({
    dashboardUserData,
    depositCoin,
    setDashboardUserData,
    intl,
    setDepositCoin,
    setUser,
    depositBalance,
  }) => {
    const [err, setErr] = useState(false);
    const [depositStateBox, DepositDispatch] = useReducer(
      (state: IDepositState, action: any) => {
        switch (action.type) {
          case "coinData":
            return { ...state, coinData: action.coinData };
          case "coin":
            return { ...state, coin: action.coin };
          case "coinAddress":
            return { ...state, coinAddress: action.coinAddress };
          case "legacyAddress":
            return { ...state, legacyAddress: action.legacyAddress };
          case "depositBalance":
            return { ...state, depositBalance: action.depositBalance };
          case "isTime":
            return { ...state, isTime: action.isTime };
          case "memoTag":
            return { ...state, memoTag: action.memoTag };
          case "metamaskAddress":
            return { ...state, metamaskAddress: action.metamaskAddress };
          default:
            return state;
        }
      },
      DepositState
    );

    useEffect(() => {
      DepositDispatch({
        type: "coinAddress",
        coinAddress: "",
      });
      DepositDispatch({
        type: "legacyAddress",
        legacyAddress: "",
      });
      DepositDispatch({
        type: "depositBalance",
        depositBalance: DepositState.depositBalance,
      });
      DepositDispatch({ type: "coin", coin: depositCoin });
      DepositDispatch({
        type: "metamaskAddress",
        metamaskAddress: "",
      });
      console.log(depositCoin);
      depositCoinList().then((res) => {
        if (res.success) {
          DepositDispatch({ type: "coinData", coinData: res.data });
          getDepositBanlance(depositCoin).then((result) => {
            const data: IDepositBalance = {
              availableBalance: result.data?.availableBalance,
              reserved: result.data?.reserved,
              totalBalance: result.data?.totalBalance,
            };
            DepositDispatch({
              type: "depositBalance",
              depositBalance: data,
            });
          });
        } else {
          setErr(true);
          message.warning(res.message);
        }
      });
    }, [
      dashboardUserData.tradingType,
      depositCoin,
      dashboardUserData.copperAccount,
    ]);
    const onCallBack = (key: string) => {
      DepositDispatch({
        type: "coinAddress",
        coinAddress: "",
      });
      DepositDispatch({
        type: "legacyAddress",
        legacyAddress: "",
      });
      DepositDispatch({
        type: "memoTag",
        memoTag: "",
      });
      const data = {
        instrumentId: depositCoin,
        network: key,
      };
      coinBalance(data).then((rest) => {
        if (rest.success) {
          if (rest.data?.address) {
            setErr(false);
            DepositDispatch({
              type: "coinAddress",
              coinAddress: rest.data?.address,
            });
            DepositDispatch({
              type: "legacyAddress",
              legacyAddress: rest.data?.legacyAddress,
            });
            DepositDispatch({
              type: "memoTag",
              memoTag: rest.data?.tag,
            });
            if (key.toUpperCase() === "ETH") {
              DepositDispatch({
                type: "metamaskAddress",
                metamaskAddress: rest.data?.address,
              });
            } else {
              DepositDispatch({
                type: "metamaskAddress",
                metamaskAddress: "",
              });
            }
          }
        } else {
          setErr(true);
          rest.message !== "Please complete KYC verification" &&
            !dashboardUserData.copperAccount &&
            message.warning(rest.message);
        }
      });
    };
    useEffect(() => {
      UserData().then((res) => {
        if (res.success) {
          setDashboardUserData(res.data);
        } else {
          message.warning(res.message);
        }
      });
    }, [setDashboardUserData]);
    const handleChange = (e: string) => {
      DepositDispatch({ type: "coin", coin: e });
      setDepositCoin(e);
    };
    const renderCoin = useMemo(()=>{
      if(depositStateBox.coinData.length&&depositStateBox.coin){
        const coinName=depositStateBox.coinData.find(i=>i.code===depositStateBox.coin)
        if(coinName){
          return coinName.name
  
        }
        return "--"
      }
      return "--"
  
    },[depositStateBox.coinData,depositStateBox.coin])
    return (
      <div className="deposit">
        <div className="deposit-title">
          {intl.formatMessage({ id: "Deposit" })}
        </div>
        <div className="deposit-account">
          <div className="deposit-left">
            <div className="deposit-box">
              <div className="deposit-name">
                <div className="deposit-name-left">
                  <span className="deposit-name-span1">
                    {intl.formatMessage({ id: "Account" })}
                  </span>
                  <div className="deposit-name-div1">
                    <span>{dashboardUserData.accountName}</span>
                  </div>
                </div>
                {/* <div className="deposit-name-right">
                {intl.formatMessage({ id: "Trade_Type" })}:{" "}
                {dashboardUserData.tfaType &&
                  intl.formatMessage({
                    id: EunmState[dashboardUserData.tradingType],
                    defaultMessage:
                      EunmState[dashboardUserData.tradingType],
                  })}
              </div> */}
              </div>
              <div className="depopsit-coin">
                <span className="coin">
                  {intl.formatMessage({ id: "Coin" })}
                </span>
                <Select
                  defaultValue={depositCoin}
                  className="deposit-select"
                  showSearch
                  getPopupContainer={(triggerNode) => triggerNode}
                  onChange={handleChange}
                >
                  {depositStateBox.coinData.map(
                    (item: {code:string,name:string}, index: number) => {
                      return (
                        <Option key={index} value={item.code}>
                          {item.name}
                        </Option>
                      );
                    }
                  )}
                </Select>
              </div>
              <div className="deposit-balance">
                <div className="deposit-total">
                  <span>{intl.formatMessage({ id: "Total_balance" })}:</span>
                  <span>
                    {depositStateBox.depositBalance.totalBalance === "--"
                      ? "--"
                      : toThousands(
                          toAccuracyNum(
                            depositStateBox.depositBalance.totalBalance
                          )
                        )}{" "}
                    {renderCoin}
                  </span>
                </div>
                <div className="deposit-total">
                  <span>{intl.formatMessage({ id: "Reserved" })}:</span>
                  <span>
                    {depositStateBox.depositBalance.reserved === "--"
                      ? "--"
                      : toThousands(
                          toAccuracyNum(depositStateBox.depositBalance.reserved)
                        )}{" "}
                    {renderCoin}
                  </span>
                </div>
                <div className="deposit-total">
                  <span>
                    {intl.formatMessage({ id: "Available_balance" })}:
                  </span>
                  <span>
                    {depositStateBox.depositBalance.availableBalance === "--"
                      ? "--"
                      : toThousands(
                          toAccuracyNum(
                            depositStateBox.depositBalance.availableBalance
                          )
                        )}{" "}
                    {renderCoin}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="deposit-right">
            <ContainerContext.Provider value={depositStateBox}>
              <DepositAddress onCallBack={onCallBack} err={err} />
            </ContainerContext.Provider>
          </div>
          <div className="deposit-empty" style={{ flex: 0.2 }}></div>
        </div>
        <RecentHistory type="Deposit" />
      </div>
    );
  }
);
const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData,
    depositCoin: state.depositCoin,
    depositBalance: state.depositBalance,
    kycOpened: state.kycInfo?.kycOpened,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setDepositCoin(data: string) {
      dispatch(setDepositCoin(data));
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
    setUser(data: IDashboardUserData) {
      dispatch(setUser(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(HocDisable(Deposit)));

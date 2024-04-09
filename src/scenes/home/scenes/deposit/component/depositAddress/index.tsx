import React, {
  useReducer,
  useContext,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import { connect } from "react-redux";
import copy from "copy-to-clipboard";
import { Tooltip, message, Tabs } from "antd";
import { MemoWaring, CopyHover, Icon } from "assets/image";
import {
  DepositAddressState,
  IDepositAddressState,
  IDepositAddressProps,
  waring,
  INetwork,
  refresh,
} from "./data";
import QRCode from "qrcode.react";
import { ContainerContext } from "../../index";
import {
  injectIntl,
  WrappedComponentProps,
  FormattedMessage,
} from "react-intl";
import "./index.scss";
import { getMinwithdraw, getNetwork } from "service/http/http";
import { messageError } from "utils";
import { ExclamationCircleOutlined } from "@ant-design/icons";
// import DepositMetaMask from "../depositMetaMask";
const { TabPane } = Tabs;
interface IDepositProps {
  err: boolean;
  onCallBack: (key: string) => void;
}
type IDepositAddressPropsState = ReturnType<typeof mapStateToProps>;
type INameDispatchState = ReturnType<typeof mapDispatchToProps>;
function DepositAddress(
  props: IDepositAddressPropsState & WrappedComponentProps & IDepositProps
) {
  const value = useContext(ContainerContext);
  // const [currentInstrumentId, setCurrentInstrumentId] = useState("");
  const [activeNetworkStr, setActiveNetworkStr] = useState("");

  const [DepositState, DepositAddressDispatch] = useReducer(
    (state: IDepositAddressState, action: any) => {
      switch (action.type) {
        case "copyHover":
          return { ...state, copyHover: action.copyHover };
        case "switchBtn":
          return { ...state, switchBtn: action.switchBtn };
        case "copySuccess":
          return { ...state, copySuccess: action.copySuccess };
        case "coinNetwork":
          return { ...state, coinNetwork: action.coinNetwork };
        case "activeNetwork":
          return { ...state, activeNetwork: action.activeNetwork };
        case "memoSuccess":
          return { ...state, memoSuccess: action.memoSuccess };
        case "miniDeposit":
          return { ...state, miniDeposit: action.miniDeposit };
        default:
          return state;
      }
    },
    DepositAddressState
  );

  useEffect(() => {
    DepositAddressDispatch({
      type: "coinNetwork",
      coinNetwork: [{ netWorks: [{ network: "--" }] }],
    });
    if (props.depositCoin === "BTC") {
      DepositAddressDispatch({ type: "switchBtn", switchBtn: false });
    } else {
      DepositAddressDispatch({ type: "switchBtn", switchBtn: false });
    }
    getNetwork(props.depositCoin).then((res) => {
      if (res.success) {
        if (res.data && res.data.length > 0) {
          const depostiNetwork = res.data.filter(
            (i: { isDeposit: boolean }) => i.isDeposit
          );
          filterData(depostiNetwork).length &&
            DepositAddressDispatch({
              type: "coinNetwork",
              coinNetwork: depostiNetwork[0].netWorks
                ? filterData(depostiNetwork)
                : [{ netWorks: [{ network: "--" }] }],
            });
          if (depostiNetwork.length) {
            const activeNetwork = depostiNetwork?.[0].netWorks[0]?.network;
            DepositAddressDispatch({
              type: "activeNetwork",
              activeNetwork,
            });
            props.onCallBack(activeNetwork);
          }
        }
      } else {
        DepositAddressDispatch({
          type: "coinNetwork",
          coinNetwork: [{ netWorks: [{ network: "--" }] }],
        });
        message.warning(res.message);
      }
    });
    // eslint-disable-next-line
  }, [props.depositCoin]);
  const filterData = (data: INetwork[]) => {
    const newNetwork: INetwork[] = [];
    data.forEach((i: INetwork) => {
      if (
        props.dashboardUserData &&
        props.dashboardUserData.sourceType === "US"
      ) {
        if (i.netWorks[0].network !== "SLP") {
          if (
            newNetwork.every(
              (e) => e.netWorks[0].network !== i.netWorks[0].network
            )
          ) {
            return newNetwork.push(i);
          }
        }
      } else {
        if (
          newNetwork.every(
            (e) => e.netWorks[0].network !== i.netWorks[0].network
          )
        ) {
          return newNetwork.push(i);
        }
      }
    });
    return newNetwork;
  };
  useEffect(() => {
    DepositAddressDispatch({
      type: "activeNetwork",
      activeNetwork: "",
    });
    if (DepositState.activeNetwork && DepositState.activeNetwork !== "--") {
      const data = {
        instrumentId: props.depositCoin,
        network: DepositState.activeNetwork,
      };
      getMinwithdraw(data).then((res) => {
        if (res.success) {
          DepositAddressDispatch({
            type: "miniDeposit",
            miniDeposit: res.data.depositMinValue,
          });
        }
      });
    }
  }, [DepositState.activeNetwork, props.depositCoin]);
  const onMouseOut = () => {
    DepositAddressDispatch({ type: "copySuccess", copySuccess: false });
    DepositAddressDispatch({ type: "memoSuccess", memoSuccess: false });
  };
  const onClick = (type: number) => {
    if (type === 1) {
      if (copy(coinAddres())) {
        DepositAddressDispatch({ type: "copySuccess", copySuccess: true });
      } else {
        message.warning("Copy the failure");
      }
      return;
    }
    if (copy(coinAddres(value.memoTag))) {
      DepositAddressDispatch({ type: "memoSuccess", memoSuccess: true });
    } else {
      message.warning("Copy the failure");
    }
  };
  const onLegacy = () => {
    !DepositState.switchBtn &&
      DepositAddressDispatch({ type: "switchBtn", switchBtn: true });
  };
  const onSegWit = () => {
    DepositState.switchBtn &&
      DepositAddressDispatch({ type: "switchBtn", switchBtn: false });
  };

  const coinAddres = useCallback(
    (tag?: string) => {
      if (tag) {
        return tag;
      }
      if (DepositState.switchBtn) {
        // 默认值是false 为true 证明value.legacyAddress有值
        if (value.legacyAddress) {
          return value.legacyAddress;
        } else {
          return value.coinAddress;
        }
      } else {
        return value.coinAddress;
      }
    },
    [DepositState.switchBtn, value.legacyAddress, value.coinAddress]
  );
  const onText = () => {
    if (props.dashboardUserData.copperAccount) {
      return props.intl.formatMessage(
        { id: "deposit_account" },
        { account: props.dashboardUserData.copperAccount }
      );
    } else {
      return props.intl.formatMessage({ id: "address_empty" });
    }
  };
  const onTabChange = (key: string) => {
    if (key !== DepositState.activeNetwork) {
      DepositAddressDispatch({
        type: "activeNetwork",
        activeNetwork: key,
      });
      props.onCallBack(key);
      setActiveNetworkStr(key);
    }
  };
  const onRefresh = () => {
    props.onCallBack(
      activeNetworkStr
        ? activeNetworkStr
        : DepositState.coinNetwork[0].netWorks[0].network
    );
  };
  const coinNetwork = (coin: string) => {
    if (coin === DepositState.activeNetwork) {
      return coin;
    } else {
      return `${coin} ${
        DepositState.activeNetwork ? "(" + DepositState.activeNetwork + ")" : ""
      }`;
    }
  };
  const memoNetwork = (a: string, b: string) => {
    if (a === b) {
      return a;
    }
    return a + "-" + b;
  };
  const renderCoin = useMemo(() => {
    if (value.coinData.length && value.coin) {
      const coinName = value.coinData.find((i) => i.code === value.coin);
      if (coinName) {
        return coinName.name;
      }
      return "--";
    }
    return "--";
  }, [value.coinData, value.coin]);
  return (
    <div className="deposit-address">
      <div className="address-title">
        {props.intl.formatMessage({ id: "Deposit" })}{" "}
        {props.intl.formatMessage({ id: "Network" })}:
      </div>
      <Tabs defaultActiveKey="1" onChange={onTabChange}>
        {DepositState.coinNetwork.map(
          (i: { netWorks: { network: string }[] }) => {
            if (props.dashboardUserData.sourceType === "US") {
              if (i.netWorks[0].network.indexOf("SLP") < 0) {
                return (
                  <TabPane
                    tab={i.netWorks[0].network}
                    key={i.netWorks[0].network}
                  ></TabPane>
                );
              } else {
                return null;
              }
            } else {
              return (
                <TabPane
                  tab={i?.netWorks[0].network}
                  key={i?.netWorks[0].network}
                ></TabPane>
              );
            }
          }
        )}
      </Tabs>
      <div className="address-coin">
        {props.err ? (
          <div className="address-waring">
            <img
              alt="waring"
              src={refresh}
              onClick={onRefresh}
              className="refresh"
            />
            <div>
              <FormattedMessage
                id="qr text"
                defaultMessage="QR Code Failed to generate. Please try again."
              />
            </div>
          </div>
        ) : value.coinAddress !== "" || value.legacyAddress !== "" ? (
          <>
            {(props.depositCoin === "BTC" || props.depositCoin === "BCH") &&
            value.legacyAddress &&
            value.coinAddress ? (
              <div className="address-coin-btn">
                <div
                  className="legacy"
                  onClick={onLegacy}
                  style={
                    DepositState.switchBtn
                      ? { border: "1px solid #318BF5" }
                      : { border: "1px solid rgba(49, 53, 61, 1)" }
                  }
                >
                  <FormattedMessage id="Legacy" />
                </div>
                <div
                  className="segWit"
                  onClick={onSegWit}
                  style={
                    !DepositState.switchBtn
                      ? { border: "1px solid #318BF5" }
                      : { border: "1px solid rgba(49, 53, 61, 1)" }
                  }
                >
                  {props.depositCoin === "BTC" ? (
                    <FormattedMessage id="SegWit" />
                  ) : (
                    <FormattedMessage id="CashAddr" />
                  )}
                </div>
              </div>
            ) : null}
            {value.memoTag && (
              <div className="memo-waring">
                <MemoWaring />
                <div className="waring-message">
                  <FormattedMessage
                    id="memo_warn"
                    values={{
                      coin: memoNetwork(DepositState.activeNetwork, renderCoin),
                    }}
                  />
                </div>
              </div>
            )}
            <div className="addredd-qrcode">
              <div className="qrcode-left">
                <div className="net-add">
                  {DepositState.activeNetwork} <FormattedMessage id="Address" />
                </div>
                <div className="qrcode">
                  <QRCode value={coinAddres()} size={98} />
                </div>
                <div className="address-img">
                  <div className="address">{coinAddres()}</div>
                  <Tooltip
                    placement="top"
                    title={
                      <span>
                        {DepositState.copySuccess
                          ? props.intl.formatMessage({ id: "copy_error" })
                          : props.intl.formatMessage({ id: "copy_success" })}
                      </span>
                    }
                  >
                    <div
                      className="address-copy-img"
                      onClick={onClick.bind(null, 1)}
                      onMouseOut={onMouseOut}
                    >
                      {DepositState.copySuccess ? <Icon /> : <CopyHover />}
                    </div>
                  </Tooltip>
                </div>
              </div>
              {/*<DepositMetaMask network={DepositState.activeNetwork} coin={value.coin} address={coinAddres()} />*/}
              {value.memoTag && (
                <div className="qrcode-right">
                  <div className="net-add">
                    {DepositState.activeNetwork} <FormattedMessage id="memo" />{" "}
                    <Tooltip
                      placement={"right"}
                      autoAdjustOverflow={false}
                      title={
                        <div className="depo-tootip">
                          <FormattedMessage id="deposit_memo_message" />
                        </div>
                      }
                    >
                      <ExclamationCircleOutlined />
                    </Tooltip>
                  </div>
                  <div className="qrcode">
                    <QRCode value={coinAddres(value.memoTag)} size={98} />
                  </div>
                  <div className="address-img">
                    <div className="address">{coinAddres(value.memoTag)}</div>
                    <Tooltip
                      placement="top"
                      title={
                        <span>
                          {DepositState.memoSuccess
                            ? props.intl.formatMessage({ id: "copy_error" })
                            : props.intl.formatMessage({ id: "copy_success" })}
                        </span>
                      }
                    >
                      <div
                        className="address-copy-img"
                        onClick={onClick.bind(null, 2)}
                        onMouseOut={onMouseOut}
                      >
                        {DepositState.memoSuccess ? <Icon /> : <CopyHover />}
                      </div>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
            <div className="mini-coin">
              Minimum Deposit Amount:{" "}
              <span>
                {DepositState.miniDeposit || "--"} {renderCoin}
              </span>
              <p>
                If the amount is less than specified, the funds will not be
                credited to your account.
              </p>
            </div>
          </>
        ) : (
          <div className="address-waring">
            <img alt="waring" src={waring} />
            <div>
              {" "}
              {onText()}
              <span className="dotting"></span>
            </div>
          </div>
        )}
      </div>
      <div className="address-message">
        <div className="address-message-title">
          Send only {renderCoin} to this deposit address.
        </div>
        <div className="address-message-subtitle">
          Sending coins or tokens other than {renderCoin} to this address may
          result in the loss of your deposit.
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = (state: IDepositAddressProps) => {
  return {
    dashboardUserData: state.dashboardUserData,
    depositCoin: state.depositCoin,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DepositAddress));

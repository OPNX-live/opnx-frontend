import React, {
  useReducer,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { connect } from "react-redux";
import { Menu, Dropdown, Input, message, Button, Tabs, Tooltip } from "antd";
import { DownOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import select from "../../../../../../assets/image/select.png";
import noSelect from "../../../../../../assets/image/coin-no-select.png";
import {
  ISubmitWithdrawState,
  SubmitState,
  ISubmitWithdrawProps,
  IAddress,
  IAddressType,
} from "./data";
import { WithdrawContainerContext } from "../../withdraw";
import {
  getWithdrawAddress,
  checkAddress,
  getFee,
  getMinwithdraw,
  maxWithdraw,
  submitWithdraw,
} from "service/http/http";
import ValidationWithdraw from "../ValidationWithdraw/validationWithdraw";
import WithdrawSaveAddress from "../withdrawSaveAddress/withdrawsaveaddress";
import WithdrawalRequest from "../withdrawalRequest/withdrawalrequest";
import {
  messageError,
  toAccuracyNum,
  toCoinAccuracy,
  toThousands,
} from "utils";
import TwoFAModal from "scenes/home/scenes/dashboard/components/TwoFAModal/TwoFAModal";
import { IWithdrawState } from "../../data";
import history from "router/history";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Decimal } from "decimal.js";
import { debounce, debounces } from "utils/debounce";
import WithdrawMetaMask from "../withdrawMetaMask";
import MetaMaskLogo from "../MetaMaskLogo";

import { setRefresh } from "store/actions/publicAction";
import "./submitWithdraw.scss";
import { SmallLoadding } from "components/smallLoadding";
import { TooltipGlobal } from "components/TooltipGlobal/Tooltip";
const { TabPane } = Tabs;
type ISubmitWithdrawPropsState = ReturnType<typeof mapStateToProps>;
type ISubmitWithdrawDispatchState = ReturnType<typeof mapDispatchToProps>;
function SubmitWithdraw(
  props: ISubmitWithdrawPropsState & WrappedComponentProps
) {
  const { dashboardUserData, withdrawCoin } = props;
  const [isMetaMaskWithdraw, setIsMetaMaskWithdraw] = useState(false);
  const [showAddressLink, setShowAddressLink] = useState(true);

  const value: IWithdrawState = useContext(WithdrawContainerContext);
  const [SubmitWithdrawState, SubmitWithdrawDispatch] = useReducer(
    (state: ISubmitWithdrawState, action: any) => {
      switch (action.type) {
        case "inputValue":
          return { ...state, inputValue: action.inputValue };
        case "amountNot":
          return { ...state, amountNot: action.amountNot };
        case "addressNot":
          return { ...state, addressNot: action.addressNot };
        case "amountValue":
          return { ...state, amountValue: action.amountValue };
        case "coinAddress":
          return { ...state, coinAddress: action.coinAddress };
        case "visable":
          return { ...state, visable: action.visable };
        case "update":
          return { ...state, update: action.update };
        case "tfaModelVisable":
          return { ...state, tfaModelVisable: action.tfaModelVisable };
        case "withdrawRequestVisable":
          return {
            ...state,
            withdrawRequestVisable: action.withdrawRequestVisable,
          };
        case "tfaVerification":
          return { ...state, tfaVerification: action.tfaVerification };
        case "errorMessage":
          return { ...state, errorMessage: action.errorMessage };
        case "loading":
          return { ...state, loading: action.loading };
        case "fee":
          return { ...state, fee: action.fee };
        case "amountError":
          return { ...state, amountError: action.amountError };
        case "tabIndex":
          return { ...state, tabIndex: action.tabIndex };
        case "values":
          return { ...state, values: action.values };
        case "activeNetwork":
          return { ...state, activeNetwork: action.activeNetwork };
        case "willAmount":
          return { ...state, willAmount: action.willAmount };
        case "minWithdraw":
          return { ...state, minWithdraw: action.minWithdraw };
        case "memoValue":
          return { ...state, memoValue: action.memoValue };
        case "memoError":
          return { ...state, memoError: action.memoError };
        case "hasTwoPartAddress":
          return { ...state, hasTwoPartAddress: action.hasTwoPartAddress };
        case "maxWithdraw":
          return { ...state, maxWithdraw: action.maxWithdraw };
        case "refash":
          return { ...state, refash: action.refash };
        case "disableInput":
          return { ...state, disableInput: action.disableInput };
        default:
          return state;
      }
    },
    SubmitState
  );

  useEffect(() => {
    if (
      dashboardUserData &&
      dashboardUserData.accountSource === "METAMASK" &&
      (SubmitWithdrawState.activeNetwork.toUpperCase() === "ERC20" ||
        SubmitWithdrawState.activeNetwork.toUpperCase() === "ETH")
    ) {
      setShowAddressLink(false);
    }
  }, [
    SubmitWithdrawState.activeNetwork,
    dashboardUserData,
    isMetaMaskWithdraw,
    withdrawCoin,
  ]);

  useEffect(() => {
    setIsMetaMaskWithdraw(false);
  }, [SubmitWithdrawState.activeNetwork, withdrawCoin]);

  // props.dashboardUserData.enableWithdrawalWhiteList
  const meunClick = (e: number, item: string, index: IAddress) => {
    SubmitWithdrawDispatch({ type: "addressNot", addressNot: false });
    SubmitWithdrawDispatch({ type: "inputValue", inputValue: item });
    index.tag &&
      SubmitWithdrawDispatch({ type: "memoValue", memoValue: index.tag });
    onCorrect(item);
  };
  const onCorrect = debounce((item: string) => {
    checkAddress({
      instrumentId: props.withdrawCoin,
      address: item,
      network: SubmitWithdrawState.activeNetwork,
    }).then((res) => {
      if (res.success) {
        if (res.data.is_valid) {
          SubmitWithdrawDispatch({ type: "addressNot", addressNot: false });
          SubmitWithdrawState.amountValue !== "" &&
            getWithdrawFee(SubmitWithdrawState.amountValue, item);
        } else {
          SubmitWithdrawDispatch({
            type: "errorMessage",
            errorMessage: messageError("35026"),
          });
          SubmitWithdrawDispatch({
            type: "addressNot",
            addressNot: true,
          });
        }
      } else {
      }
    });
  }, 500);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.currentTarget.dataset.type;
    if (type === "address") {
      SubmitWithdrawDispatch({
        type: "inputValue",
        inputValue: e.target.value,
      });
      onCorrect(e.target.value);
    } else {
      SubmitWithdrawDispatch({
        type: "amountValue",
        amountValue: toCoinAccuracy(
          e.target.value,
          value.coinAccuracy[props.withdrawCoin]
        ),
      });
      if (!e.target.value || Number(e.target.value) > 0) {
        SubmitWithdrawDispatch({ type: "willAmount", willAmount: "--" });
      }
      if (Number(e.target.value) < Number(SubmitWithdrawState.minWithdraw)) {
        SubmitWithdrawDispatch({
          type: "amountError",
          amountError: props.intl.formatMessage({ id: "min_balance" }),
        });
        SubmitWithdrawDispatch({ type: "amountNot", amountNot: true });
      } else if (
        Number(e.target.value) > Number(SubmitWithdrawState.maxWithdraw)
      ) {
        SubmitWithdrawDispatch({
          type: "amountError",
          amountError: props.intl.formatMessage({ id: "max_balance" }),
        });
        SubmitWithdrawDispatch({ type: "amountNot", amountNot: true });
        getWithdrawFee(e.target.value, SubmitWithdrawState.inputValue);
      } else {
        getWithdrawFee(e.target.value, SubmitWithdrawState.inputValue);
        SubmitWithdrawDispatch({ type: "amountNot", amountNot: false });
      }
    }
  };
  const menu = (
    <Menu
      style={
        SubmitWithdrawState.coinAddress.length
          ? {}
          : { padding: "0", border: "none" }
      }
    >
      {SubmitWithdrawState.coinAddress.map((item: IAddress, index: number) => {
        return (
          <Menu.Item
            key={index}
            onClick={meunClick.bind(null, index, item.address, item)}
            className="menu-item"
          >
            <div className="address-note">
              <span>{item.label} |</span>
              <span>
                {item.address} {item.tag ? `(${item.tag})` : null}
              </span>
            </div>
            <img
              alt="select"
              src={
                SubmitWithdrawState.inputValue === item.address
                  ? select
                  : noSelect
              }
            />
          </Menu.Item>
        );
      })}
    </Menu>
  );
  const submit = () => {
    if (props.dashboardUserData.sourceType === "US") {
      if (SubmitWithdrawState.activeNetwork === "SLP") {
        message.error(
          props.intl.formatMessage({
            id: "You are current a U.S. user. According to U.S. policy, SLP network is temporarily not supported ",
            defaultMessage:
              "You are current a U.S. user. According to U.S. policy, SLP network is temporarily not supported",
          })
        );
        return false;
      }
    }
    if (
      props.dashboardUserData.enableTfa ||
      dashboardUserData.accountSource === "METAMASK"
    ) {
      if (
        SubmitWithdrawState.inputValue !== "" &&
        SubmitWithdrawState.amountValue !== "" &&
        parseFloat(SubmitWithdrawState.amountValue) !== 0 &&
        !SubmitWithdrawState.amountNot &&
        !SubmitWithdrawState.addressNot
      ) {
        if (
          SubmitWithdrawState.hasTwoPartAddress &&
          SubmitWithdrawState.memoValue === ""
        ) {
          SubmitWithdrawDispatch({
            type: "memoError",
            memoError: "Please enter the memo",
          });
          return;
        }
        SubmitWithdrawDispatch({
          type: "loading",
          loading: true,
        });
        const params = {
          withdrawAddress: SubmitWithdrawState.inputValue,
          amount: SubmitWithdrawState.amountValue,
          instrumentId: value.coin,
          network: SubmitWithdrawState.activeNetwork,
        };
        checkAddress({
          instrumentId: props.withdrawCoin,
          address: SubmitWithdrawState.inputValue,
          network: SubmitWithdrawState.activeNetwork,
        })
          .then((res) => {
            if (res.success) {
              if (res.data.is_valid) {
                return getFee(params);
              } else {
                SubmitWithdrawDispatch({
                  type: "errorMessage",
                  errorMessage: messageError("35026"),
                });
                SubmitWithdrawDispatch({
                  type: "addressNot",
                  addressNot: true,
                });
                SubmitWithdrawDispatch({
                  type: "loading",
                  loading: false,
                });
              }
            } else {
              return getFee(params);
            }
          })
          .then((rest) => {
            if (rest) {
              SubmitWithdrawDispatch({
                type: "loading",
                loading: false,
              });
              if (rest.success) {
                if (
                  Number(SubmitWithdrawState.amountValue) <=
                    Number(rest.data.medium) &&
                  Number(SubmitWithdrawState.maxWithdraw) -
                    Number(SubmitWithdrawState.amountValue) <
                    Number(rest.data.medium)
                ) {
                  SubmitWithdrawDispatch({
                    type: "amountNot",
                    amountNot: true,
                  });
                  SubmitWithdrawDispatch({
                    type: "amountError",
                    amountError: messageError(35039),
                  });
                } else {
                  SubmitWithdrawDispatch({
                    type: "withdrawRequestVisable",
                    withdrawRequestVisable: true,
                  });
                  if (Object.entries(rest.data).length) {
                    SubmitWithdrawDispatch({
                      type: "fee",
                      fee: rest.data.medium,
                    });
                    willWithdraw(
                      SubmitWithdrawState.amountValue,
                      rest.data.medium
                    );
                  } else {
                    willWithdraw(SubmitWithdrawState.amountValue, "0");
                    SubmitWithdrawDispatch({ type: "fee", fee: "0" });
                  }
                }
              } else {
                message.warning(rest.message);
              }
            }
            return;
          });
      } else {
        if (SubmitWithdrawState.inputValue === "") {
          SubmitWithdrawDispatch({
            type: "errorMessage",
            errorMessage: props.intl.formatMessage({
              id: "address_empty_error",
            }),
          });
          SubmitWithdrawDispatch({ type: "addressNot", addressNot: true });
        }
        if (
          SubmitWithdrawState.amountValue === "" ||
          parseFloat(SubmitWithdrawState.amountValue) === 0
        ) {
          SubmitWithdrawDispatch({ type: "amountNot", amountNot: true });
          SubmitWithdrawDispatch({
            type: "amountError",
            amountError: props.intl.formatMessage({ id: "amount_error" }),
          });
        }
      }
    } else {
      SubmitWithdrawDispatch({
        type: "tfaModelVisable",
        tfaModelVisable: true,
      });
    }
  };
  const saveAddress = () => {
    SubmitWithdrawState.inputValue &&
      SubmitWithdrawDispatch({ type: "visable", visable: true });
  };
  useEffect(() => {
    const data = {
      network: SubmitWithdrawState.activeNetwork,
      instrumentId: props.withdrawCoin,
    };
    value.coinNetwork &&
      value.coinNetwork.map((i) => {
        if (
          SubmitWithdrawState.activeNetwork &&
          i.netWorks[0].network === SubmitWithdrawState.activeNetwork
        ) {
          return SubmitWithdrawDispatch({
            type: "hasTwoPartAddress",
            hasTwoPartAddress: i.hasTwoPartAddress,
          });
        }
        return SubmitWithdrawDispatch({
          type: "hasTwoPartAddress",
          hasTwoPartAddress: value.coinNetwork[0].hasTwoPartAddress,
        });
      });
    if (data.network && data.network !== "--") {
      getWithdrawAddress(data).then((res) => {
        if (res.success) {
          const arr: IAddress[] = [];
          res.data.map((i: IAddressType) => {
            if (i.network === SubmitWithdrawState.activeNetwork) {
              arr.push({
                address: i.address,
                label: i.walletLabel,
                tag: i.tag,
                network: i.network,
                isWhiteList: i.isWhiteList,
              });
              return arr;
            }
            return false;
          });
          SubmitWithdrawDispatch({ type: "coinAddress", coinAddress: arr });
        } else {
          message.warning(res.message);
        }
      });
    }
    // eslint-disable-next-line
  }, [SubmitWithdrawState.update, SubmitWithdrawState.activeNetwork]);
  useEffect(() => {
    SubmitWithdrawDispatch({ type: "inputValue", inputValue: "" });
    SubmitWithdrawDispatch({
      type: "amountValue",
      amountValue: "",
    });
    SubmitWithdrawDispatch({
      type: "coinAddress",
      coinAddress: [],
    });
    SubmitWithdrawDispatch({
      type: "fee",
      fee: "",
    });
    SubmitWithdrawDispatch({
      type: "willAmount",
      willAmount: "--",
    });
    SubmitWithdrawDispatch({
      type: "minWithdraw",
      minWithdraw: "--",
    });
    SubmitWithdrawDispatch({ type: "memoValue", memoValue: "" });
    SubmitWithdrawDispatch({ type: "amountNot", amountNot: false });
    SubmitWithdrawDispatch({ type: "addressNot", addressNot: false });
    const data = {
      instrumentId: props.withdrawCoin,
      network: SubmitWithdrawState.activeNetwork,
    };
    if (data.network && SubmitWithdrawState.activeNetwork !== "--") {
      getMinwithdraw(data).then((res) => {
        if (res.success) {
          SubmitWithdrawDispatch({
            type: "minWithdraw",
            minWithdraw: res.data.withdrawMinValue,
          });
        }
      });
    }
    // eslint-disable-next-line
  }, [SubmitWithdrawState.activeNetwork]);
  useEffect(() => {
    SubmitWithdrawDispatch({
      type: "maxWithdraw",
      maxWithdraw: "--",
    });
    maxWithdraw(props.withdrawCoin).then((res) => {
      if (res.success) {
        SubmitWithdrawDispatch({
          type: "maxWithdraw",
          maxWithdraw: res.data,
        });
      } else {
        message.warning(res.message);
      }
    });
    SubmitWithdrawDispatch({ type: "activeNetwork", activeNetwork: "" });
  }, [props.withdrawCoin, SubmitWithdrawState.refash]);
  const maxClick = () => {
    SubmitWithdrawDispatch({
      type: "amountValue",
      amountValue:
        parseFloat(SubmitWithdrawState.maxWithdraw) > 0
          ? parseFloat(SubmitWithdrawState.maxWithdraw)
          : 0,
    });
    SubmitWithdrawDispatch({ type: "amountNot", amountNot: false });
    getWithdrawFee(
      parseFloat(SubmitWithdrawState.maxWithdraw) > 0
        ? parseFloat(SubmitWithdrawState.maxWithdraw).toString()
        : "0",
      SubmitWithdrawState.inputValue
    );
  };
  const getWithdrawFee = debounces(
    (amountValue: string, inputValue: string) => {
      const params = {
        withdrawAddress: inputValue,
        amount: amountValue,
        instrumentId: value.coin,
        network: SubmitWithdrawState.activeNetwork,
      };
      if (
        inputValue &&
        amountValue &&
        Number(amountValue) > 0 &&
        !SubmitWithdrawState.addressNot &&
        params.network &&
        params.network !== "--"
      ) {
        getFee(params).then((res) => {
          if (res.success) {
            if (Object.entries(res.data).length) {
              if (
                (Number(res.data.medium) >= Number(amountValue) &&
                  Number(SubmitWithdrawState.maxWithdraw) -
                    Number(amountValue) <
                    Number(res.data.medium)) ||
                Number(SubmitWithdrawState.maxWithdraw) < Number(amountValue)
              ) {
                SubmitWithdrawDispatch({ type: "amountNot", amountNot: true });
                SubmitWithdrawDispatch({
                  type: "amountError",
                  amountError: messageError(35039),
                });
                SubmitWithdrawDispatch({
                  type: "fee",
                  fee: res.data.medium,
                });
                SubmitWithdrawDispatch({
                  type: "willAmount",
                  willAmount: "--",
                });
              } else {
                SubmitWithdrawDispatch({ type: "amountNot", amountNot: false });
                SubmitWithdrawDispatch({
                  type: "fee",
                  fee: res.data.medium,
                });
                willWithdraw(amountValue, res.data.medium);
              }
            } else {
              willWithdraw(amountValue, "0");
              SubmitWithdrawDispatch({ type: "fee", fee: "0" });
            }
          } else {
            message.warning(res.message);
          }
        });
      }
    },
    500
  );
  const willWithdraw = (amountValue: string, fee: string) => {
    if (
      Number(SubmitWithdrawState.maxWithdraw) - Number(amountValue) >=
      Number(fee)
    ) {
      SubmitWithdrawDispatch({
        type: "willAmount",
        willAmount: `${toCoinAccuracy(
          amountValue,
          value.coinAccuracy[props.withdrawCoin]
        )}`,
      });
    } else {
      SubmitWithdrawDispatch({
        type: "willAmount",
        willAmount: `${toCoinAccuracy(
          new Decimal(Number(amountValue)).sub(new Decimal(Number(fee))),
          value.coinAccuracy[props.withdrawCoin]
        )}`,
      });
    }
  };
  const onTabChange = (key: string) => {
    if (key !== SubmitWithdrawState.activeNetwork) {
      SubmitWithdrawDispatch({ type: "activeNetwork", activeNetwork: key });
      SubmitWithdrawDispatch({ type: "disableInput", disableInput: false });
      // setIsMetaMaskWithdraw(false);
      if (
        isMetaMaskWithdraw &&
        dashboardUserData.accountSource === "METAMASK" &&
        !dashboardUserData.bindEmail
      ) {
        SubmitWithdrawDispatch({ type: "disableInput", disableInput: true });
      }
    }
    SubmitWithdrawDispatch({ type: "amountNot", amountNot: false });
  };
  const onMemoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    SubmitWithdrawDispatch({ type: "memoValue", memoValue: value });
    if (value.length < 256) {
      SubmitWithdrawDispatch({ type: "memoError", memoError: "" });
      return;
    }
    SubmitWithdrawDispatch({
      type: "memoError",
      memoError: "MEMO format is incorrect",
    });
  };

  const useMetaMaskWithdraw = useCallback((address: string) => {
    setIsMetaMaskWithdraw(true);
    SubmitWithdrawDispatch({ type: "inputValue", inputValue: address });
    SubmitWithdrawDispatch({ type: "disableInput", disableInput: true });
    SubmitWithdrawDispatch({ type: "amountNot", amountNot: false });
  }, []);

  const operations = useMemo(() => {
    if (dashboardUserData && dashboardUserData.accountSource === "METAMASK") {
      if (
        (SubmitWithdrawState.activeNetwork.toUpperCase() === "ERC20" ||
          SubmitWithdrawState.activeNetwork.toUpperCase() === "ETH") &&
        SubmitWithdrawState.activeNetwork !== ""
      ) {
        return <WithdrawMetaMask useMetaMaskWithdraw={useMetaMaskWithdraw} />;
      }
    }
    return null;
  }, [
    dashboardUserData,
    SubmitWithdrawState.activeNetwork,
    useMetaMaskWithdraw,
  ]);

  useEffect(() => {
    SubmitWithdrawDispatch({ type: "disableInput", disableInput: false });
  }, [SubmitWithdrawState.activeNetwork, props.withdrawCoin]);

  useEffect(() => {
    if (SubmitWithdrawState.activeNetwork === "") {
      const currentNet = value.coinNetwork[0];
      if (
        currentNet &&
        currentNet.netWorks &&
        currentNet.netWorks[0] &&
        currentNet.netWorks[0].network &&
        currentNet.netWorks[0].network !== "--"
      ) {
        SubmitWithdrawDispatch({
          type: "activeNetwork",
          activeNetwork: currentNet.netWorks[0].network,
        });
      }
    }
  }, [SubmitWithdrawState.activeNetwork, value.coinNetwork]);

  useEffect(() => {
    if (
      dashboardUserData &&
      dashboardUserData.accountSource === "METAMASK" &&
      !dashboardUserData.bindEmail &&
      (SubmitWithdrawState.activeNetwork.toUpperCase() === "ERC20" ||
        SubmitWithdrawState.activeNetwork.toUpperCase() === "ETH")
    ) {
      SubmitWithdrawDispatch({
        type: "inputValue",
        inputValue: dashboardUserData.publicAddress,
      });
      SubmitWithdrawDispatch({ type: "disableInput", disableInput: true });
      setIsMetaMaskWithdraw(true);
      setShowAddressLink(false);
    } else {
      SubmitWithdrawDispatch({ type: "disableInput", disableInput: false });
      setIsMetaMaskWithdraw(false);
    }
  }, [
    dashboardUserData.accountSource,
    SubmitWithdrawState.activeNetwork,
    dashboardUserData,
  ]);
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
  const submitWithdrawMetamask = useCallback(() => {
    const params: any = {
      withdrawAddress: SubmitWithdrawState.inputValue,
      amount: SubmitWithdrawState.amountValue,
      instrumentId: value.coin,
      feeLevel: "medium",
      fee: SubmitWithdrawState.fee,
      network: SubmitWithdrawState.activeNetwork,
      tag: SubmitWithdrawState.memoValue,
      isMetaMask:
        SubmitWithdrawState.inputValue === dashboardUserData.publicAddress
          ? true
          : false,
    };

    submitWithdraw(params, "").then((res) => {
      if (res.success) {
        // callBack(props.intl.formatMessage({id:'success'}));
        setRefresh(true);
        message.success(props.intl.formatMessage({ id: "success" }));
      } else {
        message.warning(res.message);
      }
    });
  }, [
    SubmitWithdrawState.activeNetwork,
    SubmitWithdrawState.amountValue,
    SubmitWithdrawState.fee,
    SubmitWithdrawState.inputValue,
    SubmitWithdrawState.memoValue,
    props.intl,
    value.coin,
    dashboardUserData.publicAddress,
  ]);

  const transactionFee = useMemo(() => {
    if (
      Number(SubmitWithdrawState.amountValue) <
        Number(SubmitWithdrawState.minWithdraw) ||
      Number(SubmitWithdrawState.amountValue) >
        Number(SubmitWithdrawState.maxWithdraw)
    ) {
      return "--";
    }
    if (SubmitWithdrawState.inputValue && SubmitWithdrawState.amountValue) {
      if (SubmitWithdrawState.fee) {
        return `${SubmitWithdrawState.fee} ${renderCoin}`;
      }
      return <SmallLoadding />;
    }
    return "--";
  }, [
    SubmitWithdrawState.inputValue,
    SubmitWithdrawState.amountValue,
    SubmitWithdrawState.fee,
    renderCoin,
    SubmitWithdrawState.minWithdraw,
    SubmitWithdrawState.maxWithdraw,
  ]);

  const transactionReceive = useMemo(() => {
    if (
      Number(SubmitWithdrawState.amountValue) <
        Number(SubmitWithdrawState.minWithdraw) ||
      Number(SubmitWithdrawState.amountValue) >
        Number(SubmitWithdrawState.maxWithdraw)
    ) {
      return "--";
    }
    // Number(SubmitWithdrawState.minWithdraw) && Number(e.target.value) > Number(SubmitWithdrawState.maxWithdraw)
    if (SubmitWithdrawState.inputValue && SubmitWithdrawState.amountValue) {
      if (SubmitWithdrawState.willAmount === "--") {
        return <SmallLoadding />;
      }
      return `${SubmitWithdrawState.willAmount} ${renderCoin}`;
    }
    return "--";
  }, [
    SubmitWithdrawState.inputValue,
    SubmitWithdrawState.amountValue,
    SubmitWithdrawState.willAmount,
    renderCoin,
    SubmitWithdrawState.minWithdraw,
    SubmitWithdrawState.maxWithdraw,
  ]);

  return (
    <div className="submit-withdraw">
      <div className="address-management">
        {showAddressLink ? (
          <span
            onClick={() => {
              history.push("/home/security/addressManagement");
            }}
          >
            {props.intl.formatMessage({ id: "Address_Management" })}
          </span>
        ) : null}
      </div>
      <div className="submit-withdraw-box">
        <div className="withdraw-submit-box">
          <div className="box-title">
            {props.intl.formatMessage({ id: "Network" })}:
          </div>
          {showAddressLink ? (
            <span
              className="box-save-address"
              onClick={saveAddress}
              style={
                SubmitWithdrawState.inputValue
                  ? {
                      color: "#318BF5",
                      borderBottom: "1px dashed #318BF5",
                    }
                  : {
                      color: "#e5dff5",
                      borderBottom: "1px dashed #e5dff5",
                    }
              }
            >
              {props.intl.formatMessage({ id: "Save_address" })}
            </span>
          ) : null}
        </div>
        <Tabs
          activeKey={SubmitWithdrawState.activeNetwork}
          onChange={onTabChange}
          tabBarExtraContent={operations}
        >
          {value.coinNetwork.map((i: { netWorks: { network: string }[] }) => {
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
                  tab={i.netWorks[0].network}
                  key={i.netWorks[0].network}
                ></TabPane>
              );
            }
          })}
        </Tabs>
        <div className="box-address">
          <div className="address-title">
            {props.dashboardUserData.enableWithdrawalWhiteList &&
            !SubmitWithdrawState.coinAddress.length
              ? props.intl.formatMessage({ id: "whitelisted_addresses" })
              : props.intl.formatMessage(
                  { id: "coin_address" },
                  { coin: renderCoin }
                )}
          </div>
          <Dropdown
            overlay={
              SubmitWithdrawState.coinAddress.length ? menu : <span></span>
            }
            trigger={["click"]}
            getPopupContainer={(triggerNode) => triggerNode}
            overlayStyle={
              SubmitWithdrawState.coinAddress.length ? {} : { border: "none" }
            }
          >
            <span className="ant-dropdown-link">
              <Input
                prefix={
                  <MetaMaskLogo
                    SubmitWithdrawState={SubmitWithdrawState}
                    isMetaMaskWithdraw={isMetaMaskWithdraw}
                  />
                }
                onChange={onChange}
                style={
                  SubmitWithdrawState.addressNot
                    ? { border: "1px solid #d13051" }
                    : {}
                }
                // disabled={isAddressIsDisabled}
                data-type="address"
                value={SubmitWithdrawState.inputValue}
                suffix={<DownOutlined onClick={(e) => e.preventDefault()} />}
              />
            </span>
          </Dropdown>
          {SubmitWithdrawState.addressNot && (
            <div className="address-message">
              {SubmitWithdrawState.errorMessage}
            </div>
          )}
        </div>
        {SubmitWithdrawState.hasTwoPartAddress && (
          <div className="with-memo">
            <div className="memo">
              {props.intl.formatMessage({ id: "memo" })}{" "}
              <Tooltip
                placement={"right"}
                autoAdjustOverflow={false}
                title={
                  <div className="depo-tootip">
                    {props.intl.formatMessage({ id: "memo_message" })}
                  </div>
                }
              >
                <ExclamationCircleOutlined />
              </Tooltip>
            </div>
            <Input
              style={{
                border: `1px solid ${
                  SubmitWithdrawState.memoError ? "#d13051" : "#28284d"
                }`,
              }}
              // type={"number"}
              disabled={
                props.dashboardUserData.enableWithdrawalWhiteList ||
                SubmitWithdrawState.disableInput
              }
              value={SubmitWithdrawState.memoValue}
              onChange={onMemoChange}
            />
            <div className="memo-error">{SubmitWithdrawState.memoError}</div>
          </div>
        )}
        <div className="box-amount">
          <div className="amount-title">
            <span>{props.intl.formatMessage({ id: "Amount" })}</span>
            <div className="est-withdraw">
              {/* <TooltipGlobal
                title={`${props.intl.formatMessage({
                  id: "When LTV is equal to 0, Max withdraw=a=Available balance",
                  defaultMessage:
                    "When LTV is equal to 0, Max withdraw=a=Available balance",
                })};
${props.intl.formatMessage({
  id: "When LTV is not equal to 0, Max withdraw=MIN((Collateral-Portflio margin) /Mark price * LTV, Available)",
  defaultMessage:
    "When LTV is not equal to 0, Max withdraw=MIN((Collateral-Portflio margin) /Mark price * LTV, Available)",
})}`}
              > */}
              <span className="est-text">
                {props.intl.formatMessage({
                  id: "Est.max withdraw",
                  defaultMessage: "Est.max withdraw",
                })}
                :{" "}
              </span>{" "}
              {toThousands(SubmitWithdrawState.maxWithdraw)} {renderCoin}
              {/* </TooltipGlobal> */}
            </div>
          </div>
          <Input
            onChange={onChange}
            style={
              SubmitWithdrawState.amountNot
                ? { border: "1px solid #d13051" }
                : {}
            }
            type={"number"}
            suffix={
              <span onClick={maxClick}>
                {props.intl.formatMessage({ id: "MAX" })}
              </span>
            }
            value={SubmitWithdrawState.amountValue}
            data-type="amount"
          />
          <div className="amount-message">
            {SubmitWithdrawState.amountNot && (
              <span>{SubmitWithdrawState.amountError}</span>
            )}
          </div>
        </div>
        <div className="withdraw-minmum">
          <div className="withdraw-minmum-div">
            <span>
              {props.intl.formatMessage({ id: "Minimum_Withdrawal" })}:
            </span>
            <span>
              {SubmitWithdrawState.minWithdraw} {renderCoin}
            </span>
          </div>
          <span className="withdraw-minmum-span">
            {props.intl.formatMessage({ id: "avbl" })}:{" "}
            {value.withdrawBalance.availableBalance === "--"
              ? "--"
              : toThousands(
                  toAccuracyNum(value.withdrawBalance.availableBalance)
                )}
          </span>
        </div>
        <div className="withdraw-address-box">
          <div className="fee">
            <span>{props.intl.formatMessage({ id: "Transaction_Fee" })}:</span>
            <span>{transactionFee}</span>
          </div>
          <div className="you-get">
            <span>{props.intl.formatMessage({ id: "receive" })}:</span>
            <span>{transactionReceive}</span>
          </div>
        </div>
        {value.coin === "CFV" && (
          <div className="address-message">
            <div className="address-message-title">
              Send CFV only to your own Metamask wallet
            </div>
            <div className="address-message-subtitle">
              CFV can be transferred only once. Send it to the wallet you will
              use for Snapshot voting. Token recovery after sending to incorrect
              destination is not possible.
            </div>
          </div>
        )}

        <Button
          className="withdraw-submit"
          loading={SubmitWithdrawState.loading}
          disabled={props.dashboardUserData?.copperAccount ? true : false}
          style={
            props.dashboardUserData?.copperAccount
              ? { background: "rgba(49, 139, 245, 0.5)" }
              : {}
          }
          onClick={submit}
        >
          {props.intl.formatMessage({ id: "Submit" })}
        </Button>
      </div>
      {SubmitWithdrawState.visable && (
        <WithdrawSaveAddress
          visable={SubmitWithdrawState.visable}
          onCloseModel={() => {
            SubmitWithdrawDispatch({ type: "visable", visable: false });
          }}
          address={SubmitWithdrawState.inputValue}
          tag={SubmitWithdrawState.memoValue}
          network={SubmitWithdrawState.activeNetwork}
          callBack={(e) => {
            SubmitWithdrawDispatch({
              type: "update",
              update: !SubmitWithdrawState.update,
            });
          }}
        />
      )}
      {SubmitWithdrawState.withdrawRequestVisable && (
        <WithdrawalRequest
          visable={SubmitWithdrawState.withdrawRequestVisable}
          renderCoin={renderCoin}
          onCloseModel={() => {
            SubmitWithdrawDispatch({
              type: "withdrawRequestVisable",
              withdrawRequestVisable: false,
            });
          }}
          metamaskWithdraw={dashboardUserData.accountSource === "METAMASK"}
          enableTfa={props.dashboardUserData.enableTfa}
          submitWithdrawMetamask={submitWithdrawMetamask}
          callBack={() => {
            SubmitWithdrawDispatch({
              type: "tfaVerification",
              tfaVerification: true,
            });
          }}
          address={SubmitWithdrawState.inputValue}
          willAmount={SubmitWithdrawState.willAmount}
          coin={value.coin}
          fee={SubmitWithdrawState.fee}
        />
      )}
      {SubmitWithdrawState.tfaModelVisable && (
        <TwoFAModal
          visible={SubmitWithdrawState.tfaModelVisable}
          handlerCallback={() => {
            SubmitWithdrawDispatch({
              type: "tfaModelVisable",
              tfaModelVisable: false,
            });
          }}
        />
      )}
      {SubmitWithdrawState.tfaVerification && (
        <ValidationWithdraw
          address={SubmitWithdrawState.inputValue}
          amount={SubmitWithdrawState.amountValue}
          coin={value.coin}
          visable={SubmitWithdrawState.tfaVerification}
          fee={SubmitWithdrawState.fee}
          network={SubmitWithdrawState.activeNetwork}
          tag={SubmitWithdrawState.memoValue}
          onCloseModel={() => {
            SubmitWithdrawDispatch({
              type: "tfaVerification",
              tfaVerification: false,
            });
          }}
          callBack={() => {
            SubmitWithdrawDispatch({ type: "inputValue", inputValue: "" });
            SubmitWithdrawDispatch({ type: "amountValue", amountValue: "" });
            SubmitWithdrawDispatch({ type: "willAmount", willAmount: "--" });
            SubmitWithdrawDispatch({ type: "memoValue", memoValue: "" });
            SubmitWithdrawDispatch({
              type: "refash",
              refash: !SubmitWithdrawState.refash,
            });
          }}
        ></ValidationWithdraw>
      )}
    </div>
  );
}
const mapStateToProps = (state: ISubmitWithdrawProps) => {
  return {
    withdrawCoin: state.withdrawCoin,
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SubmitWithdraw));

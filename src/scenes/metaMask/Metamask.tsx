import React, { useCallback, useEffect, useState, memo, useRef } from "react";
import { connect } from "react-redux";
import ModelViewer from "@metamask/logo";
import { ethers } from "ethers";
import { Button, message } from "antd";
import {
  setIsLogin,
  setProvider,
  setSubAccouts,
  switchLoginActiveTab,
  setMateMaskAddress,
  setUser,
  setDashboardUserData,
  setTfaList
} from "../../store/actions/publicAction";
import {
  getNonce,
  verifySignature,
  UserData,
  getBindAddress,
  geetestInit
} from "service/http/http";
import history from "../../router/history";
import messageError from "utils/errorCode";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage
} from "react-intl";

import { defaultDashboardUserData } from "./data";
import { localStorage, geetestValidatePackage } from "utils";
import "./metamask.scss";
import gt from "utils/gt";

type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;

const MetaMask = memo(
  (IProps: TStateProps & TDispatchProps & WrappedComponentProps) => {
    const [loading, setLoading] = useState(false);
    // const [isBindchecked, setIsBindchecked] = useState(false);
    const {
      switchLoginActiveTab,
      setMateMaskAddress,
      intl,
      dashboardUserData,
      isLogin,
      users,
      loginActiveTab,
      mateMaskSelectedAddress,
      setUser,
      setDashboardUserData,
      setTfaList
    } = IProps;

    const [checked, setCheck] = useState(false);
    // const [isRegister, setIsRegister] = useState(false);
    const [reTryCount, setReTryCount] = useState(0);
    const addressUser = useRef("");
    // const [isBanded, setIsBanded] = useState(false);
    localStorage.set("metamaskAddress", "");

    useEffect(() => {
      const viewer = ModelViewer({
        pxNotRatio: true,
        width: 100,
        height: 100,
        followMouse: false,
        slowDrift: false
      });
      const container = document.getElementById("logo-container");
      if (container) {
        container.appendChild(viewer.container);
        viewer.lookAt({
          x: 100,
          y: 100
        });
        viewer.setFollowMouse(true);
        viewer.stopAnimation();
      }
    }, []);

    const getUserData = useCallback(async () => {
      if (isLogin && users) {
        const response = await UserData();
        if (response) {
          if (response && response.code === "0000") {
            setDashboardUserData(response.data);
            history.push("/home");
          } else {
            setDashboardUserData(defaultDashboardUserData);
            message.error(messageError(response.code));
            switchLoginActiveTab("login");
            localStorage.set("metamaskAddress", "");
            // history.push("/login");
          }
        }
      }
    }, [isLogin, setDashboardUserData, switchLoginActiveTab, users]);

    const isCheck = useCallback(
      (e: any) => {
        setCheck(!checked);
      },
      [checked, setCheck]
    );

    // const getAddress = useCallback(async () => {
    //   // eth.enable();
    //   try {
    //     const win: any = window;
    //     const eth = window.ethereum || win.web3.currentProvider;
    //     const ethProvider = new ethers.providers.Web3Provider(eth);
    //     const signer = ethProvider.getSigner();
    //     const address = await signer.getAddress();
    //     const account = address;
    //     if (account) {
    //       setIsBindchecked(true);
    //       const res = await getBindAddress(account);
    //       if (res) {
    //         setIsRegister(true);
    //       } else {
    //         setIsRegister(false);
    //       }
    //     }
    //   } catch (err) {}

    //   // getUserData();
    // }, []);

    useEffect(() => {
      if (
        !mateMaskSelectedAddress ||
        mateMaskSelectedAddress !== dashboardUserData.publicAddress
      ) {
        getUserData();
      }
    }, [dashboardUserData.publicAddress, getUserData, mateMaskSelectedAddress]);

    // useEffect(() => {
    //   if (
    //     (!isLogin && !isBindchecked) ||
    //     (!isBindchecked && !mateMaskSelectedAddress)
    //   ) {
    //     getAddress();
    //   }
    // }, [
    //   getAddress,
    //   isRegister,
    //   isLogin,
    //   isBindchecked,
    //   mateMaskSelectedAddress
    // ]);

    /*useEffect(() => {
    if (loginActiveTab === "metaMaskRegister" && isRegister) {
      message.warning(
        intl.formatMessage({ id: 'The address is already registered, please login', defaultMessage: 'The address is already registered, please login' })
      );
    }
  }, [loginActiveTab, isRegister, intl]);
*/
    //
    /*const isCheck = useCallback((e: any) => {
    setCheck(!checked);
  }, [checked, setCheck]);*/

    const useMetamaskLogin = useCallback(async () => {
      const reCount = reTryCount + 1;
      setReTryCount(reCount);
      try {
        const win: any = window;
        const eth = window.ethereum || win.web3.currentProvider;
        if (eth) {
          eth.enable();
          const ethProvider = new ethers.providers.Web3Provider(eth);
          const signer = ethProvider.getSigner();
          const address = await signer.getAddress();
          const isRegist = await getBindAddress(address);
          if (loginActiveTab === "metaMaskRegister" && isRegist) {
            message.warning(
              intl.formatMessage({
                id: "The address is already registered, please login",
                defaultMessage:
                  "The address is already registered, please login"
              })
            );
            setLoading(false);
            return;
          }
          if (loginActiveTab === "metaMaskLogin" && !isRegist) {
            message.warning(
              intl.formatMessage({
                id: "The address is not registered, please register",
                defaultMessage: "The address is not registered, please register"
              })
            );
            setLoading(false);
            return;
          }
          if (address) {
            const nonce = await getNonce(address);
            if (nonce) {
              setMateMaskAddress(address);
              const signature = await signer.signMessage(nonce);
              // console.log("signature:", signature);
              const data: ISignatureVerification = {
                publicAddress: address,
                signature
              };
              // console.log("verifySignature", address,  signature);
              if (signature) {
                const gtResult = await geetestInit(address);
                addressUser.current = address;
                gtResult &&
                  gt.initGeetest(
                    {
                      gt: gtResult.gt,
                      challenge: gtResult.challenge,
                      offline: !gtResult.success, // 表示用户后台检测极验服务器是否宕机
                      new_captcha: gtResult.new_captcha, // 用于宕机时表示是新验证码的宕机
                      product: "bind", // 产品形式，包括：float，popup
                      lang: "en",
                      width: "300px",
                      https: true
                    },
                    // @ts-ignore
                    // tslint:disable-next-line: no-use-before-declare
                    (e: any) => {
                      handler(e, data);
                    }
                  );
              } else {
                setLoading(false);
                localStorage.set("metamaskAddress", "");
                message.warning(
                  intl.formatMessage({
                    id: "MetaMask Connect failed, place try again"
                  })
                );
              }
            } else {
              setLoading(false);
              localStorage.set("metamaskAddress", "");
              message.warning(
                intl.formatMessage({
                  id: "MetaMask create failed, place try again"
                })
              );
            }
          } else {
            if (reTryCount > 3) {
              setLoading(false);
              message.warning(
                intl.formatMessage({
                  id: "MetaMask open failed, place try again-refresh"
                })
              );
            } else {
              useMetamaskLogin();
            }
          }
        } else {
          setLoading(false);
          message.warning(
            intl.formatMessage({
              id: "MetaMask open failed, place try again-refresh"
            })
          );
        }
      } catch (err) {
        console.log(err, err.message);
        setLoading(false);
        /*console.log(err, err.message, err.code);
    if(err && err.message && err.code){
      message.warning(
        err.message
      );
    }*/
        if (err && err.message && err.message.indexOf("unknown account") >= 0) {
          message.error(
            intl.formatMessage({
              id: "If MetaMask fails to open, it may be locked or MetaMask is not installed",
              defaultMessage:
                "If MetaMask fails to open, it may be locked or MetaMask is not installed"
            })
          );
        }
      }
    }, [setMateMaskAddress, setUser, intl, setReTryCount, reTryCount]);
    const handler = (obj: object, p: any) => {
      const data = {
        email: addressUser.current,
        geetestType: "METAMASK_LOGIN"
      };
      geetestValidatePackage(
        obj,
        data,
        async () => {
          const user = await verifySignature(p);
          // console.log("verifySignature user");
          // console.log(user);
          if (user) {
            setTfaList(user.tfaTypes || []);
            if (user.enableTfa) {
              setTimeout(() => {
                setLoading(false);
                history.push({
                  pathname: "/loginTfa",
                  state: { data: user }
                });
              }, 1000);
            } else {
              localStorage.set("user", user);
              setUser(user, "storage"); //
              localStorage.set("metamaskAddress", user.accountName);
              setIsLogin(true);
              setSubAccouts();
              // switchLoginActiveTab("login");
              // setLoading(false);
              // switchLoginActiveTab("login");
              setTimeout(() => {
                history.push("/home");
              }, 1200);
              // history.push('/home');
              // window.location.href = window.location.origin + "/user-console/home";
            }
          } else {
            setLoading(false);
            localStorage.set("metamaskAddress", "");
            message.warning(
              intl.formatMessage({
                id: "MetaMask Login failed, place try again"
              })
            );
          }
        },
        () => {
          setLoading(false);
          localStorage.set("metamaskAddress", "");
        }
      );
    };
    const onConnectHandler = useCallback(async () => {
      const win: any = window;
      const eth = window.ethereum || win.web3?.currentProvider;
      if (!eth) {
        message.error(
          intl.formatMessage({
            id: "If MetaMask fails to open, it may be locked or MetaMask is not installed",
            defaultMessage:
              "If MetaMask fails to open, it may be locked or MetaMask is not installed"
          })
        );
        return;
      }
      if (loginActiveTab === "metaMaskRegister" && !checked) {
        message.warning(intl.formatMessage({ id: "PleaseAgreeTo" }));
        return;
      }
      try {
        if (eth) {
          const account = await eth.request({ method: "eth_accounts" });
          if (account) {
            setLoading(true);
            useMetamaskLogin();
          }
        } else {
          message.error(
            intl.formatMessage({ id: "MetaMask Login failed, place try again" })
          );
        }
      } catch (err) {
        message.error(
          intl.formatMessage({ id: "MetaMask Login failed, place try again" })
        );
      }
    }, [loginActiveTab, checked, intl, useMetamaskLogin]);

    const toRegister = useCallback(() => {
      switchLoginActiveTab("metaMaskRegister");
      history.push("/register");
    }, [switchLoginActiveTab]);

    const toLogin = useCallback(() => {
      switchLoginActiveTab("metaMaskLogin");
      history.replace("/login");
    }, [switchLoginActiveTab]);

    return (
      <div className={"metamask-wrapper"}>
        <div id={"logo-container"} />
        {loginActiveTab === "metaMaskRegister" ? (
          <div className="metamask-bind-sub-desc">
            <div className="metamask-bind-terms" onChange={isCheck}>
              <div className={`terms-select-radio`}>
                <span
                  className={`terms-select-item ${
                    checked ? "terms-select" : "terms-no-select"
                  }`}
                  onClick={isCheck}
                >
                  <FormattedMessage
                    id="I agree to"
                    defaultMessage="I agree to"
                  />
                </span>
                <span
                  className="terms-select-item-text-link"
                  onClick={() => {
                    window.open("https://OPNX.com/terms-of-service/");
                  }}
                >
                  Open Exchange Terms of Service.
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <Button
          className="btn-gradient"
          type="primary"
          disabled={loading}
          loading={loading}
          onClick={onConnectHandler}
        >
          <FormattedMessage id="Connect" defaultMessage="Connect" />
        </Button>
        <div className="have-account-to-login">
          <label htmlFor="" className="account-yet">
            <FormattedMessage
              id="Already have an account"
              defaultMessage="Already have an account"
            />
            ,
          </label>
          {loginActiveTab === "metaMaskRegister" ? (
            <label className="to-login-link" onClick={toLogin}>
              <FormattedMessage id="to_login" defaultMessage="to_login" />
            </label>
          ) : (
            <label className="to-login-link" onClick={toRegister}>
              <FormattedMessage id="Register" defaultMessage="Register" />
            </label>
          )}
        </div>
      </div>
    );
  }
);

const mapStateToProps = (state: IGlobalT) => ({
  users: state.users,
  dashboardUserData: state.dashboardUserData,
  isLogin: state.isLogin,
  loginActiveTab: state.loginActiveTab,
  mateMaskSelectedAddress: state.mateMaskSelectedAddress
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
    setProvider(p: any) {
      dispatch(setProvider(p));
    },
    async setUser(data: any, type?: string) {
      const res = await dispatch(setUser(data, type));
      return Promise.resolve(res);
    },
    setIsLogin(i: boolean) {
      dispatch(setIsLogin(i));
    },
    setSubAccouts() {
      dispatch(setSubAccouts());
    },
    switchLoginActiveTab(data: string) {
      dispatch(switchLoginActiveTab(data));
    },
    setMateMaskAddress(data: string) {
      dispatch(setMateMaskAddress(data));
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
    setTfaList(data: string[]) {
      dispatch(setTfaList(data));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MetaMask));

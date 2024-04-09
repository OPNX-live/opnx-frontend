import React, { useState, useEffect, useCallback, memo } from 'react';
import { LoadingOutlined} from "@ant-design/icons";
import { connect } from 'react-redux';
import ModelViewer from "@metamask/logo";
import { Card, Avatar, message } from 'antd';
import { setIsLogin, setSubAccouts, setUser, switchLoginActiveTab, setMateMaskAddress, setDashboardUserData } from "../../../store/actions/publicAction";
import { getNonce, verifySignature } from "service/http/http";
import { getEthereumProvider } from "utils/ethProvider";
import './index.scss';
import UserPlus  from "assets/image/user_plus.svg";

import history from "router/history";
import { localStorage } from "utils";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from 'react-intl';


type IRegisterPropsState = ReturnType<typeof mapStateToProps>;
type IRegisterDispatchState = ReturnType<typeof mapDispatchToProps>;
const MetaMaskBind = memo(({ 
  intl,
  setIsLogin, 
  setSubAccouts, 
  setUser,
  switchLoginActiveTab, 
  setMateMaskAddress
}: IRegisterPropsState & IRegisterDispatchState & WrappedComponentProps) => {
  const [loading, setLoading] = useState(false);
  const [checked, setCheck] = useState(true);
  // const [isMetamaskLogin, setMetamaskLogin] = useState(false);
  
  useEffect(() => {
    const viewer = ModelViewer({
      pxNotRatio: true,
      width: 70,
      height: 70,
      followMouse: true,
      slowDrift: true,
    });
    const container = document.getElementById("metamask-logo-container");
    if (container) {
      container.appendChild(viewer.container);
      viewer.lookAt({
        x: 100,
        y: 100,
      });
      viewer.setFollowMouse(true);
      viewer.stopAnimation();
    }
  }, []);

  const isCheck = useCallback((e: any) => {
    setCheck(!checked);
  }, [checked, setCheck]);

  const toRegister = useCallback(async () => {
    if (!checked) {
      message.warning(
        intl.formatMessage({ id: "PleaseAgreeTo" })
      );
      return;
    }
    setLoading(true);
    const ethProvider  = await getEthereumProvider();
    try {
      if (ethProvider) {
        const signer = ethProvider.getSigner();
        const address = await signer.getAddress();
        if (address) {
          
          const nonce = await getNonce(address);
      
          if (nonce) {
            setMateMaskAddress(address);
            const signature = await signer.signMessage(nonce);
            // console.log("signature:", signature);
            const data: ISignatureVerification = {
              publicAddress: address,
              signature,
            };
            // console.log("verifySignature", address,  signature);
            if (signature) {
              const user = await verifySignature(data);
              // console.log("verifySignature user");
              // console.log(user);
              if (user) {
                localStorage.set("user", user);
                setUser(user, "storage"); // 
                setIsLogin(true);
                setSubAccouts();
                // switchLoginActiveTab("login");
                setTimeout(() => {
                  history.push('/home');
                }, 1200);
                setLoading(false);
                // history.push('/home');
                // window.location.href = window.location.origin + "/user-console/home";
              } else {
                setLoading(false);
                message.warning(intl.formatMessage({ id: "MetaMask Login failed, place try again" }));
              }
            } else {
              setLoading(false);
              message.warning(intl.formatMessage({ id: "MetaMask Connect failed, place try again" }));
            }
      
          } else {
            setLoading(false);
            message.warning(intl.formatMessage({ id: "MetaMask create failed, place try again" }));
          }
        } 
      } else {
        message.error(
          intl.formatMessage({ id: "MetaMask open failed, place try again" })
        );
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      if(err && err.message){
        message.error(
          intl.formatMessage({ id: "MetaMask open failed, place try again" })
        );
      }
    }
  }, [checked, intl, setMateMaskAddress, setUser, setIsLogin, setSubAccouts]);

  const toLogin = useCallback(() => {
    switchLoginActiveTab("login");
    history.replace('/login');
  }, [switchLoginActiveTab]);

  return (
    <div className="metamask-bind">
      <div className="metamask-bind-content">
        <div className="metamask-bind-title">Do you want to create a new account?</div>
        <div className="metamask-bind-pannel">
          <Card bordered={false} className="metamask-register-card" title={<Avatar size={90}><img className="user-plus-icon" width="46px" height="35px" alt="usericon" src={UserPlus} />
            </Avatar>}>
            <div className="metamask-bin-sub-text">
              <FormattedMessage id="Create_New_Login" defaultMessage="Create New Login" />
            </div>
            <div className="metamask-bind-sub-desc">
              <div className="metamask-bind-terms" onChange={isCheck}>
                <div className={`terms-select-radio`}>
                  <span className={`terms-select-item ${checked ? "terms-select" : "terms-no-select"}`} onClick={isCheck}>
                    <FormattedMessage id="I agree to" defaultMessage="I agree to" />
                  </span>
                  <span
                    className="terms-select-item-text-link"
                    onClick={() => {
                      window.open('https://OPNX.com/terms-of-service/');
                    }}
                  >
                    <FormattedMessage id="register_text_variable" defaultMessage="OPNX Terms of Service." />
                  </span>
                </div>
              </div>
            </div>
            {loading ? <LoadingOutlined /> : (
              <div className="metamask-bind-to-link">
                <label
                className="metamask-bind-jump-link"
                onClick={() => {
                  toRegister();
                }}
              >
                <FormattedMessage id="Create" defaultMessage="Create" />
              </label>&gt;
            </div> 
            )}
          </Card>
          <Card bordered={false} className="metamask-bind-card" title={<Avatar size={90}><div id="metamask-logo-container" /></Avatar>}>
            <div className="metamask-bin-sub-text">
              
              <FormattedMessage id="Bind existing account" defaultMessage="Bind existing account" />
            </div>
            <div className="metamask-bind-sub-desc">
            <FormattedMessage id="you need to log in to the original account first" defaultMessage="you need to log in to the original account first" />
            
            </div>
            <div className="metamask-bind-to-link">
              <label
                className="metamask-bind-jump-link"
                onClick={() => {
                  toLogin();
                }}
              >
                <FormattedMessage id="Jump to the login page" defaultMessage="Jump to the login page" />
              </label>&gt;
            </div> 
          </Card>
        </div>
      </div>
    </div>
  );
});
const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    async setUser(data: any, type?: string) {
      const res = await dispatch(setUser(data, type));
      return Promise.resolve(res);
    },
    setSubAccouts(){dispatch(setSubAccouts())},
    setIsLogin(i: boolean){dispatch(setIsLogin(i))},
    switchLoginActiveTab(data: string) {
      dispatch(switchLoginActiveTab(data));
    },
    setMateMaskAddress(data: string) {
      dispatch(setMateMaskAddress(data));
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MetaMaskBind));

import React, { useEffect, memo, useCallback, useMemo, useState } from "react";
import ModelViewer from "@metamask/logo";
import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { injectIntl, WrappedComponentProps, FormattedMessage } from "react-intl";


import "./index.scss";

type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;
type TOwnProps = { useMetaMaskWithdraw: Function };

const WithdrawMetaMask = memo((IProps: TStateProps & TDispatchProps & WrappedComponentProps & TOwnProps ) => {
  const  { intl, useMetaMaskWithdraw, dashboardUserData } = IProps;
  const [onlyMetamaskLogin, setEonlyMetamaskLogin] = useState(false);

  useEffect(() => {
    const viewer = ModelViewer({
      pxNotRatio: false,
      width: 0.02,
      height: 0.02,
      followMouse: false,
      slowDrift: false,
    });
    const container = document.getElementById("withdraw-metamask-logo");
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

  const getAddress = useCallback(() => {
      useMetaMaskWithdraw(dashboardUserData.publicAddress);
  },[dashboardUserData, useMetaMaskWithdraw]);

  useEffect(() => {
    if (dashboardUserData &&
      dashboardUserData.accountSource === "METAMASK" &&
      !dashboardUserData.bindEmail
      ) {
      setEonlyMetamaskLogin(true);
   }
  },[dashboardUserData]);

  const textTooltip = useMemo(() => {
    return <div className="withdraw-metamask-tooltip">
      <p className="withdraw-metamask-tooltip-title"><FormattedMessage id="Tips" /></p>
        <FormattedMessage id="You can quickly withdraw funds to the current MetamMask Wallet address. " />
    </div>
  },[]);

  return (
    <div className={`withdraw-metamask ${onlyMetamaskLogin ? "withdraw-metamask-disable" : ""}`} onClick={() => {
      getAddress();
    }}>
      <span id={"withdraw-metamask-logo"} />
      { intl.formatMessage({ id: "Use MetaMask address" }) }
      <Tooltip placement="topLeft" title={textTooltip}>
        <QuestionCircleOutlined />
      </Tooltip>
    </div>
  );

});
const mapStateToProps = (state: any) => {
  return {
    withdrawCoin: state.withdrawCoin,
    dashboardUserData: state.dashboardUserData,
    provider: state.provider
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(WithdrawMetaMask));

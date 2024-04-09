import React, { memo, useState, useEffect } from "react";
import { connect } from "react-redux";
import { injectIntl, WrappedComponentProps } from "react-intl";

import "./index.scss";

type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;
type TOwnProps = { SubmitWithdrawState: any; isMetaMaskWithdraw: boolean };

const MetaMaskLogo = memo(
  (
    IProps: TStateProps & TDispatchProps & WrappedComponentProps & TOwnProps
  ) => {
    const { SubmitWithdrawState, dashboardUserData, isMetaMaskWithdraw } =
      IProps;
    const [isShow, setIsShow] = useState(false);
   
    useEffect(() => {
      if (
        dashboardUserData &&
        dashboardUserData.accountSource === "METAMASK" &&
        (SubmitWithdrawState.activeNetwork.toUpperCase() === "ERC20" ||
          SubmitWithdrawState.activeNetwork.toUpperCase() === "ETH") &&
        isMetaMaskWithdraw &&
        SubmitWithdrawState.inputValue === dashboardUserData.publicAddress
      ) {
        setIsShow(true);
      } else {
        setIsShow(false);
      }
    }, [
      SubmitWithdrawState.activeNetwork,
      SubmitWithdrawState.inputValue,
      dashboardUserData,
      isMetaMaskWithdraw
    ]);
    return isShow ? <span className={"withdraw-metamask-logo"}></span> : null;
  }
);
const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MetaMaskLogo));

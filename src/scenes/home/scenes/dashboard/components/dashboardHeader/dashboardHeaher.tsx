import React, { Component } from "react";
import { connect } from "react-redux";
import { tradingType } from "../dashboardBottom/data";
import { TooltipGlobal } from "components/TooltipGlobal/Tooltip";
import Icon1 from "assets/image/dashborad-icon1.svg";
import Icon2 from "assets/image/dashborad-icon2.svg";
import { ReactComponent as Warning } from "assets/image/warning.svg";
import history from "router/history";
import { localStorage } from "utils";
import TwoFAModal from "../TwoFAModal/TwoFAModal";
import "./dashboardHeaher.scss";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from "react-intl";
import { addressTruncator } from "../../../../../../utils/addressTruncator";
import isAddress from "../../../../../../utils/isAddress";
import { Nokyc } from "assets/image";
import { vipLever } from "../../data";

type IDashboardHeaherProps = {
  userData: IDashboardUserData;
  waring: boolean;
} & WrappedComponentProps &
  ReturnType<typeof mapStateToProps>;
type IDashboardHeaherState = {
  tfaModal: boolean;
};
export class DashboardHeaher extends Component<
  IDashboardHeaherProps,
  IDashboardHeaherState
> {
  constructor(props: IDashboardHeaherProps) {
    super(props);
    this.state = { tfaModal: false };
  }
  checkName = (e: string) => {
    const reg = new RegExp("[\u4E00-\u9FA5]+");
    const name = e.slice(0, 2);
    if (reg.test(name)) {
      return e.slice(0, 1);
    } else {
      return e.slice(0, 2);
    }
  };
  checkedPermissions = (canTrade: boolean, canWithdraw: boolean) => {
    if (canTrade && canWithdraw) {
      return this.props.intl.formatMessage({ id: "ALL" });
    } else if (canTrade) {
      return this.props.intl.formatMessage({ id: "Can_Trade" });
    }
    //  else if (canWithdraw) {
    //   return "Can Withdraw";
    // }
    else {
      return this.props.intl.formatMessage({ id: "Read-Only" });
    }
  };
  handleShowModal = (e: boolean) => {
    this.setState({ tfaModal: e });
  };

  kycInfo = () => {
    const { userData } = this.props;
    return (
      <div
        className={
          this.props.kycOpened
            ? "dashboardHeaher-user-content-left-kyc"
            : "dashboardHeaher-user-content-left-kyc-Unverified"
        }
      >
        {this.props.kycOpened ? (
          <img src={Icon2} alt="Open Exchange" />
        ) : (
          <Nokyc />
        )}
        <span className="dashboardHeaher-lv2">
          {this.props.kycOpened ? "KYC Verified" : "KYC Level 1"}
        </span>
      </div>
    );
  };
  render() {
    const { userData } = this.props;
    const { tfaModal } = this.state;

    const walletAuthentication = isAddress(userData.loginName);
    const loginName = walletAuthentication
      ? addressTruncator(userData.loginName)
      : userData.loginName;

    return (
      <div className="dashboardHeaher">
        <div className="dashboardHeaher-user">
          <div className="dashboardHeaher-user-content">
            {this.checkName(userData.loginName)}
          </div>
          <div className="dashboardHeaher-user-content-left">
            <TooltipGlobal title={userData.loginName}>
              <p>{loginName}</p>
            </TooltipGlobal>
            <div className="dashboardHeaher-user-content-left-level">
              <div
                className="dashboardHeaher-user-content-left-level-item"
                // onClick={() => {
                //   history.push("/feeSchedule");
                // }}
                style={{ width: "99px" }}
              >
                <img src={Icon1} alt="Open Exchange" />
                <span className="dashboardHeaher-lv">
                  Lv
                  {vipLever(
                    userData?.tradingFeeLevel?.vipType,
                    userData?.tradingFeeLevel?.vipLevel,
                    userData?.tradingFeeLevel?.specialVipLevel
                  )}
                </span>
                <span className="dashboardHeaher-vip">OX VIP</span>
              </div>
              {this.kycInfo()}
            </div>
          </div>
        </div>
        <div className="dashboardHeaher-main">
          <p>
            <FormattedMessage id="Account" />
          </p>
          {/* <TooltipGlobal
            title={userData.accountName}
            className="dashboardHeaher-main-aDiv"
          > */}
          <div className="dashboardHeaher-main-account">
            {userData.isMainAccount ? (
              <FormattedMessage id="Main_Account" />
            ) : (
              userData.accountName
            )}
          </div>
          {/* </TooltipGlobal> */}
          {/* <div className="dashboardHeaher-main-item">
            <FormattedMessage id="Margin_Type" />:
            <span style={{ marginLeft: "8px" }}>
              {tradingType(userData.tradingType)}
            </span>
          </div> */}
          <div className="dashboardHeaher-main-item">
            ID:
            <span style={{ marginLeft: "8px" }}>{userData.accountId}</span>
          </div>
          <div className="dashboardHeaher-main-item">
            <FormattedMessage id="Permissions" />:
            <span style={{ marginLeft: "8px" }}>
              {this.checkedPermissions(
                userData.permission.canTrade,
                userData.permission.canWithdraw
              )}
            </span>
          </div>
        </div>
        {!userData.enableTfa &&
          !walletAuthentication &&
          (localStorage.get("tfaModal") || this.props.waring) && (
            <div className="dashboardHeaher-warning">
              <Warning />
              <FormattedMessage id="dashboradr_twa_content1" />
              <span
                className="dashboardHeaher-warning-tfa"
                onClick={() => {
                  this.setState({ tfaModal: true });
                }}
              >
                <FormattedMessage id="Enable_2FA" />
              </span>
            </div>
          )}
        {tfaModal ? (
          <TwoFAModal
            visible={tfaModal}
            handlerCallback={this.handleShowModal}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  kycOpened: state.kycInfo?.kycOpened,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DashboardHeaher));

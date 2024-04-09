import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import history from "router/history";
import { ReactComponent as RightBlue } from "assets/image/right-blue.svg";
import { ReactComponent as Right } from "assets/image/pagination-right.svg";
import { connect } from "react-redux";
import { tfaType } from "../dashboardBottom/data";
import "./AccountSecurity.scss";
import TwoFAModal from "../TwoFAModal/TwoFAModal";
import { localStorage } from "utils";
import { setTfaModalVisable } from "store/actions/publicAction";
import IdebtityVerification from "components/idebtityVerification";
import isAddress from "../../../../../../utils/isAddress";
import Guard from "../../../../router/guard";
import { DOMAIN } from "@opnx-pkg/uikit";
// import { Col } from "antd";
type IDashboardBottomFatherProps = {
  userData: IDashboardUserData;
  hanlderWarning: (e: boolean) => void;
};
type IDashboardBottomProps = ReturnType<typeof mapStateToProps>;
type IDashboardBottomState = {
  userAccount: IUserDataAccount[];
  TwoFa: boolean;
  identityVerification: boolean;
};
/*
setTfaModalVisable
tfaModalVisable
*/
export class AccountSecurity extends Component<
  IDashboardBottomFatherProps & IDashboardBottomProps,
  IDashboardBottomState
> {
  constructor(props: IDashboardBottomProps & IDashboardBottomFatherProps) {
    super(props);
    this.state = {
      userAccount: [],
      TwoFa: false,
      identityVerification: false,
    };
  }
  componentDidMount() {
    const { userData } = this.props;
    const TwoFa = !userData.enableTfa && !localStorage.get("tfaModal");
    setTfaModalVisable(TwoFa);
  }
  handleShowModal = (e: boolean) => {
    if (!this.props.userData.enableTfa) {
      this.setState({ TwoFa: e });
      // localStorage.set("tfaModal", true);
      setTfaModalVisable(e);
      this.props.hanlderWarning(true);
    }
  };
  handleShowModalVerify = (e: boolean) => {
    this.setState({ identityVerification: e });
  };
  render() {
    const { users, userData } = this.props;
    const { TwoFa, identityVerification } = this.state;
    return (
      <div className="dashboardSecurity">
        <div className="dashboardSecurity-right">
          <Guard />
          <div
            className="dashboardSecurity-left-top-content"
            onClick={() => {
              history.push("/home/security");
            }}
          >
            <span>
              <FormattedMessage id="account_security" />
            </span>
            <Right />
          </div>
          <div className="dashboardSecurity-right-content">
            <div className="dashboardSecurity-right-content-item">
              <div className="dashboardSecurity-right-content-item-top">
                <span
                  className="dashboardSecurity-right-content-item-top-raidus"
                  style={{
                    background: userData.enableTfa ? "#09BB07" : "#23223F",
                  }}
                ></span>
                <span>
                  <FormattedMessage id="Enable_2FA" />
                </span>
              </div>
              <p
                onClick={this.handleShowModal.bind(this, true)}
                className="ena-2fa"
              >
                {!userData.enableTfa ? (
                  "Enable "
                ) : (
                  <span onClick={() => history.push("/home/security")}>
                    {userData.tfaType && (
                      <FormattedMessage
                        id={
                          tfaType(userData.tfaType) === "Google Auth"
                            ? "GoogleAuth"
                            : tfaType(userData.tfaType)
                        }
                      />
                    )}
                  </span>
                )}
                {!userData.enableTfa && <RightBlue />}
              </p>
            </div>
            <div className="dashboardSecurity-right-content-item">
              <div className="dashboardSecurity-right-content-item-top">
                <span
                  className="dashboardSecurity-right-content-item-top-raidus"
                  style={{
                    background: userData.kycInfo.level >= 2 ? "" : "#23223F",
                  }}
                />
                <span>KYC Verification</span>
              </div>
              <p
                onClick={() => {
                  window.location.href = DOMAIN.UI + "/account/kyc";
                }}
              >
                <FormattedMessage id="Set_up" /> <RightBlue />
              </p>
            </div>
            <div className="dashboardSecurity-right-content-item">
              {users.mainLogin ? (
                <>
                  <div className="dashboardSecurity-right-content-item-top">
                    <span
                      className="dashboardSecurity-right-content-item-top-raidus"
                      style={{
                        background: !isAddress(userData.bindEmail)
                          ? "#09BB07"
                          : "#23223F",
                      }}
                    />
                    <span>
                      <FormattedMessage id="Linked_Email" />
                    </span>
                  </div>
                  <div className="account-bind-email">{userData.bindEmail}</div>
                </>
              ) : null}
            </div>
            <div
              className="dashboardSecurity-right-content-item"
              onClick={() => {
                users.mainLogin && history.push("/forgetpassword");
              }}
            >
              {users.mainLogin ? (
                <>
                  <div className="dashboardSecurity-right-content-item-top">
                    <span className="dashboardSecurity-right-content-item-top-raidus" />
                    <span>
                      <FormattedMessage id="Reset_Password" />
                    </span>
                  </div>
                  <p>
                    <FormattedMessage id="Reset" /> <RightBlue />
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </div>
        {TwoFa ? (
          <TwoFAModal visible={TwoFa} handlerCallback={this.handleShowModal} />
        ) : null}
        {identityVerification ? (
          <IdebtityVerification
            visable={identityVerification}
            onCloseModel={this.handleShowModalVerify}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state: IGlobalT) => ({
  users: state.users,
  dashboardUserData: state.dashboardUserData,
  tfaModalVisable: state.tfaModalVisable,
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
    setTfaModalVisable(data: boolean) {
      dispatch(setTfaModalVisable(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountSecurity);

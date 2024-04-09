import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "antd";
import { imageList } from "./data.js";
import "./TwoFAModal.scss";
import history from "router/history.js";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from "react-intl";
type ITwoFAModalState = {
  GoogleHover: boolean;
  AuthyHover: boolean;
  YubikeyHover: boolean;
};
type ITwoFAModalProps = {
  visible: boolean;
  dashboardUserData: any;
  handlerCallback: (e: boolean) => void;
} & WrappedComponentProps;
export class TwoFAModal extends Component<ITwoFAModalProps, ITwoFAModalState> {
  constructor(props: ITwoFAModalProps) {
    super(props);
    this.state = {
      GoogleHover: false,
      AuthyHover: false,
      YubikeyHover: false,
    };
  }
  onMouseEnter = (e: "GoogleHover" | "AuthyHover" | "YubikeyHover") => {
    switch (e) {
      case "GoogleHover":
        this.setState({ GoogleHover: true });
        break;
      case "AuthyHover":
        this.setState({ AuthyHover: true });
        break;
      case "YubikeyHover":
        this.setState({ YubikeyHover: true });
        break;
      default:
        break;
    }
  };
  onMouseout = (e: string) => {
    switch (e) {
      case "GoogleHover":
        this.setState({ GoogleHover: false });
        break;
      case "AuthyHover":
        this.setState({ AuthyHover: false });
        break;
      case "YubikeyHover":
        this.setState({ YubikeyHover: false });
        break;
      default:
        break;
    }
  };
  closeModal = () => {
    this.props.handlerCallback(false);
  };
  render() {
    const { GoogleHover, AuthyHover, YubikeyHover } = this.state;
    const { intl, visible, dashboardUserData } = this.props;
    let isVisible = visible;
    if (
      dashboardUserData &&
      dashboardUserData.accountSource === "METAMASK" &&
      !dashboardUserData.bindEmail
    ) {
      isVisible = false;
    }

    return (
      <Modal
        title={
          <div className="twoFaModal-header-title">
            To enable withdrawals, please setup 2FA
          </div>
        }
        visible={isVisible}
        closable={false}
        maskClosable={false}
        className="twoFaModal"
        footer={null}
      >
        <div className="twoFaModal-container">
          <div
            className="twoFaModal-container-item"
            onMouseEnter={this.onMouseEnter.bind(this, "GoogleHover")}
            onMouseLeave={this.onMouseout.bind(this, "GoogleHover")}
            onClick={() => history.push("/home/security/google_2fa")}
          >
            <img
              src={GoogleHover ? imageList.GoogleHover : imageList.Google}
              alt="Google"
            />
            <p> {this.props.intl.formatMessage({ id: "Google_Auth" })}</p>
          </div>
          <div
            className="twoFaModal-container-item"
            onMouseEnter={this.onMouseEnter.bind(this, "AuthyHover")}
            onMouseLeave={this.onMouseout.bind(this, "AuthyHover")}
            onClick={() => history.push("/home/security/authy_2fa")}
          >
            <img
              src={AuthyHover ? imageList.AuthyNoHover : imageList.Authy}
              alt="Authy"
            />
            <p>Authy</p>
          </div>
          <div
            className="twoFaModal-container-item"
            onMouseEnter={this.onMouseEnter.bind(this, "YubikeyHover")}
            onMouseLeave={this.onMouseout.bind(this, "YubikeyHover")}
            onClick={() => history.push("/home/security/yubikey_2fa")}
          >
            <img
              src={YubikeyHover ? imageList.Yubikey : imageList.YubikeyNoHover}
              alt="Yubikey"
            />
            <p>YubiKey</p>
          </div>
          <p className="twoFaModal-p-hover" onClick={this.closeModal}>
            <FormattedMessage id="Skip_for_now" /> &gt;&gt;
          </p>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TwoFAModal));

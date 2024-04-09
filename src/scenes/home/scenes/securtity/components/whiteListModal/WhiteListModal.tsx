import React, { Component } from "react";
import { connect } from "react-redux";
import { staticData } from "./data";
import LCYModal from "components/modal/Modal";
import { FormattedMessage } from "react-intl";
import "./WhiteListModal.scss"
type WhiteListModalProps = {
  type:
    | "OpenWhiteList"
    | "EnableWhiteList"
    | "CloseWhiteList"
    | "DeleteWhiteList";
  visible: boolean;
  handleCloseModal: (show: boolean) => void;
  Callback: (show: boolean) => void;
};
export class WhiteListModal extends Component<WhiteListModalProps> {
  closeModal = () => {
    this.props.handleCloseModal(false);
  };
  enable = () => {
    this.props.Callback(true);
  };
  render() {
    const { type, visible } = this.props;
    return (
      <LCYModal
        style={{ textAlign: type === "DeleteWhiteList" ? "center" : "inherit" }}
        visible={visible}
        title={<FormattedMessage {...staticData[type].title} />}
        width={356}
        cancleHandler={this.closeModal}
        className="white-address"
        okHandler={this.enable}
        okText={(<FormattedMessage {...staticData[type].btnText} />) as any}
        cancelText={(<FormattedMessage id="Cancel" />) as any}
      >
        {<FormattedMessage {...staticData[type].container} />}
      </LCYModal>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(WhiteListModal);

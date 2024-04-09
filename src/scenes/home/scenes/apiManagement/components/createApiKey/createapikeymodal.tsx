import React, { Component } from "react";
import { connect } from "react-redux";
import close from "assets/image/modal_close.png";
import Modal from "antd/lib/modal/Modal";
import { imgList } from "../../data";
import copy from "copy-to-clipboard";
import "./createapikeymodal.scss";
import { Button, message } from "antd";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { Decrypt } from "./data";

interface IModelIProps {
  visible: boolean;
  onCloseModal: (off: boolean) => void;
  cfAPIKey: string;
  cfAPISecret: string;
  permissionStr: string;
  subAccount: string;
  accountId: string;
}
interface IModelState {
  loadding: boolean;
}
type ICreateApiKeyModalPropsState = ReturnType<typeof mapStateToProps> &
  IModelIProps;
type ICreateApiKeyModalDispatchState = ReturnType<typeof mapDispatchToProps>;
class CreateApiKeyModal extends Component<
  IModelIProps & WrappedComponentProps & ICreateApiKeyModalPropsState,
  IModelState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      loadding: false
    };
  }
  handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.props.onCloseModal(false);
  };
  render() {
    const {
      visible,
      cfAPIKey,
      cfAPISecret,
      permissionStr,
      subAccount,
      users,
      accountId
    } = this.props;
    return (
      <Modal
        centered
        width={424}
        visible={visible}
        onCancel={this.handleCancel}
        okButtonProps={{ disabled: true }}
        cancelButtonProps={{ disabled: true }}
        footer={null}
        destroyOnClose
        closeIcon={<img width={14} alt="close" src={close} />}
      >
        <div className="create-api-key-modal">
          <div className="content-title">
            {this.props.intl.formatMessage({
              id: "API_Key_generated",
              defaultMessage: "API Key generated"
            })}
          </div>
          <div className="content-sub-title">
            {this.props.intl.formatMessage({
              id: "API_Key_for",
              defaultMessage: "API Key for"
            })}
            : {subAccount}
          </div>
          <div className="api-key">
            {this.props.intl.formatMessage({
              id: "API_Key",
              defaultMessage: "API Key"
            })}
          </div>
          <div className="api-box">
            <div className="api-box-content">{cfAPIKey}</div>
            <img
              className="icons"
              onClick={() => {
                copy(cfAPIKey);
                message.success(
                  this.props.intl.formatMessage({ id: "CopiedSuccessfully" })
                );
              }}
              src={imgList.copy}
              alt="copy"
            />
          </div>
          <div className="api-key">
            {this.props.intl.formatMessage({
              id: "API_Secret",
              defaultMessage: "API Secret"
            })}
          </div>
          <div className="api-box box-border">
            <div className="api-box-content">
              {Decrypt(cfAPISecret, accountId ? accountId : users.accountId)}
            </div>
            <img
              className="icons"
              onClick={() => {
                copy(
                  Decrypt(cfAPISecret, accountId ? accountId : users.accountId)
                );
                message.success(
                  this.props.intl.formatMessage({ id: "CopiedSuccessfully" })
                );
              }}
              src={imgList.copy}
              alt="copy"
            />
          </div>
          <div className="prompt">
            <img src={imgList.warning} alt="prompt" />
            <div>
              {this.props.intl.formatMessage({
                id: "API_Secret_Dialog",
                defaultMessage:
                  "Please be sure to mark down your API secret, because it will not be shown after closing this dialog."
              })}
            </div>
          </div>
          <Button
            style={{
              marginTop: "30px"
            }}
            className="btn-gradient"
            type="primary"
            htmlType="submit"
            onClick={this.handleCancel}
          >
            {this.props.intl.formatMessage({
              id: "OK",
              defaultMessage: "OK"
            })}
          </Button>
          <div
            style={{ display: "flex", marginTop: "20px", alignItems: "center" }}
          >
            <div className="permissions-title">
              {this.props.intl.formatMessage({
                id: "API_Key_permissions",
                defaultMessage: "API Key permissions:"
              })}
            </div>
            <div className="read-only-title">{permissionStr}</div>
          </div>
          <div className="tips-title">
            {this.props.intl.formatMessage({
              id: "Tips",
              defaultMessage: "Tips"
            })}
            :
          </div>
          <p className="asset-text">
            {this.props.intl.formatMessage({
              id: "API_Key_to_others",
              defaultMessage:
                "To avoid asset loss, please do not tell your API Secret or API Key to others"
            })}
          </p>
          <p className="asset-text">
            {this.props.intl.formatMessage({
              id: "Secret_Key_pair",
              defaultMessage:
                "If you forget your API Secret, please delete it and apply for a new Secret Key pair."
            })}
          </p>
        </div>
      </Modal>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => ({
  users: state.users
});

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CreateApiKeyModal));

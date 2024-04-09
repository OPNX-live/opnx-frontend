import React, { Component } from "react";
import { connect } from "react-redux";
import LCYModal from "components/modal/Modal";
import { Input, Checkbox, Radio, message } from "antd";
import InputIpList from "./inputIpList/InputIpList";
import { RadioChangeEvent } from "antd/lib/radio/interface";
import { CheckboxChangeEvent } from "antd/lib/checkbox/Checkbox";
import { changePermission } from "service/http/http";
import TfaValidation from "components/tfaValidation";
import { messageError } from "utils";
import { WrappedComponentProps, injectIntl } from "react-intl";
import "./EditApiModal.scss";

type EditApiModalState = {
  radioValue: number;
  ipList: string[];
  labelName: string;
  checked: boolean;
  disabled: boolean;
  isPermission: boolean;
  loadding: boolean;
  canWithdraw: boolean;
};
type EditApiModalProps = {
  visible: boolean;
  closeEditWhiteModalHandler: (e: boolean) => void;
  ipListProps?: string[];
  canTrade: boolean;
  cfAPIId: string;
  canWithdraw: boolean;
  label: string;
  allowedIps: [];
  ipIsRestricted: boolean;
};
type IChangePermissionModalPropsState = ReturnType<typeof mapStateToProps> &
  EditApiModalProps &
  WrappedComponentProps;

export class EditApiModal extends Component<
  IChangePermissionModalPropsState,
  EditApiModalState
> {
  constructor(props: IChangePermissionModalPropsState) {
    super(props);
    this.state = {
      radioValue: 2,
      ipList: [],
      labelName: "",
      checked: false,
      disabled: false,
      isPermission: false,
      loadding: false,
      canWithdraw: this.props.canWithdraw,
    };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        radioValue: this.props.ipIsRestricted ? 2 : 1,
        ipList: this.props.allowedIps,
        labelName: this.props.label,
        checked: this.props.canTrade,
      });
    }, 100);
  }
  labelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ labelName: e.target.value }, () => {
      this.checkValue();
    });
  };
  canTrade = (e: CheckboxChangeEvent) => {
    this.setState({ checked: e.target.checked });
  };
  saveIpList = (e: string[]) => {
    this.setState({ ipList: e }, () => {
      this.checkValue();
    });
  };
  radio = (e: RadioChangeEvent) => {
    this.setState({ radioValue: e.target.value, ipList: [] }, () => {
      this.checkValue();
    });
  };
  checkValue = () => {
    const { labelName, ipList, radioValue } = this.state;
    if (labelName !== "" && ipList?.length > 0 && radioValue === 2) {
      this.setState({ disabled: false });
    } else if (labelName !== "" && radioValue === 1) {
      this.setState({ disabled: false });
    } else {
      this.setState({ disabled: true });
    }
  };

  submit = () => {
    if (
      this.props.dashboardUserData.enableTfa &&
      this.props.dashboardUserData.tfaProtected.isLoginAndManagement
    ) {
      this.setState({
        isPermission: true,
      });
    } else {
      const reg = /^([\u4e00-\u9fa5a-z\d_. /]{1,16}|[a-zA-Z\d_. /]{1,32})$/gi;
      if (!reg.test(this.state.labelName)) {
        message.error(
          this.props.intl.formatMessage({
            id: "pleaseEnterUp",
          })
        );
        return;
      }
      this.changePermission();
    }
  };

  changePermission = (code?: string) => {
    this.setState({
      loadding: true,
    });
    const { labelName, ipList, radioValue, checked, canWithdraw } = this.state;
    const arr = Array.from(new Set(ipList));
    changePermission(
      {
        cfAPIId: this.props.cfAPIId,
        canTrade: checked,
        allowedIps: arr,
        ipIsRestricted: radioValue === 2 ? true : false,
        label: labelName,
        canWithdraw,
      },
      code
    ).then((res) => {
      this.setState({
        loadding: false,
      });
      if (res.success) {
        message.success(
          this.props.intl.formatMessage({
            id: "Success",
            defaultMessage: "Success",
          })
        );
        this.props.closeEditWhiteModalHandler(false);
      } else {
        message.error(res.message);
      }
    });
  };

  render() {
    const { radioValue, checked, disabled, canWithdraw } = this.state;
    return (
      <LCYModal
        className="edit-api-modal"
        width={410}
        visible={this.props.visible}
        title={this.props.intl.formatMessage({ id: "EditAPI" })}
        closable
        // maskClosable
        oneBigBtn
        okHandler={this.submit}
        oneBigBtnDisabled={disabled}
        onCancel={() => this.props.closeEditWhiteModalHandler(false)}
        okText={this.props.intl.formatMessage({ id: "Submit" })}
        okLoading={this.state.loadding}
      >
        <p className="edit-api-modal-label">
          {this.props.intl.formatMessage({ id: "Label" })}
        </p>
        <Input defaultValue={this.props.label} onChange={this.labelChange} />
        <div className="edit-api-modal-permissions">
          <span>
            {this.props.intl.formatMessage({
              id: "Permission",
              defaultMessage: "Permission",
            })}
            :
          </span>
          <Checkbox
            defaultChecked={this.props.canTrade}
            onChange={this.canTrade}
            checked={checked}
          >
            <span style={{ color: "#333333" }}>
              {this.props.intl.formatMessage({
                id: "Can_Trade",
                defaultMessage: "Can Trade",
              })}
            </span>
          </Checkbox>
          <Checkbox
            defaultChecked={this.props.canWithdraw}
            onChange={(e) => this.setState({ canWithdraw: e.target.checked })}
            checked={canWithdraw}
          >
            <span style={{ color: "#333333" }}>
              {this.props.intl.formatMessage({
                id: "Can_Withdraw",
                defaultMessage: "Can Withdraw",
              })}
            </span>
          </Checkbox>
        </div>
        <div className="edit-api-modal-restrictio">
          <p>
            {this.props.intl.formatMessage({
              id: "IP_access_restrictions",
              defaultMessage: "IP access restrictions",
            })}
          </p>
          <Radio.Group
            defaultValue={this.props?.allowedIps?.length > 0 ? 2 : 1}
            onChange={this.radio}
          >
            <Radio value={1}>
              <span>
                {this.props.intl.formatMessage({
                  id: "Unrestricted",
                  defaultMessage: "Unrestricted (Less Secure)",
                })}
              </span>{" "}
              <span style={{ color: "rgba(255, 190, 0, 1)" }}>
                {this.props.intl.formatMessage({
                  id: "Unrestricted_Describe",
                  defaultMessage:
                    "This API key allows access from any IP address. This is not recommended.",
                })}
              </span>
            </Radio>
            <Radio value={2}>
              {this.props.intl.formatMessage({
                id: "Restrict_access",
                defaultMessage:
                  "Restrict access to trusted IPs only (Recommended)",
              })}
            </Radio>
          </Radio.Group>
        </div>
        {radioValue === 2 ? (
          <div className="edit-api-modal-bottom">
            <p>
              {this.props.intl.formatMessage({
                id: "tip_ips",
                defaultMessage:
                  "Tip: Hit enter to confirm IPs. You can also delete selected IPs.",
              })}
            </p>
            <InputIpList
              ipListProps={this.props?.allowedIps}
              ipListHandle={this.saveIpList}
            />
          </div>
        ) : null}

        {this.state.isPermission ? (
          <TfaValidation
            visable={this.state.isPermission}
            onCloseModel={(e) => {
              this.setState({
                isPermission: e,
              });
            }}
            callBack={(e) => {
              this.changePermission(e);
            }}
          />
        ) : null}
      </LCYModal>
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
)(injectIntl(EditApiModal));

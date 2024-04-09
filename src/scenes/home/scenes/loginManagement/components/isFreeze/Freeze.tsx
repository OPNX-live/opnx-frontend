import React, { Component, ReactNode } from "react";
import { connect } from "react-redux";
import { isFreeze, UnBind } from "service/http/http";
import { message, Modal, Button } from "antd";
import messageError from "utils/errorCode";
import "./freeze.scss";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from "react-intl";

type IFreezeProps = {
  isVisible: boolean;
  type: "Freeze" | "UnFreeze" | "Unbind";
  modelHandleCancel: (
    off: boolean,
    type: "Freeze" | "UnFreeze" | "Unbind"
  ) => void;
  recordPropsList: any;
  current: number;
  pageSize: number;
  hanlderProps: (current: number, pageSize: number) => void;
} & WrappedComponentProps;
type IFreezeStateT = { headers: ReactNode; content: ReactNode };
type IFreezeState = {
  modelPropsContent: {
    Freeze: IFreezeStateT;
    UnFreeze: IFreezeStateT;
    Unbind: IFreezeStateT;
  };
  loadding: boolean;
};
export class Freeze extends Component<IFreezeProps, IFreezeState> {
  constructor(props: IFreezeProps) {
    super(props);
    this.state = {
      modelPropsContent: {
        Freeze: {
          headers: <FormattedMessage id="Confirm_freeze" />,
          content: <FormattedMessage id="Freeze_Content" />,
        },
        UnFreeze: {
          headers: <FormattedMessage id="Confirm_Unfreeze" />,
          content: <FormattedMessage id="Unfreeze_Content" />,
        },
        Unbind: {
          headers: <FormattedMessage id="Confirm_Unbind" />,
          content: <FormattedMessage id="Unbind_Content" />,
        },
      },
      loadding: false,
    };
  }
  handleCancel = () => {
    this.props.modelHandleCancel(false, this.props.type);
  };
  handleOk = () => {
    const type = this.props.type === "Freeze" ? "FREEZE" : "ACTIVE";
    const lType =
      this.props.type === "Freeze"
        ? "freeze"
        : this.props.type === "UnFreeze"
        ? "Unfreeze"
        : "40005";
    this.setState({ loadding: true });
    if (this.props.type !== "Unbind") {
      isFreeze({
        loginId: this.props.recordPropsList.loginKey,
        status: type,
      }).then((res) => {
        this.setState({ loadding: false });
        if (res.code === "0000") {
          this.props.hanlderProps(this.props.current, this.props.pageSize);
          this.props.modelHandleCancel(false, this.props.type);
          message.success(
            this.props.intl.formatMessage({
              id: this.props.type !== "Unbind" ? lType + "_success" : "40005",
            })
          );
        } else {
          message.error(res.message);
        }
      });
    } else {
      UnBind({
        accountId: this.props.recordPropsList.loginKey,
        subAccountId: this.props.recordPropsList.accountKey,
      }).then((res) => {
        this.setState({ loadding: false });
        if (res.code === "0000") {
          this.props.hanlderProps(this.props.current, this.props.pageSize);
          this.props.modelHandleCancel(false, this.props.type);
        } else {
          message.error(res.message);
        }
      });
    }
  };
  render() {
    const { isVisible, type } = this.props;
    const { modelPropsContent, loadding } = this.state;
    return (
      <Modal
        className="freeze"
        title={modelPropsContent[type].headers}
        visible={isVisible}
        closable={false}
        maskClosable
        footer={
          <div className="footer-div">
            <div className="cancel" onClick={this.handleCancel}>
              <FormattedMessage id="Cancel" />
            </div>
            <Button className="ok" onClick={this.handleOk} loading={loadding}>
              <FormattedMessage id="Confirm" />
            </Button>
          </div>
        }
        onCancel={this.handleCancel}
      >
        <div style={{ textAlign: type === "Unbind" ? "left" : "center" }}>
          {modelPropsContent[type].content}
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Freeze));

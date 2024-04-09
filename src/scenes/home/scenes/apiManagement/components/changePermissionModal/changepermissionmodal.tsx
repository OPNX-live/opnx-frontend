import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Modal, Switch, Col, Button, message } from "antd";
import TfaValidation from "components/tfaValidation";

import close from "assets/image/modal_close.png";

import "./changepermissionmodal.scss";
import { changePermission } from "service/http/http";
import messageError from "utils/errorCode";
import { WrappedComponentProps, injectIntl } from "react-intl";
interface IModelIProps {
  visible: boolean;
  onCloseModal: (off: boolean) => void;
  canTrade: boolean;
  canWithdraw: boolean;
  cfAPIId: string;
}
interface IModelState {
  loadding: boolean;
  switchCanTrade: boolean | undefined;
  switchCanWithdraw: boolean | undefined;
  isPermission: boolean;
}
type IChangePermissionModalPropsState = ReturnType<typeof mapStateToProps> &
  IModelIProps &
  WrappedComponentProps;
type IChangePermissionModalDispatchState = ReturnType<
  typeof mapDispatchToProps
> &
  IChangePermissionModalPropsState;

class ChangePermissionModal extends Component<
  IChangePermissionModalPropsState,
  IModelState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      loadding: false,
      switchCanTrade: undefined,
      switchCanWithdraw: undefined,
      isPermission: false,
    };
  }
  handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.setState({
      switchCanTrade: undefined,
      switchCanWithdraw: undefined,
    });
    this.props.onCloseModal(false);
  };
  changePermission = () => {
    if (
      this.props.dashboardUserData.enableTfa &&
      this.props.dashboardUserData.tfaProtected.isLoginAndManagement
    ) {
      this.setState({
        isPermission: true,
      });
    } else {
      this.submit();
    }
  };
  submit = (code?: string) => {
    this.setState({ loadding: true });
    changePermission(
      {
        cfAPIId: this.props.cfAPIId,
        canTrade:
          this.state.switchCanTrade !== undefined
            ? this.state.switchCanTrade
            : this.props.canTrade,
        canWithdraw:
          this.state.switchCanWithdraw !== undefined
            ? this.state.switchCanWithdraw
            : this.props.canWithdraw,
      },
      code
    ).then((res) => {
      this.setState({ loadding: false });
      if (res.success) {
        message.success(
          this.props.intl.formatMessage({
            id: "success",
            defaultMessage: "success",
          })
        );
        this.setState({
          switchCanTrade: undefined,
          switchCanWithdraw: undefined,
        });
        this.props.onCloseModal(false);
      } else {
        message.error(res.message);
      }
    });
  };
  render() {
    const { canTrade } = this.props;
    return (
      <Modal
        centered
        width={380}
        visible={this.props.visible}
        onCancel={this.handleCancel}
        okButtonProps={{ disabled: true }}
        cancelButtonProps={{ disabled: true }}
        destroyOnClose
        footer={null}
        closeIcon={<img width={14} alt="close" src={close} />}
      >
        <div className="change-permission">
          <div className="permission-title">Change Permission</div>
          <div className="permission">Permissions</div>
          <Row className="permission-row">
            <Col span={11}>
              <div className="can-trade">
                <span>Can Trade</span>
                <Switch
                  defaultChecked={canTrade}
                  onChange={() => {
                    this.setState({
                      switchCanTrade: !canTrade,
                    });
                  }}
                />
              </div>
            </Col>
            <Col span={2} style={{ textAlign: "center" }}>
              {/* <Divider className="divider" type="vertical" /> */}
            </Col>
            <Col span={11}>
              {/* <div className="can-trade">
                <span>Can withdraw</span>
                <Switch
                  defaultChecked={canWithdraw}
                  onChange={() => {
                    this.setState({
                      switchCanWithdraw: !canWithdraw,
                    });
                  }}
                />
              </div> */}
            </Col>
          </Row>
          <Button
            style={{
              marginTop: "30px",
            }}
            className="btn-gradient"
            loading={this.state.loadding}
            type="primary"
            htmlType="submit"
            onClick={this.changePermission}
          >
            Submit
          </Button>
        </div>
        {this.state.isPermission ? (
          <TfaValidation
            visable={this.state.isPermission}
            onCloseModel={(e) => {
              this.setState({
                isPermission: e,
              });
            }}
            callBack={(e) => {
              this.submit(e);
            }}
          />
        ) : null}
      </Modal>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangePermissionModal);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Switch, Button, message } from 'antd';
import { UpdatePermissions } from 'service/http/http';
import messageError from 'utils/errorCode';
import TfaValidation from 'components/tfaValidation';
import './permission.scss';
import { messageSuccess } from 'utils';
import { FormattedMessage, WrappedComponentProps } from 'react-intl';

type IPermissionProps = {
  cancleHandler: () => void;
  hanlderProps: (current: number, pageSize: number) => void;
  current: number;
  pageSize: number;
  propsContext: any;
  dashboardUserData: IDashboardUserData;
} & WrappedComponentProps;
type TCreateLoginState = {
  switchTrade: boolean;
  switchWithdraw: boolean;
  loadding: boolean;
  tfa: boolean;
  tfaCode: string;
};
export class Permission extends Component<IPermissionProps, TCreateLoginState> {
  constructor(props: IPermissionProps) {
    super(props);
    this.state = {
      switchTrade: this.props.propsContext.canTrade,
      switchWithdraw: this.props.propsContext.canWithdraw,
      loadding: false,
      tfa: false,
      tfaCode: '',
    };
  }
  switch = (e: any, checked: boolean) => {
    if (e === 'trade') {
      this.setState({ switchTrade: checked });
    } else {
      this.setState({ switchWithdraw: checked });
    }
  };
  submit = () => {
    if (
      this.props.dashboardUserData.enableTfa &&
      this.props.dashboardUserData.tfaProtected.isLoginAndManagement
    ) {
      this.setState({ tfa: true });
    } else {
      this.updatePremission();
    }
  };
  updatePremission = (e?: string) => {
    const { switchTrade, switchWithdraw } = this.state;
    this.setState({ loadding: true });
    UpdatePermissions(
      {
        accountId: this.props.propsContext.loginKey,
        canTrade: switchTrade,
        canWithdraw: switchWithdraw,
        subAccountId: this.props.propsContext.accountKey,
      },
      e
    ).then((res) => {
      this.setState({ loadding: false });
      if (res.code === '0000') {
        this.props.hanlderProps(this.props.current, this.props.pageSize);
        this.props.cancleHandler();
        message.success(messageSuccess('40009'));
      } else {
        message.error(res.message);
      }
    });
  };
  tfaCallback = (e: string) => {
    this.setState({ tfaCode: e }, () => {
      this.updatePremission(e);
    });
  };
  tfaShowModal = (e: boolean) => {
    this.setState({ tfa: e });
  };
  render() {
    const {
      switchTrade,
      //  switchWithdraw,
      loadding,
      tfa,
    } = this.state;
    return (
      <Modal
        className="permission-model"
        title={<FormattedMessage id="Change_Permission" />}
        visible
        closable={true}
        footer={null}
        maskClosable={false}
        // onOk={this.handleOk}
        onCancel={this.props.cancleHandler}
        destroyOnClose
      >
        <div className="permission-content">
          <p>
            <FormattedMessage id="Permission" />
          </p>
          <div className="permission-switch">
            <span>
              <FormattedMessage id="Can_Trade" />
            </span>
            <Switch
              onClick={this.switch.bind(this, 'trade')}
              defaultChecked={switchTrade}
            />
          </div>
          {/* <div className="permission-switch">
            <span>Can withdraw</span>
            <Switch
              onClick={this.switch.bind(this, "withdraw")}
              defaultChecked={switchWithdraw}
            />
          </div> */}
        </div>
        <Button
          type="primary"
          className="permission-btn"
          loading={loadding}
          onClick={this.submit}
        >
          <FormattedMessage id="Submit" />
        </Button>
        {tfa ? (
          <TfaValidation
            visable={tfa}
            callBack={this.tfaCallback}
            onCloseModel={this.tfaShowModal}
          />
        ) : null}
      </Modal>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Permission);

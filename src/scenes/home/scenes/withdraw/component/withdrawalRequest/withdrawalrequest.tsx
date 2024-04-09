import React from "react";
import { connect } from "react-redux";
import { Modal, Button } from "antd";
import "./withdrawalrequest.scss";
import { setRefresh } from "store/actions/publicAction";
import { injectIntl, WrappedComponentProps } from "react-intl";

interface ItfaValidationProps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
  callBack: () => void;
  metamaskWithdraw: boolean;
  enableTfa: boolean;
  address: string;
  willAmount: string;
  coin: string;
  fee: string | number;
  submitWithdrawMetamask: Function;
  renderCoin:string
}
interface ItfaProps {
  dashboardUserData: IDashboardUserData;
}
type IWithdrawalRequestPropsState = ReturnType<typeof mapDispatchToProps> &
  ItfaProps &
  WrappedComponentProps;
function WithdrawalRequest(
  props: ItfaValidationProps & IWithdrawalRequestPropsState
) {
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  const submit = () => {
    props.onCloseModel(false);
    if (props.metamaskWithdraw && !props.enableTfa) {
      props.submitWithdrawMetamask();
    } else {
      props.callBack();
    }
  };
  return (
    <Modal
      className="withdraw-request-model"
      visible={props.visable}
      footer={null}
      onCancel={handleCancel}
    >
      <div className="withdrawSaveAddress-content">
        <div className="tfa-title">
          {props.intl.formatMessage({ id: "Withdrawal_Request" })}
        </div>
        <div className="requested-title">
          <span>{props.intl.formatMessage({ id: "receive" })}</span>
          <span className="coin-title">
            {props.willAmount} {props.renderCoin}
          </span>
        </div>
        <div className="requested-title">
          <span>{props.intl.formatMessage({ id: "Transaction_Fee" })}</span>
          <span className="coin-title">
            {props.fee} {props.renderCoin}
          </span>
        </div>
        <div className="requested-title">
          <span>{props.intl.formatMessage({ id: "to_address" })}</span>
          <div className="coin-title-div">{props.address}</div>
        </div>
        <div className="before-title">
          {props.intl.formatMessage({ id: "request_message" })}
        </div>
        {props.coin === "CFV" && (
          <div className="cftv-only">
            Be sure to only send CFV to your own Metamask wallet. You will not
            be able to transfer it again.
          </div>
        )}

        <Button onClick={submit}>
          {props.intl.formatMessage({ id: "request_submit" })}
        </Button>
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: ItfaProps) => {
  return {
    dashboardUserData: state.dashboardUserData
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setRefresh(data: boolean) {
      dispatch(setRefresh(data));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(WithdrawalRequest));

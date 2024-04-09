import React from "react";
import { connect } from "react-redux";
import "./methodomodal.scss";
import Modal from "antd/lib/modal/Modal";
import { Button } from "antd";
import { WrappedComponentProps, injectIntl } from "react-intl";

interface ItfaValidationProps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
  callBack?: () => void;
}

function MethodoModal(props: ItfaValidationProps & WrappedComponentProps) {
  const submit = () => {
    props.callBack && props.callBack();
    props.onCloseModel(false);
  };
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  return (
    <Modal
      className="methodo-model"
      visible={props.visable}
      footer={null}
      onCancel={handleCancel}
      width={482}
    >
      <div className="methodo-box">
        <div className="methodo-title">
          {props.intl.formatMessage({ id: "random_model" })}
        </div>
        <div
          className="methodo-content"
          style={{ overflow: "auto", height: "425px", paddingRight: "24px" }}
        >
          <p>{props.intl.formatMessage({ id: "random_model_message1" })}</p>
          <div className="notes">
            {props.intl.formatMessage({ id: "Notes" })}
          </div>
          <div className="methodo-subtitle">
            <span>• {props.intl.formatMessage({ id: "Available_FLEX" })}</span>
            <p> {props.intl.formatMessage({ id: "random_model_message2" })}</p>
          </div>
          <div className="methodo-subtitle">
            • {props.intl.formatMessage({ id: "random_model_message3" })}
            <p>{props.intl.formatMessage({ id: "random_model_message4" })}</p>
          </div>
          <div className="notes">
            {props.intl.formatMessage({ id: "Example" })}
          </div>
          <p>{props.intl.formatMessage({ id: "random_model_message5" })}</p>

          <p>① {props.intl.formatMessage({ id: "random_model_message6" })}</p>
          <p>② {props.intl.formatMessage({ id: "random_model_message7" })}</p>
        </div>
        <div style={{ paddingRight: "32px", paddingTop: "10px" }}>
          <Button className="btn-gradient" size="large" onClick={submit}>
            {props.intl.formatMessage({ id: "Got_it" })}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MethodoModal));

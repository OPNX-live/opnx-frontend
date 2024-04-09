import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Modal, Button } from "antd";
import TfaListVerify from "components/tfaListVerify/tfaListVerify";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage
} from "react-intl";
import "./index.scss";
interface ItfaValidationProps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
  callBack: (success: string, type?: string, value?: string) => void;
  type?: string;
  modalType?: "ADD_API_KEY" | "DELETE_TFA" | "BIND_TFA" | "CHECK_IP";
}
interface ItfaProps {
  dashboardUserData: IDashboardUserData;
}
function TfaValidation(
  props: ItfaValidationProps & ItfaProps & WrappedComponentProps
) {
  // const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [tfaInpunt, setTfaInpot] = useState<string>("");

  const [value, setValue] = useState<string | undefined>("");
  useEffect(() => {
    console.log(props.modalType, tfaInpunt);
    if (tfaInpunt.length === 52 && !props.modalType) {
      submit();
    }
  }, [tfaInpunt, value, props.modalType]);
  const onCallback = (event: string, placeholder: string, value?: string) => {
    setTfaInpot(event);
    setValue(value);
  };
  const submit = () => {
    if (tfaInpunt && (props.modalType ? value : true)) {
      props.callBack(tfaInpunt, props.type, value);
      props.onCloseModel(false);
    } else {
      setErrorMessage("Invalid Code");
    }
  };
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  return (
    <Modal
      className="tfa-model"
      visible={props.visable}
      footer={null}
      onCancel={handleCancel}
    >
      <div className="tfa">
        <div className="tfa-top">
          <div className="tfa-title">
            <FormattedMessage id="tfa_title" />
          </div>
          <div className="tfa-subtitle">
            {props.intl.formatMessage({ id: "EnterTwoFactor" })}
          </div>
        </div>
        <div className="tfa-input">
          <TfaListVerify onCallback={onCallback} modalType={props.modalType} />
        </div>
        <div className="tfa-error">{errorMessage}</div>
        <Button
          size="large"
          onClick={submit}
          disabled={
            tfaInpunt && (props.modalType ? value : true) ? false : true
          }
        >
          {props.intl.formatMessage({
            id: "Verify"
          })}
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
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TfaValidation));

import React from "react";
import { connect } from "react-redux";
import { Modal } from "antd";
import { WrappedComponentProps, injectIntl } from "react-intl";
import "./ManualReview.scss";
interface IPorps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
}
type IdebtityVerificationPropsState = ReturnType<typeof mapStateToProps>;
type INameDispatchState = ReturnType<typeof mapDispatchToProps>;
function ManualReview(props: IPorps&WrappedComponentProps) {
  return (
    <Modal
      title={props.intl.formatMessage({id:"Manual_review"})}
      visible={props.visable}
      footer={null}
      className="manual"
      onCancel={() => {
        props.onCloseModel(false);
      }}
    >
      <div className="idebtity-bottom">
        {props.intl.formatMessage({id:"kyc_error"},{email:<a href="Mailto:onboarding@OPNX.com" rel="nofollow noopener noreferrer">onboarding@OPNX.com</a>})}
      </div>
      <div className="goit">
        <div
          onClick={() => {
            props.onCloseModel(false);
          }}
        >
          <a href="Mailto:onboarding@OPNX.com" rel="nofollow noopener noreferrer">{props.intl.formatMessage({id:"Got_it"})}</a>
        </div>
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: any) => {
return {}};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ManualReview));

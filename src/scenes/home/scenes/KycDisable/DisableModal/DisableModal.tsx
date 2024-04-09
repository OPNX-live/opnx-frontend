import ICYModal from "components/modal/Modal";
import React from "react";
import { connect } from "react-redux";
import "./DisableModal.scss";
interface IProps {
  visible: boolean;
  callBack: () => void;
}
export const DisableModal = ({ visible, callBack }: IProps) => {
  return (
    <ICYModal
      closable={true}
      getContainer={() =>
        document.getElementById("DisableModal") as HTMLElement
      }
      visible={visible}
      // title="Withdrawals and deposits are currently disabled."
      onCancel={() => callBack()}
      width={480}
      className="disable-modal"
    >
      <div className="modal-content">
        Please switch back to the main account for KYC.
      </div>
    </ICYModal>
  );
};

const mapStateToProps = (state: string) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(DisableModal);

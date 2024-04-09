import ICYModal from "components/modal/Modal";
import React from "react";
import { connect } from "react-redux";
import "./DisableModal.scss";
import { localStorage } from "utils";
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
      onCancel={() => callBack()}
      width={480}
      className="disable-modal"
    >
      <div className="modal-content">
        Deposits of BCH on the smartBCH network (SEP20) and flexUSD (any
        network) are subject to our auto-lock rules, leaving 10% available.
        <span
          onClick={() =>
            window.open(
              "https://OPNX.com/blog/OPNX-update-july-15-2022/"
            )
          }
        >
          Learn more.
        </span>
      </div>
      <div
        className="dont-show"
        onClick={() => {
          localStorage.set("depositModal", false);
          callBack();
        }}
      >
        Don't show this again
      </div>
    </ICYModal>
  );
};

const mapStateToProps = (state: string) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(DisableModal);

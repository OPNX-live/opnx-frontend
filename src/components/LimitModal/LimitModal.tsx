import React from "react";
import { connect } from "react-redux";
import ICYModal from "../modal/Modal";
import "./LimitModal.scss";
interface ILimitModalProps {
  visible: boolean;
  onBack: () => void;
}
export const LimitModal = ({ visible, onBack }: ILimitModalProps) => {
  const onClose = () => {
    onBack();
  };
  return (
    <ICYModal visible={visible} className="bitcoin-country" footer={false}>
      <div className="title">
        Open Exchange is not available in your country.{" "}
      </div>
      <div className="subtitle">
        It is prohibited to access or use our services if you are located in,
        established in, or a resident of the United States of America, Cuba,
        Crimea and Sevastopol, Iran, Syria, North Korea, Alberta, Ontario or
        Sudan, (ii) any other sanctioned jurisdiction, or (iii) any jurisdiction
        where the services offered by Liquidity Technologies Limited are
        restricted.
      </div>
      <div className="btn-close">
        <div className="white-default" onClick={onClose}>
          Close
        </div>
      </div>
    </ICYModal>
  );
};

const mapStateToProps = (state: string) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(LimitModal);

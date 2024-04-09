import React from "react";
import { connect } from "react-redux";
import { Modal } from "antd";
import "./index.scss";
interface IPorps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
}
type IdebtityVerificationPropsState = ReturnType<typeof mapStateToProps>;
type INameDispatchState = ReturnType<typeof mapDispatchToProps>;
function IdebtityVerification(props: IPorps & IdebtityVerificationPropsState) {
  return (
    <Modal
      title="Identity Verification"
      visible={true}
      footer={null}
      className="idebtity"
      onCancel={() => {
        props.onCloseModel(false);
      }}
    >
      <div className="idebtity-top">
        {Number(props.dashboardUserData.kycInfo.level) === 3 &&
        props.dashboardUserData.kycInfo.limitPerDay === null
          ? "Identity verification on your account has been completed."
          : "After completing identity verification, you can get a higher withdrawal amount."}
      </div>
      <div className="idebtity-bottom">
        {Number(props.dashboardUserData.kycInfo.level) === 3 &&
        props.dashboardUserData.kycInfo.limitPerDay === null ? (
          "You can enjoy unlimited withdrawals in all assets."
        ) : (
          <>
            If you want more than{" "}
            <span>{props.dashboardUserData.kycInfo.limitPerDay} USDT/Day</span>,
            then email
            <a href="Mailto:onboarding@OPNX.com" rel="nofollow noopener noreferrer">onboarding@OPNX.com</a>
          </>
        )}
      </div>
      <div className="goit">
        <div
          onClick={() => {
            props.onCloseModel(false);
          }}
        >
          GOT IT
        </div>
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: IGlobalT) => {
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
)(IdebtityVerification);

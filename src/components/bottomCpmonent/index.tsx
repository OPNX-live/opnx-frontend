import React from "react";
import { connect } from "react-redux";
import "./index.scss";
function BottomComponent() {
  return (
    <div className="bottom-component">
      <div>
        Individuals from
        <span
          onClick={() => {
            window.open(
              "https://support.opnx.com/en/articles/7209258-submitting-identity-verification-kyc#h_0943c7f4dc"
            );
          }}
          style={{ marginLeft: "4px", color: "#318BF5", cursor: "pointer" }}
        >
          restricted countries
        </span>{" "}
        , including the United States of America, Cuba, Iran, Syria, Sudan,
        North Korea, Afghanistan, and others prohibited from trading on our
        platform, are not allowed to hold positions or engage in contracts on
        Open Exchange (OPNX).
      </div>
      <div>
        In the event that a trading participant at Open Exchange has
        misrepresented their location or residency, the platform reserves the
        right to shut down their accounts and liquidate any active positions.
      </div>
    </div>
  );
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomComponent);

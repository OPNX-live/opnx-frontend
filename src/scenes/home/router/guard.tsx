import React, { memo } from "react";
import { injectIntl } from "react-intl";
import "./guard.scss";
import isAddress from "../../../utils/isAddress";
import { connect } from "react-redux";
import { LockOutlined } from "@ant-design/icons";
const Guard = memo(({ children, users }: any) => {
  const walletAuthentication = isAddress(users.email);
  if (!walletAuthentication) {
    return null;
  } else {
    return (
      <div className="OPNX-overlay">
        <div className="overlay-content">
          <LockOutlined />
          {/*<h2>No email address</h2>*/}
        </div>
      </div>
    );
  }
});

const mapStateToProps = (state: IGlobalT & { accountName: string }) => {
  return {
    users: state.users,
  };
};
const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Guard));

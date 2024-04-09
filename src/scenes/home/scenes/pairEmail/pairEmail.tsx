import React, { memo } from "react";
import "./pairEmail.scss";
import {
  injectIntl,
  WrappedComponentProps,
} from "react-intl";

const pairEmail = memo(({ intl }: WrappedComponentProps) => {
  return (
    <div className="pairEmail">
      <div className="pairEmail-title">
        {intl.formatMessage({ id: "MetaMask" })}
      </div>
      <div className="sub-title"> {intl.formatMessage({ id: "MetaMask" })}</div>
    </div>
  );
});
export default injectIntl(pairEmail);

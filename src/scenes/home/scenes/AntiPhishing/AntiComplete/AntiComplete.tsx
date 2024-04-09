import React, { useState } from "react";
import { connect } from "react-redux";
import { Tooltip } from "antd";
import antiImg from "assets/image/anti-img.png";
import ChangeAnti from "../ChangeAnti/ChangeAnti";
import { WrappedComponentProps, injectIntl } from "react-intl";
import "./AntiComplete.scss";
type IAntiProps = {
  antiName: string;
  onCallback: () => void;
} & WrappedComponentProps;
export function AntiComplete({ intl, antiName, onCallback }: IAntiProps) {
  const [visible, setVisible] = useState(false);
  const onCreate = () => {
    setVisible(true);
  };
  const onCallBack = (off: boolean) => {
    if (off) {
      onCallback();
    }
    setVisible(false);
  };
  const antiTooltip = (
    <div className="anti-tooltip">
      <div className="tooltip-text">
        Set an anti-phishing code by clicking the link below, and make sure to
        note it down. All communications from Open Exchange will have this code
        attached.
      </div>
    </div>
  );
  return (
    <div className="anti-complete">
      <div className="old-code">Anti-Phishing Code</div>
      <div className="anti-code">{antiName}</div>
      <Tooltip
        title={antiTooltip}
        getPopupContainer={(e) => e}
        color="white"
      >
        <div className="anti-prompt">
          {intl.formatMessage({
            id: "How does it work?",
            defaultMessage: "How does it work?",
          })}
        </div>
      </Tooltip>
      <div className="change-btn" onClick={onCreate}>
        {intl.formatMessage({
          id: "Change code",
          defaultMessage: "Change code",
        })}
      </div>
      <ChangeAnti
        visible={visible}
        onCallBack={onCallBack}
        antiName={antiName}
      />
    </div>
  );
}

const mapStateToProps = (state: string) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AntiComplete));

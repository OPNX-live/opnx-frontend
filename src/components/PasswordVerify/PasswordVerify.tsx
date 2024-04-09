import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Progress } from "antd";
import "./PasswordVerify.scss";
type IPwsVericy = {
  pws: string;
} & WrappedComponentProps;
export function PasswordVerify({ intl, pws }: IPwsVericy) {
  const [lvl, setLvl] = useState(0);
  useEffect(() => {
    if(!pws){
      setLvl(0);
    }else
    if (getLvl(pws) === 1||pws.length <8) {
      setLvl(10);
    } else if (getLvl(pws) === 2 && pws.length >= 8) {
      setLvl(25);
    } else if (getLvl(pws) === 3 && pws.length >= 8) {
      setLvl(50);
    } else if (getLvl(pws) === 4 && pws.length >= 8) {
      setLvl(100);
    }
  }, [pws]);
  const getLvl = (pwd: string) => {
    let lvl = 0;
    if (/[0-9]/.test(pwd)) {
      lvl++;
    }
    if (/[A-Z]/.test(pwd)) {
      lvl++;
    }
    if (/[a-z]/.test(pwd)) {
      lvl++;
    }
    if (/[`~!@#$%^&*()_+<>?:"{},./;'[\]\\]/.test(pwd)) {
      lvl++;
    }
    return lvl;
  };
  const getStrength = (i: number) => {
    switch (i) {
      case 25:
        return intl.formatMessage({ id: "Weak", defaultMessage: "Weak" });
      case 50:
        return intl.formatMessage({
          id: "Medium",
          defaultMessage: "Medium",
        });
      case 100:
        return intl.formatMessage({
          id: "High",
          defaultMessage: "High",
        });
      default:
        return "";
    }
  };
  const getColor = (i: number) => {
    switch (i) {
      case 25:
        return "#D13051";
      case 50:
        return "#FFBE00";
      case 100:
        return "#22C6B9";
      default:
        return "";
    }
  };
  return (
    <div className="password-verify">
      {lvl > 20 && (
        <div className="re-weak">
          <span className="weak-span" style={{ color: getColor(lvl) }}>
            {getStrength(lvl)}
          </span>
          <Progress
            percent={lvl}
            showInfo={false}
            steps={4}
            strokeColor={getColor(lvl)}
          />
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state: string) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PasswordVerify));

import { Input, message, Spin } from "antd";
import { InputProps } from "antd/lib/input";
import React, { useCallback, useState } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { geetestInit, reSendMail, sendMail } from "service/http/http";
import { geetestValidatePackage, messageError } from "utils";
import { LoadingOutlined } from "@ant-design/icons";

import "./SendCodeInput.scss";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

type SendCodeInputProps = {
  type: string;
  change?: (e: string) => void;
  callBack?: () => void;
  v?: string;
  loginEmail?: string;
  loginName?: string;
} & ReturnType<typeof mapStateToProps> &
  InputProps;
const SendCodeInput = ({
  email,
  type,
  v,
  change,
  loginEmail,
  accountId,
  dashboardUserData,
  loginName,
  ...props
}: SendCodeInputProps) => {
  const [seconds, setSeconds] = useState(120);
  const [title, setTitle] = useState("Send");
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(v);
  let timer: NodeJS.Timeout | null = null;
  const [off, setOff] = useState(false);
  const interval = useCallback(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    timer = setInterval(() => {
      setLoading(false);
      setSeconds((s) => {
        if (s - 1 === 0) {
          setOff(false);
          setSeconds(120);
          setTitle("Send");
          clearInterval(timer as NodeJS.Timeout);
          return 119;
        } else {
          setTitle(`${s - 1} s`);
          return s - 1;
        }
      });
    }, 1000);
  }, [seconds]);
  const send = useCallback(async () => {
    if (!off) {
      setLoading(true);
      setOff(true);
      const e =
        type !== "CHECK_IP"
          ? dashboardUserData.isMainAccount
            ? email ?? loginEmail
            : dashboardUserData.bindEmail
          : loginEmail ?? email;
      onRecaptchaVerify(
        "",
        "SEND_EMAIL",
        async (token, action) => {
          const res = await sendMail(
            e,
            type,
            type !== "CHECK_IP" ? email ?? loginEmail : (loginName as string),
            token,
            action
          );
          if (res.code === "0000") {
            setLoading(false);
            setTitle(`120 s`);
            interval();
          } else {
            setLoading(false);
            message.error(res.message);
          }
        },
        () => {}
      );
    }
  }, [
    loading,
    type,
    dashboardUserData.isMainAccount,
    dashboardUserData.bindEmail,
    email,
    loginEmail,
    loginName,
    interval,
  ]);

  const input = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    change && change(e.target.value);
  };
  return (
    <Input
      {...props}
      type="number"
      className="SendCodeInput"
      onChange={input}
      value={value}
      suffix={
        loading ? (
          <Spin indicator={antIcon}></Spin>
        ) : (
          <div onClick={send}>{title}</div>
        )
      }
    />
  );
};

const mapStateToProps = (state: IGlobalT) => {
  return {
    dashboardUserData: state.dashboardUserData,
    email: state.dashboardUserData.loginName,
    accountId: state.dashboardUserData.accountId,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(SendCodeInput);

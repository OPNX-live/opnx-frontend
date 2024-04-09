import React, { useEffect, useReducer } from "react";
import { connect } from "react-redux";
import { Button, Form, message, Input } from "antd";
import { Store } from "antd/lib/form/interface";
import history from "router/history";
import BottomComponent from "components/bottomCpmonent/index";
import { Verification } from "router/configRouter";
import { sendMail, geetestInit, geetestValidate } from "service/http/http";
import { storage } from "utils/storage";
import gt from "utils/gt";

import "./forgetpassword.scss";
import messageError from "utils/errorCode";
import { FormattedMessage } from "react-intl";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
interface IState {
  loading: boolean;
  disabled: boolean;
  loginName: string;
}
type ILoginPropsState = ReturnType<typeof mapStateToProps>;
function ForgetPassword(props: ILoginPropsState) {
  // const [t1, d1] = useReducer(todosReducer, "1");
  const [forget, forgetDispatch] = useReducer(
    (state: IState, action: any) => {
      switch (action.type) {
        case "loading":
          return { ...state, loading: action.loading };
        case "disabled":
          return { ...state, disabled: action.disabled };
        case "loginName":
          return { ...state, loginName: action.loginName };
        default:
          return state;
      }
    },
    { loading: false, disabled: true, loginName: "" }
  );
  // useEffect(() => {
  //   console.log(d1({ type: "test", test: "123" }));
  // }, []);
  // console.log(t1);
  const onInit = function () {
    const state = history.location.state! as {
      loginName: string;
    };
    if (state) {
      forgetDispatch({ type: "loginName", loginName: state.loginName });
    }
  };

  const onFinish = (e: Store) => {
    forgetDispatch({ type: "loading", loading: true });
    const Email = e.username.replace(/\s+/g, "");
    onRecaptchaVerify(
      "",
      "SEND_EMAIL",
      (token, action) => {
        sendMail(Email.trim(), "FORGOT_PWD_CONSOLE", "", token, action).then(
          (res) => {
            forgetDispatch({ type: "loading", loading: false });
            if (res.code === "0000") {
              storage.set("Timing", "");
              history.push({
                pathname: "/verification",
                state: {
                  email: Email,
                  type: "FORGOT_PWD_CONSOLE",
                },
              });
            } else {
              message.error(res.message);
            }
          }
        );
      },
      () => forgetDispatch({ type: "loading", loading: false })
    );
  };

  const onFinishFailed = (errorInfo: Store) => {};

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      forgetDispatch({ type: "disabled", disabled: true });
    } else {
      forgetDispatch({ type: "disabled", disabled: false });
    }
  };

  useEffect(() => {
    Verification.preload();
    onInit();
  }, []);

  return (
    <div className="forgetpassword">
      <div className="forgetpassword-content">
        <div className="forgetpassword-model-top">
          {/* <FormattedMessage
            id="v2_account_password_setting"
            defaultMessage="V2 account password setting"
          /> */}
          <FormattedMessage
            id="reset_login_password"
            defaultMessage="Reset Login Password"
          />
        </div>
        <div className="password-text">
          {/* <img src={setting} alt="setting" />
          <p>
            <FormattedMessage
              id="before_using"
              defaultMessage="Before using V2, you need to set a login password for your V2
            account. Your original password is still retained in the V1 system."
            />
          </p> */}
        </div>
        <div className="forgetpassword-input">
          <Form
            name="basic"
            initialValues={{ remember: true, username: props.email }}
            hideRequiredMark={true}
            onFinish={onFinish}
            layout={"vertical"}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              name="username"
              label={
                <FormattedMessage
                  id="EnterEmailAccount"
                  defaultMessage="Enter email account"
                />
              }
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="PleaseEnterTheRegistered"
                      defaultMessage="Please enter the registered email to receive the verification code!"
                    />
                  ),
                },
                // { pattern: /.*@.*/, message: 'Please enter a vaild email' },
                {
                  message: "",
                  max: 128,
                },
              ]}
            >
              {/* <InputLine
                    allowClear
                    data-type="email"
                    id={'email'}
                    placeholder="Email"
                    onChange={onChange}
                  ></InputLine> */}
              <Input
                id={"email"}
                maxLength={254}
                allowClear
                type="email"
                disabled={true}
                data-type="email"
                onChange={onChange}
                defaultValue={props.email}
                // placeholder="Account"
              />
            </Form.Item>

            <Form.Item className="forgetpassword-ant">
              <Button
                className="btn-gradient"
                type="primary"
                htmlType="submit"
                // disabled={forget.disabled}
                loading={forget.loading}
              >
                <FormattedMessage id="Submit" defaultMessage="Submit" />
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <BottomComponent />
    </div>
  );
}
const mapStateToProps = (state: any) => {
  return {
    SwitchLanguage: state.SwitchLanguage,
    email: state.dashboardUserData.bindEmail,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgetPassword);

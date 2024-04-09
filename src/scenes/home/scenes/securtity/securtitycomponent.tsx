import React, { Component } from "react";
import { connect } from "react-redux";
import googleAuth from "assets/image/google-auth.png";
import yubikey from "assets/image/yubikey.svg";
import authyAuth from "assets/image/authy-auth.svg";
import empty from "assets/image/empty-table.png";
import worning from "assets/image/warning.png";
import BindMetaMaskEmailComponent from "./components/bindMetaMaskEmailComponent";
import AddreddWhileVerify from "../../../../components/addreddWhileVerify/addreddWhileVerify";
import TfaValidation from "../../../../components/tfaValidation";
import DisableGoogleTfa from "../../../../components/disableGoogleTfa";
import IdebtityVerification from "components/idebtityVerification";
import { imageList } from "scenes/home/scenes/dashboard/components/TwoFAModal/data";
import {
  Row,
  Col,
  Switch,
  Button,
  Table,
  Input,
  Select,
  Modal,
  message,
} from "antd";

import "./securtitycomponent.scss";
import {
  changeSecurity,
  UserData,
  securtityList,
  switchWhiteList,
} from "service/http/http";
import { Loadding } from "components/loadding";
import {
  setTfaList,
  setDashboardUserData,
  setUser,
} from "store/actions/publicAction";
import messageError from "utils/errorCode";
import history from "router/history";
import moment from "moment";
import {
  AuthyTwoFa,
  GoogleTwoFa,
  YoubikeyTwoFa,
  AddressManagement,
  AntiPhishing,
} from "scenes/home/router/configRouter";
import { ForgetPassword } from "router/configRouter";
import { guid } from "utils";
import TwoFAModal from "../dashboard/components/TwoFAModal/TwoFAModal";
import AddressManagementComponent from "./components/addressManagementComponent";
import BindMetaMaskAddressComponent from "./components/bindMetaMaskAddressComponent";
import WhiteListModal from "./components/whiteListModal/WhiteListModal";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from "react-intl";
import { localStorage } from "utils/storage";
const { Option } = Select;
interface IModelState {
  loadding: boolean;
  datas: [];
  total: number;
  pageIndex: number;
  pageSize: number;
  isWarningNotices: boolean;
  isDisableGoogleTfa: boolean;
  isTfa: boolean;
  loaddings: number;
  userData: IDashboardUserData | undefined;

  tfaProtected: TfaProtected;
  changeParams: {
    tfaProtected: string;
    isProtected: boolean;
  };
  params: IParams;

  accountName: string;
  statusList: [];
  loginName: string;
  area: string;

  googleAuthActive: string;
  authyActive: string;
  yubikeyActive: string;

  isTwoFAModal: boolean;
  isWhitetfa: boolean;
  identityVerification: boolean;
  emailIsBindMetaMask: boolean;
  isWhiteListModal: boolean;
  tfaType: string;
}

interface TfaProtected {
  isLogin: boolean;
  isLoginAndManagement: boolean;
  isModifications: boolean;
  isWithdraw: boolean;
}

interface IParams {
  pageNum?: number;
  pageSize?: number;
  searchParams: {
    accountId?: string;
    accountName?: string;
    remoteAddr?: string;
    area?: string;
    loginName?: string;
    start?: string;
    end?: string;
    deviceTypeList?: [];
    statusList?: [];
  };
}
type ISecurtityComponentPropsState = ReturnType<typeof mapStateToProps>;
type ISecurtityComponentDispatchState = ReturnType<typeof mapDispatchToProps> &
  ISecurtityComponentPropsState &
  WrappedComponentProps;

class SecurtityComponent extends Component<
  ISecurtityComponentDispatchState,
  IModelState
> {
  constructor(props: ISecurtityComponentDispatchState) {
    super(props);
    this.state = {
      loadding: false,
      datas: [],
      total: 0,
      pageIndex: 0,
      pageSize: 10,
      isWarningNotices: false,
      isDisableGoogleTfa: false,
      isTfa: false,
      loaddings: 0,
      userData: undefined,
      tfaProtected: {} as TfaProtected,
      changeParams: {
        tfaProtected: "",
        isProtected: false,
      },
      params: {
        pageNum: 0,
        pageSize: 10,
        searchParams: {},
      },

      accountName: "",
      statusList: [],
      loginName: "",
      area: "",

      googleAuthActive: "",
      authyActive: "",
      yubikeyActive: "",

      isTwoFAModal: false,
      isWhitetfa: false,
      identityVerification: false,
      emailIsBindMetaMask: true,
      isWhiteListModal: false,
      tfaType: "",
    };
  }

  componentDidMount() {
    const that = this;
    AuthyTwoFa.preload();
    GoogleTwoFa.preload();
    YoubikeyTwoFa.preload();
    ForgetPassword.preload();
    AddressManagement.preload();
    AntiPhishing.preload();
    this.searchUserData();
    this.getSecurtityList();
    this.props.setTfaList();
    const { dashboardUserData } = this.props;
    const { emailIsBindMetaMask } = this.state;
    let isBindEmail = emailIsBindMetaMask;
    if (dashboardUserData) {
      if (
        dashboardUserData.publicAddress &&
        dashboardUserData.accountSource === "METAMASK" &&
        !dashboardUserData.bindEmail
      ) {
        isBindEmail = false;
        if (!dashboardUserData.isMainAccount) {
          isBindEmail = false;
        }
      }
      if (
        dashboardUserData.publicAddress &&
        dashboardUserData.accountSource === "METAMASK" &&
        !dashboardUserData.isMainAccount
      ) {
        isBindEmail = true;
      }
      that.setState({
        emailIsBindMetaMask: isBindEmail,
      });
    }
  }
  setIsWhitetfa = (open: boolean) => {
    this.setState({
      isTwoFAModal: open,
    });
  };

  getSecurtityList = () => {
    this.setState(
      {
        loaddings: 1,
        params: {
          pageNum: this.state.pageIndex + 1,
          pageSize: this.state.pageSize,
          searchParams: {
            accountName: this.state.accountName,
            area: this.state.area,
            loginName: this.state.loginName,
            statusList: this.state.statusList,
          },
        },
      },
      () => {
        securtityList(this.state.params).then((res) => {
          this.setState({ loaddings: 0 });
          if (res.code === "0000") {
            const result = res.data.data.map((item: any) => ({
              ...item.actionDetails,
              actionTime: item.actionTime,
            }));
            this.setState({ datas: result, total: res.data.total });
          } else {
            message.error(res.message);
          }
        });
      }
    );
  };

  searchUserData = () => {
    UserData().then((res) => {
      if (res.code === "0000") {
        this.setState({
          userData: res.data,
          tfaProtected: res.data.tfaProtected,
        });
        this.props.setDashboardUserData(res.data);
      } else {
        message.error(res.message);
      }
    });
  };

  changeSecurity = (code?: string) => {
    this.setState({ loaddings: 1 });
    changeSecurity({
      tfaProtected: this.state.changeParams.tfaProtected,
      isProtected: this.state.changeParams.isProtected,
      tfaCode: code,
    }).then((res) => {
      this.setState({ loaddings: 0 });
      if (res.code === "0000") {
        message.success(this.props.intl.formatMessage({ id: "Success" }));
        this.props.setUser({
          ...this.props.users,
          token: res.data,
        });
        this.searchUserData();
      } else {
        message.error(res.message);
      }
    });
  };

  onChange = (isTrue: boolean, type: string) => {
    this.setState(
      {
        changeParams: {
          tfaProtected: type,
          isProtected: isTrue,
        },
      },
      () => {
        if (isTrue) {
          this.setState({
            isTfa: true,
          });
        } else {
          this.setState({ isWarningNotices: true });
        }
      }
    );
  };
  sourceType = (row: any) => {
    let str: string = "";
    if (row.agentInfo?.deviceType === "COMPUTER") {
      str = this.props.intl.formatMessage({ id: "Web", defaultMessage: "Web" });
    } else {
      if (row.agentInfo?.manufacturer === "APPLE") {
        str = "IOS";
      }
      if (row.agentInfo?.manufacturer === "GOOGLE") {
        str = "Android";
      }
      if (row.agentInfo?.manufacturer === "OTHER") {
        str = this.props.intl.formatMessage({
          id: "OTHER",
          defaultMessage: "Other",
        });
      }
    }
    return str;
  };

  onWhitelistOff = (code: string, emailCode: string) => {
    this.setState({ loaddings: 1 });
    switchWhiteList(
      !this.props.dashboardUserData.enableWithdrawalWhiteList,
      code,
      emailCode
    ).then((res) => {
      this.setState({ loaddings: 0 });
      if (res.success) {
        localStorage.set("time", null);
        this.props.setDashboardUserData({
          ...this.props.dashboardUserData,
          enableWithdrawalWhiteList:
            !this.props.dashboardUserData.enableWithdrawalWhiteList,
        });
        this.setState({
          isWhitetfa: false,
        });
      } else {
        message.warn(res.message);
      }
    });
  };
  handleShowModalVerify = (e: boolean) => {
    this.setState({ identityVerification: e });
  };

  kyckycInfoOne = (intl: any) => {
    return (
      <div className="withdrawal-limit">
        <FormattedMessage
          id="withdrawal_limit"
          values={{
            value: "10,000",
          }}
        />
        {<br></br>}
        {intl.formatMessage({
          id: "increase_kyc_2",
        })}
      </div>
    );
  };

  kyckycInfoTwo = (intl: any) => {
    return (
      <div className="withdrawal-limit">
        <FormattedMessage
          id="withdrawal_limit2"
          values={{
            value: "10,000",
          }}
        />
        {<br></br>}
        {intl.formatMessage({
          id: "increase_kyc_3",
        })}
      </div>
    );
  };

  kyckycInfoThree = (intl: any) => {
    return (
      <div className="withdrawal-limit">
        {intl.formatMessage({
          id: "Withdrawal_limit_Unlimited",
          defaultMessage: "Withdrawal limit: Unlimited",
        })}
      </div>
    );
  };
  onCallBack = (off: boolean) => {
    if (off) {
      this.setState({
        isWhitetfa: true,
      });
    }
  };
  onShowSizeChange = (current: number, size: number) => {
    this.setState(
      {
        pageSize: size,
        pageIndex: current - 1,
      },
      () => {
        this.getSecurtityList();
      }
    );
  };
  onChangePagination = (page: number, pageSize: number | undefined) => {
    this.setState(
      {
        pageSize: pageSize!,
        pageIndex: page - 1,
      },
      () => {
        this.getSecurtityList();
      }
    );
  };
  searchTfa = (type: string) => {
    const { tfaList } = this.props;
    if (tfaList && tfaList.length) {
      return tfaList.find((i) => i === type);
    }
  };
  clickTfa = (type: string, url: string) => {
    this.setState({
      tfaType: type,
    });
    if (this.searchTfa(type)) {
      this.setState({ isDisableGoogleTfa: true });
    } else {
      history.push(url);
    }
  };
  render() {
    const { emailIsBindMetaMask, tfaType } = this.state;
    const columns = [
      {
        title: this.props.intl.formatMessage({ id: "account_name" }),
        dataIndex: "accountName",
      },
      {
        title: this.props.intl.formatMessage({
          id: "Login_name",
          defaultMessage: "Login name",
        }),
        dataIndex: "loginName",
      },
      {
        title: this.props.intl.formatMessage({
          id: "Time",
          defaultMessage: "Time",
        }),
        dataIndex: "actionTime",
        render: (item: any) => (
          <div className="table-status">
            {moment.parseZone(item).local().format("YYYY-MM-DD HH:mm:ss")}
          </div>
        ),
      },
      {
        title: this.props.intl.formatMessage({
          id: "Source",
          defaultMessage: "Source",
        }),
        dataIndex: "deviceType",
        render: (item: any, row: any) => this.sourceType(row),
      },
      {
        title: this.props.intl.formatMessage({
          id: "Status",
          defaultMessage: "Status",
        }),
        dataIndex: "status",
        render: (item: any) =>
          item === "SUCCESS" ? (
            <div className="table-status" style={{ color: "#09BB07" }}>
              {optinsPlay[item]}
            </div>
          ) : (
            <div className="table-status" style={{ color: "#F76260" }}>
              {optinsPlay[item]}
            </div>
          ),
      },
      {
        title: this.props.intl.formatMessage({
          id: "IP_Address",
          defaultMessage: "IP Address",
        }),
        dataIndex: "remoteAddr",
      },
      {
        title: this.props.intl.formatMessage({
          id: "Area",
          defaultMessage: "Area",
        }),
        dataIndex: "ipAddress",
        render: (item: any, row: any) => {
          return (
            <div className="table-status">
              {row.ipAddress?.country}-{row.ipAddress?.region}-
              {row.ipAddress?.city}
            </div>
          );
        },
      },
    ];

    const optins = [
      {
        lable: this.props.intl.formatMessage({
          id: "Success",
          defaultMessage: "Success",
        }),
        value: "SUCCESS",
      },
      {
        lable: this.props.intl.formatMessage({
          id: "FAIL_TFA",
          defaultMessage: "Failure (no valid 2FA provided)",
        }),
        value: "FAIL_TFA",
      },
      {
        lable: this.props.intl.formatMessage({
          id: "FAIL_PASSWORD",
          defaultMessage: "Failure (incorrect password)",
        }),
        value: "FAIL_PASSWORD",
      },
      {
        lable: this.props.intl.formatMessage({
          id: "FAIL_PERMISSIONS",
          defaultMessage: "Failure (login suspended)",
        }),
        value: "FAIL_PERMISSIONS",
      },
    ];
    const optinsPlay: any = {
      SUCCESS: this.props.intl.formatMessage({
        id: "Success",
        defaultMessage: "Success",
      }),
      FAIL_TFA: this.props.intl.formatMessage({
        id: "FAIL_TFA",
        defaultMessage: "Failure (no valid 2FA provided)",
      }),
      FAIL_PASSWORD: this.props.intl.formatMessage({
        id: "FAIL_PASSWORD",
        defaultMessage: "Failure (incorrect password)",
      }),
      FAIL_PERMISSIONS: this.props.intl.formatMessage({
        id: "FAIL_PERMISSIONS",
        defaultMessage: "Failure (login suspended)",
      }),
    };
    const actions: any = {
      WITHDRAW: this.props.intl.formatMessage({
        id: "Withdraws",
        defaultMessage: "Withdraws",
      }),
      LOGIN: this.props.intl.formatMessage({
        id: "no_space_login",
        defaultMessage: "Log in",
      }),
      MODIFICATIONS: this.props.intl.formatMessage({
        id: "security_modifications",
        defaultMessage: "Security modifications",
      }),
      LOGINANDMANAGEMENT: this.props.intl.formatMessage({
        id: "login_api_management",
        defaultMessage: "Login & API Management",
      }),
    };
    return (
      <div className="securtity-component">
        <Loadding show={this.state.loaddings ? 1 : 0}>
          {
            emailIsBindMetaMask ? (
              <Row gutter={[8, 0]}>
                <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                  <div className="securtity-content">
                    <div className="title">
                      {this.props.intl.formatMessage({
                        id: "account_security",
                        defaultMessage: "Account Security",
                      })}
                    </div>
                    <div className="line" />
                    <div className="cart-content">
                      <div className="enable">
                        {this.props.intl.formatMessage({
                          id: "enable_2fa",
                          defaultMessage: "Enable 2FA",
                        })}
                      </div>
                      <div className="auth-items">
                        <div
                          className="auth-item"
                          onClick={this.clickTfa.bind(
                            this,
                            "GOOGLE",
                            "/home/security/google_2fa"
                          )}
                        >
                          <img
                            src={
                              this.searchTfa("GOOGLE")
                                ? googleAuth
                                : imageList.Google
                            }
                            alt="googleAuth"
                            style={{ width: "48px" }}
                          />
                          <div className="tfa-type">
                            <span>
                              {this.props.intl.formatMessage({
                                id: "Google_Auth",
                                defaultMessage: "Google Auth",
                              })}
                            </span>
                            {this.searchTfa("GOOGLE") && (
                              <span className="type-disable">
                                {this.props.intl.formatMessage({
                                  id: "Disable",
                                  defaultMessage: "Disable",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className="auth-item"
                          onClick={this.clickTfa.bind(
                            this,
                            "AUTHY_SECRET",
                            "/home/security/authy_2fa"
                          )}
                        >
                          <img
                            src={
                              this.searchTfa("AUTHY_SECRET")
                                ? authyAuth
                                : imageList.Authy
                            }
                            alt="authyAuth"
                            style={{ width: "48px" }}
                          />
                          <div className="tfa-type">
                            <span>
                              {this.props.intl.formatMessage({
                                id: "Authy",
                                defaultMessage: "Authy",
                              })}
                            </span>
                            {this.searchTfa("AUTHY_SECRET") && (
                              <span className="type-disable">
                                {this.props.intl.formatMessage({
                                  id: "Disable",
                                  defaultMessage: "Disable",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className="auth-item"
                          onClick={this.clickTfa.bind(
                            this,
                            "YUBIKEY",
                            "/home/security/yubikey_2fa"
                          )}
                        >
                          <img
                            src={
                              this.searchTfa("YUBIKEY")
                                ? yubikey
                                : imageList.YubikeyNoHover
                            }
                            alt="googleAuth"
                            style={{ width: "48px" }}
                          />
                          <div className="tfa-type">
                            <span>
                              {this.props.intl.formatMessage({
                                id: "YubiKey",
                                defaultMessage: "YubiKey",
                              })}
                            </span>
                            {this.searchTfa("YUBIKEY") && (
                              <span className="type-disable">
                                {this.props.intl.formatMessage({
                                  id: "Disable",
                                  defaultMessage: "Disable",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="permission">
                        {this.props.intl.formatMessage({
                          id: "protected_actions",
                          defaultMessage: "Protected Actions",
                        })}
                      </div>

                      <div className="protected-actions">
                        <Row>
                          <Col span={11}>
                            <Row gutter={[0, 16]}>
                              <Col
                                className={
                                  this.props.dashboardUserData.enableTfa
                                    ? "permission-tite"
                                    : "permission-tite-opacity"
                                }
                                span={12}
                              >
                                {this.props.intl.formatMessage({
                                  id: "Withdrawals",
                                  defaultMessage: "Withdrawals",
                                })}
                              </Col>
                              <Col span={12} className="protected-switch">
                                <Switch
                                  disabled={
                                    !this.props.dashboardUserData.enableTfa ||
                                    this.state.tfaProtected?.isWithdraw
                                  }
                                  checked={this.state.tfaProtected?.isWithdraw}
                                  onChange={(e) => this.onChange(e, "WITHDRAW")}
                                />
                              </Col>
                            </Row>
                            <Row style={{ marginTop: "12px" }}>
                              <Col
                                span={18}
                                className={
                                  this.props.dashboardUserData.enableTfa
                                    ? "permission-tite"
                                    : "permission-tite-opacity"
                                }
                              >
                                {this.props.intl.formatMessage({
                                  id: "security_modifications",
                                  defaultMessage: "Security modifications",
                                })}
                              </Col>
                              <Col span={6} className="protected-switch">
                                <Switch
                                  disabled={
                                    !this.props.dashboardUserData.enableTfa
                                  }
                                  checked={
                                    this.state.tfaProtected?.isModifications
                                  }
                                  onChange={(e) =>
                                    this.onChange(e, "MODIFICATIONS")
                                  }
                                />
                              </Col>
                            </Row>
                          </Col>
                          <Col
                            span={2}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <div className="protected-line"></div>
                          </Col>
                          <Col span={11}>
                            <Row gutter={[0, 16]}>
                              <Col
                                span={12}
                                className={
                                  this.props.dashboardUserData.enableTfa
                                    ? "permission-tite"
                                    : "permission-tite-opacity"
                                }
                              >
                                {this.props.intl.formatMessage({
                                  id: "no_space_login",
                                  defaultMessage: "Login",
                                })}
                              </Col>
                              <Col span={12} className="protected-switch">
                                <Switch
                                  disabled={
                                    !this.props.dashboardUserData.enableTfa
                                  }
                                  checked={this.state.tfaProtected?.isLogin}
                                  onChange={(e) => this.onChange(e, "LOGIN")}
                                />
                              </Col>
                            </Row>
                            <Row style={{ marginTop: "12px" }}>
                              <Col
                                span={18}
                                className={
                                  this.props.dashboardUserData.enableTfa
                                    ? "permission-tite"
                                    : "permission-tite-opacity"
                                }
                              >
                                {this.props.intl.formatMessage({
                                  id: "login_api_management",
                                  defaultMessage: "Login & API Management",
                                })}
                              </Col>
                              <Col span={6} className="protected-switch">
                                <Switch
                                  disabled={
                                    !this.props.dashboardUserData.enableTfa
                                  }
                                  checked={
                                    this.state.tfaProtected
                                      ?.isLoginAndManagement
                                  }
                                  onChange={(e) =>
                                    this.onChange(e, "LOGINANDMANAGEMENT")
                                  }
                                />
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={{ span: 24 }} lg={{ span: 12 }}>
                  <div className="cart-right">
                    {this.props.users.mainLogin ? (
                      <div>
                        <div className="cart-item" style={{ height: "88px" }}>
                          <div className="title">
                            {this.props.intl.formatMessage({
                              id: "Login_Password",
                              defaultMessage: "Login Password",
                            })}
                          </div>
                          {this.props.users.mainLogin ? (
                            <Button
                              className="active"
                              onClick={() => {
                                history.push("/forgetpassword");
                              }}
                            >
                              {this.props.intl.formatMessage({
                                id: "Reset",
                                defaultMessage: "Reset",
                              })}
                            </Button>
                          ) : null}
                        </div>
                        <div className="cart-item-line" />
                        <div className="cart-item" style={{ height: "87px" }}>
                          <div className="title">
                            {" "}
                            {!this.props.dashboardUserData.isMainAccount
                              ? this.props.intl.formatMessage({
                                  id: "SubAccountEmail",
                                  defaultMessage: "Sub account Email",
                                })
                              : this.props.intl.formatMessage({
                                  id: "Email",
                                  defaultMessage: "Email",
                                })}
                          </div>
                          {this.props.users.mainLogin ? (
                            <Button
                              onClick={() => {
                                message.warning(
                                  this.props.intl.formatMessage({
                                    id: "ComingSoon",
                                    defaultMessage: "Coming Soon",
                                  })
                                );
                              }}
                            >
                              {this.props.intl.formatMessage({
                                id: "Reset",
                                defaultMessage: "Reset",
                              })}
                            </Button>
                          ) : null}
                        </div>
                        <div className="cart-item-line"></div>
                      </div>
                    ) : null}
                    {/* {this.props.dashboardUserData &&
                  !this.props.dashboardUserData.accountSource &&
                  !this.props.dashboardUserData.publicAddress &&
                  this.props.dashboardUserData.isMainAccount ? (
                    <BindMetaMaskAddressComponent />
                  ) : null} */}
                    <div
                      className="cart-item cart-item-sub"
                      style={{ minHeight: "113px" }}
                    >
                      <div className="kyc-level">
                        <div className="title">
                          {this.props.intl.formatMessage({
                            id: "Anti-Phishing Code",
                            defaultMessage: "Anti-Phishing Code",
                          })}
                        </div>
                        <Button
                          className="active"
                          disabled={!this.props.users.mainLogin}
                          onClick={() => {
                            if (this.props.users.mainLogin) {
                              history.push("/home/security/AntiPhishing");
                              return;
                            }
                          }}
                        >
                          Set Up
                        </Button>
                      </div>
                      <div
                        className="withdrawal-limit"
                        style={{ paddingRight: "67px" }}
                      >
                        {this.props.intl.formatMessage({
                          id: "Protect your account from phishing attempts and ensure that your notification emails are from OPNX only.",
                          defaultMessage:
                            "Protect your account from phishing attempts and ensure that your notification emails are from OPNX only.",
                        })}
                      </div>
                    </div>
                    <div className="cart-item-line"></div>
                    <AddressManagementComponent
                      setIsWhitetfa={this.setIsWhitetfa}
                      callBack={this.onCallBack}
                    />
                  </div>
                </Col>
              </Row>
            ) : null
            // <BindMetaMaskEmailComponent setIsWhitetfa={this.setIsWhitetfa} />
          }
          {/* securtity-content  */}
          <div className="account-activity">
            <div className="cart-title">
              {this.props.intl.formatMessage({
                id: "Account_Activity",
                defaultMessage: "Account Activity",
              })}
            </div>
            <div className="cart-line"></div>
            <div className="cart-seach">
              <Row
                gutter={[16, 16]}
                className="account-activity-search"
                style={{ display: "flex" }}
              >
                <Col span={5}>
                  <div className="intput-name">
                    {this.props.intl.formatMessage({
                      id: "account_name",
                      defaultMessage: "Account_Name",
                    })}
                  </div>
                  <Input
                    onChange={(e) => {
                      this.setState({ accountName: e.target.value });
                    }}
                    placeholder={this.props.intl.formatMessage({
                      id: "Please_Enter",
                    })}
                  />
                </Col>
                <Col span={5}>
                  <div className="intput-name">
                    {this.props.intl.formatMessage({
                      id: "Status",
                      defaultMessage: "Status",
                    })}
                  </div>
                  <Select
                    showArrow
                    mode="multiple"
                    maxTagCount={1}
                    getPopupContainer={(triggerNode) => triggerNode}
                    style={{ width: "100%" }}
                    placeholder={this.props.intl.formatMessage({
                      id: "Please_Select",
                    })}
                    className="status-select"
                    onChange={(e: any) => {
                      this.setState({
                        statusList: e,
                      });
                    }}
                  >
                    {optins.map((res) => (
                      <Option key={res.value} value={res.value}>
                        {res.lable}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={5}>
                  <div className="intput-name">
                    {this.props.intl.formatMessage({
                      id: "Login_name",
                      defaultMessage: "Login name",
                    })}
                  </div>
                  <Input
                    onChange={(e) => {
                      this.setState({ loginName: e.target.value });
                    }}
                    placeholder={this.props.intl.formatMessage({
                      id: "Please_Enter",
                    })}
                  />
                </Col>
                <Col span={5}>
                  <div className="intput-name">
                    {this.props.intl.formatMessage({
                      id: "Area",
                      defaultMessage: "Area",
                    })}
                  </div>
                  <Input
                    onChange={(e) => {
                      this.setState({ area: e.target.value });
                    }}
                    placeholder={this.props.intl.formatMessage({
                      id: "Please_Enter",
                    })}
                  />
                </Col>
                <Col span={4}>
                  <Button
                    className="active search-btn"
                    onClick={() => {
                      this.setState(
                        {
                          pageIndex: 0,
                        },
                        () => {
                          this.getSecurtityList();
                        }
                      );
                    }}
                  >
                    {this.props.intl.formatMessage({
                      id: "Search",
                      defaultMessage: "Search",
                    })}
                  </Button>
                </Col>
              </Row>
            </div>
            <div className="securtity-table">
              <Table
                columns={columns}
                dataSource={this.state.datas}
                rowClassName={(record, index) => "table-row"}
                rowKey={(recond: any) => guid()}
                scroll={{ x: 1230 }}
                pagination={{
                  pageSizeOptions: ["10", "20", "30"],
                  defaultPageSize: 10,
                  onShowSizeChange: this.onShowSizeChange,
                  showSizeChanger: true,
                  current: this.state.pageIndex + 1,
                  total: this.state.total,
                  onChange: this.onChangePagination,
                }}
                locale={{
                  emptyText: (
                    <div className="empty-table">
                      <img src={empty} alt="empty-table" />
                      <span style={{ marginTop: "12px" }}>
                        {this.props.intl.formatMessage({
                          id: "No_Account_Activity",
                          defaultMessage: "No Account Activity",
                        })}
                      </span>
                    </div>
                  ),
                }}
              />
            </div>
          </div>
          {this.state.isWarningNotices ? (
            <Modal
              visible={this.state.isWarningNotices}
              footer={null}
              className="warning-model"
              onCancel={() => {
                this.setState({
                  isWarningNotices: false,
                });
              }}
            >
              <div className="warning">
                <img alt="warning" src={worning} />
                <div className="warning-div1">
                  {this.props.intl.formatMessage({
                    id: "TurnOff",
                    defaultMessage: "Turn off",
                  })}{" "}
                  {actions[this.state.changeParams.tfaProtected]}{" "}
                  {this.props.intl.formatMessage({
                    id: "protection",
                    defaultMessage: "protection",
                  })}
                </div>
                {this.state.changeParams.tfaProtected === "LOGIN" && (
                  <div className="warning-div2">
                    {/* {this.props.intl.formatMessage({
                      id: 'after_switching_off',
                      defaultMessage:
                        'After switching off, your Log in will not be protected! It is strongly recommended that this is not turned off as it will increase property risk.',
                    })} */}
                    <FormattedMessage
                      id="after_switching_off"
                      values={{
                        protectedActions: this.props.intl.formatMessage({
                          id: "no_space_login",
                          defaultMessage: "Login",
                        }),
                      }}
                    />
                  </div>
                )}
                {this.state.changeParams.tfaProtected === "MODIFICATIONS" && (
                  <div className="warning-div2">
                    <FormattedMessage
                      id="after_switching_off"
                      values={{
                        protectedActions: this.props.intl.formatMessage({
                          id: "security_modifications",
                          defaultMessage: "Security modifications",
                        }),
                      }}
                    />
                    {/* After switching off, your Security modifications will not be
                    protected! It is strongly recommended that this is not
                    turned off as it will increase property risk. */}
                  </div>
                )}
                {this.state.changeParams.tfaProtected ===
                  "LOGINANDMANAGEMENT" && (
                  <div className="warning-div2">
                    <FormattedMessage
                      id="after_switching_off"
                      values={{
                        protectedActions: this.props.intl.formatMessage({
                          id: "login_api_management",
                          defaultMessage: "Login & API Management",
                        }),
                      }}
                    />
                    {/* After switching off, your Login & API Management will not be
                    protected! It is strongly recommended that this is not
                    turned off as it will increase property risk. */}
                  </div>
                )}
                {/* <div className="warning-div2">
                  After closing, your{' '}
                  {actions[this.state.changeParams.tfaProtected]} will not be
                  protected! Please do not close, it will increase property
                  risk.
                </div> */}
                <div className="warning-div3">
                  {this.props.intl.formatMessage({
                    id: "enabling_2fa",
                    defaultMessage:
                      "I understand the risks for not enabling 2FA",
                  })}
                </div>
                <div
                  className="warning-div4"
                  onClick={() => {
                    this.setState({
                      isWarningNotices: false,
                      isTfa: true,
                    });
                  }}
                >
                  {this.props.intl.formatMessage({
                    id: "turn_off_now",
                    defaultMessage: "Turn off now",
                  })}
                  {" >>"}
                </div>
              </div>
            </Modal>
          ) : null}

          {this.state.isTfa ? (
            <TfaValidation
              visable={this.state.isTfa}
              onCloseModel={(e) => {
                this.setState({
                  isTfa: e,
                });
              }}
              callBack={(e) => {
                this.changeSecurity(e);
              }}
            />
          ) : null}

          {this.state.isDisableGoogleTfa ? (
            <DisableGoogleTfa
              intl={this.props.intl}
              visable={this.state.isDisableGoogleTfa}
              onCloseModel={() => {
                this.setState({
                  isDisableGoogleTfa: false,
                });
              }}
              type={tfaType}
              callBack={() => {
                this.props.setTfaList();
                message.success(
                  this.props.intl.formatMessage({ id: "Success" })
                );
                this.searchUserData();
                // this.getSecurtityList();
              }}
            />
          ) : null}

          {this.state.isTwoFAModal ? (
            <TwoFAModal
              visible={this.state.isTwoFAModal}
              handlerCallback={() => {
                this.setState({
                  isTwoFAModal: false,
                });
              }}
            />
          ) : null}

          {this.state.isWhiteListModal ? (
            <WhiteListModal
              type={
                this.props.dashboardUserData.enableWithdrawalWhiteList
                  ? "CloseWhiteList"
                  : "EnableWhiteList"
              }
              visible={this.state.isWhiteListModal}
              handleCloseModal={() => {
                this.setState({
                  isWhiteListModal: false,
                });
              }}
              Callback={(e) => {
                if (!this.props.dashboardUserData.enableTfa) {
                  this.setState({
                    isTwoFAModal: true,
                    isWhiteListModal: false,
                  });
                } else {
                  this.setState({ isWhitetfa: true, isWhiteListModal: false });
                }
              }}
            />
          ) : null}
          {this.state.isWhitetfa ? (
            <AddreddWhileVerify
              visable={this.state.isWhitetfa}
              btnLoading={this.state.loaddings}
              onCloseModel={(e) => {
                this.setState({
                  isWhitetfa: e,
                });
              }}
              callBack={(e, emailCode) => {
                this.onWhitelistOff(e, emailCode);
              }}
            />
          ) : null}
          {this.state.identityVerification ? (
            <IdebtityVerification
              visable={this.state.identityVerification}
              onCloseModel={this.handleShowModalVerify}
            />
          ) : null}
        </Loadding>
      </div>
    );
  }
}
const mapStateToProps = (state: {
  dashboardUserData: IDashboardUserData;
  users: Iusers;
  tfaList: string[];
}) => {
  return {
    dashboardUserData: state.dashboardUserData,
    users: state.users,
    tfaList: state.tfaList,
  };
};

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
    setUser(data: any) {
      dispatch(setUser(data));
    },
    setTfaList() {
      dispatch(setTfaList());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SecurtityComponent));

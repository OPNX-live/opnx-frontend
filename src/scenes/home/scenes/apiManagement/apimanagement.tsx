import React, { Component } from "react";
import { connect } from "react-redux";
import { imgList } from "./data";
import {
  Modal,
  Row,
  Col,
  Divider,
  Select,
  Space,
  Table,
  message,
  Checkbox,
  Radio,
  Tooltip,
  Input,
  Spin,
} from "antd";
import moment from "moment";
import {
  subAccountList,
  createApiKey,
  getApiKeys,
  delApiKey,
  geetestValidate,
  geetestInit,
  geetestType,
  UserData,
} from "service/http/http";
import CreateApiKeyModal from "./components/createApiKey/createapikeymodal";
import messageError from "utils/errorCode";
import TfaValidation from "components/tfaValidation";
import { isPositiveIntegerTimes, guid } from "utils/utils";

import "./apimanagement.scss";
import { Loadding } from "components/loadding";
import gt from "utils/gt";
import Search from "antd/lib/input/Search";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import { RadioChangeEvent } from "antd/lib/radio/interface";
import EditApiModal from "./components/editApiModal/EditApiModal";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { setDashboardUserData } from "store/actions/publicAction";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { confirm } = Modal;

const reg =
  /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
interface IModelState {
  loadding: boolean;
  visible: boolean;
  changeVisible: boolean;
  accounts: [];
  optinValue: string;
  switchCanTrade: boolean;
  switchCanWithdraw: boolean;
  cfAPIKey: string;
  cfAPISecret: string;
  datas: [];
  total: number;
  pageIndex: number;
  pageSize: number;
  changeParams: {
    cfAPIId: string; // id
    canTrade: boolean; //
    canWithdraw: boolean;
    label: string;
    allowedIps: [];
    ipIsRestricted: boolean;
  };
  code?: string;
  permissionStr: string;
  optionName: string;
  isTfaValidation: boolean;
  label: string;
  loaddings: boolean;
  radioValue: number;
  ipList: string[];
  value: string;
  errorStr: string;
  canWithdraw: boolean;
}
const { Option } = Select;
type IApiManagementDispatchState = ReturnType<typeof mapDispatchToProps>;

type IApiManagementPropsState = ReturnType<typeof mapStateToProps> &
  IModelState &
  WrappedComponentProps &
  IApiManagementDispatchState;
class ApiManagement extends Component<IApiManagementPropsState, IModelState> {
  constructor(props: any) {
    super(props);

    this.state = {
      loadding: false,
      visible: false,
      changeVisible: false,
      accounts: [],
      optinValue: "",
      switchCanTrade: false,
      switchCanWithdraw: false,
      cfAPIKey: "",
      cfAPISecret: "",
      datas: [],
      total: 0,
      pageIndex: 0,
      pageSize: 10,
      changeParams: {
        cfAPIId: "",
        canTrade: false,
        canWithdraw: false,
        label: "",
        allowedIps: [],
        ipIsRestricted: false,
      },
      permissionStr: "",
      optionName: "",
      isTfaValidation: false,
      label: "",
      loaddings: false,
      radioValue: 2,
      ipList: [],
      value: "",
      errorStr: "",
      canWithdraw: false,
    };
  }

  componentDidMount() {
    const { setDashboardUserData } = this.props;
    UserData().then((res) => {
      if (res.success) {
        setDashboardUserData(res.data);
      } else {
        message.warning(res.message);
      }
    });
    this.getSubAccountList();
    this.getApiKeys();
  }

  getSubAccountList = () => {
    subAccountList().then((res) => {
      if (res.code === "0000") {
        if (res.data.length > 0) {
          this.setState({
            accounts: res.data,
            optinValue: res.data[0].accountId,
            optionName: res.data[0].accountName,
          });
        } else {
          this.setState({
            accounts: [],
            optinValue: "",
          });
        }
      }
    });
  };

  createApiKey = (code?: string, token?: string, action?: string) => {
    if (
      this.props.dashboardUserData.enableTfa &&
      this.props.dashboardUserData.tfaProtected.isLoginAndManagement
    ) {
      this.setState({
        isTfaValidation: true,
        loaddings: false,
      });
    } else {
      this.onCreateApiKey(code, "", "", token, action);
    }
  };

  onCreateApiKey = (
    code?: string,
    placeholder?: string,
    value?: string,
    token?: string,
    action?: string
  ) => {
    const arr = Array.from(new Set(this.state.ipList));
    createApiKey(
      {
        accountId: this.state.optinValue, // 账户id
        canTrade: this.state.switchCanTrade, //  是否可交易 true 是 false 否
        canWithdraw: this.state.canWithdraw, // 是否可提币 true 是 false 否}).then((res)=>{
        allowedIps: this.state.radioValue === 2 ? arr : [],
        ipIsRestricted: this.state.radioValue === 2 ? true : false,
        label: this.state.label,
      },
      code,
      value,
      token,
      action
    ).then((res) => {
      this.setState({ loaddings: false });
      if (res.code === "0000") {
        let str = "";
        const CanTrade = this.props.intl.formatMessage({ id: "Can_Trade" });
        const CanWithdraw = this.props.intl.formatMessage({
          id: "Can Withdraw",
        });
        if (this.state.switchCanTrade && this.state.canWithdraw) {
          str = `${CanTrade},${CanWithdraw}`;
        } else if (this.state.switchCanTrade) {
          str = CanTrade;
        } else if (this.state.canWithdraw) {
          str = CanWithdraw;
        } else {
          str = this.props.intl.formatMessage({ id: "Read-Only" });
        }
        this.getApiKeys(0);
        this.setState({
          visible: true,
          cfAPIKey: res.data.cfAPIKey,
          cfAPISecret: res.data.cfAPISecret,
          permissionStr: str,
          label: "",
          ipList: [],
          radioValue: 2,
          canWithdraw: false,
          switchCanTrade: false,
        });
      } else {
        message.error(res.message);
      }
    });
  };

  async getApiKeys(pageIndex?: number) {
    getApiKeys({
      pageNum: pageIndex !== undefined ? pageIndex : this.state.pageIndex,
      pageSize: this.state.pageSize,
    }).then((res) => {
      if (res.success) {
        this.setState({ datas: res.data.data, total: res.data.total });
      } else {
        message.error(res.message);
      }
    });
  }
  delApiKey(cfAPIId: string) {
    const _this = this;
    const s = _this.props.intl.formatMessage({ id: "account_model_delete" });
    confirm({
      title: s,
      // icon: <ExclamationCircleOutlined />,
      content: <div>{this.props.intl.formatMessage({ id: "APIRemoved" })}</div>,
      okText: _this.props.intl.formatMessage({ id: "Confirm" }),
      cancelText: _this.props.intl.formatMessage({ id: "Cancel" }),
      onOk() {
        delApiKey(cfAPIId).then((res) => {
          if (res.success) {
            if (isPositiveIntegerTimes((_this.state.total - 1) / 10)) {
              _this.setState({ pageIndex: _this.state.pageIndex });
              _this.getApiKeys();
            } else {
              _this.setState({ pageIndex: _this.state.pageIndex });
              _this.getApiKeys();
            }
            message.success(_this.props.intl.formatMessage({ id: "Success" }));
          } else {
            message.error(res.message);
          }
        });
      },
      onCancel() {},
    });
  }
  onCloseModal = () => {
    this.setState({
      visible: false,
    });
    this.getApiKeys(0);
  };

  onCreateApi = () => {
    if (this.state.label === "") {
      message.error(this.props.intl.formatMessage({ id: "pleaseEnterLabel" }));
      return;
    }
    const reg = /^([\u4e00-\u9fa5a-z\d_. /]{1,16}|[a-zA-Z\d_. /]{1,32})$/gi;
    if (!reg.test(this.state.label)) {
      message.error(this.props.intl.formatMessage({ id: "pleaseEnterUp" }));
      return;
    }
    if (this.state.radioValue === 2 && this.state.ipList.length <= 0) {
      this.setState({
        errorStr: this.props.intl.formatMessage({ id: "pleaseEnterIPAddress" }),
      });
      return;
    }
    onRecaptchaVerify(
      "",
      "CREATE_API",
      (token, action) => {
        this.setState({ loaddings: true });
        this.createApiKey("", token, action);
      },
      () => this.setState({ loaddings: false })
    );
  };
  // handler = (obj: any) => {
  //   this.setState({ loaddings: true });
  //   obj.appendTo("#captcha");
  //   obj
  //     .onReady(function () {
  //       obj.verify();
  //     })
  //     .onSuccess(() => {
  //       const result = obj.getValidate();
  //       const data = {
  //         email: this.props.dashboardUserData.accountId,
  //         geetest_challenge: result.geetest_challenge,
  //         geetest_validate: result.geetest_validate,
  //         geetest_seccode: result.geetest_seccode,
  //         clientType: "web",
  //         geetestType: "CREATE_API",
  //       };
  //       geetestValidate(data)
  //         .then((resGeestest: any) => {
  //           if (resGeestest.status === "success") {
  //             this.setState({ loaddings: true });
  //             this.createApiKey();
  //           } else {
  //             message.warning(
  //               this.props.intl.formatMessage({ id: "VerificationFailed" })
  //             );
  //             obj.reset();
  //           }
  //         })
  //         .catch((err) => {
  //           message.warning(
  //             this.props.intl.formatMessage({ id: "VerificationFailed" })
  //           );
  //           obj.reset();
  //         });
  //     })
  //     .onClose(() => {
  //       this.setState({ loaddings: false });
  //       message.warning(
  //         this.props.intl.formatMessage({ id: "CompleteVerification" })
  //       );
  //     });
  // };

  saveIpList = (e: string[]) => {
    // this.setState({ ipList: e }, () => {
    //   this.checkValue();
    // });
  };
  radio = (e: RadioChangeEvent) => {
    this.setState({ radioValue: e.target.value, ipList: [] }, () => {
      this.checkValue();
    });
  };
  checkValue = () => {
    // const { ipList, radioValue } = this.state;
  };
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: e.target.value });
  };
  saveIp = (e: string) => {
    const prevIplist = this.state.ipList;
    if (e !== "") {
      if (reg.test(e)) {
        this.setState(
          { errorStr: "", ipList: [...prevIplist, e], value: "" },
          () => {
            // const nextIplist = Array.from(new Set(this.state.ipList));
          }
        );
      } else {
        // message.error(messageError('41027'));
        this.setState({
          errorStr: this.props.intl.formatMessage({ id: "WrongAddress" }),
          value: "",
        });
      }
    }
  };
  removeIp = (index: number) => {
    const prevIplist = this.state.ipList;
    prevIplist.splice(index, 1);
    this.setState({ ipList: prevIplist }, () => {
      // const nextIplist = Array.from(new Set(this.state.ipList));
    });
  };
  render() {
    const onShowSizeChange = (current: number, size: number) => {
      this.setState(
        {
          pageSize: size,
          pageIndex: current - 1,
        },
        () => {
          this.getApiKeys();
        }
      );
    };
    const onChangePagination = (page: number, pageSize: number | undefined) => {
      this.setState(
        {
          pageSize: pageSize!,
          pageIndex: page - 1,
        },
        () => {
          this.getApiKeys();
        }
      );
    };
    const columns = [
      {
        title: this.props.intl.formatMessage({
          id: "Creation_Time",
          defaultMessage: "Creation_Time",
        }),
        dataIndex: "createdDate",
        width: 100,
        render: (item: number) => (
          <div className="register-time">
            {moment(item).format("YYYY/MM/DD HH:mm")}
          </div>
        ),
      },
      {
        title: this.props.intl.formatMessage({
          id: "Label",
          defaultMessage: "Label",
        }),
        width: 100,
        dataIndex: "label",
        render: (item: string) => (
          <div className="table-status">{item ? item : "--"}</div>
        ),
      },
      {
        title: this.props.intl.formatMessage({
          id: "API Key",
          defaultMessage: "API Key",
        }),
        width: 350,
        dataIndex: "cfAPIKey",
      },
      {
        title: (
          <div>
            {this.props.intl.formatMessage({
              id: "API_Secret",
              defaultMessage: "API Secret",
            })}{" "}
            <Tooltip
              placement="top"
              color="#ffffff"
              title={
                <div
                  style={{
                    color: "rgba(49, 139, 245, 0.5)",
                    maxWidth: "400px",
                    padding: "8px 8px 12px 8px",
                  }}
                >
                  {this.props.intl.formatMessage({
                    id: "API_Secret_details",
                    defaultMessage:
                      "For your security, your API Secret Key will only be displayed at the time it is created. If you lose this key, you will need to delete your API and set up a new one.",
                  })}
                </div>
              }
            >
              <img
                style={{ width: "10px", cursor: "pointer" }}
                src={imgList.tioop}
                alt="tioop"
              />
            </Tooltip>
          </div>
        ),
        width: 100,
        dataIndex: "cfAPISecret",
        render: (item: string) => <div className="table-status">********</div>,
      },
      {
        title: this.props.intl.formatMessage({
          id: "Withdraw",
          defaultMessage: "Withdraw",
        }),
        width: 80,
        dataIndex: "canWithdraw",
        render: (item: string) => (
          <div className="table-status">
            {item ? (
              <img src={imgList.active} alt="active" />
            ) : (
              <img src={imgList.error} alt="error" />
            )}
          </div>
        ),
      },
      {
        title: this.props.intl.formatMessage({
          id: "Trade",
          defaultMessage: "Trade",
        }),
        width: 50,
        dataIndex: "canTrade",
        render: (item: string) => (
          <div className="table-status">
            {item ? (
              <img src={imgList.active} alt="active" />
            ) : (
              <img src={imgList.error} alt="error" />
            )}
          </div>
        ),
      },
      {
        title: this.props.intl.formatMessage({
          id: "User",
          defaultMessage: "User",
        }),
        width: 300,
        dataIndex: "accountName",
        render: (item: any) => (
          <div className="table-status" style={{ marginRight: "50px" }}>
            {item.length > 0 ? item[0] : "--"}
          </div>
        ),
      },
      {
        title: this.props.intl.formatMessage({
          id: "Linked_IP_Address",
          defaultMessage: "Linked IP Address",
        }),
        dataIndex: "allowedIps",
        width: 150,
        render: (item: any) => {
          return item && item.length > 0 ? (
            <Tooltip
              placement="top"
              getPopupContainer={(triggerNode) => triggerNode}
              className="address-tooltip"
              color="#ffffff"
              title={
                item &&
                item.map((res: any, index: any) => (
                  <div
                    key={index}
                    style={{
                      color: "#318BF5",
                      padding: "2px 8px 2px 8px",
                      borderBottom:
                        item.length - 1 === index
                          ? ""
                          : "2px solid rgba(37,37,71,0.5)",
                    }}
                  >
                    {res}
                  </div>
                ))
              }
            >
              <div
                className="table-status"
                style={{
                  cursor: "pointer",
                  color: "#318BF5",
                  textDecorationLine: "underline",
                  fontSize: "16px",
                }}
              >
                {item && item.length > 0 ? item[0] : "--"}
              </div>
            </Tooltip>
          ) : (
            <div className="table-status" style={{ cursor: "pointer" }}>
              {item && item.length > 0 ? item[0] : "--"}
            </div>
          );
        },
      },
      {
        title: this.props.intl.formatMessage({
          id: "Actions",
          defaultMessage: "Actions",
        }),
        dataIndex: "Actions",
        className: "actionName",
        width: 100,
        fixed: "right",
        render: (item: any, row: any) => (
          <div className="table-action" style={{ display: "flex" }}>
            <span
              onClick={() => {
                this.setState({
                  changeVisible: true,
                  changeParams: {
                    cfAPIId: row.cfAPIId,
                    canTrade: row.canTrade,
                    canWithdraw: row.canWithdraw,
                    label: row.label,
                    allowedIps: row.allowedIps,
                    ipIsRestricted: row.ipIsRestricted,
                  },
                });
              }}
              className="tab-permissions"
            >
              {this.props.intl.formatMessage({
                id: "Edit",
                defaultMessage: "Edit",
              })}
            </span>
            <div className="permissions-del-btn">
              {/* <img
                onClick={() => {
                  this.delApiKey(row.cfAPIId);
                }}
                src={imgList.del}
                alt="del"
              /> */}
              <span
                onClick={() => {
                  this.delApiKey(row.cfAPIId);
                }}
                className="tab-permissions"
              >
                {this.props.intl.formatMessage({
                  id: "Delete",
                  defaultMessage: "Delete",
                })}
              </span>
            </div>
          </div>
        ),
      },
    ];
    const { canWithdraw } = this.state;
    return (
      <Loadding show={this.state.loaddings ? 1 : 0}>
        <div className="apiManagement">
          <h2 className="api-title">API Management</h2>
          <Space direction="vertical" size={20}>
            <div className="api-content">
              <div className="apiManagement-title">
                <span className="create-apikey">
                  {this.props.intl.formatMessage({
                    id: "Create_API_Key",
                    defaultMessage: "Create API Key",
                  })}
                </span>
                <Divider className="divider"></Divider>
              </div>
              <div className="sub-account">
                <Row>
                  <Col span={16}>
                    <div className="sub-account-left">
                      <div className="sub-title">
                        {this.props.intl.formatMessage({
                          id: "User",
                          defaultMessage: "User",
                        })}
                      </div>
                      <Select
                        className="select"
                        showSearch
                        value={this.state.optinValue}
                        getPopupContainer={(triggerNode) => triggerNode}
                        onChange={(e) => {
                          this.setState({
                            optionName: this.state.accounts.filter(
                              (item: any) => item.accountId === e
                            )[0]["accountName"],
                            optinValue: e,
                          });
                        }}
                        filterOption={(input, option: any) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {this.state.accounts.map(
                          (item: {
                            accountId: string;
                            accountName: string;
                          }) => (
                            <Option value={item.accountId} key={item.accountId}>
                              {item.accountName}
                            </Option>
                          )
                        )}
                      </Select>
                      <div className="sub-title" style={{ marginTop: "12px" }}>
                        {this.props.intl.formatMessage({
                          id: "Label",
                          defaultMessage: "Label",
                        })}
                      </div>
                      <Input
                        className="label-input"
                        value={this.state.label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          this.setState({
                            label: e.target.value,
                          });
                        }}
                        placeholder={this.props.intl.formatMessage({
                          id: "Please_Enter",
                        })}
                      />
                      <div className="edit-api-modal-permissions">
                        <span>
                          {this.props.intl.formatMessage({
                            id: "Permission",
                            defaultMessage: "Permission",
                          })}
                          :
                        </span>
                        <Checkbox
                          onChange={() => {
                            this.setState({
                              switchCanTrade: !this.state.switchCanTrade,
                            });
                          }}
                        >
                          <span style={{ color: "#E5DFF5", fontSize: "14px" }}>
                            {this.props.intl.formatMessage({
                              id: "Can_Trade",
                              defaultMessage: "Can Trade",
                            })}
                          </span>
                        </Checkbox>
                        <Checkbox
                          onChange={(e) =>
                            this.setState({ canWithdraw: e.target.checked })
                          }
                          checked={canWithdraw}
                        >
                          <span style={{ color: "#E5DFF5", fontSize: "14px" }}>
                            {this.props.intl.formatMessage({
                              id: "Can_Withdraw",
                              defaultMessage: "Can Withdraw",
                            })}
                          </span>
                        </Checkbox>
                      </div>
                      <div className="edit-api-modal-restrictio">
                        <p>
                          {this.props.intl.formatMessage({
                            id: "IP_access_restrictions",
                            defaultMessage: "IP access restrictions",
                          })}
                        </p>
                        <Radio.Group
                          defaultValue={this.state.radioValue}
                          value={this.state.radioValue}
                          onChange={this.radio}
                        >
                          <Radio value={1}>
                            <span>
                              {this.props.intl.formatMessage({
                                id: "Unrestricted",
                                defaultMessage: "Unrestricted (Less Secure)",
                              })}
                            </span>{" "}
                            <span style={{ color: "rgba(255, 190, 0, 1)" }}>
                              {this.props.intl.formatMessage({
                                id: "Unrestricted_Describe",
                                defaultMessage:
                                  "This API key allows access from any IP address. This is not recommended.",
                              })}
                            </span>
                          </Radio>
                          <Radio value={2}>
                            {this.props.intl.formatMessage({
                              id: "Restrict_access",
                              defaultMessage:
                                "Restrict access to trusted IPs only (Recommended)",
                            })}
                          </Radio>
                        </Radio.Group>
                      </div>
                      {this.state.radioValue === 2 ? (
                        <div>
                          <div className="input-ip-list-title">
                            Enter trusted IP Addresses here. Tip: Hit enter to
                            confirm IP Addresses. You can select and delete IP
                            addresses as well.
                          </div>
                          <div className={`input-ip-list`}>
                            <div className="input-ip-list-seach">
                              <Search
                                enterButton={this.props.intl.formatMessage({
                                  id: "Confirm",
                                })}
                                onChange={this.onChange}
                                value={this.state.value}
                                size="middle"
                                onSearch={this.saveIp}
                              />
                              <div className="error">{this.state.errorStr}</div>
                            </div>

                            <div className="input-ip-list-saveed">
                              {this.state.ipList.map((item, index) => (
                                <div
                                  className="input-ip-list-saved-item animate__zoomOut"
                                  key={index}
                                >
                                  <span> {item}</span>
                                  <CloseOutlined
                                    onClick={this.removeIp.bind(this, index)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div
                        className="subaccout-addsub"
                        onClick={() => {
                          this.onCreateApi();
                        }}
                      >
                        {/* <img alt="addAccout" src={imgList.add} /> */}
                        {this.state.loaddings ? (
                          <Spin indicator={antIcon}></Spin>
                        ) : null}
                        <span className="anticon-user-add">
                          {this.props.intl.formatMessage({
                            id: "Create_API_Key",
                            defaultMessage: "Create API Key",
                          })}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col span={8} className="sub-account-right-col">
                    <div className="sub-account-right">
                      <div className="title">
                        {this.props.intl.formatMessage({
                          id: "Notes",
                          defaultMessage: "Notes",
                        })}
                      </div>
                      <p>
                        Open Exchange provides users with a powerful and
                        flexible API. For further information, please visit{" "}
                        <a
                          href="http://docs.opnx.com/"
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          style={{ color: "#318BF5" }}
                        >
                          http://docs.opnx.com/
                        </a>
                      </p>
                      <p>
                        There are two permission levels for API Keys: Read-only
                        and Trade-enabled. To prevent asset loss, refrain from
                        sharing your API Key and Secret with others.
                      </p>
                      {/* <p>please do not disclose your API Key to anybody.</p> */}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
            <div className="apiManagement-bottom">
              <div className="apiManagement-title">
                <span className="create-apikey">
                  {this.props.intl.formatMessage({
                    id: "My_API_Key",
                    defaultMessage: "My API Key",
                  })}
                </span>
                <Divider className="divider"></Divider>
              </div>
              <div className="sub-account-tab">
                <div className="table-content">
                  <Table
                    // @ts-ignore
                    columns={columns}
                    dataSource={this.state.datas}
                    rowKey={(i) => i._id}
                    scroll={{ x: 1400 }}
                    pagination={{
                      pageSizeOptions: ["10", "20", "30"],
                      defaultPageSize: 10,
                      onShowSizeChange,
                      showSizeChanger: true,
                      current: this.state.pageIndex + 1,
                      total: this.state.total,
                      onChange: onChangePagination,
                    }}
                    locale={{
                      emptyText: (
                        <div className="empty-table">
                          <img src={imgList.empty} alt="empty-table" />
                          <span style={{ marginTop: "12px" }}>
                            {this.props.intl.formatMessage({
                              id: "No_My_API_Key",
                              defaultMessage: "No My API Key",
                            })}
                          </span>
                        </div>
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </Space>
          <CreateApiKeyModal
            subAccount={this.state.optionName}
            visible={this.state.visible}
            onCloseModal={this.onCloseModal}
            cfAPIKey={this.state.cfAPIKey}
            cfAPISecret={this.state.cfAPISecret}
            permissionStr={this.state.permissionStr}
            accountId={this.state.optinValue}
          />
          {/* <ChangePermissionModal
            visible={this.state.changeVisible}
            {...this.state.changeParams}
            onCloseModal={() => {
              this.setState({
                changeVisible: false,
              });
              this.getApiKeys();
            }}
          /> */}

          {this.state.changeVisible ? (
            <EditApiModal
              visible={this.state.changeVisible}
              closeEditWhiteModalHandler={() => {
                this.setState({
                  changeVisible: false,
                });
                this.getApiKeys();
              }}
              {...this.state.changeParams}
            />
          ) : null}

          {this.state.isTfaValidation ? (
            <TfaValidation
              visable={this.state.isTfaValidation}
              onCloseModel={(e) => {
                this.setState({
                  isTfaValidation: e,
                });
              }}
              modalType="ADD_API_KEY"
              callBack={(e, p, v) => {
                this.setState({ loaddings: true });
                onRecaptchaVerify(
                  "",
                  "CREATE_API",
                  (token, action) => {
                    this.onCreateApiKey(e, p, v, token, action);
                  },
                  () => this.setState({ loaddings: false })
                );
              }}
            />
          ) : null}
        </div>
      </Loadding>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ApiManagement));

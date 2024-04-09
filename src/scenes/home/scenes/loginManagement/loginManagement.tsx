import React from "react";
import { Table, message } from "antd";
import { connect } from "react-redux";
import { imgList } from "./data";
// import { Loadding } from "components/loadding";
import expandedRowRenders from "./components/expandedRowRenders";
import { Model } from "./components/model";
import { AllLogin, deleteLoginAccount } from "service/http/http";
import { setAllLogin } from "store/actions/publicAction";
import moment from "moment";
import messageError from "utils/errorCode";
import { status } from "scenes/home/scenes/subaccout/data";
import { tfaType } from "../dashboard/components/dashboardBottom/data";
import "./loginManagement.scss";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from "react-intl";
import { messageSuccess } from "utils";
// import isAddress from "utils/isAddress";
import history from "router/history";
// import Guard from "../../router/guard";

interface ILoginManagementState {
  UnFreeze: boolean;
  Freeze: boolean;
  Unbind: boolean;
  modelComponent: JSX.Element | undefined;
  current: number;
  pageSize: number;
  total: number;
  recordList: IAllLoginAccount | {};
  tfa: boolean;
  tfaCode: string;
  columns: any;
}
type ILoginManagementPropsState = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
export class LoginManagement extends React.PureComponent<
  ILoginManagementPropsState & WrappedComponentProps,
  ILoginManagementState
> {
  constructor(props: ILoginManagementPropsState & WrappedComponentProps) {
    super(props);
    this.state = {
      UnFreeze: false,
      Freeze: false,
      Unbind: false,
      modelComponent: undefined,
      current: 1,
      pageSize: 10,
      total: 0,
      recordList: [],
      tfa: false,
      tfaCode: "",
      columns: [
        {
          title: <FormattedMessage id="User Name" defaultMessage="User Name" />,
          className: "accoutName",
          dataIndex: "userName",
          key: "userName",
          width: 170,
          // render: (item: any) => (
          //   <div className="table-accout">{item.userName}</div>
          // ),
        },
        {
          title: <FormattedMessage id="Status" defaultMessage="Status" />,
          dataIndex: "Status",
          className: "accoutName",
          width: 150,
          key: "Status",
          render: (_item: any, _record: any) => (
            <div className="table-status">
              <span
                style={{
                  background:
                    _record.loginUserStatus === "ACTIVE"
                      ? "#51FEFB"
                      : "#F93434",
                }}
              ></span>
              <span>
                {_record.loginUserStatus === "ACTIVE" ? (
                  <FormattedMessage id="Active" defaultMessage="Active" />
                ) : (
                  <FormattedMessage
                    id={status(_record.loginUserStatus)}
                    defaultMessage={status(_record.loginUserStatus)}
                  />
                )}
              </span>
            </div>
          ),
        },
        {
          title: <FormattedMessage id="Links" defaultMessage="Links" />,
          dataIndex: "Bind",
          className: "accoutName",
          key: "Bind",
          width: 150,
          render: (_item: any, _record: any) => (
            <div className="table-accout">{_record.accounts.length}</div>
          ),
        },
        {
          title: <FormattedMessage id="2FA" defaultMessage="2FA" />,
          dataIndex: "TFA",
          className: "accoutName",
          key: "TFA",
          width: 150,
          render: (_item: any, _record: any) => (
            <div className="table-status">
              {_record.enableTfa
                ? this.props.intl.formatMessage({
                    id: (tfaType(_record.tfaType) + "").replace(/\s+/g, ""),
                  })
                : "N/A"}
            </div>
          ),
        },
        {
          title: (
            <FormattedMessage
              id="Creation_Time"
              defaultMessage="Creation Time"
            />
          ),
          dataIndex: "createdDate",
          className: "accoutName",
          ellipsis: true,
          key: "createdDate",
          width: 250,
          render: (_item: any) => (
            <div className="table-action">
              {moment(_item).format("YYYY-MM-DD HH:mm")}
            </div>
          ),
        },
        {
          title: <FormattedMessage id="Actions" defaultMessage="Actions" />,
          dataIndex: "CreationTime",
          key: "CreationTime",
          className: "actionName accoutName",
          ellipsis: true,
          render: (_item: any, _record: any, index: number) => (
            <>
              <span
                className="actionName-span1"
                onClick={this.bindSubAaccount.bind(this, _record)}
                style={{ cursor: "pointer" }}
              >
                <FormattedMessage
                  id="Link_subaccount"
                  defaultMessage="Link subaccount"
                />
              </span>
              <span
                className="actionName-span2"
                style={{ cursor: "pointer" }}
                onClick={this.showModel.bind(
                  this,
                  _record.loginUserStatus === "ACTIVE" ? "Freeze" : "UnFreeze",
                  _record
                )}
              >
                {_record.loginUserStatus === "ACTIVE" ? (
                  <FormattedMessage id="Freeze" defaultMessage="Freeze" />
                ) : (
                  <FormattedMessage id="UnFreeze" defaultMessage="UnFreeze" />
                )}
              </span>
              <span
                className="actionName-span3"
                style={{ cursor: "pointer" }}
                onClick={this.resetModel.bind(this, _record)}
              >
                <FormattedMessage
                  id="Reset_Password"
                  defaultMessage="Reset Password"
                />
              </span>
              {_record.loginUserStatus !== "ACTIVE" ? (
                <div
                  className="loginManagement-delete"
                  onClick={this.deleteAccount.bind(this, _record)}
                >
                  <img
                    src={imgList.trashCan}
                    className="actionName-img"
                    style={{ cursor: "pointer" }}
                    alt="delete"
                  />
                </div>
              ) : null}
            </>
          ),
        },
      ],
    };
  }
  componentDidMount() {
    const { dashboardUserData } = this.props;
    if (
      dashboardUserData &&
      dashboardUserData.accountSource === "METAMASK" &&
      !dashboardUserData.bindEmail
    ) {
      history.push("/home");
    } else {
      this.getAllLoginAcount(this.state.current, this.state.pageSize);
    }
  }
  getAllLoginAcount = (current: number, pageSize: number) => {
    // const { current, pageSize } = this.state;
    AllLogin(current, pageSize).then((res) => {
      if (res && res.code === "0000") {
        if (res.data && res.data.data) {
          this.props.setAllLogin(res.data.data);
        }
        this.setState({ total: res.data.total });
      } else {
        message.error(res.message);
      }
    });
  };
  modelHandle = (off: boolean, type: "Freeze" | "UnFreeze" | "Unbind") => {
    switch (type) {
      case "Freeze":
        this.setState({ Freeze: off });
        break;
      case "UnFreeze":
        this.setState({ UnFreeze: off });
        break;
      case "Unbind":
        this.setState({ Unbind: off });
        break;
      default:
        break;
    }
  };
  showModel = (
    type: "Freeze" | "UnFreeze" | "Unbind",
    _record: any,
    e: any
  ) => {
    e && e.stopPropagation();
    this.setState({ recordList: _record });
    switch (type) {
      case "Freeze":
        this.setState({ Freeze: true });
        break;
      case "UnFreeze":
        this.setState({ UnFreeze: true });
        break;
      case "Unbind":
        this.setState({ Unbind: true });
        break;
      default:
        break;
    }
  };
  allModel = (type: string, _record?: any, e?: any) => {
    switch (type) {
      case "permission":
        this.setState({
          modelComponent: (
            <Model.Permission
              cancleHandler={this.clearModel}
              hanlderProps={this.getAllLoginAcount}
              current={this.state.current}
              pageSize={this.state.pageSize}
              propsContext={_record}
              dashboardUserData={this.props.dashboardUserData}
              intl={this.props.intl}
            />
          ),
        });
        break;
      case "resetPassword":
        this.setState({
          modelComponent: (
            <Model.ResetPassword
              cancleHandler={this.clearModel}
              AccountProps={_record}
              users={this.props.users}
              intl={this.props.intl}
            />
          ),
        });
        break;
      case "bindSubAaccount":
        this.setState({
          modelComponent: (
            <Model.BindSubAaccount
              cancleHandler={this.clearModel}
              AccountProps={_record}
              hanlderProps={this.getAllLoginAcount}
              current={this.state.current}
              pageSize={this.state.pageSize}
              dashboardUserData={this.props.dashboardUserData}
              intl={this.props.intl}
            />
          ),
        });
        break;
      case "createLogin":
        this.setState({
          modelComponent: (
            <Model.CreateLogin
              cancleHandler={this.clearModel}
              hanlderProps={this.getAllLoginAcount}
              current={this.state.current}
              pageSize={this.state.pageSize}
              intl={this.props.intl}
              dashboardUserData={this.props.dashboardUserData}
            />
          ),
        });
    }
  };
  resetModel = (
    _record: any,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    e.stopPropagation();
    this.allModel("resetPassword", _record);
  };

  deleteAccount = (
    _record: any,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    e.stopPropagation();
    deleteLoginAccount(_record.loginId).then((res: any) => {
      if (res && res.code === "0000") {
        message.success(messageSuccess("40003"));
        if (this.props.allLoginAccount.length === 1 && this.state.current > 1) {
          //   // 处理分页只有一条数据，删除之后变为空数组
          const current = this.state.current;
          this.setState({ current: current - 1 });
          this.getAllLoginAcount(current - 1, this.state.pageSize);
        } else {
          this.getAllLoginAcount(this.state.current, this.state.pageSize);
        }
      } else {
        message.error(res.message);
      }
    });
  };
  bindSubAaccount = (
    _record: any,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    e.stopPropagation();
    this.allModel("bindSubAaccount", _record);
  };
  createLogin = (e: any) => {
    e.stopPropagation();
    this.allModel("createLogin");
  };
  clearModel = () => {
    this.setState({ modelComponent: undefined });
  };
  onChangePagi = (page: any, pageSize: any) => {
    this.setState({
      current: page,
    });
    this.getAllLoginAcount(page, this.state.pageSize);
  };
  onChangePageSize = (page: any, pageSize: any) => {
    const lastPageSize = pageSize;
    if (lastPageSize * this.state.current > this.state.total) {
      this.getAllLoginAcount(1, lastPageSize);
    } else {
      this.getAllLoginAcount(this.state.current, lastPageSize);
    }
    this.setState({
      pageSize: lastPageSize,
      current: 1,
    });
  };
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    const {
      UnFreeze,
      Freeze,
      Unbind,
      modelComponent,
      current,
      pageSize,
      recordList,
      columns,
    } = this.state;
    const { allLoginAccount } = this.props;
    return (
      <div className="loginManagement">
        <div className="loginManagement-top">
          <div className="subaccout-title">
            <FormattedMessage
              id="Login_Management"
              defaultMessage="Login Management"
            />
          </div>
          <div className="subaccout-message">
            Generate additional login credentials to enable others to access
            your account with customizable permissions. A single login can
            manage multiple sub accounts with varying permissions.
          </div>
          <div className="subaccout-addsub" onClick={this.createLogin}>
            <img alt="addAccout" src={imgList.addUser} />
            <span className="anticon-user-add">
              <FormattedMessage id="Add_Login" defaultMessage="Add Login" />
            </span>
          </div>
        </div>
        <Table
          columns={columns}
          className="no-hovers"
          dataSource={allLoginAccount}
          scroll={{ x: true }}
          rowKey={(record) => record.loginId}
          expandable={{
            expandedRowRender: expandedRowRenders.bind(
              this,
              this.showModel,
              this.allModel,
              this.getAllLoginAcount,
              { current, pageSize }
            ),
            expandRowByClick: true,
            expandIconColumnIndex: 7,
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <img
                  style={{ width: "10px", height: "6px" }}
                  alt="up"
                  src={imgList.assetsTop}
                  onClick={(e) => onExpand(record, e)}
                />
              ) : (
                <img
                  style={{ width: "10px", height: "6px" }}
                  alt="down"
                  src={imgList.assetsBottom}
                  onClick={(e) => onExpand(record, e)}
                />
              ),
          }}
          pagination={{
            hideOnSinglePage: false,
            defaultCurrent: this.state.current,
            pageSizeOptions: ["10", "20", "30"],
            showSizeChanger: true,
            total: this.state.total,
            pageSize: this.state.pageSize,
            showQuickJumper: true,
            current: this.state.current,
            onChange: this.onChangePagi,
            onShowSizeChange: this.onChangePageSize,
          }}
          locale={{
            emptyText: (
              <div className="empty-table">
                <img src={imgList.empty} alt="empty-table" />
                <span style={{ marginTop: "12px" }}>
                  <FormattedMessage
                    id="No_Login_Management"
                    defaultMessage="No Login Management"
                  />
                </span>
              </div>
            ),
          }}
        />
        {Freeze || Unbind || UnFreeze ? (
          <Model.Freeze
            type={Freeze ? "Freeze" : Unbind ? "Unbind" : "UnFreeze"}
            isVisible={Freeze || Unbind || UnFreeze}
            modelHandleCancel={this.modelHandle}
            recordPropsList={recordList}
            hanlderProps={this.getAllLoginAcount}
            current={current}
            pageSize={pageSize}
          />
        ) : null}
        {modelComponent}
      </div>
    );
  }
}

const mapStateToProps = (state: IGlobalT) => ({
  allLoginAccount: state.allLoginAccount,
  dashboardUserData: state.dashboardUserData,
  users: state.users,
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
    setAllLogin(data: IAllLoginAccount[]) {
      dispatch(setAllLogin(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(LoginManagement));

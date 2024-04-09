import React, { Component } from "react";
import { connect } from "react-redux";
import { Table, message } from "antd";
import { ReactComponent as Right } from "assets/image/pagination-right.svg";
import history from "router/history";
import { TotalApi, GetSubAccount, SwitchAccout } from "service/http/http";
import messageError from "utils/errorCode";
import { imgList } from "scenes/home/scenes/loginManagement/data";
import { setUser } from "store/actions/publicAction";
import { TooltipGlobal } from "components/TooltipGlobal/Tooltip";
import { tradingType } from "./data";
import Active from "assets/image/dashboardSunAccount1.svg";
import NoActive from "assets/image/dashboardSubAccount2.png";
import Disable from "assets/image/dashboardSubAccountDisblae.svg";
import "./dashboardBottom.scss";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from "react-intl";
import ProgressComponent from "components/progressComponent/ProgressComponent";

type IDashboardBottomProps = ReturnType<typeof mapStateToProps>;
type IDashboardBottomDispatchProps = ReturnType<typeof mapDispatchToProps>;
type IDashboardBottomState = {
  total: number;
  current: number;
  pageSize: number;
  tableTotal: number;
  userAccount: IUserDataAccount[];
  TwoFa: boolean;
  identityVerification: boolean;
};
type IDashboardBottomFatherProps = {
  userData: IDashboardUserData;
  hanlderWarning: (e: boolean) => void;
};
export class DashboardBottom extends Component<
  IDashboardBottomProps &
    IDashboardBottomFatherProps &
    IDashboardBottomDispatchProps &
    WrappedComponentProps,
  IDashboardBottomState
> {
  constructor(
    props: IDashboardBottomProps &
      IDashboardBottomFatherProps &
      IDashboardBottomDispatchProps &
      WrappedComponentProps
  ) {
    super(props);
    this.state = {
      total: 0,
      current: 1,
      pageSize: 5,
      tableTotal: 0,
      userAccount: [],
      TwoFa: false,
      identityVerification: false,
    };
  }
  componentDidMount() {
    TotalApi().then((res) => {
      if (res.code === "0000") {
        this.setState({ total: res.data });
      } else {
        message.error(res.message);
      }
    });
    this.getAccount(this.state.current, this.state.pageSize);
  }
  getAccount = (pageNum: number, pageSize: number) => {
    GetSubAccount(pageNum, pageSize).then((res) => {
      if (res.code === "0000") {
        this.setState({
          tableTotal: res.data.total,
          userAccount: res.data.data,
        });
      } else {
        message.error(res.message);
      }
    });
  };
  onChangePagi = (page: any, pageSize: any) => {
    this.setState({
      current: page,
    });
    this.getAccount(page, this.state.pageSize);
  };
  switchAccount = (_record: any) => {
    // if为什么这样写呢？？？搞不懂
    if (
      // _record.accountStatus === "ACTIVE" &&
      _record.accountStatus !== "LOCKED" &&
      _record.accountStatus !== "FREEZE" &&
      _record.accountName !== this.props.users.accountName
    ) {
      SwitchAccout(_record._key).then((res) => {
        if (res.success) {
          message.success(messageError("40007"));
          // const data: Iusers = {
          //   email: res.data.email,
          //   token: res.data.token,
          //   accountName: res.data.accountName,
          //   mainLogin: res.data.mainLogin,
          //   loginId: res.data.loginId,
          // };
          this.props.setUser(res.data);
          window.location.reload();
        } else {
          message.error(res.message);
        }
      });
    }
  };
  render() {
    const columns = [
      {
        title: "",
        dataIndex: "accountName",
        key: "accountName",
        // width: "15%",
        render: (_item: any, _record: any) => {
          return (
            <div onClick={this.switchAccount.bind(this, _record)}>
              <span
                style={{
                  marginRight: "10px",
                }}
              >
                <TooltipGlobal
                  title={
                    _record.isMainAccount
                      ? this.props.intl.formatMessage({ id: "Main_Account" })
                      : _item
                  }
                >
                  {_record.isMainAccount
                    ? this.props.intl.formatMessage({ id: "Main_Account" })
                    : _item}
                </TooltipGlobal>
              </span>
              {/* <span
                style={{
                  color:
                    this.props.users.accountName === _item
                      ? "#e5dff5"
                      : _record.accountStatus !== "ACTIVE"
                      ? "#999999"
                      : "",
                  display: "flex-inline",
                  height: "20px",
                  padding: "4px",
                  borderRadius: "2px",
                }}
                onClick={this.switchAccount.bind(this, _record)}
              >
                {tradingType(_record.tradingType)}
              </span> */}
            </div>
          );
        },
      },
      // {
      //   title: "",
      //   dataIndex: "tradingType",
      //   key: "tradingType",
      //   align: "center",
      //   width: "15%",
      //   className: "dashboardBottom-left-top-conten-type",
      //   render: (_item: any, _record: any) => {
      //     return (

      //     );
      //   },
      // },
      {
        title: "",
        align: "right",
        className: "dashboardBottom-left-top-conten-type",
        // width: "70%",
        render: (_item: any, _record: any) => {
          return (
            <img
              onClick={this.switchAccount.bind(this, _record)}
              src={
                this.props.users.accountName === _record.accountName
                  ? Active
                  : _record.accountStatus === "FREEZE" ||
                    _record.accountStatus === "LOCKED"
                  ? Disable
                  : NoActive
              }
              alt="Open Exchange"
            />
          );
        },
      },
    ] as any;

    const { total, current, pageSize, tableTotal, userAccount } = this.state;
    const { users, dashboardUserData } = this.props;
    return (
      <div className="dashboardBottom">
        <div className="dashboardBottom-left">
          <div className="dashboardBottom-right-content-api">
            <span>API {total}</span>
            {users.mainLogin ? (
              <span
                className="dashboardBottom-right-content-api-btn"
                onClick={() => {
                  history.push("/home/apiManagement");
                }}
              >
                <FormattedMessage id="Manage" />
              </span>
            ) : null}
          </div>
          <div
            style={{
              height: "12px",
              width: "100%",
              background: "black",
            }}
          ></div>
          <div
            className="dashboardBottom-left-top-content"
            onClick={() => {
              if (users.mainLogin && !dashboardUserData.copperAccount) {
                history.push("/home/subAccount");
              }
            }}
          >
            <span>Sub Accounts</span>
            {users.mainLogin ? <Right /> : null}
          </div>
          <Table
            columns={columns}
            dataSource={userAccount}
            rowKey={(record) => record._id}
            pagination={{
              hideOnSinglePage: false,
              defaultCurrent: 1,
              pageSizeOptions: ["10", "20", "30"],
              showSizeChanger: false,
              total: tableTotal,
              pageSize,
              showQuickJumper: true,
              current,
              position: ["bottomCenter"],
              onChange: this.onChangePagi,
            }}
            locale={{
              emptyText: (
                <div className="empty-table">
                  <img src={imgList.empty} alt="empty-table" />
                  <span style={{ marginTop: "12px" }}>
                    <FormattedMessage id="table_empty" />
                  </span>
                </div>
              ),
            }}
          />
        </div>
        <div className="dashboardBottom-progress">
          {this.props.dashboardUserData?.tradingFeeLevel?.vipType &&
          this.props.dashboardUserData?.tradingFeeLevel?.specialVipLevel !==
            null ? (
            <ProgressComponent type={"specialVipLevel"} />
          ) : (
            <ProgressComponent type={"dashboard"} />
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: IGlobalT) => ({
  users: state.users,
  dashboardUserData: state.dashboardUserData,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    setUser(data: Iusers) {
      dispatch(setUser(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DashboardBottom));

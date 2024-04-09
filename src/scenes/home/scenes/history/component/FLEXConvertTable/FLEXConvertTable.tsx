import React, { Component } from "react";
import { connect } from "react-redux";
import empty from "assets/image/empty-table.png";
import "./FLEXConvertTable.scss";
import { Table, message } from "antd";
import { getConvertFlexHistory } from "service/http/http";
import { Loadding } from "components/loadding";
import moment from "moment";
import { switchValue } from "../exportHistory/data";
import { messageError } from "utils/errorCode";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage
} from "react-intl";
import prev from "../../../../../../assets/image/pagination-left.svg";
import next from "../../../../../../assets/image/pagination-right.svg";
import _ from "lodash";
const space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

interface IState {
  loadding: number;
  datas: any;
  total: number;
  pageIndex: number;
  pageSize: number;
  index: number | undefined;
  date: any;
  status: string[];
  instruments: string[];
  coinOptions: [];
}
type IFLEXConvertTablePropsState = ReturnType<typeof mapStateToProps>;
type IFLEXConvertTableDispatchState = ReturnType<typeof mapDispatchToProps> &
  IFLEXConvertTablePropsState &
  WrappedComponentProps;

class FLEXConvertTable extends Component<
  IFLEXConvertTableDispatchState,
  IState
> {
  constructor(props: IFLEXConvertTableDispatchState) {
    super(props);
    this.state = {
      loadding: 0,
      datas: [],
      total: 0,
      pageIndex: 0,
      pageSize: 10,
      index: undefined,
      date: switchValue("1w"),
      status: [],
      instruments: [],
      coinOptions: []
    };
  }
  unFold = (index: number) => {
    this.state.index === index
      ? this.setState({ index: undefined })
      : this.setState({ index });
  };
  getConvertFlexHistory = () => {
    this.setState({
      loadding: 1
    });
    getConvertFlexHistory({
      pageNum: this.state.pageIndex + 1,
      pageSize: this.state.pageSize
    }).then((res) => {
      this.setState({
        loadding: 0
      });
      if (res.code === "0000") {
        this.setState({
          datas: res.data.data,
          total: res.data.total
        });
      } else {
        message.warning(res.message);
      }
    });
  };
  componentDidMount() {
    if (this.props.users.mainLogin) {
      this.getConvertFlexHistory();
    }
  }
  itemRender = (
    current: number,
    type: string,
    originalElement: React.ReactNode
  ) => {
    if (type === "prev") {
      return <img alt="prev" src={prev} />;
    }
    if (type === "next") {
      return <img alt="next" src={next} />;
    }
    return originalElement;
  };
  render() {
    const columns = [
      {
        title: <FormattedMessage id="Date" />,
        dataIndex: "date",
        key: "date",
        render: (_item: any) => (
          <div>
            {moment
              .parseZone(Number(_item))
              .local()
              .format("YYYY-MM-DD HH:mm:ss")}
          </div>
        )
      },
      {
        title: <FormattedMessage id="Coin" />,
        dataIndex: "instrument",
        key: "instrument"
      },
      {
        title: <FormattedMessage id="Amount" />,
        dataIndex: "convertQty",
        key: "convertQty"
      },
      {
        title: "History fee (OX)",
        key: "fee",
        dataIndex: "fee"
      },
      {
        title: <FormattedMessage id="Converted OX" />,
        key: "convertFlex",
        dataIndex: "convertFlex"
      }
    ];
    const onShowSizeChange = (current: number, size: number) => {
      this.setState(
        {
          pageSize: size,
          pageIndex: current - 1
        },
        () => {
          this.getConvertFlexHistory();
        }
      );
    };
    const onChangePagination = (page: number, pageSize: number | undefined) => {
      this.setState(
        {
          pageSize: pageSize!,
          pageIndex: page - 1
        },
        () => {
          this.getConvertFlexHistory();
        }
      );
    };
    const { intl } = this.props;
    return (
      <div className="withdraw-table">
        <Loadding show={this.state.loadding}>
          <Table
            columns={columns}
            dataSource={this.state.datas}
            rowKey={(recond: any) => recond.date}
            scroll={{ x: true }}
            pagination={{
              pageSizeOptions: ["10", "20", "30"],
              defaultPageSize: 10,
              onShowSizeChange,
              showSizeChanger: true,
              hideOnSinglePage: true,
              current: this.state.pageIndex + 1,
              total: this.state.total,
              onChange: onChangePagination,
              size: "small",
              itemRender: this.itemRender
            }}
            locale={{
              emptyText: (
                <div className="empty-table">
                  <img src={empty} alt="empty-table" />
                  <span style={{ marginTop: "12px" }}>
                    {intl.formatMessage({ id: "No_Data" })}
                  </span>
                </div>
              )
            }}
          />
        </Loadding>
      </div>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => {
  return { dashboardUserData: state.dashboardUserData, users: state.users };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FLEXConvertTable));

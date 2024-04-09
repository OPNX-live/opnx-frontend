import React, { Component } from "react";
import { connect } from "react-redux";
import empty from "assets/image/empty-table.png";
import "./borrowLiquidation.scss";
import { Table, message, Select } from "antd";
import { getBorrowLiquidation } from "service/http/http";
import { Loadding } from "components/loadding";
import moment from "moment";
import { messageError } from "utils/errorCode";
import { guid } from "utils";
import prev from "../../../../../../assets/image/pagination-left.svg";
import next from "../../../../../../assets/image/pagination-right.svg";
import { toLocaleString } from "utils/toLocaleString";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage
} from "react-intl";

const { Option } = Select;

interface IState {
  loadding: number;
  datas: any;
  total: number;
  pageIndex: number;
  pageSize: number;
  searchValue: string;
}
interface IProps {
  initSearchValue: (e: string) => void;
  ammOptions: string[];
  searchValue: string;
}
type IWithdrawTablePropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
type IWithdrawTableDispatchState = ReturnType<typeof mapDispatchToProps> &
  IProps &
  IWithdrawTablePropsState;

class BorrowLiquidationTable extends Component<
  IWithdrawTableDispatchState,
  IState
> {
  constructor(props: IWithdrawTableDispatchState) {
    super(props);
    this.state = {
      loadding: 0,
      datas: [],
      total: 0,
      pageIndex: 0,
      pageSize: 10,
      searchValue: ""
    };
  }
  openHref = (url: string, e: any) => {
    e.stopPropagation();
    window.open(url);
  };
  getBorrowLiquidation = () => {
    this.setState({
      loadding: 1
    });

    getBorrowLiquidation({
      pageNum: this.state.pageIndex + 1,
      pageSize: this.state.pageSize,
      searchParams: this.state.searchValue
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
  async componentDidMount() {
    try {
      if (this.props.searchValue) {
        this.setState(
          {
            searchValue: this.props.searchValue
          },
          () => {
            this.getBorrowLiquidation();
          }
        );
      }
      if (!this.props.searchValue && this.props.ammOptions.length > 0) {
        this.setState(
          {
            searchValue: this.props.ammOptions[0]
          },
          () => {
            this.getBorrowLiquidation();
          }
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
  onChange = (e: any) => {
    const value: string = e;
    this.setState(
      {
        searchValue: value,
        pageIndex: 0
      },
      () => {
        this.getBorrowLiquidation();
      }
    );
    this.props.initSearchValue(e);
  };
  render() {
    const columns = [
      {
        title: <FormattedMessage id="Market" />,
        dataIndex: "marketName",
        key: "marketName",
        render: (item: any) => item
      },
      {
        title: <FormattedMessage id="Time" />,
        key: "time",
        dataIndex: "time",
        render: (item: any) => (
          <div className="table-status">
            {moment.parseZone(item).local().format("YYYY-MM-DD HH:mm:ss")}
          </div>
        )
      },
      {
        title: <FormattedMessage id="Side" />,
        dataIndex: "side",
        key: "side",
        render: (item: any) => (
          <FormattedMessage id={item} defaultMessage={item} />
        )
      },
      {
        title: <FormattedMessage id="Type" />,
        dataIndex: "type",
        key: "type",
        render: (item: any) => item
      },
      {
        title: <FormattedMessage id="Price" />,
        dataIndex: "price",
        key: "price",
        render: (item: any) =>
          item !== "0" ? toLocaleString(Number(item)) : "0"
      },
      {
        title: <FormattedMessage id="Quantity" />,
        dataIndex: "quantity",
        key: "quantity",
        render: (item: any) => item
      }
    ];

    const onShowSizeChange = (current: number, size: number) => {
      this.setState(
        {
          pageSize: size,
          pageIndex: current - 1
        },
        () => {
          this.getBorrowLiquidation();
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
          this.getBorrowLiquidation();
        }
      );
    };
    const { intl } = this.props;
    return (
      <Loadding show={this.state.loadding}>
        <div className="trade-table">
          <div className="trade-top">
            <div className="ammSearch">
              <Select
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                showSearch
                showArrow={false}
                maxTagCount={1}
                maxTagTextLength={10}
                style={{ width: "100%" }}
                getPopupContainer={(triggerNode) => triggerNode}
                placeholder={intl.formatMessage({
                  id: "searchAmm",
                  defaultMessage: "Search AMM"
                })}
                value={this.state.searchValue}
                onChange={this.onChange}
              >
                {this.props.ammOptions.map((res) => (
                  <Option key={res} value={res}>
                    {res}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={this.state.datas}
            rowClassName={(record, index) => "table-row"}
            scroll={{ x: true }}
            rowKey={(recond: any) => guid()}
            pagination={
              this.state.total > 10
                ? {
                    pageSizeOptions: ["10", "20", "30"],
                    defaultPageSize: 10,
                    onShowSizeChange,
                    showSizeChanger: true,
                    current: this.state.pageIndex + 1,
                    total: this.state.total,
                    onChange: onChangePagination,
                    size: "small",
                    itemRender: this.itemRender
                  }
                : false
            }
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
        </div>
      </Loadding>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BorrowLiquidationTable));

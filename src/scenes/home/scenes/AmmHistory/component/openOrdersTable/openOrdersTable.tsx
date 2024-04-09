import React, { Component } from "react";
import { connect } from "react-redux";
import empty from "assets/image/empty-table.png";
import "./openOrdersTable.scss";
import { Table, message, Select } from "antd";
import { getOpenOrdersHistories } from "service/http/http";
import { Loadding } from "components/loadding";
import moment from "moment";
import { messageError } from "utils/errorCode";
import { guid } from "utils";
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
  pageSize: number;
  searchValue: string;
}
interface IProps {
  initSearchValue: (e: string) => void;
  ammOptions: Array<string>;
  searchValue: string;
}
type IWithdrawTablePropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
type IWithdrawTableDispatchState = ReturnType<typeof mapDispatchToProps> &
  IProps &
  IWithdrawTablePropsState;

class OpenOrdersTable extends Component<IWithdrawTableDispatchState, IState> {
  constructor(props: IWithdrawTableDispatchState) {
    super(props);
    this.state = {
      loadding: 0,
      datas: [],
      pageSize: 10,
      searchValue: ""
    };
  }
  openHref = (url: string, e: any) => {
    e.stopPropagation();
    window.open(url);
  };
  getOpenOrdersHistories = () => {
    this.setState({
      loadding: 1
    });

    getOpenOrdersHistories(this.state.searchValue).then((res) => {
      this.setState({
        loadding: 0
      });
      if (res.code === "0000") {
        this.setState({
          datas: res.data
        });
      } else {
        message.warning(res.message);
      }
    });
  };
  async componentDidMount() {
    try {
      if (this.props.searchValue) {
        this.setState(
          {
            searchValue: this.props.searchValue
          },
          () => {
            this.getOpenOrdersHistories();
          }
        );
      }
      if (!this.props.searchValue && this.props.ammOptions.length > 0) {
        this.setState(
          {
            searchValue: this.props.ammOptions[0]
          },
          () => {
            this.getOpenOrdersHistories();
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
        searchValue: value
      },
      () => {
        this.getOpenOrdersHistories();
      }
    );
    this.props.initSearchValue(e);
  };
  render() {
    const columns = [
      {
        title: <FormattedMessage id="Date" />,
        key: "date",
        dataIndex: "date",
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
        title: <FormattedMessage id="Price" />,
        dataIndex: "price",
        key: "price",
        render: (item: any) => (item !== "0" ? toLocaleString(item) : "0")
      },
      {
        title: <FormattedMessage id="Quantity" />,
        dataIndex: "quantity",
        key: "quantity",
        render: (item: any) => item
      }
    ];

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
            pagination={false}
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
)(injectIntl(OpenOrdersTable));

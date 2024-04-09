import React, { Component } from "react";
import { connect } from "react-redux";
import { Select, DatePicker, Button, message, Table } from "antd";
import { ReactComponent as DateIMG } from "assets/image/date.svg";
import {
  getMarkets,
  fundingHistoryPage,
  getMarketDetail,
  getPermissionsRate,
  getSelectMarket,
  getFundingHistoryExcel,
} from "service/http/http";
import { messageError } from "utils";
import empty from "assets/image/empty-table.png";
import { FundingHistoryObject } from "./type";
import "./FundingHistory.scss";
import moment from "moment";
import { Loadding } from "components/loadding";
import { FormattedMessage } from "react-intl";
import history from "router/history";
import { GetRequest } from "scenes/verifyAccount/data";
import { debounce } from "lodash";
const { RangePicker } = DatePicker;
const { Option } = Select;
type FundingHistoryState = {
  marketsList: { name: string; value: string }[];
  value: any;
  pageNum: number;
  pageSize: number;
  total: number;
  data: FundingHistoryObject[];
  selectValue: string;
  loading: number;
  tabActive: string;
  permissionsList: { [key: string]: string }[];
};
export class FundingHistory extends Component<{}, FundingHistoryState> {
  columns = [
    {
      title: <FormattedMessage id="Time_UTC" />,
      dataIndex: "auctionTime",
      key: "auctionTime",
      render: (_item: string) => (
        // <span>12:00</span>
        <span>{moment(_item).format("YYYY/MM/DD HH:mm")}</span>
      ),
    },
    {
      title: <FormattedMessage id="Markets" />,
      dataIndex: "instrumentId",
      key: "instrumentId",
    },
    // {
    //   title: <FormattedMessage id="Net_Deliver" />,
    //   dataIndex: "netDelivery",
    //   key: "netDelivery"
    // },
    // {
    //   title: <FormattedMessage id="Auction_Price" />,
    //   dataIndex: "auctionPrice",
    //   key: "auctionPrice",
    //   render: (_item: number) => (
    //     <span>
    //       {_item === null
    //         ? "--"
    //         : _item
    //         ? (_item * 100).toFixed(4) + "%"
    //         : _item + "%"}
    //     </span>
    //   )
    // },
    {
      title: <FormattedMessage id="Funding_Rate" />,
      dataIndex: "fundingRate",
      key: "fundingRate",
      render: (_item: number) => (
        <span>
          {_item === null
            ? "--"
            : _item
            ? (_item * 100).toFixed(4) + "%"
            : _item + "%"}
        </span>
      ),
    },
    {
      title: <FormattedMessage id="Annualised_Funding_Rate" />,
      dataIndex: "address",
      key: "address",
      render: (_item: string, _record: FundingHistoryObject) => (
        // 1 是写死的
        <span>
          {_record.fundingRate
            ? (_record.fundingRate! * 365 * 24 * 100).toFixed(4)
            : _record.fundingRate}
          %
        </span>
      ),
    },
  ];
  columnsPermissions = [
    {
      title: <FormattedMessage id="Time_UTC" />,
      dataIndex: "time",
      key: "time",
      render: (_item: string) => (
        // <span>12:00</span>
        <span>{moment(_item).format("YYYY/MM/DD HH:mm")}</span>
      ),
    },
    {
      title: <FormattedMessage id="Markets" />,
      dataIndex: "marketCode",
      key: "marketCode",
    },
    {
      title: <FormattedMessage id="Funding_Rate" />,
      dataIndex: "fundingRate",
      key: "fundingRate",
      render: (_item: number) => (
        <span>
          {_item === null
            ? "--"
            : _item
            ? (_item * 100).toFixed(4) + "%"
            : _item + "%"}
        </span>
      ),
    },
    {
      title: <FormattedMessage id="Annualised_Funding_Rate" />,
      dataIndex: "address",
      key: "address",
      render: (_item: string, _record: FundingHistoryObject) => (
        // 1 是写死的
        <span>
          {_record.fundingRate
            ? (_record.fundingRate! * 365 * 24 * 100).toFixed(4)
            : _record.fundingRate}
          %
        </span>
      ),
    },
  ];
  constructor(props: {}) {
    super(props);
    this.state = {
      marketsList: [],
      value: [
        moment().subtract(1, "week").format("YYYY-MM-DD 00:00:00"),
        moment().format("YYYY-MM-DD 00:00:00"),
      ],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      data: [],
      selectValue: "All",
      loading: 1,
      tabActive: "AllMarkets",
      permissionsList: [],
    };
  }
  async componentDidMount() {
    const search = GetRequest() as { type: string };
    if (search) {
      this.setState({ tabActive: search.type });
    }
    const [market, permissionMarkets] = await Promise.all([
      getSelectMarket("FUTURE"),
      getMarketDetail(),
    ]);
    this.setState({
      permissionsList:
        permissionMarkets.data?.filter(
          (i: { [key: string]: string }) => Number(i.zone) === 1
        ) || [],
    });
    const arr = [];
    Object.keys(market?.data).forEach((i) => {
      arr.push({ name: i, value: market?.data[i] });
    });
    market.code === "0000" && this.setState({ marketsList: arr });
    market.code !== "0000" && message.error(messageError(market.code));
    this.getHistory();
    this.setState({ loading: 0 });
  }
  getHistory = async () => {
    this.setState({ loading: 1 });
    const {
      value,
      pageNum,
      pageSize,
      selectValue,
      tabActive,
      permissionsList,
    } = this.state;
    const startDate = moment(value[0]).utc().format("YYYY-MM-DD HH:mm:ss");
    const endDate = moment(value[1])
      .add(1, "days")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    if (tabActive === "AllMarkets") {
      const res = (await fundingHistoryPage(pageNum, pageSize, {
        instrumentId:
          selectValue === "All"
            ? ""
            : selectValue.replace("/", "-").replace(" Perp", "-SWAP-LIN"),
        endDate,
        startDate,
      })) as any;
      res.code === "0000" &&
        this.setState({
          total: res.data.total,
          data: res.data.data.map((i: FundingHistoryObject, index: number) => {
            if (i.instrumentId.indexOf("-SWAP-LIN") === -1) {
              return i;
            }
            i.instrumentId = i.instrumentId.replace("-SWAP-LIN", " Perp");
            i.instrumentId = i.instrumentId.replace("-", "/");
            return i;
          }),
        });
      res.code !== "0000" && message.error(res.message);
    } else {
      const res = await getPermissionsRate({
        pageNum,
        pageSize,
        searchParams: {
          marketCode:
            selectValue === "All"
              ? ""
              : permissionsList.find((i) => i.name === selectValue)?.marketCode,
          endDate,
          startDate,
        },
      });
      res.code === "0000" &&
        this.setState({
          total: res.data.total,
          data: res.data.data.map(
            (i: { [key: string]: string }, index: number) => {
              if (i.marketCode.indexOf("-SWAP-PER") === -1) {
                return i;
              }
              i.marketCode = i.marketCode.replace("-SWAP-PER", " Perp");
              i.marketCode = i.marketCode.replace("-", "/");
              return i;
            }
          ),
        });
      res.code !== "0000" && message.error(res.message);
    }

    this.setState({ loading: 0 });
  };
  dateChange = (e: any, dateStrings: string[]) => {
    this.setState({ value: dateStrings, pageNum: 1, pageSize: 10 });
  };
  onShowSizeChange = (type: number, page: number, pageSize: number) => {
    if (type === 1) {
      this.setState(
        {
          pageNum: page,
          pageSize: pageSize!,
        },
        () => {
          this.getHistory();
        }
      );
    } else {
      this.setState(
        {
          pageNum: page,
          pageSize: pageSize!,
        },
        () => {
          this.getHistory();
        }
      );
    }
  };
  onPaginationChange = (
    type: number,
    page: number,
    pageSize?: number | undefined
  ) => {
    if (type === 1) {
      this.setState(
        {
          pageNum: page,
          pageSize: pageSize!,
        },
        () => {
          this.getHistory();
        }
      );
    } else {
      this.setState(
        {
          pageNum: page,
          pageSize: pageSize!,
        },
        () => {
          this.getHistory();
        }
      );
    }
  };
  select = (e: string) => {
    console.log(e);
    this.setState({ selectValue: e, pageNum: 1, pageSize: 10 });
  };
  submit = () => {
    this.getHistory();
  };
  reset = () => {
    this.setState(
      {
        selectValue: "All",
        value: [
          moment().subtract(1, "week").format("YYYY-MM-DD 00:00:00"),
          moment().format("YYYY-MM-DD 00:00:00"),
        ],
        pageNum: 1,
        pageSize: 10,
      },
      () => {
        this.getHistory();
      }
    );
  };
  changeTabs = (e: string) => {
    this.setState({ tabActive: e, data: [] }, () => {
      this.reset();
    });
  };
  downloadExcel = debounce(async () => {
    const { value, selectValue } = this.state;
    const instrumentId =
      selectValue === "All"
        ? ""
        : selectValue.replace("/", "-").replace(" Perp", "-SWAP-LIN");
    const startDate = moment(value[0]).utc().format("YYYY-MM-DD HH:mm:ss");
    const endDate = moment(value[1])
      .add(1, "days")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    const res = await getFundingHistoryExcel({
      instrumentId,
      endDate,
      startDate,
    });
    const url = window.URL.createObjectURL(
      new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );
    this.download(url);
  }, 300);
  download = (blobUrl: any) => {
    const a = document.createElement("a");
    a.style.display = "none";
    a.download = `${this.state.selectValue}-FundingHistory.xls`;
    a.href = blobUrl;
    a.click();
  };
  render() {
    const {
      marketsList,
      data,
      total,
      selectValue,
      loading,
      pageNum,
      permissionsList,
      tabActive,
    } = this.state;
    const [endDate, startDate] = this.state.value;
    return (
      <div className="fundingHistory">
        <div className="fundingHistory-top">
          <p>
            <FormattedMessage id="Funding_History" />
          </p>
        </div>
        <div className="fundingHistory-tabs">
          <div
            className="fundingHistory-tabs-item"
            onClick={this.changeTabs.bind(this, "AllMarkets")}
            data-active={tabActive === "AllMarkets" ? "true" : "false"}
          >
            <FormattedMessage id="AllMarkets" defaultMessage="All Markets" />
          </div>
          {/* <div
            className="fundingHistory-tabs-item"
            onClick={this.changeTabs.bind(this, "PermissionlessZone")}
            data-active={tabActive === "PermissionlessZone" ? "true" : "false"}
          >
            <FormattedMessage
              id="Permissionless-Zone"
              defaultMessage="Permissionless Zone"
            />
          </div> */}
        </div>
        <div className="fundingHistory-container">
          <p>
            <FormattedMessage id="Markets" />
          </p>

          <div className="fundingHistory-content">
            <div className="fundingHistory-left">
              {tabActive === "AllMarkets" ? (
                <Select
                  value={selectValue}
                  style={{ width: 259 }}
                  onChange={this.select}
                  showSearch
                >
                  <Option value="All">
                    <FormattedMessage id="All" />
                  </Option>
                  {marketsList.map((item) => (
                    <Option value={item.value} key={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Select
                  value={selectValue}
                  style={{ width: 259 }}
                  onChange={this.select}
                  showSearch
                >
                  <Option value="All">
                    <FormattedMessage id="All" />
                  </Option>
                  {permissionsList.map((item) => (
                    <Option value={item.name} key={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              )}
              <RangePicker
                suffixIcon={<DateIMG />}
                disabledDate={(current) =>
                  current && current > moment().endOf("day")
                }
                onChange={this.dateChange}
                allowClear={false}
                value={
                  startDate && [
                    moment(startDate, "YYYY-MM-DD"),
                    moment(endDate, "YYYY-MM-DD"),
                  ]
                }
              />
              <div className="fundingHistory-left-btn">
                <Button
                  type="primary"
                  onClick={this.submit}
                  style={{ marginRight: 24 }}
                >
                  <FormattedMessage id="Submit" />
                </Button>
                <Button type="text" onClick={this.reset}>
                  <FormattedMessage id="Reset" />
                </Button>
              </div>
            </div>
            <div
              onClick={this.downloadExcel}
              className="fundingHistory-right"
              style={{ color: "#539ef7", cursor: "pointer" }}
            >
              Export Funding History
            </div>
          </div>
          <Loadding show={loading}>
            <Table
              dataSource={data}
              columns={
                tabActive === "AllMarkets"
                  ? this.columns
                  : this.columnsPermissions
              }
              scroll={{ x: true }}
              rowKey={(_record) => _record.id}
              locale={{
                emptyText: (
                  <div className="empty-table">
                    <img src={empty} alt="empty-table" />
                    <span style={{ marginTop: "12px" }}>
                      <FormattedMessage id="No_Funding_History" />
                    </span>
                  </div>
                ),
              }}
              pagination={{
                hideOnSinglePage: false,
                pageSizeOptions: ["10", "50", "100"],
                defaultPageSize: 10,
                showQuickJumper: true,
                showSizeChanger: true,
                // size: "small",
                current: pageNum,
                onShowSizeChange: this.onShowSizeChange.bind(this, 1),
                total,
                onChange: this.onPaginationChange.bind(this, 1),
              }}
            />
          </Loadding>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(FundingHistory);

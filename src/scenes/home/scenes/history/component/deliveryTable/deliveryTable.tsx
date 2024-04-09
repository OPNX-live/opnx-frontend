import React, { Component } from 'react';
import { connect } from 'react-redux';
import empty from 'assets/image/empty-table.png';
import { ReactComponent as Date } from 'assets/image/date-lint.svg';
import './deliveryTable.scss';

import { Select, Button, DatePicker, Table, message } from 'antd';
import { getDeliversList, getMarketsType } from 'service/http/http';
import { Loadding } from 'components/loadding';
import { messageError, toUtc } from 'utils';
import moment from 'moment';
import { comparedDate, switchValue } from '../exportHistory/data';
import prev from 'assets/image/pagination-left.svg';
import next from 'assets/image/pagination-right.svg';
import { WrappedComponentProps, injectIntl } from 'react-intl';
const { Option } = Select;
const { RangePicker } = DatePicker;

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
enum EnumContracts {
  'Long' = '#22c6b9',
  'Short' = '#f73460',
}
interface IProps {
  initDate: (e: string[]) => void;
  initCoin: (e: string[]) => void;
  initStatus: (e: string[]) => void;
}
type IWithdrawTablePropsState = ReturnType<typeof mapStateToProps>;
type IWithdrawTableDispatchState = ReturnType<typeof mapDispatchToProps> &
  IProps &
  IWithdrawTablePropsState &
  WrappedComponentProps;

class DeliveryTable extends Component<IWithdrawTableDispatchState, IState> {
  enumContracts: { [key: string]: string } = EnumContracts;
  constructor(props: IWithdrawTableDispatchState) {
    super(props);
    this.state = {
      loadding: 0,
      datas: [],
      total: 0,
      pageIndex: 0,
      pageSize: 10,
      index: undefined,
      date: switchValue('1w'),
      status: [],
      instruments: [],
      coinOptions: [],
    };
  }
  unFold = (index: number) => {
    this.state.index === index
      ? this.setState({ index: undefined })
      : this.setState({ index });
  };

  getTransfersHistories = () => {
    this.setState({
      loadding: 1,
    });

    getDeliversList({
      pageNum: this.state.pageIndex + 1,
      pageSize: this.state.pageSize,
      searchParams: {
        contract: this.state.instruments, //
        startDate: this.state.date.length
          ? toUtc(this.state.date[0])
          : undefined,
        endDate: this.state.date.length
          ? toUtc(moment(this.state.date[1]).add(1, 'day'))
          : undefined,
      },
    }).then((res) => {
      this.setState({
        loadding: 0,
      });
      if (res.code === '0000') {
        this.setState({
          datas: res.data.data,
          total: res.data.total,
        });
      } else {
        message.warning(res.message);
      }
    });
  };
  getCoins = () => {
    getMarketsType().then((res) => {
      if (res.success) {
        const coinOptions = res.data
          // .reduce(
          //   (all: any, next: any) =>
          //     all.some((item: any) => item.marketCode == next.marketCode)
          //       ? all
          //       : [...all, next],
          //   []
          // )
          .map((item: any) => item.marketCode);
        const arr: any = coinOptions.filter(
          (p: any) => p.split('-').length === 2
        );
        this.setState({
          coinOptions: arr,
        });
      } else {
        message.warning(res.message);
      }
    });
  };
  disableDate = (current: any) => {
    return current && current > moment().endOf('day');
  };
  itemRender = (
    current: number,
    type: string,
    originalElement: React.ReactNode
  ) => {
    if (type === 'prev') {
      return <img alt="prev" src={prev} />;
    }
    if (type === 'next') {
      return <img alt="next" src={next} />;
    }
    return originalElement;
  };
  componentDidMount() {
    this.getCoins();
    this.getTransfersHistories();
  }
  onChange = (dateString: any) => {
    if (comparedDate(dateString)) {
      this.setState({
        date: dateString,
      });
      this.props.initDate(dateString);
    } else {
      this.setState({
        date: [dateString[0], moment(dateString[0]).add(3, 'M')],
      });
      message.error(messageError('31002'));
    }
  };
  onRest = () => {
    this.setState(
      {
        status: [],
        instruments: [],
        date: switchValue('1w'),
      },
      () => {
        this.getTransfersHistories();
      }
    );
  };
  render() {
    const { intl } = this.props;
    const columns = [
      {
        title: intl.formatMessage({ id: 'Market' }),
        dataIndex: 'contract',
        key: 'contract',
        render: (item: any, row: any) => (
          <div className="badge">
            {/* {row.type === 'Long' ? (
              <img src={imageList.long} alt="long" />
            ) : (
              <img src={imageList.short} alt="short" />
            )}{' '} */}
            <div
              style={{
                width: '32px',
                height: '16px',
                backgroundColor: this.enumContracts[row.type],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#E5DFF5',
                marginRight: '4px',
                borderRadius: '2px',
              }}
            >
              {this.props.intl.formatMessage({
                id: row.type,
                defaultMessage: row.type,
              })}
            </div>
            <span>{item}</span>
          </div>
        ),
      },
      {
        title: intl.formatMessage({ id: 'Time' }),
        key: 'time',
        dataIndex: 'time',
        render: (item: any) => (
          <div className="table-status">
            {moment.parseZone(item).local().format('YYYY-MM-DD HH:mm:ss')}
          </div>
        ),
      },
      {
        title: intl.formatMessage({ id: 'Delivered_Position' }),
        dataIndex: 'deliveredPosition',
        key: 'deliveredPosition',
      },
      {
        title: intl.formatMessage({ id: 'Delivered_Assets' }),
        dataIndex: 'deliveredAssets',
        key: 'deliveredAssets',
      },
      {
        title: intl.formatMessage({ id: 'Received_Assets' }),
        dataIndex: 'receivedAsset',
        key: 'receivedAsset',
      },
    ];

    const onShowSizeChange = (current: number, size: number) => {
      this.setState(
        {
          pageSize: size,
          pageIndex: current - 1,
        },
        () => {
          this.getTransfersHistories();
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
          this.getTransfersHistories();
        }
      );
    };

    return (
      <Loadding show={this.state.loadding}>
        <div className="delivery-table">
          <div className="delivery-top">
            <div className="market">
              <div className="intput-name">
                {intl.formatMessage({ id: 'Market' })}
              </div>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                maxTagCount={1}
                maxTagTextLength={10}
                getPopupContainer={(triggerNode) => triggerNode}
                placeholder={intl.formatMessage({ id: 'Please_select' })}
                value={this.state.instruments}
                onChange={(e: any) => {
                  this.setState({
                    instruments: e,
                  });
                  this.props.initCoin(e);
                }}
              >
                {this.state.coinOptions.map((res) => (
                  <Option key={res} value={res}>
                    {res}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="date">
              <div className="intput-name">
                {intl.formatMessage({ id: 'Date' })}
              </div>
              <RangePicker
                disabledDate={this.disableDate}
                suffixIcon={<Date />}
                separator=" ~ "
                value={
                  this.state.date && [
                    moment(this.state.date[0], 'YYYY-MM-DD'),
                    moment(this.state.date[1], 'YYYY-MM-DD'),
                  ]
                }
                allowClear={false}
                className="date-picker"
                onChange={this.onChange}
              />
            </div>
            <div className="spot-search">
              <Button
                type="text"
                onClick={() => {
                  this.setState(
                    {
                      pageIndex: 0,
                    },
                    () => {
                      this.getTransfersHistories();
                    }
                  );
                }}
              >
                {intl.formatMessage({ id: 'Search' })}
              </Button>
            </div>
            <div className="spot-btn">
              <Button type="text" onClick={this.onRest}>
                {intl.formatMessage({ id: 'Reset' })}
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={this.state.datas}
            rowClassName={(record, index) => 'table-row'}
            rowKey={(recond: any) => recond.id}
            scroll={{ x: true }}
            pagination={{
              pageSizeOptions: ['10', '20', '30'],
              defaultPageSize: 10,
              onShowSizeChange,
              showSizeChanger: true,
              current: this.state.pageIndex + 1,
              total: this.state.total,
              onChange: onChangePagination,
              size: 'small',
              itemRender: this.itemRender,
            }}
            locale={{
              emptyText: (
                <div className="empty-table">
                  <img src={empty} alt="empty-table" />
                  <span style={{ marginTop: '12px' }}>
                    {intl.formatMessage({ id: 'No_Data' })}
                  </span>
                </div>
              ),
            }}
          />
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

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DeliveryTable));

import React, { Component } from 'react';
import { connect } from 'react-redux';
import empty from 'assets/image/empty-table.png';
import { ReactComponent as Date } from 'assets/image/date-lint.svg';
import './depositTable.scss';
import { Select, Button, DatePicker, Table, message } from 'antd';
import { getDepositHistories, allCoin } from 'service/http/http';
import { Loadding } from 'components/loadding';
import moment from 'moment';
import { comparedDate, switchValue } from '../exportHistory/data';
import { messageError } from 'utils/errorCode';
import { toUtc, guid } from 'utils';
import prev from '../../../../../../assets/image/pagination-left.svg';
import next from '../../../../../../assets/image/pagination-right.svg';
import { toLocaleString } from 'utils/toLocaleString';
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from 'react-intl';

const space = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
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
interface IProps {
  initDate: (e: string[]) => void;
  initCoin: (e: string[]) => void;
  initStatus: (e: string[]) => void;
}
type IWithdrawTablePropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
type IWithdrawTableDispatchState = ReturnType<typeof mapDispatchToProps> &
  IProps &
  IWithdrawTablePropsState;

class DepositTable extends Component<IWithdrawTableDispatchState, IState> {
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
  openHref = (url: string, e: any) => {
    e.stopPropagation();
    window.open(url);
  };
  getDepositHistories = () => {
    this.setState({
      loadding: 1,
    });

    getDepositHistories({
      pageNum: this.state.pageIndex + 1,
      pageSize: this.state.pageSize,
      searchParams: {
        instruments: this.state.instruments, //
        statuses: this.state.status, //  COMPLETED,PENDING, FAILED
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
  disableDate = (current: any) => {
    return current && current > moment().endOf('day');
  };
  onChange = (e: any, dateString: any) => {
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
  getCoins = () => {
    allCoin(this.props.dashboardUserData.tradingType).then((res) => {
      if (res.code === '0000') {
        this.setState({ coinOptions: res.data });
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
    if (type === 'prev') {
      return <img alt="prev" src={prev} />;
    }
    if (type === 'next') {
      return <img alt="next" src={next} />;
    }
    return originalElement;
  };
  componentDidMount() {
    this.getDepositHistories();
    this.getCoins();
  }
  onRest = () => {
    this.setState(
      {
        status: [],
        instruments: [],
        date: switchValue('1w'),
      },
      () => {
        this.getDepositHistories();
      }
    );
  };
  render() {
    const optins = [
      {
        lable: <FormattedMessage id="Processing" defaultMessage="Processing" />,
        value: 'Processing',
      },
      {
        lable: <FormattedMessage id="Onhold" defaultMessage="On hold" />,
        value: 'On hold',
      },
      {
        lable: <FormattedMessage id="Completed" defaultMessage="Completed" />,
        value: 'Completed',
      },
      {
        lable: <FormattedMessage id="Pending" defaultMessage="Pending" />,
        value: 'Pending',
      },
      {
        lable: <FormattedMessage id="Failed" defaultMessage="Failed" />,
        value: 'Failed',
      },
    ];
    const columns = [
      {
        title: <FormattedMessage id="Coin" />,
        dataIndex: 'instrument',
        key: 'instrument',
        render: (_item: any, _record: any, index: number) => (
          <div>{_item}</div>
        ),
      },
      {
        title: <FormattedMessage id="Status" />,
        dataIndex: 'status',
        key: 'status',
        render: (item: any) => (
          <FormattedMessage id={item} defaultMessage={item} />
        ),
      },
      {
        title: <FormattedMessage id="Amount" />,
        dataIndex: 'amount',
        key: 'amount',
        render: (item: any) => (item !== '0' ? toLocaleString(item) : '0'),
      },
      {
        title: <FormattedMessage id="Date" />,
        key: 'createdDate',
        dataIndex: 'createdDate',
        render: (item: any) => (
          <div className="table-status">
            {moment.parseZone(item).local().format('YYYY-MM-DD HH:mm:ss')}
          </div>
        ),
      },
      {
        title: <FormattedMessage id="Information" />,
        key: 'address',
        dataIndex: 'address',
        render: (_item: any, _record: any, index: number) => (
          <div
            className={
              this.state.index === index ? 'information-top' : 'information'
            }
            onClick={this.unFold.bind(this, index)}
          >
            <p className="information-address">
              <span>
                <FormattedMessage id="Address" />:
              </span>
              {_record.address}
            </p>
            {this.state.index === index ? (
              <div>
                <p className="information-txid">
                  <span dangerouslySetInnerHTML={{ __html: space }}></span>
                  <span>
                    <FormattedMessage id="Txid" />:
                  </span>
                  <a
                    style={{ textDecoration: 'underline' }}
                    rel="nofollow noopener noreferrer"
                    target="_blank"
                    href={_record.txUrl}
                  >
                    {_record.txId}
                  </a>
                </p>
              </div>
            ) : null}
          </div>
        ),
      },
    ];

    const onShowSizeChange = (current: number, size: number) => {
      this.setState(
        {
          pageSize: size,
          pageIndex: current - 1,
        },
        () => {
          this.getDepositHistories();
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
          this.getDepositHistories();
        }
      );
    };
    const { intl } = this.props;
    return (
      <Loadding show={this.state.loadding}>
        <div className="deposit-table">
          <div className="deposit-top">
            <div className="coin">
              <div className="intput-name">
                {intl.formatMessage({ id: 'Coin' })}
              </div>
              <Select
                mode="multiple"
                maxTagCount={1}
                maxTagTextLength={10}
                style={{ width: '100%' }}
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
            <div className="status">
              <div className="intput-name">
                {intl.formatMessage({ id: 'Status' })}
              </div>
              <Select
                mode="multiple"
                maxTagCount={1}
                maxTagTextLength={10}
                style={{ width: '100%' }}
                getPopupContainer={(triggerNode) => triggerNode}
                placeholder={intl.formatMessage({ id: 'Please_select' })}
                value={this.state.status}
                onChange={(e: any) => {
                  this.setState({
                    status: e,
                  });
                  this.props.initStatus(e);
                }}
              >
                {optins.map((res) => (
                  <Option key={res.value} value={res.value}>
                    {res.lable}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="date">
              <div className="intput-name">
                {intl.formatMessage({ id: 'Date' })}
              </div>
              <RangePicker
                defaultValue={this.state.date}
                disabledDate={this.disableDate}
                separator=" ~ "
                format={'YYYY-MM-DD'}
                className="date-picker"
                value={
                  this.state.date && [
                    moment(this.state.date[0], 'YYYY-MM-DD'),
                    moment(this.state.date[1], 'YYYY-MM-DD'),
                  ]
                }
                allowClear={false}
                onChange={this.onChange}
                suffixIcon={<Date />}
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
                      this.getDepositHistories();
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
            scroll={{ x: true }}
            rowKey={(recond: any) => guid()}
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
  return { dashboardUserData: state.dashboardUserData };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DepositTable));

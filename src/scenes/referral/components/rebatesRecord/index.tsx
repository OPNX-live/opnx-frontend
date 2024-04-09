import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DatePicker, Table, Button, message } from 'antd';
import {
  prev,
  next,
  Date,
  SpotHistoryState,
  SpotState,
  ISpotProps,
} from './type';
import { PrevDay, comparedDate, guid, toUtc, getMonthStartOrEnd } from 'utils/utils';
import './index.scss';
import moment from 'moment';
import empty from 'assets/image/empty-table.png';
import { messageError } from 'utils';
import { Loadding } from 'components/loadding';
import { rebates } from 'service/http/http';
const { RangePicker } = DatePicker;
type ISpotHistoryPropsState = ReturnType<typeof mapStateToProps> & ISpotProps;
type ISpotHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;

class RebatesRecord extends Component<ISpotHistoryPropsState, SpotState> {
  constructor(props: any) {
    super(props);
    this.state = SpotHistoryState;
  }
  componentDidUpdate(prevProps: ISpotProps, nextState: any) {}
  async componentDidMount() {
    const time = [getMonthStartOrEnd().firstDay, getMonthStartOrEnd().lastDay];
    this.setState(
      {
        date: time,
      },
      () => {
        this.props.isLogin && this.rebates();
      }
    );
  }
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
  // handleChange = (e: string[]) => {
  //   this.setState(
  //     {
  //       Market: e,
  //     }
  //   );
  // };
  handleChange = (type: string, e: string[]) => {};
  onPanelChange = (date: any, dateString: string[]) => {
    if (comparedDate(dateString)) {
      const time = [
        moment
          .parseZone(dateString[0], 'YYYY-MM-DD HH:mm:ss')
          .local()
          .format('YYYY-MM-DD HH:mm:ss'),
        moment
          .parseZone(dateString[1], 'YYYY-MM-DD HH:mm:ss')
          .local()
          .format('YYYY-MM-DD HH:mm:ss'),
      ];
      this.setState({
        date: time,
      });
    } else {
      message.error(messageError('31002'));
    }
  };
  onPaginationChange = (page: number, pageSize?: number | undefined) => {
    this.setState(
      {
        pageNum: page,
        pageSize: pageSize!,
      },
      () => {
        this.rebates();
      }
    );
  };
  onShowSizeChange = (page: number, pageSize: number) => {
    this.setState(
      {
        pageNum: page,
        pageSize: pageSize!,
      },
      () => {
        this.rebates();
      }
    );
  };
  spotRest = () => {
    const time = [
      moment
        .parseZone(PrevDay(1, 'weeks')[0], 'YYYY-MM-DD HH:mm:ss')
        .local()
        .format('YYYY-MM-DD HH:mm:ss'),
      moment
        .parseZone(PrevDay(1, 'weeks')[1], 'YYYY-MM-DD HH:mm:ss')
        .local()
        .format('YYYY-MM-DD HH:mm:ss'),
    ];
    this.setState(
      {
        pageNum: 1,
        pageSize: 10,
        date: time,
        status: '',
      },
      () => {
        this.rebates();
      }
    );
  };
  rebates = () => {
    if (this.props.isLogin) {
      this.setState({ loading: true });
      const { pageNum, pageSize, date } = this.state;
      rebates({
        pageNum,
        pageSize,
        searchParams: {
          startDate: toUtc(date[0]),
          endDate: moment(toUtc(date[1]))
            .add(1, 'day')
            .format('YYYY-MM-DD HH:mm:ss'),
          dataEntry: 'OPTIONS',
        },
      }).then((res) => {
        this.setState({ loading: false });
        if (res.code === '0000') {
          // let arr = {} as any;
          // const result = res.data.data.map((item: any, index: any) => ({
          //   ...item,
          //   id: index,
          // }));
          // arr = result.map((item: any) => {
          //   const time = moment(item.createdDate).format('YYYY-MM-DD');
          //   // arr[time] =
          // });
          // result.forEach((item: any) => {
          //   const date = moment(item.createdDate).format('YYYY-MM-DD');
          //   if (arr.hasOwnProperty(date)) {
          //     arr[date].push(item);
          //   } else {
          //     arr[date] = [item];
          //   }
          // });
          // let count = 0;
          // Object.values(arr).forEach((item: any) => {
          //   count = count < item.length ? item.length : count;
          // });

          // console.log(count);
          // arr = Object.values(arr);
          // console.log(arr);

          // let columns = [
          //   {
          //     value: '',
          //   },
          // ] as any;

          // arr.forEach((arrItem: any) => {
          //   for (let i = 0; i < count; i++) {
          //     if (i === 0) {
          //       columns.push({
          //         title: 'Pay Date',
          //         dataIndex: 'houseProfit',
          //         key: 'houseProfit',
          //         render: (item: string, row: any) => (
          //           <span>
          //             {Number(item).toFixed(4)} {row.instrument}
          //           </span>
          //         ),
          //       });
          //     } else {
          //       columns.push({
          //         title: '',
          //         dataIndex: 'houseProfit',
          //         key: 'houseProfit',
          //         render: (item: string, row: any) => (
          //           <span>
          //             {Number(item).toFixed(4)} {row.instrument}
          //           </span>
          //         ),
          //       });
          //     }
          //   }
          // });
          this.setState({
            datas: res.data.data,
            total: res.data.total,
          });
        }
      });
    } else {
      message.warning(messageError('05004'));
    }
  };
  render() {
    const { date, datas, loading } = this.state;
    const columns = [
      {
        title: 'Pay Date',
        dataIndex: 'createdDate',
        key: 'createdDate',
        render: (item: string, row: any) => (
          <span>{moment(item).format('YYYY-MM-DD')}</span>
        ),
      },
      {
        title: 'Commission',
        dataIndex: 'houseProfit',
        key: 'houseProfit',
      },
      {
        title: 'Account',
        dataIndex: 'recoEmail',
        key: 'recoEmail',
      },
    ];
    return (
      <Loadding show={loading ? 1 : 0}>
        <div className="rebates-record">
          <div className="rebates-record-top">
            <div className="date">
              <RangePicker
                format={'YYYY-MM-DD'}
                suffixIcon={<Date />}
                onChange={this.onPanelChange}
                separator=" ~ "
                disabledDate={(current) =>
                  current && current > moment().endOf('day')
                }
                allowClear={false}
                value={
                  date && [
                    moment(date[0], 'YYYY-MM-DD'),
                    moment(date[1], 'YYYY-MM-DD'),
                  ]
                }
                className="date-picker"
              />
            </div>
            <div className="spot-search">
              <Button type="text" onClick={this.rebates}>
                Search
              </Button>
            </div>
            <div className="spot-btn">
              <Button type="text" onClick={this.spotRest}>
                Reset
              </Button>
            </div>
          </div>
          <Table
            className="ant_table"
            columns={columns}
            dataSource={datas}
            rowKey={(recond) => guid()}
            scroll={{ x: true }}
            locale={{
              emptyText: (
                <div className="empty-table">
                  <img src={empty} alt="empty-table" />
                  <span style={{ marginTop: '12px' }}>No records yet</span>
                </div>
              ),
            }}
            pagination={{
              hideOnSinglePage: false,
              pageSizeOptions: ['10', '20', '30'],
              defaultPageSize: 10,
              showQuickJumper: true,
              total: this.state.total,
              showSizeChanger: true,
              onChange: this.onPaginationChange,
              size: 'small',
              onShowSizeChange: this.onShowSizeChange,
              itemRender: this.itemRender,
            }}
          />
        </div>
      </Loadding>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => {
  return {
    isLogin: state.isLogin,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(RebatesRecord);

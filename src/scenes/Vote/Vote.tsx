import React from 'react';
import { connect } from 'react-redux';
import trophy from 'assets/image/trophy.png';
import matrix from 'assets/image/matrix.png';
import matrix1 from 'assets/image/matrix1.png';
import voteBc from 'assets/image/vote-bc.png';
import matrixBC from 'assets/image/matrix-bc.png';
import empty from 'assets/image/empty-table.png';
import SwitchVote from './SwitchVote/SwitchVote';
import { IVote, IdataTime, IBalance, DateTime } from './type';
import './Vote.scss';
import {
  getVoted,
  getVotedBalance,
  getVotedInfo,
  submitVoted,
  UserData,
} from "service/http/http";
import { message, Button } from "antd";
import { messageError } from "utils";
import day from "dayjs";
import utc from "dayjs/plugin/utc";
import history from "router/history";
import { setDashboardUserData } from "store/actions/publicAction";
import { injectIntl, WrappedComponentProps } from "react-intl";
import {intl} from "utils/Language";
day.extend(utc);
type IVotePropsState = ReturnType<typeof mapStateToProps> &
  IVoteDispatchState &
  WrappedComponentProps;
type IVoteDispatchState = ReturnType<typeof mapDispatchToProps>;
const times: IdataTime[] = [
  { timeName: intl( "Days"), timer: '00' },
  { timeName: intl( "Hours"), timer: '00' },
  { timeName: intl( "Minutes"), timer: '00' },
  { timeName: intl( "Seconds"), timer: '00' },
];
const btmText: string[] = [
  intl( "vote_bottom_message1"),
  intl( "vote_bottom_message2"),
  intl( "vote_bottom_message3"),
  intl( "vote_bottom_message4"),
  // `Rewards will be issued within 2 weeks after the vote ends.`,
  // `Please note that during the vote, the projects above are placed in a random order as Voting Option A or B. Similar color schemes or positioning do not determine the order of how projects are displayed.`,
];
class Vote extends React.Component<IVotePropsState, IVote> {
  private timer: any;
  constructor(props: IVotePropsState) {
    super(props);
    this.state = {
      dataTime: times,
      widths: 10,
      voteData: {},
      proFileData: [],
      isVoted: false,
      balanceList: [],
      loadingB: false,
      loadingA: false,
      visable: false,
    };
  }
  getData = () => {
    getVotedInfo().then((result) => {
      if (result.success) {
        if (result.data.length) {
          const date = 24 * 60 * 60 * 1000;
          const Userform = day(day().utc().format()).valueOf(); // 本地时间转utc时间
          const time = result.data[0].vto - date - Userform; // 活动开始距离投票时间
          const votedStart = result.data[0].vto - Userform; // 投票结束时间减用户本地时间是否大于24小时，判断是否投票开始
          if (votedStart > date) {
            this.countFun(time);
            this.setState({
              voteData: result.data[0],
              isVoted: false,
            });
          } else {
            this.countFun(votedStart);
            this.setState({
              voteData: result.data[0],
              isVoted: true,
            });
          }
          if (this.props.isLogin) {
            getVotedBalance(result.data[0].id).then((rest) => {
              if (rest.success) {
                this.setState({ balanceList: rest.data });
              } else {
                message.warning(messageError(rest.code));
              }
            });
          }
        }
      } else {
        message.warning(result.message);
      }
    });
  };
  async componentDidMount() {
    this.getData();
    const resole = await getVoted();
    this.props.isLogin && this.getUserData();
    if (resole.success) {
      this.setState({ proFileData: resole.data });
    } else {
      message.warning(messageError(resole.code));
    }
  }
  getUserData = () => {
    if (this.props.users.mainLogin) {
      UserData().then((res) => {
        if (res.success) {
          this.props.setDashboardUserData(res.data);
          !res.data.isMainAccount && this.setState({ visable: true });
        } else {
          message.warning(res.message);
        }
      });
    } else {
      this.setState({ visable: true });
    }
  };
  countFun = (time: number) => {
    let sys_second = time;
    this.timer = setInterval(() => {
      if (sys_second > 1000) {
        sys_second -= 1000;
        const day = Math.floor(sys_second / 1000 / 3600 / 24);
        const hour = Math.floor((sys_second / 1000 / 3600) % 24);
        const minute = Math.floor((sys_second / 1000 / 60) % 60);
        const second = Math.floor((sys_second / 1000) % 60);
        const dataTime = [
          { timeName: 'Days', timer: day < 10 ? '0' + day : day },
          { timeName: 'Hours', timer: hour < 10 ? '0' + hour : hour },
          { timeName: 'Minutes', timer: minute < 10 ? '0' + minute : minute },
          { timeName: 'seconds', timer: second < 10 ? '0' + second : second },
        ];
        this.setState({
          dataTime,
        });
      } else {
        if (this.state.voteData.isEnd) {
          clearInterval(this.timer);
        } else {
          const date = 24 * 60 * 60 * 1000;
          clearInterval(this.timer);
          this.setState(
            {
              dataTime: times,
              isVoted: true,
            },
            () => {
              this.countFun(date);
            }
          );
        }
      }
    }, 1000);
  };
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  notVoted = () => {
    const { voteData, isVoted, loadingB, loadingA } = this.state;
    const { intl } = this.props;
    const date = 24 * 60 * 60 * 1000;
    return (
      <>
        <div
          className="voted"
          style={{
            backgroundImage: `url(${matrixBC})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <Button
            className="voted-left"
            loading={loadingA}
            style={{ opacity: this.state.isVoted ? 1 : 0.5 }}
            onClick={this.cast.bind(this, voteData.codeA, 'A')}
          >
            {" "}
            {intl.formatMessage(
              { id: "Vote_for_coin" },
              { coin: voteData.codeA }
            )}
          </Button>
          <Button
            loading={loadingB}
            className="voted-right"
            style={{ opacity: this.state.isVoted ? 1 : 0.5 }}
            onClick={this.cast.bind(this, voteData.codeB, 'B')}
          >
            {" "}
            {intl.formatMessage(
              { id: "Vote_for_coin" },
              { coin: voteData.codeB }
            )}
          </Button>
          <div className="voter-vs">Vs</div>
        </div>
        <div className="v-quanity">
          {
            isVoted && this.props.isLogin
              ? intl.formatMessage(
                  { id: "votesA" },
                  { quantity: Number(voteData.userQuantity) }
                )
              : intl.formatMessage(
                  { id: "votesB" },
                  {
                    timeA: `${day(voteData.vfrom).utc().format("DD")}th ${
                      DateTime[day(voteData.vfrom).utc().format("MM") as string]
                    }`,
                    timeB: `${day(voteData.vto - date * 2)
                      .utc()
                      .format("DD")}th ${
                      DateTime[
                        day(voteData.vto - date * 2)
                          .utc()
                          .format("MM") as string
                      ]
                    }`,
                  },
                )
            //    `Your eligible votes: based on FLEX balance snapshot from ${day(
            //       voteData.vfrom
            //     )
            //       .utc()
            //       .format("DD")}th ${
            //       DateTime[day(voteData.vfrom).utc().format("MM") as string]
            //     } to
            // ${day(voteData.vto - date*2)
            //   .utc()
            //   .format("DD")}th ${
            //       DateTime[
            //         (day(voteData.vto - date*2)
            //           .utc()
            //           .format("MM") as string)
            //       ]
            //     }.`
          }
        </div>
      </>
    );
  };
  subVoted = (params: any) => {
    submitVoted(params).then((res) => {
      this.setState({
        loadingA: false,
        loadingB: false,
      });
      if (res.success) {
        message.success(this.props.intl.formatMessage({id:'success',defaultMessage:'success'}));
        this.getData();
      } else {
        message.warning(res.message);
      }
    });
  };
  cast = (item: string, name: string) => {
    if (this.props.isLogin) {
      if (
        this.props.users.mainLogin &&
        this.props.dashboardUserData.isMainAccount
      ) {
        if (this.state.isVoted) {
          const params = {
            id: this.state.voteData.id,
            code: item,
          };
          if (name === 'A') {
            this.subVoted(params);
            this.setState({ loadingA: true });
          } else {
            this.subVoted(params);
            this.setState({ loadingB: true });
          }
        }
      } else {
        this.setState({ visable: true });
      }
    } else {
      history.push({
        pathname: '/login',
        state: {
          name: 'vote',
        },
      });
    }
  };
  voteTop = () => {
    const { voteData } = this.state;
    return (
      <div className="voted-coin">
        <div className="v-coin1">
          <div className="coin-img">
            <img alt="icon" src={voteData.iconA} />
            <span className="coin">{voteData.codeA}</span>
          </div>
          <div className="coin-public">{voteData.descriptionA}</div>
        </div>
        <div className="v-coin2">
          <div className="coin2-public">{voteData.descriptionB}</div>
          <div className="coin-img">
            <span className="coin">{voteData.codeB}</span>
            <img alt="icon" src={voteData.iconB} />
          </div>
        </div>
      </div>
    );
  };
  voted = () => {
    const { voteData } = this.state;
    const {intl} =this.props
    const total = voteData.voteAQuantity + voteData.voteBQuantity;
    return (
      <>
        <div className="in-the-vote">
          <div
            className="coin1-voted"
            style={
              voteData.voteAQuantity === voteData.voteBQuantity
                ? { width: '50%' }
                : { width: `${(voteData.voteAQuantity / total) * 100}%` }
            }
          >
            {intl.formatMessage({id:"quntity_vote"},{quantity:voteData.voteAQuantity})}
            {/* {voteData.voteAQuantity} votes */}
            <div className="in-the-vs">Vs</div>
          </div>
          <div
            className="coin2-voted"
            style={
              voteData.voteAQuantity === voteData.voteBQuantity
                ? { width: '50%' }
                : { width: `${(voteData.voteBQuantity / total) * 100}%` }
            }
          >
            {intl.formatMessage({id:"quntity_vote"},{quantity:voteData.voteBQuantity})}
          </div>
        </div>
        {voteData.isEnd &&
          (voteData.voteAQuantity === voteData.voteBQuantity ? (
            <div className="win-coin">
              <span>{intl.formatMessage({id:"win_coin"})}</span>
            </div>
          ) : (
            <div className="win-coin">
              <img
                alt="winCoin"
                src={
                  voteData.voteAQuantity > voteData.voteBQuantity
                    ? voteData.iconA
                    : voteData.iconB
                }
              />
              <span>
                {intl.formatMessage({id:"win_coinA"},{coin:`${voteData.voteAQuantity > voteData.voteBQuantity
                  ? voteData.codeA
                  : voteData.codeB} !`})}
                {/* {intl.formatMessage({id:"vote_goes_to"})}{" "} */}
              </span>
            </div>
          ))}
      </>
    );
  };
  render() {
    const {
      dataTime,
      voteData,
      proFileData,
      balanceList,
      visable,
      isVoted,
    } = this.state;
    const {intl} = this.props
    return (
      <div className="vote">
        <div
          className="vote-top"
          style={{
            backgroundImage: `url(${voteBc})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="vote-flex-coin">{intl.formatMessage({id:"flex_vote"})}</div>
          <div className="vote-coin">
          {intl.formatMessage({id:"Round"})} {voteData.round}: {voteData.codeA} vs {voteData.codeB}
          </div>
          <div className="vote-trophy">
            <img alt="trophy" src={trophy} className="trophy" />
            <span className="vote-tropth-span">
            {intl.formatMessage({id:"will_share"})}{" "}
              <span>
                {voteData.prizeAmount?.toLocaleString()}{' '}
                {voteData.prizeInstrument}
              </span>
            </span>
            <img alt="matrix" src={matrix} className="matrix" />
            <img alt="matrix1" src={matrix1} className="matrix1" />
          </div>
          <div className="vote-message">
            {voteData.isEnd
              ? intl.formatMessage({id:"vote_ended"})
              : isVoted
              ? intl.formatMessage({id:"vote_end"})
              : intl.formatMessage({id:"vote_start"})}
          </div>
          <div className="vote-timer">
            {dataTime.map((i: IdataTime, index: number) => (
              <div className="days" key={index}>
                <div className="time">
                  <span></span>
                  <span>{i.timer}</span>
                  <span></span>
                </div>
                <div className="timer-day">{i.timeName}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="vote-content">
          <div
            className="not-voted"
            style={{
              paddingBottom: voteData.voteAQuantity !== null ? '44px' : '',
            }}
          >
            {this.voteTop()}
            {voteData.voteBQuantity === null ? this.notVoted() : this.voted()}
            {/* {voteData.voteBQuantity!==null? this.voted() : this.notVoted()} */}
          </div>
          <div className="vote-calculation">
            <div className="calculation-left">
              <div className="ca-title">{intl.formatMessage({id:"vote_calculation"})}</div>
              <div className="ca-l-table">
                <div className="table-header">
                  <span>{intl.formatMessage({id:"snapshot_time"})}</span>
                  <span>{intl.formatMessage({id:"nunmber_votes"})}</span>
                </div>
                {proFileData.map((i, index: number) => (
                  <div className="table-content" key={index}>
                    <span>{i.description}</span>
                    <span>{i.votes}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="calculation-left">
              <div className="ca-title">{intl.formatMessage({id:"flex_hoid"})}</div>
              <div className="ca-l-table">
                <div className="table-header">
                  <span>{intl.formatMessage({id:"date"})}</span>
                  <span>{intl.formatMessage({id:"felx_history"})} </span>
                </div>
                {this.props.isLogin ? (
                  balanceList.length ? (
                    balanceList.map((i: IBalance, index: number) => (
                      <div className="table-content" key={index}>
                        <span>
                          {day(Number(i.snapshotTime))
                            .utc()
                            .format('YYYY-MM-DD')}
                        </span>
                        <span>
                          {parseFloat(i.quantity as string)} {i.instrumentId}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-div">
                      <img alt="empty" src={empty} />
                      <span className="empty-span">
                      {intl.formatMessage({id:"no_data"})}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="empty-div">
                    <img alt="empty" src={empty} />
                    <span
                      className="login-now"
                      onClick={() =>
                        history.push({
                          pathname: '/login',
                          state: {
                            name: 'vote',
                          },
                        })
                      }
                    >
                      {intl.formatMessage({id:"login_now"})} {">"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="vote-bootom">
            <div className="box">
              <div className="btm-title">{intl.formatMessage({id:"terms"})}</div>
              {btmText.map((i: string, index: number) => (
                <div className="btm-message" key={index}>
                  {i}
                </div>
              ))}
              <div className="btm-message">
              {intl.formatMessage({id:"vote_email"})}
                <a href="mailto:suppor@opnx.com">suppor@opnx.com</a>
              </div>
            </div>
          </div>
        </div>
        <SwitchVote
          visable={visable}
          onCloseModel={(off: boolean) => this.setState({ visable: false })}
        />
      </div>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {
    isLogin: state.isLogin,
    users: state.users,
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Vote));

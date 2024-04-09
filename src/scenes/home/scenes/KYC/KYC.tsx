import React, { Component, memo } from "react";
import { connect } from "react-redux";
import { WrappedComponentProps, injectIntl } from "react-intl";
import inactiveLevel2 from "assets/image/inactiveLevel2.png";
import inactiveLevel3 from "assets/image/inactiveLevel3.png";
import kycLevel1 from "assets/image/kycLevel1.png";
import kycLevel2 from "assets/image/kycLevel2.png";
import kycLevel3 from "assets/image/kycLevel3.png";
import activeLevel1 from "assets/image/activeLevel1.png";
import ActivationLv2 from "./ActivationLv2/ActivationLv2";
import Level2 from "./Level2/Level2";
import Level3 from "./Level3/Level3";
import "./KYC.scss";
import { IKycData, IkycInfo, IKyc3Data } from "./type";
import { IcorpData, Icorp3Data } from "./ActivationLv2/type";
import { getKycInfo, kyc3Info, kycCra, getIpBlock } from "service/http/http";
import { message } from "antd";
import { messageError } from "utils";
import { setKycInfo, switchLoginActiveTab } from "store/actions/publicAction";
import Loadding from "components/loadding";
import KycDisable from "../KycDisable/KycDisable";
import { KycLimit, KycPass, Nokyc, UnlimitedWithdrawal } from "assets/image";
import GetStart from "./Level3/GetStart";
interface IKYCState {
  kycData: IKycData | {} | IcorpData;
  kycInfo: IkycInfo[];
  level: string;
  activeLevel: string;
  authorization: string;
  loading: boolean;
  countryList: any;
  nationalityList: any;
  kyc3Data: IKyc3Data | {} | Icorp3Data;
  ipBlock: boolean;
}
type IKycPropsState = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
type IKycDispatchState = IKycPropsState & WrappedComponentProps;
export class KYC extends Component<IKycDispatchState, IKYCState> {
  leverlList = [
    {
      level: "Level 1",
      bg: kycLevel1,
      inactive: kycLevel1,
    },
    {
      level: "Level 2",
      bg: kycLevel2,
      inactive: inactiveLevel2,
    },
    {
      level: "Level 3",
      bg: kycLevel3,
      inactive: inactiveLevel3,
    },
  ];
  private OPNX_URL = process.env.REACT_APP_OPNX;
  constructor(props: IKycDispatchState) {
    super(props);
    this.state = {
      kycData: {},
      kycInfo: [],
      level: "1",
      activeLevel: "1",
      authorization: "",
      loading: false,
      countryList: [],
      nationalityList: [],
      kyc3Data: {},
      ipBlock: false,
    };
  }
  componentDidMount() {
    /* const { dashboardUserData, switchLoginActiveTab } = this.props;
    if (dashboardUserData && dashboardUserData.accountSource === "METAMASK" && !dashboardUserData.bindEmail) {
      switchLoginActiveTab("login");
      history.push("/home");
    }*/
    this.props.setKycInfo();
    this.getKyc();
    this.getIpBlockData();
  }
  getIpBlockData = async () => {
    try {
      const res = (await getIpBlock()).data;
      if (res.status === "WARNING") {
        this.setState({ ipBlock: true });
        return;
      }
      this.setState({ ipBlock: false });
    } catch (error) {
      console.log(error);
    }
  };

  getKyc = async () => {
    this.setState({ loading: true });
    const res = await getKycInfo();
    const kyc3Data = (await kyc3Info()).data;
    const countryData = (await kycCra("COUNTRY_OF_RESIDENCE")).data;
    const nationalityData = (await kycCra("NATIONALITY")).data;

    res.success &&
      this.setState({
        kycData: res.data,
        kycInfo: res.data.kycInfo,
        level: res.data.level,
        activeLevel: kyc3Data?.status ? "3" : res.data.level,
        authorization: res.data.uploadAuthorization,
        countryList: countryData,
        nationalityList: nationalityData,
        kyc3Data,
      });
    this.setState({ loading: false });
    !res.success && message.warning(res.message);
  };
  components = (
    activeLevel: string,
    kycData: any,
    kycInfo: IkycInfo[],
    authorization: string
  ) => {
    const { intl } = this.props;
    const { level, kyc3Data, countryList, nationalityList, ipBlock } =
      this.state;
    // case "1":
    //   return (
    //     <div className="lever1">
    //       <div className="level-box">
    //         <img src={activeLevel1} alt="level1" />
    //         {intl.formatMessage({ id: "level1" })}
    //       </div>
    //       {level === "1" && (
    //         <div
    //           className="continue"
    //           onClick={() => this.setState({ activeLevel: "2" })}
    //         >
    //           <div className="continue-lv2">
    //             {" "}
    //             {intl.formatMessage({ id: "goto_lv2" })}
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   );
    // case "2":
    //   return this.levelCp(level, kycData, authorization);
    return (
      <Level3
        onCallBack={() => {
          this.getKyc();
          this.getIpBlockData();
        }}
        authorization={authorization}
        kycData={kycData}
        kycInfo={kycInfo}
        level={level}
        kyc3Data={kyc3Data as any}
        countryList={countryList}
        nationalityList={nationalityList}
        ipBlock={ipBlock}
      />
    );
  };
  levelCp = (level: string, kycData: any, authorization: string) => {
    if (+level >= 2) {
      return (
        <ActivationLv2
          kycData={kycData}
          setLevel={() => this.setState({ activeLevel: "3" })}
        />
      );
    } else {
      return (
        <Level2
          onCallBack={this.getKyc}
          authorization={authorization}
          kycData={kycData}
        />
      );
    }
  };
  onLevelClick = (activeLevel: string) => {
    const { level } = this.state;
    if (activeLevel === "3" && +level < 2) {
      return;
    }
    this.setState({
      activeLevel,
    });
  };
  checkName = (e: string) => {
    const reg = new RegExp("[\u4E00-\u9FA5]+");
    const name = e?.slice(0, 2);
    if (reg.test(name)) {
      return e?.slice(0, 1);
    } else {
      return e?.slice(0, 2);
    }
  };
  render() {
    const { intl } = this.props;
    const {
      kycData,
      kycInfo,
      activeLevel,
      level,
      authorization,
      loading,
      kyc3Data,
      countryList,
      nationalityList,
      ipBlock,
    } = this.state;
    // const walletAuthentication = isAddress(users.email);
    // if (walletAuthentication) return (<Guard />);
    return (
      <div className="kyc">
        <Loadding show={loading ? 1 : 0}>
          <div
            style={{
              width: "100vw",
              height: "100vh",
              display: loading ? "block" : "none",
            }}
          ></div>
        </Loadding>

        <div style={{ display: loading ? "none" : "block" }}>
          <div className="kyc-title">KYC Verification</div>
          <div className="kyc-top">
            <div className="kyc-top-info">
              <span className="kyc-top-icon">
                {this.checkName(this.props.users.email)}
              </span>
              <span>{this.props.users.email}</span>
            </div>
            <div className="kyc-top-info-status">
              <div
                className="kyc-top-info-status-icon"
                style={
                  this.props.kycOpened
                    ? { color: "#06B196", background: "#152422" }
                    : {}
                }
              >
                {this.props.kycOpened ? <KycPass /> : <Nokyc />}
                <span>
                  {this.props.kycOpened ? "KYC level 2" : "KYC level 1"}
                </span>
              </div>
              <div
                className="kyc-top-info-status-limit"
                style={
                  this.props.kycOpened
                    ? { color: "#318BF5", background: "#12233A" }
                    : {}
                }
              >
                {this.props.kycOpened ? <UnlimitedWithdrawal /> : <KycLimit />}
                <span>
                  {this.props.kycOpened
                    ? "Unlimited withdrawal"
                    : "Limited withdrawal"}
                </span>
              </div>
            </div>
            <div className="kyc-top-content">
              OPNX does not serve residents, citizens and/or companies
              incorporated in
              <a
                href={`https://support.opnx.com/en/articles/7223112-prohibited-locations-and-places-of-residence`}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                {" "}
                these countries.
              </a>
            </div>
            <GetStart />
          </div>

          <Level3
            onCallBack={() => {
              this.getKyc();
              this.getIpBlockData();
            }}
            authorization={authorization}
            kycData={kycData as any}
            kycInfo={kycInfo}
            level={level}
            kyc3Data={kyc3Data as any}
            countryList={countryList}
            nationalityList={nationalityList}
            ipBlock={ipBlock}
          />
        </div>
        {/* <Level3 kycInfo={kycInfo} level={level} /> */}
        {/* <Level2 /> */}
        {/* <ActivationLv2 /> */}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  dashboardUserData: state.dashboardUserData,
  users: state.users,
  kycOpened: state.kycInfo?.kycOpened,
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
    switchLoginActiveTab(data: string) {
      dispatch(switchLoginActiveTab(data));
    },
    setKycInfo() {
      dispatch(setKycInfo());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(KycDisable(KYC)));

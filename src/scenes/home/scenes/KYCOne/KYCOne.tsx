import React, { Component } from "react";
import { connect } from "react-redux";
import { WrappedComponentProps, injectIntl } from "react-intl";
import Level2 from "./Level2/Level2";
import "./KYC.scss";
import ActivationLv2 from "./ActivationLv2/ActivationLv2";
import { IKycData, IkycInfo, IcorpData, IGoogleFiles } from "./type";
import { UserData } from "service/http/http";
import { message } from "antd";
import { messageError } from "utils";
import history from "router/history";
interface IKYCState {
  kycData: IKycData | {} | IcorpData;
  kycInfo: IkycInfo[];
  authorization: string;
}
type IKycPropsState = ReturnType<typeof mapStateToProps>;
type IKycDispatchState =  IKycPropsState & WrappedComponentProps;
export class KYCOne extends Component<IKycDispatchState, IKYCState> {
  constructor(props: IKycDispatchState) {
    super(props);
    this.state = {
      kycData: {},
      kycInfo: [],
      authorization: "",
    };
  }
  componentDidMount() {
    const { dashboardUserData } = this.props;
    if (dashboardUserData && dashboardUserData.sourceType === "US" && dashboardUserData.isMainAccount) {
      this.getKyc();
    } else {
      history.replace("/home");
    }
    
  }
  getKyc = async () => {
    UserData().then((res) => {
      if (res.code === '0000') {
        this.setState({ kycData: res.data.usKycInfo });
        // this.props.setDashboardUserData(res.data);
      } else {
        message.error(res.message);
      }
    });
  };

  onChangeKycData = (data: IKycData | {} | IcorpData) => {
    this.setState({ kycData: data });
  }
  components = (
    kycData: any,
    authorization: string
  ) => {
    if (kycData) {
      if (kycData.status === "APPROVED") {
        return <ActivationLv2 kycData={kycData} />;
      } else {
        return <Level2
        onCallBack={this.getKyc}
        onChangeKycData={(data: IGoogleFiles[]) => {this.onChangeKycData(data)}}
        authorization={authorization}
        kycData={kycData}
      />;
      }
    } else {
      return <Level2
      onCallBack={this.getKyc}
      onChangeKycData={(data: IGoogleFiles[]) => {this.onChangeKycData(data)}}
      authorization={authorization}
      kycData={kycData}
    />;
    }
  };
  render() {
    const { intl } = this.props;
    const { kycData, authorization } = this.state;
    return (
      <div className="kyc">
        <div className="kyc-title">
          {intl.formatMessage({ id: "kycTitle" })}
        </div>
        <div className="sub-title">
          {intl.formatMessage(
            { id: "kycSubtitle" },
            {
              url: (
                <span
                  key="service-areas"
                  onClick={() =>
                    window.open(
                      "https://OPNX.com/service-areas/"
                    )
                  }
                >
                  {intl.formatMessage({id:"current_city"})}
                </span>
              ),
              url1:
                <span
                  key="prohibited-countries"
                  onClick={() =>
                    window.open(
                      "https://OPNX.com/service-areas/prohibited-countries/")
                  }
                >
              {intl.formatMessage({id:"see_trading"})}
            </span>
            }
          )}
        </div>
        {this.components(kycData, authorization)}
        {/* <Level3 kycInfo={kycInfo} level={level} /> */}
        {/* <Level2 /> */}
        
      </div>
    )
  }
}

const mapStateToProps = (state: {
  dashboardUserData: IDashboardUserData;
}) => {
  return {
    dashboardUserData: state.dashboardUserData
  };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(KYCOne));

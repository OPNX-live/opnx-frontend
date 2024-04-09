import React, { Component } from "react";
import { connect } from "react-redux";
import activelv2 from "assets/image/activelv2.png";
import { WrappedComponentProps, injectIntl } from "react-intl";
import hide from "assets/image/hide.svg";
import KycShow from "assets/image/KycShow.svg";
import { IKycData } from "../type";
import "./ActivationLv2.scss";
import moment from "moment";
import country from "../Level2/countries.json";
import { IcorpData } from "./type";
interface IActiveLv2 {
  visible: boolean;
  userType: string;
}
interface IActiveLv2Props {
  kycData: any;
  setLevel: () => void;
}
export class ActivationLv2 extends Component<
  WrappedComponentProps & IActiveLv2Props,
  IActiveLv2
> {
  constructor(props: WrappedComponentProps & IActiveLv2Props) {
    super(props);
    this.state = {
      visible: false,
      userType: ""
    };
  }
  onImgClick = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible
    });
  };
  countryLocal = (locale: string) => {
    return country.filter((i) => i.locale === locale)[0]?.en;
  };
  Individual = (data: IKycData) => {
    const { intl } = this.props;
    return [
      {
        name: intl.formatMessage({ id: "User" }),
        message: intl.formatMessage({ id: "Individual" })
      },
      {
        name: intl.formatMessage({ id: "Salutation" }),
        message: intl.formatMessage({
          id: data.salutation,
          defaultMessage: data.salutation
        })
      },
      {
        name: intl.formatMessage({ id: "Name" }),
        message: data.middleName
          ? `${data.superName}-${data.middleName}-${data.lastName}`
          : `${data.superName}-${data.lastName}`
      },
      {
        name: intl.formatMessage({ id: "birth_date" }),
        message: moment(data.dateOfBirth).format("YYYY-MM-DD")
      },
      {
        name: intl.formatMessage({ id: "Nationality" }),
        message: this.countryLocal(data.nationality)
      },
      {
        name: intl.formatMessage({ id: "Country" }),
        message: this.countryLocal(data.countryOfResidence)
      },
      {
        name: intl.formatMessage({ id: "id_type" }),
        message: intl.formatMessage({
          id: data.idType,
          defaultMessage: data.idType
        })
      },
      {
        name: intl.formatMessage({ id: "id_number" }),
        message: data.idSerialNumber
      },
      {
        name: intl.formatMessage({ id: "id_date" }),
        message: moment(data.idExpiryDate).format("YYYY-MM-DD")
      }
    ];
  };
  Corporate = (data: IcorpData) => {
    const { intl } = this.props;
    return [
      {
        name: intl.formatMessage({ id: "User" }),
        message: intl.formatMessage({ id: "Corporate" })
      },
      {
        name: intl.formatMessage({ id: "Company_name" }),
        message: data.companyName
      },
      {
        name: intl.formatMessage({ id: "Incorporation_date" }),
        message: moment(data.incorporationDate).format("YYYY-MM-DD")
      },
      {
        name: intl.formatMessage({ id: "Incorporation_Country" }),
        message: this.countryLocal(data.incorporationCountry)
      },
      {
        name: intl.formatMessage({ id: "Incorporation_number" }),
        message: data.incorporationNumber
      }
    ];
  };
  render() {
    const { kycData, setLevel, intl } = this.props;
    const { visible } = this.state;
    return (
      <div className="at-lv2">
        <div className="box">
          <div className="level-box">
            <img src={activelv2} alt="level1" />
            {intl.formatMessage({ id: "level2" })}
          </div>
        </div>
        <div className="basic-info">
          <div className="info">
            {intl.formatMessage({ id: "Basic_Info" })}{" "}
            <img
              onClick={this.onImgClick}
              src={visible ? KycShow : hide}
              alt="visable"
            />
          </div>
          <div className="ba-id">{intl.formatMessage({ id: "with_id" })}</div>
        </div>
        <div className="at-box">
          {kycData.userType === "INDIVIDUAL"
            ? this.Individual(kycData).map((i) => (
                <div key={i.name} className="at-message">
                  <div className="user">{i.name}</div>
                  <div className="message">
                    {visible ? i.message : "**********"}
                  </div>
                </div>
              ))
            : this.Corporate(kycData).map((i) => (
                <div key={i.name} className="at-message">
                  <div className="user">{i.name}</div>
                  <div className="message">
                    {visible ? i.message : "**********"}
                  </div>
                </div>
              ))}
        </div>
        <div className="ver3" onClick={() => setLevel()}>
          {intl.formatMessage({ id: "Continue_Lv3" })}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ActivationLv2));

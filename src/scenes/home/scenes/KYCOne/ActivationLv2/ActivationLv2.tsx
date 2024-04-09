import React, { Component } from 'react';
import { connect } from 'react-redux';

import { WrappedComponentProps, injectIntl } from 'react-intl';
import hide from 'assets/image/hide.svg';
import KycShow from 'assets/image/KycShow.svg';
import './ActivationLv2.scss';
import moment from 'moment';
import country from '../Level2/countries.json';
import { IcorpData, IKycData } from '../type';
import { getGoogleFiles } from 'service/http/http';

interface IActiveLv2 {
  visible: boolean;
  userType: string;
}
interface IActiveLv2Props {
  kycData: any;
}

type IActivationLvPropsState = ReturnType<typeof mapStateToProps> &
IActiveLv2Props & WrappedComponentProps;

export class ActivationLv2 extends Component<
  IActivationLvPropsState,
  IActiveLv2
> {
  constructor(props: IActivationLvPropsState) {
    super(props);
    this.state = {
      visible: false,
      userType: '',
    };
  }
  onImgClick = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  getFilelse = (fileObj: any) => {
    getGoogleFiles(fileObj);
  }
  countryLocal = (locale: string) => {
    const { SwitchLanguage } = this.props;
    console.log(locale);
    const _data = country.filter((i) => i.locale === locale);
    if (_data && _data.length > 0) {
      return SwitchLanguage === "en" ? _data[0].en : _data[0].zh;
    }
    return locale;
  };
  Individual = (data: IKycData) => {
    const { intl } = this.props;
    return [
      {
        name: intl.formatMessage({ id: 'User' }),
        message: intl.formatMessage({ id: 'Individual' }),
      },
      {
        name: intl.formatMessage({ id: 'Address' }),
        message: data.address,
      },
      {
        name: intl.formatMessage({ id: 'Country' }),
        message: this.countryLocal(data.residenceCountry)
      },
      {
        name: intl.formatMessage({ id: 'Note' }),
        message: data.note,
      },
      {
        name: intl.formatMessage({ id: 'Files' }),
        message: data.googleFiles,
      }
    ];
  };
  Corporate = (data: IcorpData) => {
    const { intl } = this.props;
    return [
      {
        name: intl.formatMessage({ id: 'User' }),
        message: intl.formatMessage({ id: 'Corporate' }),
      },
      {
        name: intl.formatMessage({ id: 'Company_name' }),
        message: data.companyName,
      },
      {
        name: intl.formatMessage({ id: 'Incorporation_date' }),
        message: data.incorporationDate ? moment(data.incorporationDate).format('YYYY-MM-DD') : "",
      },
      {
        name: intl.formatMessage({ id: 'Incorporation_Country' }),
        message: this.countryLocal(data.incorporationCountry),
      },
      {
        name: intl.formatMessage({ id: 'Files' }),
        message: data.googleFiles,
      }
    ];
  };

  userUploadFile = (item: any) => {
    const { visible } = this.state;
    if (item && item.length > 0) {
      return item.map((item: any) => {
        return visible ? <p className="file-download" onClick={() =>{ this.getFilelse(item)}}>{item.fileName}</p> : <p className="file-download-null">**********</p>
       })
    }
  }

  corporateComment = () => {
    const { kycData } = this.props;
    const { visible } = this.state;
    return <>
      <div  className="at-box">
      {this.Corporate(kycData).map((i) => (
          <div key={i.name} className="at-message">
            <div className="user">{i.name}</div>
            <div className="message">
              {i.name === "Files" ? i.message && this.userUploadFile(i.message) : (visible ? i.message : '**********')}
            </div>
          </div>
        ))}
      </div>

    </>
  }

  individualComment = () => {
    const { kycData } = this.props;
    const { visible } = this.state;
    return <>
      <div  className="at-box">
      {this.Individual(kycData).map((i) => (
        <div key={i.name} className="at-message">
          <div className="user">{i.name}</div>
          <div className="message">
              {i.name === "Files" ? (
                i.message && this.userUploadFile(i.message)
              ): visible ? i.message : '**********'}
          </div>
        </div>
      ))}
      </div>
    </>
  }

  typeCommont = () => {
    const { kycData } = this.props;

    if (kycData) {
      switch(kycData.type) {
        case "INDIVIDUAL": 
          return this.individualComment();
        case "CORPORATE":
          return this.corporateComment();
        default:
          return this.individualComment();
      }
    } else if (kycData && kycData.type) {
      
    }

  }
  render() {
    const { intl } = this.props;
    const { visible } = this.state;
    return (
      <div className="at-lv2">
        <div className="basic-info">
          <div className="info">
            {intl.formatMessage({ id: 'Basic_Info' })}{' '}
            <img
              onClick={this.onImgClick}
              src={visible ? KycShow : hide}
              alt="visable"
            />
          </div>
          <div className="ba-id">{intl.formatMessage({ id: 'with_id' })}</div>
        </div>
        {this.typeCommont()}
      </div>
    );
  }
}

const mapStateToProps = (state: IGlobalT) => ({
  SwitchLanguage: state.SwitchLanguage
});
const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ActivationLv2));

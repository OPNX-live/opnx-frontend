import React, { Component } from "react";
import { connect } from "react-redux";
import { WrappedComponentProps, injectIntl } from "react-intl";
import activeLevel2 from "assets/image/activeLevel2.png";
import {
  Form,
  Input,
  Button,
  Row,
  Select,
  message,
  DatePicker,
  Modal
} from "antd";
import { ReactComponent as Date } from "assets/image/date-lint.svg";
import "./Level2.scss";
import { submitCorporKyc, submitInforKyc } from "service/http/http";
import moment from "moment";
import { IcorpData } from "../ActivationLv2/type";
import { IKycData } from "../type";
import { messageError } from "utils";
import country from "./countries.json";
import ManualReview from "../ManualReview/ManualReview";
import { FormInstance } from "antd/lib/form";
import { errorMessage } from "./error";
// import idCard from "assets/image/idCard1.png";

interface ILevel2State {
  loading: boolean;
  selected: string;
  visable: boolean;
  failCount: number;
  errorCode: IerrorCode[];
  fileList: any;
  previewVisible: boolean;
  previewImage: any;
  previewTitle: string;
  twoFileList: any;
}
interface IerrorCode {
  code: string;
  filedName: string;
  message: string;
}
interface ILevelProps {
  kycData: IcorpData | IKycData;
  onCallBack: () => void;
  authorization: string;
}
function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
type ILevelPropsState = ReturnType<typeof mapStateToProps> &
  ILevelProps &
  WrappedComponentProps;
export class Level2 extends Component<ILevelPropsState, ILevel2State> {
  private formRef: React.RefObject<FormInstance> | null | undefined =
    React.createRef();
  constructor(props: ILevelPropsState) {
    super(props);
    this.state = {
      loading: false,
      selected: "Individual",
      visable: false,
      failCount: 0,
      errorCode: [],
      fileList: [],
      previewVisible: false,
      previewImage: "",
      previewTitle: "",
      twoFileList: []
    };
  }
  onFinish = (e: any) => {
    const { selected } = this.state;
    const { onCallBack } = this.props;
    let data = e;
    delete data.User;
    this.setState({
      loading: true
    });
    if (selected === "Corporate") {
      const incorporationCountry = country.filter(
        (i) => i.en === data.incorporationCountry
      )[0].locale;
      data = {
        ...data,
        incorporationDate: moment(e.incorporationDate).utc().valueOf(),
        incorporationCountry
      };
      submitCorporKyc(data).then((res) => {
        this.setState({
          loading: false
        });
        if (res.success) {
          message.info(
            this.props.intl.formatMessage({
              id: "success",
              defaultMessage: "success"
            })
          );
          onCallBack();
        } else {
          if (res.code === "0001") {
            this.setState({
              errorCode: res.data,
              failCount: res.data.failCount
            });
            const fromError: any = [];
            res.data.errorMessage !== null &&
              res.data.errorMessage.map((i: IerrorCode) => {
                return fromError.push({
                  name: i.filedName,
                  errors: [errorMessage(i.code)]
                });
              });
            setTimeout(() => {
              this.formRef?.current?.setFields(fromError);
            }, 0);
          } else {
            message.warning(res.message);
            res.code === "25018" && this.setState({ failCount: 2 });
          }
        }
      });
    } else {
      const nationality = country.filter((i) => i.en === data.nationality)[0]
        .locale;
      const kycCountry = country.filter((i) => i.en === data.country)[0].locale;
      data = {
        ...data,
        idExpiryDate: moment(e.idExpiryDate).utc().valueOf(),
        birthDate: moment(e.birthDate).utc().valueOf(),
        nationality,
        country: kycCountry
      };
      submitInforKyc(data).then((res) => {
        this.setState({
          loading: false
        });
        if (res.success) {
          message.info(
            this.props.intl.formatMessage({
              id: "success",
              defaultMessage: "success"
            })
          );
          onCallBack();
        } else {
          if (res.code === "0001") {
            this.setState({
              errorCode: res.data,
              failCount: res.data.failCount
            });
            const fromError: any = [];
            res.data.errorMessage !== null &&
              res.data.errorMessage.map((i: IerrorCode) => {
                return fromError.push({
                  name: i.filedName,
                  errors: [errorMessage(i.code)]
                });
              });
            setTimeout(() => {
              this.formRef?.current?.setFields(fromError);
            }, 0);
          } else {
            message.warning(res.message);
            res.code === "25018" && this.setState({ failCount: 2 });
          }
        }
      });
    }
  };
  handleChange = (info: any) => {
    this.setState({
      fileList: info.fileList
    });
  };
  twohandleChange = async (info: any) => {
    this.setState({
      twoFileList: info.fileList
    });
  };
  // KycUpdate
  onChange = (e: string) => {
    this.setState({
      selected: e
    });
  };
  disabledDate = (date: any) => {
    if (
      (moment(date).valueOf() - moment().valueOf()) / (1000 * 60 * 60 * 24) >
      60
    ) {
      return false;
    }
    return true;
  };
  dtDisabledDate = (date: any) => {
    if (
      moment(date).valueOf() + 1000 * 60 * 60 * 24 * 365 * 18 <
      moment().valueOf()
    ) {
      return false;
    }
    return true;
  };
  componentDidUpdate(props: ILevelPropsState) {
    if (props.kycData !== this.props.kycData) {
      this.setFromData();
      this.setFailCount();
    }
  }
  componentDidMount() {
    this.setFromData();
    this.setFailCount();
  }
  setFailCount = () => {
    const { kycData } = this.props;
    if (kycData.level) {
      const arr = kycData.kycInfo.filter((i) => i.level === "2");
      if (arr.length && arr[0].amount === 0) {
        this.setState({
          failCount: 2
        });
      }
    }
  };
  setFromData = () => {
    const { kycData } = this.props;
    if (kycData.userType && kycData.userType === "INDIVIDUAL") {
      const data: IKycData = kycData as IKycData;
      if (Object.entries(kycData).length && data.idSerialNumber) {
        setTimeout(() => {
          this.formRef?.current?.setFieldsValue({
            surname: data.superName,
            middleName: data.middleName,
            lastName: data.lastName,
            birthDate: moment(data.dateOfBirth),
            nationality: this.countryLocal(data.nationality),
            country: this.countryLocal(data.countryOfResidence),
            idType: data.idType,
            idExpiryDate: moment(data.idExpiryDate),
            idSerialNumber: data.idSerialNumber,
            salutation: data.salutation
          });
        }, 0);
      }
    } else if (kycData.userType && kycData.userType === "CORPORATE") {
      const data: IcorpData = kycData as IcorpData;
      if (Object.entries(data).length && data.companyName) {
        this.formRef?.current?.setFieldsValue({
          companyName: data.companyName,
          incorporationDate: moment(data.incorporationDate),
          incorporationCountry: this.countryLocal(data.incorporationCountry),
          incorporationNumber: data.incorporationNumber
        });
      }
    }
  };
  countryLocal = (locale: string) => {
    return country.filter((i) => i.locale === locale)[0].en;
  };
  formError = (errorMessage: IerrorCode[], code: string) => {
    return errorMessage.filter((i) => i.filedName === code);
  };
  personal = (data: IKycData, errorCode: IerrorCode[]) => {
    const { intl } = this.props;
    return (
      <>
        {/* 第二列 */}
        <Row>
          <Form.Item
            label={intl.formatMessage({ id: "First_Name" })}
            name="surname"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "first_name" })
              },
              { max: 32 }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Middle_Name" })}
            name="middleName"
            rules={[{ max: 32 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Last_Name" })}
            name="lastName"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "last_name" })
              },
              { max: 32 }
            ]}
          >
            <Input />
          </Form.Item>
        </Row>
        {/* 第三列 */}
        <Row>
          <Form.Item
            label={intl.formatMessage({ id: "birth_date" })}
            name="birthDate"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "Please_Choose" })
              }
            ]}
          >
            <DatePicker
              allowClear={false}
              placeholder=""
              disabledDate={this.dtDisabledDate}
              getPopupContainer={(e) => e}
              suffixIcon={<Date />}
            />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Nationality" })}
            name="nationality"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "Please_Choose" })
              }
            ]}
          >
            <Select showSearch>
              {country.map((i) => {
                return (
                  <Select.Option key={i.en} value={i.en}>
                    {i.en}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Country" })}
            name="country"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "Please_Choose" })
              }
            ]}
          >
            <Select showSearch>
              {country.map((i) => {
                return (
                  <Select.Option key={i.en} value={i.en}>
                    {i.en}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Row>

        {/* 第四列 */}
        <Row>
          <Form.Item
            label={intl.formatMessage({ id: "id_type" })}
            name="idType"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "Please_Choose" })
              }
            ]}
          >
            <Select>
              <Select.Option value="ID Card">
                {intl.formatMessage({ id: "ID card" })}
              </Select.Option>
              <Select.Option value="Passport">
                {intl.formatMessage({ id: "Passport" })}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "id_kyc_number" })}
            name="idSerialNumber"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "idSerialNumber" })
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "id_date" })}
            name="idExpiryDate"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "select_data" })
              }
            ]}
          >
            <DatePicker
              allowClear={false}
              placeholder=""
              disabledDate={this.disabledDate}
              getPopupContainer={(e) => e}
              suffixIcon={<Date />}
            />
          </Form.Item>
        </Row>
        {/* //第五列 */}
        {/* <Row>
          <Form.Item
            label="Front photo"
            name="IdCard"
            rules={[{ required: true, message: "Please upload pictures" }]}
          >
            <Upload
              name="file"
              action={`${process.env.REACT_APP_HTTP_URL}dbworker/protected/upload?type=idType`}
              headers={{
                "upload-authorization": authorization,
                "xOPNXtoken": users.token,
              }}
              listType="picture-card"
              beforeUpload={this.beforeUpload}
              onChange={this.handleChange}
              onPreview={this.handlePreview}
            >
              {fileList.length >= 1 ? null : (
                <div
                  className="update-img"
                  style={{
                    backgroundImage: `url(${idCard})`,
                    backgroundSize: "100%",
                  }}
                >
                  <div>+</div>
                  <div>Front photo</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            label="Back photo"
            name="IdCards"
            rules={[{ required: true, message: "Please upload pictures" }]}
          >
            <Upload
              name="file"
              action={`${process.env.REACT_APP_HTTP_URL}dbworker/protected/upload?type=idType`}
              headers={{
                "upload-authorization": authorization,
                "xOPNXtoken": users.token,
              }}
              listType="picture-card"
              beforeUpload={this.beforeUpload}
              onChange={this.twohandleChange}
              onPreview={this.handlePreview}
            >
              {twoFileList.length >= 1 ? null : (
                <div
                  className="update-img"
                  style={{
                    backgroundImage: `url(${idCard1})`,
                    backgroundSize: "100%",
                  }}
                >
                  <div>+</div>
                  <div>Back photo</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Row> */}
        {/* <div className="kyc-img-me">
          Front&Back photo of your ID card/Passport：
          <br />
          ·Please make sure the content of the photo is complete and clearly
          visible
          <br />
          ·Only support JPG、PNG picture format
          <br />
          ·Picture size can’t exceed 4M
        </div> */}
      </>
    );
  };
  beforeUpload = (file: any, fileList: any) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 4;
    if (!isLt2M) {
      message.error("Image must smaller than 4MB!");
    }
    return isJpgOrPng && isLt2M;
  };
  enterprise = (data: IcorpData, errorCode: IerrorCode[]) => {
    const { intl } = this.props;
    return (
      <>
        <Row>
          <Form.Item
            label={intl.formatMessage({ id: "Company_name" })}
            name="companyName"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "Company_Name" })
              },
              { max: 128 }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Incorporation_date" })}
            name="incorporationDate"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "incorporation_date" })
              }
            ]}
          >
            <DatePicker
              allowClear={false}
              placeholder=""
              disabledDate={(date) => {
                if (moment(date as any).valueOf() < moment().valueOf()) {
                  return false;
                }
                return true;
              }}
              suffixIcon={<Date />}
            />
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            label={intl.formatMessage({ id: "Incorporation_Country" })}
            name="incorporationCountry"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "incorporation_Country" })
              }
            ]}
          >
            <Select showSearch>
              {country.map((i) => {
                return (
                  <Select.Option key={i.en} value={i.en}>
                    {i.en}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Incorporation_number" })}
            name="incorporationNumber"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "incorporation_number" })
              },
              { max: 128 }
            ]}
          >
            <Input />
          </Form.Item>
        </Row>
      </>
    );
  };
  handlePreview = async (file: any) => {
    const res = await getBase64(file.originFileObj);
    this.setState({
      previewImage: res,
      previewVisible: true,
      previewTitle: file.name
    });
  };
  selectFrom = (
    type: string,
    params: IcorpData | IKycData | {},
    errorCode: IerrorCode[]
  ) => {
    switch (type) {
      case "Individual":
        return this.personal(params as IKycData, errorCode);
      case "Corporate":
        return this.enterprise(params as IcorpData, errorCode);
      default:
        return this.personal(params as IKycData, errorCode);
    }
  };
  closeModel = () => {
    this.setState({
      visable: false
    });
  };
  onManual = () => {
    this.setState({ visable: true });
  };
  render() {
    const { kycData, intl } = this.props;
    const {
      loading,
      failCount,
      selected,
      visable,
      errorCode,
      previewVisible,
      previewImage,
      previewTitle
    } = this.state;
    return (
      <div className="kyc-level2">
        <div className="level-box">
          <img src={activeLevel2} alt="level1" />
          {intl.formatMessage({ id: "level2" })}
        </div>
        <div className="basic-info">
          <div className="info">{intl.formatMessage({ id: "Basic_Info" })}</div>
          <div className="ba-id">{intl.formatMessage({ id: "with_id" })}</div>
        </div>
        <Form
          labelAlign="left"
          name="basic"
          layout={"vertical"}
          initialValues={{ remember: true }}
          onFinish={this.onFinish}
          ref={this.formRef}
        >
          {/* 第一列 */}
          <Row>
            <Form.Item
              label={intl.formatMessage({ id: "User" })}
              name="User"
              rules={[{ required: true }]}
              initialValue="Individual"
            >
              <Select onChange={this.onChange}>
                <Select.Option value="Individual">
                  {intl.formatMessage({ id: "Individual" })}
                </Select.Option>
                <Select.Option value="Corporate">
                  {intl.formatMessage({ id: "Corporate" })}
                </Select.Option>
              </Select>
            </Form.Item>
            {selected === "Individual" && (
              <Form.Item
                label={intl.formatMessage({ id: "Salutation" })}
                name="salutation"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: "kyc_salutation" })
                  }
                ]}
              >
                <Select>
                  <Select.Option value="Miss">Ms</Select.Option>
                  <Select.Option value="Mr">Mr</Select.Option>
                </Select>
              </Form.Item>
            )}
          </Row>
          {this.selectFrom(selected, kycData, errorCode)}
          <Form.Item className="kyc-btn">
            <Button
              type="primary"
              disabled={failCount === 2 ? true : false}
              loading={loading}
              htmlType="submit"
            >
              {intl.formatMessage({ id: "Submit" })}
            </Button>
          </Form.Item>
        </Form>
        {failCount === 2 && (
          <div className="manual-review" onClick={this.onManual}>
            {intl.formatMessage({ id: "Manual_review" })} {">"}
          </div>
        )}
        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={() => this.setState({ previewVisible: false })}
        >
          <img alt="example" style={{ width: "100%" }} src={previewImage} />
        </Modal>
        {visable && (
          <ManualReview visable={visable} onCloseModel={this.closeModel} />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: { users: Iusers }) => ({
  users: state.users
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Level2));

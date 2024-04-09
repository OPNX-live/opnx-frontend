import React, { Component } from "react";
import { connect } from "react-redux";
import { WrappedComponentProps, injectIntl } from "react-intl";
import {
  Form,
  Input,
  Button,
  Row,
  Select,
  message,
  DatePicker,
  Upload,
  Modal,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons/lib/icons";
import { ReactComponent as Date } from "assets/image/date-lint.svg";
import "./Level2.scss";
import {
  usKycDataSubmit,
  usKycDataUpdate,
  getGoogleFiles,
} from "service/http/http";
import moment from "moment";
import { IKycData, IcorpData, IGoogleFiles } from "../type";
import { messageError } from "utils";
import country from "./countries.json";

import ManualReview from "../ManualReview/ManualReview";
import { FormInstance } from "antd/lib/form";
import { errorMessage } from "./error";
interface ILevel2State {
  loading: boolean;
  userType: string;
  address: string;
  residenceCountry: string;
  incorporationDate: string;
  incorporationCountry: string;
  companyName: string;
  visable: boolean;
  failCount: number;
  errorCode: IerrorCode[];
  previewVisible: boolean;
  previewImage: any;
  previewTitle: string;
  enterpriseFileList: any;
  personalFileList: any;
  personalFileBinary: any;
  downloadLoading: boolean;
  onlyRead: boolean;
  acceptFile: string;
  deleteFiles: [];
  disableSubmit: boolean;
  disableCountry: boolean;
  googleFiles: any;
}

interface IerrorCode {
  code: string;
  filedName: string;
  message: string;
}
interface ILevelProps {
  kycData: IcorpData | IKycData;
  onCallBack: () => void;
  onChangeKycData: Function;
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
      visable: false,
      failCount: 0,
      errorCode: [],
      enterpriseFileList: [],
      personalFileList: [],
      personalFileBinary: "",
      previewVisible: false,
      previewImage: "",
      previewTitle: "",
      userType: "INDIVIDUAL",
      address: "",
      residenceCountry: "",
      incorporationDate: "",
      incorporationCountry: "",
      companyName: "",
      downloadLoading: false,
      onlyRead: false,
      deleteFiles: [],
      disableSubmit: false,
      disableCountry: false,
      googleFiles: [],
      acceptFile: ".jpeg,.png,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
  }

  onFinish = async (e: any) => {
    this.setState({
      loading: true,
    });
    const { personalFileList, enterpriseFileList } = this.state;
    const { kycData } = this.props;
    const userType = e.userType;
    let hasFile: boolean = false;
    let fromName: string = "CorporateKYCFile";
    if (!kycData) {
      if (userType === "INDIVIDUAL") {
        if (personalFileList.length === 0) {
          hasFile = false;
        } else {
          hasFile = true;
        }
        fromName = "AddressProof";
      } else {
        if (enterpriseFileList.length === 0) {
          hasFile = false;
        } else {
          hasFile = true;
        }
      }
    } else {
      hasFile = kycData.googleFiles.length > 0;
    }

    if (!hasFile) {
      const fromError: any = [];
      fromError.push({
        name:fromName,
        errors: [
          this.props.intl.formatMessage({
            id: "Please upload file proof is valid",
            defaultMessage: "Please upload file proof is valid",
          }),
        ],
      });
      setTimeout(() => {
        this.formRef?.current?.setFields(fromError);
      }, 0);
      this.setState({
        loading: false,
      });
      return;
    }

    // 如果 userType=INDIVIDUAL：userType=INDIVIDUAL&address=dddd&residenceCountry=ddd&files=

    if (userType === "INDIVIDUAL") {
      this.individualSubmit(e);
    } else {
      this.corporateSubmit(e);
    }
  };

  individualSubmit = async (e: any) => {
    const { personalFileList, googleFiles } = this.state;
    const { onCallBack, kycData } = this.props;
    const data = e;
    const userType = e.userType;
    const formData = new FormData();
    // if ((personalFileList && personalFileList.length > 0) || (kycData.googleFiles && kycData.googleFiles.length > 0)) {
      const incorporationCountry = country.filter(
        (i) => i.en === data.country
      )[0].locale;

      formData.append("userType", userType);
      formData.append("address", data.address);
      formData.append("residenceCountry", incorporationCountry);
      if (
        kycData &&
        kycData.status === "REJECTED"
      ) {
        googleFiles.forEach((el: IGoogleFiles) => {
          formData.append("fileIds", el.fileId);
        });
      }
      formData.append(
        "files",
        new Blob([personalFileList[0].originFileObj]),
        personalFileList[0].name
      );
      // formData.append("files", new Blob([personalFileList[0].originFileObj]), personalFileList[0].name);
      // console.log(formData);
      

      const res =
        kycData && kycData.status === "REJECTED"
          ? await usKycDataUpdate(formData)
          : await usKycDataSubmit(formData);

      if (res) {
        this.setState({
          loading: false,
        });
        // console.log(res);
        if (res.success) {
          message.info(
            this.props.intl.formatMessage({
              id: "success",
              defaultMessage: "success",
            })
          );

          this.setState({
            personalFileList: [],
          });
          setTimeout(() => {
            onCallBack();
          }, 0);
        } else {
          if (res.code === "0001") {
            this.setState({
              errorCode: res.data,
              failCount: res.data.failCount,
            });
            const fromError: any = [];
            res.data.errorMessage !== null &&
              res.data.errorMessage.map((i: IerrorCode) => {
                return fromError.push({
                  name: i.filedName,
                  errors: [errorMessage(i.code)],
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
      }
      this.setState({
        loading: false,
      });
   /* } else {
      const fromError: any = [];
      fromError.push({
        name: "AddressProof",
        errors: [
          this.props.intl.formatMessage({
            id: "Please upload an address proof image",
            defaultMessage: "Please upload an address proof image",
          }),
        ],
      });
      setTimeout(() => {
        this.formRef?.current?.setFields(fromError);
      }, 0);
      this.setState({
        loading: false,
      });
    }*/
  };

  corporateSubmit = async (e: any) => {
    const { enterpriseFileList, googleFiles } = this.state;
    const { onCallBack, kycData } = this.props;
    const data = e;
    const userType = e.userType;
    const formData = new FormData();

    // if ((enterpriseFileList && enterpriseFileList.length > 0) || (kycData.googleFiles && kycData.googleFiles.length >0)) {
      const incorporationCountry = country.filter(
        (i) => i.en === data.incorporationCountry
      )[0].locale;

      // 如果 userType=CORPORATE ：userType=CORPORATE&incorporationDate=22222222&incorporationCountry=wwww&companyName=dddd&files=
      /*
        companyName
        incorporationDate
        incorporationCountry
      */
      const date = data.incorporationDate
        ? moment(data.incorporationDate).format("x")
        : "";

      formData.append("userType", userType);
      formData.append("incorporationDate", date);
      formData.append("incorporationCountry", incorporationCountry);
      formData.append("companyName", data.companyName);
      if (
        kycData &&
        kycData.status === "REJECTED"
      ) {
        googleFiles.forEach((el: IGoogleFiles) => {
          formData.append("fileIds", el.fileId);
        });
      }
      enterpriseFileList.forEach((el: any) => {
        formData.append("files", new Blob([el.originFileObj]), el.name);
      });

      // formData.append("files", new Blob([personalFileList[0].originFileObj]), personalFileList[0].name);
      // console.log(formData);
      const res =
        kycData && kycData.status === "REJECTED"
          ? await usKycDataUpdate(formData)
          : await usKycDataSubmit(formData);

      if (res) {
        if (res.success) {
          message.info(
            this.props.intl.formatMessage({
              id: "success",
              defaultMessage: "success",
            })
          );
          this.setState({
            enterpriseFileList: [],
          });
          setTimeout(() => {
            onCallBack();
          }, 0);
        } else {
          if (res.code === "0001") {
            this.setState({
              errorCode: res.data,
              failCount: res.data.failCount,
            });
            const fromError: any = [];
            res.data.errorMessage !== null &&
              res.data.errorMessage.map((i: IerrorCode) => {
                return fromError.push({
                  name: i.filedName,
                  errors: [errorMessage(i.code)],
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
      }
      this.setState({
        loading: false,
      });
   /* } else {
      const fromError: any = [];
      fromError.push({
        name: "CorporateKYCFile",
        errors: [
          this.props.intl.formatMessage({
            id: "Please upload file proof is valid",
            defaultMessage: "Please upload file proof is valid",
          }),
        ],
      });
      setTimeout(() => {
        this.formRef?.current?.setFields(fromError);
      }, 0);
      this.setState({
        loading: false,
      });
    }*/
  };

  handleChange = (info: any) => {
    // enterpriseFileList: [],
    // personalFileList: [],
    this.setState({
      personalFileList: info.fileList,
    });
  };
  twohandleChange = async (info: any) => {
    this.setState({
      enterpriseFileList: info.fileList,
    });
  };
  // KycUpdate
  onChange = (e: string) => {
    const { disableSubmit } = this.state;
    // const { kycData } = this.props;

    if (!disableSubmit) {
      this.setState({
        userType: e,
      });
    }

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
    }
  }
  componentDidMount() {
    this.setFromData();
  }

  getFilelse = (fileObj: any) => {
    getGoogleFiles(fileObj);
  };

  dummyRequest = (data: any) => {
    setTimeout(() => {
      console.log(data);
    }, 0);
  };
  setFromData = () => {
    const { kycData } = this.props;
   // console.log(kycData);
    if (kycData && kycData.type) {
      this.setState({
        userType: kycData.type,
      });
      if (kycData.type === "INDIVIDUAL") {
        const data: IKycData = kycData as IKycData;
        const countryValue =  this.countryLocal(data.residenceCountry);
        setTimeout(() => {
          this.formRef?.current?.setFieldsValue({
            address: data.address,
            userType: data.type,
            country: countryValue,
          });
        }, 0);
      } else if (kycData.type === "CORPORATE") {
        const data: IcorpData = kycData as IcorpData;
        this.formRef?.current?.setFieldsValue({
          userType: data.type,
          companyName: data.companyName,
          incorporationDate: moment(data.incorporationDate),
          incorporationCountry:
            data.incorporationCountry &&
            this.countryLocal(data.incorporationCountry),
        });
      }
      this.setState({
        googleFiles: kycData.googleFiles
      })
    }
    if (kycData && kycData.status === "NEW") {
      this.setState({
        disableSubmit: true
      })
    }
  };
  countryLocal = (locale: string) => {
    const cn = country.filter((i) => i.locale === locale);
    if (cn && cn.length > 0) return cn[0].en
    return "";
  };
  formError = (errorMessage: IerrorCode[], code: string) => {
    return errorMessage.filter((i) => i.filedName === code);
  };

  deleteFile = (file: IGoogleFiles) => {
    const { googleFiles } = this.state;
    const newFileList: IGoogleFiles[] = googleFiles.filter(
      (el: IGoogleFiles) => el.fileId !== file.fileId
    );
    console.log(newFileList);
    /*this.props.onChangeKycData({
      ...kycData,
      googleFiles: newFileList,
    });*/
    this.setState({
      googleFiles: newFileList
    })
  };

  fileDownload = () => {
    const { disableSubmit, googleFiles } = this.state;
    if (googleFiles) {
      return googleFiles.map((item: IGoogleFiles, index: any) => {
        return (
          <div key={`files_index_${index}`} className="file-list">
            <p
              key={`${item.fileName}_${index}`}
              className="file-download"
              onClick={() => {
                this.getFilelse(item);
              }}
            >
              {item.fileName}
            </p>
            <span
              className={`file-list-delete ${disableSubmit ? "no-file-list" : ""}`}
              onClick={() => {
                  this.deleteFile(item);
              }}
            >
              <DeleteOutlined />
            </span>
          </div>
        );
      });
    }
  };

  personalCountry = () => {
    const { kycData, SwitchLanguage } = this.props;
    
    if (kycData && kycData.status === "NEW") {
      const data: IKycData = kycData as IKycData;
        return <Select defaultValue={this.countryLocal(data.residenceCountry)} open={false}><Select.Option value={this.countryLocal(data.residenceCountry)}>{this.countryLocal(data.residenceCountry)}</Select.Option> </Select>
    } else {
      return (
        <Select>
        {country.map((i: any) => {
          return (
            <Select.Option key={i.en} value={i.en}>
              {SwitchLanguage === "zh" ? i.zh : i.en}
            </Select.Option>
          );
        })}
      </Select>
      )
    }
  }
  //
  personal = (data: IKycData, selectType: any, errorCode: IerrorCode[]) => {
    const { intl, kycData } = this.props;
    const { personalFileList, acceptFile, disableSubmit } = this.state;
    return (
      <>
        {/* 第三列 */}
        <Row>
          {selectType}
          <Form.Item
            label={intl.formatMessage({ id: "Address" })}
            name="address"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "Address" }),
              },
              { max: 32 },
            ]}
          >
            <Input disabled={disableSubmit} />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Country" })}
            name="country"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "Please_Choose" }),
              },
            ]}
          >
            {this.personalCountry()}
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            label={intl.formatMessage({ id: "Address Proof" })}
            name="AddressProof"
            className="page-upload-file"
            rules={[{ message: "Please upload file" }]}
          >
            <Upload
              name="file"
              disabled={disableSubmit}
              accept={acceptFile}
              customRequest={this.dummyRequest}
              directory={false}
              showUploadList={{ showDownloadIcon: false }}
              listType="picture-card"
              beforeUpload={this.beforeUpload}
              fileList={personalFileList}
              onChange={this.handleChange}
              onPreview={this.handlePreview}
            >
              {personalFileList.length >= 1 ? null : (
                <div
                  className="update-img"
                  style={{
                    backgroundSize: "100%",
                  }}
                >
                  <div>+</div>
                  <div>{intl.formatMessage({ id: "Click to Upload" })}</div>
                </div>
              )}
            </Upload>
            <div className="address-proof-text">
              <p>{intl.formatMessage({ id: "Address proof (dated within the last 3 months) can be:" })} </p>
              <ul className="kyc-new-list">
                <li>
                  {intl.formatMessage({ id: "a utility bill (e.g. gas, electricity, water, broadband, television);" })}{" "}
                </li>
                <li>
                  {intl.formatMessage({ id: "a letter from a Government body;" })}{" "}
                </li>
                <li>
                  {intl.formatMessage({ id: "a personal bank statement; or" })}{" "}
                </li>
                <li>
                  {intl.formatMessage({ id: "a government-issued ID with address." })}{" "}
                </li>
              </ul>
            </div>
          </Form.Item>
        </Row>
        {kycData && kycData.googleFiles ? (
          <Row>
            <div className="reason-lable">
              {intl.formatMessage({ id: "files" })}:
            </div>
            {this.fileDownload()}
          </Row>
        ) : null}

        {kycData && kycData.status !== "NEW" ? (
          <Row className="reason-lable">
            {intl.formatMessage({ id: "remark" })} :
            <p className="note-error"> {kycData.note}</p>
          </Row>
        ) : null}
        {/* 第四列 */}

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
    const { intl } = this.props;
   
    //  || file.type === "application/pdf"
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "application/pdf" ||
      file.type === "text/plain" ||
      file.type === "text/rtf" ||
      file.type === "application/vnd.oasis.opendocument.text" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/epub+zip" ||
      file.type === "application/msword" ||
      file.type === "video/webm";
    if (!isJpgOrPng) {
      message.error(
        intl.formatMessage({
          id: "Please upload document or image is valid",
        })
      ); // /PDF
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error(
        intl.formatMessage({
          id: "File must smaller than 5MB",
        })
      );
    }
    
    return false;
    // return isJpgOrPng && isLt2M; // Please upload document or image is valid File must smaller than 5MB
  };

  enterprise = (data: IcorpData, selectType: any, errorCode: IerrorCode[]) => {
    const { intl, kycData, SwitchLanguage } = this.props;
    const { enterpriseFileList, acceptFile, disableSubmit } = this.state;
    /*
      incorporationDate
      incorporationCountry
      companyName

      companyName
      incorporationDate
      incorporationCountry
    */
    return (
      <>
        <Row>
          {selectType}
          <Form.Item
            label={intl.formatMessage({ id: "Company_name" })}
            name="companyName"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "Company_Name" }),
              },
              { max: 128 },
            ]}
          >
            <Input disabled={disableSubmit} />
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            label={intl.formatMessage({ id: "Incorporation_date" })}
            name="incorporationDate"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "incorporation_date" }),
              },
            ]}
          >
            <DatePicker
              allowClear={false}
              disabled={disableSubmit}
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
          <Form.Item
            label={intl.formatMessage({ id: "Incorporation_Country" })}
            name="incorporationCountry"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "incorporation_Country" }),
              },
            ]}
          >
            <Select showSearch>
              {country.map((i: any) => {
                return (
                  <Select.Option key={i.en} value={i.en}>
                    {SwitchLanguage === "zh" ? i.zh : i.en}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Information required for institutional account：",
            })}
            name="CorporateKYCFile"
            className="page-upload-file2"
            rules={[{ message: "Please upload file" }]}
          >
            <div className="kyc-template">
              <div>
                {intl.formatMessage({ id: "DownLoad" })}{" "}
                <a
                  href="https://s3.eu-west-1.amazonaws.com/OPNX.com/OPNX-Corporate-KYC-Form.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {intl.formatMessage({ id: "OPNX Corporate KYC Form" })}
                </a>
                <br />
                {intl.formatMessage({ id: "Complete it and upload it together with the corporate onboarding documents." })} <br />
                {intl.formatMessage({
                  id: " List of KYC documents can be found here",
                })}{" "}
                <br />
                <a
                  href="https://OPNX.com/corporate-onboarding/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://OPNX.com/corporate-onboarding/
                </a>
              </div>
              {/*<Button loading={downloadLoading} icon={<DownloadOutlined />} onClick={this.pdfOnDownload} id="pdfOnDownloadLink">Click download OPNX Corporate KYC Form Template</Button>*/}
            </div>

            <Upload
              disabled={disableSubmit}
              customRequest={this.dummyRequest}
              name="file"
              directory={false}
              multiple={true}
              accept={acceptFile}
              fileList={enterpriseFileList}
              beforeUpload={this.beforeUpload}
              showUploadList={{ showDownloadIcon: false }}
              onChange={this.twohandleChange}
            >
              <Button icon={<UploadOutlined />}>
                {intl.formatMessage({ id: "Click to Upload" })}
              </Button>
            </Upload>
          </Form.Item>
        </Row>
        {kycData && kycData.googleFiles ? (
          <Row>
            <div className="reason-lable">
              {intl.formatMessage({ id: "files" })}:
            </div>
            {this.fileDownload()}
          </Row>
        ) : null}

        {!disableSubmit && kycData && kycData.note? (
          <Row className="reason-lable">
            {intl.formatMessage({ id: "remark" })}:
            <p className="note-error"> {kycData.note}</p>
          </Row>
        ) : null}
      </>
    );
  };
  handlePreview = async (file: any) => {
    // if (file.type === "image/png" || file.type === "image/jpeg") {}
    const res = await getBase64(file.originFileObj);
    this.setState({
      previewImage: res,
      previewVisible: true,
      previewTitle: file.name,
    });
  };

  selectUserType = () => {
    const { intl } = this.props;
    return (
      <Form.Item
        label={intl.formatMessage({ id: "User" })}
        name="userType"
        rules={[{ required: true }]}
        initialValue={"INDIVIDUAL" }
      >
        <Select onChange={this.onChange}>
          <Select.Option value="INDIVIDUAL" key="INDIVIDUAL">
            {intl.formatMessage({ id: "Individual" })}
          </Select.Option>
          <Select.Option value="CORPORATE" key="CORPORATE">
            {intl.formatMessage({ id: "Corporate" })}
          </Select.Option>
        </Select>
      </Form.Item>
    );
  };
  selectFrom = (
    type: string,
    params: IcorpData | IKycData | {},
    errorCode: IerrorCode[]
  ) => {
    switch (type) {
      case "INDIVIDUAL":
        return this.personal(
          params as IKycData,
          this.selectUserType(),
          errorCode
        );
      case "CORPORATE":
        return this.enterprise(
          params as IcorpData,
          this.selectUserType(),
          errorCode
        );
      default:
        return this.personal(
          params as IKycData,
          this.selectUserType(),
          errorCode
        );
    }
  };

  submitButton = () => {
    const { loading, failCount } = this.state;
    const { kycData, intl } = this.props;
    if (!kycData || (kycData && kycData.status === "REJECTED")) {
      return (
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
      );
    } else {
      return null;
    }
  };
  closeModel = () => {
    this.setState({
      visable: false,
    });
  };
  onManual = () => {
    this.setState({ visable: true });
  };
  render() {
    const { kycData, intl } = this.props;
    const {
      failCount,
      userType,
      visable,
      errorCode,
      previewVisible,
      previewImage,
      previewTitle,
    } = this.state;
    return (
      <div className="kyc-level2">
        <div className="level-box"></div>
        <div className="basic-info">
          <div className="info">{intl.formatMessage({ id: "Basic_Info" })}</div>
          <div className="ba-id">{intl.formatMessage({ id: "with_id" })}</div>
        </div>
        <Form
          autoComplete="off"
          labelAlign="left"
          name="basic"
          layout={"vertical"}
          initialValues={{ remember: true }}
          onFinish={this.onFinish}
          ref={this.formRef}
        >
          {/* 第一列 */}

          {this.selectFrom(userType, kycData, errorCode)}

          {this.submitButton()}
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

const mapStateToProps = (state: IGlobalT) => ({
  users: state.users,
  SwitchLanguage: state.SwitchLanguage,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Level2));

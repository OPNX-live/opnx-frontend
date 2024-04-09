import React, { Component, memo } from "react";
import { connect } from "react-redux";
import level3 from "assets/image/level3.png";
import activelv3 from "assets/image/activelv3.png";
import { ReactComponent as Date } from "assets/image/date-lint.svg";
import { WrappedComponentProps, injectIntl } from "react-intl";
import "./Level3.scss";
import { IKyc3Data, IkycInfo } from "../type";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
  Radio,
  Upload,
  Col,
} from "antd";
import { Icorp3Data, IcorpData } from "../ActivationLv2/type";
import { IKycData } from "../type";
import moment from "moment";
import country from "../Level2/country.json";
import {
  saveKyc3Info,
  subKyc3Info,
  downloadPic,
  getIdentityLink,
  getVerificationResult,
  getSessionKey,
  getSardingVerification,
} from "service/http/http";
import { errorMessage } from "../Level2/error";
import { messageError } from "utils";
import { FormInstance } from "antd/lib/form";
import UploadSvg from "assets/image/upload.svg";
import {
  industryList,
  employmentStatusList,
  purposeList,
  individualSourceOfFundsList,
  corporateSourceOfFundsList,
  entityTypeList,
} from "./data";
import Complete from "../Complete/Complete";
import { ICYModal } from "components/modal/Modal";
import { localStorage } from "utils/storage";
import { AsYouType, CountryCode, isValidPhoneNumber } from "libphonenumber-js";
import { debounce, divide, isEqual } from "lodash";
import { country as getCountry, subdivision } from "iso-3166-2";
interface ILevel3Props {
  kycInfo: IkycInfo[];
  level: string;
  kycData: IcorpData | IKycData;
  onCallBack: () => void;
  authorization: string;
  users: Iusers;
  kyc3Data: Icorp3Data | IKyc3Data;
  nationalityList: any;
  countryList: any;
  ipBlock: boolean;
}
interface ILevel3State {
  auditState: string;
  loading: boolean;
  selected: string;
  visable: boolean;
  failCount: number;
  errorCode: IerrorCode[];
  front: any;
  back: any;
  proofOfAddress: any;
  selfie: any;
  entityFiles: any;
  previewVisible: boolean;
  previewImage: any;
  previewTitle: string;
  twoFileList: any;
  updateUi: boolean;
  modify: boolean;
  isIndentityVerify: boolean;
  doucumentLink: string | null;
  isOpenIndentityLink: boolean;
  visibilityState: string;
  sessionKey: string;
  sardingDocumentResult: string;
  linkLoading: boolean;
  code: any;
  uploading: boolean;
}
interface IerrorCode {
  code: string;
  filedName: string;
  message: string;
}
const environment = process.env.REACT_APP_SARDING_ENV;
const sardingApi = process.env.REACT_APP_SARDING_URL;
const clientId = process.env.REACT_APP_SARDINE_CLIENTID;
export class Level2 extends Component<
  WrappedComponentProps & ILevel3Props,
  ILevel3State
> {
  private data: any = {};
  private formRef: React.RefObject<FormInstance> | null | undefined =
    React.createRef();
  private timer: NodeJS.Timeout | null = null;
  constructor(props: WrappedComponentProps & ILevel3Props) {
    super(props);
    this.state = {
      auditState: "",
      loading: false,
      selected: "Corporate",
      visable: false,
      failCount: 0,
      errorCode: [],
      front: [],
      back: [],
      proofOfAddress: [],
      selfie: [],
      entityFiles: [],
      previewVisible: false,
      previewImage: "",
      previewTitle: "",
      twoFileList: [],
      updateUi: false,
      modify: true,
      isIndentityVerify: false,
      isOpenIndentityLink: false,
      doucumentLink: "",
      visibilityState: "",
      sessionKey: "",
      sardingDocumentResult: "",
      linkLoading: false,
      code: [],
      uploading: false,
    };
  }
  onFinish = async (e: any) => {
    const { selected, code } = this.state;
    let data = e;
    this.setState({
      loading: true,
    });
    if (selected === "Corporate") {
      const entityFilesList = [] as string[];
      this.state.entityFiles.forEach((item: any) => {
        if (item?.response?.code === "0000") {
          entityFilesList.push(item?.response?.data);
        }
      });
      console.log(e);
      data = {
        kycType: e?.kycType,
        corporateBasicInfo: {
          companyName: e?.corporateBasicInfoCompanyName,
          incorporationCountry: e?.corporateBasicInfoIncorporationCountry,
          incorporationDate: moment(
            e?.corporateBasicInfoIncorporationDate
          ).format("YYYY-MM-DD"),
          incorporationNumber: e?.corporateBasicInfoIncorporationNumber,
        },
        annualRevenue: e?.annualRevenue,
        companyValue: e?.companyValue,
        contractEmail: e?.contractEmail,
        corporateStructure: [...e.corporateStructure],
        directors: [...e.directors],
        entityType: e?.entityType,
        otherEntityType: e?.otherEntityType,
        industry: e?.industry,
        otherIndustry: e?.otherIndustry,
        listedOnExchange: e?.listedOnExchange,
        monthlyDeposit: e?.monthlyDeposit,
        monthlyWithdrawal: e?.monthlyWithdrawal,
        natureOfBusiness: e?.natureOfBusiness,
        otherTradingNames: e?.otherTradingNames,
        phoneNumber: {
          areaCode: e?.phoneNumberAreaCode,
          number: e?.phoneNumberNumber,
        },
        purpose: e?.purpose,
        otherPurpose: e?.otherPurpose,
        registeredAddress: {
          city: e?.registeredAddressCity,
          country: e?.registeredAddressCountry,
          postalCode: e?.registeredAddressPostalCode,
          street: e?.registeredAddressStreet,
          flatOrRoom: e?.registeredAddressFlatOrRoom,
          state: e.registeredAddressState,
        },
        operationAddress: {
          city: e?.operationAddressCity,
          country: e?.operationAddressCountry,
          postalCode: e?.operationAddressPostalCode,
          street: e?.operationAddressStreet,
          flatOrRoom: e?.operationAddressFlatOrRoom,
          state: e?.operationAddressState,
        },
        regulator: e?.regulator,
        sameAsOperation: e?.sameAsOperation,
        sourceOfFunds: e?.corporateSourceOfFunds,
        stockExchangeName: e?.stockExchangeName,
        proofOfAddress: e?.proofOfAddress,
        uploadId: {
          entityFiles: entityFilesList,
        },
      };
      this.submitData(data);
    } else {
      const registeredAddressState = code?.find(
        (c) => c.name === e.registeredAddressState
      );
      data = {
        kycType: e?.kycType,
        sessionKey: this.state.sessionKey,
        individualBasicInfo: {
          surname: e?.surname,
          middleName: e?.middleName,
          lastName: e?.lastName,
          salutation: e?.salutation,
          // idExpiryDate: moment(e?.idExpiryDate).utc().format("YYYY-MM-DD"),
          birthDate: moment(e?.birthDate).format("YYYY-MM-DD"),
          nationality: e?.nationality,
          country: e?.country,
          idType: e?.idType,
          idSerialNumber: e?.idSerialNumber,
        },
        registeredAddress: {
          city: e?.registeredAddressCity,
          country: e?.registeredAddressCountry,
          postalCode: e?.registeredAddressPostalCode,
          street: e?.registeredAddressStreet,
          flatOrRoom: e?.registeredAddressFlatOrRoom,
          state: registeredAddressState?.regionCode,
          stateName: registeredAddressState?.name,
        },
        phoneNumber: {
          areaCode: e?.phoneNumberAreaCode,
          number: e?.phoneNumberNumber,
        },
        containAnAddress: e?.containAnAddress,
        industry: e?.industry,
        otherIndustry: e?.otherIndustry,
        employmentStatus: e?.employment,
        purpose: e?.purpose,
        otherPurpose: e?.otherPurpose,
        sourceOfFunds: e?.individualSourceOfFunds,
        otherSourceOfFunds: e?.otherSourceOfFunds,
        savingAndInvestments: e?.savingAndInvestments,
        selfie: e?.selfie,
        proofOfAddress: e?.proofOfAddress,
        uploadId: {
          front: e?.front,
          back: e?.back,
        },
      };
    }
    if (selected === "Individual") {
      const res = await getSessionKey();
      if (res.code === "0000") {
        const w = window as any;
        const that = this;
        w._Sardine.createContext({
          clientId, // CHANGE THIS
          sessionKey: res.data, // Please CHANGE this to  pass server side generated sessionKey and you will need this again for back-end  API call
          userIdHash: that.props.users.accountId, // CHANGE this to pass internal userId or hash of email/phone. Dont pass it if its not available.
          flow: "onboarding",
          environment,
          parentElement: document.body,
          enableBiometrics: true,
          onDeviceResponse: (deviceResponse: any) => {
            that.submitData(data);
          },
        });
      }
      data.sessionKey = res.data;
    }

    this.data = data;
  };
  submitData = <T extends object>(data: T) => {
    const { onCallBack } = this.props;

    subKyc3Info(data).then(async (res) => {
      this.setState({
        loading: false,
      });
      if (res.success) {
        message.success(
          this.props.intl.formatMessage({
            id: "success",
            defaultMessage: "success",
          })
        );
        if (
          this.state.selected === "Individual" &&
          this.props.kyc3Data.idStatus === null &&
          !this.state.modify
        ) {
          this.setState({ isIndentityVerify: true });
          localStorage.set("secureModal", {
            [this.props.users.accountId]: true,
          });
        } else {
          onCallBack();
        }
        this.setState({
          modify: false,
        });
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
    });
  };
  getPic = async (url: string) => {
    try {
      const base64 = await downloadPic(url);
      const newUrl = window.URL.createObjectURL(base64);
      return newUrl;
    } catch (error) {
      console.log(error);
    }
  };
  onValuesChange = (info: any) => {
    this.setState({
      updateUi: !this.state.updateUi,
    });
  };
  handleChange = (
    info: any,
    key: "front" | "back" | "proofOfAddress" | "selfie"
  ) => {
    if (!info.file?.status) {
      return;
    }
    this.setState({
      uploading: true,
    });
    const formData = this.formRef?.current?.getFieldsValue(true);
    switch (key) {
      case "front":
        this.setState({
          [key]: info.fileList,
        });

        if (
          info.file?.status === "done" &&
          info.file?.response?.code === "0000"
        ) {
          this.formRef?.current?.setFieldsValue({
            ...formData,
            [key]: info.file.response.data,
          });
        } else if (
          (info.file?.status === "error" &&
            info.file?.response?.code !== "0000") ||
          (info.file?.status === "done" && info.file?.response?.code !== "0000")
        ) {
          this.setState({
            [key]: [],
          });
          this.formRef?.current?.setFieldsValue({
            ...formData,
            [key]: "",
          });
          message.error(
            info.file?.response?.message
              ? info.file?.response?.message
              : "upload failed"
          );
        }
        if (info.file?.status === "removed") {
          this.formRef?.current?.setFieldsValue({
            [key]: [],
          });
        }
        break;
      case "back":
        this.setState({
          [key]: info.fileList,
        });
        if (
          info.file?.status === "done" &&
          info.file?.response?.code === "0000"
        ) {
          this.formRef?.current?.setFieldsValue({
            ...formData,
            [key]: info.file.response.data,
          });
        } else if (
          (info.file?.status === "error" &&
            info.file?.response?.code !== "0000") ||
          (info.file?.status === "done" && info.file?.response?.code !== "0000")
        ) {
          this.setState({
            [key]: [],
          });
          this.formRef?.current?.setFieldsValue({
            ...formData,
            [key]: "",
          });
          message.error(
            info.file?.response?.message
              ? info.file?.response?.message
              : "upload failed"
          );
        }
        if (info.file?.status === "removed") {
          this.formRef?.current?.setFieldsValue({
            [key]: [],
          });
        }
        break;
      case "proofOfAddress":
        this.setState({
          [key]: info.fileList,
        });
        if (
          info.file?.status === "done" &&
          info.file?.response?.code === "0000"
        ) {
          this.formRef?.current?.setFieldsValue({
            ...formData,
            [key]: info.file.response.data,
          });
          this.setState({
            uploading: false,
          });
        } else if (
          (info.file?.status === "error" &&
            info.file?.response?.code !== "0000") ||
          (info.file?.status === "done" && info.file?.response?.code !== "0000")
        ) {
          this.setState({
            [key]: [],
          });
          this.formRef?.current?.setFieldsValue({
            ...formData,
            [key]: "",
          });
          message.error(
            info.file?.response?.message
              ? info.file?.response?.message
              : "upload failed"
          );
          this.setState({
            uploading: false,
          });
        }
        if (info.file?.status === "removed") {
          this.formRef?.current?.setFieldsValue({
            [key]: [],
          });
        }
        break;
      case "selfie":
        this.setState({
          [key]: info.fileList,
        });
        if (
          info.file?.status === "done" &&
          info.file?.response?.code === "0000"
        ) {
          this.formRef?.current?.setFieldsValue({
            ...formData,
            [key]: info.file.response.data,
          });
        } else if (
          (info.file?.status === "error" &&
            info.file?.response?.code !== "0000") ||
          (info.file?.status === "done" && info.file?.response?.code !== "0000")
        ) {
          this.setState({
            [key]: [],
          });
          this.formRef?.current?.setFieldsValue({
            ...formData,
            [key]: "",
          });
          message.error(
            info.file?.response?.message
              ? info.file?.response?.message
              : "upload failed"
          );
        }
        if (info.file?.status === "removed") {
          this.formRef?.current?.setFieldsValue({
            [key]: [],
          });
        }
        break;
      default:
        break;
    }
    if (info.file?.response?.code === "0000") {
      const formData = this.formRef?.current?.getFieldsValue(true);
      this.formRef?.current?.setFieldsValue({
        ...formData,
        uploadId: {
          [key]: info.file.response.data,
        },
      });
    }
  };
  onChangeUploadSocs = (info: any) => {
    this.setState({
      entityFiles: info.fileList,
      uploading: true,
    });
    if (
      (info.file?.status === "error" && info.file?.response?.code !== "0000") ||
      (info.file?.status === "done" && info.file?.response?.code !== "0000") ||
      !info.file?.status
    ) {
      const formData = this.formRef?.current?.getFieldsValue(true);
      const arr = info.fileList;
      const idx = formData?.entityFiles.fileList.findIndex(
        (item: any) => item?.uid === info.file.uid
      );
      arr.splice(idx, 1);
      this.setState({
        entityFiles: arr,
        uploading: false,
      });

      info.file?.status &&
        message.error(
          info.file?.response?.message
            ? info.file?.response?.message
            : "upload failed"
        );
    }
    if (info.file?.status === "done" || info.file?.status === "removed") {
      this.setState({
        uploading: false,
      });
    }

    if (info.fileList.length === 0) {
      const formData = this.formRef?.current?.getFieldsValue(true);
      this.formRef?.current?.setFieldsValue({
        ...formData,
        entityFiles: [],
      });
    }
  };
  // KycUpdate
  onChange = (e: string) => {
    switch (e) {
      case "INDIVIDUAL":
        this.setState({
          selected: "Individual",
        });
        break;

      case "CORPORATE":
        this.setState({
          selected: "Corporate",
        });
        break;

      default:
        break;
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
  setFromData = async () => {
    try {
      const { countryList, nationalityList, kyc3Data, kycData } = this.props;
      const lv3Data: IKyc3Data = kyc3Data as IKyc3Data;
      if (
        (lv3Data?.kycType && lv3Data?.kycType === "INDIVIDUAL") ||
        (!lv3Data?.kycType && kycData?.userType === "INDIVIDUAL")
      ) {
        let countryOfResidence = "";
        let nationality = "";
        countryOfResidence = countryList.filter((item: any) => {
          return (
            item.name ===
              this.countryLocal(lv3Data?.individualBasicInfo?.country) ||
            item.name === lv3Data?.individualBasicInfo?.country
          );
        })[0]?.name;
        nationality = nationalityList.filter((item: any) => {
          return (
            item.name ===
              this.countryLocal(lv3Data?.individualBasicInfo?.nationality) ||
            item.name === lv3Data?.individualBasicInfo?.nationality
          );
        })[0]?.name;
        this.countryChange(lv3Data?.registeredAddress?.country);
        setTimeout(async () => {
          const id = 1;
          const name = this.state.code?.find(
            (i) => i.regionCode === lv3Data?.registeredAddress?.state
          )?.name;
          this.formRef?.current?.setFieldsValue({
            surname: lv3Data?.individualBasicInfo?.surname,
            middleName: lv3Data?.individualBasicInfo?.middleName,
            lastName: lv3Data?.individualBasicInfo?.lastName,
            birthDate:
              lv3Data?.individualBasicInfo?.birthDate &&
              moment(lv3Data?.individualBasicInfo?.birthDate),
            country: countryOfResidence,
            nationality,
            idType: lv3Data?.individualBasicInfo?.idType,
            // idExpiryDate: moment(lv3Data?.individualBasicInfo?.idExpiryDate),
            idSerialNumber: lv3Data?.individualBasicInfo?.idSerialNumber,
            salutation: lv3Data?.individualBasicInfo?.salutation,
            registeredAddressCity: lv3Data?.registeredAddress?.city,
            registeredAddressCountry: lv3Data?.registeredAddress?.country,
            registeredAddressPostalCode: lv3Data?.registeredAddress?.postalCode,
            registeredAddressState: name,
            registeredAddressStreet: lv3Data?.registeredAddress?.street,
            registeredAddressFlatOrRoom: lv3Data?.registeredAddress?.flatOrRoom,
            containAnAddress:
              lv3Data?.containAnAddress !== null
                ? lv3Data?.containAnAddress
                : false,
            industry: this.paramText(lv3Data?.industry, industryList),
            otherIndustry: lv3Data?.otherIndustry,
            employment: this.paramText(
              lv3Data?.employmentStatus,
              employmentStatusList
            ),
            purpose: this.paramText(lv3Data?.purpose, purposeList),
            otherPurpose: lv3Data?.otherPurpose,
            individualSourceOfFunds: this.paramText(
              lv3Data?.sourceOfFunds,
              individualSourceOfFundsList
            ),
            phoneNumberAreaCode: lv3Data?.phoneNumber?.areaCode,
            phoneNumberNumber: lv3Data?.phoneNumber?.number,
            otherSourceOfFunds: lv3Data?.otherSourceOfFunds,
            savingAndInvestments: lv3Data?.savingAndInvestments,
            front: lv3Data?.uploadId?.front,
            back: lv3Data?.uploadId?.back,
            proofOfAddress: lv3Data?.proofOfAddress,
            selfie: lv3Data?.selfie,
          });
          this.setState({
            selected: "Individual",
            front: lv3Data?.uploadId?.front
              ? [
                  {
                    uid: "IndividualFront" + id,
                    status: "done",
                    url: await this.getPic(lv3Data?.uploadId?.front),
                  },
                ]
              : [],
            back: lv3Data?.uploadId?.back
              ? [
                  {
                    uid: "IndividualBack" + id,
                    status: "done",
                    url: await this.getPic(lv3Data?.uploadId?.back),
                  },
                ]
              : [],
            proofOfAddress: lv3Data?.proofOfAddress
              ? !lv3Data?.proofOfAddress?.toLocaleLowerCase()?.includes(".pdf")
                ? [
                    {
                      uid: "IndividualProofOfAddress",
                      status: "done",
                      url: await this.getPic(lv3Data?.proofOfAddress),
                    },
                  ]
                : [
                    {
                      uid: "IndividualProofOfAddress",
                      status: "done",
                      name: "Proof Of Address",
                      url: lv3Data?.proofOfAddress,
                    },
                  ]
              : [],
            selfie: lv3Data?.selfie
              ? [
                  {
                    uid: "IndividualSelfie",
                    status: "done",
                    url: await this.getPic(lv3Data?.selfie),
                  },
                ]
              : [],
            updateUi: !this.state.updateUi,
          });
        }, 200);
      } else if (
        (lv3Data?.kycType && lv3Data?.kycType === "CORPORATE") ||
        (!lv3Data?.kycType && kycData?.userType === "CORPORATE")
      ) {
        const lv3Data: Icorp3Data = kyc3Data as Icorp3Data;
        let incorporationCountry = "";
        incorporationCountry = countryList.filter((item: any) => {
          return (
            item.name ===
              this.countryLocal(
                lv3Data?.corporateBasicInfo?.incorporationCountry
              ) ||
            item.name === lv3Data?.corporateBasicInfo?.incorporationCountry
          );
        })[0]?.name;

        setTimeout(async () => {
          lv3Data?.corporateStructure?.forEach((item, idx) => {
            lv3Data.corporateStructure[idx].ownership =
              lv3Data.corporateStructure[idx]?.ownership?.toString();
            lv3Data.corporateStructure[idx].dateOfBirth = moment(
              item.dateOfBirth
            ) as unknown as number;
          });
          lv3Data?.directors?.forEach((item, idx) => {
            lv3Data.directors[idx].dateOfBirth = moment(
              item.dateOfBirth
            ) as unknown as number;
          });
          this.formRef?.current?.setFieldsValue({
            kycType: "CORPORATE",
            corporateBasicInfoCompanyName:
              lv3Data?.corporateBasicInfo?.companyName,
            corporateBasicInfoIncorporationDate: lv3Data?.corporateBasicInfo
              ?.incorporationDate
              ? moment(lv3Data?.corporateBasicInfo?.incorporationDate)
              : undefined,
            corporateBasicInfoIncorporationCountry: incorporationCountry,
            corporateBasicInfoIncorporationNumber:
              lv3Data?.corporateBasicInfo?.incorporationNumber,
            annualRevenue: lv3Data?.annualRevenue?.toString(),
            companyValue: lv3Data?.companyValue?.toString(),
            contractEmail: lv3Data?.contractEmail,
            corporateStructure: lv3Data?.corporateStructure
              ? lv3Data?.corporateStructure
              : [
                  {
                    fieldKey: 0,
                    isListField: true,
                    key: 0,
                    name: 0,
                    dateOfBirth: null,
                    firstName: null,
                    idNumber: null,
                    lastName: null,
                    middleName: null,
                    ownership: null,
                  },
                ],
            directors: lv3Data?.directors
              ? lv3Data?.directors
              : [
                  {
                    fieldKey: 0,
                    isListField: true,
                    key: 0,
                    name: 0,
                    dateOfBirth: null,
                    firstName: null,
                    idNumber: null,
                    lastName: null,
                    middleName: null,
                    position: null,
                  },
                ],
            entityType: this.paramText(lv3Data?.entityType, entityTypeList),
            otherEntityType: lv3Data?.otherEntityType,
            industry: this.paramText(lv3Data?.industry, industryList),
            otherIndustry: lv3Data?.otherIndustry,
            containAnAddress:
              lv3Data?.containAnAddress !== null
                ? lv3Data?.containAnAddress
                : false,
            listedOnExchange:
              lv3Data?.listedOnExchange !== null
                ? lv3Data?.listedOnExchange
                : true,
            monthlyDeposit: lv3Data?.monthlyDeposit?.toString(),
            monthlyWithdrawal: lv3Data?.monthlyWithdrawal?.toString(),
            natureOfBusiness: lv3Data?.natureOfBusiness,
            otherTradingNames: lv3Data?.otherTradingNames,
            phoneNumberAreaCode: lv3Data?.phoneNumber?.areaCode,
            phoneNumberNumber: lv3Data?.phoneNumber?.number,
            purpose: this.paramText(lv3Data?.purpose, purposeList),
            otherPurpose: lv3Data?.otherPurpose,
            registeredAddressCity: lv3Data?.registeredAddress?.city,
            registeredAddressCountry: lv3Data?.registeredAddress?.country,
            registeredAddressPostalCode: lv3Data?.registeredAddress?.postalCode,
            registeredAddressState: lv3Data?.registeredAddress?.state,
            registeredAddressStreet: lv3Data?.registeredAddress?.street,
            registeredAddressFlatOrRoom: lv3Data?.registeredAddress?.flatOrRoom,
            operationAddressCity: lv3Data?.operationAddress?.city,
            operationAddressCountry: lv3Data?.operationAddress?.country,
            operationAddressPostalCode: lv3Data?.operationAddress?.postalCode,
            operationAddressState: lv3Data?.operationAddress?.state,
            operationAddressStreet: lv3Data?.operationAddress?.street,
            operationAddressFlatOrRoom: lv3Data?.operationAddress?.flatOrRoom,
            regulator: lv3Data?.regulator,
            sameAsOperation:
              lv3Data?.sameAsOperation !== null
                ? lv3Data?.sameAsOperation
                : false,
            corporateSourceOfFunds: this.paramText(
              lv3Data?.sourceOfFunds,
              corporateSourceOfFundsList
            ),
            stockExchangeName: lv3Data?.stockExchangeName,
            proofOfAddress: lv3Data?.proofOfAddress,
            entityFiles: lv3Data?.uploadId?.entityFiles,
          });
          const entityFilesList = [] as any;
          if (lv3Data?.uploadId?.entityFiles.length > 0) {
            for (
              let index = 0;
              index < lv3Data?.uploadId.entityFiles.length;
              index++
            ) {
              const num =
                lv3Data?.uploadId?.entityFiles[index].lastIndexOf(".");
              const type = lv3Data?.uploadId?.entityFiles[index].substring(num);
              const url = await this.getPic(
                lv3Data?.uploadId?.entityFiles[index]
              );
              entityFilesList.push({
                uid: index,
                name: index + type,
                status: "done",
                url,
                response: {
                  code: "0000",
                  data: lv3Data?.uploadId?.entityFiles[index],
                },
              });
            }
          }
          this.setState({
            selected: "Corporate",
            updateUi: !this.state.updateUi,
            entityFiles: entityFilesList,
            proofOfAddress: lv3Data?.proofOfAddress
              ? !lv3Data?.proofOfAddress?.toLocaleLowerCase()?.includes(".pdf")
                ? [
                    {
                      uid: "corporateProofOfAddress",
                      status: "done",
                      url: await this.getPic(lv3Data?.proofOfAddress),
                    },
                  ]
                : [
                    {
                      uid: "corporateProofOfAddress",
                      status: "done",
                      name: "Proof Of Address",
                      url: lv3Data?.proofOfAddress,
                    },
                  ]
              : [],
          });
        }, 0);
      }
    } catch (error) {
      console.log(error);
    }
  };
  countryLocal = (locale: string) => {
    return country.filter((i) => i.locale === locale)[0]?.en;
  };
  paramText = (text: string, list: any) => {
    return list.filter((i: any) => i.text === text)[0]?.id;
  };
  setModify = (status: boolean) => {
    this.setState(
      {
        modify: status,
      },
      () => {
        this.setFromData();
      }
    );
  };
  async componentDidMount() {
    // const loader = document.createElement("script");
    // loader.type = "text/javascript";
    // loader.async = true;
    // loader.src = `https://api.sandbox.sardine.ai/assets/loader.min.js`;
    // const s = document.getElementsByTagName("script")[0];
    // s.parentNode.insertBefore(loader, s);
    const loader = document.createElement("script");
    loader.type = "text/javascript";
    loader.async = true;
    loader.src = `https://${sardingApi}/assets/loader.min.js`;
    loader.onload = async () => {
      if (
        this.state.selected === "Individual" &&
        !this.props.kyc3Data?.status
      ) {
        const w = window as any;
        const that = this;
        const res = await getSessionKey();
        w._Sardine.createContext({
          clientId, // CHANGE THIS
          sessionKey: res.data, // Please CHANGE this to  pass server side generated sessionKey and you will need this again for back-end  API call
          userIdHash: that.props.users.accountId, // CHANGE this to pass internal userId or hash of email/phone. Dont pass it if its not available.
          flow: "onboarding",
          environment,
          parentElement: document.body,
          // called when sardine generates/restores deviceID for given device.
        });
      }
    };
    const s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(loader, s);
    if (this.timer) {
      clearInterval(this.timer!);
    }
    this.timer = setInterval(() => {
      this.init(this.props.kyc3Data?.status);
    }, 10 * 6000);

    // const that = this;
  }
  init = async (status: string) => {
    if (this.state.selected === "Individual" && status) {
      const sardingSuccess = await getSardingVerification();
      this.setState({
        sardingDocumentResult:
          sardingSuccess?.data?.status ?? sardingSuccess?.data,
      });
      if (sardingSuccess.data?.status === "complete") {
        this.timer && clearInterval(this.timer);
        const res = await getSessionKey();
        const verificationResult = await getVerificationResult({
          sessionKey: res.data,
        });
        if (
          verificationResult?.code === "0000" &&
          (verificationResult.data === null ||
            verificationResult.data?.status !== "complete")
        ) {
          this.setState({
            isOpenIndentityLink: true,
          });
        } else {
          this.setState({ doucumentLink: null });
        }
      }
    }
  };
  UNSAFE_componentWillReceiveProps(nextProps: ILevel3Props) {
    if (nextProps.kyc3Data?.status === null) {
      this.setModify(false);
    }
    if (this.props.kyc3Data?.status !== nextProps.kyc3Data?.status) {
      this.init(nextProps.kyc3Data?.status);
    }
    if (
      (nextProps.kyc3Data as any)?.kycType &&
      !(this.props.kyc3Data as any)?.kycType
    ) {
      this.setModify(false);
      setTimeout(() => {
        this.setFromData();
      });
    }
  }
  countryChange = (value: string) => {
    if (value) {
      let countryRegionCodeList = [];
      const c = getCountry(value)?.sub;
      const code = getCountry(value)?.code;
      if (c && code) {
        for (const key in c) {
          countryRegionCodeList.push(c[key]?.name);
        }
        countryRegionCodeList = Array.from(new Set(countryRegionCodeList));
        countryRegionCodeList = countryRegionCodeList.map((i) => {
          return { name: i, regionCode: subdivision(code, i)?.regionCode };
        });
      } else {
        countryRegionCodeList.push({
          name: value,
          regionCode: this.props.countryList.find((i) => i.name === value)
            ?.locale,
        });
      }
      this.setState({ code: countryRegionCodeList });
      this.formRef.current?.setFieldsValue({ registeredAddressState: "" });
    }
  };
  personal = (data: IKycData, errorCode: IerrorCode[]) => {
    const {
      intl,
      authorization,
      users,
      countryList,
      nationalityList,
      ipBlock,
    } = this.props;
    const { front, back, proofOfAddress, selfie, code } = this.state;
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
              },
              { max: 64, message: "Max length 64" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Middle_Name" })}
            name="middleName"
            rules={[{ max: 64, message: "Max length 32" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Last_Name" })}
            name="lastName"
            rules={[
              {
                required: true,
              },
              { max: 64, message: "Max length 64" },
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
              },
            ]}
          >
            <DatePicker
              allowClear={false}
              placeholder=""
              defaultPickerValue={moment().subtract(18, "years")}
              disabledDate={this.dtDisabledDate}
              getPopupContainer={(e) => e}
              showToday={false}
              suffixIcon={<Date />}
            />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Nationality" })}
            name="nationality"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch>
              {nationalityList.map((i: any) => {
                return (
                  <Select.Option key={i.name} value={i.name}>
                    {i.name}
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
              },
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
              },
              { max: 64, message: "Max length 64" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "Phone number",
              defaultMessage: "Phone number",
            })}
            required
            className="phoneCountry"
          >
            <Input.Group compact>
              <Form.Item
                name="phoneNumberAreaCode"
                noStyle
                rules={[
                  {
                    required: true,
                    message: "Please select an area code",
                  },
                  {
                    validator: (r, v) => {
                      if (v) {
                        const locale =
                          (country.find(
                            (i) => i.code?.toString() === v?.toString()
                          )?.locale as CountryCode) || "";
                        const phoneNumber =
                          this.formRef?.current?.getFieldValue(
                            "phoneNumberNumber"
                          );

                        if (locale && phoneNumber) {
                          const formatPhone = new AsYouType(locale).input(
                            phoneNumber
                          );
                          const isValid = isValidPhoneNumber(
                            formatPhone,
                            locale
                          );
                          if (!isValid) {
                            this.formRef?.current.setFields([
                              {
                                name: "phoneNumberNumber",
                                errors: [
                                  "The format of the mobile phone number is incorrect",
                                ],
                              },
                            ]);
                          } else {
                            this.formRef?.current.setFields([
                              {
                                name: "phoneNumberNumber",
                                errors: [],
                              },
                            ]);
                          }
                        }
                        return Promise.resolve(true);
                      }
                    },
                  },
                ]}
              >
                <Select
                  showSearch
                  style={{
                    marginRight: "8px",
                    width: "95px",
                  }}
                >
                  {country.map((i) => {
                    return (
                      <Select.Option key={i.code} value={i.code}>
                        +{i.code}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                name="phoneNumberNumber"
                noStyle
                rules={[
                  // {
                  //   required: true,
                  //   message: intl.formatMessage({
                  //     id: "Number",
                  //     defaultMessage: "Number",
                  //   }),
                  // },
                  {
                    required: true,
                    type: "number",
                    message: "Please fill in the numbers",
                    transform(value) {
                      return Number(value);
                    },
                  },
                  {
                    validator: (r, v) => {
                      const areaCode = this.formRef?.current?.getFieldValue(
                        "phoneNumberAreaCode"
                      );
                      if (areaCode) {
                        const locale =
                          (country.find(
                            (i) => i.code?.toString() === areaCode?.toString()
                          )?.locale as CountryCode) || "";
                        if (locale) {
                          const formatPhone = new AsYouType(locale).input(v);
                          const isValid = isValidPhoneNumber(
                            formatPhone,
                            locale
                          );

                          if (!isValid) {
                            return Promise.reject(
                              "The format of the mobile phone number is incorrect"
                            );
                          } else {
                            return Promise.resolve(true);
                          }
                        }
                      }
                      return Promise.resolve(true);
                    },
                  },
                ]}
              >
                <Input type="number" style={{ width: "calc(100% - 103px)" }} />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Row>
        <div className="basic-info">
          <p>
            Residential address
            <span style={{ color: "rgba(243, 239, 255, 0.7)", fontSize: 14 }}>
              {" "}
              (Please ensure the address entered matches the data in the Proof
              of Address document.)
            </span>
          </p>
        </div>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Flat/Room",
              defaultMessage: "Flat/Room",
            })}
            name="registeredAddressFlatOrRoom"
            rules={[
              {
                required: true,
              },
              { max: 128, message: "Max length 128" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "Street",
              defaultMessage: "Street",
            })}
            name="registeredAddressStreet"
            rules={[
              {
                required: true,
              },
              { max: 128, message: "Max length 128" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "City",
              defaultMessage: "City",
            })}
            name="registeredAddressCity"
            rules={[
              {
                required: true,
              },
              { max: 128, message: "Max length 128" },
            ]}
          >
            <Input />
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Country",
              defaultMessage: "Country",
            })}
            name="registeredAddressCountry"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch onChange={this.countryChange}>
              {countryList.map((i: any) => {
                return (
                  <Select.Option key={i.name} value={i.name}>
                    {i.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "Postal code",
              defaultMessage: "Postal code",
            })}
            name="registeredAddressPostalCode"
            rules={[
              {
                required: true,
              },
              { max: 32, message: "Max length 32" },
            ]}
          >
            <Input />
          </Form.Item>
          {code.length ? (
            <Form.Item
              label={intl.formatMessage({
                id: "State / Province",
                defaultMessage: "State / Province",
              })}
              name="registeredAddressState"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select showSearch onChange={(e) => console.log(e)}>
                {code.map((i: any) => {
                  return (
                    <Select.Option key={i.regionCode} value={i.name}>
                      {i.name}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          ) : null}
        </Row>
        <Row>
          <Form.Item
            label="Proof of Address showing your name and address (ex. bank statement, utility bill, phone bill, government letter issued within 3 months or a government-issued ID with address / Max size 5mb for file)."
            name="proofOfAddress"
            rules={[{ required: true, message: "Please upload pictures" }]}
          >
            <div>
              <Upload
                action={`${process.env.REACT_APP_HTTP_URL}dbworker/protected/upload/picture/encrypt`}
                withCredentials={true}
                headers={{
                  "upload-authorization": authorization,
                  "xOPNXtoken": users.token,
                }}
                showUploadList={{ showPreviewIcon: false }}
                listType="picture-card"
                accept={".png,.jpeg,.jpg,.pdf"}
                beforeUpload={this.beforeUpload}
                onChange={(info) => {
                  this.handleChange(info, "proofOfAddress");
                }}
                fileList={proofOfAddress}
              >
                {proofOfAddress.length >= 1 ? null : (
                  <div
                    className="update-img"
                    style={{
                      backgroundSize: "100%",
                    }}
                  >
                    <img src={UploadSvg} alt="Upload" />
                    <div>Upload</div>
                  </div>
                )}
              </Upload>
              {/* <div className="text">Proof of Address</div> */}
            </div>
          </Form.Item>
        </Row>
        <div className="basic-info">Additional information</div>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Industry",
              defaultMessage: "Industry",
            })}
            name="industry"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch>
              {industryList.map((i) => {
                return (
                  <Select.Option key={i.id} value={i.id}>
                    {i.text}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          {this.formRef?.current?.getFieldValue("industry") === "OTHER" ? (
            <Form.Item
              label={intl.formatMessage({
                id: "Other (Industry)",
                defaultMessage: "Other (Industry)",
              })}
              name="otherIndustry"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item
            label={intl.formatMessage({
              id: "Employment status",
              defaultMessage: "Employment status",
            })}
            name="employment"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch>
              {employmentStatusList.map((i) => {
                return (
                  <Select.Option key={i.id} value={i.id}>
                    {i.text}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label={"Purpose of the account"}
            name="purpose"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch>
              {purposeList.map((i) => {
                return (
                  <Select.Option key={i.id} value={i.id}>
                    {i.text}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          {this.formRef?.current?.getFieldValue("purpose") === "OTHER" ? (
            <Form.Item
              label={intl.formatMessage({
                id: "Other (Purpose)",
                defaultMessage: "Other (Purpose)",
              })}
              name="otherPurpose"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          ) : null}
        </Row>

        {/* 第四列 */}
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Source of funds",
              defaultMessage: "Source of funds",
            })}
            name="individualSourceOfFunds"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch>
              {individualSourceOfFundsList.map((i) => {
                return (
                  <Select.Option key={i.id} value={i.id}>
                    {i.text}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          {this.formRef?.current?.getFieldValue("individualSourceOfFunds") ===
          "OTHER" ? (
            <Form.Item
              label={intl.formatMessage({
                id: "Other (Source of funds)",
                defaultMessage: "Other (Source of funds)",
              })}
              name="otherSourceOfFunds"
              rules={[
                {
                  required: true,
                },
                { max: 64, message: "Max length 64" },
              ]}
            >
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item
            label={"Savings and investments (total USD value)"}
            name="savingAndInvestments"
            rules={[
              {
                required: true,
              },
              { max: 64, message: "Max length 64" },
            ]}
          >
            <Input />
          </Form.Item>
        </Row>
      </>
    );
  };
  beforeUpload = (file: any, fileList: any) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg" ||
      file.type === "image/bmp" ||
      file.type === "application/pdf";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error("Image must smaller than 5MB!");
    }
    return isJpgOrPng && isLt2M;
  };
  enterprise = (data: IcorpData, errorCode: IerrorCode[]) => {
    const { intl, authorization, users, countryList, ipBlock } = this.props;
    const { entityFiles, proofOfAddress } = this.state;

    return (
      <>
        <Row>
          <Form.Item
            label={intl.formatMessage({ id: "Incorporation_Country" })}
            name="corporateBasicInfoIncorporationCountry"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch>
              {countryList.map((i: any) => {
                return (
                  <Select.Option key={i.name} value={i.name}>
                    {i.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({ id: "Incorporation_number" })}
            name="corporateBasicInfoIncorporationNumber"
            rules={[
              {
                required: true,
              },
              { max: 64, message: "Max length 64" },
            ]}
          >
            <Input />
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Other trading names",
              defaultMessage: "Other trading names",
            })}
            name="otherTradingNames"
            rules={[{ max: 64, message: "Max length 64" }]}
          >
            <Input placeholder={`type "None" if there's none`} />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "Entity type",
              defaultMessage: "Entity type",
            })}
            name="entityType"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch>
              {entityTypeList.map((i) => {
                return (
                  <Select.Option key={i.id} value={i.id}>
                    {i.text}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          {this.formRef?.current?.getFieldValue("entityType") === "OTHER" ? (
            <Form.Item
              label={intl.formatMessage({
                id: "Other (Entity type)",
                defaultMessage: "Other (Entity type)",
              })}
              name="otherEntityType"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item
            label={intl.formatMessage({
              id: "Regulator (if applicable)",
              defaultMessage: "Regulator (if applicable)",
            })}
            rules={[{ max: 64, message: "Max length 64" }]}
            name="regulator"
          >
            <Input />
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            style={{ color: "#F3EFFF" }}
            label={intl.formatMessage({
              id: "Is listed on stock exchange",
              defaultMessage: "Is listed on stock exchange",
            })}
            required={true}
          ></Form.Item>
          <Form.Item
            className="upload-title"
            name="listedOnExchange"
            initialValue={false}
          >
            <Radio.Group>
              <Radio value={true} key="Yes">
                {intl.formatMessage({ id: "Yes", defaultMessage: "Yes" })}
              </Radio>
              <Radio value={false} key="No">
                {intl.formatMessage({ id: "No", defaultMessage: "No" })}
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Row>
        {this.formRef?.current?.getFieldValue("listedOnExchange") ? (
          <Row>
            <Form.Item
              label={intl.formatMessage({
                id: "Stock exchange name",
                defaultMessage: "Stock exchange name",
              })}
              name="stockExchangeName"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "Stock exchange name",
                    defaultMessage: "Stock exchange name",
                  }),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Row>
        ) : null}
        <div className="basic-info">
          {intl.formatMessage({
            id: "Contact details",
            defaultMessage: "Contact details",
          })}
        </div>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Phone number",
              defaultMessage: "Phone number",
            })}
            className="phoneCountry"
          >
            <Input.Group compact>
              <Form.Item
                name="phoneNumberAreaCode"
                noStyle
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  showSearch
                  style={{
                    marginRight: "8px",
                    width: "84px",
                  }}
                >
                  {country.map((i) => {
                    return (
                      <Select.Option key={i.code} value={i.code}>
                        +{i.code}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                name="phoneNumberNumber"
                noStyle
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "Number",
                      defaultMessage: "Number",
                    }),
                  },
                  { max: 64, message: "Max length 64" },
                ]}
              >
                <Input type="number" style={{ width: "calc(100% - 92px)" }} />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "Email",
            })}
            name="contractEmail"
            rules={[
              {
                required: true,
              },
              { max: 64, message: "Max length 64" },
              {
                pattern: /.*@.*/,
                message: intl.formatMessage({
                  id: "41004",
                  defaultMessage: "Please enter a valid email",
                }),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Row>
        <div className="basic-info">
          {intl.formatMessage({
            id: "Registered address",
            defaultMessage: "Registered address",
          })}
        </div>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Office",
              defaultMessage: "Office",
            })}
            name="registeredAddressFlatOrRoom"
            rules={[
              {
                required: true,
              },
              { max: 128, message: "Max length 128" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "Street",
              defaultMessage: "Street",
            })}
            name="registeredAddressStreet"
            rules={[
              {
                required: true,
              },
              { max: 128, message: "Max length 128" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "City",
              defaultMessage: "City",
            })}
            name="registeredAddressCity"
            rules={[
              {
                required: true,
              },
              { max: 128, message: "Max length 128" },
            ]}
          >
            <Input />
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Country of Incorporation",
              defaultMessage: "Country of Incorporation",
            })}
            name="registeredAddressCountry"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch>
              {countryList.map((i: any) => {
                return (
                  <Select.Option key={i.name} value={i.name}>
                    {i.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "Postal code",
              defaultMessage: "Postal code",
            })}
            name="registeredAddressPostalCode"
            rules={[
              {
                required: true,
              },
              { max: 32, message: "Max length 32" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "State / Province",
              defaultMessage: "State / Province",
            })}
            name="registeredAddressState"
            rules={[
              {
                required: true,
              },
              { max: 128, message: "Max length 128" },
            ]}
          >
            <Input />
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            style={{ color: "#F3EFFF" }}
            label={intl.formatMessage({
              id: "Is your Registered address the same as your Operating address?",
              defaultMessage:
                "Is your Registered address the same as your Operating address?",
            })}
            required={true}
          ></Form.Item>
          <Form.Item className="upload-title" name="sameAsOperation">
            <Radio.Group>
              <Radio value={true} key="Yes">
                {intl.formatMessage({ id: "Yes", defaultMessage: "Yes" })}
              </Radio>
              <Radio value={false} key="No">
                {intl.formatMessage({ id: "No", defaultMessage: "No" })}
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Row>
        {!this.formRef?.current?.getFieldValue("sameAsOperation") ? (
          <>
            <div className="basic-info">
              {intl.formatMessage({
                id: "Operating address",
                defaultMessage: "Operating address",
              })}
            </div>
            <Row>
              <Form.Item
                label={intl.formatMessage({
                  id: "Office",
                  defaultMessage: "Office",
                })}
                name="operationAddressFlatOrRoom"
                rules={[
                  {
                    required: true,
                  },
                  { max: 128, message: "Max length 128" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: "Street",
                  defaultMessage: "Street",
                })}
                name="operationAddressStreet"
                rules={[
                  {
                    required: true,
                  },
                  { max: 128, message: "Max length 128" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: "City",
                  defaultMessage: "City",
                })}
                name="operationAddressCity"
                rules={[
                  {
                    required: true,
                  },
                  { max: 128, message: "Max length 128" },
                ]}
              >
                <Input />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item
                label={intl.formatMessage({
                  id: "Country of Incorporation",
                  defaultMessage: "Country of Incorporation",
                })}
                name="operationAddressCountry"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: "Please_Choose" }),
                  },
                ]}
              >
                <Select showSearch>
                  {countryList.map((i: any) => {
                    return (
                      <Select.Option key={i.name} value={i.name}>
                        {i.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: "Postal code",
                  defaultMessage: "Postal code",
                })}
                name="operationAddressPostalCode"
                rules={[
                  {
                    required: true,
                  },
                  { max: 32, message: "Max length 32" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: "State / Province",
                  defaultMessage: "State / Province",
                })}
                name="operationAddressState"
                rules={[
                  {
                    required: true,
                  },
                  { max: 128, message: "Max length 128" },
                ]}
              >
                <Input />
              </Form.Item>
            </Row>
          </>
        ) : null}
        <div className="basic-info">
          {intl.formatMessage({
            id: "Corporate structure",
            defaultMessage: "Corporate structure",
          })}
        </div>
        <Form.List name="corporateStructure">
          {(fields, { add, remove }) => (
            <>
              <div className="basic-title-list">
                {intl.formatMessage({
                  id: "UBO",
                  defaultMessage:
                    "UBO 25% ultimate beneficial ownership or more",
                })}
                <Button type="text" onClick={() => add()}>
                  Add
                </Button>
              </div>
              {fields.map(({ key, name, ...restField }) => (
                <>
                  <Row>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "First Name",
                        defaultMessage: "First Name",
                      })}
                      name={[name, "firstName"]}
                      rules={[
                        {
                          required: true,
                        },
                        { max: 64, message: "Max length 64" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "Middle Name",
                        defaultMessage: "Middle Name",
                      })}
                      name={[name, "middleName"]}
                      rules={[{ max: 64, message: "Max length 64" }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "Last Name",
                        defaultMessage: "Last Name",
                      })}
                      name={[name, "lastName"]}
                      rules={[
                        {
                          required: true,
                        },
                        { max: 64, message: "Max length 64" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Row>
                  <Row>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "ID number",
                        defaultMessage: "ID number",
                      })}
                      name={[name, "idNumber"]}
                      rules={[
                        {
                          required: true,
                        },
                        { max: 64, message: "Max length 64" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "DOB",
                        defaultMessage: "DOB",
                      })}
                      name={[name, "dateOfBirth"]}
                      rules={[
                        {
                          required: true,
                          message: intl.formatMessage({ id: "Please_Choose" }),
                        },
                      ]}
                    >
                      <DatePicker
                        allowClear={false}
                        placeholder=""
                        disabledDate={this.dtDisabledDate}
                        defaultPickerValue={moment().subtract(18, "years")}
                        getPopupContainer={(e) => e}
                        suffixIcon={<Date />}
                      />
                    </Form.Item>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "Ownership %",
                        defaultMessage: "Ownership %",
                      })}
                      name={[name, "ownership"]}
                      rules={[
                        {
                          required: true,
                          message: intl.formatMessage({
                            id: "Ownership %",
                            defaultMessage: "Ownership %",
                          }),
                        },
                        { max: 32, message: "Max length 32" },
                      ]}
                    >
                      <Input type="number" />
                    </Form.Item>
                  </Row>
                  {fields.length > 1 ? (
                    <>
                      <Row>
                        <Button type="text" onClick={() => remove(name)}>
                          Remove
                        </Button>
                      </Row>
                      <br />
                    </>
                  ) : null}
                </>
              ))}
            </>
          )}
        </Form.List>
        <Form.List name="directors">
          {(fields, { add, remove }) => (
            <>
              <div className="basic-title-list">
                {intl.formatMessage({
                  id: "Directors",
                  defaultMessage: "Directors",
                })}
                <Button type="text" onClick={() => add()}>
                  Add
                </Button>
              </div>
              {fields.map(({ key, name, ...restField }) => (
                <>
                  <Row>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "First Name",
                        defaultMessage: "First Name",
                      })}
                      name={[name, "firstName"]}
                      rules={[
                        {
                          required: true,
                        },
                        { max: 64, message: "Max length 64" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "Middle Name",
                        defaultMessage: "Middle Name",
                      })}
                      name={[name, "middleName"]}
                      rules={[{ max: 64, message: "Max length 64" }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "Last Name",
                        defaultMessage: "Last Name",
                      })}
                      name={[name, "lastName"]}
                      rules={[
                        {
                          required: true,
                        },
                        { max: 64, message: "Max length 64" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Row>
                  <Row>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "ID number",
                        defaultMessage: "ID number",
                      })}
                      name={[name, "idNumber"]}
                      rules={[
                        {
                          required: true,
                        },
                        { max: 64, message: "Max length 64" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "DOB",
                        defaultMessage: "DOB",
                      })}
                      name={[name, "dateOfBirth"]}
                      rules={[
                        {
                          required: true,
                          message: intl.formatMessage({ id: "Please_Choose" }),
                        },
                      ]}
                    >
                      <DatePicker
                        allowClear={false}
                        placeholder=""
                        disabledDate={this.dtDisabledDate}
                        defaultPickerValue={moment().subtract(18, "years")}
                        getPopupContainer={(e) => e}
                        suffixIcon={<Date />}
                      />
                    </Form.Item>
                    <Form.Item
                      label={intl.formatMessage({ id: "Position" })}
                      name={[name, "position"]}
                      rules={[
                        {
                          required: true,
                        },
                        { max: 64, message: "Max length 64" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Row>
                  {fields.length > 1 ? (
                    <>
                      <Row>
                        <Button type="text" onClick={() => remove(name)}>
                          Remove
                        </Button>
                      </Row>
                      <br />
                    </>
                  ) : null}
                </>
              ))}
            </>
          )}
        </Form.List>
        <div className="basic-info">
          {intl.formatMessage({
            id: "Estimated activities",
            defaultMessage: "Estimated activities",
          })}
        </div>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Monthly deposits (USD)",
              defaultMessage: "Monthly deposits (USD)",
            })}
            name="monthlyDeposit"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "Monthly deposits (USD)",
                  defaultMessage: "Monthly deposits (USD)",
                }),
              },
              { max: 64, message: "Max length 64" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "Monthly withdrawals (USD)",
              defaultMessage: "Monthly withdrawals (USD)",
            })}
            name="monthlyWithdrawal"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "Monthly withdrawals (USD)",
                  defaultMessage: "Monthly withdrawals (USD)",
                }),
              },
              { max: 64, message: "Max length 64" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
        </Row>
        <div className="basic-info">
          {intl.formatMessage({
            id: "Business details",
            defaultMessage: "Business details",
          })}
        </div>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Nature of business",
              defaultMessage: "Nature of business",
            })}
            name="natureOfBusiness"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "Nature of business",
                  defaultMessage: "Nature of business",
                }),
              },
              { max: 128, message: "Max length 128" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "Industry",
              defaultMessage: "Industry",
            })}
            name="industry"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select showSearch>
              {industryList.map((i) => {
                return (
                  <Select.Option key={i.id} value={i.id}>
                    {i.text}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          {this.formRef?.current?.getFieldValue("industry") === "OTHER" ? (
            <Form.Item
              label={intl.formatMessage({
                id: "Other (Industry)",
                defaultMessage: "Other (Industry)",
              })}
              name="otherIndustry"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "Other (Industry)",
                    defaultMessage: "Other (Industry)",
                  }),
                },
                { max: 64, message: "Max length 64" },
              ]}
            >
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item
            label={intl.formatMessage({
              id: "Source of funds",
              defaultMessage: "Source of funds",
            })}
            name="corporateSourceOfFunds"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "Please_Choose" }),
              },
            ]}
          >
            <Select showSearch>
              {corporateSourceOfFundsList.map((i) => {
                return (
                  <Select.Option key={i.id} value={i.id}>
                    {i.text}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            label={intl.formatMessage({
              id: "Purpose",
              defaultMessage: "Purpose",
            })}
            name="purpose"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "Please_Choose" }),
              },
            ]}
          >
            <Select showSearch>
              {purposeList.map((i) => {
                return (
                  <Select.Option key={i.id} value={i.id}>
                    {i.text}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          {this.formRef?.current?.getFieldValue("purpose") === "OTHER" ? (
            <Form.Item
              label={intl.formatMessage({
                id: "Other (Purpose)",
                defaultMessage: "Other (Purpose)",
              })}
              name="otherPurpose"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "Other (Purpose)",
                    defaultMessage: "Other (Purpose)",
                  }),
                },
                { max: 64, message: "Max length 64" },
              ]}
            >
              <Input />
            </Form.Item>
          ) : null}

          <Form.Item
            label={intl.formatMessage({
              id: "Annual revenue (USD)",
              defaultMessage: "Annual revenue (USD)",
            })}
            name="annualRevenue"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "Annual revenue (USD)",
                  defaultMessage: "Annual revenue (USD)",
                }),
              },
              { max: 64, message: "Max length 64" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "Company value (USD)",
              defaultMessage: "Company value (USD)",
            })}
            name="companyValue"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "Company value (USD)",
                  defaultMessage: "Company value (USD)",
                }),
              },
              { max: 64, message: "Max length 64" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
        </Row>
        <Row>
          <Form.Item
            label="Upload docs (Max size 5mb for each file)"
            name="entityFiles"
            rules={[{ required: true, message: "Please upload doc" }]}
          >
            <Upload
              action={`${process.env.REACT_APP_HTTP_URL}dbworker/protected/upload/picture/encrypt`}
              withCredentials={true}
              headers={{
                "upload-authorization": authorization,
                "xOPNXtoken": users.token,
              }}
              showUploadList={{ showPreviewIcon: false }}
              onChange={this.onChangeUploadSocs}
              beforeUpload={this.beforeUpload}
              onPreview={this.handlePreview}
              fileList={entityFiles}
            >
              <div
                className="update-img"
                style={{
                  backgroundSize: "100%",
                }}
              >
                <img src={UploadSvg} alt="Upload" />
                <div>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </Row>
        <Row style={{ color: "#fff", maxWidth: "720px" }}>
          List of the corporate documents depends on the type of entity
          onboarded. Refer to &nbsp;
          <a
            href="https://support.opnx.com/en/articles/7209258-submitting-identity-verification-kyc"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://opnx.com/corporate-onboarding/
          </a>
          &nbsp; for list of documents.
        </Row>
        {ipBlock || proofOfAddress.length >= 1 ? (
          <Row>
            <Form.Item
              label="Proof of Address(ex. utility bill, bank statement, government letter issued within 3 months / Max size 5mb for file)"
              name="proofOfAddress"
              rules={[{ required: true, message: "Please upload pictures" }]}
            >
              <div>
                <Upload
                  action={`${process.env.REACT_APP_HTTP_URL}dbworker/protected/upload/picture/encrypt`}
                  withCredentials={true}
                  headers={{
                    "upload-authorization": authorization,
                    "xOPNXtoken": users.token,
                  }}
                  showUploadList={{ showPreviewIcon: false }}
                  listType="picture-card"
                  beforeUpload={this.beforeUpload}
                  onChange={(info) => {
                    this.handleChange(info, "proofOfAddress");
                  }}
                  onPreview={this.handlePreview}
                  fileList={proofOfAddress}
                  disabled={!ipBlock}
                >
                  {proofOfAddress.length >= 1 ? null : (
                    <div
                      className="update-img"
                      style={{
                        backgroundSize: "100%",
                      }}
                    >
                      <img src={UploadSvg} alt="Upload" />
                      <div>Upload</div>
                    </div>
                  )}
                </Upload>
                {/* <div className="text">Proof of Address</div> */}
              </div>
            </Form.Item>
          </Row>
        ) : null}
      </>
    );
  };
  handlePreview = async (file: any) => {
    // const res = await getBase64(file.originFileObj);
    // this.setState({
    //   previewImage: res,
    //   previewVisible: true,
    //   previewTitle: file.name,
    // });
  };
  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }
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
  sardingLink = async () => {
    this.setState({ linkLoading: true });
    const res = await getSessionKey();
    if (res.code === "0000") {
      const that = this;
      const w = window as any;
      w._Sardine.createContext({
        clientId, // CHANGE THIS
        sessionKey: res.data, // Please CHANGE this to  pass server side generated sessionKey and you will need this again for back-end  API call
        userIdHash: that.props.users.accountId, // CHANGE this to pass internal userId or hash of email/phone. Dont pass it if its not available.
        flow: "id_verification",
        environment,
        parentElement: document.body,
        enableBiometrics: true,
        // called when sardine generates/restores deviceID for given device.
        onDeviceResponse: async (deviceResponse: any) => {
          const res = await getIdentityLink();
          const link = res?.data?.link?.url || "";
          if (res.code === "0000") {
            if (link) {
              window.open(link, "_self");
            }
          } else {
            message.error(res.message);
          }
          that.setState({ linkLoading: false });
        },
      });
    }
  };
  render() {
    const { level, kycData, intl, kyc3Data, ipBlock } = this.props;
    const {
      loading,
      linkLoading,
      selected,
      errorCode,
      modify,
      isIndentityVerify,
      doucumentLink,
      sardingDocumentResult,
      uploading,
    } = this.state;
    // console.log(getCountry("AF"));
    return (
      <div className="level3" id="level3">
        <ICYModal
          // closable={true}
          // title="Go to third party page"
          centered
          getContainer={document.body}
          visible={isIndentityVerify}
          okText="Proceed"
          okLoading={linkLoading}
          okHandler={debounce(async () => {
            localStorage.set("secureModal", {
              [this.props.users.accountId]: true,
            });
            this.sardingLink();
          }, 300)}
          width={480}
          className="secure-modal"
        >
          <div className="secure-modal-content">
            <p>
              To complete your verification, you will now be redirected to our
              KYC provider in order to{" "}
              <b style={{ fontWeight: "bold" }}>upload your ID</b>.
            </p>
            <br />
            <p>
              Please note that if you choose to scan the QR code using a
              third-party app such as WeChat, you must select ‘
              <b style={{ fontWeight: "bold" }}>Open with Browser</b>’ to avoid
              potential errors.
            </p>
          </div>
        </ICYModal>
        {kyc3Data?.status !== null && !modify ? (
          // <div className="level3-content">
          //   The current KYC3 has been completed
          // </div>
          <Complete
            setModify={(status: boolean) => this.setModify(status)}
            kyc3Data={kyc3Data}
            ipBlock={ipBlock}
            sardingDocumentResult={sardingDocumentResult}
          >
            {/* (this.props.kyc3Data.idStatus === null &&
              this.state.selected === "Individual") ||
            this.props.kyc3Data?.idInvalid === true */}
            {selected === "Individual" &&
            this.props.kyc3Data?.kycType !== "CORPORATE" &&
            (sardingDocumentResult !== "complete" ||
              this.props.kyc3Data?.idInvalid) ? (
              <Button
                type="primary"
                loading={linkLoading}
                style={{ marginTop: "24px" }}
                onClick={debounce(async () => {
                  this.sardingLink();
                }, 300)}
              >
                {intl.formatMessage({ id: "Re-upload KYC Documents" })}
              </Button>
            ) : null}
          </Complete>
        ) : (
          <div className="level3-content">
            <div className="basic-info">Personal details</div>
            <div className="level3-accurate-information">
              <span className="level3-accurate-information-title">
                Provide complete and accurate information
              </span>
              <span>
                Your information cannot be changed once your account is
                verified. Please ensure the information entered matches the data
                in the provided ID.
              </span>
            </div>
            <Form
              labelAlign="left"
              name="basic"
              layout={"vertical"}
              scrollToFirstError
              initialValues={{
                remember: true,
                corporateStructure: [
                  {
                    fieldKey: 0,
                    isListField: true,
                    key: 0,
                    name: 0,
                    dateOfBirth: null,
                    firstName: null,
                    idNumber: null,
                    lastName: null,
                    middleName: null,
                    ownership: null,
                  },
                ],
                directors: [
                  {
                    fieldKey: 0,
                    isListField: true,
                    key: 0,
                    name: 0,
                    dateOfBirth: null,
                    firstName: null,
                    idNumber: null,
                    lastName: null,
                    middleName: null,
                    position: null,
                  },
                ],
              }}
              onFinish={this.onFinish}
              onValuesChange={this.onValuesChange}
              validateMessages={{ required: "Please enter content" }}
              ref={this.formRef}
            >
              {/* 第一列 */}
              <Row>
                {/* <Form.Item
                  label={intl.formatMessage({ id: "User" })}
                  name="kycType"
                  rules={[{ required: true }]}
                  initialValue="CORPORATE"
                >
                  <Select onChange={this.onChange} disabled>
                    <Select.Option value="INDIVIDUAL">
                      {intl.formatMessage({ id: "Individual" })}
                    </Select.Option>
                    <Select.Option value="CORPORATE">
                      {intl.formatMessage({ id: "Corporate" })}
                    </Select.Option>
                  </Select>
                </Form.Item> */}
                {selected === "Individual" && (
                  <Form.Item
                    label={intl.formatMessage({ id: "Salutation" })}
                    name="salutation"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select>
                      <Select.Option value="Miss">Ms</Select.Option>
                      <Select.Option value="Mr">Mr</Select.Option>
                    </Select>
                  </Form.Item>
                )}
                {selected === "Corporate" && (
                  <>
                    <Form.Item
                      label={intl.formatMessage({ id: "Company_name" })}
                      name="corporateBasicInfoCompanyName"
                      rules={[
                        {
                          required: true,
                        },
                        { max: 64, message: "Max length 64" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={intl.formatMessage({ id: "Incorporation_date" })}
                      name="corporateBasicInfoIncorporationDate"
                      rules={[
                        {
                          required: true,
                          message: intl.formatMessage({
                            id: "incorporation_date",
                          }),
                        },
                      ]}
                    >
                      <DatePicker
                        allowClear={false}
                        placeholder=""
                        defaultPickerValue={moment().subtract(18, "years")}
                        disabledDate={(date) => {
                          if (
                            moment(date as any).valueOf() < moment().valueOf()
                          ) {
                            return false;
                          }
                          return true;
                        }}
                        suffixIcon={<Date />}
                      />
                    </Form.Item>
                  </>
                )}
              </Row>
              {this.selectFrom(selected, kycData, errorCode)}
              <div className="kyc-btn">
                {/* <Button
                  type="text"
                  loading={loading}
                  onClick={this.onSave}
                  className="save-btn"
                >
                  {intl.formatMessage({ id: "Save" })}
                </Button> */}
                <Button
                  type="primary"
                  disabled={
                    (kyc3Data?.status !== null && !modify ? true : false) ||
                    uploading
                  }
                  loading={loading}
                  htmlType="submit"
                >
                  {intl.formatMessage({ id: "Submit" })}
                </Button>
              </div>
            </Form>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: { users: Iusers }) => ({
  users: state.users,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(memo(Level2)));

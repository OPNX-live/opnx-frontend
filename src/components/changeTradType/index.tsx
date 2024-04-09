import React, { useContext, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Modal, Select, Input, message, Button } from "antd";
import { CaretDownFilled } from "@ant-design/icons";
import { ContainerContext } from "../../scenes/home/scenes/subaccout/subaccout";
import { changeAccout, geetestInit } from "../../service/http/http";
import "./index.scss";
import { setAccoutList, setSubAccouts } from "store/actions/publicAction";
import { WrappedComponentProps, injectIntl } from "react-intl";
import messageError from "utils/errorCode";
import gt from "utils/gt";
import { geetestValidatePackage } from "utils";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
type INamePropsState = ReturnType<typeof mapStateToProps>;
type INameDispatchState = ReturnType<typeof mapDispatchToProps> &
  WrappedComponentProps &
  INamePropsState;
interface IChangeTradType {
  onClose: (off: boolean) => void;
}
function ChangeTradType(props: IChangeTradType & INameDispatchState) {
  const [selectValue, setSelectValue] = useState<string>("LINEAR");
  const [inputValue, setInputValue] = useState<string>("");
  const value = useContext(ContainerContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputValue("");
  }, [value]);
  const handleChange = (value: string) => {
    setSelectValue(value);
  };
  const handleCancel = () => {
    props.onClose(false);
  };
  const onChange = (e: any) => {
    const value: string = e.target.value.replace(/\s+/g, "");
    if (value.length <= 32) {
      setInputValue(value);
    } else {
      message.warning("'userName' cannot be longer than 32 characters");
    }
  };
  const subInterface = (token: string, action: string) => {
    const data = {
      _key: value.accoutListIndex._key,
      accountName: value.accoutNameShow ? inputValue : "",
      tradingType: value.accoutNameShow ? null : selectValue,
      accountStatus: null,
    };

    changeAccout(data, token, action).then((res) => {
      props.onClose(false);
      setLoading(false);
      if (res.success) {
        message.success(
          props.intl.formatMessage({
            id: "40009",
            defaultMessage: "Changed successfully",
          })
        );
        props.setAccoutList(true);
        props.setSubAccouts();
      } else {
        message.warning(res.message);
      }
    });
  };
  // const handler=(obj: object)=>{
  //   const data = {
  //     email: props.users.email,
  //     geetestType: "COMMON",
  //   };
  //   geetestValidatePackage(
  //     obj,
  //     data,
  //     () => {
  //       subInterface()
  //     },
  //     () => {
  //       setLoading(false)
  //     }
  //   );
  // }
  const submit = async () => {
    if (inputValue === "" && value.accoutNameShow) {
      message.warning("Please enter a correct 'name'");
    } else {
      setLoading(true);
      onRecaptchaVerify(
        "",
        "COMMON",
        (token, action) => {
          subInterface(token, action);
        },
        () => setLoading(false)
      );
    }
  };
  return (
    <Modal
      className="change-trad"
      title={props.intl.formatMessage({ id: "Change" })}
      visible={value.linearShow}
      onCancel={handleCancel}
      destroyOnClose={true}
      footer={
        <Button
          className="submit"
          disabled={value.accoutNameShow && inputValue === "" ? true : false}
          style={
            value.accoutNameShow && inputValue === ""
              ? {
                  backgroundColor: "rgb(173, 177, 187)",
                  color: "#FFFFFF",
                }
              : {}
          }
          onClick={submit}
          loading={loading}
        >
          {props.intl.formatMessage({ id: "Submit" })}
        </Button>
      }
    >
      {!value.accoutNameShow ? (
        <div className="model-content">
          <div className="model-type">
            {props.intl.formatMessage({
              id: "Margin_Type",
              defaultMessage: "Margin Type",
            })}{" "}
          </div>
          <Select
            defaultValue={value.accoutListIndex.tradingType}
            suffixIcon={<CaretDownFilled />}
            style={{ width: 120 }}
            onChange={handleChange}
          >
            <Select.Option value="LINEAR">
              {props.intl.formatMessage({
                id: "Linear-USD",
                defaultMessage: "Linear-USD",
              })}{" "}
            </Select.Option>
          </Select>
        </div>
      ) : (
        <Input
          onChange={onChange}
          onPressEnter={submit}
          value={inputValue}
          defaultValue={""}
          placeholder={props.intl.formatMessage({ id: "name" })}
        />
      )}
    </Modal>
  );
}
const mapStateToProps = (state: { users: Iusers }) => {
  return {
    users: state.users,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setAccoutList(data: any) {
      dispatch(setAccoutList(data));
    },
    setSubAccouts() {
      dispatch(setSubAccouts());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ChangeTradType));

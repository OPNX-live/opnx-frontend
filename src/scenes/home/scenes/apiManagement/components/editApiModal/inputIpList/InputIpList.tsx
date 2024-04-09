import React, { Component } from "react";
import { connect } from "react-redux";
import { Input, message } from "antd";
import { messageError } from "utils";
import { CloseOutlined } from "@ant-design/icons";
import "./InputIpList.scss";
import { FormattedMessage } from "react-intl";

const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
const { Search } = Input;
type InputIpListState = {
  ipList: string[];
  value: string;
};
type InputIpListProps = {
  ipListHandle: (e: string[]) => void;
  className?: string;
  ipListProps?: string[];
};
export class InputIpList extends Component<InputIpListProps, InputIpListState> {
  constructor(props: InputIpListProps) {
    super(props);
    this.state = {
      ipList: this.props.ipListProps ? this.props.ipListProps : [],
      value: "",
    };
  }
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: e.target.value });
  };
  saveIp = (e: string) => {
    const prevIplist = this.state.ipList;
    if (e !== "") {
      if (reg.test(e)) {
        this.setState({ ipList: [...prevIplist, e], value: "" }, () => {
          const nextIplist = Array.from(new Set(this.state.ipList));
          this.props.ipListHandle(nextIplist);
        });
      } else {
        message.error(messageError("41027"));
      }
    }
  };
  removeIp = (index: number) => {
    const prevIplist = this.state.ipList;
    prevIplist.splice(index, 1);
    this.setState({ ipList: prevIplist }, () => {
      const nextIplist = Array.from(new Set(this.state.ipList));
      this.props.ipListHandle(nextIplist);
    });
  };
  render() {
    const { ipList, value } = this.state;
    const { className } = this.props;
    return (
      <div className={`input-ip-list ${className ? className : ""}`}>
        <Search
          enterButton={<FormattedMessage id="Confirm" />}
          onChange={this.onChange}
          value={value}
          size="middle"
          onSearch={this.saveIp}
        />
        <div className="input-ip-list-saveed">
          {ipList.map((item, index) => (
            <div className="input-ip-list-saved-item" key={index}>
              <div>{item}</div>{" "}
              <CloseOutlined onClick={this.removeIp.bind(this, index)} />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(InputIpList);

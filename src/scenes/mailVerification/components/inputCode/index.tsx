import React from "react";
import "./index.scss";
import { Input } from "antd";

type InputCodeState = {
  value: string[];
  key: number;
};
type InputCodeProps = {
  onChange: (e: string[]) => void;
};
class InputCode extends React.Component<InputCodeProps, InputCodeState> {
  constructor(props: InputCodeProps) {
    super(props);
    this.state = {
      value: ["", "", "", "", "", ""],
      key: 0,
    };
  }
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.getElementById(`input-code-${this.state.key + 1}`)?.focus();
  }
  inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.charAt(e.target.value.length - 1);
    const key = Number(e.target.dataset.index);
    const value = this.state.value;
    if (inputValue) {
      value[key - 1] = inputValue;
      document.getElementById(`input-code-${key + 1}`)?.focus();
    }
    this.setState({ value, key: Number(e.target.dataset.index) });
    this.props.onChange(value);
  };
  handleKeyDown = (e: any) => {
    const value = this.state.value;
    if (e.keyCode === 8) {
      value[this.state.key - 1] = "";
      document.getElementById(`input-code-${this.state.key - 1}`)?.focus();
    }
    this.setState({ value });
  };
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }
  onFocus = (e: any) => {
    this.setState({
      key: Number(e.target.dataset.index),
    });
  };
  copy = (e: any) => {
    const cc = e.clipboardData.getData("text").split("");
    cc.length = 6;
    this.setState(
      {
        value: cc,
      },
      () => {
        this.props.onChange(this.state.value);
      }
    );
  };
  render() {
    const { value } = this.state;
    return (
      <div className="input-code">
        <div className="input-code-container">
          <div className="input-code-container-item">
            <Input
              id="input-code-1"
              onChange={this.inputChange}
              value={value[0]}
              onFocus={this.onFocus}
              maxLength={1}
              onPaste={this.copy}
              style={{
                borderBottom: value[0]
                  ? "1px solid #318BF5"
                  : "1px solid #adb1bb",
              }}
              data-index="1"
            />
          </div>
          <div className="input-code-container-item">
            <Input
              id="input-code-2"
              onChange={this.inputChange}
              value={value[1]}
              onFocus={this.onFocus}
              style={{
                borderBottom: value[1]
                  ? "1px solid #318BF5"
                  : "1px solid #adb1bb",
              }}
              data-index="2"
            />
          </div>
          <div className="input-code-container-item">
            <Input
              id="input-code-3"
              onChange={this.inputChange}
              value={value[2]}
              onFocus={this.onFocus}
              style={{
                borderBottom: value[2]
                  ? "1px solid #318BF5"
                  : "1px solid #adb1bb",
              }}
              data-index="3"
            />
          </div>
          <div className="input-code-container-item">
            <Input
              id="input-code-4"
              onChange={this.inputChange}
              value={value[3]}
              onFocus={this.onFocus}
              //   maxLength={1}
              style={{
                borderBottom: value[3]
                  ? "1px solid #318BF5"
                  : "1px solid #adb1bb",
              }}
              data-index="4"
            />
          </div>
          <div className="input-code-container-item">
            <Input
              id="input-code-5"
              onChange={this.inputChange}
              value={value[4]}
              onFocus={this.onFocus}
              //   maxLength={1}
              style={{
                borderBottom: value[4]
                  ? "1px solid #318BF5"
                  : "1px solid #adb1bb",
              }}
              data-index="5"
            />
          </div>
          <div className="input-code-container-item">
            <Input
              id="input-code-6"
              onChange={this.inputChange}
              value={value[5]}
              onFocus={this.onFocus}
              //   maxLength={1}
              style={{
                borderBottom: value[5]
                  ? "1px solid #318BF5"
                  : "1px solid #adb1bb",
              }}
              data-index="6"
            />
          </div>
        </div>
      </div>
    );
  }
}
export default InputCode;

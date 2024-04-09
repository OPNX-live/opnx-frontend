import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Input } from 'antd';

import './index.scss';

interface IModelIProps {
  addonAfter?: string | ReactNode;
  addonBefore?: string | ReactNode;
  defaultValue?: string;
  disabled?: boolean;
  id: string;
  maxLength?: number;
  prefix?: string | ReactNode;
  size?: 'large' | 'middle' | 'small';
  suffix?: string | ReactNode;
  type?: string;
  value?: string | number | string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  allowClear?: boolean;
  placeholder?: string;
  inputType?: 'text' | 'password';
  readOnly?: boolean;
  onBlur?:()=>void
  onFocus?:()=>void
}

type IInputLinePropsState = ReturnType<typeof mapStateToProps> & IModelIProps;
type IInputLineDispatchState = ReturnType<typeof mapDispatchToProps> &
  IInputLinePropsState;

class InputLine extends Component<
  IInputLineDispatchState,
  IInputLinePropsState
> {
  constructor(props: IInputLineDispatchState) {
    super(props);
    this.state = {
      id: '',
    };
  }
  render() {
    return (
      <div className="input-line">
        {this.props.inputType === undefined ? (
          <Input  {...this.props} />
        ) : (
          <Input.Password autoComplete="new-password"  {...this.props} />
        )}
      </div>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(InputLine);

import React, { Component } from "react";
import { Modal, Button } from "antd";
import { ModalProps } from "antd/lib/modal";
import "./Modal.scss";
/**
 * icy的弹窗，改样式之前拿把刀
 */
interface ICYPropsModal extends ModalProps {
  // 取消回调函数：
  cancleHandler?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  // 取消loadding：
  cancelLoading?: boolean;
  // 确认回调：
  okHandler?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  // 确认loadding和oneBigBtn：
  okLoading?: boolean;
  // 取消按钮文字：
  cancelText?: string;
  // 确认按钮文字和oneBigBtn：
  okText?: string;
  // 只有一个btn
  oneBigBtn?: boolean;
  // btn禁用
  oneBigBtnDisabled?: boolean;

  children?: React.ReactNode | string;
}
export class ICYModal extends Component<ICYPropsModal> {
  cancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const { cancleHandler } = this.props;
    cancleHandler ? cancleHandler!(e) : (() => {})();
  };
  ok = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const { okHandler } = this.props;
    okHandler ? okHandler!(e) : (() => {})();
  };
  render() {
    const props = this.props;
    const nextClass = props.className
      ? `${props.className} OPNX-modal`
      : "OPNX-modal";
    return (
      <Modal
        {...this.props}
        closable={props.closable ? props.closable : false}
        maskClosable={props.maskClosable ? props.maskClosable : false}
        className={nextClass}
        footer={
          props.footer ? (
            props.footer
          ) : !props.oneBigBtn ? (
            <div>
              {props.cancelText && (
                <Button
                  type="text"
                  loading={props.cancelLoading}
                  onClick={this.cancel}
                >
                  {props.cancelText}
                </Button>
              )}
              {props.okText && (
                <Button
                  type="primary"
                  loading={props.okLoading}
                  onClick={this.ok}
                >
                  {props.okText}
                </Button>
              )}
            </div>
          ) : (
            <Button
              loading={props.okLoading}
              onClick={this.ok}
              disabled={props.oneBigBtnDisabled}
              className={
                !props.oneBigBtnDisabled
                  ? "icyModal-btn-primay"
                  : "icyModal-btn-primay-disabled "
              }
            >
              {props.okText}
            </Button>
          )
        }
      >
        {props.children}
      </Modal>
    );
  }
}

export default ICYModal;

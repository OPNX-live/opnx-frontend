import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Tooltip } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { ReactComponent as PwsSuccess} from "assets/image/pwsSuccess.svg"
import "./PwsPrompt.scss";
import { TooltipPlacement } from "antd/lib/tooltip";
import {WrappedComponentProps,injectIntl} from "react-intl"
type ITooltipProps = {
  children: React.ReactNode;
  pws:string
  visible:boolean
  placement:TooltipPlacement | undefined
}&WrappedComponentProps;

export function PwsPrompt({ children,pws,visible,placement,intl }: ITooltipProps) {
  const [pwsStatus, setPwsStatus] = useState({num:"",uppercase:"",lowercase:"",special:"",chartacters:""})
  const pwsHtml =useMemo(() => {
    return <div className="pws">
    <div className="pws-title">{intl.formatMessage({id:"At least",defaultMessage:"At least"})}:</div>
    <div className="pws-box">
      <div className="pws-letter" style={{color:pwsStatus.chartacters==="chartacters"?"rgba(87,187,93)":"rgba(55, 52, 78, 0.75)"}}>
        {pwsStatus.chartacters==="chartacters"?<PwsSuccess className="pws-success"  />:<CaretRightOutlined />}8 {intl.formatMessage({id:"characters",defaultMessage:"characters"})}
      </div>
      <div className="pws-letter" style={{color:pwsStatus.uppercase==="uppercase"?"rgba(87,187,93)":"rgba(55, 52, 78, 0.75)"}}>
      {pwsStatus.uppercase==="uppercase"?<PwsSuccess className="pws-success"  />:<CaretRightOutlined />}1 {intl.formatMessage({id:"uppercase",defaultMessage:"uppercase"})}
      </div>
      <div className="pws-letter" style={{color:pwsStatus.lowercase==="lowercase"?"rgba(87,187,93)":"rgba(55, 52, 78, 0.75)"}}>
      {pwsStatus.lowercase==="lowercase"?<PwsSuccess className="pws-success"  />:<CaretRightOutlined />}1 {intl.formatMessage({id:"lowercase",defaultMessage:"lowercase"})}
      </div>
      <div className="pws-letter" style={{color:pwsStatus.num==="num"?"rgba(87,187,93)":"rgba(55, 52, 78, 0.75)"}}>
      {pwsStatus.num==="num"?<PwsSuccess className="pws-success"  />:<CaretRightOutlined />}1 {intl.formatMessage({id:"number",defaultMessage:"number"})}
      </div>
      <div className="pws-letter" style={{color:pwsStatus.special==="special"?"rgba(87,187,93)":"rgba(55, 52, 78, 0.75)"}}>
      {pwsStatus.special==="special"?<PwsSuccess className="pws-success"  />:<CaretRightOutlined />}1 {intl.formatMessage({id:"special character",defaultMessage:"special character"})}
      </div>
    </div>
  </div>
  }, [pwsStatus,intl])
  useEffect(() => {
    const lvl = {num:"",uppercase:"",lowercase:"",special:"",chartacters:""};
    if (/[0-9]/.test(pws)) {
      lvl.num="num"
    }
    if (/[A-Z]/.test(pws)) {
      lvl.uppercase="uppercase"
    }
    if (/[a-z]/.test(pws)) {
      lvl.lowercase="lowercase"
    }
    if (/[`~!@#$%^&*()_+<>?:"{},./;'[\]\\]/.test(pws)) {
      lvl.special="special"
    }
    if(pws.length>=8){
      lvl.chartacters="chartacters"
    }
    setPwsStatus(lvl)
  }, [pws])
  return (
    <Tooltip
      title={pwsHtml}
      placement={placement}
      color="white"
      visible={visible}
      overlayClassName="pws-prompt"
      getPopupContainer={(triggerNode) => triggerNode}
    >
      <div>{children}</div>
    </Tooltip>
  );
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PwsPrompt));

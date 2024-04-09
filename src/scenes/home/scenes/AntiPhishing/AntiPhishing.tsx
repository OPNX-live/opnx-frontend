import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { WrappedComponentProps, injectIntl } from "react-intl";
import CreateAnti from "./CreateAnti/CreateAnti";
import AntiComplete from "./AntiComplete/AntiComplete";
import antiImg from "assets/image/anti-img.png";
import "./AntiPhishing.scss";
import { getAnti } from "service/http/http";
import Loadding from "components/loadding";
import history from "router/history";
export function AntiPhishing({ intl }: WrappedComponentProps) {
  const [createVisible, setCreateVisible] = useState(false);
  const [antiName, setAntiName] = useState(null);
  const [refash, setRefash] = useState(false);
  const [loading, setLoading] = useState(false);
  const onCreate = () => {
    setCreateVisible(true);
  };
  const onCallBack = (off: boolean) => {
    if (off) {
      setRefash(!refash);
    }
    setCreateVisible(false);
  };
  useEffect(() => {
    setLoading(true);
    getAnti().then((res) => {
      setLoading(false);
      if (res.success) {
        setAntiName(res.data);
      }
    });
  }, [refash]);
  return (
    <div className="anti-phishing">
      <Loadding show={loading ? 1 : 0}>
        <div className="anti-title">
          <span onClick={() => history.replace("/home/security")}>
            {intl.formatMessage({ id: "Security", defaultMessage: "Security" })}
          </span>
          <span className="symbol">{">"}</span>
          <span>
            {intl.formatMessage({
              id: "Anti-Phishing Code",
              defaultMessage: "Anti-Phishing Code",
            })}
          </span>
        </div>
        <div className="anti-content">
          <div className="content-title">
            {intl.formatMessage({
              id: "Anti-Phishing Code",
              defaultMessage: "Anti-Phishing Code",
            })}
          </div>
          {antiName ? (
            <AntiComplete
              onCallback={() => setRefash(!refash)}
              antiName={antiName!}
            />
          ) : (
            <div className="code-content">
              <div className="code-problem">
                <div className="code-subtitle">
                  {intl.formatMessage({
                    id: "What is an Anti-Phishing Code?",
                    defaultMessage: "What is an Anti-Phishing Code?",
                  })}
                </div>
                <div className="code-reply">
                  An anti-phishing code is a unique code included in all email
                  communications from Open Exchange to you. This unique code
                  exists to verify that the email is coming from us, and is not
                  a phishing attempt.
                </div>
              </div>
              <div className="code-problem">
                <div className="code-subtitle">
                  {intl.formatMessage({
                    id: "How does it work?",
                    defaultMessage: "How does it work?",
                  })}
                </div>
                <div className="code-reply">
                  Set an anti-phishing code by clicking the link below, and make
                  sure to note it down. All communications from Open Exchange
                  will have this code attached.
                </div>
              </div>
              <div className="anti-img">
                <img src={antiImg} alt="" />
              </div>
              <div className="anti-btn" onClick={onCreate}>
                {intl.formatMessage({
                  id: "Create Anti-Phishing Code",
                  defaultMessage: "Create Anti-Phishing Code",
                })}
              </div>
            </div>
          )}
        </div>
        {createVisible && (
          <CreateAnti visible={createVisible} onCallBack={onCallBack} />
        )}
      </Loadding>
    </div>
  );
}

const mapStateToProps = (state: string) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AntiPhishing));

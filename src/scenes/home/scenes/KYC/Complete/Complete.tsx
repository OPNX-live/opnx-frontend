import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import kycPending from "assets/image/kyc-pending.svg";
import kycError from "assets/image/kyc-error.svg";
import kycApproved from "assets/image/kyc-approved.svg";
import "./Complete.scss";
// import { KycData } from "../type";
// import {
//   setKycSaveData,
//   setKycStatus,
//   setKycCipStatus,
//   setKycDocCheckStatus,
//   setKycDocStatus
// } from "store/actions/publicAction";
import { IKyc3Data } from "../type";
import { FormattedMessage } from "react-intl";
import { Skeleton } from "antd";

export const Complete = (props: any) => {
  const kyc3Data = props.kyc3Data as IKyc3Data;
  const ipBlock = props.ipBlock;
  const status = (type: string) => {
    if (ipBlock && type !== "REFUSED" && type !== "SUBMITTED") {
      return (
        <div className="complete-content">
          <img src={kycError} alt="" />
          <div className="text">
            Your KYC application needs more information!
          </div>
          <div className="ipBlockTip">
            <p>Reason:</p>
            <span>
              We detected that you have accessed Open Exchange from a Restricted
              Country, please withdraw all your funds as the account will be
              closed in 7 days. Otherwise, you will need to prove that you are
              not a resident of a Restricted Country by completing KYC and
              providing a recent Proof of Address. If you are already on KYC,
              please provide a recent Proof of Address by email to
              <a href="mailto:onboarding@opnx.com">onboarding@opnx.com</a>.
            </span>
          </div>
          <div
            className="btn"
            onClick={() => {
              props.setModify(true);
            }}
          >
            Edit and resubmit
          </div>
        </div>
      );
    }
    if (type === "SUBMITTED" && !kyc3Data.idInvalid) {
      return (
        <div className="complete-content">
          <Skeleton
            active
            loading={
              props.sardingDocumentResult ||
              props.sardingDocumentResult === null
                ? false
                : true
            }
          >
            <img src={kycPending} alt="" />
            <div className="text">
              {(props.sardingDocumentResult === "pending" ||
                props.sardingDocumentResult === null) &&
              props.kyc3Data.kycType !== "CORPORATE"
                ? "Please proceed to upload your KYC documents. Your identity verification must be completed before you can access deposit and trading features."
                : "Your KYC submission is under review."}
            </div>
            {props.children}
          </Skeleton>
        </div>
      );
    }
    if (type === "ADDITIONAL" || kyc3Data.idInvalid) {
      return (
        <div className="complete-content">
          <img src={kycError} alt="" />
          <div className="text">
            Your KYC application needs more information!
          </div>
          <div
            style={{
              maxWidth: 600,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <p style={{ marginTop: 12 }}>Reason:</p>
            {kyc3Data.notes ? (
              <p
                style={{
                  color: "white",
                  width: "100%",
                  textAlign: "center",
                  marginTop: 6,
                }}
              >
                {kyc3Data.notes}
              </p>
            ) : null}
            <p style={{ marginTop: 12 }}>Action:</p>
            {kyc3Data.actionNotes ? (
              <p
                style={{
                  color: "white",
                  textAlign: "center",
                  marginTop: 6,
                  wordBreak: "break-word",
                }}
              >
                {kyc3Data.actionNotes}
              </p>
            ) : null}
          </div>
          {props.kyc3Data?.basicInvalid ? (
            <div
              className="btn"
              onClick={() => {
                props.setModify(true);
              }}
            >
              Edit and resubmit
            </div>
          ) : null}
          {props.kyc3Data?.idInvalid ||
          props.sardingDocumentResult !== "complete"
            ? props.children
            : null}
        </div>
      );
    }
    if (type === "REFUSED") {
      return (
        <div className="complete-content">
          <img src={kycError} alt="" />
          <div className="text">Your KYC information was rejected!</div>
          <div>
            The application has not been successful and we are unable to further
            serve you.
          </div>
        </div>
      );
    }

    if (type === "APPROVED") {
      return (
        <div className="complete-content">
          <img src={kycApproved} alt="" />
          <div className="text">Your KYC has been approved</div>
        </div>
      );
    }
    return (
      <div className="complete-content">
        <img src={kycApproved} alt="" />
        <div className="text">Your KYC has been approved</div>
      </div>
    );
  };

  return <div className="kyc-complete">{status(kyc3Data.status)}</div>;
};

const mapStateToProps = (state: IGlobalT) => ({});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Complete);

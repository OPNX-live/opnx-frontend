/** @jsxImportSource @emotion/react */

import styled from "@emotion/styled";
import { memo, useState } from "react";
import { useIntl } from "react-intl";
import doc from "assets/image/doc.svg";
import video from "assets/image/video.svg";
import { Button, useAccount, Image, DOMAIN } from "@opnx-pkg/uikit";
import VideoModal from "./VideoModal";
const Module = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin-top: 24px;
`;
const SupportLink = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;
const SupportDoc = styled.div`
  display: flex;
  align-items: center;
`;
const SupportText = styled.a`
  font-size: 14px;
  line-height: 22px;
  color: #318bf5;
  margin-left: 8px;
`;
const SupportLine = styled.div`
  width: 1px;
  height: 20px;
  background: #31353d;
  margin: 0 16px;
`;
interface IProps {}
const GetStart = memo<IProps>(() => {
  const [isOpen, setOpen] = useState(false);
  return (
    <Module>
      {isOpen && (
        <VideoModal
          onCallBack={() => {
            setOpen(false);
          }}
          isOpen={isOpen}
        />
      )}

      <SupportLink>
        <SupportDoc>
          <Image src={doc} />{" "}
          <SupportText
            href="https://support.opnx.com/en/articles/7209258-submitting-identity-verification-kyc"
            rel="nofollow noopener noreferrer"
            target="_blank"
          >
            Support Doc
          </SupportText>{" "}
        </SupportDoc>

        <SupportLine></SupportLine>
        <SupportDoc>
          <Image src={video} />
          <SupportText onClick={() => setOpen(true)}>
            Video Tutorial
          </SupportText>
        </SupportDoc>
      </SupportLink>
    </Module>
  );
});

export default GetStart;

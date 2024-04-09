import styled from "@emotion/styled";
import React, { memo, useEffect, useState } from "react";
import { getBanner } from "service/http/http";
import { Close } from "assets/image";

const Wrapper = styled.div`
  font-size: 16px;
  min-height: 48px;
  padding: 0 40px;
  z-index: 1;
  /* position: absolute;
  top: 64px;
  left: 0;
  right: 0; */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  text-align: center;
  word-break: break-all;
`;

interface IBanner {
  color: string;
  font: string;
  content: string;
  link: string;
}

const Banner = memo(() => {
  const [bannerData, setBannerData] = useState<IBanner | null>();
  const [bannerShow, setBannerShow] = useState<boolean>(false);
  const getBanerShow = async () => {
    const res = await getBanner("user");
    res?.code === "0000" && setBannerData(res.data);
    res?.data && setBannerShow(true);
  };
  useEffect(() => {
    getBanerShow();
  }, []);
  return (
    <>
      {bannerShow ? (
        <Wrapper
          style={{
            color: bannerData?.font,
            background: bannerData?.color,
          }}
          onClick={() => {
            window.open(bannerData?.link);
          }}
        >
          {bannerData?.content}
          <div
            style={{
              position: "absolute",
              right: "20px",
            }}
            onClick={(e: any) => {
              e.stopPropagation();
              setBannerShow(false);
            }}
          >
            <Close fill={bannerData?.font} />
          </div>
        </Wrapper>
      ) : null}
    </>
  );
});

export default Banner;

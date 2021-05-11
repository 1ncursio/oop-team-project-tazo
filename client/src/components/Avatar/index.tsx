import { css } from '@emotion/react';
import backUrl from '@utils/backUrl';
import React from 'react';

interface AvatarProps {
  image: string | null;
}

const Avatar = ({ image }: AvatarProps) => {
  return (
    <>
      {image ? (
        image.startsWith('http://') ? (
          <img css={avatar} src={image} alt="프로필 사진" />
        ) : (
          <img css={avatar} src={`${backUrl}/${image}`} alt="프로필 사진" />
        )
      ) : (
        <img css={avatar} src={`${backUrl}/placeholder-profile.png`} alt="프로필 사진" />
      )}
    </>
  );
};

const avatar = css`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
`;

export default Avatar;

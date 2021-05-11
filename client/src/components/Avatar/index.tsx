import { css } from '@emotion/react';
import { IUser } from '@typings/IUser';
import backUrl from '@utils/backUrl';
import React from 'react';

const Avatar = ({ user }: { user: IUser }) => {
  return (
    <div css={avatar}>
      {user.image ? (
        user.image.startsWith('http://') ? (
          <img src={user.image} alt="프로필 사진" />
        ) : (
          <img src={`${backUrl}/${user.image}`} alt="프로필 사진" />
        )
      ) : (
        <img src={`${backUrl}/placeholder-profile.png`} alt="프로필 사진" />
      )}
      <div>{user.nickname}</div>
    </div>
  );
};

const avatar = css`
  display: flex;
  gap: 0.8rem;

  img {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
  }
`;

export default Avatar;

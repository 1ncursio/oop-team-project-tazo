import { css } from '@emotion/react';
import React, { useCallback, useEffect } from 'react';
import useInput from '@hooks/useInput';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

const Home = () => {
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');
  const history = useHistory();

  const { data: userData, revalidate: userRevalidate } = useSWR(
    '/auth',
    fetcher
  );

  const onLogIn = useCallback(
    async (e) => {
      e.preventDefault();
      const result = await axios.post(
        'http://localhost:7005/auth/login',
        { email, password },
        { withCredentials: true }
      );
      userRevalidate();
    },
    [email, password]
  );

  const onLogOut = useCallback(async (e) => {
    e.preventDefault();
    const result = await axios.get('http://localhost:7005/auth/logout');
    userRevalidate();
    console.log(result);
  }, []);

  const onKakaoLogIn = useCallback(() => {
    window.location.href = 'http://localhost:7005/auth/kakao';
  }, []);

  return (
    <>
      {!userData && (
        <form onSubmit={onLogIn} css={layout}>
          <input
            type="text"
            placeholder="이메일"
            value={email}
            onChange={onChangeEmail}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={onChangePassword}
          />
          <button type="submit" disabled={userData ? true : false}>
            로그인
          </button>
          <a onClick={onKakaoLogIn}>
            <img src="http://localhost:7005/kakao_login_medium_narrow.png" />
          </a>
          <Link to="/signup">회원가입</Link>
        </form>
      )}
      {userData && (
        <>
          <button onClick={onLogOut} disabled={userData ? false : true}>
            로그아웃
          </button>
          <div>닉네임 : {userData.nickname}</div>
          <div>이메일 : {userData.email}</div>
          <img
            src={
              userData.image || 'http://localhost:7005/placeholder-profile.png'
            }
            alt="개꿀"
          />
        </>
      )}
    </>
  );
};

const layout = css`
  width: 20%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  input,
  button {
    padding: 0.5rem 0.8rem;
  }
`;

export default Home;

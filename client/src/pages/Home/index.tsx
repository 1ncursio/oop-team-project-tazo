import { css } from '@emotion/react';
import React, { useCallback } from 'react';
import useInput from '@hooks/useInput';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

const Home = () => {
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');

  const { data: userData } = useSWR('/auth', fetcher);

  const onLogIn = useCallback(
    async (e) => {
      e.preventDefault();
      const result = await axios.post('http://localhost:7005/auth/login', { email, password }, { withCredentials: true });
      console.log(result);
    },
    [email, password]
  );

  const onLogOut = useCallback(async (e) => {
    e.preventDefault();
    const result = await axios.get('http://localhost:7005/auth/logout');
    console.log(result);
  }, []);

  return (
    <>
      <form onSubmit={onLogIn} css={layout}>
        <input type="text" placeholder="이메일" value={email} onChange={onChangeEmail} />
        <input type="password" placeholder="비밀번호" value={password} onChange={onChangePassword} />
        <button type="submit" disabled={userData ? true : false}>
          로그인
        </button>
        <button onClick={onLogOut} disabled={userData ? false : true}>
          로그아웃
        </button>
      </form>
      {userData && (
        <>
          <div>닉네임 : {userData.nickname}</div>
          <div>이메일 : {userData.email}</div>
          <div>로그인 완료</div>
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

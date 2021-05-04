import { css } from '@emotion/react';
import useInput from '@hooks/useInput';
import axios from 'axios';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router';

const SignUp = () => {
  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, onChangePassword] = useInput('');
  const [confirmPassword, onChangeConfirmPassword] = useInput('');
  const [signUpSuccess, onChangeSignUpSuccess, setSignUpSuccess] = useInput(
    false
  );

  const history = useHistory();

  const onSignUp = useCallback(
    async (e) => {
      e.preventDefault();

      if (!email || !nickname || !password || !confirmPassword)
        return alert('제대로 써라');

      const { data } = await axios.post('http://localhost:7005/auth/signup', {
        email,
        nickname,
        password,
      });

      console.log(data);

      if (data.success) {
        setSignUpSuccess(true);
        alert('성공');
      } else {
        alert(data.message);
        alert('실패');
      }

      history.push('/');
    },
    [email, nickname, password, confirmPassword]
  );

  return (
    <>
      <form onSubmit={onSignUp} css={layout}>
        <input
          type="text"
          placeholder="이메일"
          value={email}
          onChange={onChangeEmail}
        />
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={onChangeNickname}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={onChangePassword}
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={onChangeConfirmPassword}
        />
        <button type="submit">로그인</button>
      </form>
      {signUpSuccess && <div>회원가입 성공!</div>}
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

export default SignUp;

import React, { useCallback, useState } from 'react';
import { css } from '@emotion/react';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { useHistory } from 'react-router';

const SignUp = () => {
  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, onChangePassword] = useInput('');
  const [confirmPassword, onChangeConfirmPassword] = useInput('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const history = useHistory();

  const onSignUp = useCallback(
    (e) => {
      e.preventDefault();

      if (!email.trim() || !nickname.trim() || !password.trim() || !confirmPassword.trim())
        return alert('입력을 확인해주세요.');
      if (password !== confirmPassword) return alert('비밀번호와 비밀번호 확인이 다릅니다.');

      axios
        .post('/auth/signup', {
          email,
          nickname,
          password,
        })
        .then((res) => {
          setSignUpSuccess(true);
          alert('회원가입 성공!');
          history.push('/');
        })
        .catch((error) => {
          console.error(error);
          alert(error.response.data.message);
        });
    },
    [email, nickname, password, confirmPassword, setSignUpSuccess]
  );

  return (
    <>
      <form onSubmit={onSignUp} css={layout}>
        <input type="text" placeholder="이메일" value={email} onChange={onChangeEmail} />
        <input type="text" placeholder="닉네임" value={nickname} onChange={onChangeNickname} />
        <input type="password" placeholder="비밀번호" value={password} onChange={onChangePassword} />
        <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={onChangeConfirmPassword} />
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

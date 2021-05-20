import { css } from '@emotion/react';
import React, { useCallback, useEffect } from 'react';
import useInput from '@hooks/useInput';
import axios from 'axios';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { Link } from 'react-router-dom';
import PostList from '@components/PostList';
import { IPost } from '@typings/IPost';
import { IUser } from '@typings/IUser';
import backUrl from '@utils/backUrl';

const Home = () => {
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');

  const [nickname, onChangeNickname, setNickname] = useInput('');
  const [introduction, onChangeIntroduction, setIntroduction] = useInput<string | null>('');

  const { data: userData, revalidate: userRevalidate } = useSWR<IUser>('/auth', fetcher);
  const { data: postsData, revalidate: postsRevalidate } = useSWR<IPost[]>('/posts?perPage=10&page=1', fetcher);

  useEffect(() => {
    if (userData) {
      setNickname(userData.nickname);
      setIntroduction(userData.introduction);
    }
  }, [userData, setNickname, setIntroduction]);

  const onLogIn = useCallback(
    async (e) => {
      e.preventDefault();
      const result = await axios.post('/auth/login', { email, password });
      userRevalidate();
    },
    [email, password, userRevalidate]
  );

  const onLogOut = useCallback(async (e) => {
    e.preventDefault();
    const result = await axios.get('/auth/logout');
    userRevalidate();
    console.log(result);
  }, []);

  const onKakaoLogIn = useCallback(() => {
    window.location.href = `${backUrl}/auth/kakao`;
  }, []);

  const onUpdateProfile = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        await axios.patch('/user/profile', {
          nickname,
          introduction,
        });
        userRevalidate();
      } catch (error) {
        console.error(error);
      }
    },
    [nickname, introduction, userRevalidate]
  );

  const onChangeImage = useCallback(
    async (e) => {
      try {
        console.log(e.target.files);
        const imageFormData = new FormData();
        [].forEach.call(e.target.files, (file) => {
          imageFormData.append('image', file);
        });
        const { data: image } = await axios.patch('/user/image', imageFormData);
        // await axios.patch('/user/image', { image });
        userRevalidate();
      } catch (error) {
        console.error(error);
      }
    },
    [userRevalidate]
  );

  const onTestUpload = useCallback(async (e) => {
    e.preventDefault();
    try {
      console.log(e.target.files);
      const imageFormData = new FormData();
      [].forEach.call(e.target.files, (file) => {
        imageFormData.append('image', file);
      });
      const { data } = await axios.post('/post/test/image', imageFormData);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div css={layout}>
      <div>
        {!userData && (
          <form onSubmit={onLogIn} css={formLayout}>
            <input type="text" placeholder="이메일" value={email} onChange={onChangeEmail} />
            <input type="password" placeholder="비밀번호" value={password} onChange={onChangePassword} />
            <button type="submit" disabled={userData ? true : false}>
              로그인
            </button>
            <a onClick={onKakaoLogIn}>
              <img src={`${backUrl}/kakao_login_medium_narrow.png`} alt="alt" />
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
            {userData.image && (
              <img
                width="300px"
                height="auto"
                src={
                  userData.image.startsWith('http://') || userData.image.startsWith('https://')
                    ? userData.image
                    : `${backUrl}/placeholder-profile.png`
                }
                alt="개꿀"
              />
            )}
            <form onSubmit={onUpdateProfile} css={formLayout} encType="multipart/form-data">
              <input type="file" onChange={onChangeImage} />
              <input type="text" value={nickname} onChange={onChangeNickname} />
              <textarea value={introduction ? introduction : ''} onChange={onChangeIntroduction} rows={5} />
              <button type="submit">수정하기</button>
            </form>
          </>
        )}
      </div>
      <div>
        <Link to="/upload">글쓰기</Link>
        {postsData?.map((post: IPost, i: number) => (
          <PostList key={i} post={post} />
        ))}
        <form>
          <input type="file" onChange={onTestUpload} multiple />
        </form>
      </div>
    </div>
  );
};

const layout = css`
  display: flex;
  gap: 3rem;

  div:first-of-type {
    flex: 1;
  }

  div:last-child {
    flex: 3;
  }
`;

const formLayout = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  input,
  button {
    padding: 0.5rem 0.8rem;
  }
`;

export default Home;

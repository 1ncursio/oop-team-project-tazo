import { css } from '@emotion/react';
import useInput from '@hooks/useInput';
import { IUser } from '@typings/IUser';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import useSWR from 'swr';

const Upload = () => {
  const [title, onChangeTitle] = useInput('');
  const [content, onChangeContent] = useInput('');
  const [image, setImage] = useState('');

  const { data: userData } = useSWR<IUser>('/auth', fetcher);

  const history = useHistory();

  const onChangeImages = useCallback(
    async (e) => {
      try {
        console.log(e.target.files);
        const imageFormData = new FormData();
        [].forEach.call(e.target.files, (file) => {
          imageFormData.append('image', file);
        });
        const { data } = await axios.post('/post/image', imageFormData);
        setImage(data);
      } catch (error) {
        console.error(error);
      }
    },
    [setImage]
  );

  const onUpload = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        const { data } = await axios.post('/post', { title, content, src: image });
        console.log(data);
        history.push(`/post/${data.id}`);
      } catch (error) {
        console.error(error);
        alert(error.response.data.message);
      }
    },
    [title, content, history]
  );

  return (
    <form onSubmit={onUpload} css={formLayout} encType="multipart/form-data">
      <input type="text" placeholder="제목" value={title} onChange={onChangeTitle} />
      <input type="file" onChange={onChangeImages} />
      {image && <img src={`http://localhost:7005/${image}`} alt={image} />}
      <textarea placeholder="내용" value={content} onChange={onChangeContent} rows={5} />
      <input type="text" placeholder="시간" />
      <input type="text" placeholder="출발지" />
      <input type="text" placeholder="목적지" />
      <select>
        <option>상관없음</option>
        {userData?.gender && <option>{userData.gender}</option>}
      </select>
      <button type="submit">작성</button>
    </form>
  );
};

const formLayout = css`
  width: 20%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  input,
  button {
    padding: 0.5rem 0.8rem;
  }
`;

export default Upload;

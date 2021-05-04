import { css } from '@emotion/react';
import useInput from '@hooks/useInput';
import axios from 'axios';
import React, { useCallback } from 'react';

const Upload = () => {
  const [title, onChangeTitle] = useInput('');
  const [content, onChangeContent] = useInput('');

  const onUpload = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        const { data } = await axios.post(
          'http://localhost:7005/post',
          { title, content },
          { withCredentials: true }
        );
        console.log(data);
      } catch (error) {
        console.error(error);
        alert(error.response.data.message);
      }
    },
    [title, content]
  );

  return (
    <form onSubmit={onUpload} css={formLayout}>
      <input
        type="text"
        placeholder="제목"
        value={title}
        onChange={onChangeTitle}
      />
      <textarea
        placeholder="내용"
        value={content}
        onChange={onChangeContent}
        rows={5}
      />
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

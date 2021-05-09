import { css } from '@emotion/react';
import useInput from '@hooks/useInput';
import { IPost } from '@typings/IPost';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useEffect, VFC } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import useSWR from 'swr';

const Update: VFC = () => {
  const [title, onChangeTitle, setTitle] = useInput('');
  const [content, onChangeContent, setContent] = useInput('');

  const history = useHistory();

  const { postId } = useParams<{ postId: string }>();
  const { data: postData } = useSWR<IPost>(postId ? `/post/${postId}` : null, fetcher);

  useEffect(() => {
    if (postData) {
      setTitle(postData.title);
      setContent(postData.content);
    }
  }, [postData, setTitle, setContent]);

  const onUpdate = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        const { data } = await axios.patch(`/post/${postId}`, { title, content });
        console.log(data);
        history.push(`/post/${postId}`);
      } catch (error) {
        console.error(error);
        alert(error.response.data.message);
      }
    },
    [title, content, history, postId]
  );

  return (
    <form onSubmit={onUpdate} css={formLayout}>
      <input type="text" placeholder="제목" value={title} onChange={onChangeTitle} />
      <textarea placeholder="내용" value={content} onChange={onChangeContent} rows={5} />
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

export default Update;

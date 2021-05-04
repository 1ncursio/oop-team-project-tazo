import React, { useCallback, useEffect, VFC } from 'react';
import { IPost } from '@typings/IPost';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';
import useSWR from 'swr';
import axios from 'axios';

const Post: VFC = () => {
  const { postId } = useParams<{ postId: string }>();

  useEffect(() => {
    if (postId) console.log(postId);
  }, [postId]);

  const { data: postData } = useSWR<IPost>(
    postId ? `http://localhost:7005/post/${postId}` : null,
    fetcher
  );

  const onUpdate = useCallback(() => {}, []);

  const onDelete = useCallback(async () => {
    await axios.delete(`http://localhost:7005/post/${postId}`);
  }, [postId]);

  return (
    <>
      {postData && (
        <>
          <h2>{postData.title}</h2>
          <p>작성자 : {postData.User.nickname}</p>
          <p>작성시간 : {postData.createdAt}</p>
          <p>{postData.content}</p>
          <button onClick={onUpdate}>수정</button>
          <button onClick={onDelete}>삭제</button>
        </>
      )}
    </>
  );
};

export default Post;

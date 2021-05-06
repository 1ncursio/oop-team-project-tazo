import React, { useCallback, useEffect, VFC } from 'react';
import { IPost } from '@typings/IPost';
import fetcher from '@utils/fetcher';
import { useHistory, useParams } from 'react-router';
import useSWR from 'swr';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { IUser } from '@typings/IUser';
import useInput from '@hooks/useInput';

const Post: VFC = () => {
  const [comment, onChangeComment, setComment] = useInput('');

  const { postId } = useParams<{ postId: string }>();

  const history = useHistory();

  useEffect(() => {
    if (postId) console.log(postId);
  }, [postId]);

  const { data: userData } = useSWR<IUser>('/auth', fetcher);
  const { data: postData, revalidate: postRevalidate } = useSWR<IPost>(
    postId ? `http://localhost:7005/post/${postId}` : null,
    fetcher
  );

  const onSubmitComment = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        if (!comment.trim()) return alert('댓글을 작성해주세요.');

        const { data } = await axios.post(`/post/${postId}/comment`, { content: comment }, { withCredentials: true });
        console.log(data);
        setComment('');
        postRevalidate();
      } catch (error) {
        console.error(error);
      }
    },
    [postId, comment, postRevalidate, setComment]
  );

  const onUpdate = useCallback(() => {}, []);

  const onDelete = useCallback(async () => {
    const {
      data: { PostId },
    } = await axios.delete(`http://localhost:7005/post/${postId}`);
    // console.log(data);
    history.replace('/');
  }, [postId, history]);

  return (
    <>
      {postData && (
        <>
          <h2>{postData.title}</h2>
          <p>작성자 : {postData.User.nickname}</p>
          <p>작성시간 : {postData.createdAt}</p>
          <p>조회수 : {postData.views}</p>
          {postData.PostImages?.map((image) => (
            <img
              width="300px"
              height="auto"
              src={`http://localhost:7005/${image.src}`}
              alt={image.src}
              key={image.src}
            />
          ))}
          <p>{postData.content}</p>
          {userData?.id === postData.UserId && <Link to={`/post/${postId}/update`}>수정</Link>}
          {userData?.id === postData.UserId && <button onClick={onDelete}>삭제</button>}
          <form onSubmit={onSubmitComment}>
            <textarea placeholder="댓글" value={comment} onChange={onChangeComment} rows={3} />
            <button type="submit">작성</button>
          </form>
          {postData.PostComments?.map((comment) => (
            <div>
              <div>{comment.User.nickname}</div>
              <div>{comment.createdAt}</div>
              <div>{comment.content}</div>
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default Post;

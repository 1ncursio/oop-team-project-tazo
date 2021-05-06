import React, { useCallback, useEffect, useState, VFC } from 'react';
import { IPost } from '@typings/IPost';
import fetcher from '@utils/fetcher';
import { useHistory, useParams } from 'react-router';
import useSWR from 'swr';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { IUser } from '@typings/IUser';
import useInput from '@hooks/useInput';
import { css } from '@emotion/react';

const Post: VFC = () => {
  const [comment, onChangeComment, setComment] = useInput('');
  const [reply, onChangeReply, setReply] = useInput('');
  const [replyId, setReplyId] = useState(-1);

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

  const onSubmitReply = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        if (!reply.trim()) return alert('댓글을 작성해주세요.');

        const { data } = await axios.post(
          `/post/${postId}/reply`,
          { content: reply, replyId },
          { withCredentials: true }
        );
        console.log(data);
        setReply('');
        postRevalidate();
      } catch (error) {
        console.error(error);
      }
    },
    [postId, postRevalidate, reply, replyId, setReply]
  );

  const onUpdate = useCallback(() => {}, []);

  const onDelete = useCallback(async () => {
    const {
      data: { PostId },
    } = await axios.delete(`http://localhost:7005/post/${postId}`);
    // console.log(data);
    history.replace('/');
  }, [postId, history]);

  const onClickReply = useCallback(
    (id: number) => {
      setReplyId(id);
      console.log(id);
    },
    [setReplyId]
  );

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
            <div css={commentStyle}>
              <div>
                {comment.replyId !== comment.id && <div css={replyStyle} />}
                <img
                  css={avatar}
                  src={comment.User.image || 'http://localhost:7005/placeholder-profile.png'}
                  alt={comment.User.image || 'http://localhost:7005/placeholder-profile.png'}
                />
                <div>{comment.User.nickname}</div>
                <div>{comment.createdAt}</div>
                <div>{comment.content}</div>
                <button onClick={() => onClickReply(comment.id)}>답글</button>
                {comment.id === replyId && (
                  <form onSubmit={onSubmitReply}>
                    <textarea placeholder="댓글" value={reply} onChange={onChangeReply} rows={3} />
                    <button type="submit">작성</button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
};

const commentStyle = css`
  display: flex;

  margin: 1rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

const avatar = css`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
`;

const replyStyle = css`
  width: 5rem;
  height: 5rem;
`;

export default Post;

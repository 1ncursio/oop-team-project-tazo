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
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import backUrl from '@utils/backUrl';
import Avatar from '@components/Avatar';

dayjs.locale('ko');
dayjs.extend(relativeTime);

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
  const { data: postData, revalidate: postRevalidate } = useSWR<IPost>(postId ? `/post/${postId}` : null, fetcher);

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
    } = await axios.delete(`/post/${postId}`);
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
    <div css={postStyle}>
      {postData && (
        <>
          <h2>{postData.title}</h2>
          <p>작성자 : {postData.User.nickname}</p>
          <p>작성시간 : {dayjs(postData.createdAt).fromNow()}</p>
          <p>조회수 : {postData.views}</p>
          {postData.PostImages?.map((image) => (
            <img width="300px" height="auto" src={image.src} alt={image.src} key={image.src} />
          ))}
          <p>{postData.content}</p>
          {userData?.id === postData.UserId && <Link to={`/post/${postId}/update`}>수정</Link>}
          {userData?.id === postData.UserId && <button onClick={onDelete}>삭제</button>}
          <form onSubmit={onSubmitComment}>
            <textarea placeholder="댓글" value={comment} onChange={onChangeComment} rows={3} />
            <button type="submit">작성</button>
          </form>
          {postData.PostComments?.map((comment) => (
            <div css={commentContainerStyle}>
              <div css={commentStyle}>
                {comment.replyId !== comment.id && <div css={replyStyle} />}
                <Avatar user={comment.User} />
                <div>{dayjs(comment.createdAt).fromNow()}</div>
                <div>{comment.content}</div>
                {comment.replyId === comment.id && <button onClick={() => onClickReply(comment.replyId)}>답글</button>}
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
    </div>
  );
};

const postStyle = css`
  padding-bottom: 3rem;
`;

const commentStyle = css`
  display: flex;
  gap: 0.5rem;

  margin: 1rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

const commentContainerStyle = css`
  display: flex;
`;

const replyStyle = css`
  width: 5rem;
`;

export default Post;

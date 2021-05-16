import { css } from '@emotion/react';
import { IPost } from '@typings/IPost';
import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import backUrl from '@utils/backUrl';

dayjs.locale('ko');
dayjs.extend(relativeTime);

interface PostListProps {
  post: IPost;
}

const PostList = ({ post }: PostListProps) => {
  return (
    <div css={style}>
      <h2>
        <Link to={`/post/${post.id}`}>{post.title}</Link>
      </h2>
      {post?.PostImages?.[0] && (
        <img
          width="300px"
          height="auto"
          src={
            post.PostImages[0].src.startsWith('http://') || post.PostImages[0].src.startsWith('https://')
              ? post.PostImages[0].src
              : `${backUrl}/placeholder-profile.png`
          }
          alt="개꿀"
        />
      )}
      <p>작성자 : {post.User.nickname}</p>
      <p>작성시간 : {dayjs(post.createdAt).fromNow()}</p>
      <p>{post.content}</p>
    </div>
  );
};

const style = css`
  border: 1px solid black;
  margin: 1rem 0;
  padding: 1rem;
`;

export default PostList;

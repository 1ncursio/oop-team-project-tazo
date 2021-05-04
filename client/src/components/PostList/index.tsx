import { css } from '@emotion/react';
import { IPost } from '@typings/IPost';
import React from 'react';
import { Link } from 'react-router-dom';

interface PostListProps {
  post: IPost;
}

const PostList = ({ post }: PostListProps) => {
  return (
    <div css={style}>
      <h2>
        <Link to={`/post/${post.id}`}>{post.title}</Link>
      </h2>
      <p>작성자 : {post.User.nickname}</p>
      <p>작성시간 : {post.createdAt}</p>
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

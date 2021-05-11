import { css } from '@emotion/react';
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header css={headerStyle}>
      <Link to="/">홈</Link>
      <Link to="/search">유저 검색</Link>
      <Link to="/room">방 목록</Link>
    </header>
  );
};

const headerStyle = css`
  font-size: 1.1rem;
  width: inherit;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
  background-color: #f0f0f0;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    flex: 1;
    text-decoration: none;
    color: #5f5f5f;
  }

  a:hover {
    background-color: #ebebeb;
  }
`;

export default Header;

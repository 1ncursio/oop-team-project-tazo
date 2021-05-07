import { css } from '@emotion/react';
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header css={header}>
      <Link to="/">홈</Link>
      <Link to="/search">유저</Link>
    </header>
  );
};

const header = css`
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  background-color: whitesmoke;
  height: 3rem;
  display: flex;
  justify-content: space-around;
  gap: 1rem;
`;

export default Header;

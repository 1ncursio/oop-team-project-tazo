import { css } from '@emotion/react';
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header css={header}>
      <Link to="/">홈</Link>
    </header>
  );
};

const header = css`
  border-bottom: 1px solid black;
  background-color: whitesmoke;
  height: 3rem;
  display: flex;
  justify-content: space-around;
  gap: 1rem;
`;

export default Header;

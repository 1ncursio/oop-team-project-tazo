import Avatar from '@components/Avatar';
import { css } from '@emotion/react';
import useInput from '@hooks/useInput';
import { IUser } from '@typings/IUser';
import backUrl from '@utils/backUrl';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import useSWR from 'swr';

const Search = () => {
  const { nickname } = useParams<{ nickname: string }>();

  const [keyword, onChangeKeyword] = useInput('');
  const history = useHistory();

  const { data: usersData } = useSWR<IUser[]>(nickname ? `/users/${encodeURIComponent(nickname)}` : null, fetcher);

  const onSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (!keyword.trim()) return;
      history.push(`/search/${keyword}`);
    },
    [keyword, history]
  );

  return (
    <div>
      <form onSubmit={onSearch} css={formStyle}>
        <input type="search" name="nickname" value={keyword} onChange={onChangeKeyword} />
        <button type="submit">검색</button>
      </form>
      {usersData?.map((user) => (
        <div css={usersStyle}>
          <Avatar user={user} />
        </div>
      ))}
    </div>
  );
};

const formStyle = css`
  /* width: 100%; */
  display: flex;
  height: 3rem;

  input {
    flex: 9;
    padding: 0.5rem 0.8rem;
    font-size: 1rem;
  }

  button {
    flex: 1;
    font-size: 1rem;
  }
`;

const usersStyle = css`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export default Search;

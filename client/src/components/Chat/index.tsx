import Avatar from '@components/Avatar';
import { css } from '@emotion/react';
import { IChat } from '@typings/IChat';
import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('ko');
dayjs.extend(relativeTime);

const Chat = ({ chat }: { chat: IChat }) => {
  return (
    <div css={chatStyle}>
      <Avatar user={chat.User} />
      <span>{chat.content}</span>
      <span className="datetime">{dayjs(chat.createdAt).fromNow()}</span>
    </div>
  );
};

const chatStyle = css`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  .datetime {
    font-size: 0.8rem;
    color: #777777;
  }
`;

export default Chat;

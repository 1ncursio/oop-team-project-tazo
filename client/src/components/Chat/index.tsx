import Avatar from '@components/Avatar';
import { css } from '@emotion/react';
import { IChat } from '@typings/IChat';
import React, { FC, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import backUrl from '@utils/backUrl';

dayjs.locale('ko');
dayjs.extend(relativeTime);

interface Props {
  chat: IChat;
  isMe: boolean;
  isFirst: boolean;
}

const Chat: FC<Props> = ({ chat, isMe, isFirst }) => {
  const content = useMemo(
    () =>
      chat.content.startsWith('https://storage.googleapis.com/') ? (
        <img src={chat.content} alt={chat.content} css={imageChatStyle} />
      ) : (
        chat.content
      ),
    [chat.content]
  );

  return (
    <div css={chatStyle(isMe)}>
      {!isMe && <Avatar user={chat.User} />}
      <p css={contentStyle}>{content}</p>
      {isFirst && <span className="datetime">{dayjs(chat.createdAt).format('a h:mm')}</span>}
    </div>
  );
};

const chatStyle = (isMe: boolean) => css`
  padding: 0.5rem;
  display: flex;
  flex-direction: ${isMe ? 'row-reverse' : 'row'};
  align-items: center;
  gap: 1rem;

  p {
    margin: 0;
  }

  .datetime {
    font-size: 0.8rem;
    color: #777777;
  }
`;

const contentStyle = css`
  background-color: #eeeeee;
  padding: 0.5rem;
  border-radius: 0.5rem;
  max-width: 30rem;
`;

const imageChatStyle = css`
  max-width: 15rem;
  height: auto;
`;

export default Chat;

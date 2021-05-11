import Avatar from '@components/Avatar';
import ChatList from '@components/ChatList';
import { css } from '@emotion/react';
import useInput from '@hooks/useInput';
import { IRoom } from '@typings/IRoom';
import fetcher from '@utils/fetcher';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [content, onChangeContent] = useInput('');

  const { data: roomData } = useSWR<IRoom>(`/rooms/${roomId}`, fetcher);

  const onSubmitChat = useCallback(
    async (e) => {
      e.preventDefault();
      console.log({ content });
    },
    [content]
  );

  return (
    <div css={roomStyle}>
      {/* <RoomUserList /> */}
      <header>{`${roomData?.name} - 타조 방`}</header>
      {roomData?.Members?.map((member) => (
        <div css={memberStyle}>
          <Avatar user={member} />
          {roomData.OwnerId === member.id && (
            <span>
              <b>방장</b>
            </span>
          )}
        </div>
      ))}
      <ChatList />
      <form css={formLayout} onSubmit={onSubmitChat}>
        <textarea value={content} onChange={onChangeContent} rows={2} />
        <button type="submit">전송</button>
      </form>
    </div>
  );
};

const roomStyle = css`
  header {
    height: 3rem;
    background-color: rgba(30, 30, 30, 0.1);
  }
`;

const memberStyle = css`
  display: flex;
  gap: 1rem;
`;

const formLayout = css`
  display: flex;

  textarea {
    flex: 10;
    resize: none;
  }

  button {
    flex: 1;
  }
`;

export default Room;

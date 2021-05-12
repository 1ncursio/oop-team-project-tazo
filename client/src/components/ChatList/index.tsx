import Chat from '@components/Chat';
import { css } from '@emotion/react';
import useSocket from '@hooks/useSocket';
import { IChat } from '@typings/IChat';
import fetcher from '@utils/fetcher';
import React, { FC, RefObject, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import produce from 'immer';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { IUser } from '@typings/IUser';

interface Props {
  scrollbarRef: RefObject<Scrollbars>;
}

const ChatList: FC<Props> = ({ scrollbarRef }) => {
  const { roomId } = useParams<{ roomId: string }>();

  const { data: userData } = useSWR<IUser>('/auth', fetcher);
  const { data: chatData, mutate: mutateChat } = useSWR<IChat[]>(`/rooms/${roomId}/chat`, fetcher);

  const [socket, disconnect] = useSocket('room', roomId);

  const isFirst = (index: number) => {
    if (!chatData) return true;

    // 첫번째 데이터면 return true
    if (index === 0) return true;

    if (chatData[index].UserId === chatData[index - 1].UserId) return false;
    return true;
  };

  const onChat = useCallback(
    async (data: IChat) => {
      await mutateChat(
        produce((chatData) => {
          chatData.push(data);
        }),
        false
      );
      scrollbarRef?.current?.scrollToBottom();
    },
    [mutateChat, scrollbarRef]
  );

  useEffect(() => {
    socket?.on('chat', onChat);
    return () => {
      socket?.off('chat', onChat);
      console.info('disconnect socket', socket);
      disconnect();
    };
  }, [socket, disconnect, onChat]);

  useEffect(() => {
    scrollbarRef?.current?.scrollToBottom();
  }, [scrollbarRef]);

  return (
    <div css={chatListStyle}>
      <Scrollbars autoHide ref={scrollbarRef}>
        {userData &&
          chatData?.map((chat, i) => (
            <Chat chat={chat} key={chat.id} isMe={userData.id === chat.UserId} isFirst={isFirst(i)} />
          ))}
      </Scrollbars>
    </div>
  );
};

const chatListStyle = css`
  height: 100vh;
  flex: 1;
  /* overflow-y: scroll; */
`;

export default ChatList;

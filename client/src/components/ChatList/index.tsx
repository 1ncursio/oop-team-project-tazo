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

interface Props {
  scrollbarRef: RefObject<Scrollbars>;
}

const ChatList: FC<Props> = ({ scrollbarRef }) => {
  const { roomId } = useParams<{ roomId: string }>();

  const { data: chatData, mutate: mutateChat } = useSWR<IChat[]>(`/rooms/${roomId}/chat`, fetcher);

  const [socket, disconnect] = useSocket('room', roomId);

  const onChat = useCallback(
    async (data: IChat) => {
      const chats = await mutateChat(
        produce((chatData) => {
          chatData.push(data);
        }),
        false
      );
      scrollbarRef?.current?.scrollToBottom();
      console.log(chats);
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
        {chatData?.map((chat) => (
          <Chat chat={chat} key={chat.id} />
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

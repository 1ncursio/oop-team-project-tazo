import { useCallback } from 'react';
import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:7005';

const sockets: { [key: string]: SocketIOClient.Socket } = {};

const useSocket = (room?: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (room) {
      sockets[room].disconnect();
      delete sockets[room];
    }
  }, [room]);
  if (!room) {
    return [undefined, disconnect];
  }

  if (!sockets[room]) {
    console.log(room, '소켓 연결!!');
    sockets[room] = io.connect(`${BACKEND_URL}/room-${room}`, { transports: ['websocket'] });
    console.log(sockets[room]);
  }

  return [sockets[room], disconnect];
};

export default useSocket;

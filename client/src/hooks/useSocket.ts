import { useCallback } from 'react';
import io from 'socket.io-client';
import backUrl from '@utils/backUrl';

const sockets: { [key: string]: SocketIOClient.Socket } = {};

const useSocket = (namespace?: string, namespaceId?: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (namespace && sockets[namespace]) {
      sockets[namespace].disconnect();
      delete sockets[namespace];
    }
  }, [namespace]);
  if (!namespace) {
    return [undefined, disconnect];
  }

  if (!sockets[namespace]) {
    if (!namespaceId) {
      sockets[namespace] = io.connect(`${backUrl}/ws-${namespace}`, { transports: ['websocket'] });
    } else {
      sockets[namespace] = io.connect(`${backUrl}/ws-${namespace}-${namespaceId}`, { transports: ['websocket'] });
    }
    console.info('create socket', namespace, namespaceId, sockets[namespace]);
  }

  return [sockets[namespace], disconnect];
};

export default useSocket;

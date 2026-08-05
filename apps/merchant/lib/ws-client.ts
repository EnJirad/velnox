import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

export function getMerchantSocket(): Socket {
  if (!socket) {
    socket = io(`${API_URL}/ws`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectMerchantSocket() {
  socket?.disconnect();
  socket = null;
}

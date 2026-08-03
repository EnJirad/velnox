import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3002')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    this.logger.debug(`WS connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`WS disconnected: ${client.id}`);
  }

  emitOrderUpdated(payload: unknown) {
    this.server?.emit('order:updated', payload);
  }

  emitOrderCreated(payload: unknown) {
    this.server?.emit('order:created', payload);
  }
}
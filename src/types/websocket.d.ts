export interface PingEvent {
  event: 'ping'
}

export interface PongEvent {
  event: 'pong'
}

export interface ConfigUpdateEvent {
  event: 'config:update'
  name?: string
}

export type ReceivedMessage = PingEvent

export interface ReceivedMessageMap {
  ping: PingEvent
}

export type SendMessage = PongEvent | ConfigUpdateEvent

export interface SendMessageMap {
  'pong': PongEvent
  'config:update': ConfigUpdateEvent
}

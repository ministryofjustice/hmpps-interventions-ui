/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-misused-new */
/* eslint-disable @typescript-eslint/triple-slash-reference */
// Type definitions for connect-redis
// Project: https://npmjs.com/package/connect-redis
// Temporary local version instead of using @types/connect-redis
// Created as official version is not compatible with redis v4
// TypeScript Version: 2.3

/// <reference types="express" />
/// <reference types="express-session" />
/// <reference types="redis" />

declare module 'connect-redis' {
  import * as express from 'express'
  import * as session from 'express-session'
  import * as redis from 'redis'

  function s(options: (options?: session.SessionOptions) => express.RequestHandler): s.RedisStore

  namespace s {
    type Client = ReturnType<typeof redis.createClient> // Changed for redis v4
    interface RedisStore extends session.Store {
      new (options: RedisStoreOptions): RedisStore
      client: Client
    }
    interface RedisStoreOptions {
      client?: Client | undefined
      host?: string | undefined
      port?: number | undefined
      socket?: string | undefined
      url?: string | undefined
      ttl?: number | string | ((store: RedisStore, sess: session.SessionData, sid: string) => number) | undefined
      disableTTL?: boolean | undefined
      disableTouch?: boolean | undefined
      db?: number | undefined
      pass?: string | undefined
      prefix?: string | undefined
      unref?: boolean | undefined
      serializer?: Serializer | JSON | undefined
      logErrors?: boolean | ((error: string) => void) | undefined
      scanCount?: number | undefined
    }
    interface Serializer {
      stringify: Function
      parse: Function
    }
  }

  export = s
}

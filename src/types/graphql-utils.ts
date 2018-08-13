import { Redis } from "ioredis";
import { Request } from "express";

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}

export interface Context {
  redis: Redis;
  url: string;
  session: Session;
  req: Request;
}

export interface Session extends Express.Session {
  userId: number;
}

export type GraphQLMiddlewareFunction = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: Context,
  info: any
) => any;

export type Resolver = (
  parent: any,
  args: any,
  context: Context,
  info: any
) => any;

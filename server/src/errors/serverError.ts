export const SERVER_ERROR_PREFIX = "ServerError";

export class ServerError implements Error {
  name = SERVER_ERROR_PREFIX;
  statusCode = 500;

  constructor(public message: string) {
  }

  toJson(): { status: number, message: string, name: string } {
    return {
      status: this.statusCode,
      message: this.message,
      name: this.name
    }
  }
}

export class RpcError extends ServerError {
  name = SERVER_ERROR_PREFIX + ":RpcError";
  statusCode = 409;

  constructor(cause: Error) {
    super(cause.message);
  }
}

export function rethrowRpcError<T>(e: Error): T {
  throw new RpcError(e);
}
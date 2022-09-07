import { ServerErrorBodyDto } from "../dto/serverErrorBodyDto";

export const SERVER_ERROR_PREFIX = "ServerError";

export class ServerError implements Error {
  name = SERVER_ERROR_PREFIX;
  statusCode = 500;

  constructor(public message: string) {
  }

  toJson(): ServerErrorBodyDto {
    return {
      status: this.statusCode,
      message: this.message,
      name: this.name
    }
  }
}

export class InvalidRequest extends ServerError {
  name = SERVER_ERROR_PREFIX + ":InvalidRequest";
  statusCode = 400;
  constructor(message: string) {
    super(message);
  }
}

export class NotFound extends ServerError {
  name = SERVER_ERROR_PREFIX + ":NotFound";
  statusCode = 404;
  constructor(message: string) {
    super(message);
  }
}

export class RpcError extends ServerError {
  name = SERVER_ERROR_PREFIX + ":RpcError";
  statusCode = 409;
  cause: Error;

  constructor(cause: Error) {
    super(cause.message);
    this.cause = cause;
  }
}

export function rethrowRpcError<T>(e: Error): T {
  throw new RpcError(e);
}
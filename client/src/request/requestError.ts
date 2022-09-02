export const REQUEST_ERROR_PREFIX = "RequestError";

export class RequestError implements Error {
  name = REQUEST_ERROR_PREFIX;
  message: string;

  constructor(
    public statusCode: number,
    public body: any
  ) {
    this.message = `Request to the server failed with ${statusCode}`;
  }
}
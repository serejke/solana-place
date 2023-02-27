import { parseServerErrorBody } from "../dto-converter/converter";
import { ServerErrorBodyDto } from "../dto/serverErrorBodyDto";

export const REQUEST_ERROR_PREFIX = "RequestError";

export async function rethrowIfFailed(response: Response) {
  if (!response.ok) {
    const errorBody = parseServerErrorBody(await response.json());
    throw new RequestError(response.status, errorBody);
  }
}

export class RequestError implements Error {
  name = REQUEST_ERROR_PREFIX;
  message: string;

  constructor(
    public statusCode: number,
    public errorBody: ServerErrorBodyDto | undefined
  ) {
    this.message = `Request to the server failed with ${statusCode}`;
  }
}

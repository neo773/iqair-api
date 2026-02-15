export class IQAirException extends Error {
  readonly statusCode: number;
  readonly body?: string;

  constructor(message: string, statusCode: number, body?: string) {
    super(message);
    this.name = "IQAirException";
    this.statusCode = statusCode;
    this.body = body;
  }
}

export interface VideoLinksErrorOptions {
  code: string;
  description: string;
  data?: unknown;
  cause?: unknown;
}

export class VideoLinksError extends Error {
  /** Error code */
  code: string;
  /** Error stack */
  stack!: string;
  /** Error data */
  data?: unknown;
  /** Error cause */
  cause?: unknown;

  constructor({ code, description, data, cause }: VideoLinksErrorOptions) {
    super(description);

    this.code = code;
    this.data = data;
    this.name = this.constructor.name;
    this.cause = cause;

    Error.captureStackTrace(this, this.constructor);
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }

  toJSON(): Pick<this, keyof this> {
    const json = {} as Pick<this, keyof this>;

    for (const key of Object.getOwnPropertyNames(this)) {
      json[key as keyof this] = this[key as keyof this];
    }

    return json;
  }
}

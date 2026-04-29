declare module "zod" {
  export interface ZodType<TOutput = unknown> {
    _output: TOutput;
    refine(check: (data: TOutput) => boolean, options?: unknown): this;
  }

  export interface ZodString extends ZodType<string> {
    min(length: number, options?: unknown): this;
    email(options?: unknown): this;
  }

  export type ZodRawShape = Record<string, ZodType<unknown>>;

  export type OutputFromShape<TShape extends ZodRawShape> = {
    [K in keyof TShape]: TShape[K] extends ZodType<infer TOutput>
      ? TOutput
      : never;
  };

  export interface ZodObject<TShape extends ZodRawShape> extends ZodType<
    OutputFromShape<TShape>
  > {
    refine(
      check: (data: OutputFromShape<TShape>) => boolean,
      options?: unknown,
    ): this;
  }

  export function string(): ZodString;

  export function object<TShape extends ZodRawShape>(
    shape: TShape,
  ): ZodObject<TShape>;

  export type infer<TSchema extends ZodType<unknown>> = TSchema["_output"];
}

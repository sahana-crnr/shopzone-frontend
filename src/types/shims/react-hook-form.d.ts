declare module "react-hook-form" {
  export type FieldValues = Record<string, unknown>;
  export type Mode = "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";

  export type FieldPath<TFieldValues extends FieldValues> = Extract<
    keyof TFieldValues,
    string
  >;

  export interface FieldError {
    type?: string;
    message?: string;
  }

  export type FieldErrors<TFieldValues extends FieldValues> = Partial<
    Record<FieldPath<TFieldValues>, FieldError>
  >;

  export interface UseFormRegisterReturn {
    name: string;
    onChange: (...event: unknown[]) => void;
    onBlur: (...event: unknown[]) => void;
    ref: (instance: unknown) => void;
  }

  export type SubmitHandler<TFieldValues extends FieldValues> = (
    data: TFieldValues,
  ) => void | Promise<void>;

  export interface UseFormProps<TFieldValues extends FieldValues> {
    resolver?: unknown;
    defaultValues?: Partial<TFieldValues>;
    mode?: string;
  }

  export interface UseFormReturn<TFieldValues extends FieldValues> {
    register: (name: FieldPath<TFieldValues>) => UseFormRegisterReturn;
    handleSubmit: (
      onValid: SubmitHandler<TFieldValues>,
    ) => (event?: unknown) => Promise<void>;
    setError: (name: FieldPath<TFieldValues>, error: FieldError) => void;
    trigger: (name?: FieldPath<TFieldValues>) => Promise<boolean>;
    formState: {
      errors: FieldErrors<TFieldValues>;
      isSubmitting: boolean;
    };
  }

  export function useForm<TFieldValues extends FieldValues = FieldValues>(
    props?: UseFormProps<TFieldValues>,
  ): UseFormReturn<TFieldValues>;
}

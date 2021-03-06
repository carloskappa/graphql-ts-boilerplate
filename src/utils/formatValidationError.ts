import { ValidationError } from "yup";

export const formatValidationError = (err: ValidationError) => {
  const errors: Array<{ path: string; message: string }> = [];
  err.inner.forEach(error => {
    errors.push({
      path: error.path,
      message: error.message
    });
  });

  return errors;
};

import { describe, it, expect } from 'vitest';
import { extractErrorMessage, extractValidationErrors } from './api';
import { AxiosError } from 'axios';

describe('extractErrorMessage', () => {
  it('returns the message from an AxiosError response', () => {
    const error = new AxiosError(
      undefined,
      undefined,
      undefined,
      undefined,
      {
        status: 400,
        data: { message: 'Validation failed' },
      } as any
    );
    expect(extractErrorMessage(error)).toBe('Validation failed');
  });

  it('returns default message when AxiosError has no response data message', () => {
    const error = new AxiosError(
      undefined,
      undefined,
      undefined,
      undefined,
      { status: 500, data: {} } as any
    );
    expect(extractErrorMessage(error)).toBe('An unexpected error occurred');
  });

  it('returns the error message from a regular Error', () => {
    const error = new Error('Network error');
    expect(extractErrorMessage(error)).toBe('Network error');
  });

  it('returns default message for unknown errors', () => {
    expect(extractErrorMessage('string error')).toBe('An unexpected error occurred');
  });

  it('returns default message for null', () => {
    expect(extractErrorMessage(null)).toBe('An unexpected error occurred');
  });

  it('returns default message for undefined', () => {
    expect(extractErrorMessage(undefined)).toBe('An unexpected error occurred');
  });

  it('prefers message over error field in AxiosError response', () => {
    const error = new AxiosError(
      undefined,
      undefined,
      undefined,
      undefined,
      {
        status: 400,
        data: {
          message: 'Specific error message',
          error: 'Bad Request',
        },
      } as any
    );
    expect(extractErrorMessage(error)).toBe('Specific error message');
  });
});

describe('extractValidationErrors', () => {
  it('returns validation errors from AxiosError response', () => {
    const validationErrors = { title: 'Title is required', author: 'Author is required' };
    const error = new AxiosError(
      undefined,
      undefined,
      undefined,
      undefined,
      {
        status: 400,
        data: { validationErrors },
      } as any
    );
    const result = extractValidationErrors(error);
    expect(result).toEqual(validationErrors);
  });

  it('returns null when AxiosError has no validation errors', () => {
    const error = new AxiosError(
      undefined,
      undefined,
      undefined,
      undefined,
      { status: 500, data: {} } as any
    );
    expect(extractValidationErrors(error)).toBeNull();
  });

  it('returns null for non-Axios errors', () => {
    expect(extractValidationErrors(new Error('Generic error'))).toBeNull();
  });

  it('returns null for null', () => {
    expect(extractValidationErrors(null)).toBeNull();
  });
});

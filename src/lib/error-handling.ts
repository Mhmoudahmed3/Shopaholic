
export type ActionResponse<T> = 
  | { status: 'success'; data: T; }
  | { status: 'error'; message: string; code: number; field?: string; };

export const catchAsyncAction = <T, Args extends unknown[]>(
  action: (...args: Args) => Promise<T>
) => {
  return async (...args: Args): Promise<ActionResponse<T>> => {
    try {
      const data = await action(...args);
      return { status: 'success', data };
    } catch (error: unknown) {
      console.error(`[Server Action Error]`, error);

      const err = error as { name?: string; code?: string; message?: string };

      // Handle custom or standard errors
      if (err.name === 'UnauthorizedError') {
         return { status: 'error', message: 'You must be logged in to perform this action.', code: 401 };
      }
      
      if (err.code === 'ENOENT') {
         return { status: 'error', message: 'Requested resource not found.', code: 404 };
      }

      // Generic Fallback
      return { 
        status: 'error', 
        message: err?.message || 'Internal Server Error. Please try again later.', 
        code: 500 
      };
    }
  };
};

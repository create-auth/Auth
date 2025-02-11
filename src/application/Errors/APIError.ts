class APIError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export default APIError;

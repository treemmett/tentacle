/* eslint-disable max-classes-per-file */

export class APIError extends Error {
  constructor(public message = 'An unknown error occurred', public status = 500) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AuthorizationError extends APIError {
  constructor(public message = 'Authorization failed') {
    super(message, 400);
  }
}

export class RepositoryNotFoundError extends APIError {
  constructor(public message = 'Repository not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends APIError {
  constructor(public message = 'Unauthorized request') {
    super(message, 403);
  }
}

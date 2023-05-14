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

export class CheckNotFoundError extends APIError {
  constructor(public message = 'Check not found') {
    super(message, 404);
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

export class IntegrationNotFoundError extends APIError {
  constructor(public message = 'Integration not found') {
    super(message, 404);
  }
}

export class ProjectNotFound extends APIError {
  constructor(public message = 'Project not found') {
    super(message, 404);
  }
}

export class VercelCommunicationError extends APIError {
  constructor(public message = 'Error communicating with Vercel') {
    super(message, 502);
  }
}

export class BadInputError extends APIError {
  constructor(public message = 'Bad input') {
    super(message, 400);
  }
}

export class GithubError extends APIError {
  constructor(public message = 'Error communicating with GitHub') {
    super(message, 502);
  }
}

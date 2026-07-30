declare global {
  namespace Express {
    interface Request {
      user?: import('../../../src/users/entities/user.entity').User;
    }
  }
}

export {};

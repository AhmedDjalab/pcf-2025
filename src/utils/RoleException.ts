class RoleException extends Error {
  name: string;

  constructor(message: string) {
    super(message);
    this.name = "RoleException";
    Object.setPrototypeOf(this, RoleException.prototype);
  }
}

export default RoleException;

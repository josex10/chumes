type DbError = { code?: string; message?: string } | null | undefined;

export function isUniqueViolation(error: DbError): boolean {
  return error?.code === "23505";
}

export function isForeignKeyViolation(error: DbError): boolean {
  return error?.code === "23503";
}

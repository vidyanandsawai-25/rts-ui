export type AnyRecord = Record<string, unknown>;
export type AuthUserData = { upicId?: string } & AnyRecord;

export type AuthUser = {
  userType: "user" | "admin";
  userData: AuthUserData;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JsonValue }
  | JsonValue[];

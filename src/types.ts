export type AllowArray<T> = T | T[];
export type Nullable<T> = T | null;
export type ObjectOrUnknown<T extends boolean, O> = T extends true ? O : unknown;

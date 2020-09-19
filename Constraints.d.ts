type PartialyReadonly<T, Keys extends keyof T = keyof T> = Omit<T, Keys> & Readonly<Pick<T, Keys>>
type PartialyRequired<T, Keys extends keyof T = keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>
type PartialyPartial<T, Keys extends keyof T = keyof T> = Omit<T, Keys> & Partial<Pick<T, Keys>>
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Omit<T, Keys> & AtLeastOneOf<T, Keys>
type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Omit<T, Keys> & OnlyOneOf<T, Keys>
type AtLeastOneOf<T, Keys extends keyof T = keyof T> = {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
}[Keys]
type OnlyOneOf<T, Keys extends keyof T = keyof T> = {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
}[Keys]

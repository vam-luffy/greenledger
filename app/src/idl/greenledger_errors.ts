
export const GreenledgerErrorCode = {
  StringTooLong: 6000,
  InvalidPeriod: 6001,
  VerifierInactive: 6002,
  ClaimAlreadyResolved: 6003,
  Unauthorized: 6004,
  ClaimSupplierMismatch: 6005
};

export type GreenledgerErrorName = keyof typeof GreenledgerErrorCode;

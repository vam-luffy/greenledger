/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/greenledger.json`.
 */
export type Greenledger = {
  "address": "Hd8P3F7NAnFA6KtYnWZzcfF6LSUMAN6khGXP7Z9kELaB",
  "metadata": {
    "name": "greenledger",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Verifiable ESG and carbon attestations for Indian MSMEs on Solana"
  },
  "instructions": [
    {
      "name": "addVerifier",
      "discriminator": [
        165,
        72,
        135,
        225,
        67,
        181,
        255,
        135
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "verifier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  114,
                  105,
                  102,
                  105,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "verifierAuthority"
              }
            ]
          }
        },
        {
          "name": "verifierAuthority"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "registry"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "accreditation",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeRegistry",
      "discriminator": [
        189,
        181,
        20,
        17,
        174,
        57,
        249,
        59
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "registerSupplier",
      "discriminator": [
        45,
        48,
        55,
        112,
        67,
        76,
        75,
        226
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "supplier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  112,
                  112,
                  108,
                  105,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "gstin",
          "type": "string"
        },
        {
          "name": "sector",
          "type": "string"
        }
      ]
    },
    {
      "name": "setVerifierActive",
      "discriminator": [
        110,
        160,
        142,
        137,
        87,
        162,
        141,
        124
      ],
      "accounts": [
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "verifier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  114,
                  105,
                  102,
                  105,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "verifier.authority",
                "account": "verifier"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "registry"
          ]
        }
      ],
      "args": [
        {
          "name": "active",
          "type": "bool"
        }
      ]
    },
    {
      "name": "submitClaim",
      "discriminator": [
        163,
        108,
        111,
        46,
        220,
        82,
        77,
        212
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "supplier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  112,
                  112,
                  108,
                  105,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "claim",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  105,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "supplier"
              },
              {
                "kind": "account",
                "path": "supplier.claimCount",
                "account": "supplier"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "supplier"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "kind",
          "type": {
            "defined": {
              "name": "claimKind"
            }
          }
        },
        {
          "name": "periodStart",
          "type": "i64"
        },
        {
          "name": "periodEnd",
          "type": "i64"
        },
        {
          "name": "value",
          "type": "u64"
        },
        {
          "name": "unit",
          "type": "string"
        },
        {
          "name": "evidenceHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "evidenceUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "verifyClaim",
      "discriminator": [
        35,
        121,
        58,
        82,
        51,
        132,
        99,
        113
      ],
      "accounts": [
        {
          "name": "verifier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  114,
                  105,
                  102,
                  105,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "verifierAuthority"
              }
            ]
          }
        },
        {
          "name": "supplier",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  112,
                  112,
                  108,
                  105,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "supplier.owner",
                "account": "supplier"
              }
            ]
          }
        },
        {
          "name": "claim",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  97,
                  105,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "supplier"
              },
              {
                "kind": "account",
                "path": "claim.index",
                "account": "claim"
              }
            ]
          }
        },
        {
          "name": "verifierAuthority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "approve",
          "type": "bool"
        },
        {
          "name": "note",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "claim",
      "discriminator": [
        155,
        70,
        22,
        176,
        123,
        215,
        246,
        102
      ]
    },
    {
      "name": "registry",
      "discriminator": [
        47,
        174,
        110,
        246,
        184,
        182,
        252,
        218
      ]
    },
    {
      "name": "supplier",
      "discriminator": [
        83,
        248,
        232,
        49,
        94,
        98,
        120,
        208
      ]
    },
    {
      "name": "verifier",
      "discriminator": [
        195,
        177,
        185,
        71,
        72,
        61,
        77,
        112
      ]
    }
  ],
  "events": [
    {
      "name": "claimSubmitted",
      "discriminator": [
        95,
        1,
        120,
        227,
        177,
        240,
        174,
        52
      ]
    },
    {
      "name": "claimVerified",
      "discriminator": [
        90,
        196,
        170,
        218,
        88,
        102,
        26,
        4
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "stringTooLong",
      "msg": "String exceeds maximum length"
    },
    {
      "code": 6001,
      "name": "invalidPeriod",
      "msg": "Reporting period end must be after start"
    },
    {
      "code": 6002,
      "name": "verifierInactive",
      "msg": "Verifier is not active"
    },
    {
      "code": 6003,
      "name": "claimAlreadyResolved",
      "msg": "Claim has already been verified or rejected"
    },
    {
      "code": 6004,
      "name": "unauthorized",
      "msg": "Signer is not the verifier authority"
    },
    {
      "code": 6005,
      "name": "claimSupplierMismatch",
      "msg": "Claim does not belong to this supplier"
    }
  ],
  "types": [
    {
      "name": "claim",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "supplier",
            "type": "pubkey"
          },
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "kind",
            "type": {
              "defined": {
                "name": "claimKind"
              }
            }
          },
          {
            "name": "periodStart",
            "type": "i64"
          },
          {
            "name": "periodEnd",
            "type": "i64"
          },
          {
            "name": "value",
            "docs": [
              "Quantity in `unit`, scaled by 1000 (three decimals)."
            ],
            "type": "u64"
          },
          {
            "name": "unit",
            "type": "string"
          },
          {
            "name": "evidenceHash",
            "docs": [
              "SHA-256 of the evidence document (invoice, meter reading, REC certificate)."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "evidenceUri",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "claimStatus"
              }
            }
          },
          {
            "name": "verifier",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "verifiedAt",
            "type": "i64"
          },
          {
            "name": "note",
            "type": "string"
          },
          {
            "name": "submittedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "claimKind",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "energyConsumption"
          },
          {
            "name": "scope1Emissions"
          },
          {
            "name": "scope2Emissions"
          },
          {
            "name": "renewableCertificate"
          },
          {
            "name": "waterUsage"
          },
          {
            "name": "wasteDiverted"
          }
        ]
      }
    },
    {
      "name": "claimStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "verified"
          },
          {
            "name": "rejected"
          }
        ]
      }
    },
    {
      "name": "claimSubmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "supplier",
            "type": "pubkey"
          },
          {
            "name": "claim",
            "type": "pubkey"
          },
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "kind",
            "type": {
              "defined": {
                "name": "claimKind"
              }
            }
          }
        ]
      }
    },
    {
      "name": "claimVerified",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "claim",
            "type": "pubkey"
          },
          {
            "name": "verifier",
            "type": "pubkey"
          },
          {
            "name": "approved",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "registry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "verifierCount",
            "type": "u64"
          },
          {
            "name": "supplierCount",
            "type": "u64"
          },
          {
            "name": "claimCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "supplier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "gstin",
            "type": "string"
          },
          {
            "name": "sector",
            "type": "string"
          },
          {
            "name": "claimCount",
            "type": "u64"
          },
          {
            "name": "verifiedCount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "verifier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "accreditation",
            "type": "string"
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "verifiedCount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

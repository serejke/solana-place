export type SolanaPlace = {
  "version": "0.1.0",
  "name": "solana_place",
  "instructions": [
    {
      "name": "initializeOnly",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "height",
          "type": "u16"
        },
        {
          "name": "width",
          "type": "u16"
        },
        {
          "name": "changeCost",
          "type": "u32"
        }
      ]
    },
    {
      "name": "changeColor",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "row",
          "type": "u16"
        },
        {
          "name": "column",
          "type": "u16"
        },
        {
          "name": "color",
          "type": "u8"
        }
      ]
    },
    {
      "name": "changeColors",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "encodedChanges",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gameAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": "u32"
          },
          {
            "name": "height",
            "type": "u16"
          },
          {
            "name": "width",
            "type": "u16"
          },
          {
            "name": "changeCost",
            "docs": [
              "Cost of changing a single color, in micro-lamports."
            ],
            "type": "u32"
          },
          {
            "name": "colors",
            "type": "bytes"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "PixelColorChangedEvent",
      "fields": [
        {
          "name": "state",
          "type": "u32",
          "index": false
        },
        {
          "name": "row",
          "type": "u16",
          "index": false
        },
        {
          "name": "column",
          "type": "u16",
          "index": false
        },
        {
          "name": "oldColor",
          "type": "u8",
          "index": false
        },
        {
          "name": "newColor",
          "type": "u8",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GameSizeIsNotSupported",
      "msg": "Game initial size is not supported"
    },
    {
      "code": 6001,
      "name": "PixelOutOfBounds",
      "msg": "Pixel is not within the game's bounds"
    },
    {
      "code": 6002,
      "name": "IncorrectGameChangesEncoding",
      "msg": "Game changes are encoded incorrectly, must be 5 bytes: <row 2><column 2><color 1>"
    }
  ]
};

export const IDL: SolanaPlace = {
  "version": "0.1.0",
  "name": "solana_place",
  "instructions": [
    {
      "name": "initializeOnly",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "height",
          "type": "u16"
        },
        {
          "name": "width",
          "type": "u16"
        },
        {
          "name": "changeCost",
          "type": "u32"
        }
      ]
    },
    {
      "name": "changeColor",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "row",
          "type": "u16"
        },
        {
          "name": "column",
          "type": "u16"
        },
        {
          "name": "color",
          "type": "u8"
        }
      ]
    },
    {
      "name": "changeColors",
      "accounts": [
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "encodedChanges",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gameAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": "u32"
          },
          {
            "name": "height",
            "type": "u16"
          },
          {
            "name": "width",
            "type": "u16"
          },
          {
            "name": "changeCost",
            "docs": [
              "Cost of changing a single color, in micro-lamports."
            ],
            "type": "u32"
          },
          {
            "name": "colors",
            "type": "bytes"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "PixelColorChangedEvent",
      "fields": [
        {
          "name": "state",
          "type": "u32",
          "index": false
        },
        {
          "name": "row",
          "type": "u16",
          "index": false
        },
        {
          "name": "column",
          "type": "u16",
          "index": false
        },
        {
          "name": "oldColor",
          "type": "u8",
          "index": false
        },
        {
          "name": "newColor",
          "type": "u8",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GameSizeIsNotSupported",
      "msg": "Game initial size is not supported"
    },
    {
      "code": 6001,
      "name": "PixelOutOfBounds",
      "msg": "Pixel is not within the game's bounds"
    },
    {
      "code": 6002,
      "name": "IncorrectGameChangesEncoding",
      "msg": "Game changes are encoded incorrectly, must be 5 bytes: <row 2><column 2><color 1>"
    }
  ]
};

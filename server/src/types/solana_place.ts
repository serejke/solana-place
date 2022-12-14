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
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
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
            "name": "authority",
            "docs": [
              "Authority granted with game management permissions."
            ],
            "type": "publicKey"
          },
          {
            "name": "state",
            "docs": [
              "ID of the current state of the board, which gets incremented by 1 on every change."
            ],
            "type": "u32"
          },
          {
            "name": "height",
            "docs": [
              "Height of the game board, number of rows."
            ],
            "type": "u16"
          },
          {
            "name": "width",
            "docs": [
              "Width of the game board, number of columns."
            ],
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
            "docs": [
              "Flattened map of colors. Pixel `<row> <column>` is at `index = <row> * width + <column>`."
            ],
            "type": {
              "array": [
                "u8",
                150000
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PixelColorChange",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "row",
            "type": "u16"
          },
          {
            "name": "column",
            "type": "u16"
          },
          {
            "name": "oldColor",
            "type": "u8"
          },
          {
            "name": "newColor",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "PixelColorsChangedEvent",
      "fields": [
        {
          "name": "state",
          "type": "u32",
          "index": false
        },
        {
          "name": "newState",
          "type": "u32",
          "index": false
        },
        {
          "name": "changes",
          "type": {
            "vec": {
              "defined": "PixelColorChange"
            }
          },
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
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
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
            "name": "authority",
            "docs": [
              "Authority granted with game management permissions."
            ],
            "type": "publicKey"
          },
          {
            "name": "state",
            "docs": [
              "ID of the current state of the board, which gets incremented by 1 on every change."
            ],
            "type": "u32"
          },
          {
            "name": "height",
            "docs": [
              "Height of the game board, number of rows."
            ],
            "type": "u16"
          },
          {
            "name": "width",
            "docs": [
              "Width of the game board, number of columns."
            ],
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
            "docs": [
              "Flattened map of colors. Pixel `<row> <column>` is at `index = <row> * width + <column>`."
            ],
            "type": {
              "array": [
                "u8",
                150000
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PixelColorChange",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "row",
            "type": "u16"
          },
          {
            "name": "column",
            "type": "u16"
          },
          {
            "name": "oldColor",
            "type": "u8"
          },
          {
            "name": "newColor",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "PixelColorsChangedEvent",
      "fields": [
        {
          "name": "state",
          "type": "u32",
          "index": false
        },
        {
          "name": "newState",
          "type": "u32",
          "index": false
        },
        {
          "name": "changes",
          "type": {
            "vec": {
              "defined": "PixelColorChange"
            }
          },
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

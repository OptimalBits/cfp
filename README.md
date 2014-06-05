cfp
===

Nordea Corporate File Payments.

This module can generate PO3 files suitable to automate payments using Nordea
file service.


Install
=======

```npm install cfp```

Usage
=====

```
var cfp = require('cfp');

var sender = {
  id: "5568415292",
  account: "123456789",
  srcCurrency: "SEK",
  dstCurrency: "SEK",
  name: "My Example Company",
  address: {
    city: "Foo bar",
    postcode: "12345",
    street: String,
  }
}

var payments =
[
  {
    name?: String, // Recipient name
    account: String, // Account number
    type: String, // plusgiro, bankgiro or bankaccount
    amount: String, // integer with two digits for cents.
    bookkeepingDate?: Date,
    ocr?: String // OCR or message like faktura number, etc.
    message?: String // Message to the recipient.
    clearingNumber?: String // 3300 default
    address?: {
      city: String,
      postcode: String,
      street: String,
    }
    note: String, // A note for the sender.
  },
];

var po3file = cfp(sender, payments)


```


"use strict";

var moment = require('moment');

/**
  Describes a post. (MH00/MH10).  
*/
/**
  Format:
  
  MH00/MH10 begin
    PI00  payment instruction
    BA00  sender own note
    BA01  other sendare if different from account owner
    BA02
    BA03
    .
    .
    .
    PI00  payment instruction
    BA00  sender own note
    BA01  other sendare if different from account owner
    BA02
    BA03
    .
    .
    .
  MT00 end
*/

/**
  Outputs a post for the given arguments.
  
  PostArguments: {
    sender: {
      id: String, // Org number.
      account: String, // Account.
      srcCurrency: String, // SEK / EUR
      dstCurrency: String, // SEK/EUR
      name: String,
      address: {
        city: String,
        postcode: String,
        street: String,
      }
    },
    payments: [
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
  }
  
  args
  dstAccount: String // PlusGiro, BankGiro or BankAccount
  bookkeepingDate: Date 
  amount: String|Number // Integer including cents (ex. 1000 is 10,00 SEK)
  ocr: String // OCR or message like faktura number, etc.
  clearingNumber: String // 3300 default
*/
function outputPost(sender, payments){
  var totalAmount = 0;

  var output = outputBegin({
    senderId: sender.id,
    senderAccount: sender.account,
    srcCurrency: sender.srcCurrency,
    dstCurrency: sender.dstCurrency,
  }) + '\n';
  
  output += outputName(sender.name, true) + '\n';
  output += outputAddress(sender.address, true) + '\n';
  
  payments.forEach(function(payment){
    totalAmount += parseInt(payment.amount);
    output += outputPayment(payment) + '\n';
    
    if(payment.note){
      output += outputNote(payment.note) + '\n';
    }
    
    if(payment.type === 'utbetalningskort'){
      output += outputName(payment.name, false) + '\n';
      output += outputAddress(payment.address, false) + '\n';
    }
    
    if(payment.message){
      output += outputRecipientMessage(payment.message) + '\n';
    }
  });
  
  output += outputEnd(payments.length, totalAmount) + '\n';
  
  return output;
}

function outputAddress(address, isSender){
  var output = '';
  if(address){
    output += 
      outputAddressCity(address.postcode, address.city, isSender) + '\n'
    output += 
      outputAddressStreet(address.street, isSender);
  }
  return output;
}


/**
args:
  senderId: String (organization number)
  senderAccount: String,
  
  dstCurrency?: String (pg and bg SEK/EUR otherwise only SEK, default:SEK)
  srcCurrency?: String ((pg and bg SEK/EUR otherwise only SEK, default:SEK)
*/
function outputBegin(args){
  var senderId = args.senderId || '';
  var senderAccount = args.senderAccount || '';
  var dstCurrency = args.dstCurrency || 'SEK';
  var srcCurrency = args.sourceCurrency || 'SEK';
  
  if(dstCurrency.length !== 3){
    throw Error("Target currency must be most 3 characters:" + dstCurrency);
  }
  if(srcCurrency.length !== 3){
    throw Error("Target currency must be most 3 characters:" + srcCurrency);
  }
  
  if(senderId.length !== 10){
    throw Error("senderId (organization number) must be 10 digits");
  }
  
  if(senderAccount.length > 10){
    throw Error("senderAccount must be max 10 digits long");
  }

  return [
    "MH00",
    spaces(8),
    senderId,
    spaces(12),
    rightPad(senderAccount, 10),
    dstCurrency,
    spaces(6),
    srcCurrency,
    spaces(24)
  ].join('');
}

function outputEnd(numPayments, totalAmount){
  var output = ['MT00'];
  
  output.push(spaces(25));
  output.push(pad(numPayments, 7, '0'));
  output.push(pad(totalAmount, 15, '0'));
  output.push(spaces(29));
  
  return output.join('');
}

/**
  args
  account: String // PlusGiro, BankGiro or BankAccount
  bookkeepingDate: Date 
  amount: String|Number // Integer including cents (ex. 1000 is 10,00 SEK)
  ocr: String // OCR or message like faktura number, etc.
  clearingNumber: String // 3300 default
*/
function outputPayment(args){
  var dstAccount = args.account;
  var accountType = args.type;
  var ocr = args.ocr || '';
  
  var output = ['PI00'];
  
  switch(accountType){
    case 'plusgiro':
    case 'bankgiro':
      if(accountType == 'plusgiro'){
        output.push('00');
      }else{
        output.push('05');
      }
      output.push(spaces(5));
      
      output.push(rightPad(dstAccount, 11));
      
      output.push(spaces(2));
      
      output.push(outputDate(args.bookkeepingDate));
      
      output.push(pad(args.amount, 13, '0'));
      output.push(pad(ocr, 25))
      output.push(spaces(10));
      break;
      
    case 'account':
      output.push('09');
      
      var clearingNumber = args.clearingNumber || '3300';

      output.push(rightPad(clearingNumber, 5));
      output.push(rightPad(dstAccount, 11));
      output.push(spaces(2));

      output.push(outputDate(args.bookkeepingDate));

      output.push(pad(args.amount, 13, '0'));

      output.push(pad(ocr, 20));
      output.push(spaces(15));
      break;

    default:
      throw Error("Unsupported payment type:"+args.type);
  }
  
  return output.join('');
}

function outputSenderNote(note){
  var output = ['BA00'];

  output.push(rightPad(note, 18));
  output.push(spaces(58));
 
  return output.join('');
}

function outputName(name, isSender){
  var output = [isSender ? 'BA01' : 'BE01'];
 
  output.push(spaces(18));
  output.push(rightPad(name, 35));
  output.push(spaces(23));
 
  return output.join('');
}


function outputAddressCity(postcode, city, isSender){
  var output = [isSender ? 'BA02' : 'BE02'];
 
  output.push(rightPad(postcode, 9));
  output.push(rightPad(city, 25));
  
  output.push(spaces(42));
 
  return output.join('');
}

function outputAddressStreet(street, isSender){
  var output = [isSender ? 'BA03' : 'BE03'];
  var rows = street.split('\n');
 
  output.push(rightPad(rows[0], 35));
  output.push(rightPad(rows[1], 35));

  output.push(spaces(6));
 
  return output.join('');
}

function outputRecipientMessage(msg){
  var output = ['BM99'];

  if(msg.length > 70){
    throw Error("Message too large (max 70 charactes)");
  }

  output.push(rightPad(msg, 70));
  output.push(spaces(6));
  
  return output.join('');
}

function outputDate(date){
  if(date){
    return moment(date).format('YYYYMMDD');
  }else{
    return spaces(8);
  }
}

function spaces(num){
  return repeat(num);
}

function repeat(num, char){
  if(typeof char === 'undefined'){
    char = ' ';
  }
  return (new Array(num+1)).join(char);
}

function rightPad(txt, total, z){
  txt = txt || '';
  if(txt.length > total) throw Error("string is too long:"+txt.length)
  txt = ''+txt;
  
  if(txt.length < total){
    return txt += repeat(total - txt.length, z);
  }else{
    return txt;
  }
}

function pad(txt, total, z){
  txt = txt || '';
  if(txt.length > total) throw Error("string is too long:"+txt.length)
  txt = ''+txt;
  if(txt.length < total){
    return txt = repeat(total - txt.length, z) + txt;
  }else{
    return txt;
  }
}

module.exports = {
  outputPost: outputPost,
  outputBegin: outputBegin,
  outputEnd: outputEnd,
  outputPayment: outputPayment,
  outputSenderNote: outputSenderNote,
  outputName: outputName,
  outputAddressCity: outputAddressCity,
  outputAddressStreet: outputAddressStreet,
  outputRecipientMessage: outputRecipientMessage
}

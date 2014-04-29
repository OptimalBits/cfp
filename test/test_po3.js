var post = require('../lib/post.js');
var chai = require('chai');
var expect = chai.expect;

describe("PO3 File format", function(){
  
  describe('Post', function(){
    it("should output a complete valid post", function(){
      var output = post.outputPost({
        id: "5568415292",
        account: "12345678",
        srcCurrency: "SEK",
        dstCurrency: "SEK",
        name: "Optimal Bits Sweden AB",
        address: {
          city: "Lomma",
          postcode: "23443",
          street: "Skolskeppsgatan 26"
        }
      },[{
        name: "Mad Cat AB",
        account: "32546754",
        type: "plusgiro",
        amount: "50000",
        bookkeepingDate: new Date(),
        message: "Castmill Payment MARCH 2014",
        ocr: "Fak. nr. #123122",
        address: {
          city: "Röstånga",
          postcode: "72323",
          street: "Solvägen 2"
        }
      }])
    })
  
  
  })

  describe("Posts methods", function(){
    it("should output valid begin", function(){
      var begin = post.outputBegin({
        senderId: "5568415292",
        senderAccount: "1234567890",
        dstCurrency: "SEK",
        srcCurrency: "EUR"
      });
      expect(begin).to.have.length(80);
    });
    
    it("should output valid end", function(){
      var end = post.outputEnd(20, 15000);
      expect(end).to.have.length(80);
    });
    
    it("should output valid PLUSGIRO payment", function(){
      var payment = post.outputPayment({
        dstAccount: "55678762",
        bookkeepingDate: new Date(),
        amount: "2000000",
        ocr: "Catmill payment 201403",
        type: 'plusgiro'
      });
      expect(payment).to.have.length(80);
    });
    
    it("should output valid BANKGIRO payment", function(){
      var payment = post.outputPayment({
        dstAccount: "55678762",
        bookkeepingDate: new Date(),
        amount: "2000000",
        ocr: "Catmill payment 201403",
        type: 'bankgiro'
      });
      expect(payment).to.have.length(80);
    });
    
    it("should output valid ACCOUNT payment", function(){
      var payment = post.outputPayment({
        dstAccount: "55678762",
        bookkeepingDate: new Date(),
        amount: "2000000",
        ocr: "Castmill 201403",
        type: 'account'
      });
      expect(payment).to.have.length(80);
    });

    it("should output valid sender node", function(){
      var note = post.outputSenderNote("Hello World 123");
      expect(note).to.have.length(80);
    });

    it("should output valid sender name", function(){
      var name = post.outputName("Optimal Bits Sweden AB", true);
      expect(name).to.have.length(80);
    });

    it("should output valid recipient name", function(){
      var name = post.outputName("Optimal Bits Sweden AB", false);
      expect(name).to.have.length(80);
    });

    it("should output valid sender city", function(){
      var city = post.outputAddressCity("23443", "Lomma", true);
      expect(city).to.have.length(80);
    });

    it("should output valid recipient city", function(){
      var city = post.outputAddressCity("23443", "Lomma", false);
      expect(city).to.have.length(80);
    });

    it("should output valid sender street", function(){
      var street = post.outputAddressStreet("Scheelevägen 15, Beta 3", true);
      expect(street).to.have.length(80);
    });
        
    it("should output valid recipient street", function(){
      var street = post.outputAddressStreet("Scheelevägen 15, Beta 3", false);
      expect(street).to.have.length(80);
    });

    it("should output valid recipient message", function(){
      var msg = post.outputRecipientMessage("Castmill Payment March 2014");
      expect(msg).to.have.length(80);
    });
  });
  
});

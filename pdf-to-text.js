var PFParser = require('pdf2json');

var SEP = '!';
var pdfParser = new PFParser();
var pdfText = '';

pdfParser.on("pdfParser_dataReady", function(pdf) {
  pdf.data.Pages.forEach(function(page) {
    page.Texts.forEach(function(text) {
      text.R.forEach(function(r) {
        pdfText += decodeURIComponent(r.T).replace(/ /g, '') + SEP;
      });
    });
  });

  console.log(pdfText);
});

pdfParser.on("pdfParser_dataError", function(pdf) {
  console.log('Failed to parse ' + pdfFilePath);
});

pdfParser.loadPDF('/Users/owenchu/Downloads/f1395126076343.pdf');

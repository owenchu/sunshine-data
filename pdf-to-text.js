var SEP = '!';

var main = function() {
  if (process.argv.length != 3) {
    console.log('Usage: node text-to-json.js pdf-file');
    return;
  }

  var PFParser = require('pdf2json');
  var pdfParser = new PFParser();
  var pdfText = '';

  pdfParser.on("pdfParser_dataReady", function(pdf) {
    pdf.data.Pages.forEach(function(page) {
      page.Texts.forEach(function(text) {
        text.R.forEach(function(r) {
          pdfText += decodeURIComponent(r.T).replace(/ /g, '') + SEP
        });
      });
    });

    process.stdout.write(pdfText);
  });
  pdfParser.on("pdfParser_dataError", function(pdf) {
    console.log('Failed to parse ' + pdfFilePath);
  });

  pdfParser.loadPDF(process.argv[2]);
};

if (require.main === module) {
  main();
}

var SEP = '!';

var getLegislators = function(text) {
  var regExpLegislators = new RegExp(
      insertSep('公職人員財產申報表', '申報人姓名') +
      '.+?' + '服務機關', 'g');
  var results = text.match(regExpLegislators);
  var legislators = [];

  results.forEach(function(result) {
    var name = removeSep(result).match(/姓名(.*)服務機關/)[1];

    if (legislators.indexOf(name) === -1) {
      legislators.push(name);
    }
  });

  return legislators;
};

var insertSep = function() {
  if (arguments.length <= 0) {
    return '';
  }

  return Array.prototype.join.call(arguments, SEP) + SEP;
};

var removeSep = function(str) {
  return str.replace(new RegExp(SEP, 'g'), '');
};

var main = function() {
  if (process.argv.length != 2) {
    console.log('Usage: node get-legislator-list.js < input-normalized.txt');
    return;
  }

  var text = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', function() {
    text += process.stdin.read();
  });
  process.stdin.on('end', function() {
    getLegislators(text).forEach(function(legislator) {
      console.log(legislator);
    });
  });
};

if (require.main === module) {
  main();
}

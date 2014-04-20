var SEP = '!';

var removePageFooter = function(text) {
  var regExpPageFooter = new RegExp(
      insertSep(
        '監察院公報', '……….', '廉', '政', '專', '刊',
        '第', '\\d{1,3}', '期', '\\d{1,3}'),
      'g');
  return text.replace(regExpPageFooter, '');
};

var insertSep = function() {
  if (arguments.length <= 0) {
    return '';
  }

  return Array.prototype.join.call(arguments, SEP) + SEP;
};

var main = function() {
  var text = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', function() {
    text += process.stdin.read();
  });
  process.stdin.on('end', function() {
    text = removePageFooter(text);
    process.stdout.write(text);
  });
};

if (require.main === module) {
  main();
}

var SEP = '!';
var OPTIONAL_SEP = SEP + '?';

var removeUnwantedTerms = function(text) {
  var unwantedTerms = [
    insertOptionalSep('監察院公報……….廉政專刊第') +
      '(\\d{1,3})' + insertOptionalSep('期') + '(\\d{1,3})' + OPTIONAL_SEP
  ];

  return text.replace(new RegExp(unwantedTerms[0], 'g'), SEP);
};

var removeSepFromKnownTerms = function(text) {
  var knownTerms = [
    '公職人員財產申報表',
    '申報人姓名',
    '申報日',
    '（二）不動產',
    '1.土地',
    '2.建物（房屋及停車位）',
    '（三）船舶',
    '（四）汽車（含大型重型機器腳踏車）',
    '（五）航空器',
    '（六）現金（指新臺幣、外幣之現金或旅行支票）',
    '（七）存款（指新臺幣、外幣之存款）',
    '（八）有價證券',
    '（九）珠寶、古董、字畫及其他具有相當價值之財產',
    '（十）債權',
    '（十一）債務',
    '（十二）事業投資',
    '（十三）備註',
    '取得價額'
  ];

  knownTerms.forEach(function(term) {
    text = text.replace(
        new RegExp(insertOptionalSep(term), 'g'), wrapStrWithSep(term));
  });

  return text;
};

var insertOptionalSep = function(str) {
  if (!str) {
    throw 'Invalid string.';
  }

  return OPTIONAL_SEP + str.split('').join(OPTIONAL_SEP) + OPTIONAL_SEP;
};

var wrapStrWithSep = function(str) {
  if (!str) {
    throw 'Invalid string.';
  }

  return SEP + str + SEP;
};

var main = function() {
  var text = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', function() {
    text += process.stdin.read();
  });
  process.stdin.on('end', function() {
    text = removeUnwantedTerms(text);
    text = removeSepFromKnownTerms(text);
    process.stdout.write(text);
  });
};

if (require.main === module) {
  main();
}

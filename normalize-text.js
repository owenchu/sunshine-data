var SEP = '!';
var OPTIONAL_SEP = SEP + '?';

var removeUnwantedTerms = function(text) {
  var unwantedTerms = [
    insertOptionalSep('監察院公報……….廉政專刊第') +
      '(\\d{1,3})' + insertOptionalSep('期') + '(\\d{1,3})' + OPTIONAL_SEP
  ];

  unwantedTerms.forEach(function(term) {
    text = text.replace(new RegExp(term, 'g'), SEP);
  });

  return text;
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
    '取得價額',
    '本欄空白',
    '地號',
    '建號',
    '買賣',
    '繼承',
    '受贈',
    '夫妻贈與',
    '拍賣',
    '第一次登記',
    '共有物分割',
    '逕為合併',
    '塗銷信託',
    '（總金額：新臺幣',
    '（總價額：新臺幣'
  ];

  knownTerms.forEach(function(term) {
    text = text.replace(
        new RegExp(insertOptionalSep(term), 'g'), wrapStrWithSep(term));
  });

  return text;
};

var fixBrokenParts = function(text) {
  // WARNING: The separator is hard-coded in the following table.
  var brokenParts = [
    {oldStr: '新北市淡水區海天段!01761!-!000!51.15!100000!分!劉娟娟!95!年!03!月!買賣!(!超過五年!)!建號!之!303!15!日',
     newStr: '新北市淡水區海天段!01761!-!000!建號!51.15!100000!分!之!303!劉娟娟!95!年!03!月!15!日!買賣!(!超過五年!)'},
    {oldStr: '新北市汐止區金龍段!1265!-!0000!地號!23,654.55!100000!分!之!16!李慶華!102!年!05!買賣!1,100,000!月!01!日',
     newStr: '新北市汐止區金龍段!1265!-!0000!地號!23,654.55!100000!分!之!16!李慶華!102!年!05!月!01日!買賣!1,100,000!'},
    {oldStr: '南投縣集集鎮八張段!0468!-!0002!地號!73.63!3!分之!2!林明溱!94!年!06!月!共有物分割!466,323(!超過!五年!)!22!日',
     newStr: '南投縣集集鎮八張段!0468!-!0002!地號!73.63!3!分之!2!林明溱!94!年!06!月!22!日!共有物分割!466,323(!超過!五年!)'},
    {oldStr: '高雄市杉林區上平段!0529!-!0000!地號!942.75!11!分之!1!林郁方!90!年!06!月!繼承!(!超過五年!)!21!日',
     newStr: '高雄市杉林區上平段!0529!-!0000!地號!942.75!11!分之!1!林郁方!90!年!06!月!21!日!繼承!(!超過五年!)'},
    {oldStr: '本件!3468!建號!為!板橋市海山段!2097!地號!之地上!建物',
     newStr: '本件!3468!建!號!為!板橋市海山段!2097!地!號!之地上!建物'},
    {oldStr: '嘉義!縣朴子市安福段!1144!-!0000!地號!338!全部!廖素惠!97!年!05!月!夫妻贈與!6,084,000!23!日',
     newStr: '嘉義!縣朴子市安福段!1144!-!0000!地號!338!全部!廖素惠!97!年!05!月!23!日!夫妻贈與!6,084,000'},
    {oldStr: '及!6!-!1!地號',
     newStr: '及!6!-!1!地!號'},
    {oldStr: '及!6!-!1!地號',
     newStr: '及!6!-!1!地!號'},
    {oldStr: '及!6!-!1!地號',
     newStr: '及!6!-!1!地!號'},
    {oldStr: '及!6!-!1!地號',
     newStr: '及!6!-!1!地!號'},
    {oldStr: '及!5!-!11!地號',
     newStr: '及!5!-!11!地!號'},
    {oldStr: '嘉義縣朴子市梅華里!299!全部!廖素惠',
     newStr: '嘉義縣朴子市梅華里?????-???建號!299!全部!廖素惠'},
    {oldStr: '苗栗縣竹南鎮中興段!0828!-!0008!地號!26!5!分之!1!陳超明!91!年!11!月!繼承!(!超過五年!)!11!日',
     newStr: '苗栗縣竹南鎮中興段!0828!-!0008!地號!26!5!分之!1!陳超明!91!年!11!月!11!日!繼承!(!超過五年!)'},
    {oldStr: '苗栗縣竹南鎮五福段!0369!-!0000!地號!73.99!180965!分!之!388!3!陳超明!100!年!11!繼承!2,857!月!15!日',
     newStr: '苗栗縣竹南鎮五福段!0369!-!0000!地號!73.99!180965!分!之!388!3!陳超明!100!年!11!月!15!日!繼承!2,857'},
    {oldStr: '苗栗縣竹南鎮照南里!2!鄰光復路!128.30!100000!分!之!33333!陳!超明',
     newStr: '苗栗縣竹南鎮照南里!2!鄰光復路?????-???建號!128.30!100000!分!之!33333!陳!超明'},
    {oldStr: '新北市永和區民治段!0259!-!0000!地號!23!.28!5!分之!1!廖賢哲!76!年!05!月!買賣!(!超過五年!)!29!日',
     newStr: '新北市永和區民治段!0259!-!0000!地號!23!.28!5!分之!1!廖賢哲!76!年!05!月!29!日!買賣!(!超過五年!)'},
    {oldStr: '中和區安邦!段!974.975.976.977.978.979.980.981.1072!地號!合併後為安邦!段!963!地號',
     newStr: '中和區安邦!段!974.975.976.977.978.979.980.981.1072!地!號!合!併後為安邦!段!963!地!號'},
  ];

  brokenParts.forEach(function(part) {
    text = text.replace(part.oldStr, part.newStr);
  });

//  var str = '165th';
//  var index = text.indexOf(str);
//  console.log(text.substring(index-30, index+3050));
//  console.log('');
//
  return text;
};

var fixDates = function(text) {
  var regExpDate = new RegExp(
      OPTIONAL_SEP +
      '(\\d+)' + insertOptionalSep('年') +
      '(\\d+)' + insertOptionalSep('月') +
      '(\\d+)' + insertOptionalSep('日'), 'g');

  return text.replace(regExpDate, wrapStrWithSep('$1年$2月$3日'));
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
    text = fixBrokenParts(text);
    text = fixDates(text);
    process.stdout.write(text);
  });
};

if (require.main === module) {
  main();
}

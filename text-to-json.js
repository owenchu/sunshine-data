var SEP = '!';
var DATE_PATTERN = '(\\d+)年(\\d+)月(\\d+)日';

var parseText = function(text, legislator) {
  var sunshineInfo = {'legislator': legislator};
  var regExpForm = new RegExp(
      insertSep('公職人員財產申報表', '申報人姓名') +
      legislator + '(.*)' + '申報人：' + legislator);
  var results = text.match(regExpForm);

  if (!results || results.length != 2) {
    throw 'Failed to parse form for ' + legislator;
  }

  parseForm(results[1], sunshineInfo);

  console.log(sunshineInfo);
};

var parseForm = function(form, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var results;

  var regExpReportDate = new RegExp(insertSep('申報日', DATE_PATTERN));
  results = form.match(regExpReportDate);
  if (!results || results.length != 4) {
    throw 'Failed to parse report date for ' + legislator;
  }

  sunshineInfo['report-date'] = new Date(
      parseInt(results[1], 10) + 1911,
      parseInt(results[2], 10) - 1,
      parseInt(results[3], 10));

  // Parse real estate.
  var regExpRealEstate= /（二）不動產(.*)（三）船舶/;
  results = form.match(regExpRealEstate);
  if (!results || results.length != 2) {
    throw 'Failed to parse real estate for ' + legislator;
  }
  parseRealEstate(results[1], sunshineInfo);

  // Parse boats.
  var regExpBoats = /（三）船舶(.*)（四）汽車/;
  results = form.match(regExpBoats);
  if (!results || results.length != 2) {
    throw 'Failed to parse boats for ' + legislator;
  }
  parseBoats(results[1], sunshineInfo);

  // Parse cars.
  var regExpCars = /（四）汽車（含大型重型機器腳踏車）(.*)（五）航空器/;
  results = form.match(regExpCars);
  if (!results || results.length != 2) {
    throw 'Failed to parse cars for ' + legislator;
  }
  parseCars(results[1], sunshineInfo);

  // Parse aircraft.
  var regExpAircraft = /（五）航空器(.*)（六）現金/;
  results = form.match(regExpAircraft);
  if (!results || results.length != 2) {
    throw 'Failed to parse aircraft for ' + legislator;
  }
  parseAircraft(results[1], sunshineInfo);

  // Parse cash.
  var regExpCash = /（六）現金(.*)（七）存款/;
  results = form.match(regExpCash);
  if (!results || results.length != 2) {
    throw 'Failed to parse cash for ' + legislator;
  }
  parseCash(results[1], sunshineInfo);

  // Parse deposit.
  var regExpDeposit = /（七）存款(.*)（八）有價證券/;
  results = form.match(regExpDeposit);
  if (!results || results.length != 2) {
    throw 'Failed to parse deposit for ' + legislator;
  }
  parseDeposit(results[1], sunshineInfo);

  // Parse securities.
  var regExpSecurities = /（八）有價證券(.*)（九）珠寶、古董、字畫及其他具有相當價值之財產/;
  results = form.match(regExpSecurities);
  if (!results || results.length != 2) {
    throw 'Failed to parse securities for ' + legislator;
  }
  parseSecurities(results[1], sunshineInfo);

  // Parse jewelry.
  var regExpJewelry = /（九）珠寶、古董、字畫及其他具有相當價值之財產(.*)（十）債權/;
  results = form.match(regExpJewelry);
  if (!results || results.length != 2) {
    throw 'Failed to parse jewelry for ' + legislator;
  }
  parseJewelry(results[1], sunshineInfo);

  // Parse loan.
  var regExpLoan = /（十）債權(.*)（十一）債務/;
  results = form.match(regExpLoan);
  if (!results || results.length != 2) {
    throw 'Failed to parse loan for ' + legislator;
  }
  parseLoan(results[1], sunshineInfo);

  // Parse debt.
  var regExpDebt = /（十一）債務(.*)（十二）事業投資/;
  results = form.match(regExpDebt);
  if (!results || results.length != 2) {
    throw 'Failed to parse debt for ' + legislator;
  }
  parseDebt(results[1], sunshineInfo);

  // Parse investment.
  var regExpInvestment = /（十二）事業投資(.*)（十三）備註/;
  results = form.match(regExpInvestment);
  if (!results || results.length != 2) {
    throw 'Failed to parse investment for ' + legislator;
  }
  parseInvestment(results[1], sunshineInfo);
};

var parseRealEstate = function(realEstate, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];

  // Parse lands.
  var regExpLands = new RegExp(
      insertSep('1.土地.*取得價額', '(.*)', '2.建物（房屋及停車位）'));
  var results = realEstate.match(regExpLands);
  if (!results || results.length != 2) {
    throw 'Failed to parse real estate for ' + legislator;
  }
  parseRealEstateLands(results[1], sunshineInfo);

  // Parse buildings.
  var regExpBuildings = new RegExp(
      insertSep('2.建物（房屋及停車位）(?:.*?)取得價額', '(.*)'));
  results = realEstate.match(regExpBuildings);
  if (!results || results.length != 2) {
    throw 'Failed to parse real estate for ' + legislator;
  }
  parseRealEstateBuildings(results[1], sunshineInfo);
};

var parseRealEstateLands = function(lands, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var index = lands.indexOf('地號');

  if (index == -1) {
    // No land entry.
    return;
  }

  var entryStartIndex = 0;
  var entryEndIndex;

  while (true) {
    index = lands.indexOf('地號', index + 2);

    if (index == -1) {
      break;
    }

    // Try to find the end of entry.
    for (var j = index - 20; j > index - 40; --j) {
      if (/\)|易|\d/.test(lands[j])) {
        entryEndIndex = j + 1 + SEP.length;
        break;
      }
    }

    parseRealEstateLandEntry(
        lands.substring(entryStartIndex, entryEndIndex), sunshineInfo);

    entryStartIndex = entryEndIndex;
  }

  parseRealEstateLandEntry(lands.substring(entryStartIndex), sunshineInfo);
};

var parseRealEstateLandEntry = function(landEntry, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var landInfo = {};

  // Parse address.
  var index = landEntry.indexOf('地號');
  if (index == -1) {
    throw 'Failed to parse land entry for ' + legislator;
  }
  landInfo['address'] = removeSep(landEntry.substring(0, index + 2));

  // Parse acquisition date.
  var regExpAcquireDate = new RegExp(DATE_PATTERN);
  var results = landEntry.match(regExpAcquireDate);
  if (!results || results.length != 4) {
    throw 'Failed to parse land acquisition date for ' + legislator;
  }
  landInfo['acquire-date'] = new Date(
      parseInt(results[1], 10) + 1911,
      parseInt(results[2], 10) - 1,
      parseInt(results[3], 10));

  // Parse value.
  var regExpValue = /(?:買賣|分割繼承|繼承|受贈|贈與|夫妻贈與|拍賣|第一次登記|共有物分割|合併|逕為合併|分割|地籍圖修正測量|持分分割|塗銷信託)(.*)/;
  results = landEntry.match(regExpValue);
  if (!results || results.length != 2) {
    throw 'Failed to parse land value for ' + legislator;
  }
  landInfo['value'] = parseValue(results[1]);

  sunshineInfo['real-estate-land'] = sunshineInfo['real-estate-land'] || [];
  sunshineInfo['real-estate-land'].push(landInfo);
};

var parseRealEstateBuildings = function(buildings, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var index = buildings.indexOf('建號');

  if (index == -1) {
    // No building entry.
    return;
  }

  var entryStartIndex = 0;
  var entryEndIndex;

  while (true) {
    index = buildings.indexOf('建號', index + 2);

    if (index == -1) {
      break;
    }

    // Try to find the end of entry.
    for (var j = index - 20; j > index - 40; --j) {
      if (/\)|易|\d/.test(buildings[j])) {
        entryEndIndex = j + 1 + SEP.length;
        break;
      }
    }

    parseRealEstateBuildingEntry(
        buildings.substring(entryStartIndex, entryEndIndex), sunshineInfo);

    entryStartIndex = entryEndIndex;
  }

  parseRealEstateBuildingEntry(
      buildings.substring(entryStartIndex), sunshineInfo);
};

var parseRealEstateBuildingEntry = function(buildingEntry, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var buildingInfo = {};

  // Parse address.
  var index = buildingEntry.indexOf('建號');
  if (index == -1) {
    throw 'Failed to parse building entry for ' + legislator;
  }
  buildingInfo['address'] = removeSep(buildingEntry.substring(0, index + 2));

  // Parse acquisition date.
  var regExpAcquireDate = new RegExp(DATE_PATTERN);
  var results = buildingEntry.match(regExpAcquireDate);
  if (!results || results.length != 4) {
    throw 'Failed to parse building acquisition date for ' + legislator;
  }
  buildingInfo['acquire-date'] = new Date(
      parseInt(results[1], 10) + 1911,
      parseInt(results[2], 10) - 1,
      parseInt(results[3], 10));

  // Parse value.
  var regExpValue = /(?:買賣|繼承|受贈|夫妻贈與|拍賣|第一次登記|共有物分割|新建|改建|自建)(.*)/;
  results = buildingEntry.match(regExpValue);
  if (!results || results.length != 2) {
    throw 'Failed to parse building  value for ' + legislator;
  }
  buildingInfo['value'] = parseValue(results[1]);

  sunshineInfo['real-estate-building'] =
      sunshineInfo['real-estate-building'] || [];
  sunshineInfo['real-estate-building'].push(buildingInfo);
};

var parseBoats = function(boats, sunshineInfo) {
  if (boats.indexOf('本欄空白') == -1) {
    throw 'It\'s time to implement parseBoats.';
  }
};

var parseCars = function(cars, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var regExpCars = new RegExp(insertSep('取得價額', '(.*)'));
  var results = cars.match(regExpCars);
  if (!results || results.length != 2) {
    throw 'Failed to parse cars for ' + legislator;
  }

  var content = removeSep(results[1]);
  results = content.match(
      /(.*?)(\d,\d{3}).*?(\d{2,3})年(\d{1,2})月(\d{1,2})日(買賣|所有權移轉)((\d|,)+|\(超過五年\))/g);

  if (!results) {
    // No car.
    return;
  }

  var carEntries = results;

  sunshineInfo['cars'] = [];

  carEntries.forEach(function(car) {
    results = car.match(
        /(.*?)(?:\d,\d{3}).*?(\d{2,3})年(\d{1,2})月(\d{1,2})日(?:買賣|所有權移轉)((?:\d|,)+|\(超過五年\))/);
    
    var carEntry = {};
    carEntry['name'] = results[1];
    carEntry['acquire-date'] = new Date(
      parseInt(results[2], 10) + 1911,
      parseInt(results[3], 10) - 1,
      parseInt(results[4], 10));
    carEntry['value'] = parseValue(results[5]);

    sunshineInfo['cars'].push(carEntry);
  });
};

var parseAircraft = function(aircraft, sunshineInfo) {
  if (aircraft.indexOf('本欄空白') == -1) {
    throw 'It\'s time to implement parseAircraft.';
  }
};

var parseCash = function(cash, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var regExpCash = /總金額：新臺幣(.*?)元/;
  var results = cash.match(regExpCash);
  if (!results || results.length != 2) {
    throw 'Failed to parse cash for ' + legislator;
  }

  var value = parseValue(results[1]);
  if (!isNaN(value)) {
    sunshineInfo['cash'] = value;
  }
};

var parseDeposit = function(deposit, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var regExpDeposit = /總金額：新臺幣(.*?)元/;
  var results = deposit.match(regExpDeposit);
  if (!results || results.length != 2) {
    throw 'Failed to parse deposit for ' + legislator;
  }

  var value = parseValue(results[1]);
  if (!isNaN(value)) {
    sunshineInfo['deposit'] = value;
  }
};

var parseSecurities = function(securities, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var regExpSecurities = /總價額：新臺幣(.*?)元/;
  var results = securities.match(regExpSecurities);
  if (!results || results.length != 2) {
    throw 'Failed to parse securities for ' + legislator;
  }

  var value = parseValue(results[1]);
  if (!isNaN(value)) {
    sunshineInfo['securities'] = value;
  }
};

var parseJewelry = function(jewelry, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var regExpJewelry = /總價額：新臺幣(.*?)元/;
  var results = jewelry.match(regExpJewelry);
  if (!results || results.length != 2) {
    throw 'Failed to parse jewelry for ' + legislator;
  }

  var value = parseValue(results[1]);
  if (!isNaN(value)) {
    sunshineInfo['jewelry'] = value;
  }
};

var parseLoan = function(loan, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var regExpLoan = /總金額：新臺幣(.*?)元/;
  var results = loan.match(regExpLoan);
  if (!results || results.length != 2) {
    throw 'Failed to parse loan for ' + legislator;
  }

  var value = parseValue(results[1]);
  if (!isNaN(value)) {
    sunshineInfo['loan'] = value;
  }
};

var parseDebt = function(debt, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var regExpDebt = /總金額：新臺幣(.*?)元/;
  var results = debt.match(regExpDebt);
  if (!results || results.length != 2) {
    throw 'Failed to parse debt for ' + legislator;
  }

  var value = parseValue(results[1]);
  if (!isNaN(value)) {
    sunshineInfo['debt'] = value;
  }
};

var parseInvestment = function(investment, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var regExpInvestment= /總金額：新臺幣(.*?)元/;
  var results = investment.match(regExpInvestment);
  if (!results || results.length != 2) {
    throw 'Failed to parse investment for ' + legislator;
  }

  var value = parseValue(results[1]);
  if (!isNaN(value)) {
    sunshineInfo['investment'] = value;
  }
};

var parseValue = function(str) {
  var valueStr = removeSep(str);
  if (!valueStr) {
    return NaN;
  } else if (/[^\d,]+/.test(valueStr)) {
    return valueStr;
  } else {
    var valueNum = parseInt(valueStr.replace(/,/g, ''), 10);
    return isNaN(valueNum) ? valueStr :valueNum;
  }
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
  if (process.argv.length <= 2) {
    console.log(
        'Usage: node text-to-json.js legislator-name [legislator-name ...]');
    return;
  }

  var text = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', function() {
    text += process.stdin.read();
  });
  process.stdin.on('end', function() {
    var legislators = process.argv.slice(2);

    legislators.forEach(function(legislator) {
      parseText(text, legislator);
    });
  });
};

if (require.main === module) {
  main();
}

var SEP = '!';
//var NUMBER = '((?:\\d|\\d!)+)';
var NUMBER = '(\\d+)';

var parseText = function(text, legislator) {
  var sunshineInfo = {'legislator': legislator};
  var regExpForm = new RegExp(
      insertSep('公', '職', '人', '員', '財', '產', '申', '報', '表',
                '申報人姓名') +
      legislator + '.*' + '申報人：' + legislator);
  var results = text.match(regExpForm);

  if (!results) {
    console.log('Failed to parse form for ' + legislator);
    return;
  }

  parseForm(results[0], sunshineInfo);

  console.log(sunshineInfo);
};

var parseForm = function(form, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var results;

  var regExpReportDate = new RegExp(
      insertSep('申', '報', '日', NUMBER, '年', NUMBER, '月', NUMBER, '日'));
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
  var regExpCars = /(（四）汽車（含大型重型機器腳踏車）.*)（五）航空器/;
  results = form.match(regExpCars);
  if (!results || results.length != 2) {
    throw 'Failed to parse cars for ' + legislator;
  }
  parseCars(results[1], sunshineInfo);
};

var parseRealEstate = function(realEstate, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];

  // Parse lands.
  var regExpLands = new RegExp(
      insertSep('1.', '土地') + '.*' + insertSep('取', '得', '價', '額') +
      '(.*)' +
      insertSep('2.', '建物（房屋及停車位）'));
  var results = realEstate.match(regExpLands);
  if (!results || results.length != 2) {
    throw 'Failed to parse real estate for ' + legislator;
  }
  parseRealEstateLands(results[1], sunshineInfo);

  // Parse buildings.
  var regExpLands = new RegExp(
      insertSep('2.', '建物（房屋及停車位）') + '.*' +
      insertSep('取', '得', '價', '額') +
      '(.*)');
  var results = realEstate.match(regExpLands);
  parseRealEstateBuildings(results[1], sunshineInfo);
};

var parseRealEstateLands = function(lands, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var index = lands.indexOf('地號');

  if (index == -1) {
    console.log('No land entry for ' + legislator);
    return;
  }

  var entryStartIndex = 0;
  var entryEndIndex;

  while (true) {
    index = lands.indexOf('地號', index + 2);

    if (index == -1) {
      break;
    }

    // Heuristics
    for (var j = index - 20; j > index - 40; --j) {
      if (/\)|\d/.test(lands[j])) {
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

// Example 1: 臺北市士林區天母段一小段!0143!-!0000!地號!1,!470!10000!分之!312!黃瑞明!91!年!07!月!04!日!買賣!(!超過五年!)!
// Example 2: 南投縣中寮鄉先驅段!1467!-!0000!地號!1,300!全部!黃瑞明!101!年!03!月!06!日!買賣!559!,273!
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
  var regExpAcquireDate = new RegExp(
      insertSep(NUMBER, '年', NUMBER, '月', NUMBER, '日'));
  var results = landEntry.match(regExpAcquireDate);
  if (!results || results.length != 4) {
    throw 'Failed to parse land acquisition date for ' + legislator;
  }
  landInfo['acquire-date'] = new Date(
      parseInt(results[1], 10) + 1911,
      parseInt(results[2], 10) - 1,
      parseInt(results[3], 10));

  // Parse value.
  var regExpValue = /(?:買賣|繼承)(.*)/;
  var results = landEntry.match(regExpValue);
  if (!results || results.length != 2) {
    throw 'Failed to parse land value for ' + legislator;
  }
  var valueStr = removeSep(results[1]);
  var valueNum = parseInt(valueStr.replace(/,/g, ''), 10);
  landInfo['value'] = isNaN(valueNum) ? valueStr :valueNum;

  sunshineInfo['real-estate-land'] = sunshineInfo['real-estate-land'] || [];
  sunshineInfo['real-estate-land'].push(landInfo);
};

var parseRealEstateBuildings = function(buildings, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var index = buildings.indexOf('建號');

  if (index == -1) {
    console.log('No building entry for ' + legislator);
    return;
  }

  var entryStartIndex = 0;
  var entryEndIndex;

  while (true) {
    index = buildings.indexOf('建號', index + 2);

    if (index == -1) {
      break;
    }

    // Heuristics
    for (var j = index - 20; j > index - 40; --j) {
      if (/\)|\d/.test(buildings[j])) {
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
  var regExpAcquireDate = new RegExp(
      insertSep(NUMBER, '年', NUMBER, '月', NUMBER, '日'));
  var results = buildingEntry.match(regExpAcquireDate);
  if (!results || results.length != 4) {
    throw 'Failed to parse building acquisition date for ' + legislator;
  }
  buildingInfo['acquire-date'] = new Date(
      parseInt(results[1], 10) + 1911,
      parseInt(results[2], 10) - 1,
      parseInt(results[3], 10));

  // Parse value.
  var regExpValue = /(?:買賣|繼承|改建)(.*)/;
  var results = buildingEntry.match(regExpValue);
  if (!results || results.length != 2) {
    throw 'Failed to parse building  value for ' + legislator;
  }
  var valueStr = removeSep(results[1]);
  var valueNum = parseInt(valueStr.replace(/,/g, ''), 10);
  buildingInfo['value'] = isNaN(valueNum) ? valueStr :valueNum;

  sunshineInfo['real-estate-building'] =
      sunshineInfo['real-estate-building'] || [];
  sunshineInfo['real-estate-building'].push(buildingInfo);
}

var parseBoats = function(boats, sunshineInfo) {
  if (!/本欄空白/.test(boats)) {
    throw 'It\'s time to implement parseBoats.';
  }
};

var parseCars = function(cars, sunshineInfo) {
  var legislator = sunshineInfo['legislator'];
  var regExpCars = new RegExp(
      insertSep('取', '得', '價', '額') + '(.*)');
  var results = cars.match(regExpCars);
  if (!results || results.length != 2) {
    throw 'Failed to parse cars for ' + legislator;
  }

  var content = removeSep(results[1]);
  results = content.match(
      /(.*?)(\d,\d{3}).*?(\d{2,3})年(\d{1,2})月(\d{1,2})日(?:買賣|所有權移轉)((?:\d|,)+)/g);

  if (!results) {
    console.log('No car entry for ' + legislator);
    return;
  }

  var carEntries = results;

  sunshineInfo['cars'] = [];

  carEntries.forEach(function(car) {
    results = car.match(
        /(.*?)(\d,\d{3}).*?(\d{2,3})年(\d{1,2})月(\d{1,2})日(?:買賣|所有權移轉)((?:\d|,)+)/);
    
    var carEntry = {};
    carEntry['name'] = results[1];
    carEntry['cylinder-capacity'] = results[2];
    carEntry['acquire-date'] = new Date(
      parseInt(results[3], 10) + 1911,
      parseInt(results[4], 10) - 1,
      parseInt(results[5], 10));
    carEntry['value'] = results[6];

    sunshineInfo['cars'].push(carEntry);
  });
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
  var text = '';

  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', function() {
    text += process.stdin.read();
  });

  process.stdin.on('end', function() {
    var regExpPageFooter = new RegExp(
        insertSep(
          '監察院公報', '……….', '廉', '政', '專', '刊',
          '第', '\\d{1,3}', '期', '\\d{1,3}'),
        'g');
    text = text.replace(regExpPageFooter, '');

    parseText(text, '尤美女');
    //parseText(text, '丁守中');
    //parseText(text, '王進士');
  });
};

if (require.main === module) {
  main();
}

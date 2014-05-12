var PEOPLE_LIST_FILE = 'people.json';

var peopleList = getPeopleList();
var peopleByNameMap = createPeopleByNameMap(peopleList);
var peopleByIdMap = createPeopleByIdMap(peopleList);

function getPeopleList() {
  var fileContents = require('fs').readFileSync(
      PEOPLE_LIST_FILE, {encoding: 'utf8'});
  return JSON.parse(fileContents)['people'];
}

function createPeopleByNameMap(peopleList) {
  var map = {};

  peopleList.forEach(function(person) {
    if (map.hasOwnProperty(person.name)) {
      throw person.name + ' already exists';
    }
    map[person.name] = person;
  });

  return map;
}

function createPeopleByIdMap(peopleList) {
  var map = {};

  peopleList.forEach(function(person) {
    if (map.hasOwnProperty(person.id)) {
      throw 'ID ' + person.id + ' already exists';
    }
    map[person.id] = person;
  });

  return map;
}

module.exports.findPersonByName = function(name) {
  if (!peopleByNameMap.hasOwnProperty(name)) {
    throw 'person with name ' + name + ' doesn\'t exist';
  }
  return peopleByNameMap[name];
}

module.exports.findPersonById = function(id) {
  if (!peopleByIdMap.hasOwnProperty(id)) {
    throw 'person with ID ' + id + ' doesn\'t exist';
  }
  return peopleByIdMap[id];
}

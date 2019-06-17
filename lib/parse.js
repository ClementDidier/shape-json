'use strict';

var core = require('./core');

var _ = {
  map: require('lodash/map'),
  groupBy: require('lodash/groupBy'),
  pick: require('lodash/pick'),
  pickBy: require('lodash/pickBy'),
  isEmpty: require('lodash/isEmpty'),
  isNil: require('lodash/isNil'),
  values: require('lodash/values'),
  keys: require('lodash/keys'),
  forOwn: require('lodash/forOwn'),
  omit: require('lodash/omit'),
  extend: require('lodash/extend'),
  has: require('lodash/has'),
  get: require('lodash/get'),
  uniq: require('lodash/uniq'),
  uniqBy: require('lodash/uniqBy'),
  isObject: require('lodash/isObject'),
  isString: require('lodash/isString'),
  isFunction: require('lodash/isFunction'),
  isArray: require('lodash/isArray'),
  startsWith: require('lodash/startsWith'),
  isUndefined: require('lodash/isUndefined'),
  filter: require('lodash/filter'),
  isNumber: require('lodash/isNumber'),
  reduce: require('lodash/reduce'),
  isBoolean: require('lodash/isBoolean')
};

var Operations = {
  group: 'groupBy',
  index: 'indexBy',
  mirror: 'mirror',
  set: 'set',
  foreach: 'foreach',
  merge: 'merge',
  eval: 'eval',
  or: 'or',
  if: 'if'
};

var defined = {
  group: { execute: require('./plugins/group') },
  mirror: { execute: require('./plugins/mirror') },
  set: { execute: require('./plugins/set') },
  foreach: { execute: require('./plugins/foreach') },
  merge: { execute: require('./plugins/merge') },
  eval: { execute: require('./plugins/eval') },
  or: { execute: require('./plugins/or') },
  if: { execute: require('./plugins/if').method, parameters: require('./plugins/if').parameters }
};

function parse(provider, scheme) {
  if (_.isBoolean(scheme) || _.isNumber(scheme))
    return scheme;

  var json = {};
  _.forOwn(scheme, function (subScheme, schemeKey) {
    if (_.isFunction(subScheme) === false) {
      if (isOperation(schemeKey)) {
        var operation = retrieveOperation(schemeKey);
        var parsedOperation = parseSchemeOperation(provider, subScheme, operation);

        if (_.isUndefined(operation.dest)) {
          json = parsedOperation;
        } else {
          json[operation.dest] = parsedOperation;
        }
      } else if (_.isString(subScheme)) {
        var parsedString = parseSchemeString(provider, subScheme);
        if (_.isString(parsedString) || _.isNumber(parsedString) || _.isBoolean(parsedString)) {
          json[schemeKey] = parsedString;
        } else if (_.isArray(parsedString)) {
          json[schemeKey] = [];
          for (let item of parsedString) {
            json[schemeKey].push(item);
          }
        }
      } else if (_.isNumber(subScheme)) {
        var parsedString = parseSchemeNumber(provider, subScheme);
        if (parsedString || _.isNumber(parsedString)) {
          json[schemeKey] = parsedString;
        }
      } else if (_.isObject(subScheme)) {
        json[schemeKey] = parse(provider, subScheme);
      }
    }
  });

  let res = _.pickBy(json, predicate => _.isString(predicate) || _.isBoolean(predicate) || _.isNumber(predicate) || (!_.isEmpty(predicate) && !_.isNil(predicate)));
  return res;
};

function withoutEmptyObject(collection) {
  return _.filter(collection, function (value) {
    if (_.isObject(value)) {
      return _.keys(value).length !== 0;
    }
    return true;
  });
};

function parseSchemeOperation(provider, subScheme, operation) {
  var parsedCollection = executeOperation(operation, provider, subScheme);

  if (_.isArray(parsedCollection)) {
    parsedCollection = withoutEmptyObject(parsedCollection);
  }
  return parsedCollection;
};

function parseSchemeString(provider, schemeString) {
  if (_.isArray(provider)) {
    if (provider.length === 0) {
      return [];
    }
    return _.get(provider[0], schemeString);
  } else {
    return _.get(provider, schemeString);
  }
};

function parseSchemeNumber(provider, schemeString) {
  if (_.isArray(provider) && provider.length === 0) {
    return [];
  }

  if (_.isArray(provider) && _.isArray(provider[0])) {
    return _.get(provider[0], schemeString);
  } else {
    return _.get(provider, schemeString);
  }
};

function executeOperation(operation, provider, scheme) {
  if (_.has(defined, operation.name)) {
    var helpers = { '_': _, 'parse': parse, 'core': core };
    var result = defined[operation.name].execute(operation, provider, scheme, helpers);
    return result;
  }
};

function isOperation(text) {
  if (_.startsWith(text, '$')) {
    var name = getOperationName(text);
    return _.has(core, Operations[name]) || _.has(defined, name);
  }
};

function retrieveOperation(text) {
  if (isOperation(text)) {
    let argsValidation = true;
    let operationName = getOperationName(text);
    if (_.has(defined, operationName)) {
      argsValidation = _.get(defined[operationName], "parameters.argsValidation", true);
    }

    return {
      name: operationName,
      dest: getOperationDestinyKey(text),
      args: getOperationArguments(text, argsValidation)
    }
  }
};

function getOperationName(text) {
  return text.match(/\$(\w+)/)[1];
};

function getOperationDestinyKey(text) {
  var segment = text.match(/\[(\w+)\]/);
  if (segment) return segment[1];
};

function getOperationArguments(text, validate) {
  let vars = [];
  if (_.isString(text)) {
    let data = text.match(/\((.*)\)/);
    if (data && data.length > 0) {
      let unvalidatedVars = data[1].replace(/ /g, "").split(',');
      for (let variable of unvalidatedVars) {
        if (!validate || variable.match(/^[a-zA-Z]+\d*(?:\.[a-zA-Z]+\d*)*$/g)) {
          vars.push(variable);
        }
      }
    }
  }
  return vars.length > 0 ? vars : null;
};

exports.parse = function (provider, scheme) {
  return parse(provider, scheme);
};

exports.define = function (name, operation, parameters) {
  defined[name] = { execute: operation, parameters };
};

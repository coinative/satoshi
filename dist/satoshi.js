!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.bitcoin=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

module.exports = {
  base58: _dereq_('satoshi-base58'),
  hash: _dereq_('satoshi-hash'),
  Address: _dereq_('satoshi-address'),
  HdKey: _dereq_('satoshi-hdkey'),
  Key: _dereq_('satoshi-key'),
  mnemonic: _dereq_('satoshi-mnemonic'),
  MsKey: _dereq_('satoshi-mskey'),
  Script: _dereq_('satoshi-script'),
  sjcl: _dereq_('satoshi-sjcl'),
  random: _dereq_('satoshi-random')
};

},{"satoshi-address":10,"satoshi-base58":12,"satoshi-hash":17,"satoshi-hdkey":20,"satoshi-key":22,"satoshi-mnemonic":24,"satoshi-mskey":25,"satoshi-random":26,"satoshi-script":27,"satoshi-sjcl":30}],2:[function(_dereq_,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = _dereq_('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":4}],3:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("FWaASH"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"FWaASH":9,"inherits":8}],5:[function(_dereq_,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = _dereq_('base64-js')
var ieee754 = _dereq_('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str.toString()
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.compare = function (a, b) {
  assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), 'Arguments must be Buffers')
  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) {
    return -1
  }
  if (y < x) {
    return 1
  }
  return 0
}

// BUFFER INSTANCE METHODS
// =======================

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end === undefined) ? self.length : Number(end)

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = asciiSlice(self, start, end)
      break
    case 'binary':
      ret = binarySlice(self, start, end)
      break
    case 'base64':
      ret = base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

Buffer.prototype.equals = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.compare = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return readUInt16(this, offset, false, noAssert)
}

function readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return readInt16(this, offset, false, noAssert)
}

function readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return readInt32(this, offset, false, noAssert)
}

function readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return readFloat(this, offset, false, noAssert)
}

function readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
  return offset + 1
}

function writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
  return offset + 2
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, false, noAssert)
}

function writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
  return offset + 4
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
  return offset + 1
}

function writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
  return offset + 2
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, false, noAssert)
}

function writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
  return offset + 4
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, false, noAssert)
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":6,"ieee754":7}],6:[function(_dereq_,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],7:[function(_dereq_,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],8:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],9:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],10:[function(_dereq_,module,exports){
(function (Buffer){
var base58 = _dereq_('satoshi-base58');

function parseAddress(address) {
  var data = base58.decodeCheck(address);
  if (!data || data.length !== 21) {
    throw new Error('Invalid data or checksum');
  }
  var version = Address.versions[data[0]];
  if (!version) {
    throw new Error('Unknown version');
  }
  return {
    type: version.type,
    network: version.network,
    hash: data.slice(1)
  };
}

// new Address(hash, type='pubkeyhash', network='mainnet')
// new Address(address)
function Address(hash, type, network) {
  if (typeof hash === 'string') {
    var parsed = parseAddress(hash);
    this.type = parsed.type;
    this.network = parsed.network;
    this.hash = parsed.hash;
    return;
  }
  if (!hash || hash.length !== 20) {
    throw new Error('Invalid hash');
  }

  this.type = type || 'pubkeyhash';
  this.network = network || 'mainnet';
  this.hash = hash;
}

Address.prototype.toString = function () {
  var version = Address.networks[this.network][this.type];
  var data = Buffer.concat([new Buffer([version]), this.hash]);
  return base58.encodeCheck(data);
};

// Address.isValid(hash, type='pubkeyhash', network='mainnet')
// Address.isValid(address)
Address.isValid = function (hash, type, network) {
  try {
    new Address(hash, type, network);
    return true;
  } catch (e) {
    return false;
  }
};

Address.networks = {
  mainnet: {
    pubkeyhash: 0,
    scripthash: 5
  },
  testnet: {
    pubkeyhash: 111,
    scripthash: 196
  }
};

Object.defineProperty(Address, 'versions', {
  get: function () {
    var networks = Address.networks;
    return Object.keys(networks).reduce(function (versions, network) {
      Object.keys(networks[network]).forEach(function (type) {
        var version = networks[network][type];
        versions[version] = { network: network, type: type };
      });
      return versions;
    }, {});
  }
});

module.exports = Address;

}).call(this,_dereq_("buffer").Buffer)
},{"buffer":5,"satoshi-base58":12}],11:[function(_dereq_,module,exports){
var BigInteger = _dereq_('bigi');
var inherits = _dereq_('inherits');

function BigNum(num) {
  if (!(this instanceof BigNum)) {
    return new BigNum(num);
  }
  if (num instanceof BigInteger) {
    var bn = new BigNum();
    Object.keys(num).forEach(function (key) {
      bn[key] = num[key];
    });
    return bn;
  }
  if (typeof num === 'number') {
    this.fromInt(num);
  } else {
    BigInteger.apply(this, arguments);
  }
}
inherits(BigNum, BigInteger);

BigNum.fromBuffer = function (buffer, options) {
  return new BigNum(BigInteger.fromBuffer(buffer));
};

BigNum.prototype.add = function (a) {
  if (typeof a === 'number') {
    a = new BigNum(a);
  }
  return new BigNum(BigInteger.prototype.add.call(this, a));
};

BigNum.prototype.mul = function (a) {
  if (typeof a === 'number') {
    a = new BigNum(a);
  }
  return new BigNum(this.multiply(a));
};

BigNum.prototype.eq = function (a) {
  if (typeof a === 'number') {
    a = new BigNum(a);
  }
  return this.equals(a);
};

BigNum.prototype.gt = function (a) {
  if (typeof a === 'number') {
    a = new BigNum(a);
  }
  return this.compareTo(a) > 0;
};

BigNum.prototype.mod = function (a) {
  if (typeof a === 'number') {
    a = new BigNum(a);
  }
  return new BigNum(BigInteger.prototype.mod.call(this, a));
};

BigNum.prototype.div = function (a) {
  if (typeof a === 'number') {
    a = new BigNum(a);
  }
  return new BigNum(this.divide(a));
};

BigNum.prototype.toNumber = function () {
  return this.intValue();
};

module.exports = BigNum;

},{"bigi":15,"inherits":16}],12:[function(_dereq_,module,exports){
(function (Buffer){
var bn = _dereq_('bignum');
var hash = _dereq_('satoshi-hash');

var base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var base58Values = {};
for (var i = 0; i < base58Chars.length; i++) {
  base58Values[base58Chars[i]] = i;
}

function encode(buf) {
  var n = bn.fromBuffer(buf, { endian: 'little' });
  var chars = [];
  var r;
  while (n.gt(0)) {
    r = n.mod(58);
    n = n.div(58);
    chars.push(base58Chars[r.toNumber()]);
  }
  for (var i = 0; i < buf.length && buf[i] === 0; i++) {
    chars.push(base58Chars[0]);
  }
  return chars.reverse().join('');
}

function decode(str) {
  var n = bn(0);
  for (var i = 0; i < str.length; i++) {
    n = n.mul(58);
    n = n.add(base58Values[str[i]]);
  }
  for (var i = 0; i < str.length && str[i] === '1'; i++) {}
  var zeroBuf = new Buffer(new Array(i));
  if (n.eq(0)) {
    return zeroBuf;
  } else {
    var buf = n.toBuffer();
    return Buffer.concat([zeroBuf, buf], i + buf.length);
  }
}

function encodeCheck(buf) {
  var hash256 = hash.hash256(buf);
  return encode(Buffer.concat([buf, hash256.slice(0, 4)], buf.length + 4));
}

function decodeCheck(str) {
  var buf = decode(str);
  if (buf.length < 4) {
    return false;
  }
  var data = buf.slice(0, -4);
  var checksum = buf.slice(-4);
  var hash256 = hash.hash256(data);
  for (var i = 0; i < 4; i++) {
    if (checksum[i] !== hash256[i]) {
      return false;
    }
  }
  return data;
}

exports.encode = encode;
exports.decode = decode;
exports.encodeCheck = encodeCheck;
exports.decodeCheck = decodeCheck;

}).call(this,_dereq_("buffer").Buffer)
},{"bignum":11,"buffer":5,"satoshi-hash":17}],13:[function(_dereq_,module,exports){
var assert = _dereq_('assert')

// (public) Constructor
function BigInteger(a, b, c) {
  if (!(this instanceof BigInteger))
    return new BigInteger(a, b, c)

  if (a != null) {
    if ("number" == typeof a) this.fromNumber(a, b, c)
    else if (b == null && "string" != typeof a) this.fromString(a, 256)
    else this.fromString(a, b)
  }
}

var proto = BigInteger.prototype

// Bits per digit
var dbits

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i, x, w, j, c, n) {
  while (--n >= 0) {
    var v = x * this[i++] + w[j] + c
    c = Math.floor(v / 0x4000000)
    w[j++] = v & 0x3ffffff
  }
  return c
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i, x, w, j, c, n) {
  var xl = x & 0x7fff,
    xh = x >> 15
  while (--n >= 0) {
    var l = this[i] & 0x7fff
    var h = this[i++] >> 15
    var m = xh * l + h * xl
    l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff)
    c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30)
    w[j++] = l & 0x3fffffff
  }
  return c
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i, x, w, j, c, n) {
  var xl = x & 0x3fff,
    xh = x >> 14
  while (--n >= 0) {
    var l = this[i] & 0x3fff
    var h = this[i++] >> 14
    var m = xh * l + h * xl
    l = xl * l + ((m & 0x3fff) << 14) + w[j] + c
    c = (l >> 28) + (m >> 14) + xh * h
    w[j++] = l & 0xfffffff
  }
  return c
}

// wtf?
BigInteger.prototype.am = am1
dbits = 26

BigInteger.prototype.DB = dbits
BigInteger.prototype.DM = ((1 << dbits) - 1)
var DV = BigInteger.prototype.DV = (1 << dbits)

var BI_FP = 52
BigInteger.prototype.FV = Math.pow(2, BI_FP)
BigInteger.prototype.F1 = BI_FP - dbits
BigInteger.prototype.F2 = 2 * dbits - BI_FP

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz"
var BI_RC = new Array()
var rr, vv
rr = "0".charCodeAt(0)
for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv
rr = "a".charCodeAt(0)
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv
rr = "A".charCodeAt(0)
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv

function int2char(n) {
  return BI_RM.charAt(n)
}

function intAt(s, i) {
  var c = BI_RC[s.charCodeAt(i)]
  return (c == null) ? -1 : c
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for (var i = this.t - 1; i >= 0; --i) r[i] = this[i]
  r.t = this.t
  r.s = this.s
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1
  this.s = (x < 0) ? -1 : 0
  if (x > 0) this[0] = x
  else if (x < -1) this[0] = x + DV
  else this.t = 0
}

// return bigint initialized to value
function nbv(i) {
  var r = new BigInteger()
  r.fromInt(i)
  return r
}

// (protected) set from string and radix
function bnpFromString(s, b) {
  var self = this

  var k
  if (b == 16) k = 4
  else if (b == 8) k = 3
  else if (b == 256) k = 8; // byte array
  else if (b == 2) k = 1
  else if (b == 32) k = 5
  else if (b == 4) k = 2
  else {
    self.fromRadix(s, b)
    return
  }
  self.t = 0
  self.s = 0
  var i = s.length,
    mi = false,
    sh = 0
  while (--i >= 0) {
    var x = (k == 8) ? s[i] & 0xff : intAt(s, i)
    if (x < 0) {
      if (s.charAt(i) == "-") mi = true
      continue
    }
    mi = false
    if (sh == 0)
      self[self.t++] = x
    else if (sh + k > self.DB) {
      self[self.t - 1] |= (x & ((1 << (self.DB - sh)) - 1)) << sh
      self[self.t++] = (x >> (self.DB - sh))
    } else
      self[self.t - 1] |= x << sh
    sh += k
    if (sh >= self.DB) sh -= self.DB
  }
  if (k == 8 && (s[0] & 0x80) != 0) {
    self.s = -1
    if (sh > 0) self[self.t - 1] |= ((1 << (self.DB - sh)) - 1) << sh
  }
  self.clamp()
  if (mi) BigInteger.ZERO.subTo(self, self)
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s & this.DM
  while (this.t > 0 && this[this.t - 1] == c)--this.t
}

// (public) return string representation in given radix
function bnToString(b) {
  var self = this
  if (self.s < 0) return "-" + self.negate()
    .toString(b)
  var k
  if (b == 16) k = 4
  else if (b == 8) k = 3
  else if (b == 2) k = 1
  else if (b == 32) k = 5
  else if (b == 4) k = 2
  else return self.toRadix(b)
  var km = (1 << k) - 1,
    d, m = false,
    r = "",
    i = self.t
  var p = self.DB - (i * self.DB) % k
  if (i-- > 0) {
    if (p < self.DB && (d = self[i] >> p) > 0) {
      m = true
      r = int2char(d)
    }
    while (i >= 0) {
      if (p < k) {
        d = (self[i] & ((1 << p) - 1)) << (k - p)
        d |= self[--i] >> (p += self.DB - k)
      } else {
        d = (self[i] >> (p -= k)) & km
        if (p <= 0) {
          p += self.DB
          --i
        }
      }
      if (d > 0) m = true
      if (m) r += int2char(d)
    }
  }
  return m ? r : "0"
}

// (public) -this
function bnNegate() {
  var r = new BigInteger()
  BigInteger.ZERO.subTo(this, r)
  return r
}

// (public) |this|
function bnAbs() {
  return (this.s < 0) ? this.negate() : this
}

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s - a.s
  if (r != 0) return r
  var i = this.t
  r = i - a.t
  if (r != 0) return (this.s < 0) ? -r : r
  while (--i >= 0)
    if ((r = this[i] - a[i]) != 0) return r
  return 0
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1,
    t
  if ((t = x >>> 16) != 0) {
    x = t
    r += 16
  }
  if ((t = x >> 8) != 0) {
    x = t
    r += 8
  }
  if ((t = x >> 4) != 0) {
    x = t
    r += 4
  }
  if ((t = x >> 2) != 0) {
    x = t
    r += 2
  }
  if ((t = x >> 1) != 0) {
    x = t
    r += 1
  }
  return r
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if (this.t <= 0) return 0
  return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM))
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n, r) {
  var i
  for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i]
  for (i = n - 1; i >= 0; --i) r[i] = 0
  r.t = this.t + n
  r.s = this.s
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n, r) {
  for (var i = n; i < this.t; ++i) r[i - n] = this[i]
  r.t = Math.max(this.t - n, 0)
  r.s = this.s
}

// (protected) r = this << n
function bnpLShiftTo(n, r) {
  var self = this
  var bs = n % self.DB
  var cbs = self.DB - bs
  var bm = (1 << cbs) - 1
  var ds = Math.floor(n / self.DB),
    c = (self.s << bs) & self.DM,
    i
  for (i = self.t - 1; i >= 0; --i) {
    r[i + ds + 1] = (self[i] >> cbs) | c
    c = (self[i] & bm) << bs
  }
  for (i = ds - 1; i >= 0; --i) r[i] = 0
  r[ds] = c
  r.t = self.t + ds + 1
  r.s = self.s
  r.clamp()
}

// (protected) r = this >> n
function bnpRShiftTo(n, r) {
  var self = this
  r.s = self.s
  var ds = Math.floor(n / self.DB)
  if (ds >= self.t) {
    r.t = 0
    return
  }
  var bs = n % self.DB
  var cbs = self.DB - bs
  var bm = (1 << bs) - 1
  r[0] = self[ds] >> bs
  for (var i = ds + 1; i < self.t; ++i) {
    r[i - ds - 1] |= (self[i] & bm) << cbs
    r[i - ds] = self[i] >> bs
  }
  if (bs > 0) r[self.t - ds - 1] |= (self.s & bm) << cbs
  r.t = self.t - ds
  r.clamp()
}

// (protected) r = this - a
function bnpSubTo(a, r) {
  var self = this
  var i = 0,
    c = 0,
    m = Math.min(a.t, self.t)
  while (i < m) {
    c += self[i] - a[i]
    r[i++] = c & self.DM
    c >>= self.DB
  }
  if (a.t < self.t) {
    c -= a.s
    while (i < self.t) {
      c += self[i]
      r[i++] = c & self.DM
      c >>= self.DB
    }
    c += self.s
  } else {
    c += self.s
    while (i < a.t) {
      c -= a[i]
      r[i++] = c & self.DM
      c >>= self.DB
    }
    c -= a.s
  }
  r.s = (c < 0) ? -1 : 0
  if (c < -1) r[i++] = self.DV + c
  else if (c > 0) r[i++] = c
  r.t = i
  r.clamp()
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a, r) {
  var x = this.abs(),
    y = a.abs()
  var i = x.t
  r.t = i + y.t
  while (--i >= 0) r[i] = 0
  for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t)
  r.s = 0
  r.clamp()
  if (this.s != a.s) BigInteger.ZERO.subTo(r, r)
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs()
  var i = r.t = 2 * x.t
  while (--i >= 0) r[i] = 0
  for (i = 0; i < x.t - 1; ++i) {
    var c = x.am(i, x[i], r, 2 * i, 0, 1)
    if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
      r[i + x.t] -= x.DV
      r[i + x.t + 1] = 1
    }
  }
  if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1)
  r.s = 0
  r.clamp()
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m, q, r) {
  var self = this
  var pm = m.abs()
  if (pm.t <= 0) return
  var pt = self.abs()
  if (pt.t < pm.t) {
    if (q != null) q.fromInt(0)
    if (r != null) self.copyTo(r)
    return
  }
  if (r == null) r = new BigInteger()
  var y = new BigInteger(),
    ts = self.s,
    ms = m.s
  var nsh = self.DB - nbits(pm[pm.t - 1]); // normalize modulus
  if (nsh > 0) {
    pm.lShiftTo(nsh, y)
    pt.lShiftTo(nsh, r)
  } else {
    pm.copyTo(y)
    pt.copyTo(r)
  }
  var ys = y.t
  var y0 = y[ys - 1]
  if (y0 == 0) return
  var yt = y0 * (1 << self.F1) + ((ys > 1) ? y[ys - 2] >> self.F2 : 0)
  var d1 = self.FV / yt,
    d2 = (1 << self.F1) / yt,
    e = 1 << self.F2
  var i = r.t,
    j = i - ys,
    t = (q == null) ? new BigInteger() : q
  y.dlShiftTo(j, t)
  if (r.compareTo(t) >= 0) {
    r[r.t++] = 1
    r.subTo(t, r)
  }
  BigInteger.ONE.dlShiftTo(ys, t)
  t.subTo(y, y); // "negative" y so we can replace sub with am later
  while (y.t < ys) y[y.t++] = 0
  while (--j >= 0) {
    // Estimate quotient digit
    var qd = (r[--i] == y0) ? self.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2)
    if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
      y.dlShiftTo(j, t)
      r.subTo(t, r)
      while (r[i] < --qd) r.subTo(t, r)
    }
  }
  if (q != null) {
    r.drShiftTo(ys, q)
    if (ts != ms) BigInteger.ZERO.subTo(q, q)
  }
  r.t = ys
  r.clamp()
  if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
  if (ts < 0) BigInteger.ZERO.subTo(r, r)
}

// (public) this mod a
function bnMod(a) {
  var r = new BigInteger()
  this.abs()
    .divRemTo(a, null, r)
  if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r)
  return r
}

// Modular reduction using "classic" algorithm
function Classic(m) {
  this.m = m
}

function cConvert(x) {
  if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m)
  else return x
}

function cRevert(x) {
  return x
}

function cReduce(x) {
  x.divRemTo(this.m, null, x)
}

function cMulTo(x, y, r) {
  x.multiplyTo(y, r)
  this.reduce(r)
}

function cSqrTo(x, r) {
  x.squareTo(r)
  this.reduce(r)
}

Classic.prototype.convert = cConvert
Classic.prototype.revert = cRevert
Classic.prototype.reduce = cReduce
Classic.prototype.mulTo = cMulTo
Classic.prototype.sqrTo = cSqrTo

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if (this.t < 1) return 0
  var x = this[0]
  if ((x & 1) == 0) return 0
  var y = x & 3; // y == 1/x mod 2^2
  y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
  y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
  y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y > 0) ? this.DV - y : -y
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m
  this.mp = m.invDigit()
  this.mpl = this.mp & 0x7fff
  this.mph = this.mp >> 15
  this.um = (1 << (m.DB - 15)) - 1
  this.mt2 = 2 * m.t
}

// xR mod m
function montConvert(x) {
  var r = new BigInteger()
  x.abs()
    .dlShiftTo(this.m.t, r)
  r.divRemTo(this.m, null, r)
  if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r)
  return r
}

// x/R mod m
function montRevert(x) {
  var r = new BigInteger()
  x.copyTo(r)
  this.reduce(r)
  return r
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while (x.t <= this.mt2) // pad x so am has enough room later
    x[x.t++] = 0
  for (var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i] & 0x7fff
    var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM
    // use am to combine the multiply-shift-add into one call
    j = i + this.m.t
    x[j] += this.m.am(0, u0, x, i, 0, this.m.t)
    // propagate carry
    while (x[j] >= x.DV) {
      x[j] -= x.DV
      x[++j]++
    }
  }
  x.clamp()
  x.drShiftTo(this.m.t, x)
  if (x.compareTo(this.m) >= 0) x.subTo(this.m, x)
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x, r) {
  x.squareTo(r)
  this.reduce(r)
}

// r = "xy/R mod m"; x,y != r
function montMulTo(x, y, r) {
  x.multiplyTo(y, r)
  this.reduce(r)
}

Montgomery.prototype.convert = montConvert
Montgomery.prototype.revert = montRevert
Montgomery.prototype.reduce = montReduce
Montgomery.prototype.mulTo = montMulTo
Montgomery.prototype.sqrTo = montSqrTo

// (protected) true iff this is even
function bnpIsEven() {
  return ((this.t > 0) ? (this[0] & 1) : this.s) == 0
}

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e, z) {
  if (e > 0xffffffff || e < 1) return BigInteger.ONE
  var r = new BigInteger(),
    r2 = new BigInteger(),
    g = z.convert(this),
    i = nbits(e) - 1
  g.copyTo(r)
  while (--i >= 0) {
    z.sqrTo(r, r2)
    if ((e & (1 << i)) > 0) z.mulTo(r2, g, r)
    else {
      var t = r
      r = r2
      r2 = t
    }
  }
  return z.revert(r)
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e, m) {
  var z
  if (e < 256 || m.isEven()) z = new Classic(m)
  else z = new Montgomery(m)
  return this.exp(e, z)
}

// protected
proto.copyTo = bnpCopyTo
proto.fromInt = bnpFromInt
proto.fromString = bnpFromString
proto.clamp = bnpClamp
proto.dlShiftTo = bnpDLShiftTo
proto.drShiftTo = bnpDRShiftTo
proto.lShiftTo = bnpLShiftTo
proto.rShiftTo = bnpRShiftTo
proto.subTo = bnpSubTo
proto.multiplyTo = bnpMultiplyTo
proto.squareTo = bnpSquareTo
proto.divRemTo = bnpDivRemTo
proto.invDigit = bnpInvDigit
proto.isEven = bnpIsEven
proto.exp = bnpExp

// public
proto.toString = bnToString
proto.negate = bnNegate
proto.abs = bnAbs
proto.compareTo = bnCompareTo
proto.bitLength = bnBitLength
proto.mod = bnMod
proto.modPowInt = bnModPowInt

// (public)
function bnClone() {
  var r = new BigInteger()
  this.copyTo(r)
  return r
}

// (public) return value as integer
function bnIntValue() {
  if (this.s < 0) {
    if (this.t == 1) return this[0] - this.DV
    else if (this.t == 0) return -1
  } else if (this.t == 1) return this[0]
  else if (this.t == 0) return 0
  // assumes 16 < DB < 32
  return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0]
}

// (public) return value as byte
function bnByteValue() {
  return (this.t == 0) ? this.s : (this[0] << 24) >> 24
}

// (public) return value as short (assumes DB>=16)
function bnShortValue() {
  return (this.t == 0) ? this.s : (this[0] << 16) >> 16
}

// (protected) return x s.t. r^x < DV
function bnpChunkSize(r) {
  return Math.floor(Math.LN2 * this.DB / Math.log(r))
}

// (public) 0 if this == 0, 1 if this > 0
function bnSigNum() {
  if (this.s < 0) return -1
  else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0
  else return 1
}

// (protected) convert to radix string
function bnpToRadix(b) {
  if (b == null) b = 10
  if (this.signum() == 0 || b < 2 || b > 36) return "0"
  var cs = this.chunkSize(b)
  var a = Math.pow(b, cs)
  var d = nbv(a),
    y = new BigInteger(),
    z = new BigInteger(),
    r = ""
  this.divRemTo(d, y, z)
  while (y.signum() > 0) {
    r = (a + z.intValue())
      .toString(b)
      .substr(1) + r
    y.divRemTo(d, y, z)
  }
  return z.intValue()
    .toString(b) + r
}

// (protected) convert from radix string
function bnpFromRadix(s, b) {
  var self = this
  self.fromInt(0)
  if (b == null) b = 10
  var cs = self.chunkSize(b)
  var d = Math.pow(b, cs),
    mi = false,
    j = 0,
    w = 0
  for (var i = 0; i < s.length; ++i) {
    var x = intAt(s, i)
    if (x < 0) {
      if (s.charAt(i) == "-" && self.signum() == 0) mi = true
      continue
    }
    w = b * w + x
    if (++j >= cs) {
      self.dMultiply(d)
      self.dAddOffset(w, 0)
      j = 0
      w = 0
    }
  }
  if (j > 0) {
    self.dMultiply(Math.pow(b, j))
    self.dAddOffset(w, 0)
  }
  if (mi) BigInteger.ZERO.subTo(self, self)
}

// (protected) alternate constructor
function bnpFromNumber(a, b, c) {
  var self = this
  if ("number" == typeof b) {
    // new BigInteger(int,int,RNG)
    if (a < 2) self.fromInt(1)
    else {
      self.fromNumber(a, c)
      if (!self.testBit(a - 1)) // force MSB set
        self.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, self)
      if (self.isEven()) self.dAddOffset(1, 0); // force odd
      while (!self.isProbablePrime(b)) {
        self.dAddOffset(2, 0)
        if (self.bitLength() > a) self.subTo(BigInteger.ONE.shiftLeft(a - 1), self)
      }
    }
  } else {
    // new BigInteger(int,RNG)
    var x = new Array(),
      t = a & 7
    x.length = (a >> 3) + 1
    b.nextBytes(x)
    if (t > 0) x[0] &= ((1 << t) - 1)
    else x[0] = 0
    self.fromString(x, 256)
  }
}

// (public) convert to bigendian byte array
function bnToByteArray() {
  var self = this
  var i = self.t,
    r = new Array()
  r[0] = self.s
  var p = self.DB - (i * self.DB) % 8,
    d, k = 0
  if (i-- > 0) {
    if (p < self.DB && (d = self[i] >> p) != (self.s & self.DM) >> p)
      r[k++] = d | (self.s << (self.DB - p))
    while (i >= 0) {
      if (p < 8) {
        d = (self[i] & ((1 << p) - 1)) << (8 - p)
        d |= self[--i] >> (p += self.DB - 8)
      } else {
        d = (self[i] >> (p -= 8)) & 0xff
        if (p <= 0) {
          p += self.DB
          --i
        }
      }
      if ((d & 0x80) != 0) d |= -256
      if (k === 0 && (self.s & 0x80) != (d & 0x80))++k
      if (k > 0 || d != self.s) r[k++] = d
    }
  }
  return r
}

function bnEquals(a) {
  return (this.compareTo(a) == 0)
}

function bnMin(a) {
  return (this.compareTo(a) < 0) ? this : a
}

function bnMax(a) {
  return (this.compareTo(a) > 0) ? this : a
}

// (protected) r = this op a (bitwise)
function bnpBitwiseTo(a, op, r) {
  var self = this
  var i, f, m = Math.min(a.t, self.t)
  for (i = 0; i < m; ++i) r[i] = op(self[i], a[i])
  if (a.t < self.t) {
    f = a.s & self.DM
    for (i = m; i < self.t; ++i) r[i] = op(self[i], f)
    r.t = self.t
  } else {
    f = self.s & self.DM
    for (i = m; i < a.t; ++i) r[i] = op(f, a[i])
    r.t = a.t
  }
  r.s = op(self.s, a.s)
  r.clamp()
}

// (public) this & a
function op_and(x, y) {
  return x & y
}

function bnAnd(a) {
  var r = new BigInteger()
  this.bitwiseTo(a, op_and, r)
  return r
}

// (public) this | a
function op_or(x, y) {
  return x | y
}

function bnOr(a) {
  var r = new BigInteger()
  this.bitwiseTo(a, op_or, r)
  return r
}

// (public) this ^ a
function op_xor(x, y) {
  return x ^ y
}

function bnXor(a) {
  var r = new BigInteger()
  this.bitwiseTo(a, op_xor, r)
  return r
}

// (public) this & ~a
function op_andnot(x, y) {
  return x & ~y
}

function bnAndNot(a) {
  var r = new BigInteger()
  this.bitwiseTo(a, op_andnot, r)
  return r
}

// (public) ~this
function bnNot() {
  var r = new BigInteger()
  for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i]
  r.t = this.t
  r.s = ~this.s
  return r
}

// (public) this << n
function bnShiftLeft(n) {
  var r = new BigInteger()
  if (n < 0) this.rShiftTo(-n, r)
  else this.lShiftTo(n, r)
  return r
}

// (public) this >> n
function bnShiftRight(n) {
  var r = new BigInteger()
  if (n < 0) this.lShiftTo(-n, r)
  else this.rShiftTo(n, r)
  return r
}

// return index of lowest 1-bit in x, x < 2^31
function lbit(x) {
  if (x == 0) return -1
  var r = 0
  if ((x & 0xffff) == 0) {
    x >>= 16
    r += 16
  }
  if ((x & 0xff) == 0) {
    x >>= 8
    r += 8
  }
  if ((x & 0xf) == 0) {
    x >>= 4
    r += 4
  }
  if ((x & 3) == 0) {
    x >>= 2
    r += 2
  }
  if ((x & 1) == 0)++r
  return r
}

// (public) returns index of lowest 1-bit (or -1 if none)
function bnGetLowestSetBit() {
  for (var i = 0; i < this.t; ++i)
    if (this[i] != 0) return i * this.DB + lbit(this[i])
  if (this.s < 0) return this.t * this.DB
  return -1
}

// return number of 1 bits in x
function cbit(x) {
  var r = 0
  while (x != 0) {
    x &= x - 1
    ++r
  }
  return r
}

// (public) return number of set bits
function bnBitCount() {
  var r = 0,
    x = this.s & this.DM
  for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x)
  return r
}

// (public) true iff nth bit is set
function bnTestBit(n) {
  var j = Math.floor(n / this.DB)
  if (j >= this.t) return (this.s != 0)
  return ((this[j] & (1 << (n % this.DB))) != 0)
}

// (protected) this op (1<<n)
function bnpChangeBit(n, op) {
  var r = BigInteger.ONE.shiftLeft(n)
  this.bitwiseTo(r, op, r)
  return r
}

// (public) this | (1<<n)
function bnSetBit(n) {
  return this.changeBit(n, op_or)
}

// (public) this & ~(1<<n)
function bnClearBit(n) {
  return this.changeBit(n, op_andnot)
}

// (public) this ^ (1<<n)
function bnFlipBit(n) {
  return this.changeBit(n, op_xor)
}

// (protected) r = this + a
function bnpAddTo(a, r) {
  var self = this

  var i = 0,
    c = 0,
    m = Math.min(a.t, self.t)
  while (i < m) {
    c += self[i] + a[i]
    r[i++] = c & self.DM
    c >>= self.DB
  }
  if (a.t < self.t) {
    c += a.s
    while (i < self.t) {
      c += self[i]
      r[i++] = c & self.DM
      c >>= self.DB
    }
    c += self.s
  } else {
    c += self.s
    while (i < a.t) {
      c += a[i]
      r[i++] = c & self.DM
      c >>= self.DB
    }
    c += a.s
  }
  r.s = (c < 0) ? -1 : 0
  if (c > 0) r[i++] = c
  else if (c < -1) r[i++] = self.DV + c
  r.t = i
  r.clamp()
}

// (public) this + a
function bnAdd(a) {
  var r = new BigInteger()
  this.addTo(a, r)
  return r
}

// (public) this - a
function bnSubtract(a) {
  var r = new BigInteger()
  this.subTo(a, r)
  return r
}

// (public) this * a
function bnMultiply(a) {
  var r = new BigInteger()
  this.multiplyTo(a, r)
  return r
}

// (public) this^2
function bnSquare() {
  var r = new BigInteger()
  this.squareTo(r)
  return r
}

// (public) this / a
function bnDivide(a) {
  var r = new BigInteger()
  this.divRemTo(a, r, null)
  return r
}

// (public) this % a
function bnRemainder(a) {
  var r = new BigInteger()
  this.divRemTo(a, null, r)
  return r
}

// (public) [this/a,this%a]
function bnDivideAndRemainder(a) {
  var q = new BigInteger(),
    r = new BigInteger()
  this.divRemTo(a, q, r)
  return new Array(q, r)
}

// (protected) this *= n, this >= 0, 1 < n < DV
function bnpDMultiply(n) {
  this[this.t] = this.am(0, n - 1, this, 0, 0, this.t)
  ++this.t
  this.clamp()
}

// (protected) this += n << w words, this >= 0
function bnpDAddOffset(n, w) {
  if (n == 0) return
  while (this.t <= w) this[this.t++] = 0
  this[w] += n
  while (this[w] >= this.DV) {
    this[w] -= this.DV
    if (++w >= this.t) this[this.t++] = 0
    ++this[w]
  }
}

// A "null" reducer
function NullExp() {}

function nNop(x) {
  return x
}

function nMulTo(x, y, r) {
  x.multiplyTo(y, r)
}

function nSqrTo(x, r) {
  x.squareTo(r)
}

NullExp.prototype.convert = nNop
NullExp.prototype.revert = nNop
NullExp.prototype.mulTo = nMulTo
NullExp.prototype.sqrTo = nSqrTo

// (public) this^e
function bnPow(e) {
  return this.exp(e, new NullExp())
}

// (protected) r = lower n words of "this * a", a.t <= n
// "this" should be the larger one if appropriate.
function bnpMultiplyLowerTo(a, n, r) {
  var i = Math.min(this.t + a.t, n)
  r.s = 0; // assumes a,this >= 0
  r.t = i
  while (i > 0) r[--i] = 0
  var j
  for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t)
  for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i)
  r.clamp()
}

// (protected) r = "this * a" without lower n words, n > 0
// "this" should be the larger one if appropriate.
function bnpMultiplyUpperTo(a, n, r) {
  --n
  var i = r.t = this.t + a.t - n
  r.s = 0; // assumes a,this >= 0
  while (--i >= 0) r[i] = 0
  for (i = Math.max(n - this.t, 0); i < a.t; ++i)
    r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n)
  r.clamp()
  r.drShiftTo(1, r)
}

// Barrett modular reduction
function Barrett(m) {
  // setup Barrett
  this.r2 = new BigInteger()
  this.q3 = new BigInteger()
  BigInteger.ONE.dlShiftTo(2 * m.t, this.r2)
  this.mu = this.r2.divide(m)
  this.m = m
}

function barrettConvert(x) {
  if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m)
  else if (x.compareTo(this.m) < 0) return x
  else {
    var r = new BigInteger()
    x.copyTo(r)
    this.reduce(r)
    return r
  }
}

function barrettRevert(x) {
  return x
}

// x = x mod m (HAC 14.42)
function barrettReduce(x) {
  var self = this
  x.drShiftTo(self.m.t - 1, self.r2)
  if (x.t > self.m.t + 1) {
    x.t = self.m.t + 1
    x.clamp()
  }
  self.mu.multiplyUpperTo(self.r2, self.m.t + 1, self.q3)
  self.m.multiplyLowerTo(self.q3, self.m.t + 1, self.r2)
  while (x.compareTo(self.r2) < 0) x.dAddOffset(1, self.m.t + 1)
  x.subTo(self.r2, x)
  while (x.compareTo(self.m) >= 0) x.subTo(self.m, x)
}

// r = x^2 mod m; x != r
function barrettSqrTo(x, r) {
  x.squareTo(r)
  this.reduce(r)
}

// r = x*y mod m; x,y != r
function barrettMulTo(x, y, r) {
  x.multiplyTo(y, r)
  this.reduce(r)
}

Barrett.prototype.convert = barrettConvert
Barrett.prototype.revert = barrettRevert
Barrett.prototype.reduce = barrettReduce
Barrett.prototype.mulTo = barrettMulTo
Barrett.prototype.sqrTo = barrettSqrTo

// (public) this^e % m (HAC 14.85)
function bnModPow(e, m) {
  var i = e.bitLength(),
    k, r = nbv(1),
    z
  if (i <= 0) return r
  else if (i < 18) k = 1
  else if (i < 48) k = 3
  else if (i < 144) k = 4
  else if (i < 768) k = 5
  else k = 6
  if (i < 8)
    z = new Classic(m)
  else if (m.isEven())
    z = new Barrett(m)
  else
    z = new Montgomery(m)

  // precomputation
  var g = new Array(),
    n = 3,
    k1 = k - 1,
    km = (1 << k) - 1
  g[1] = z.convert(this)
  if (k > 1) {
    var g2 = new BigInteger()
    z.sqrTo(g[1], g2)
    while (n <= km) {
      g[n] = new BigInteger()
      z.mulTo(g2, g[n - 2], g[n])
      n += 2
    }
  }

  var j = e.t - 1,
    w, is1 = true,
    r2 = new BigInteger(),
    t
  i = nbits(e[j]) - 1
  while (j >= 0) {
    if (i >= k1) w = (e[j] >> (i - k1)) & km
    else {
      w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i)
      if (j > 0) w |= e[j - 1] >> (this.DB + i - k1)
    }

    n = k
    while ((w & 1) == 0) {
      w >>= 1
      --n
    }
    if ((i -= n) < 0) {
      i += this.DB
      --j
    }
    if (is1) { // ret == 1, don't bother squaring or multiplying it
      g[w].copyTo(r)
      is1 = false
    } else {
      while (n > 1) {
        z.sqrTo(r, r2)
        z.sqrTo(r2, r)
        n -= 2
      }
      if (n > 0) z.sqrTo(r, r2)
      else {
        t = r
        r = r2
        r2 = t
      }
      z.mulTo(r2, g[w], r)
    }

    while (j >= 0 && (e[j] & (1 << i)) == 0) {
      z.sqrTo(r, r2)
      t = r
      r = r2
      r2 = t
      if (--i < 0) {
        i = this.DB - 1
        --j
      }
    }
  }
  return z.revert(r)
}

// (public) gcd(this,a) (HAC 14.54)
function bnGCD(a) {
  var x = (this.s < 0) ? this.negate() : this.clone()
  var y = (a.s < 0) ? a.negate() : a.clone()
  if (x.compareTo(y) < 0) {
    var t = x
    x = y
    y = t
  }
  var i = x.getLowestSetBit(),
    g = y.getLowestSetBit()
  if (g < 0) return x
  if (i < g) g = i
  if (g > 0) {
    x.rShiftTo(g, x)
    y.rShiftTo(g, y)
  }
  while (x.signum() > 0) {
    if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x)
    if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y)
    if (x.compareTo(y) >= 0) {
      x.subTo(y, x)
      x.rShiftTo(1, x)
    } else {
      y.subTo(x, y)
      y.rShiftTo(1, y)
    }
  }
  if (g > 0) y.lShiftTo(g, y)
  return y
}

// (protected) this % n, n < 2^26
function bnpModInt(n) {
  if (n <= 0) return 0
  var d = this.DV % n,
    r = (this.s < 0) ? n - 1 : 0
  if (this.t > 0)
    if (d == 0) r = this[0] % n
    else
      for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n
  return r
}

// (public) 1/this % m (HAC 14.61)
function bnModInverse(m) {
  var ac = m.isEven()
  if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO
  var u = m.clone(),
    v = this.clone()
  var a = nbv(1),
    b = nbv(0),
    c = nbv(0),
    d = nbv(1)
  while (u.signum() != 0) {
    while (u.isEven()) {
      u.rShiftTo(1, u)
      if (ac) {
        if (!a.isEven() || !b.isEven()) {
          a.addTo(this, a)
          b.subTo(m, b)
        }
        a.rShiftTo(1, a)
      } else if (!b.isEven()) b.subTo(m, b)
      b.rShiftTo(1, b)
    }
    while (v.isEven()) {
      v.rShiftTo(1, v)
      if (ac) {
        if (!c.isEven() || !d.isEven()) {
          c.addTo(this, c)
          d.subTo(m, d)
        }
        c.rShiftTo(1, c)
      } else if (!d.isEven()) d.subTo(m, d)
      d.rShiftTo(1, d)
    }
    if (u.compareTo(v) >= 0) {
      u.subTo(v, u)
      if (ac) a.subTo(c, a)
      b.subTo(d, b)
    } else {
      v.subTo(u, v)
      if (ac) c.subTo(a, c)
      d.subTo(b, d)
    }
  }
  if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO
  if (d.compareTo(m) >= 0) return d.subtract(m)
  if (d.signum() < 0) d.addTo(m, d)
  else return d
  if (d.signum() < 0) return d.add(m)
  else return d
}

// protected
proto.chunkSize = bnpChunkSize
proto.toRadix = bnpToRadix
proto.fromRadix = bnpFromRadix
proto.fromNumber = bnpFromNumber
proto.bitwiseTo = bnpBitwiseTo
proto.changeBit = bnpChangeBit
proto.addTo = bnpAddTo
proto.dMultiply = bnpDMultiply
proto.dAddOffset = bnpDAddOffset
proto.multiplyLowerTo = bnpMultiplyLowerTo
proto.multiplyUpperTo = bnpMultiplyUpperTo
proto.modInt = bnpModInt

// public
proto.clone = bnClone
proto.intValue = bnIntValue
proto.byteValue = bnByteValue
proto.shortValue = bnShortValue
proto.signum = bnSigNum
proto.toByteArray = bnToByteArray
proto.equals = bnEquals
proto.min = bnMin
proto.max = bnMax
proto.and = bnAnd
proto.or = bnOr
proto.xor = bnXor
proto.andNot = bnAndNot
proto.not = bnNot
proto.shiftLeft = bnShiftLeft
proto.shiftRight = bnShiftRight
proto.getLowestSetBit = bnGetLowestSetBit
proto.bitCount = bnBitCount
proto.testBit = bnTestBit
proto.setBit = bnSetBit
proto.clearBit = bnClearBit
proto.flipBit = bnFlipBit
proto.add = bnAdd
proto.subtract = bnSubtract
proto.multiply = bnMultiply
proto.divide = bnDivide
proto.remainder = bnRemainder
proto.divideAndRemainder = bnDivideAndRemainder
proto.modPow = bnModPow
proto.modInverse = bnModInverse
proto.pow = bnPow
proto.gcd = bnGCD

// JSBN-specific extension
proto.square = bnSquare

// constants
BigInteger.ZERO = nbv(0)
BigInteger.ONE = nbv(1)
BigInteger.valueOf = nbv

module.exports = BigInteger

},{"assert":2}],14:[function(_dereq_,module,exports){
(function (Buffer){
// FIXME: Kind of a weird way to throw exceptions, consider removing
var assert = _dereq_('assert')
var BigInteger = _dereq_('./bigi')

/**
 * Turns a byte array into a big integer.
 *
 * This function will interpret a byte array as a big integer in big
 * endian notation.
 */
BigInteger.fromByteArrayUnsigned = function(byteArray) {
  // BigInteger expects a DER integer conformant byte array
  if (byteArray[0] & 0x80) {
    return new BigInteger([0].concat(byteArray))
  }

  return new BigInteger(byteArray)
}

/**
 * Returns a byte array representation of the big integer.
 *
 * This returns the absolute of the contained value in big endian
 * form. A value of zero results in an empty array.
 */
BigInteger.prototype.toByteArrayUnsigned = function() {
  var byteArray = this.toByteArray()
  return byteArray[0] === 0 ? byteArray.slice(1) : byteArray
}

BigInteger.fromDERInteger = function(byteArray) {
  return new BigInteger(byteArray)
}

/*
 * Converts BigInteger to a DER integer representation.
 *
 * The format for this value uses the most significant bit as a sign
 * bit.  If the most significant bit is already set and the integer is
 * positive, a 0x00 is prepended.
 *
 * Examples:
 *
 *      0 =>     0x00
 *      1 =>     0x01
 *     -1 =>     0xff
 *    127 =>     0x7f
 *   -127 =>     0x81
 *    128 =>   0x0080
 *   -128 =>     0x80
 *    255 =>   0x00ff
 *   -255 =>   0xff01
 *  16300 =>   0x3fac
 * -16300 =>   0xc054
 *  62300 => 0x00f35c
 * -62300 => 0xff0ca4
*/
BigInteger.prototype.toDERInteger = BigInteger.prototype.toByteArray

BigInteger.fromBuffer = function(buffer) {
  // BigInteger expects a DER integer conformant byte array
  if (buffer[0] & 0x80) {
    var byteArray = Array.prototype.slice.call(buffer)

    return new BigInteger([0].concat(byteArray))
  }

  return new BigInteger(buffer)
}

BigInteger.fromHex = function(hex) {
  if (hex === '') return BigInteger.ZERO

  assert.equal(hex, hex.match(/^[A-Fa-f0-9]+/), 'Invalid hex string')
  assert.equal(hex.length % 2, 0, 'Incomplete hex')
  return new BigInteger(hex, 16)
}

BigInteger.prototype.toBuffer = function(size) {
  var byteArray = this.toByteArrayUnsigned()
  var zeros = []

  var padding = size - byteArray.length
  while (zeros.length < padding) zeros.push(0)

  return new Buffer(zeros.concat(byteArray))
}

BigInteger.prototype.toHex = function(size) {
  return this.toBuffer(size).toString('hex')
}

}).call(this,_dereq_("buffer").Buffer)
},{"./bigi":13,"assert":2,"buffer":5}],15:[function(_dereq_,module,exports){
var BigInteger = _dereq_('./bigi')

//addons
_dereq_('./convert')

module.exports = BigInteger
},{"./bigi":13,"./convert":14}],16:[function(_dereq_,module,exports){
module.exports=_dereq_(8)
},{}],17:[function(_dereq_,module,exports){
(function (Buffer){
var sjcl = _dereq_('satoshi-sjcl');
var hkdf = _dereq_('../lib/hkdf');

var toBits = sjcl.codec.bytes.toBits;
var toBytes = sjcl.codec.bytes.fromBits;

var ripemd160 = sjcl.hash.ripemd160.hash;
var sha256 = sjcl.hash.sha256.hash;
var sha512 = sjcl.hash.sha512.hash;

function wrap(fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    for (var i = 0; i < args.length; i++) {
      if (Buffer.isBuffer(args[i])) {
        args[i] = toBits(args[i]);
      }
    }
    return new Buffer(toBytes(fn.apply(null, args)));
  }
}

function hash160(data) {
  return ripemd160(sha256(data));
}

function hash256(data) {
  return sha256(sha256(data));
}

function hmacsha256(key, data) {
  return new sjcl.misc.hmac(key, sjcl.hash.sha256).encrypt(data);
}

function hmacsha512(key, data) {
  return new sjcl.misc.hmac(key, sjcl.hash.sha512).encrypt(data);
}

exports.ripemd160 = wrap(ripemd160);
exports.sha256 = wrap(sha256);
exports.sha512 = wrap(sha512);
exports.hash160 = wrap(hash160);
exports.hash256 = wrap(hash256);
exports.hmacsha256 = wrap(hmacsha256);
exports.hmacsha512 = wrap(hmacsha512);
exports.hkdf256 = hkdf(wrap(hmacsha256), 32);

}).call(this,_dereq_("buffer").Buffer)
},{"../lib/hkdf":18,"buffer":5,"satoshi-sjcl":30}],18:[function(_dereq_,module,exports){
(function (Buffer){
module.exports = function (hmac, hashLength) {
  return {
    extract: function (salt, input) {
      if (typeof salt === 'string') {
        salt = new Buffer(salt);
      }
      if (typeof input === 'string') {
        input = new Buffer(input);
      }
      return hmac(salt, input);
    },
    expand: function (key, info, length) {
      if (typeof info === 'string') {
        info = new Buffer(info);
      }
      var prev = new Buffer(0);
      var output = new Buffer(0);
      var numBlocks = Math.ceil(length / hashLength);

      for (var i = 1; i <= numBlocks; i++) {
        prev = hmac(key, Buffer.concat([prev, info, new Buffer([i])]));
        output = Buffer.concat([output, prev])
      }

      return output.slice(0, length);
    }
  }
};

}).call(this,_dereq_("buffer").Buffer)
},{"buffer":5}],19:[function(_dereq_,module,exports){
(function (Buffer){
var Key = _dereq_('satoshi-key');
var sjcl = _dereq_('satoshi-sjcl');
var ecc = sjcl.ecc;
var curve = ecc.curves.k256;
var b = sjcl.bitArray;

var toBits = sjcl.codec.bytes.toBits;
var toBytes = sjcl.codec.bytes.fromBits;
var bn = function (buffer) {
  return sjcl.bn.fromBits(toBits(buffer));
};

function pubToPoint(pubUncompressed) {
  var x = new Buffer(33);
  var y = new Buffer(33);
  x[0] = 0;
  y[0] = 0;
  pubUncompressed.copy(x, 1, 1, 33);
  pubUncompressed.copy(y, 1, 33, 65);
  return ecc.curves.k256.fromBits(new ecc.point(curve, bn(x), bn(y)).toBits());
};

exports.derivePrivate = function (IL, prv) {
  IL = bn(IL);
  if (IL.greaterEquals(curve.r)) return;
  prv = bn(prv);
  var ki = IL.add(prv).mod(curve.r);
  if (ki.equals(0)) return;

  return new Buffer(toBytes(ki.toBits()));
};

exports.derivePublic = function (IL, pubUncompressed) {
  IL = bn(IL);
  if (IL.greaterEquals(curve.r)) return;
  var pubPoint = pubToPoint(pubUncompressed);

  var ILMult = curve.G.mult(IL);
  var Ki = pubPoint.toJac().add(ILMult).toAffine();

  var x = toBytes(Ki.x.toBits());
  var y = toBytes(Ki.y.toBits());
  return new Buffer([0x04].concat(x, y));
};

}).call(this,_dereq_("buffer").Buffer)
},{"buffer":5,"satoshi-key":22,"satoshi-sjcl":30}],20:[function(_dereq_,module,exports){
(function (Buffer){
var Address = _dereq_('satoshi-address');
var base58 = _dereq_('satoshi-base58');
var derive = _dereq_('./derive-module');
var hmacsha512 = _dereq_('satoshi-hash').hmacsha512;
var hash160 = _dereq_('satoshi-hash').hash160;
var Key = _dereq_('satoshi-key');

function parseExtendedKey(xkey) {
  var data = base58.decodeCheck(xkey);
  if (!data || data.length !== 78) {
    throw new Error('invalid data or checksum');
  }
  var version = HDKey.versions[data.readUInt32BE(0)];
  if (!version) {
    throw new Error('unknown version');
  }

  var options = {
    network: version.network,
    depth: data.readUInt8(4),
    parent: data.slice(5, 9),
    index: data.readUInt32BE(9),
    chain: data.slice(13, 45)
  };

  if (version.type === 'prv') {
    // Discard the prefixed 0x00 byte
    options.prv = data.slice(46, 78);
  } else {
    options.pub = data.slice(45, 78);
  }

  return options;
}

function deriveFromMasterSeed(seed) {
  var masterSeed = hmacsha512(new Buffer('Bitcoin seed'), seed);
  return {
    chain: masterSeed.slice(32),
    prv: masterSeed.slice(0, 32)
  };
}

function HDKey(data) {
  if (!data) {
    throw new Error('no data');
  }
  if (typeof data === 'string') {
    return new HDKey(parseExtendedKey(data));
  }
  this.network = data.network || 'mainnet';
  if (Buffer.isBuffer(data.seed)) {
    return new HDKey(deriveFromMasterSeed(data.seed));
  }
  if (!(data.chain && data.chain.length === 32)) {
    throw new Error('invalid chain code');
  }
  if (!(data.prv && data.prv.length === 32) && !(data.pub && (data.pub.length >= 33 && data.pub.length <= 65 ))) {
    throw new Error('invalid keys');
  }

  this.chain = data.chain;
  if (data.prv) {
    this.prv = data.prv;
    this.key = new Key({ prv: data.prv });
  } else {
    this.key = new Key({ pub: data.pub });
  }
  this.pub = this.key.pub;
  this.id = hash160(this.pub);
  this.fingerprint = this.id.slice(0, 4);
  this.parent = data.parent || new Buffer([0, 0, 0, 0]);
  this.depth = data.depth || 0;
  this.index = data.index || 0;
}

HDKey.prototype.getAddress = function () {
  return new Address(this.id, 'pubkeyhash', this.network);
};

HDKey.prototype.derive = function (index) {
  var hardened = index >= HDKey.HARDENED_START;
  var data = new Buffer(37);
  if (hardened) {
    if (!this.prv) {
      throw new Error('Cannot derive hardened child without a private key');
    }
    data[0] = 0;
    this.prv.copy(data, 1, 0, 32);
  } else {
    this.pub.copy(data, 0, 0, 33);
  }
  data.writeUInt32BE(index, 33);

  var I = hmacsha512(this.chain, data);
  var IL = I.slice(0, 32);
  var IR = I.slice(32);

  var child = {
    chain: IR,
    network: this.network,
    depth: this.depth + 1,
    parent: this.fingerprint,
    index: index
  };

  if (this.prv) {
    child.prv = derive.derivePrivate(IL, this.prv);
  } else {
    child.pub = derive.derivePublic(IL, this.key.pubUncompressed);
  }
  return new HDKey(child);
};

HDKey.prototype.deriveHardened = function (index) {
  return this.derive(HDKey.HARDENED_START + index);
};

HDKey.prototype.toBuffer = function (prv) {
  if (prv && !this.prv) {
    throw new Error('not private key');
  }
  var buffer = new Buffer(78);
  buffer.writeUInt32BE(HDKey.networks[this.network][prv ? 'prv' : 'pub'], 0);
  buffer.writeUInt8(this.depth, 4);
  this.parent.copy(buffer, 5, 0, 4);
  buffer.writeUInt32BE(this.index, 9);
  this.chain.copy(buffer, 13, 0, 32);
  if (prv) {
    buffer[45] = 0;
    this.prv.copy(buffer, 46, 0, 32);
  } else {
    this.pub.copy(buffer, 45, 0, 33);
  }
  return buffer;
};

HDKey.prototype.toString = function (prv) {
  return base58.encodeCheck(this.toBuffer(prv));
};

HDKey.isValid = function (data) {
  try {
    new HDKey(data);
    return true;
  } catch (e) {
    return false;
  }
};

HDKey.networks = {
  mainnet: {
    prv: 0x0488ade4,
    pub: 0x0488b21e
  },
  testnet: {
    prv: 0x04358394,
    pub: 0x043587cf
  }
};

Object.defineProperty(HDKey, 'versions', {
  get: function () {
    var networks = HDKey.networks;
    return Object.keys(networks).reduce(function (versions, network) {
      Object.keys(networks[network]).forEach(function (type) {
        var version = networks[network][type];
        versions[version] = { network: network, type: type };
      });
      return versions;
    }, {});
  }
});

HDKey.HARDENED_START = 0x80000000;

module.exports = HDKey;

}).call(this,_dereq_("buffer").Buffer)
},{"./derive-module":19,"buffer":5,"satoshi-address":10,"satoshi-base58":12,"satoshi-hash":17,"satoshi-key":22}],21:[function(_dereq_,module,exports){
(function (Buffer){
var assert = _dereq_('assert');
var sjcl = _dereq_('satoshi-sjcl');
var b = sjcl.bitArray;
var ecc = sjcl.ecc;
var curve = ecc.curves.k256;

var toBits = sjcl.codec.bytes.toBits;
var toBytes = sjcl.codec.bytes.fromBits;
function toBuffer(bits) {
  return new Buffer(toBytes(bits));
}
function bn(bytes) {
  return sjcl.bn.fromBits(toBits(bytes));
}

var _0x00 = [b.partial(8, 0x00)];
var _0x02 = [b.partial(8, 0x02)];
var Q = new sjcl.bn('3fffffffffffffffffffffffffffffffffffffffffffffffffffffffbfffff0c');

function pubToPoint(pub) {
  var even = b.bitSlice(pub, 0, 8);
  var xBits = b.concat(_0x00, b.bitSlice(pub, 8, 256 + 8));
  var yBits = b.concat(_0x00, b.bitSlice(pub, 256 + 8));

  var x = sjcl.bn.fromBits(xBits);
  var y = sjcl.bn.fromBits(yBits);

  // Decompress Y if necessary
  if (y.equals(0) && curve.field.modulus.mod(new sjcl.bn(4)).equals(new sjcl.bn(3))) {
    // y^2 = x^3 + ax^2 + b, so we need to perform sqrt to recover y
    var ySquared = curve.b.add(x.mul(curve.a.add(x.square())));
    var y = ySquared.powermod(Q, curve.field.modulus);

    if (y.mod(2).equals(0) !== b.equal(even, _0x02)) {
      y = curve.field.modulus.sub(y);
    }
  }
  // reserialise curve here, exception is thrown when point is not on curve.
  return ecc.curves.k256.fromBits(new ecc.point(curve, x, y).toBits());
}

function KeyModule() {
  this.prv = null;
  this._point = null;
  this._pub = null;
  this._pubUncompressed = null;
}

KeyModule.prototype._updatePub = function () {
  var x = toBytes(this._point.x.toBits());
  var y = toBytes(this._point.y.toBits());
  var even = this._point.y.mod(2).equals(0);
  this._pub = new Buffer([even ? 0x02 : 0x03].concat(x));
  this._pubUncompressed = new Buffer([0x04].concat(x, y));
};

KeyModule.prototype._setPub = function (pub) {
  try {
    this._point = pubToPoint(toBits(pub));
    this._keypair = {
      pub: new sjcl.ecc.ecdsa.publicKey(curve, this._point)
    };
    this._updatePub();
  } catch (e) {
    throw new Error('invalid public key');
  }
};

Object.defineProperty(KeyModule.prototype, 'pub', {
  get: function () {
    return this._pub;
  },
  set: function (value) {
    assert(!this.private, 'cannot set pub for private key');
    this._setPub(value);
  }
});

Object.defineProperty(KeyModule.prototype, 'pubUncompressed', {
  get: function () {
    return this._pubUncompressed;
  },
  set: function (value) {
    assert(!this.private, 'cannot set pubUncompressed for private key');
    this._setPub(value);
  }
});

KeyModule.prototype.regenerate = function () {
  this._keypair = ecc.ecdsa.generateKeys(curve, 0, bn(this.prv));
  this._point = this._keypair.pub._point;
  this._updatePub();
};

KeyModule.prototype.sign = function (hash, k) {
  var sig = this._keypair.sec.sign(toBits(hash), null, null, bn(k));

  var q = this._keypair.sec._curve.r.copy();
  var l = q.bitLength();
  var r = b.bitSlice(sig, 0, l);
  var s = sjcl.bn.fromBits(b.bitSlice(sig, l, l * 2));

  var halfQ = q.copy().halveM();
  if (s.greaterEquals(halfQ)) {
    q.subM(s);
    sig = b.concat(r, q.toBits(l));
  }

  return toBuffer(sig);
};

KeyModule.prototype.verify = function (hash, signature) {
  // Unfortunately sjcl ecdsa verify throws an error on invalid signatures
  try {
    return this._keypair.pub.verify(toBits(hash), toBits(signature));
  } catch (e) {
    return false;
  }
};

module.exports = KeyModule;

}).call(this,_dereq_("buffer").Buffer)
},{"assert":2,"buffer":5,"satoshi-sjcl":30}],22:[function(_dereq_,module,exports){
(function (Buffer){
var Address = _dereq_('satoshi-address');
var KeyModule = _dereq_('./key-module');
var hash160 = _dereq_('satoshi-hash').hash160;
var hmacsha256 = _dereq_('satoshi-hash').hmacsha256;

function Key(options) {
  this.keyModule = new KeyModule();
  if (options.prv) {
    this.prv = options.prv;
    this.keyModule.regenerate();
  } else if (options.pub) {
    this.pub = options.pub;
  }
  this.network = options.network || 'mainnet';
}

Object.defineProperty(Key.prototype, 'prv', {
  get: function () {
    return this._prv;
  },
  set: function (value) {
    this._prv = value;
    this.keyModule.prv = value;
  }
});

Object.defineProperty(Key.prototype, 'pub', {
  get: function () {
    return this.keyModule.pub;
  },
  set: function (value) {
    this.keyModule.pub = value;
  }
});

Object.defineProperty(Key.prototype, 'pubUncompressed', {
  get: function () {
    return this.keyModule.pubUncompressed;
  },
  set: function (value) {
    this.keyModule.pubUncompressed = value;
  }
});

Key.prototype.getAddress = function () {
  var hash = hash160(this.pub);
  return new Address(hash, 'pubkeyhash', this.network);
};

Key.prototype.sign = function (hash) {
  var k = Key.generateK(this.prv, hash);
  return this.keyModule.sign(hash, k);
};

Key.prototype.verify = function (hash, signature) {
  return this.keyModule.verify(hash, signature);
};

// rfc6979
Key.generateK = function(prv, hash) {
  var v = new Buffer(32);
  var k = new Buffer(32);
  v.fill(0x01);
  k.fill(0x00);
  k = hmacsha256(k, Buffer.concat([v, new Buffer([0x00]), prv, hash]));
  v = hmacsha256(k, v);
  k = hmacsha256(k, Buffer.concat([v, new Buffer([0x01]), prv, hash]));
  v = hmacsha256(k, v);
  v = hmacsha256(k, v);
  return v;
};

module.exports = Key;

}).call(this,_dereq_("buffer").Buffer)
},{"./key-module":21,"buffer":5,"satoshi-address":10,"satoshi-hash":17}],23:[function(_dereq_,module,exports){
(function (Buffer){
var sjcl = _dereq_('satoshi-sjcl');

var toBits = sjcl.codec.bytes.toBits;
var toBytes = sjcl.codec.bytes.fromBits;

function wrap(fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    for (var i = 0; i < args.length; i++) {
      if (Buffer.isBuffer(args[i])) {
        args[i] = toBits(args[i]);
      }
    }
    return new Buffer(toBytes(fn.apply(null, args)));
  }
}

module.exports = wrap(function (password, salt) {
  return sjcl.misc.pbkdf2(password, salt, 2048, 512, function (key) {
    return new sjcl.misc.hmac(key, sjcl.hash.sha512);
  });
});

}).call(this,_dereq_("buffer").Buffer)
},{"buffer":5,"satoshi-sjcl":30}],24:[function(_dereq_,module,exports){
(function (Buffer){
var sha256 = _dereq_('satoshi-hash').sha256;
var pbkdf2 = _dereq_('./pbkdf2');

var wordlist = "abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual adapt add addict address adjust admit adult advance advice aerobic affair afford afraid again age agent agree ahead aim air airport aisle alarm album alcohol alert alien all alley allow almost alone alpha already also alter always amateur amazing among amount amused analyst anchor ancient anger angle angry animal ankle announce annual another answer antenna antique anxiety any apart apology appear apple approve april arch arctic area arena argue arm armed armor army around arrange arrest arrive arrow art artefact artist artwork ask aspect assault asset assist assume asthma athlete atom attack attend attitude attract auction audit august aunt author auto autumn average avocado avoid awake aware away awesome awful awkward axis baby bachelor bacon badge bag balance balcony ball bamboo banana banner bar barely bargain barrel base basic basket battle beach bean beauty because become beef before begin behave behind believe below belt bench benefit best betray better between beyond bicycle bid bike bind biology bird birth bitter black blade blame blanket blast bleak bless blind blood blossom blouse blue blur blush board boat body boil bomb bone bonus book boost border boring borrow boss bottom bounce box boy bracket brain brand brass brave bread breeze brick bridge brief bright bring brisk broccoli broken bronze broom brother brown brush bubble buddy budget buffalo build bulb bulk bullet bundle bunker burden burger burst bus business busy butter buyer buzz cabbage cabin cable cactus cage cake call calm camera camp can canal cancel candy cannon canoe canvas canyon capable capital captain car carbon card cargo carpet carry cart case cash casino castle casual cat catalog catch category cattle caught cause caution cave ceiling celery cement census century cereal certain chair chalk champion change chaos chapter charge chase chat cheap check cheese chef cherry chest chicken chief child chimney choice choose chronic chuckle chunk churn cigar cinnamon circle citizen city civil claim clap clarify claw clay clean clerk clever click client cliff climb clinic clip clock clog close cloth cloud clown club clump cluster clutch coach coast coconut code coffee coil coin collect color column combine come comfort comic common company concert conduct confirm congress connect consider control convince cook cool copper copy coral core corn correct cost cotton couch country couple course cousin cover coyote crack cradle craft cram crane crash crater crawl crazy cream credit creek crew cricket crime crisp critic crop cross crouch crowd crucial cruel cruise crumble crunch crush cry crystal cube culture cup cupboard curious current curtain curve cushion custom cute cycle dad damage damp dance danger daring dash daughter dawn day deal debate debris decade december decide decline decorate decrease deer defense define defy degree delay deliver demand demise denial dentist deny depart depend deposit depth deputy derive describe desert design desk despair destroy detail detect develop device devote diagram dial diamond diary dice diesel diet differ digital dignity dilemma dinner dinosaur direct dirt disagree discover disease dish dismiss disorder display distance divert divide divorce dizzy doctor document dog doll dolphin domain donate donkey donor door dose double dove draft dragon drama drastic draw dream dress drift drill drink drip drive drop drum dry duck dumb dune during dust dutch duty dwarf dynamic eager eagle early earn earth easily east easy echo ecology economy edge edit educate effort egg eight either elbow elder electric elegant element elephant elevator elite else embark embody embrace emerge emotion employ empower empty enable enact end endless endorse enemy energy enforce engage engine enhance enjoy enlist enough enrich enroll ensure enter entire entry envelope episode equal equip era erase erode erosion error erupt escape essay essence estate eternal ethics evidence evil evoke evolve exact example excess exchange excite exclude excuse execute exercise exhaust exhibit exile exist exit exotic expand expect expire explain expose express extend extra eye eyebrow fabric face faculty fade faint faith fall false fame family famous fan fancy fantasy farm fashion fat fatal father fatigue fault favorite feature february federal fee feed feel female fence festival fetch fever few fiber fiction field figure file film filter final find fine finger finish fire firm first fiscal fish fit fitness fix flag flame flash flat flavor flee flight flip float flock floor flower fluid flush fly foam focus fog foil fold follow food foot force forest forget fork fortune forum forward fossil foster found fox fragile frame frequent fresh friend fringe frog front frost frown frozen fruit fuel fun funny furnace fury future gadget gain galaxy gallery game gap garage garbage garden garlic garment gas gasp gate gather gauge gaze general genius genre gentle genuine gesture ghost giant gift giggle ginger giraffe girl give glad glance glare glass glide glimpse globe gloom glory glove glow glue goat goddess gold good goose gorilla gospel gossip govern gown grab grace grain grant grape grass gravity great green grid grief grit grocery group grow grunt guard guess guide guilt guitar gun gym habit hair half hammer hamster hand happy harbor hard harsh harvest hat have hawk hazard head health heart heavy hedgehog height hello helmet help hen hero hidden high hill hint hip hire history hobby hockey hold hole holiday hollow home honey hood hope horn horror horse hospital host hotel hour hover hub huge human humble humor hundred hungry hunt hurdle hurry hurt husband hybrid ice icon idea identify idle ignore ill illegal illness image imitate immense immune impact impose improve impulse inch include income increase index indicate indoor industry infant inflict inform inhale inherit initial inject injury inmate inner innocent input inquiry insane insect inside inspire install intact interest into invest invite involve iron island isolate issue item ivory jacket jaguar jar jazz jealous jeans jelly jewel job join joke journey joy judge juice jump jungle junior junk just kangaroo keen keep ketchup key kick kid kidney kind kingdom kiss kit kitchen kite kitten kiwi knee knife knock know lab label labor ladder lady lake lamp language laptop large later latin laugh laundry lava law lawn lawsuit layer lazy leader leaf learn leave lecture left leg legal legend leisure lemon lend length lens leopard lesson letter level liar liberty library license life lift light like limb limit link lion liquid list little live lizard load loan lobster local lock logic lonely long loop lottery loud lounge love loyal lucky luggage lumber lunar lunch luxury lyrics machine mad magic magnet maid mail main major make mammal man manage mandate mango mansion manual maple marble march margin marine market marriage mask mass master match material math matrix matter maximum maze meadow mean measure meat mechanic medal media melody melt member memory mention menu mercy merge merit merry mesh message metal method middle midnight milk million mimic mind minimum minor minute miracle mirror misery miss mistake mix mixed mixture mobile model modify mom moment monitor monkey monster month moon moral more morning mosquito mother motion motor mountain mouse move movie much muffin mule multiply muscle museum mushroom music must mutual myself mystery myth naive name napkin narrow nasty nation nature near neck need negative neglect neither nephew nerve nest net network neutral never news next nice night noble noise nominee noodle normal north nose notable note nothing notice novel now nuclear number nurse nut oak obey object oblige obscure observe obtain obvious occur ocean october odor off offer office often oil okay old olive olympic omit once one onion online only open opera opinion oppose option orange orbit orchard order ordinary organ orient original orphan ostrich other outdoor outer output outside oval oven over own owner oxygen oyster ozone pact paddle page pair palace palm panda panel panic panther paper parade parent park parrot party pass patch path patient patrol pattern pause pave payment peace peanut pear peasant pelican pen penalty pencil people pepper perfect permit person pet phone photo phrase physical piano picnic picture piece pig pigeon pill pilot pink pioneer pipe pistol pitch pizza place planet plastic plate play please pledge pluck plug plunge poem poet point polar pole police pond pony pool popular portion position possible post potato pottery poverty powder power practice praise predict prefer prepare present pretty prevent price pride primary print priority prison private prize problem process produce profit program project promote proof property prosper protect proud provide public pudding pull pulp pulse pumpkin punch pupil puppy purchase purity purpose purse push put puzzle pyramid quality quantum quarter question quick quit quiz quote rabbit raccoon race rack radar radio rail rain raise rally ramp ranch random range rapid rare rate rather raven raw razor ready real reason rebel rebuild recall receive recipe record recycle reduce reflect reform refuse region regret regular reject relax release relief rely remain remember remind remove render renew rent reopen repair repeat replace report require rescue resemble resist resource response result retire retreat return reunion reveal review reward rhythm rib ribbon rice rich ride ridge rifle right rigid ring riot ripple risk ritual rival river road roast robot robust rocket romance roof rookie room rose rotate rough round route royal rubber rude rug rule run runway rural sad saddle sadness safe sail salad salmon salon salt salute same sample sand satisfy satoshi sauce sausage save say scale scan scare scatter scene scheme school science scissors scorpion scout scrap screen script scrub sea search season seat second secret section security seed seek segment select sell seminar senior sense sentence series service session settle setup seven shadow shaft shallow share shed shell sheriff shield shift shine ship shiver shock shoe shoot shop short shoulder shove shrimp shrug shuffle shy sibling sick side siege sight sign silent silk silly silver similar simple since sing siren sister situate six size skate sketch ski skill skin skirt skull slab slam sleep slender slice slide slight slim slogan slot slow slush small smart smile smoke smooth snack snake snap sniff snow soap soccer social sock soda soft solar soldier solid solution solve someone song soon sorry sort soul sound soup source south space spare spatial spawn speak special speed spell spend sphere spice spider spike spin spirit split spoil sponsor spoon sport spot spray spread spring spy square squeeze squirrel stable stadium staff stage stairs stamp stand start state stay steak steel stem step stereo stick still sting stock stomach stone stool story stove strategy street strike strong struggle student stuff stumble style subject submit subway success such sudden suffer sugar suggest suit summer sun sunny sunset super supply supreme sure surface surge surprise surround survey suspect sustain swallow swamp swap swarm swear sweet swift swim swing switch sword symbol symptom syrup system table tackle tag tail talent talk tank tape target task taste tattoo taxi teach team tell ten tenant tennis tent term test text thank that theme then theory there they thing this thought three thrive throw thumb thunder ticket tide tiger tilt timber time tiny tip tired tissue title toast tobacco today toddler toe together toilet token tomato tomorrow tone tongue tonight tool tooth top topic topple torch tornado tortoise toss total tourist toward tower town toy track trade traffic tragic train transfer trap trash travel tray treat tree trend trial tribe trick trigger trim trip trophy trouble truck true truly trumpet trust truth try tube tuition tumble tuna tunnel turkey turn turtle twelve twenty twice twin twist two type typical ugly umbrella unable unaware uncle uncover under undo unfair unfold unhappy uniform unique unit universe unknown unlock until unusual unveil update upgrade uphold upon upper upset urban urge usage use used useful useless usual utility vacant vacuum vague valid valley valve van vanish vapor various vast vault vehicle velvet vendor venture venue verb verify version very vessel veteran viable vibrant vicious victory video view village vintage violin virtual virus visa visit visual vital vivid vocal voice void volcano volume vote voyage wage wagon wait walk wall walnut want warfare warm warrior wash wasp waste water wave way wealth weapon wear weasel weather web wedding weekend weird welcome west wet whale what wheat wheel when where whip whisper wide width wife wild will win window wine wing wink winner winter wire wisdom wise wish witness wolf woman wonder wood wool word work world worry worth wrap wreck wrestle wrist write wrong yard year yellow you young youth zebra zero zone zoo".split(' ');
var lookup = wordlist.reduce(function (obj, word, index) {
  obj[word] = index;
  return obj;
}, {});

function toArray(buffer) {
  return Array.prototype.slice.call(buffer);
}

function toBits(n, length) {
  var s = n.toString(2);
  while(s.length < length) {
    s = '0' + s;
  }
  return s;
}

function toBitString(buffer) {
  return toArray(buffer).map(function (b) { return toBits(b, 8); }).join('');
}

function encode(entropy) {
  if (!Buffer.isBuffer(entropy)) {
    throw new Error('Expected a buffer');
  }
  if (entropy.length < 4) {
    throw new Error('Too short');
  }
  if (entropy.length % 4 !== 0) {
    throw new Error('Must be a multiple of 4 bytes');
  }

  var bitLength = (entropy.length * 8) + (entropy.length / 4);
  var bitString = (toBitString(entropy) + toBitString(sha256(entropy))).substring(0, bitLength);

  var words = [];
  for (var i = 0; i < bitLength; i += 11) {
    var wordValue = parseInt(bitString.substring(i, i + 11), 2);
    words.push(wordlist[wordValue]);
  }
  return words;
}

function decode(words) {
  if (!Array.isArray(words)) {
    throw new Error('Expected an array');
  }
  if (words.length < 3) {
    throw new Error('Too few words');
  }
  if (words.length % 3 !== 0) {
    throw new Error('Expected a multiple of 3 words');
  }

  var totalLength = words.length * 11;
  var checksumLength = words.length / 3;
  var bitLength = totalLength - checksumLength;
  var bitString = '';
  words.forEach(function (word) {
    bitString += toBits(lookup[word], 11);
  });

  var resultBits = bitString.substring(0, bitLength);
  var result = new Buffer(bitLength / 8);
  for (var i = 0; i < result.length; i++) {
    result[i] = parseInt(resultBits.substring(i * 8, (i + 1) * 8), 2);
  }

  var checksum = bitString.substring(bitLength, totalLength);
  var checksumCalc = toBitString(sha256(result)).substring(0, checksumLength);
  if (checksum !== checksumCalc) {
    throw new Error('Checksum mismatch');
  }

  return result;
}

function check(words) {
  try {
    decode(words);
    return true;
  } catch (e) {
    return false;
  }
}

function toSeed(words, password) {
  return pbkdf2(words.join(' '), 'mnemonic' + (password || ''));
}

exports.encode = encode;
exports.decode = decode;
exports.check = check;
exports.toSeed = toSeed;

}).call(this,_dereq_("buffer").Buffer)
},{"./pbkdf2":23,"buffer":5,"satoshi-hash":17}],25:[function(_dereq_,module,exports){
var Address = _dereq_('satoshi-address');
var Hash = _dereq_('satoshi-hash');
var Script = _dereq_('satoshi-script');

function MSKey(options) {
  if (!options) {
    throw new Error('Missing options');
  }
  if (!options.keys || options.keys.length === 0) {
    throw new Error('Missing keys');
  }
  if (options.keys.length >= 16) {
    throw new Error('Too many keys');
  }
  if (typeof options.m !== 'number') {
    throw new Error('Missing number of required signatures');
  }
  if (options.m < 0 || options.m > options.keys.length) {
    throw new Error('Invalid number of required signatures');
  }

  this.m = options.m;
  this.keys = options.keys;
  this.network = this.keys[0].network;
}

MSKey.prototype.getAddress = function () {
  var pubkeys = this.keys.map(function (key) { return key.pub; });
  var redeemScript = Script.createMultisigOutput(this.m, pubkeys);
  var hash = Hash.hash160(redeemScript.buffer);
  return new Address(hash, 'scripthash', this.network);
};

MSKey.prototype.derive = function (index) {
  var derived = this.keys.map(function (key) {
    return key.derive(index);
  });
  return new MSKey({ m: this.m, keys: derived });
};

MSKey.prototype.deriveHardened = function (index) {
  var derived = this.keys.map(function (key) {
    return key.deriveHardened(index);
  });
  return new MSKey({ m: this.m, keys: derived });
};

module.exports = MSKey;

},{"satoshi-address":10,"satoshi-hash":17,"satoshi-script":27}],26:[function(_dereq_,module,exports){
(function (Buffer){
var sjcl = _dereq_('satoshi-sjcl');
var toBytes = sjcl.codec.bytes.fromBits;

exports.randomBytes = function (size) {
  var words = sjcl.random.randomWords(Math.ceil(size / 4));
  return new Buffer(toBytes(words).slice(0, size));
};

}).call(this,_dereq_("buffer").Buffer)
},{"buffer":5,"satoshi-sjcl":30}],27:[function(_dereq_,module,exports){
(function (Buffer){
var opcodes = _dereq_('./opcode').map;
var hash160 = _dereq_('satoshi-hash').hash160;

function Script(buffer) {
  this.buffer = buffer || new Buffer(0);
  this.chunks = [];
  this.parse();
}

Script.prototype.parse = function () {
  var offset = 0;
  while (offset < this.buffer.length) {
    var opcode = this.buffer.readUInt8(offset);
    offset += 1;
    if (opcode <= opcodes.OP_PUSHDATA4) {
      var length = opcode;
      switch(opcode) {
        case opcodes.OP_PUSHDATA1:
          length = this.buffer.readUInt8(offset, true);
          offset += 1;
          break;
        case opcodes.OP_PUSHDATA2:
          length = this.buffer.readUInt16BE(offset, true);
          offset += 2;
          break;
        case opcodes.OP_PUSHDATA4:
          length = this.buffer.readUInt32BE(offset, true);
          offset += 4;
          break;
      }
      this.chunks.push(this.buffer.slice(offset, offset + length));
      offset += length;
    } else {
      this.chunks.push(opcode);
    }
  }
};

function isSmallInteger(opcode) {
  return opcode === opcodes.OP_0 || (opcode >= opcodes.OP_1 && opcode <= opcodes.OP_16);
}

function isSmallData(chunk) {
  return Buffer.isBuffer(chunk) && chunk.length <= 40;
}

function isHash160(chunk) {
  return Buffer.isBuffer(chunk) && chunk.length === 20;
}

function isPubkey(chunk) {
  return Buffer.isBuffer(chunk) && chunk.length >= 33 && chunk.length <= 65;
}

function isPubkeyHashScript(chunks) {
  return chunks.length === 5 &&
    chunks[0] === opcodes.OP_DUP &&
    chunks[1] === opcodes.OP_HASH160 &&
    isHash160(chunks[2]) &&
    chunks[3] === opcodes.OP_EQUALVERIFY &&
    chunks[4] === opcodes.OP_CHECKSIG;
}

function isPubkeyScript(chunks) {
  return chunks.length === 2 &&
    isPubkey(chunks[0]) &&
    chunks[1] === opcodes.OP_CHECKSIG;
}

function isScriptHashScript(chunks) {
  return chunks.length === 3 &&
    chunks[0] === opcodes.OP_HASH160 &&
    isHash160(chunks[1]) &&
    chunks[2] === opcodes.OP_EQUAL;
}

function isMultisigScript(chunks) {
  return chunks.length > 3 &&
    isSmallInteger(chunks[0]) &&
    chunks[chunks.length - 1] === opcodes.OP_CHECKMULTISIG &&
    chunks.slice(1, chunks.length - 2).every(isPubkey) &&
    isSmallInteger(chunks[chunks.length - 2]);
}

function isNullDataScript(chunks) {
  return chunks.length === 2 &&
    chunks[0] === opcodes.OP_RETURN &&
    isSmallData(chunks[1]);
}

Script.prototype.getOutputType = function () {
  switch (true) {
    case isPubkeyHashScript(this.chunks):
      return 'pubkeyhash';
    case isPubkeyScript(this.chunks):
      return 'pubkey';
    case isScriptHashScript(this.chunks):
      return 'scripthash';
    case isMultisigScript(this.chunks):
      return 'multisig';
    case isNullDataScript(this.chunks):
      return 'nulldata';
    default:
      return 'nonstandard';
  }
};

Script.prototype.capture = function () {
  switch (this.getOutputType()) {
    case 'pubkeyhash':
      return this.chunks[2];
    case 'pubkey':
      return hash160(this.chunks[0]);
    case 'scripthash':
      return this.chunks[1];
    case 'multisig':
      return this.chunks.slice(1, this.chunks.length - 2).map(hash160);
  }
};

Script.prototype.writeChunk = function (chunk) {
  this.chunks.push(chunk);
};

function prefixLength(length) {
  switch (true) {
    case length < opcodes.OP_PUSHDATA1:
      return 1;
    case length <= 0xff:
      return 2;
    case length <= 0xffff:
      return 3;
    default:
      return 5;
  }
}

function byteLength(chunks) {
  return chunks.reduce(function (length, chunk) {
    return Buffer.isBuffer(chunk)
      ? length + prefixLength(chunk.length) + chunk.length
      : length + 1;
  }, 0);
}

function writeData(buffer, offset, data) {
  switch (true) {
    case data.length < opcodes.OP_PUSHDATA1:
      buffer.writeUInt8(data.length, offset);
      offset += 1;
      break;
    case data.length <= 0xff:
      buffer.writeUInt8(opcodes.OP_PUSHDATA1, offset);
      buffer.writeUInt8(data.length, offset + 1);
      offset += 2;
      break;
    case data.length <= 0xffff:
      buffer.writeUInt8(opcodes.OP_PUSHDATA2, offset);
      buffer.writeUInt16BE(data.length, offset + 1);
      offset += 3;
      break;
    default:
      buffer.writeUInt8(opcodes.OP_PUSHDATA4, offset);
      buffer.writeUInt32BE(data.length, offset + 1);
      offset += 5;
      break;
  }
  data.copy(buffer, offset, 0, data.length);
  return offset + data.length;
}

function updateBuffer() {
  var buffer = this.buffer = new Buffer(byteLength(this.chunks));
  var offset = 0;
  this.chunks.forEach(function (chunk) {
    if (Buffer.isBuffer(chunk)) {
      offset = writeData(buffer, offset, chunk);
    } else {
      buffer.writeUInt8(chunk, offset);
      offset += 1;
    }
  });
}

Script.create = function (buffer, fn) {
  if (typeof fn !== 'function') {
    fn = buffer;
    buffer = null;
  }
  var script = new Script(buffer);
  fn.call(script, script);
  updateBuffer.call(script, script);
  return script;
};

// OP_DUP OP_HASH160 {pubkeyHash} OP_EQUALVERIFY OP_CHECKSIG
Script.createPubkeyHashOutput = function (hash) {
  return Script.create(function () {
    this.writeChunk(opcodes.OP_DUP);
    this.writeChunk(opcodes.OP_HASH160);
    this.writeChunk(hash);
    this.writeChunk(opcodes.OP_EQUALVERIFY);
    this.writeChunk(opcodes.OP_CHECKSIG);
  });
};

// {pubkey} OP_CHECKSIG
Script.createPubkeyOutput = function (pubkey) {
  return Script.create(function () {
    this.writeChunk(pubkey);
    this.writeChunk(opcodes.OP_CHECKSIG);
  });
};

// OP_HASH160 {scriptHash} OP_EQUAL
Script.createScriptHashOutput = function (hash) {
  return Script.create(function () {
    this.writeChunk(opcodes.OP_HASH160);
    this.writeChunk(hash);
    this.writeChunk(opcodes.OP_EQUAL);
  });
};

// m {pubkey}...{pubkey} n OP_CHECKMULTISIG
Script.createMultisigOutput = function (m, pubkeys) {
  var n = pubkeys.length;
  var NUM_OP = opcodes.OP_1 - 1;
  return Script.create(function () {
    this.writeChunk(NUM_OP + m);
    pubkeys.forEach(function (pubkey) {
      this.writeChunk(pubkey);
    }, this);
    this.writeChunk(NUM_OP + n);
    this.writeChunk(opcodes.OP_CHECKMULTISIG);
  });
};

// OP_RETURN {data}
Script.createNullDataOutput = function (data) {
  return Script.create(function () {
    this.writeChunk(opcodes.OP_RETURN);
    this.writeChunk(data);
  });
};

// {signature} {pubkey}
Script.createPubkeyHashInput = function(signature, pubkey) {
  return Script.create(function () {
    this.writeChunk(signature);
    this.writeChunk(pubkey);
  });
};

// <inputScript> {serialized outputScript}
Script.createScriptHashInput = function (inputScript, outputScript) {
  return Script.create(inputScript.buffer, function () {
    this.writeChunk(outputScript.buffer);
  });
};

// {signature}
Script.createPubkeyInput = function (signature) {
  return Script.create(function () {
    this.writeChunk(signature);
  });
};

// OP_0 ...signatures...
Script.createMultisigInput = function (signatures) {
  return Script.create(function () {
    this.writeChunk(opcodes.OP_0);
    signatures.forEach(function (signature) {
      this.writeChunk(signature);
    }, this);
  });
};

Script.opcodes = opcodes;

module.exports = Script;

}).call(this,_dereq_("buffer").Buffer)
},{"./opcode":28,"buffer":5,"satoshi-hash":17}],28:[function(_dereq_,module,exports){
exports.map = {
  // push value
  OP_FALSE : 0x00,
  OP_0 : 0x00,
  OP_PUSHDATA1 : 0x4c,
  OP_PUSHDATA2 : 0x4d,
  OP_PUSHDATA4 : 0x4e,
  OP_1NEGATE : 0x4f,
  OP_RESERVED : 0x50,
  OP_TRUE : 0x51,
  OP_1 : 0x51,
  OP_2 : 0x52,
  OP_3 : 0x53,
  OP_4 : 0x54,
  OP_5 : 0x55,
  OP_6 : 0x56,
  OP_7 : 0x57,
  OP_8 : 0x58,
  OP_9 : 0x59,
  OP_10 : 0x5a,
  OP_11 : 0x5b,
  OP_12 : 0x5c,
  OP_13 : 0x5d,
  OP_14 : 0x5e,
  OP_15 : 0x5f,
  OP_16 : 0x60,

  // control
  OP_NOP : 0x61,
  OP_VER : 0x62,
  OP_IF : 0x63,
  OP_NOTIF : 0x64,
  OP_VERIF : 0x65,
  OP_VERNOTIF : 0x66,
  OP_ELSE : 0x67,
  OP_ENDIF : 0x68,
  OP_VERIFY : 0x69,
  OP_RETURN : 0x6a,

  // stack ops
  OP_TOALTSTACK : 0x6b,
  OP_FROMALTSTACK : 0x6c,
  OP_2DROP : 0x6d,
  OP_2DUP : 0x6e,
  OP_3DUP : 0x6f,
  OP_2OVER : 0x70,
  OP_2ROT : 0x71,
  OP_2SWAP : 0x72,
  OP_IFDUP : 0x73,
  OP_DEPTH : 0x74,
  OP_DROP : 0x75,
  OP_DUP : 0x76,
  OP_NIP : 0x77,
  OP_OVER : 0x78,
  OP_PICK : 0x79,
  OP_ROLL : 0x7a,
  OP_ROT : 0x7b,
  OP_SWAP : 0x7c,
  OP_TUCK : 0x7d,

  // splice ops
  OP_CAT : 0x7e,
  OP_SUBSTR : 0x7f,
  OP_LEFT : 0x80,
  OP_RIGHT : 0x81,
  OP_SIZE : 0x82,

  // bit logic
  OP_INVERT : 0x83,
  OP_AND : 0x84,
  OP_OR : 0x85,
  OP_XOR : 0x86,
  OP_EQUAL : 0x87,
  OP_EQUALVERIFY : 0x88,
  OP_RESERVED1 : 0x89,
  OP_RESERVED2 : 0x8a,

  // numeric
  OP_1ADD : 0x8b,
  OP_1SUB : 0x8c,
  OP_2MUL : 0x8d,
  OP_2DIV : 0x8e,
  OP_NEGATE : 0x8f,
  OP_ABS : 0x90,
  OP_NOT : 0x91,
  OP_0NOTEQUAL : 0x92,

  OP_ADD : 0x93,
  OP_SUB : 0x94,
  OP_MUL : 0x95,
  OP_DIV : 0x96,
  OP_MOD : 0x97,
  OP_LSHIFT : 0x98,
  OP_RSHIFT : 0x99,

  OP_BOOLAND : 0x9a,
  OP_BOOLOR : 0x9b,
  OP_NUMEQUAL : 0x9c,
  OP_NUMEQUALVERIFY : 0x9d,
  OP_NUMNOTEQUAL : 0x9e,
  OP_LESSTHAN : 0x9f,
  OP_GREATERTHAN : 0xa0,
  OP_LESSTHANOREQUAL : 0xa1,
  OP_GREATERTHANOREQUAL : 0xa2,
  OP_MIN : 0xa3,
  OP_MAX : 0xa4,

  OP_WITHIN : 0xa5,

  // crypto
  OP_RIPEMD160 : 0xa6,
  OP_SHA1 : 0xa7,
  OP_SHA256 : 0xa8,
  OP_HASH160 : 0xa9,
  OP_HASH256 : 0xaa,
  OP_CODESEPARATOR : 0xab,
  OP_CHECKSIG : 0xac,
  OP_CHECKSIGVERIFY : 0xad,
  OP_CHECKMULTISIG : 0xae,
  OP_CHECKMULTISIGVERIFY : 0xaf,

  // expansion
  OP_NOP1 : 0xb0,
  OP_NOP2 : 0xb1,
  OP_NOP3 : 0xb2,
  OP_NOP4 : 0xb3,
  OP_NOP5 : 0xb4,
  OP_NOP6 : 0xb5,
  OP_NOP7 : 0xb6,
  OP_NOP8 : 0xb7,
  OP_NOP9 : 0xb8,
  OP_NOP10 : 0xb9,

  // template matching params
  OP_SMALLDATA : 0xf9,
  OP_SMALLINTEGER : 0xfa,
  OP_PUBKEYS : 0xfb,
  OP_PUBKEYHASH : 0xfd,
  OP_PUBKEY : 0xfe,

  OP_INVALIDOPCODE : 0xff
};

exports.reverseMap = [];

Object.keys(exports.map).forEach(function (key) {
  exports.reverseMap[exports.map[key]] = key.substr(3);
});

},{}],29:[function(_dereq_,module,exports){
// ignore require('crypto')

},{}],30:[function(_dereq_,module,exports){
"use strict";

var sjcl = {
    cipher: {},
    hash: {},
    keyexchange: {},
    mode: {},
    misc: {},
    codec: {},
    exception: {
        corrupt: function(message) {
            this.toString = function() {
                return "CORRUPT: " + this.message;
            };
            this.message = message;
        },
        invalid: function(message) {
            this.toString = function() {
                return "INVALID: " + this.message;
            };
            this.message = message;
        },
        bug: function(message) {
            this.toString = function() {
                return "BUG: " + this.message;
            };
            this.message = message;
        },
        notReady: function(message) {
            this.toString = function() {
                return "NOT READY: " + this.message;
            };
            this.message = message;
        }
    }
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = sjcl;
}

sjcl.cipher.aes = function(key) {
    if (!this._tables[0][0][0]) {
        this._precompute();
    }
    var i, j, tmp, encKey, decKey, sbox = this._tables[0][4], decTable = this._tables[1], keyLen = key.length, rcon = 1;
    if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
        throw new sjcl.exception.invalid("invalid aes key size");
    }
    this._key = [ encKey = key.slice(0), decKey = [] ];
    for (i = keyLen; i < 4 * keyLen + 28; i++) {
        tmp = encKey[i - 1];
        if (i % keyLen === 0 || keyLen === 8 && i % keyLen === 4) {
            tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255];
            if (i % keyLen === 0) {
                tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
                rcon = rcon << 1 ^ (rcon >> 7) * 283;
            }
        }
        encKey[i] = encKey[i - keyLen] ^ tmp;
    }
    for (j = 0; i; j++, i--) {
        tmp = encKey[j & 3 ? i : i - 4];
        if (i <= 4 || j < 4) {
            decKey[j] = tmp;
        } else {
            decKey[j] = decTable[0][sbox[tmp >>> 24]] ^ decTable[1][sbox[tmp >> 16 & 255]] ^ decTable[2][sbox[tmp >> 8 & 255]] ^ decTable[3][sbox[tmp & 255]];
        }
    }
};

sjcl.cipher.aes.prototype = {
    encrypt: function(data) {
        return this._crypt(data, 0);
    },
    decrypt: function(data) {
        return this._crypt(data, 1);
    },
    _tables: [ [ [], [], [], [], [] ], [ [], [], [], [], [] ] ],
    _precompute: function() {
        var encTable = this._tables[0], decTable = this._tables[1], sbox = encTable[4], sboxInv = decTable[4], i, x, xInv, d = [], th = [], x2, x4, x8, s, tEnc, tDec;
        for (i = 0; i < 256; i++) {
            th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i;
        }
        for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
            s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
            s = s >> 8 ^ s & 255 ^ 99;
            sbox[x] = s;
            sboxInv[s] = x;
            x8 = d[x4 = d[x2 = d[x]]];
            tDec = x8 * 16843009 ^ x4 * 65537 ^ x2 * 257 ^ x * 16843008;
            tEnc = d[s] * 257 ^ s * 16843008;
            for (i = 0; i < 4; i++) {
                encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
                decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8;
            }
        }
        for (i = 0; i < 5; i++) {
            encTable[i] = encTable[i].slice(0);
            decTable[i] = decTable[i].slice(0);
        }
    },
    _crypt: function(input, dir) {
        if (input.length !== 4) {
            throw new sjcl.exception.invalid("invalid aes block size");
        }
        var key = this._key[dir], a = input[0] ^ key[0], b = input[dir ? 3 : 1] ^ key[1], c = input[2] ^ key[2], d = input[dir ? 1 : 3] ^ key[3], a2, b2, c2, nInnerRounds = key.length / 4 - 2, i, kIndex = 4, out = [ 0, 0, 0, 0 ], table = this._tables[dir], t0 = table[0], t1 = table[1], t2 = table[2], t3 = table[3], sbox = table[4];
        for (i = 0; i < nInnerRounds; i++) {
            a2 = t0[a >>> 24] ^ t1[b >> 16 & 255] ^ t2[c >> 8 & 255] ^ t3[d & 255] ^ key[kIndex];
            b2 = t0[b >>> 24] ^ t1[c >> 16 & 255] ^ t2[d >> 8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
            c2 = t0[c >>> 24] ^ t1[d >> 16 & 255] ^ t2[a >> 8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
            d = t0[d >>> 24] ^ t1[a >> 16 & 255] ^ t2[b >> 8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
            kIndex += 4;
            a = a2;
            b = b2;
            c = c2;
        }
        for (i = 0; i < 4; i++) {
            out[dir ? 3 & -i : i] = sbox[a >>> 24] << 24 ^ sbox[b >> 16 & 255] << 16 ^ sbox[c >> 8 & 255] << 8 ^ sbox[d & 255] ^ key[kIndex++];
            a2 = a;
            a = b;
            b = c;
            c = d;
            d = a2;
        }
        return out;
    }
};

sjcl.bitArray = {
    bitSlice: function(a, bstart, bend) {
        a = sjcl.bitArray._shiftRight(a.slice(bstart / 32), 32 - (bstart & 31)).slice(1);
        return bend === undefined ? a : sjcl.bitArray.clamp(a, bend - bstart);
    },
    extract: function(a, bstart, blength) {
        var x, sh = Math.floor(-bstart - blength & 31);
        if ((bstart + blength - 1 ^ bstart) & -32) {
            x = a[bstart / 32 | 0] << 32 - sh ^ a[bstart / 32 + 1 | 0] >>> sh;
        } else {
            x = a[bstart / 32 | 0] >>> sh;
        }
        return x & (1 << blength) - 1;
    },
    concat: function(a1, a2) {
        if (a1.length === 0 || a2.length === 0) {
            return a1.concat(a2);
        }
        var last = a1[a1.length - 1], shift = sjcl.bitArray.getPartial(last);
        if (shift === 32) {
            return a1.concat(a2);
        } else {
            return sjcl.bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
        }
    },
    bitLength: function(a) {
        var l = a.length, x;
        if (l === 0) {
            return 0;
        }
        x = a[l - 1];
        return (l - 1) * 32 + sjcl.bitArray.getPartial(x);
    },
    clamp: function(a, len) {
        if (a.length * 32 < len) {
            return a;
        }
        a = a.slice(0, Math.ceil(len / 32));
        var l = a.length;
        len = len & 31;
        if (l > 0 && len) {
            a[l - 1] = sjcl.bitArray.partial(len, a[l - 1] & 2147483648 >> len - 1, 1);
        }
        return a;
    },
    partial: function(len, x, _end) {
        if (len === 32) {
            return x;
        }
        return (_end ? x | 0 : x << 32 - len) + len * 1099511627776;
    },
    getPartial: function(x) {
        return Math.round(x / 1099511627776) || 32;
    },
    equal: function(a, b) {
        if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) {
            return false;
        }
        var x = 0, i;
        for (i = 0; i < a.length; i++) {
            x |= a[i] ^ b[i];
        }
        return x === 0;
    },
    _shiftRight: function(a, shift, carry, out) {
        var i, last2 = 0, shift2;
        if (out === undefined) {
            out = [];
        }
        for (;shift >= 32; shift -= 32) {
            out.push(carry);
            carry = 0;
        }
        if (shift === 0) {
            return out.concat(a);
        }
        for (i = 0; i < a.length; i++) {
            out.push(carry | a[i] >>> shift);
            carry = a[i] << 32 - shift;
        }
        last2 = a.length ? a[a.length - 1] : 0;
        shift2 = sjcl.bitArray.getPartial(last2);
        out.push(sjcl.bitArray.partial(shift + shift2 & 31, shift + shift2 > 32 ? carry : out.pop(), 1));
        return out;
    },
    _xor4: function(x, y) {
        return [ x[0] ^ y[0], x[1] ^ y[1], x[2] ^ y[2], x[3] ^ y[3] ];
    }
};

sjcl.codec.utf8String = {
    fromBits: function(arr) {
        var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
        for (i = 0; i < bl / 8; i++) {
            if ((i & 3) === 0) {
                tmp = arr[i / 4];
            }
            out += String.fromCharCode(tmp >>> 24);
            tmp <<= 8;
        }
        return decodeURIComponent(escape(out));
    },
    toBits: function(str) {
        str = unescape(encodeURIComponent(str));
        var out = [], i, tmp = 0;
        for (i = 0; i < str.length; i++) {
            tmp = tmp << 8 | str.charCodeAt(i);
            if ((i & 3) === 3) {
                out.push(tmp);
                tmp = 0;
            }
        }
        if (i & 3) {
            out.push(sjcl.bitArray.partial(8 * (i & 3), tmp));
        }
        return out;
    }
};

sjcl.codec.hex = {
    fromBits: function(arr) {
        var out = "", i;
        for (i = 0; i < arr.length; i++) {
            out += ((arr[i] | 0) + 0xf00000000000).toString(16).substr(4);
        }
        return out.substr(0, sjcl.bitArray.bitLength(arr) / 4);
    },
    toBits: function(str) {
        var i, out = [], len;
        str = str.replace(/\s|0x/g, "");
        len = str.length;
        str = str + "00000000";
        for (i = 0; i < str.length; i += 8) {
            out.push(parseInt(str.substr(i, 8), 16) ^ 0);
        }
        return sjcl.bitArray.clamp(out, len * 4);
    }
};

sjcl.codec.base64 = {
    _chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    fromBits: function(arr, _noEquals, _url) {
        var out = "", i, bits = 0, c = sjcl.codec.base64._chars, ta = 0, bl = sjcl.bitArray.bitLength(arr);
        if (_url) {
            c = c.substr(0, 62) + "-_";
        }
        for (i = 0; out.length * 6 < bl; ) {
            out += c.charAt((ta ^ arr[i] >>> bits) >>> 26);
            if (bits < 6) {
                ta = arr[i] << 6 - bits;
                bits += 26;
                i++;
            } else {
                ta <<= 6;
                bits -= 6;
            }
        }
        while (out.length & 3 && !_noEquals) {
            out += "=";
        }
        return out;
    },
    toBits: function(str, _url) {
        str = str.replace(/\s|=/g, "");
        var out = [], i, bits = 0, c = sjcl.codec.base64._chars, ta = 0, x;
        if (_url) {
            c = c.substr(0, 62) + "-_";
        }
        for (i = 0; i < str.length; i++) {
            x = c.indexOf(str.charAt(i));
            if (x < 0) {
                throw new sjcl.exception.invalid("this isn't base64!");
            }
            if (bits > 26) {
                bits -= 26;
                out.push(ta ^ x >>> bits);
                ta = x << 32 - bits;
            } else {
                bits += 6;
                ta ^= x << 32 - bits;
            }
        }
        if (bits & 56) {
            out.push(sjcl.bitArray.partial(bits & 56, ta, 1));
        }
        return out;
    }
};

sjcl.codec.base64url = {
    fromBits: function(arr) {
        return sjcl.codec.base64.fromBits(arr, 1, 1);
    },
    toBits: function(str) {
        return sjcl.codec.base64.toBits(str, 1);
    }
};

sjcl.codec.bytes = {
    fromBits: function(arr) {
        var out = [], bl = sjcl.bitArray.bitLength(arr), i, tmp;
        for (i = 0; i < bl / 8; i++) {
            if ((i & 3) === 0) {
                tmp = arr[i / 4];
            }
            out.push(tmp >>> 24);
            tmp <<= 8;
        }
        return out;
    },
    toBits: function(bytes) {
        var out = [], i, tmp = 0;
        for (i = 0; i < bytes.length; i++) {
            tmp = tmp << 8 | bytes[i];
            if ((i & 3) === 3) {
                out.push(tmp);
                tmp = 0;
            }
        }
        if (i & 3) {
            out.push(sjcl.bitArray.partial(8 * (i & 3), tmp));
        }
        return out;
    }
};

sjcl.hash.sha256 = function(hash) {
    if (!this._key[0]) {
        this._precompute();
    }
    if (hash) {
        this._h = hash._h.slice(0);
        this._buffer = hash._buffer.slice(0);
        this._length = hash._length;
    } else {
        this.reset();
    }
};

sjcl.hash.sha256.hash = function(data) {
    return new sjcl.hash.sha256().update(data).finalize();
};

sjcl.hash.sha256.prototype = {
    blockSize: 512,
    reset: function() {
        this._h = this._init.slice(0);
        this._buffer = [];
        this._length = 0;
        return this;
    },
    update: function(data) {
        if (typeof data === "string") {
            data = sjcl.codec.utf8String.toBits(data);
        }
        var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
        for (i = 512 + ol & -512; i <= nl; i += 512) {
            this._block(b.splice(0, 16));
        }
        return this;
    },
    finalize: function() {
        var i, b = this._buffer, h = this._h;
        b = sjcl.bitArray.concat(b, [ sjcl.bitArray.partial(1, 1) ]);
        for (i = b.length + 2; i & 15; i++) {
            b.push(0);
        }
        b.push(Math.floor(this._length / 4294967296));
        b.push(this._length | 0);
        while (b.length) {
            this._block(b.splice(0, 16));
        }
        this.reset();
        return h;
    },
    _init: [],
    _key: [],
    _precompute: function() {
        var i = 0, prime = 2, factor;
        function frac(x) {
            return (x - Math.floor(x)) * 4294967296 | 0;
        }
        outer: for (;i < 64; prime++) {
            for (factor = 2; factor * factor <= prime; factor++) {
                if (prime % factor === 0) {
                    continue outer;
                }
            }
            if (i < 8) {
                this._init[i] = frac(Math.pow(prime, 1 / 2));
            }
            this._key[i] = frac(Math.pow(prime, 1 / 3));
            i++;
        }
    },
    _block: function(words) {
        var i, tmp, a, b, w = words.slice(0), h = this._h, k = this._key, h0 = h[0], h1 = h[1], h2 = h[2], h3 = h[3], h4 = h[4], h5 = h[5], h6 = h[6], h7 = h[7];
        for (i = 0; i < 64; i++) {
            if (i < 16) {
                tmp = w[i];
            } else {
                a = w[i + 1 & 15];
                b = w[i + 14 & 15];
                tmp = w[i & 15] = (a >>> 7 ^ a >>> 18 ^ a >>> 3 ^ a << 25 ^ a << 14) + (b >>> 17 ^ b >>> 19 ^ b >>> 10 ^ b << 15 ^ b << 13) + w[i & 15] + w[i + 9 & 15] | 0;
            }
            tmp = tmp + h7 + (h4 >>> 6 ^ h4 >>> 11 ^ h4 >>> 25 ^ h4 << 26 ^ h4 << 21 ^ h4 << 7) + (h6 ^ h4 & (h5 ^ h6)) + k[i];
            h7 = h6;
            h6 = h5;
            h5 = h4;
            h4 = h3 + tmp | 0;
            h3 = h2;
            h2 = h1;
            h1 = h0;
            h0 = tmp + (h1 & h2 ^ h3 & (h1 ^ h2)) + (h1 >>> 2 ^ h1 >>> 13 ^ h1 >>> 22 ^ h1 << 30 ^ h1 << 19 ^ h1 << 10) | 0;
        }
        h[0] = h[0] + h0 | 0;
        h[1] = h[1] + h1 | 0;
        h[2] = h[2] + h2 | 0;
        h[3] = h[3] + h3 | 0;
        h[4] = h[4] + h4 | 0;
        h[5] = h[5] + h5 | 0;
        h[6] = h[6] + h6 | 0;
        h[7] = h[7] + h7 | 0;
    }
};

sjcl.hash.sha512 = function(hash) {
    if (!this._key[0]) {
        this._precompute();
    }
    if (hash) {
        this._h = hash._h.slice(0);
        this._buffer = hash._buffer.slice(0);
        this._length = hash._length;
    } else {
        this.reset();
    }
};

sjcl.hash.sha512.hash = function(data) {
    return new sjcl.hash.sha512().update(data).finalize();
};

sjcl.hash.sha512.prototype = {
    blockSize: 1024,
    reset: function() {
        this._h = this._init.slice(0);
        this._buffer = [];
        this._length = 0;
        return this;
    },
    update: function(data) {
        if (typeof data === "string") {
            data = sjcl.codec.utf8String.toBits(data);
        }
        var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
        for (i = 1024 + ol & -1024; i <= nl; i += 1024) {
            this._block(b.splice(0, 32));
        }
        return this;
    },
    finalize: function() {
        var i, b = this._buffer, h = this._h;
        b = sjcl.bitArray.concat(b, [ sjcl.bitArray.partial(1, 1) ]);
        for (i = b.length + 4; i & 31; i++) {
            b.push(0);
        }
        b.push(0);
        b.push(0);
        b.push(Math.floor(this._length / 4294967296));
        b.push(this._length | 0);
        while (b.length) {
            this._block(b.splice(0, 32));
        }
        this.reset();
        return h;
    },
    _init: [],
    _initr: [ 12372232, 13281083, 9762859, 1914609, 15106769, 4090911, 4308331, 8266105 ],
    _key: [],
    _keyr: [ 2666018, 15689165, 5061423, 9034684, 4764984, 380953, 1658779, 7176472, 197186, 7368638, 14987916, 16757986, 8096111, 1480369, 13046325, 6891156, 15813330, 5187043, 9229749, 11312229, 2818677, 10937475, 4324308, 1135541, 6741931, 11809296, 16458047, 15666916, 11046850, 698149, 229999, 945776, 13774844, 2541862, 12856045, 9810911, 11494366, 7844520, 15576806, 8533307, 15795044, 4337665, 16291729, 5553712, 15684120, 6662416, 7413802, 12308920, 13816008, 4303699, 9366425, 10176680, 13195875, 4295371, 6546291, 11712675, 15708924, 1519456, 15772530, 6568428, 6495784, 8568297, 13007125, 7492395, 2515356, 12632583, 14740254, 7262584, 1535930, 13146278, 16321966, 1853211, 294276, 13051027, 13221564, 1051980, 4080310, 6651434, 14088940, 4675607 ],
    _precompute: function() {
        var i = 0, prime = 2, factor;
        function frac(x) {
            return (x - Math.floor(x)) * 4294967296 | 0;
        }
        function frac2(x) {
            return (x - Math.floor(x)) * 1099511627776 & 255;
        }
        outer: for (;i < 80; prime++) {
            for (factor = 2; factor * factor <= prime; factor++) {
                if (prime % factor === 0) {
                    continue outer;
                }
            }
            if (i < 8) {
                this._init[i * 2] = frac(Math.pow(prime, 1 / 2));
                this._init[i * 2 + 1] = frac2(Math.pow(prime, 1 / 2)) << 24 | this._initr[i];
            }
            this._key[i * 2] = frac(Math.pow(prime, 1 / 3));
            this._key[i * 2 + 1] = frac2(Math.pow(prime, 1 / 3)) << 24 | this._keyr[i];
            i++;
        }
    },
    _block: function(words) {
        var i, wrh, wrl, w = words.slice(0), h = this._h, k = this._key, h0h = h[0], h0l = h[1], h1h = h[2], h1l = h[3], h2h = h[4], h2l = h[5], h3h = h[6], h3l = h[7], h4h = h[8], h4l = h[9], h5h = h[10], h5l = h[11], h6h = h[12], h6l = h[13], h7h = h[14], h7l = h[15];
        var ah = h0h, al = h0l, bh = h1h, bl = h1l, ch = h2h, cl = h2l, dh = h3h, dl = h3l, eh = h4h, el = h4l, fh = h5h, fl = h5l, gh = h6h, gl = h6l, hh = h7h, hl = h7l;
        for (i = 0; i < 80; i++) {
            if (i < 16) {
                wrh = w[i * 2];
                wrl = w[i * 2 + 1];
            } else {
                var gamma0xh = w[(i - 15) * 2];
                var gamma0xl = w[(i - 15) * 2 + 1];
                var gamma0h = (gamma0xl << 31 | gamma0xh >>> 1) ^ (gamma0xl << 24 | gamma0xh >>> 8) ^ gamma0xh >>> 7;
                var gamma0l = (gamma0xh << 31 | gamma0xl >>> 1) ^ (gamma0xh << 24 | gamma0xl >>> 8) ^ (gamma0xh << 25 | gamma0xl >>> 7);
                var gamma1xh = w[(i - 2) * 2];
                var gamma1xl = w[(i - 2) * 2 + 1];
                var gamma1h = (gamma1xl << 13 | gamma1xh >>> 19) ^ (gamma1xh << 3 | gamma1xl >>> 29) ^ gamma1xh >>> 6;
                var gamma1l = (gamma1xh << 13 | gamma1xl >>> 19) ^ (gamma1xl << 3 | gamma1xh >>> 29) ^ (gamma1xh << 26 | gamma1xl >>> 6);
                var wr7h = w[(i - 7) * 2];
                var wr7l = w[(i - 7) * 2 + 1];
                var wr16h = w[(i - 16) * 2];
                var wr16l = w[(i - 16) * 2 + 1];
                wrl = gamma0l + wr7l;
                wrh = gamma0h + wr7h + (wrl >>> 0 < gamma0l >>> 0 ? 1 : 0);
                wrl += gamma1l;
                wrh += gamma1h + (wrl >>> 0 < gamma1l >>> 0 ? 1 : 0);
                wrl += wr16l;
                wrh += wr16h + (wrl >>> 0 < wr16l >>> 0 ? 1 : 0);
            }
            w[i * 2] = wrh |= 0;
            w[i * 2 + 1] = wrl |= 0;
            var chh = eh & fh ^ ~eh & gh;
            var chl = el & fl ^ ~el & gl;
            var majh = ah & bh ^ ah & ch ^ bh & ch;
            var majl = al & bl ^ al & cl ^ bl & cl;
            var sigma0h = (al << 4 | ah >>> 28) ^ (ah << 30 | al >>> 2) ^ (ah << 25 | al >>> 7);
            var sigma0l = (ah << 4 | al >>> 28) ^ (al << 30 | ah >>> 2) ^ (al << 25 | ah >>> 7);
            var sigma1h = (el << 18 | eh >>> 14) ^ (el << 14 | eh >>> 18) ^ (eh << 23 | el >>> 9);
            var sigma1l = (eh << 18 | el >>> 14) ^ (eh << 14 | el >>> 18) ^ (el << 23 | eh >>> 9);
            var krh = k[i * 2];
            var krl = k[i * 2 + 1];
            var t1l = hl + sigma1l;
            var t1h = hh + sigma1h + (t1l >>> 0 < hl >>> 0 ? 1 : 0);
            t1l += chl;
            t1h += chh + (t1l >>> 0 < chl >>> 0 ? 1 : 0);
            t1l += krl;
            t1h += krh + (t1l >>> 0 < krl >>> 0 ? 1 : 0);
            t1l += wrl;
            t1h += wrh + (t1l >>> 0 < wrl >>> 0 ? 1 : 0);
            var t2l = sigma0l + majl;
            var t2h = sigma0h + majh + (t2l >>> 0 < sigma0l >>> 0 ? 1 : 0);
            hh = gh;
            hl = gl;
            gh = fh;
            gl = fl;
            fh = eh;
            fl = el;
            el = dl + t1l | 0;
            eh = dh + t1h + (el >>> 0 < dl >>> 0 ? 1 : 0) | 0;
            dh = ch;
            dl = cl;
            ch = bh;
            cl = bl;
            bh = ah;
            bl = al;
            al = t1l + t2l | 0;
            ah = t1h + t2h + (al >>> 0 < t1l >>> 0 ? 1 : 0) | 0;
        }
        h0l = h[1] = h0l + al | 0;
        h[0] = h0h + ah + (h0l >>> 0 < al >>> 0 ? 1 : 0) | 0;
        h1l = h[3] = h1l + bl | 0;
        h[2] = h1h + bh + (h1l >>> 0 < bl >>> 0 ? 1 : 0) | 0;
        h2l = h[5] = h2l + cl | 0;
        h[4] = h2h + ch + (h2l >>> 0 < cl >>> 0 ? 1 : 0) | 0;
        h3l = h[7] = h3l + dl | 0;
        h[6] = h3h + dh + (h3l >>> 0 < dl >>> 0 ? 1 : 0) | 0;
        h4l = h[9] = h4l + el | 0;
        h[8] = h4h + eh + (h4l >>> 0 < el >>> 0 ? 1 : 0) | 0;
        h5l = h[11] = h5l + fl | 0;
        h[10] = h5h + fh + (h5l >>> 0 < fl >>> 0 ? 1 : 0) | 0;
        h6l = h[13] = h6l + gl | 0;
        h[12] = h6h + gh + (h6l >>> 0 < gl >>> 0 ? 1 : 0) | 0;
        h7l = h[15] = h7l + hl | 0;
        h[14] = h7h + hh + (h7l >>> 0 < hl >>> 0 ? 1 : 0) | 0;
    }
};

sjcl.mode.ccm = {
    name: "ccm",
    encrypt: function(prf, plaintext, iv, adata, tlen) {
        var L, out = plaintext.slice(0), tag, w = sjcl.bitArray, ivl = w.bitLength(iv) / 8, ol = w.bitLength(out) / 8;
        tlen = tlen || 64;
        adata = adata || [];
        if (ivl < 7) {
            throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
        }
        for (L = 2; L < 4 && ol >>> 8 * L; L++) {}
        if (L < 15 - ivl) {
            L = 15 - ivl;
        }
        iv = w.clamp(iv, 8 * (15 - L));
        tag = sjcl.mode.ccm._computeTag(prf, plaintext, iv, adata, tlen, L);
        out = sjcl.mode.ccm._ctrMode(prf, out, iv, tag, tlen, L);
        return w.concat(out.data, out.tag);
    },
    decrypt: function(prf, ciphertext, iv, adata, tlen) {
        tlen = tlen || 64;
        adata = adata || [];
        var L, w = sjcl.bitArray, ivl = w.bitLength(iv) / 8, ol = w.bitLength(ciphertext), out = w.clamp(ciphertext, ol - tlen), tag = w.bitSlice(ciphertext, ol - tlen), tag2;
        ol = (ol - tlen) / 8;
        if (ivl < 7) {
            throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
        }
        for (L = 2; L < 4 && ol >>> 8 * L; L++) {}
        if (L < 15 - ivl) {
            L = 15 - ivl;
        }
        iv = w.clamp(iv, 8 * (15 - L));
        out = sjcl.mode.ccm._ctrMode(prf, out, iv, tag, tlen, L);
        tag2 = sjcl.mode.ccm._computeTag(prf, out.data, iv, adata, tlen, L);
        if (!w.equal(out.tag, tag2)) {
            throw new sjcl.exception.corrupt("ccm: tag doesn't match");
        }
        return out.data;
    },
    _computeTag: function(prf, plaintext, iv, adata, tlen, L) {
        var mac, tmp, i, macData = [], w = sjcl.bitArray, xor = w._xor4;
        tlen /= 8;
        if (tlen % 2 || tlen < 4 || tlen > 16) {
            throw new sjcl.exception.invalid("ccm: invalid tag length");
        }
        if (adata.length > 4294967295 || plaintext.length > 4294967295) {
            throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data");
        }
        mac = [ w.partial(8, (adata.length ? 1 << 6 : 0) | tlen - 2 << 2 | L - 1) ];
        mac = w.concat(mac, iv);
        mac[3] |= w.bitLength(plaintext) / 8;
        mac = prf.encrypt(mac);
        if (adata.length) {
            tmp = w.bitLength(adata) / 8;
            if (tmp <= 65279) {
                macData = [ w.partial(16, tmp) ];
            } else if (tmp <= 4294967295) {
                macData = w.concat([ w.partial(16, 65534) ], [ tmp ]);
            }
            macData = w.concat(macData, adata);
            for (i = 0; i < macData.length; i += 4) {
                mac = prf.encrypt(xor(mac, macData.slice(i, i + 4).concat([ 0, 0, 0 ])));
            }
        }
        for (i = 0; i < plaintext.length; i += 4) {
            mac = prf.encrypt(xor(mac, plaintext.slice(i, i + 4).concat([ 0, 0, 0 ])));
        }
        return w.clamp(mac, tlen * 8);
    },
    _ctrMode: function(prf, data, iv, tag, tlen, L) {
        var enc, i, w = sjcl.bitArray, xor = w._xor4, ctr, l = data.length, bl = w.bitLength(data);
        ctr = w.concat([ w.partial(8, L - 1) ], iv).concat([ 0, 0, 0 ]).slice(0, 4);
        tag = w.bitSlice(xor(tag, prf.encrypt(ctr)), 0, tlen);
        if (!l) {
            return {
                tag: tag,
                data: []
            };
        }
        for (i = 0; i < l; i += 4) {
            ctr[3]++;
            enc = prf.encrypt(ctr);
            data[i] ^= enc[0];
            data[i + 1] ^= enc[1];
            data[i + 2] ^= enc[2];
            data[i + 3] ^= enc[3];
        }
        return {
            tag: tag,
            data: w.clamp(data, bl)
        };
    }
};

sjcl.misc.hmac = function(key, Hash) {
    this._hash = Hash = Hash || sjcl.hash.sha256;
    var exKey = [ [], [] ], i, bs = Hash.prototype.blockSize / 32;
    this._baseHash = [ new Hash(), new Hash() ];
    if (key.length > bs) {
        key = Hash.hash(key);
    }
    for (i = 0; i < bs; i++) {
        exKey[0][i] = key[i] ^ 909522486;
        exKey[1][i] = key[i] ^ 1549556828;
    }
    this._baseHash[0].update(exKey[0]);
    this._baseHash[1].update(exKey[1]);
    this._resultHash = new Hash(this._baseHash[0]);
};

sjcl.misc.hmac.prototype.encrypt = sjcl.misc.hmac.prototype.mac = function(data) {
    if (!this._updated) {
        this.update(data);
        return this.digest(data);
    } else {
        throw new sjcl.exception.invalid("encrypt on already updated hmac called!");
    }
};

sjcl.misc.hmac.prototype.reset = function() {
    this._resultHash = new this._hash(this._baseHash[0]);
    this._updated = false;
};

sjcl.misc.hmac.prototype.update = function(data) {
    this._updated = true;
    this._resultHash.update(data);
};

sjcl.misc.hmac.prototype.digest = function() {
    var w = this._resultHash.finalize(), result = new this._hash(this._baseHash[1]).update(w).finalize();
    this.reset();
    return result;
};

sjcl.misc.pbkdf2 = function(password, salt, count, length, Prff) {
    count = count || 1e3;
    if (length < 0 || count < 0) {
        throw sjcl.exception.invalid("invalid params to pbkdf2");
    }
    if (typeof password === "string") {
        password = sjcl.codec.utf8String.toBits(password);
    }
    if (typeof salt === "string") {
        salt = sjcl.codec.utf8String.toBits(salt);
    }
    Prff = Prff || sjcl.misc.hmac;
    var prf = new Prff(password), u, ui, i, j, k, out = [], b = sjcl.bitArray;
    for (k = 1; 32 * out.length < (length || 1); k++) {
        u = ui = prf.encrypt(b.concat(salt, [ k ]));
        for (i = 1; i < count; i++) {
            ui = prf.encrypt(ui);
            for (j = 0; j < ui.length; j++) {
                u[j] ^= ui[j];
            }
        }
        out = out.concat(u);
    }
    if (length) {
        out = b.clamp(out, length);
    }
    return out;
};

sjcl.prng = function(defaultParanoia) {
    this._pools = [ new sjcl.hash.sha256() ];
    this._poolEntropy = [ 0 ];
    this._reseedCount = 0;
    this._robins = {};
    this._eventId = 0;
    this._collectorIds = {};
    this._collectorIdNext = 0;
    this._strength = 0;
    this._poolStrength = 0;
    this._nextReseed = 0;
    this._key = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
    this._counter = [ 0, 0, 0, 0 ];
    this._cipher = undefined;
    this._defaultParanoia = defaultParanoia;
    this._collectorsStarted = false;
    this._callbacks = {
        progress: {},
        seeded: {}
    };
    this._callbackI = 0;
    this._NOT_READY = 0;
    this._READY = 1;
    this._REQUIRES_RESEED = 2;
    this._MAX_WORDS_PER_BURST = 65536;
    this._PARANOIA_LEVELS = [ 0, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024 ];
    this._MILLISECONDS_PER_RESEED = 3e4;
    this._BITS_PER_RESEED = 80;
};

sjcl.prng.prototype = {
    randomWords: function(nwords, paranoia) {
        var out = [], i, readiness = this.isReady(paranoia), g;
        if (readiness === this._NOT_READY) {
            throw new sjcl.exception.notReady("generator isn't seeded");
        } else if (readiness & this._REQUIRES_RESEED) {
            this._reseedFromPools(!(readiness & this._READY));
        }
        for (i = 0; i < nwords; i += 4) {
            if ((i + 1) % this._MAX_WORDS_PER_BURST === 0) {
                this._gate();
            }
            g = this._gen4words();
            out.push(g[0], g[1], g[2], g[3]);
        }
        this._gate();
        return out.slice(0, nwords);
    },
    setDefaultParanoia: function(paranoia, allowZeroParanoia) {
        if (paranoia === 0 && allowZeroParanoia !== "Setting paranoia=0 will ruin your security; use it only for testing") {
            throw "Setting paranoia=0 will ruin your security; use it only for testing";
        }
        this._defaultParanoia = paranoia;
    },
    addEntropy: function(data, estimatedEntropy, source) {
        source = source || "user";
        var id, i, tmp, t = new Date().valueOf(), robin = this._robins[source], oldReady = this.isReady(), err = 0, objName;
        id = this._collectorIds[source];
        if (id === undefined) {
            id = this._collectorIds[source] = this._collectorIdNext++;
        }
        if (robin === undefined) {
            robin = this._robins[source] = 0;
        }
        this._robins[source] = (this._robins[source] + 1) % this._pools.length;
        switch (typeof data) {
          case "number":
            if (estimatedEntropy === undefined) {
                estimatedEntropy = 1;
            }
            this._pools[robin].update([ id, this._eventId++, 1, estimatedEntropy, t, 1, data | 0 ]);
            break;

          case "object":
            objName = Object.prototype.toString.call(data);
            if (objName === "[object Uint32Array]") {
                tmp = [];
                for (i = 0; i < data.length; i++) {
                    tmp.push(data[i]);
                }
                data = tmp;
            } else {
                if (objName !== "[object Array]") {
                    err = 1;
                }
                for (i = 0; i < data.length && !err; i++) {
                    if (typeof data[i] !== "number") {
                        err = 1;
                    }
                }
            }
            if (!err) {
                if (estimatedEntropy === undefined) {
                    estimatedEntropy = 0;
                    for (i = 0; i < data.length; i++) {
                        tmp = data[i];
                        while (tmp > 0) {
                            estimatedEntropy++;
                            tmp = tmp >>> 1;
                        }
                    }
                }
                this._pools[robin].update([ id, this._eventId++, 2, estimatedEntropy, t, data.length ].concat(data));
            }
            break;

          case "string":
            if (estimatedEntropy === undefined) {
                estimatedEntropy = data.length;
            }
            this._pools[robin].update([ id, this._eventId++, 3, estimatedEntropy, t, data.length ]);
            this._pools[robin].update(data);
            break;

          default:
            err = 1;
        }
        if (err) {
            throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
        }
        this._poolEntropy[robin] += estimatedEntropy;
        this._poolStrength += estimatedEntropy;
        if (oldReady === this._NOT_READY) {
            if (this.isReady() !== this._NOT_READY) {
                this._fireEvent("seeded", Math.max(this._strength, this._poolStrength));
            }
            this._fireEvent("progress", this.getProgress());
        }
    },
    isReady: function(paranoia) {
        var entropyRequired = this._PARANOIA_LEVELS[paranoia !== undefined ? paranoia : this._defaultParanoia];
        if (this._strength && this._strength >= entropyRequired) {
            return this._poolEntropy[0] > this._BITS_PER_RESEED && new Date().valueOf() > this._nextReseed ? this._REQUIRES_RESEED | this._READY : this._READY;
        } else {
            return this._poolStrength >= entropyRequired ? this._REQUIRES_RESEED | this._NOT_READY : this._NOT_READY;
        }
    },
    getProgress: function(paranoia) {
        var entropyRequired = this._PARANOIA_LEVELS[paranoia ? paranoia : this._defaultParanoia];
        if (this._strength >= entropyRequired) {
            return 1;
        } else {
            return this._poolStrength > entropyRequired ? 1 : this._poolStrength / entropyRequired;
        }
    },
    startCollectors: function() {
        if (this._collectorsStarted) {
            return;
        }
        this._eventListener = {
            loadTimeCollector: this._bind(this._loadTimeCollector),
            mouseCollector: this._bind(this._mouseCollector),
            keyboardCollector: this._bind(this._keyboardCollector),
            accelerometerCollector: this._bind(this._accelerometerCollector)
        };
        if (window.addEventListener) {
            window.addEventListener("load", this._eventListener.loadTimeCollector, false);
            window.addEventListener("mousemove", this._eventListener.mouseCollector, false);
            window.addEventListener("keypress", this._eventListener.keyboardCollector, false);
            window.addEventListener("devicemotion", this._eventListener.accelerometerCollector, false);
        } else if (document.attachEvent) {
            document.attachEvent("onload", this._eventListener.loadTimeCollector);
            document.attachEvent("onmousemove", this._eventListener.mouseCollector);
            document.attachEvent("keypress", this._eventListener.keyboardCollector);
        } else {
            throw new sjcl.exception.bug("can't attach event");
        }
        this._collectorsStarted = true;
    },
    stopCollectors: function() {
        if (!this._collectorsStarted) {
            return;
        }
        if (window.removeEventListener) {
            window.removeEventListener("load", this._eventListener.loadTimeCollector, false);
            window.removeEventListener("mousemove", this._eventListener.mouseCollector, false);
            window.removeEventListener("keypress", this._eventListener.keyboardCollector, false);
            window.removeEventListener("devicemotion", this._eventListener.accelerometerCollector, false);
        } else if (document.detachEvent) {
            document.detachEvent("onload", this._eventListener.loadTimeCollector);
            document.detachEvent("onmousemove", this._eventListener.mouseCollector);
            document.detachEvent("keypress", this._eventListener.keyboardCollector);
        }
        this._collectorsStarted = false;
    },
    addEventListener: function(name, callback) {
        this._callbacks[name][this._callbackI++] = callback;
    },
    removeEventListener: function(name, cb) {
        var i, j, cbs = this._callbacks[name], jsTemp = [];
        for (j in cbs) {
            if (cbs.hasOwnProperty(j) && cbs[j] === cb) {
                jsTemp.push(j);
            }
        }
        for (i = 0; i < jsTemp.length; i++) {
            j = jsTemp[i];
            delete cbs[j];
        }
    },
    _bind: function(func) {
        var that = this;
        return function() {
            func.apply(that, arguments);
        };
    },
    _gen4words: function() {
        for (var i = 0; i < 4; i++) {
            this._counter[i] = this._counter[i] + 1 | 0;
            if (this._counter[i]) {
                break;
            }
        }
        return this._cipher.encrypt(this._counter);
    },
    _gate: function() {
        this._key = this._gen4words().concat(this._gen4words());
        this._cipher = new sjcl.cipher.aes(this._key);
    },
    _reseed: function(seedWords) {
        this._key = sjcl.hash.sha256.hash(this._key.concat(seedWords));
        this._cipher = new sjcl.cipher.aes(this._key);
        for (var i = 0; i < 4; i++) {
            this._counter[i] = this._counter[i] + 1 | 0;
            if (this._counter[i]) {
                break;
            }
        }
    },
    _reseedFromPools: function(full) {
        var reseedData = [], strength = 0, i;
        this._nextReseed = reseedData[0] = new Date().valueOf() + this._MILLISECONDS_PER_RESEED;
        for (i = 0; i < 16; i++) {
            reseedData.push(Math.random() * 4294967296 | 0);
        }
        for (i = 0; i < this._pools.length; i++) {
            reseedData = reseedData.concat(this._pools[i].finalize());
            strength += this._poolEntropy[i];
            this._poolEntropy[i] = 0;
            if (!full && this._reseedCount & 1 << i) {
                break;
            }
        }
        if (this._reseedCount >= 1 << this._pools.length) {
            this._pools.push(new sjcl.hash.sha256());
            this._poolEntropy.push(0);
        }
        this._poolStrength -= strength;
        if (strength > this._strength) {
            this._strength = strength;
        }
        this._reseedCount++;
        this._reseed(reseedData);
    },
    _keyboardCollector: function() {
        this._addCurrentTimeToEntropy(1);
    },
    _mouseCollector: function(ev) {
        var x = ev.x || ev.clientX || ev.offsetX || 0, y = ev.y || ev.clientY || ev.offsetY || 0;
        sjcl.random.addEntropy([ x, y ], 2, "mouse");
        this._addCurrentTimeToEntropy(0);
    },
    _loadTimeCollector: function() {
        this._addCurrentTimeToEntropy(2);
    },
    _addCurrentTimeToEntropy: function(estimatedEntropy) {
        if (window && window.performance && typeof window.performance.now === "function") {
            sjcl.random.addEntropy(window.performance.now(), estimatedEntropy, "loadtime");
        } else {
            sjcl.random.addEntropy(new Date().valueOf(), estimatedEntropy, "loadtime");
        }
    },
    _accelerometerCollector: function(ev) {
        var ac = ev.accelerationIncludingGravity.x || ev.accelerationIncludingGravity.y || ev.accelerationIncludingGravity.z;
        if (window.orientation) {
            var or = window.orientation;
            if (typeof or === "number") {
                sjcl.random.addEntropy(or, 1, "accelerometer");
            }
        }
        if (ac) {
            sjcl.random.addEntropy(ac, 2, "accelerometer");
        }
        this._addCurrentTimeToEntropy(0);
    },
    _fireEvent: function(name, arg) {
        var j, cbs = sjcl.random._callbacks[name], cbsTemp = [];
        for (j in cbs) {
            if (cbs.hasOwnProperty(j)) {
                cbsTemp.push(cbs[j]);
            }
        }
        for (j = 0; j < cbsTemp.length; j++) {
            cbsTemp[j](arg);
        }
    }
};

sjcl.random = new sjcl.prng(6);

(function() {
    function getCryptoModule() {
        try {
            return _dereq_("crypto");
        } catch (e) {
            return null;
        }
    }
    try {
        var buf, crypt, ab;
        if (typeof module !== "undefined" && module.exports && (crypt = getCryptoModule()) && crypt.randomBytes) {
            buf = crypt.randomBytes(1024 / 8);
            buf = new Uint32Array(new Uint8Array(buf).buffer);
            sjcl.random.addEntropy(buf, 1024, "crypto.randomBytes");
        } else if (window && Uint32Array) {
            ab = new Uint32Array(32);
            if (window.crypto && window.crypto.getRandomValues) {
                window.crypto.getRandomValues(ab);
            } else if (window.msCrypto && window.msCrypto.getRandomValues) {
                window.msCrypto.getRandomValues(ab);
            } else {
                return;
            }
            sjcl.random.addEntropy(ab, 1024, "crypto.getRandomValues");
        } else {}
    } catch (e) {
        if (typeof window !== "undefined" && window.console) {
            console.log("There was an error collecting entropy from the browser:");
            console.log(e);
        }
    }
})();

sjcl.json = {
    defaults: {
        v: 1,
        iter: 1e3,
        ks: 128,
        ts: 64,
        mode: "ccm",
        adata: "",
        cipher: "aes"
    },
    _encrypt: function(password, plaintext, params, rp) {
        params = params || {};
        rp = rp || {};
        var j = sjcl.json, p = j._add({
            iv: sjcl.random.randomWords(4, 0)
        }, j.defaults), tmp, prp, adata;
        j._add(p, params);
        adata = p.adata;
        if (typeof p.salt === "string") {
            p.salt = sjcl.codec.base64.toBits(p.salt);
        }
        if (typeof p.iv === "string") {
            p.iv = sjcl.codec.base64.toBits(p.iv);
        }
        if (!sjcl.mode[p.mode] || !sjcl.cipher[p.cipher] || typeof password === "string" && p.iter <= 100 || p.ts !== 64 && p.ts !== 96 && p.ts !== 128 || p.ks !== 128 && p.ks !== 192 && p.ks !== 256 || (p.iv.length < 2 || p.iv.length > 4)) {
            throw new sjcl.exception.invalid("json encrypt: invalid parameters");
        }
        if (typeof password === "string") {
            tmp = sjcl.misc.cachedPbkdf2(password, p);
            password = tmp.key.slice(0, p.ks / 32);
            p.salt = tmp.salt;
        } else if (sjcl.ecc && password instanceof sjcl.ecc.elGamal.publicKey) {
            tmp = password.kem();
            p.kemtag = tmp.tag;
            password = tmp.key.slice(0, p.ks / 32);
        }
        if (typeof plaintext === "string") {
            plaintext = sjcl.codec.utf8String.toBits(plaintext);
        }
        if (typeof adata === "string") {
            adata = sjcl.codec.utf8String.toBits(adata);
        }
        prp = new sjcl.cipher[p.cipher](password);
        j._add(rp, p);
        rp.key = password;
        p.ct = sjcl.mode[p.mode].encrypt(prp, plaintext, p.iv, adata, p.ts);
        return p;
    },
    encrypt: function(password, plaintext, params, rp) {
        var j = sjcl.json, p = j._encrypt.apply(j, arguments);
        return j.encode(p);
    },
    _decrypt: function(password, ciphertext, params, rp) {
        params = params || {};
        rp = rp || {};
        var j = sjcl.json, p = j._add(j._add(j._add({}, j.defaults), ciphertext), params, true), ct, tmp, prp, adata = p.adata;
        if (typeof p.salt === "string") {
            p.salt = sjcl.codec.base64.toBits(p.salt);
        }
        if (typeof p.iv === "string") {
            p.iv = sjcl.codec.base64.toBits(p.iv);
        }
        if (!sjcl.mode[p.mode] || !sjcl.cipher[p.cipher] || typeof password === "string" && p.iter <= 100 || p.ts !== 64 && p.ts !== 96 && p.ts !== 128 || p.ks !== 128 && p.ks !== 192 && p.ks !== 256 || !p.iv || (p.iv.length < 2 || p.iv.length > 4)) {
            throw new sjcl.exception.invalid("json decrypt: invalid parameters");
        }
        if (typeof password === "string") {
            tmp = sjcl.misc.cachedPbkdf2(password, p);
            password = tmp.key.slice(0, p.ks / 32);
            p.salt = tmp.salt;
        } else if (sjcl.ecc && password instanceof sjcl.ecc.elGamal.secretKey) {
            password = password.unkem(sjcl.codec.base64.toBits(p.kemtag)).slice(0, p.ks / 32);
        }
        if (typeof adata === "string") {
            adata = sjcl.codec.utf8String.toBits(adata);
        }
        prp = new sjcl.cipher[p.cipher](password);
        ct = sjcl.mode[p.mode].decrypt(prp, p.ct, p.iv, adata, p.ts);
        j._add(rp, p);
        rp.key = password;
        return sjcl.codec.utf8String.fromBits(ct);
    },
    decrypt: function(password, ciphertext, params, rp) {
        var j = sjcl.json;
        return j._decrypt(password, j.decode(ciphertext), params, rp);
    },
    encode: function(obj) {
        var i, out = "{", comma = "";
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (!i.match(/^[a-z0-9]+$/i)) {
                    throw new sjcl.exception.invalid("json encode: invalid property name");
                }
                out += comma + '"' + i + '":';
                comma = ",";
                switch (typeof obj[i]) {
                  case "number":
                  case "boolean":
                    out += obj[i];
                    break;

                  case "string":
                    out += '"' + escape(obj[i]) + '"';
                    break;

                  case "object":
                    out += '"' + sjcl.codec.base64.fromBits(obj[i], 0) + '"';
                    break;

                  default:
                    throw new sjcl.exception.bug("json encode: unsupported type");
                }
            }
        }
        return out + "}";
    },
    decode: function(str) {
        str = str.replace(/\s/g, "");
        if (!str.match(/^\{.*\}$/)) {
            throw new sjcl.exception.invalid("json decode: this isn't json!");
        }
        var a = str.replace(/^\{|\}$/g, "").split(/,/), out = {}, i, m;
        for (i = 0; i < a.length; i++) {
            if (!(m = a[i].match(/^(?:(["']?)([a-z][a-z0-9]*)\1):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i))) {
                throw new sjcl.exception.invalid("json decode: this isn't json!");
            }
            if (m[3]) {
                out[m[2]] = parseInt(m[3], 10);
            } else {
                out[m[2]] = m[2].match(/^(ct|salt|iv)$/) ? sjcl.codec.base64.toBits(m[4]) : unescape(m[4]);
            }
        }
        return out;
    },
    _add: function(target, src, requireSame) {
        if (target === undefined) {
            target = {};
        }
        if (src === undefined) {
            return target;
        }
        var i;
        for (i in src) {
            if (src.hasOwnProperty(i)) {
                if (requireSame && target[i] !== undefined && target[i] !== src[i]) {
                    throw new sjcl.exception.invalid("required parameter overridden");
                }
                target[i] = src[i];
            }
        }
        return target;
    },
    _subtract: function(plus, minus) {
        var out = {}, i;
        for (i in plus) {
            if (plus.hasOwnProperty(i) && plus[i] !== minus[i]) {
                out[i] = plus[i];
            }
        }
        return out;
    },
    _filter: function(src, filter) {
        var out = {}, i;
        for (i = 0; i < filter.length; i++) {
            if (src[filter[i]] !== undefined) {
                out[filter[i]] = src[filter[i]];
            }
        }
        return out;
    }
};

sjcl.encrypt = sjcl.json.encrypt;

sjcl.decrypt = sjcl.json.decrypt;

sjcl.misc._pbkdf2Cache = {};

sjcl.misc.cachedPbkdf2 = function(password, obj) {
    var cache = sjcl.misc._pbkdf2Cache, c, cp, str, salt, iter;
    obj = obj || {};
    iter = obj.iter || 1e3;
    cp = cache[password] = cache[password] || {};
    c = cp[iter] = cp[iter] || {
        firstSalt: obj.salt && obj.salt.length ? obj.salt.slice(0) : sjcl.random.randomWords(2, 0)
    };
    salt = obj.salt === undefined ? c.firstSalt : obj.salt;
    c[salt] = c[salt] || sjcl.misc.pbkdf2(password, salt, obj.iter);
    return {
        key: c[salt].slice(0),
        salt: salt.slice(0)
    };
};

sjcl.bn = function(it) {
    this.initWith(it);
};

sjcl.bn.prototype = {
    radix: 24,
    maxMul: 8,
    _class: sjcl.bn,
    copy: function() {
        return new this._class(this);
    },
    initWith: function(it) {
        var i = 0, k;
        switch (typeof it) {
          case "object":
            this.limbs = it.limbs.slice(0);
            break;

          case "number":
            this.limbs = [ it ];
            this.normalize();
            break;

          case "string":
            it = it.replace(/^0x/, "");
            this.limbs = [];
            k = this.radix / 4;
            for (i = 0; i < it.length; i += k) {
                this.limbs.push(parseInt(it.substring(Math.max(it.length - i - k, 0), it.length - i), 16));
            }
            break;

          default:
            this.limbs = [ 0 ];
        }
        return this;
    },
    equals: function(that) {
        if (typeof that === "number") {
            that = new this._class(that);
        }
        var difference = 0, i;
        this.fullReduce();
        that.fullReduce();
        for (i = 0; i < this.limbs.length || i < that.limbs.length; i++) {
            difference |= this.getLimb(i) ^ that.getLimb(i);
        }
        return difference === 0;
    },
    getLimb: function(i) {
        return i >= this.limbs.length ? 0 : this.limbs[i];
    },
    greaterEquals: function(that) {
        if (typeof that === "number") {
            that = new this._class(that);
        }
        var less = 0, greater = 0, i, a, b;
        i = Math.max(this.limbs.length, that.limbs.length) - 1;
        for (;i >= 0; i--) {
            a = this.getLimb(i);
            b = that.getLimb(i);
            greater |= b - a & ~less;
            less |= a - b & ~greater;
        }
        return (greater | ~less) >>> 31;
    },
    toString: function() {
        this.fullReduce();
        var out = "", i, s, l = this.limbs;
        for (i = 0; i < this.limbs.length; i++) {
            s = l[i].toString(16);
            while (i < this.limbs.length - 1 && s.length < 6) {
                s = "0" + s;
            }
            out = s + out;
        }
        return "0x" + out;
    },
    addM: function(that) {
        if (typeof that !== "object") {
            that = new this._class(that);
        }
        var i, l = this.limbs, ll = that.limbs;
        for (i = l.length; i < ll.length; i++) {
            l[i] = 0;
        }
        for (i = 0; i < ll.length; i++) {
            l[i] += ll[i];
        }
        return this;
    },
    doubleM: function() {
        var i, carry = 0, tmp, r = this.radix, m = this.radixMask, l = this.limbs;
        for (i = 0; i < l.length; i++) {
            tmp = l[i];
            tmp = tmp + tmp + carry;
            l[i] = tmp & m;
            carry = tmp >> r;
        }
        if (carry) {
            l.push(carry);
        }
        return this;
    },
    halveM: function() {
        var i, carry = 0, tmp, r = this.radix, l = this.limbs;
        for (i = l.length - 1; i >= 0; i--) {
            tmp = l[i];
            l[i] = tmp + carry >> 1;
            carry = (tmp & 1) << r;
        }
        if (!l[l.length - 1]) {
            l.pop();
        }
        return this;
    },
    subM: function(that) {
        if (typeof that !== "object") {
            that = new this._class(that);
        }
        var i, l = this.limbs, ll = that.limbs;
        for (i = l.length; i < ll.length; i++) {
            l[i] = 0;
        }
        for (i = 0; i < ll.length; i++) {
            l[i] -= ll[i];
        }
        return this;
    },
    mod: function(that) {
        var neg = !this.greaterEquals(new sjcl.bn(0));
        that = new sjcl.bn(that).normalize();
        var out = new sjcl.bn(this).normalize(), ci = 0;
        if (neg) out = new sjcl.bn(0).subM(out).normalize();
        for (;out.greaterEquals(that); ci++) {
            that.doubleM();
        }
        if (neg) out = that.sub(out).normalize();
        for (;ci > 0; ci--) {
            that.halveM();
            if (out.greaterEquals(that)) {
                out.subM(that).normalize();
            }
        }
        return out.trim();
    },
    inverseMod: function(p) {
        var a = new sjcl.bn(1), b = new sjcl.bn(0), x = new sjcl.bn(this), y = new sjcl.bn(p), tmp, i, nz = 1;
        if (!(p.limbs[0] & 1)) {
            throw new sjcl.exception.invalid("inverseMod: p must be odd");
        }
        do {
            if (x.limbs[0] & 1) {
                if (!x.greaterEquals(y)) {
                    tmp = x;
                    x = y;
                    y = tmp;
                    tmp = a;
                    a = b;
                    b = tmp;
                }
                x.subM(y);
                x.normalize();
                if (!a.greaterEquals(b)) {
                    a.addM(p);
                }
                a.subM(b);
            }
            x.halveM();
            if (a.limbs[0] & 1) {
                a.addM(p);
            }
            a.normalize();
            a.halveM();
            for (i = nz = 0; i < x.limbs.length; i++) {
                nz |= x.limbs[i];
            }
        } while (nz);
        if (!y.equals(1)) {
            throw new sjcl.exception.invalid("inverseMod: p and x must be relatively prime");
        }
        return b;
    },
    add: function(that) {
        return this.copy().addM(that);
    },
    sub: function(that) {
        return this.copy().subM(that);
    },
    mul: function(that) {
        if (typeof that === "number") {
            that = new this._class(that);
        }
        var i, j, a = this.limbs, b = that.limbs, al = a.length, bl = b.length, out = new this._class(), c = out.limbs, ai, ii = this.maxMul;
        for (i = 0; i < this.limbs.length + that.limbs.length + 1; i++) {
            c[i] = 0;
        }
        for (i = 0; i < al; i++) {
            ai = a[i];
            for (j = 0; j < bl; j++) {
                c[i + j] += ai * b[j];
            }
            if (!--ii) {
                ii = this.maxMul;
                out.cnormalize();
            }
        }
        return out.cnormalize().reduce();
    },
    square: function() {
        return this.mul(this);
    },
    power: function(l) {
        if (typeof l === "number") {
            l = [ l ];
        } else if (l.limbs !== undefined) {
            l = l.normalize().limbs;
        }
        var i, j, out = new this._class(1), pow = this;
        for (i = 0; i < l.length; i++) {
            for (j = 0; j < this.radix; j++) {
                if (l[i] & 1 << j) {
                    out = out.mul(pow);
                }
                pow = pow.square();
            }
        }
        return out;
    },
    mulmod: function(that, N) {
        return this.mod(N).mul(that.mod(N)).mod(N);
    },
    powermod: function(x, N) {
        var result = new sjcl.bn(1), a = new sjcl.bn(this), k = new sjcl.bn(x);
        while (true) {
            if (k.limbs[0] & 1) {
                result = result.mulmod(a, N);
            }
            k.halveM();
            if (k.equals(0)) {
                break;
            }
            a = a.mulmod(a, N);
        }
        return result.normalize().reduce();
    },
    trim: function() {
        var l = this.limbs, p;
        do {
            p = l.pop();
        } while (l.length && p === 0);
        l.push(p);
        return this;
    },
    reduce: function() {
        return this;
    },
    fullReduce: function() {
        return this.normalize();
    },
    normalize: function() {
        var carry = 0, i, pv = this.placeVal, ipv = this.ipv, l, m, limbs = this.limbs, ll = limbs.length, mask = this.radixMask;
        for (i = 0; i < ll || carry !== 0 && carry !== -1; i++) {
            l = (limbs[i] || 0) + carry;
            m = limbs[i] = l & mask;
            carry = (l - m) * ipv;
        }
        if (carry === -1) {
            limbs[i - 1] -= pv;
        }
        return this;
    },
    cnormalize: function() {
        var carry = 0, i, ipv = this.ipv, l, m, limbs = this.limbs, ll = limbs.length, mask = this.radixMask;
        for (i = 0; i < ll - 1; i++) {
            l = limbs[i] + carry;
            m = limbs[i] = l & mask;
            carry = (l - m) * ipv;
        }
        limbs[i] += carry;
        return this;
    },
    toBits: function(len) {
        this.fullReduce();
        len = len || this.exponent || this.bitLength();
        var i = Math.floor((len - 1) / 24), w = sjcl.bitArray, e = (len + 7 & -8) % this.radix || this.radix, out = [ w.partial(e, this.getLimb(i)) ];
        for (i--; i >= 0; i--) {
            out = w.concat(out, [ w.partial(Math.min(this.radix, len), this.getLimb(i)) ]);
            len -= this.radix;
        }
        return out;
    },
    bitLength: function() {
        this.fullReduce();
        var out = this.radix * (this.limbs.length - 1), b = this.limbs[this.limbs.length - 1];
        for (;b; b >>>= 1) {
            out++;
        }
        return out + 7 & -8;
    }
};

sjcl.bn.fromBits = function(bits) {
    var Class = this, out = new Class(), words = [], w = sjcl.bitArray, t = this.prototype, l = Math.min(this.bitLength || 4294967296, w.bitLength(bits)), e = l % t.radix || t.radix;
    words[0] = w.extract(bits, 0, e);
    for (;e < l; e += t.radix) {
        words.unshift(w.extract(bits, e, t.radix));
    }
    out.limbs = words;
    return out;
};

sjcl.bn.prototype.ipv = 1 / (sjcl.bn.prototype.placeVal = Math.pow(2, sjcl.bn.prototype.radix));

sjcl.bn.prototype.radixMask = (1 << sjcl.bn.prototype.radix) - 1;

sjcl.bn.pseudoMersennePrime = function(exponent, coeff) {
    function p(it) {
        this.initWith(it);
    }
    var ppr = p.prototype = new sjcl.bn(), i, tmp, mo;
    mo = ppr.modOffset = Math.ceil(tmp = exponent / ppr.radix);
    ppr.exponent = exponent;
    ppr.offset = [];
    ppr.factor = [];
    ppr.minOffset = mo;
    ppr.fullMask = 0;
    ppr.fullOffset = [];
    ppr.fullFactor = [];
    ppr.modulus = p.modulus = new sjcl.bn(Math.pow(2, exponent));
    ppr.fullMask = 0 | -Math.pow(2, exponent % ppr.radix);
    for (i = 0; i < coeff.length; i++) {
        ppr.offset[i] = Math.floor(coeff[i][0] / ppr.radix - tmp);
        ppr.fullOffset[i] = Math.ceil(coeff[i][0] / ppr.radix - tmp);
        ppr.factor[i] = coeff[i][1] * Math.pow(1 / 2, exponent - coeff[i][0] + ppr.offset[i] * ppr.radix);
        ppr.fullFactor[i] = coeff[i][1] * Math.pow(1 / 2, exponent - coeff[i][0] + ppr.fullOffset[i] * ppr.radix);
        ppr.modulus.addM(new sjcl.bn(Math.pow(2, coeff[i][0]) * coeff[i][1]));
        ppr.minOffset = Math.min(ppr.minOffset, -ppr.offset[i]);
    }
    ppr._class = p;
    ppr.modulus.cnormalize();
    ppr.reduce = function() {
        var i, k, l, mo = this.modOffset, limbs = this.limbs, off = this.offset, ol = this.offset.length, fac = this.factor, ll;
        i = this.minOffset;
        while (limbs.length > mo) {
            l = limbs.pop();
            ll = limbs.length;
            for (k = 0; k < ol; k++) {
                limbs[ll + off[k]] -= fac[k] * l;
            }
            i--;
            if (!i) {
                limbs.push(0);
                this.cnormalize();
                i = this.minOffset;
            }
        }
        this.cnormalize();
        return this;
    };
    ppr._strongReduce = ppr.fullMask === -1 ? ppr.reduce : function() {
        var limbs = this.limbs, i = limbs.length - 1, k, l;
        this.reduce();
        if (i === this.modOffset - 1) {
            l = limbs[i] & this.fullMask;
            limbs[i] -= l;
            for (k = 0; k < this.fullOffset.length; k++) {
                limbs[i + this.fullOffset[k]] -= this.fullFactor[k] * l;
            }
            this.normalize();
        }
    };
    ppr.fullReduce = function() {
        var greater, i;
        this._strongReduce();
        this.addM(this.modulus);
        this.addM(this.modulus);
        this.normalize();
        this._strongReduce();
        for (i = this.limbs.length; i < this.modOffset; i++) {
            this.limbs[i] = 0;
        }
        greater = this.greaterEquals(this.modulus);
        for (i = 0; i < this.limbs.length; i++) {
            this.limbs[i] -= this.modulus.limbs[i] * greater;
        }
        this.cnormalize();
        return this;
    };
    ppr.inverse = function() {
        return this.power(this.modulus.sub(2));
    };
    p.fromBits = sjcl.bn.fromBits;
    return p;
};

var sbp = sjcl.bn.pseudoMersennePrime;

sjcl.bn.prime = {
    p127: sbp(127, [ [ 0, -1 ] ]),
    p25519: sbp(255, [ [ 0, -19 ] ]),
    p192k: sbp(192, [ [ 32, -1 ], [ 12, -1 ], [ 8, -1 ], [ 7, -1 ], [ 6, -1 ], [ 3, -1 ], [ 0, -1 ] ]),
    p224k: sbp(224, [ [ 32, -1 ], [ 12, -1 ], [ 11, -1 ], [ 9, -1 ], [ 7, -1 ], [ 4, -1 ], [ 1, -1 ], [ 0, -1 ] ]),
    p256k: sbp(256, [ [ 32, -1 ], [ 9, -1 ], [ 8, -1 ], [ 7, -1 ], [ 6, -1 ], [ 4, -1 ], [ 0, -1 ] ]),
    p192: sbp(192, [ [ 0, -1 ], [ 64, -1 ] ]),
    p224: sbp(224, [ [ 0, 1 ], [ 96, -1 ] ]),
    p256: sbp(256, [ [ 0, -1 ], [ 96, 1 ], [ 192, 1 ], [ 224, -1 ] ]),
    p384: sbp(384, [ [ 0, -1 ], [ 32, 1 ], [ 96, -1 ], [ 128, -1 ] ]),
    p521: sbp(521, [ [ 0, -1 ] ])
};

sjcl.bn.random = function(modulus, paranoia) {
    if (typeof modulus !== "object") {
        modulus = new sjcl.bn(modulus);
    }
    var words, i, l = modulus.limbs.length, m = modulus.limbs[l - 1] + 1, out = new sjcl.bn();
    while (true) {
        do {
            words = sjcl.random.randomWords(l, paranoia);
            if (words[l - 1] < 0) {
                words[l - 1] += 4294967296;
            }
        } while (Math.floor(words[l - 1] / m) === Math.floor(4294967296 / m));
        words[l - 1] %= m;
        for (i = 0; i < l - 1; i++) {
            words[i] &= modulus.radixMask;
        }
        out.limbs = words;
        if (!out.greaterEquals(modulus)) {
            return out;
        }
    }
};

sjcl.ecc = {};

sjcl.ecc.point = function(curve, x, y) {
    if (x === undefined) {
        this.isIdentity = true;
    } else {
        this.x = x;
        this.y = y;
        this.isIdentity = false;
    }
    this.curve = curve;
};

sjcl.ecc.point.prototype = {
    toJac: function() {
        return new sjcl.ecc.pointJac(this.curve, this.x, this.y, new this.curve.field(1));
    },
    mult: function(k) {
        return this.toJac().mult(k, this).toAffine();
    },
    mult2: function(k, k2, affine2) {
        return this.toJac().mult2(k, this, k2, affine2).toAffine();
    },
    multiples: function() {
        var m, i, j;
        if (this._multiples === undefined) {
            j = this.toJac().doubl();
            m = this._multiples = [ new sjcl.ecc.point(this.curve), this, j.toAffine() ];
            for (i = 3; i < 16; i++) {
                j = j.add(this);
                m.push(j.toAffine());
            }
        }
        return this._multiples;
    },
    isValid: function() {
        return this.y.square().equals(this.curve.b.add(this.x.mul(this.curve.a.add(this.x.square()))));
    },
    toBits: function() {
        return sjcl.bitArray.concat(this.x.toBits(), this.y.toBits());
    }
};

sjcl.ecc.pointJac = function(curve, x, y, z) {
    if (x === undefined) {
        this.isIdentity = true;
    } else {
        this.x = x;
        this.y = y;
        this.z = z;
        this.isIdentity = false;
    }
    this.curve = curve;
};

sjcl.ecc.pointJac.prototype = {
    add: function(T) {
        var S = this, sz2, c, d, c2, x1, x2, x, y1, y2, y, z;
        if (S.curve !== T.curve) {
            throw "sjcl.ecc.add(): Points must be on the same curve to add them!";
        }
        if (S.isIdentity) {
            return T.toJac();
        } else if (T.isIdentity) {
            return S;
        }
        sz2 = S.z.square();
        c = T.x.mul(sz2).subM(S.x);
        if (c.equals(0)) {
            if (S.y.equals(T.y.mul(sz2.mul(S.z)))) {
                return S.doubl();
            } else {
                return new sjcl.ecc.pointJac(S.curve);
            }
        }
        d = T.y.mul(sz2.mul(S.z)).subM(S.y);
        c2 = c.square();
        x1 = d.square();
        x2 = c.square().mul(c).addM(S.x.add(S.x).mul(c2));
        x = x1.subM(x2);
        y1 = S.x.mul(c2).subM(x).mul(d);
        y2 = S.y.mul(c.square().mul(c));
        y = y1.subM(y2);
        z = S.z.mul(c);
        return new sjcl.ecc.pointJac(this.curve, x, y, z);
    },
    doubl: function() {
        if (this.isIdentity) {
            return this;
        }
        var y2 = this.y.square(), a = y2.mul(this.x.mul(4)), b = y2.square().mul(8), z2 = this.z.square(), c = this.curve.a.toString() == new sjcl.bn(-3).toString() ? this.x.sub(z2).mul(3).mul(this.x.add(z2)) : this.x.square().mul(3).add(z2.square().mul(this.curve.a)), x = c.square().subM(a).subM(a), y = a.sub(x).mul(c).subM(b), z = this.y.add(this.y).mul(this.z);
        return new sjcl.ecc.pointJac(this.curve, x, y, z);
    },
    toAffine: function() {
        if (this.isIdentity || this.z.equals(0)) {
            return new sjcl.ecc.point(this.curve);
        }
        var zi = this.z.inverse(), zi2 = zi.square();
        return new sjcl.ecc.point(this.curve, this.x.mul(zi2).fullReduce(), this.y.mul(zi2.mul(zi)).fullReduce());
    },
    mult: function(k, affine) {
        if (typeof k === "number") {
            k = [ k ];
        } else if (k.limbs !== undefined) {
            k = k.normalize().limbs;
        }
        var i, j, out = new sjcl.ecc.point(this.curve).toJac(), multiples = affine.multiples();
        for (i = k.length - 1; i >= 0; i--) {
            for (j = sjcl.bn.prototype.radix - 4; j >= 0; j -= 4) {
                out = out.doubl().doubl().doubl().doubl().add(multiples[k[i] >> j & 15]);
            }
        }
        return out;
    },
    mult2: function(k1, affine, k2, affine2) {
        if (typeof k1 === "number") {
            k1 = [ k1 ];
        } else if (k1.limbs !== undefined) {
            k1 = k1.normalize().limbs;
        }
        if (typeof k2 === "number") {
            k2 = [ k2 ];
        } else if (k2.limbs !== undefined) {
            k2 = k2.normalize().limbs;
        }
        var i, j, out = new sjcl.ecc.point(this.curve).toJac(), m1 = affine.multiples(), m2 = affine2.multiples(), l1, l2;
        for (i = Math.max(k1.length, k2.length) - 1; i >= 0; i--) {
            l1 = k1[i] | 0;
            l2 = k2[i] | 0;
            for (j = sjcl.bn.prototype.radix - 4; j >= 0; j -= 4) {
                out = out.doubl().doubl().doubl().doubl().add(m1[l1 >> j & 15]).add(m2[l2 >> j & 15]);
            }
        }
        return out;
    },
    isValid: function() {
        var z2 = this.z.square(), z4 = z2.square(), z6 = z4.mul(z2);
        return this.y.square().equals(this.curve.b.mul(z6).add(this.x.mul(this.curve.a.mul(z4).add(this.x.square()))));
    }
};

sjcl.ecc.curve = function(Field, r, a, b, x, y) {
    this.field = Field;
    this.r = new sjcl.bn(r);
    this.a = new Field(a);
    this.b = new Field(b);
    this.G = new sjcl.ecc.point(this, new Field(x), new Field(y));
};

sjcl.ecc.curve.prototype.fromBits = function(bits) {
    var w = sjcl.bitArray, l = this.field.prototype.exponent + 7 & -8, p = new sjcl.ecc.point(this, this.field.fromBits(w.bitSlice(bits, 0, l)), this.field.fromBits(w.bitSlice(bits, l, 2 * l)));
    if (!p.isValid()) {
        throw new sjcl.exception.corrupt("not on the curve!");
    }
    return p;
};

sjcl.ecc.curves = {
    c192: new sjcl.ecc.curve(sjcl.bn.prime.p192, "0xffffffffffffffffffffffff99def836146bc9b1b4d22831", -3, "0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1", "0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012", "0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811"),
    c224: new sjcl.ecc.curve(sjcl.bn.prime.p224, "0xffffffffffffffffffffffffffff16a2e0b8f03e13dd29455c5c2a3d", -3, "0xb4050a850c04b3abf54132565044b0b7d7bfd8ba270b39432355ffb4", "0xb70e0cbd6bb4bf7f321390b94a03c1d356c21122343280d6115c1d21", "0xbd376388b5f723fb4c22dfe6cd4375a05a07476444d5819985007e34"),
    c256: new sjcl.ecc.curve(sjcl.bn.prime.p256, "0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551", -3, "0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b", "0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296", "0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"),
    c384: new sjcl.ecc.curve(sjcl.bn.prime.p384, "0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973", -3, "0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef", "0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7", "0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f"),
    k192: new sjcl.ecc.curve(sjcl.bn.prime.p192k, "0xfffffffffffffffffffffffe26f2fc170f69466a74defd8d", 0, 3, "0xdb4ff10ec057e9ae26b07d0280b7f4341da5d1b1eae06c7d", "0x9b2f2f6d9c5628a7844163d015be86344082aa88d95e2f9d"),
    k224: new sjcl.ecc.curve(sjcl.bn.prime.p224k, "0x010000000000000000000000000001dce8d2ec6184caf0a971769fb1f7", 0, 5, "0xa1455b334df099df30fc28a169a467e9e47075a90f7e650eb6b7a45c", "0x7e089fed7fba344282cafbd6f7e319f7c0b0bd59e2ca4bdb556d61a5"),
    k256: new sjcl.ecc.curve(sjcl.bn.prime.p256k, "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 0, 7, "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", "0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};

sjcl.ecc.basicKey = {
    publicKey: function(curve, point) {
        this._curve = curve;
        this._curveBitLength = curve.r.bitLength();
        if (point instanceof Array) {
            this._point = curve.fromBits(point);
        } else {
            this._point = point;
        }
        this.get = function() {
            var pointbits = this._point.toBits();
            var len = sjcl.bitArray.bitLength(pointbits);
            var x = sjcl.bitArray.bitSlice(pointbits, 0, len / 2);
            var y = sjcl.bitArray.bitSlice(pointbits, len / 2);
            return {
                x: x,
                y: y
            };
        };
    },
    secretKey: function(curve, exponent) {
        this._curve = curve;
        this._curveBitLength = curve.r.bitLength();
        this._exponent = exponent;
        this.get = function() {
            return this._exponent.toBits();
        };
    }
};

sjcl.ecc.basicKey.generateKeys = function(cn) {
    return function generateKeys(curve, paranoia, sec) {
        curve = curve || 256;
        if (typeof curve === "number") {
            curve = sjcl.ecc.curves["c" + curve];
            if (curve === undefined) {
                throw new sjcl.exception.invalid("no such curve");
            }
        }
        sec = sec || sjcl.bn.random(curve.r, paranoia);
        var pub = curve.G.mult(sec);
        return {
            pub: new sjcl.ecc[cn].publicKey(curve, pub),
            sec: new sjcl.ecc[cn].secretKey(curve, sec)
        };
    };
};

sjcl.ecc.elGamal = {
    generateKeys: sjcl.ecc.basicKey.generateKeys("elGamal"),
    publicKey: function(curve, point) {
        sjcl.ecc.basicKey.publicKey.apply(this, arguments);
    },
    secretKey: function(curve, exponent) {
        sjcl.ecc.basicKey.secretKey.apply(this, arguments);
    }
};

sjcl.ecc.elGamal.publicKey.prototype = {
    kem: function(paranoia) {
        var sec = sjcl.bn.random(this._curve.r, paranoia), tag = this._curve.G.mult(sec).toBits(), key = sjcl.hash.sha256.hash(this._point.mult(sec).toBits());
        return {
            key: key,
            tag: tag
        };
    }
};

sjcl.ecc.elGamal.secretKey.prototype = {
    unkem: function(tag) {
        return sjcl.hash.sha256.hash(this._curve.fromBits(tag).mult(this._exponent).toBits());
    },
    dh: function(pk) {
        return sjcl.hash.sha256.hash(pk._point.mult(this._exponent).toBits());
    }
};

sjcl.ecc.ecdsa = {
    generateKeys: sjcl.ecc.basicKey.generateKeys("ecdsa")
};

sjcl.ecc.ecdsa.publicKey = function(curve, point) {
    sjcl.ecc.basicKey.publicKey.apply(this, arguments);
};

sjcl.ecc.ecdsa.publicKey.prototype = {
    verify: function(hash, rs, fakeLegacyVersion) {
        if (sjcl.bitArray.bitLength(hash) > this._curveBitLength) {
            hash = sjcl.bitArray.clamp(hash, this._curveBitLength);
        }
        var w = sjcl.bitArray, R = this._curve.r, l = this._curveBitLength, r = sjcl.bn.fromBits(w.bitSlice(rs, 0, l)), ss = sjcl.bn.fromBits(w.bitSlice(rs, l, 2 * l)), s = fakeLegacyVersion ? ss : ss.inverseMod(R), hG = sjcl.bn.fromBits(hash).mul(s).mod(R), hA = r.mul(s).mod(R), r2 = this._curve.G.mult2(hG, hA, this._point).x;
        if (r.equals(0) || ss.equals(0) || r.greaterEquals(R) || ss.greaterEquals(R) || !r2.equals(r)) {
            if (fakeLegacyVersion === undefined) {
                return this.verify(hash, rs, true);
            } else {
                throw new sjcl.exception.corrupt("signature didn't check out");
            }
        }
        return true;
    }
};

sjcl.ecc.ecdsa.secretKey = function(curve, exponent) {
    sjcl.ecc.basicKey.secretKey.apply(this, arguments);
};

sjcl.ecc.ecdsa.secretKey.prototype = {
    sign: function(hash, paranoia, fakeLegacyVersion, fixedKForTesting) {
        if (sjcl.bitArray.bitLength(hash) > this._curveBitLength) {
            hash = sjcl.bitArray.clamp(hash, this._curveBitLength);
        }
        var R = this._curve.r, l = R.bitLength(), k = fixedKForTesting || sjcl.bn.random(R.sub(1), paranoia).add(1), r = this._curve.G.mult(k).x.mod(R), ss = sjcl.bn.fromBits(hash).add(r.mul(this._exponent)), s = fakeLegacyVersion ? ss.inverseMod(R).mul(k).mod(R) : ss.mul(k.inverseMod(R)).mod(R);
        return sjcl.bitArray.concat(r.toBits(l), s.toBits(l));
    }
};

sjcl.codec.base32 = {
    _chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    fromBits: function(arr, _noEquals) {
        var out = "", i, bits = 0, c = sjcl.codec.base32._chars, ta = 0, bl = sjcl.bitArray.bitLength(arr);
        for (i = 0; out.length * 5 < bl; ) {
            out += c.charAt((ta ^ arr[i] >>> bits) >>> 27);
            if (bits < 5) {
                ta = arr[i] << 5 - bits;
                bits += 27;
                i++;
            } else {
                ta <<= 5;
                bits -= 5;
            }
        }
        while (out.length % 8 && !_noEquals) {
            out += "=";
        }
        return out;
    },
    toBits: function(str) {
        str = str.replace(/\s|=/g, "");
        var out = [], i, bits = 0, c = sjcl.codec.base32._chars, ta = 0, x;
        for (i = 0; i < str.length; i++) {
            x = c.indexOf(str.charAt(i));
            if (x < 0) {
                throw new sjcl.exception.invalid("this isn't base32!");
            }
            if (bits > 27) {
                bits -= 27;
                out.push(ta ^ x >>> bits);
                ta = x << 32 - bits;
            } else {
                bits += 5;
                ta ^= x << 32 - bits;
            }
        }
        if (bits & 56) {
            out.push(sjcl.bitArray.partial(bits & 56, ta, 1));
        }
        return out;
    }
};

sjcl.ecc.ecdsa.secretKey.prototype.signDER = function(hash, paranoia) {
    return this.encodeDER(this.sign(hash, paranoia));
};

sjcl.ecc.ecdsa.publicKey.prototype.verifyDER = function(hash, signature) {
    return this.verify(hash, this.decodeDER(signature));
};

sjcl.ecc.ecdsa.secretKey.prototype.encodeDER = function(rs) {
    var w = sjcl.bitArray, R = this._curve.r, l = R.bitLength();
    var rb = sjcl.codec.bytes.fromBits(w.bitSlice(rs, 0, l)), sb = sjcl.codec.bytes.fromBits(w.bitSlice(rs, l, 2 * l));
    while (!rb[0] && rb.length) rb.shift();
    while (!sb[0] && sb.length) sb.shift();
    if (rb[0] && 128) rb.unshift(0);
    if (sb[0] && 128) sb.unshift(0);
    var buffer = [].concat(48, 4 + rb.length + sb.length, 2, rb.length, rb, 2, sb.length, sb);
    return sjcl.codec.bytes.toBits(buffer);
};

sjcl.ecc.ecdsa.publicKey.prototype.decodeDER = function(signature) {
    var sig = sjcl.codec.bytes.fromBits(signature);
    if (sig[0] != 48) {
        throw new Error("Signature not valid DER sequence");
    }
    if (sig[2] != 2) {
        throw new Error("First element in signature must be a DER Integer");
    }
    var rbLength = sig[3];
    var rbStart = 4;
    var rbEnd = 4 + rbLength;
    var secondElm = sig[rbLength + 4];
    if (secondElm != 2) {
        throw new Error("Second element in signature must be a DER Integer");
    }
    var sbLength = sig[rbLength + 4 + 1];
    var sbStart = rbLength + 4 + 2;
    var rBa = sig.slice(rbStart, rbEnd);
    var sBa = sig.slice(sbStart, sbStart + sbLength);
    if (rBa.length == 33 && rBa[0] === 0) {
        rBa = rBa.slice(1);
    }
    if (sBa.length == 33 && sBa[0] === 0) {
        sBa = sBa.slice(1);
    }
    var res = sjcl.bitArray.concat(sjcl.codec.bytes.toBits(rBa), sjcl.codec.bytes.toBits(sBa));
    return res;
};

sjcl.hash.sha256.prototype.outputSize = 256;

sjcl.hash.sha512.prototype.outputSize = 512;

sjcl.misc.hkdf = {
    extract: function(salt, ikm, Hash) {
        if (typeof salt === "string") {
            salt = sjcl.codec.utf8String.toBits(salt);
        }
        if (typeof ikm === "string") {
            ikm = sjcl.codec.utf8String.toBits(ikm);
        }
        Hash = Hash || sjcl.hash.sha256;
        var prf = new sjcl.misc.hmac(salt, Hash);
        return prf.encrypt(ikm);
    },
    expand: function(prk, info, length, Hash) {
        if (length < 0) {
            throw sjcl.exception.invalid("invalid params to hkdf");
        }
        if (typeof prk === "string") {
            prk = sjcl.codec.utf8String.toBits(prk);
        }
        if (typeof info === "string") {
            info = sjcl.codec.utf8String.toBits(info);
        }
        Hash = Hash || sjcl.hash.sha256;
        var prf = new sjcl.misc.hmac(prk, Hash), i, t = [], out = [], b = sjcl.bitArray, os = Hash.prototype.outputSize || 256, length = length || os, n = Math.ceil(length / os);
        for (i = 1; i <= n; i++) {
            t = prf.encrypt(b.concat(t, b.concat(info, [ b.partial(8, i) ])));
            out = out.concat(t);
        }
        out = b.clamp(out, length);
        return out;
    }
};

sjcl.hash.ripemd160 = function(hash) {
    if (hash) {
        this._h = hash._h.slice(0);
        this._buffer = hash._buffer.slice(0);
        this._length = hash._length;
    } else {
        this.reset();
    }
};

sjcl.hash.ripemd160.hash = function(data) {
    return new sjcl.hash.ripemd160().update(data).finalize();
};

sjcl.hash.ripemd160.prototype = {
    outputSize: 160,
    reset: function() {
        this._h = _h0.slice(0);
        this._buffer = [];
        this._length = 0;
        return this;
    },
    update: function(data) {
        if (typeof data === "string") data = sjcl.codec.utf8String.toBits(data);
        var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + sjcl.bitArray.bitLength(data);
        for (i = 512 + ol & -512; i <= nl; i += 512) {
            var words = b.splice(0, 16);
            for (var w = 0; w < 16; ++w) words[w] = _cvt(words[w]);
            _block.call(this, words);
        }
        return this;
    },
    finalize: function() {
        var b = sjcl.bitArray.concat(this._buffer, [ sjcl.bitArray.partial(1, 1) ]), l = (this._length + 1) % 512, z = (l > 448 ? 512 : 448) - l % 448, zp = z % 32;
        if (zp > 0) b = sjcl.bitArray.concat(b, [ sjcl.bitArray.partial(zp, 0) ]);
        for (;z >= 32; z -= 32) b.push(0);
        b.push(_cvt(this._length | 0));
        b.push(_cvt(Math.floor(this._length / 4294967296)));
        while (b.length) {
            var words = b.splice(0, 16);
            for (var w = 0; w < 16; ++w) words[w] = _cvt(words[w]);
            _block.call(this, words);
        }
        var h = this._h;
        this.reset();
        for (var w = 0; w < 5; ++w) h[w] = _cvt(h[w]);
        return h;
    }
};

var _h0 = [ 1732584193, 4023233417, 2562383102, 271733878, 3285377520 ];

var _k1 = [ 0, 1518500249, 1859775393, 2400959708, 2840853838 ];

var _k2 = [ 1352829926, 1548603684, 1836072691, 2053994217, 0 ];

for (var i = 4; i >= 0; --i) {
    for (var j = 1; j < 16; ++j) {
        _k1.splice(i, 0, _k1[i]);
        _k2.splice(i, 0, _k2[i]);
    }
}

var _r1 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13 ];

var _r2 = [ 5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11 ];

var _s1 = [ 11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6 ];

var _s2 = [ 8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11 ];

function _f0(x, y, z) {
    return x ^ y ^ z;
}

function _f1(x, y, z) {
    return x & y | ~x & z;
}

function _f2(x, y, z) {
    return (x | ~y) ^ z;
}

function _f3(x, y, z) {
    return x & z | y & ~z;
}

function _f4(x, y, z) {
    return x ^ (y | ~z);
}

function _rol(n, l) {
    return n << l | n >>> 32 - l;
}

function _cvt(n) {
    return (n & 255 << 0) << 24 | (n & 255 << 8) << 8 | (n & 255 << 16) >>> 8 | (n & 255 << 24) >>> 24;
}

function _block(X) {
    var A1 = this._h[0], B1 = this._h[1], C1 = this._h[2], D1 = this._h[3], E1 = this._h[4], A2 = this._h[0], B2 = this._h[1], C2 = this._h[2], D2 = this._h[3], E2 = this._h[4];
    var j = 0, T;
    for (;j < 16; ++j) {
        T = _rol(A1 + _f0(B1, C1, D1) + X[_r1[j]] + _k1[j], _s1[j]) + E1;
        A1 = E1;
        E1 = D1;
        D1 = _rol(C1, 10);
        C1 = B1;
        B1 = T;
        T = _rol(A2 + _f4(B2, C2, D2) + X[_r2[j]] + _k2[j], _s2[j]) + E2;
        A2 = E2;
        E2 = D2;
        D2 = _rol(C2, 10);
        C2 = B2;
        B2 = T;
    }
    for (;j < 32; ++j) {
        T = _rol(A1 + _f1(B1, C1, D1) + X[_r1[j]] + _k1[j], _s1[j]) + E1;
        A1 = E1;
        E1 = D1;
        D1 = _rol(C1, 10);
        C1 = B1;
        B1 = T;
        T = _rol(A2 + _f3(B2, C2, D2) + X[_r2[j]] + _k2[j], _s2[j]) + E2;
        A2 = E2;
        E2 = D2;
        D2 = _rol(C2, 10);
        C2 = B2;
        B2 = T;
    }
    for (;j < 48; ++j) {
        T = _rol(A1 + _f2(B1, C1, D1) + X[_r1[j]] + _k1[j], _s1[j]) + E1;
        A1 = E1;
        E1 = D1;
        D1 = _rol(C1, 10);
        C1 = B1;
        B1 = T;
        T = _rol(A2 + _f2(B2, C2, D2) + X[_r2[j]] + _k2[j], _s2[j]) + E2;
        A2 = E2;
        E2 = D2;
        D2 = _rol(C2, 10);
        C2 = B2;
        B2 = T;
    }
    for (;j < 64; ++j) {
        T = _rol(A1 + _f3(B1, C1, D1) + X[_r1[j]] + _k1[j], _s1[j]) + E1;
        A1 = E1;
        E1 = D1;
        D1 = _rol(C1, 10);
        C1 = B1;
        B1 = T;
        T = _rol(A2 + _f1(B2, C2, D2) + X[_r2[j]] + _k2[j], _s2[j]) + E2;
        A2 = E2;
        E2 = D2;
        D2 = _rol(C2, 10);
        C2 = B2;
        B2 = T;
    }
    for (;j < 80; ++j) {
        T = _rol(A1 + _f4(B1, C1, D1) + X[_r1[j]] + _k1[j], _s1[j]) + E1;
        A1 = E1;
        E1 = D1;
        D1 = _rol(C1, 10);
        C1 = B1;
        B1 = T;
        T = _rol(A2 + _f0(B2, C2, D2) + X[_r2[j]] + _k2[j], _s2[j]) + E2;
        A2 = E2;
        E2 = D2;
        D2 = _rol(C2, 10);
        C2 = B2;
        B2 = T;
    }
    T = this._h[1] + C1 + D2;
    this._h[1] = this._h[2] + D1 + E2;
    this._h[2] = this._h[3] + E1 + A2;
    this._h[3] = this._h[4] + A1 + B2;
    this._h[4] = this._h[0] + B1 + C2;
    this._h[0] = T;
}

},{"crypto":29}]},{},[1])
(1)
});
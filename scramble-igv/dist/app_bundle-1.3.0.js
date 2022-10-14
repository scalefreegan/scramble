(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.igv_webapp = {}));
}(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


	var global_1 = // eslint-disable-next-line no-undef
	check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
	Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, {
	    get: function () {
	      return 7;
	    }
	  })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
	  1: 2
	}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;
	var objectPropertyIsEnumerable = {
	  f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string

	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () {
	      return 7;
	    }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) {
	    /* empty */
	  }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};
	var objectGetOwnPropertyDescriptor = {
	  f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  }

	  return it;
	};

	var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty

	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) {
	    /* empty */
	  }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};
	var objectDefineProperty = {
	  f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  }

	  return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});
	var sharedStore = store;

	var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;
	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var shared = createCommonjsModule(function (module) {
	  (module.exports = function (key, value) {
	    return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	  })('versions', []).push({
	    version: '3.6.5',
	    mode:  'global',
	    copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
	  });
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;

	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    }

	    return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;

	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };

	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;

	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };

	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	  var getInternalState = internalState.get;
	  var enforceInternalState = internalState.enforce;
	  var TEMPLATE = String(String).split('String');
	  (module.exports = function (O, key, value, options) {
	    var unsafe = options ? !!options.unsafe : false;
	    var simple = options ? !!options.enumerable : false;
	    var noTargetGet = options ? !!options.noTargetGet : false;

	    if (typeof value == 'function') {
	      if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	    }

	    if (O === global_1) {
	      if (simple) O[key] = value;else setGlobal(key, value);
	      return;
	    } else if (!unsafe) {
	      delete O[key];
	    } else if (!noTargetGet && O[key]) {
	      simple = true;
	    }

	    if (simple) O[key] = value;else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	  })(Function.prototype, 'toString', function toString() {
	    return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	  });
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor; // `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger

	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min; // `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength

	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min; // Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value; // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare

	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++]; // eslint-disable-next-line no-self-compare

	      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
	    } else for (; length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    }
	    return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;

	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }

	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames

	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
	  f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;
	var objectGetOwnPropertySymbols = {
	  f: f$4
	};

	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';
	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/

	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;

	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }

	  if (target) for (key in source) {
	    sourceProperty = source[key];

	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];

	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    } // add a flag to not completely full polyfills


	    if (options.sham || targetProperty && targetProperty.sham) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    } // extend global


	    redefine(target, key, sourceProperty, options);
	  }
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  }

	  return it;
	};

	var functionBindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;

	  switch (length) {
	    case 0:
	      return function () {
	        return fn.call(that);
	      };

	    case 1:
	      return function (a) {
	        return fn.call(that, a);
	      };

	    case 2:
	      return function (a, b) {
	        return fn.call(that, a, b);
	      };

	    case 3:
	      return function (a, b, c) {
	        return fn.call(that, a, b, c);
	      };
	  }

	  return function ()
	  /* ...args */
	  {
	    return fn.apply(that, arguments);
	  };
	};

	// https://tc39.github.io/ecma262/#sec-toobject

	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	// https://tc39.github.io/ecma262/#sec-isarray

	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol // eslint-disable-next-line no-undef
	&& !Symbol.sham // eslint-disable-next-line no-undef
	&& typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  }

	  return WellKnownSymbolsStore[name];
	};

	var SPECIES = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate

	var arraySpeciesCreate = function (originalArray, length) {
	  var C;

	  if (isArray(originalArray)) {
	    C = originalArray.constructor; // cross-realm fallback

	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  }

	  return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var push = [].push; // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation

	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;

	    for (; length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);

	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	            case 3:
	              return true;
	            // some

	            case 5:
	              return value;
	            // find

	            case 6:
	              return index;
	            // findIndex

	            case 2:
	              push.call(target, value);
	            // filter
	          } else if (IS_EVERY) return false; // every
	      }
	    }

	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () {
	      throw 1;
	    }, 1);
	  });
	};

	var defineProperty = Object.defineProperty;
	var cache = {};

	var thrower = function (it) {
	  throw it;
	};

	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
	  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
	  if (!options) options = {};
	  var method = [][METHOD_NAME];
	  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
	  var argument0 = has(options, 0) ? options[0] : thrower;
	  var argument1 = has(options, 1) ? options[1] : undefined;
	  return cache[METHOD_NAME] = !!method && !fails(function () {
	    if (ACCESSORS && !descriptors) return true;
	    var O = {
	      length: -1
	    };
	    if (ACCESSORS) defineProperty(O, 1, {
	      enumerable: true,
	      get: thrower
	    });else O[1] = 1;
	    method.call(O, argument0, argument1);
	  });
	};

	var $forEach = arrayIteration.forEach;
	var STRICT_METHOD = arrayMethodIsStrict('forEach');
	var USES_TO_LENGTH = arrayMethodUsesToLength('forEach'); // `Array.prototype.forEach` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach

	var arrayForEach = !STRICT_METHOD || !USES_TO_LENGTH ? function forEach(callbackfn
	/* , thisArg */
	) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach


	_export({
	  target: 'Array',
	  proto: true,
	  forced: [].forEach != arrayForEach
	}, {
	  forEach: arrayForEach
	});

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var test = {};
	test[TO_STRING_TAG] = 'z';
	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag'); // ES3 wrong here

	var CORRECT_ARGUMENTS = classofRaw(function () {
	  return arguments;
	}()) == 'Arguments'; // fallback for IE11 Script Access Denied error

	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) {
	    /* empty */
	  }
	}; // getting tag from ES6+ `Object.prototype.toString`


	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
	  : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$1)) == 'string' ? tag // builtinTag case
	  : CORRECT_ARGUMENTS ? classofRaw(O) // ES3 arguments fallback
	  : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring


	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring

	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, {
	    unsafe: true
	  });
	}

	var nativePromiseConstructor = global_1.Promise;

	var redefineAll = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);

	  return target;
	};

	var defineProperty$1 = objectDefineProperty.f;
	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG$2)) {
	    defineProperty$1(it, TO_STRING_TAG$2, {
	      configurable: true,
	      value: TAG
	    });
	  }
	};

	var SPECIES$1 = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES$1]) {
	    defineProperty(Constructor, SPECIES$1, {
	      configurable: true,
	      get: function () {
	        return this;
	      }
	    });
	  }
	};

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  }

	  return it;
	};

	var iterators = {};

	var ITERATOR = wellKnownSymbol('iterator');
	var ArrayPrototype = Array.prototype; // check on default Array iterator

	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype[ITERATOR] === it);
	};

	var ITERATOR$1 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$1] || it['@@iterator'] || iterators[classof(it)];
	};

	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
	    throw error;
	  }
	};

	var iterate_1 = createCommonjsModule(function (module) {
	  var Result = function (stopped, result) {
	    this.stopped = stopped;
	    this.result = result;
	  };

	  var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
	    var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
	    var iterator, iterFn, index, length, result, next, step;

	    if (IS_ITERATOR) {
	      iterator = iterable;
	    } else {
	      iterFn = getIteratorMethod(iterable);
	      if (typeof iterFn != 'function') throw TypeError('Target is not iterable'); // optimisation for array iterators

	      if (isArrayIteratorMethod(iterFn)) {
	        for (index = 0, length = toLength(iterable.length); length > index; index++) {
	          result = AS_ENTRIES ? boundFunction(anObject(step = iterable[index])[0], step[1]) : boundFunction(iterable[index]);
	          if (result && result instanceof Result) return result;
	        }

	        return new Result(false);
	      }

	      iterator = iterFn.call(iterable);
	    }

	    next = iterator.next;

	    while (!(step = next.call(iterator)).done) {
	      result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	      if (typeof result == 'object' && result && result instanceof Result) return result;
	    }

	    return new Result(false);
	  };

	  iterate.stop = function (result) {
	    return new Result(true, result);
	  };
	});

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return {
	        done: !!called++
	      };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };

	  iteratorWithReturn[ITERATOR$2] = function () {
	    return this;
	  }; // eslint-disable-next-line no-throw-literal


	  Array.from(iteratorWithReturn, function () {
	    throw 2;
	  });
	} catch (error) {
	  /* empty */
	}

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;

	  try {
	    var object = {};

	    object[ITERATOR$2] = function () {
	      return {
	        next: function () {
	          return {
	            done: ITERATION_SUPPORT = true
	          };
	        }
	      };
	    };

	    exec(object);
	  } catch (error) {
	    /* empty */
	  }

	  return ITERATION_SUPPORT;
	};

	var SPECIES$2 = wellKnownSymbol('species'); // `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor

	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$2]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var html = getBuiltIn('document', 'documentElement');

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

	var location = global_1.location;
	var set$1 = global_1.setImmediate;
	var clear = global_1.clearImmediate;
	var process$1 = global_1.process;
	var MessageChannel = global_1.MessageChannel;
	var Dispatch = global_1.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;

	var run = function (id) {
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};

	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};

	var listener = function (event) {
	  run(event.data);
	};

	var post = function (id) {
	  // old engines have not location.origin
	  global_1.postMessage(id + '', location.protocol + '//' + location.host);
	}; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


	if (!set$1 || !clear) {
	  set$1 = function setImmediate(fn) {
	    var args = [];
	    var i = 1;

	    while (arguments.length > i) args.push(arguments[i++]);

	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
	    };

	    defer(counter);
	    return counter;
	  };

	  clear = function clearImmediate(id) {
	    delete queue[id];
	  }; // Node.js 0.8-


	  if (classofRaw(process$1) == 'process') {
	    defer = function (id) {
	      process$1.nextTick(runner(id));
	    }; // Sphere (JS game engine) Dispatch API

	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    }; // Browsers with MessageChannel, includes WebWorkers
	    // except iOS - https://github.com/zloirock/core-js/issues/624

	  } else if (MessageChannel && !engineIsIos) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = functionBindContext(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
	    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (global_1.addEventListener && typeof postMessage == 'function' && !global_1.importScripts && !fails(post) && location.protocol !== 'file:') {
	    defer = post;
	    global_1.addEventListener('message', listener, false); // IE8-
	  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
	    defer = function (id) {
	      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    }; // Rest old browsers

	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}

	var task = {
	  set: set$1,
	  clear: clear
	};

	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var macrotask = task.set;
	var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
	var process$2 = global_1.process;
	var Promise$1 = global_1.Promise;
	var IS_NODE = classofRaw(process$2) == 'process'; // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`

	var queueMicrotaskDescriptor = getOwnPropertyDescriptor$2(global_1, 'queueMicrotask');
	var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;
	var flush, head, last, notify, toggle, node, promise, then; // modern engines have queueMicrotask method

	if (!queueMicrotask) {
	  flush = function () {
	    var parent, fn;
	    if (IS_NODE && (parent = process$2.domain)) parent.exit();

	    while (head) {
	      fn = head.fn;
	      head = head.next;

	      try {
	        fn();
	      } catch (error) {
	        if (head) notify();else last = undefined;
	        throw error;
	      }
	    }

	    last = undefined;
	    if (parent) parent.enter();
	  }; // Node.js


	  if (IS_NODE) {
	    notify = function () {
	      process$2.nextTick(flush);
	    }; // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339

	  } else if (MutationObserver && !engineIsIos) {
	    toggle = true;
	    node = document.createTextNode('');
	    new MutationObserver(flush).observe(node, {
	      characterData: true
	    });

	    notify = function () {
	      node.data = toggle = !toggle;
	    }; // environments with maybe non-completely correct, but existent Promise

	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise = Promise$1.resolve(undefined);
	    then = promise.then;

	    notify = function () {
	      then.call(promise, flush);
	    }; // for other environments - macrotask based on:
	    // - setImmediate
	    // - MessageChannel
	    // - window.postMessag
	    // - onreadystatechange
	    // - setTimeout

	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global_1, flush);
	    };
	  }
	}

	var microtask = queueMicrotask || function (fn) {
	  var task = {
	    fn: fn,
	    next: undefined
	  };
	  if (last) last.next = task;

	  if (!head) {
	    head = task;
	    notify();
	  }

	  last = task;
	};

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction$1(resolve);
	  this.reject = aFunction$1(reject);
	}; // 25.4.1.5 NewPromiseCapability(C)


	var f$5 = function (C) {
	  return new PromiseCapability(C);
	};

	var newPromiseCapability = {
	  f: f$5
	};

	var promiseResolve = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var hostReportErrors = function (a, b) {
	  var console = global_1.console;

	  if (console && console.error) {
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  }
	};

	var perform = function (exec) {
	  try {
	    return {
	      error: false,
	      value: exec()
	    };
	  } catch (error) {
	    return {
	      error: true,
	      value: error
	    };
	  }
	};

	var process$3 = global_1.process;
	var versions = process$3 && process$3.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);

	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var engineV8Version = version && +version;

	var task$1 = task.set;
	var SPECIES$3 = wellKnownSymbol('species');
	var PROMISE = 'Promise';
	var getInternalState = internalState.get;
	var setInternalState = internalState.set;
	var getInternalPromiseState = internalState.getterFor(PROMISE);
	var PromiseConstructor = nativePromiseConstructor;
	var TypeError$1 = global_1.TypeError;
	var document$2 = global_1.document;
	var process$4 = global_1.process;
	var $fetch = getBuiltIn('fetch');
	var newPromiseCapability$1 = newPromiseCapability.f;
	var newGenericPromiseCapability = newPromiseCapability$1;
	var IS_NODE$1 = classofRaw(process$4) == 'process';
	var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;
	var FORCED = isForced_1(PROMISE, function () {
	  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);

	  if (!GLOBAL_CORE_JS_PROMISE) {
	    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	    // We can't detect it synchronously, so just check versions
	    if (engineV8Version === 66) return true; // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test

	    if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
	  } // We need Promise#finally in the pure version for preventing prototype pollution
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679

	  if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false; // Detect correctness of subclassing with @@species support

	  var promise = PromiseConstructor.resolve(1);

	  var FakePromise = function (exec) {
	    exec(function () {
	      /* empty */
	    }, function () {
	      /* empty */
	    });
	  };

	  var constructor = promise.constructor = {};
	  constructor[SPECIES$3] = FakePromise;
	  return !(promise.then(function () {
	    /* empty */
	  }) instanceof FakePromise);
	});
	var INCORRECT_ITERATION = FORCED || !checkCorrectnessOfIteration(function (iterable) {
	  PromiseConstructor.all(iterable)['catch'](function () {
	    /* empty */
	  });
	}); // helpers

	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};

	var notify$1 = function (promise, state, isReject) {
	  if (state.notified) return;
	  state.notified = true;
	  var chain = state.reactions;
	  microtask(function () {
	    var value = state.value;
	    var ok = state.state == FULFILLED;
	    var index = 0; // variable length - can't use forEach

	    while (chain.length > index) {
	      var reaction = chain[index++];
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;

	      try {
	        if (handler) {
	          if (!ok) {
	            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
	            state.rejection = HANDLED;
	          }

	          if (handler === true) result = value;else {
	            if (domain) domain.enter();
	            result = handler(value); // can throw

	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }

	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (error) {
	        if (domain && !exited) domain.exit();
	        reject(error);
	      }
	    }

	    state.reactions = [];
	    state.notified = false;
	    if (isReject && !state.rejection) onUnhandled(promise, state);
	  });
	};

	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;

	  if (DISPATCH_EVENT) {
	    event = document$2.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    global_1.dispatchEvent(event);
	  } else event = {
	    promise: promise,
	    reason: reason
	  };

	  if (handler = global_1['on' + name]) handler(event);else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};

	var onUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;

	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (IS_NODE$1) {
	          process$4.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      }); // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should

	      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    if (IS_NODE$1) {
	      process$4.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};

	var bind = function (fn, promise, state, unwrap) {
	  return function (value) {
	    fn(promise, state, value, unwrap);
	  };
	};

	var internalReject = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  state.value = value;
	  state.state = REJECTED;
	  notify$1(promise, state, true);
	};

	var internalResolve = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;

	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    var then = isThenable(value);

	    if (then) {
	      microtask(function () {
	        var wrapper = {
	          done: false
	        };

	        try {
	          then.call(value, bind(internalResolve, promise, wrapper, state), bind(internalReject, promise, wrapper, state));
	        } catch (error) {
	          internalReject(promise, wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify$1(promise, state, false);
	    }
	  } catch (error) {
	    internalReject(promise, {
	      done: false
	    }, error, state);
	  }
	}; // constructor polyfill


	if (FORCED) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromiseConstructor, PROMISE);
	    aFunction$1(executor);
	    Internal.call(this);
	    var state = getInternalState(this);

	    try {
	      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
	    } catch (error) {
	      internalReject(this, state, error);
	    }
	  }; // eslint-disable-next-line no-unused-vars


	  Internal = function Promise(executor) {
	    setInternalState(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: [],
	      rejection: false,
	      state: PENDING,
	      value: undefined
	    });
	  };

	  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
	    // `Promise.prototype.then` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
	    then: function then(onFulfilled, onRejected) {
	      var state = getInternalPromiseState(this);
	      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = IS_NODE$1 ? process$4.domain : undefined;
	      state.parent = true;
	      state.reactions.push(reaction);
	      if (state.state != PENDING) notify$1(this, state, false);
	      return reaction.promise;
	    },
	    // `Promise.prototype.catch` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });

	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalState(promise);
	    this.promise = promise;
	    this.resolve = bind(internalResolve, promise, state);
	    this.reject = bind(internalReject, promise, state);
	  };

	  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
	  };

	  if ( typeof nativePromiseConstructor == 'function') {
	    nativeThen = nativePromiseConstructor.prototype.then; // wrap native Promise#then for native async functions

	    redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
	      var that = this;
	      return new PromiseConstructor(function (resolve, reject) {
	        nativeThen.call(that, resolve, reject);
	      }).then(onFulfilled, onRejected); // https://github.com/zloirock/core-js/issues/640
	    }, {
	      unsafe: true
	    }); // wrap fetch result

	    if (typeof $fetch == 'function') _export({
	      global: true,
	      enumerable: true,
	      forced: true
	    }, {
	      // eslint-disable-next-line no-unused-vars
	      fetch: function fetch(input
	      /* , init */
	      ) {
	        return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
	      }
	    });
	  }
	}

	_export({
	  global: true,
	  wrap: true,
	  forced: FORCED
	}, {
	  Promise: PromiseConstructor
	});
	setToStringTag(PromiseConstructor, PROMISE, false);
	setSpecies(PROMISE);
	PromiseWrapper = getBuiltIn(PROMISE); // statics

	_export({
	  target: PROMISE,
	  stat: true,
	  forced: FORCED
	}, {
	  // `Promise.reject` method
	  // https://tc39.github.io/ecma262/#sec-promise.reject
	  reject: function reject(r) {
	    var capability = newPromiseCapability$1(this);
	    capability.reject.call(undefined, r);
	    return capability.promise;
	  }
	});
	_export({
	  target: PROMISE,
	  stat: true,
	  forced:  FORCED
	}, {
	  // `Promise.resolve` method
	  // https://tc39.github.io/ecma262/#sec-promise.resolve
	  resolve: function resolve(x) {
	    return promiseResolve( this, x);
	  }
	});
	_export({
	  target: PROMISE,
	  stat: true,
	  forced: INCORRECT_ITERATION
	}, {
	  // `Promise.all` method
	  // https://tc39.github.io/ecma262/#sec-promise.all
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate_1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        $promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  },
	  // `Promise.race` method
	  // https://tc39.github.io/ecma262/#sec-promise.race
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      iterate_1(iterable, function (promise) {
	        $promiseResolve.call(C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	// https://url.spec.whatwg.org/#dom-url-tojson


	_export({
	  target: 'URL',
	  proto: true,
	  enumerable: true
	}, {
	  toJSON: function toJSON() {
	    return URL.prototype.toString.call(this);
	  }
	});

	var runtime_1 = createCommonjsModule(function (module) {
	  /**
	   * Copyright (c) 2014-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   */
	  var runtime = function (exports) {

	    var Op = Object.prototype;
	    var hasOwn = Op.hasOwnProperty;
	    var undefined$1; // More compressible than void 0.

	    var $Symbol = typeof Symbol === "function" ? Symbol : {};
	    var iteratorSymbol = $Symbol.iterator || "@@iterator";
	    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	    function define(obj, key, value) {
	      Object.defineProperty(obj, key, {
	        value: value,
	        enumerable: true,
	        configurable: true,
	        writable: true
	      });
	      return obj[key];
	    }

	    try {
	      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
	      define({}, "");
	    } catch (err) {
	      define = function (obj, key, value) {
	        return obj[key] = value;
	      };
	    }

	    function wrap(innerFn, outerFn, self, tryLocsList) {
	      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	      var generator = Object.create(protoGenerator.prototype);
	      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
	      // .throw, and .return methods.

	      generator._invoke = makeInvokeMethod(innerFn, self, context);
	      return generator;
	    }

	    exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
	    // record like context.tryEntries[i].completion. This interface could
	    // have been (and was previously) designed to take a closure to be
	    // invoked without arguments, but in all the cases we care about we
	    // already have an existing method we want to call, so there's no need
	    // to create a new function object. We can even get away with assuming
	    // the method takes exactly one argument, since that happens to be true
	    // in every case, so we don't have to touch the arguments object. The
	    // only additional allocation required is the completion record, which
	    // has a stable shape and so hopefully should be cheap to allocate.

	    function tryCatch(fn, obj, arg) {
	      try {
	        return {
	          type: "normal",
	          arg: fn.call(obj, arg)
	        };
	      } catch (err) {
	        return {
	          type: "throw",
	          arg: err
	        };
	      }
	    }

	    var GenStateSuspendedStart = "suspendedStart";
	    var GenStateSuspendedYield = "suspendedYield";
	    var GenStateExecuting = "executing";
	    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
	    // breaking out of the dispatch switch statement.

	    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
	    // .constructor.prototype properties for functions that return Generator
	    // objects. For full spec compliance, you may wish to configure your
	    // minifier not to mangle the names of these two functions.

	    function Generator() {}

	    function GeneratorFunction() {}

	    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
	    // don't natively support it.


	    var IteratorPrototype = {};

	    IteratorPrototype[iteratorSymbol] = function () {
	      return this;
	    };

	    var getProto = Object.getPrototypeOf;
	    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

	    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	      // This environment has a native %IteratorPrototype%; use it instead
	      // of the polyfill.
	      IteratorPrototype = NativeIteratorPrototype;
	    }

	    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
	    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	    GeneratorFunctionPrototype.constructor = GeneratorFunction;
	    GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
	    // Iterator interface in terms of a single ._invoke method.

	    function defineIteratorMethods(prototype) {
	      ["next", "throw", "return"].forEach(function (method) {
	        define(prototype, method, function (arg) {
	          return this._invoke(method, arg);
	        });
	      });
	    }

	    exports.isGeneratorFunction = function (genFun) {
	      var ctor = typeof genFun === "function" && genFun.constructor;
	      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
	      // do is to check its .name property.
	      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
	    };

	    exports.mark = function (genFun) {
	      if (Object.setPrototypeOf) {
	        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	      } else {
	        genFun.__proto__ = GeneratorFunctionPrototype;
	        define(genFun, toStringTagSymbol, "GeneratorFunction");
	      }

	      genFun.prototype = Object.create(Gp);
	      return genFun;
	    }; // Within the body of any async function, `await x` is transformed to
	    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	    // `hasOwn.call(value, "__await")` to determine if the yielded value is
	    // meant to be awaited.


	    exports.awrap = function (arg) {
	      return {
	        __await: arg
	      };
	    };

	    function AsyncIterator(generator, PromiseImpl) {
	      function invoke(method, arg, resolve, reject) {
	        var record = tryCatch(generator[method], generator, arg);

	        if (record.type === "throw") {
	          reject(record.arg);
	        } else {
	          var result = record.arg;
	          var value = result.value;

	          if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
	            return PromiseImpl.resolve(value.__await).then(function (value) {
	              invoke("next", value, resolve, reject);
	            }, function (err) {
	              invoke("throw", err, resolve, reject);
	            });
	          }

	          return PromiseImpl.resolve(value).then(function (unwrapped) {
	            // When a yielded Promise is resolved, its final value becomes
	            // the .value of the Promise<{value,done}> result for the
	            // current iteration.
	            result.value = unwrapped;
	            resolve(result);
	          }, function (error) {
	            // If a rejected Promise was yielded, throw the rejection back
	            // into the async generator function so it can be handled there.
	            return invoke("throw", error, resolve, reject);
	          });
	        }
	      }

	      var previousPromise;

	      function enqueue(method, arg) {
	        function callInvokeWithMethodAndArg() {
	          return new PromiseImpl(function (resolve, reject) {
	            invoke(method, arg, resolve, reject);
	          });
	        }

	        return previousPromise = // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
	        // invocations of the iterator.
	        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
	      } // Define the unified helper method that is used to implement .next,
	      // .throw, and .return (see defineIteratorMethods).


	      this._invoke = enqueue;
	    }

	    defineIteratorMethods(AsyncIterator.prototype);

	    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	      return this;
	    };

	    exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
	    // AsyncIterator objects; they just return a Promise for the value of
	    // the final result produced by the iterator.

	    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
	      if (PromiseImpl === void 0) PromiseImpl = Promise;
	      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
	      return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function (result) {
	        return result.done ? result.value : iter.next();
	      });
	    };

	    function makeInvokeMethod(innerFn, self, context) {
	      var state = GenStateSuspendedStart;
	      return function invoke(method, arg) {
	        if (state === GenStateExecuting) {
	          throw new Error("Generator is already running");
	        }

	        if (state === GenStateCompleted) {
	          if (method === "throw") {
	            throw arg;
	          } // Be forgiving, per 25.3.3.3.3 of the spec:
	          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


	          return doneResult();
	        }

	        context.method = method;
	        context.arg = arg;

	        while (true) {
	          var delegate = context.delegate;

	          if (delegate) {
	            var delegateResult = maybeInvokeDelegate(delegate, context);

	            if (delegateResult) {
	              if (delegateResult === ContinueSentinel) continue;
	              return delegateResult;
	            }
	          }

	          if (context.method === "next") {
	            // Setting context._sent for legacy support of Babel's
	            // function.sent implementation.
	            context.sent = context._sent = context.arg;
	          } else if (context.method === "throw") {
	            if (state === GenStateSuspendedStart) {
	              state = GenStateCompleted;
	              throw context.arg;
	            }

	            context.dispatchException(context.arg);
	          } else if (context.method === "return") {
	            context.abrupt("return", context.arg);
	          }

	          state = GenStateExecuting;
	          var record = tryCatch(innerFn, self, context);

	          if (record.type === "normal") {
	            // If an exception is thrown from innerFn, we leave state ===
	            // GenStateExecuting and loop back for another invocation.
	            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

	            if (record.arg === ContinueSentinel) {
	              continue;
	            }

	            return {
	              value: record.arg,
	              done: context.done
	            };
	          } else if (record.type === "throw") {
	            state = GenStateCompleted; // Dispatch the exception by looping back around to the
	            // context.dispatchException(context.arg) call above.

	            context.method = "throw";
	            context.arg = record.arg;
	          }
	        }
	      };
	    } // Call delegate.iterator[context.method](context.arg) and handle the
	    // result, either by returning a { value, done } result from the
	    // delegate iterator, or by modifying context.method and context.arg,
	    // setting context.delegate to null, and returning the ContinueSentinel.


	    function maybeInvokeDelegate(delegate, context) {
	      var method = delegate.iterator[context.method];

	      if (method === undefined$1) {
	        // A .throw or .return when the delegate iterator has no .throw
	        // method always terminates the yield* loop.
	        context.delegate = null;

	        if (context.method === "throw") {
	          // Note: ["return"] must be used for ES3 parsing compatibility.
	          if (delegate.iterator["return"]) {
	            // If the delegate iterator has a return method, give it a
	            // chance to clean up.
	            context.method = "return";
	            context.arg = undefined$1;
	            maybeInvokeDelegate(delegate, context);

	            if (context.method === "throw") {
	              // If maybeInvokeDelegate(context) changed context.method from
	              // "return" to "throw", let that override the TypeError below.
	              return ContinueSentinel;
	            }
	          }

	          context.method = "throw";
	          context.arg = new TypeError("The iterator does not provide a 'throw' method");
	        }

	        return ContinueSentinel;
	      }

	      var record = tryCatch(method, delegate.iterator, context.arg);

	      if (record.type === "throw") {
	        context.method = "throw";
	        context.arg = record.arg;
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      var info = record.arg;

	      if (!info) {
	        context.method = "throw";
	        context.arg = new TypeError("iterator result is not an object");
	        context.delegate = null;
	        return ContinueSentinel;
	      }

	      if (info.done) {
	        // Assign the result of the finished delegate to the temporary
	        // variable specified by delegate.resultName (see delegateYield).
	        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

	        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
	        // exception, let the outer generator proceed normally. If
	        // context.method was "next", forget context.arg since it has been
	        // "consumed" by the delegate iterator. If context.method was
	        // "return", allow the original .return call to continue in the
	        // outer generator.

	        if (context.method !== "return") {
	          context.method = "next";
	          context.arg = undefined$1;
	        }
	      } else {
	        // Re-yield the result returned by the delegate method.
	        return info;
	      } // The delegate iterator is finished, so forget it and continue with
	      // the outer generator.


	      context.delegate = null;
	      return ContinueSentinel;
	    } // Define Generator.prototype.{next,throw,return} in terms of the
	    // unified ._invoke helper method.


	    defineIteratorMethods(Gp);
	    define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
	    // @@iterator function is called on it. Some browsers' implementations of the
	    // iterator prototype chain incorrectly implement this, causing the Generator
	    // object to not be returned from this call. This ensures that doesn't happen.
	    // See https://github.com/facebook/regenerator/issues/274 for more details.

	    Gp[iteratorSymbol] = function () {
	      return this;
	    };

	    Gp.toString = function () {
	      return "[object Generator]";
	    };

	    function pushTryEntry(locs) {
	      var entry = {
	        tryLoc: locs[0]
	      };

	      if (1 in locs) {
	        entry.catchLoc = locs[1];
	      }

	      if (2 in locs) {
	        entry.finallyLoc = locs[2];
	        entry.afterLoc = locs[3];
	      }

	      this.tryEntries.push(entry);
	    }

	    function resetTryEntry(entry) {
	      var record = entry.completion || {};
	      record.type = "normal";
	      delete record.arg;
	      entry.completion = record;
	    }

	    function Context(tryLocsList) {
	      // The root entry object (effectively a try statement without a catch
	      // or a finally block) gives us a place to store values thrown from
	      // locations where there is no enclosing try statement.
	      this.tryEntries = [{
	        tryLoc: "root"
	      }];
	      tryLocsList.forEach(pushTryEntry, this);
	      this.reset(true);
	    }

	    exports.keys = function (object) {
	      var keys = [];

	      for (var key in object) {
	        keys.push(key);
	      }

	      keys.reverse(); // Rather than returning an object with a next method, we keep
	      // things simple and return the next function itself.

	      return function next() {
	        while (keys.length) {
	          var key = keys.pop();

	          if (key in object) {
	            next.value = key;
	            next.done = false;
	            return next;
	          }
	        } // To avoid creating an additional object, we just hang the .value
	        // and .done properties off the next function object itself. This
	        // also ensures that the minifier will not anonymize the function.


	        next.done = true;
	        return next;
	      };
	    };

	    function values(iterable) {
	      if (iterable) {
	        var iteratorMethod = iterable[iteratorSymbol];

	        if (iteratorMethod) {
	          return iteratorMethod.call(iterable);
	        }

	        if (typeof iterable.next === "function") {
	          return iterable;
	        }

	        if (!isNaN(iterable.length)) {
	          var i = -1,
	              next = function next() {
	            while (++i < iterable.length) {
	              if (hasOwn.call(iterable, i)) {
	                next.value = iterable[i];
	                next.done = false;
	                return next;
	              }
	            }

	            next.value = undefined$1;
	            next.done = true;
	            return next;
	          };

	          return next.next = next;
	        }
	      } // Return an iterator with no values.


	      return {
	        next: doneResult
	      };
	    }

	    exports.values = values;

	    function doneResult() {
	      return {
	        value: undefined$1,
	        done: true
	      };
	    }

	    Context.prototype = {
	      constructor: Context,
	      reset: function (skipTempReset) {
	        this.prev = 0;
	        this.next = 0; // Resetting context._sent for legacy support of Babel's
	        // function.sent implementation.

	        this.sent = this._sent = undefined$1;
	        this.done = false;
	        this.delegate = null;
	        this.method = "next";
	        this.arg = undefined$1;
	        this.tryEntries.forEach(resetTryEntry);

	        if (!skipTempReset) {
	          for (var name in this) {
	            // Not sure about the optimal order of these conditions:
	            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
	              this[name] = undefined$1;
	            }
	          }
	        }
	      },
	      stop: function () {
	        this.done = true;
	        var rootEntry = this.tryEntries[0];
	        var rootRecord = rootEntry.completion;

	        if (rootRecord.type === "throw") {
	          throw rootRecord.arg;
	        }

	        return this.rval;
	      },
	      dispatchException: function (exception) {
	        if (this.done) {
	          throw exception;
	        }

	        var context = this;

	        function handle(loc, caught) {
	          record.type = "throw";
	          record.arg = exception;
	          context.next = loc;

	          if (caught) {
	            // If the dispatched exception was caught by a catch block,
	            // then let that catch block handle the exception normally.
	            context.method = "next";
	            context.arg = undefined$1;
	          }

	          return !!caught;
	        }

	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];
	          var record = entry.completion;

	          if (entry.tryLoc === "root") {
	            // Exception thrown outside of any try block that could handle
	            // it, so set the completion value of the entire function to
	            // throw the exception.
	            return handle("end");
	          }

	          if (entry.tryLoc <= this.prev) {
	            var hasCatch = hasOwn.call(entry, "catchLoc");
	            var hasFinally = hasOwn.call(entry, "finallyLoc");

	            if (hasCatch && hasFinally) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              } else if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else if (hasCatch) {
	              if (this.prev < entry.catchLoc) {
	                return handle(entry.catchLoc, true);
	              }
	            } else if (hasFinally) {
	              if (this.prev < entry.finallyLoc) {
	                return handle(entry.finallyLoc);
	              }
	            } else {
	              throw new Error("try statement without catch or finally");
	            }
	          }
	        }
	      },
	      abrupt: function (type, arg) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
	            var finallyEntry = entry;
	            break;
	          }
	        }

	        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
	          // Ignore the finally entry if control is not jumping to a
	          // location outside the try/catch block.
	          finallyEntry = null;
	        }

	        var record = finallyEntry ? finallyEntry.completion : {};
	        record.type = type;
	        record.arg = arg;

	        if (finallyEntry) {
	          this.method = "next";
	          this.next = finallyEntry.finallyLoc;
	          return ContinueSentinel;
	        }

	        return this.complete(record);
	      },
	      complete: function (record, afterLoc) {
	        if (record.type === "throw") {
	          throw record.arg;
	        }

	        if (record.type === "break" || record.type === "continue") {
	          this.next = record.arg;
	        } else if (record.type === "return") {
	          this.rval = this.arg = record.arg;
	          this.method = "return";
	          this.next = "end";
	        } else if (record.type === "normal" && afterLoc) {
	          this.next = afterLoc;
	        }

	        return ContinueSentinel;
	      },
	      finish: function (finallyLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.finallyLoc === finallyLoc) {
	            this.complete(entry.completion, entry.afterLoc);
	            resetTryEntry(entry);
	            return ContinueSentinel;
	          }
	        }
	      },
	      "catch": function (tryLoc) {
	        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	          var entry = this.tryEntries[i];

	          if (entry.tryLoc === tryLoc) {
	            var record = entry.completion;

	            if (record.type === "throw") {
	              var thrown = record.arg;
	              resetTryEntry(entry);
	            }

	            return thrown;
	          }
	        } // The context.catch method must only be called with a location
	        // argument that corresponds to a known catch block.


	        throw new Error("illegal catch attempt");
	      },
	      delegateYield: function (iterable, resultName, nextLoc) {
	        this.delegate = {
	          iterator: values(iterable),
	          resultName: resultName,
	          nextLoc: nextLoc
	        };

	        if (this.method === "next") {
	          // Deliberately forget the last sent value so that we don't
	          // accidentally pass it on to the delegate.
	          this.arg = undefined$1;
	        }

	        return ContinueSentinel;
	      }
	    }; // Regardless of whether this script is executing as a CommonJS module
	    // or not, return the runtime object so that we can declare the variable
	    // regeneratorRuntime in the outer scope, which allows this module to be
	    // injected easily by `bin/regenerator --include-runtime script.js`.

	    return exports;
	  }( // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	   module.exports );

	  try {
	    regeneratorRuntime = runtime;
	  } catch (accidentalStrictMode) {
	    // This module should not be running in strict mode, so the above
	    // assignment should always work unless something is misconfigured. Just
	    // in case runtime.js accidentally runs in strict mode, we can escape
	    // strict mode using a global Function call. This could conceivably fail
	    // if a Content Security Policy forbids using Function, but in that case
	    // the proper solution is to fix the accidental strict mode problem. If
	    // you've misconfigured your bundler to force strict mode and applied a
	    // CSP to forbid Function, and you're not willing to fix either of those
	    // problems, please detail your unique predicament in a GitHub issue.
	    Function("r", "regeneratorRuntime = r")(runtime);
	  }
	});

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	  try {
	    var info = gen[key](arg);
	    var value = info.value;
	  } catch (error) {
	    reject(error);
	    return;
	  }

	  if (info.done) {
	    resolve(value);
	  } else {
	    Promise.resolve(value).then(_next, _throw);
	  }
	}

	function _asyncToGenerator(fn) {
	  return function () {
	    var self = this,
	        args = arguments;
	    return new Promise(function (resolve, reject) {
	      var gen = fn.apply(self, args);

	      function _next(value) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
	      }

	      function _throw(err) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
	      }

	      _next(undefined);
	    });
	  };
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _createForOfIteratorHelper(o, allowArrayLike) {
	  var it;

	  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
	    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
	      if (it) o = it;
	      var i = 0;

	      var F = function () {};

	      return {
	        s: F,
	        n: function () {
	          if (i >= o.length) return {
	            done: true
	          };
	          return {
	            done: false,
	            value: o[i++]
	          };
	        },
	        e: function (e) {
	          throw e;
	        },
	        f: F
	      };
	    }

	    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	  }

	  var normalCompletion = true,
	      didErr = false,
	      err;
	  return {
	    s: function () {
	      it = o[Symbol.iterator]();
	    },
	    n: function () {
	      var step = it.next();
	      normalCompletion = step.done;
	      return step;
	    },
	    e: function (e) {
	      didErr = true;
	      err = e;
	    },
	    f: function () {
	      try {
	        if (!normalCompletion && it.return != null) it.return();
	      } finally {
	        if (didErr) throw err;
	      }
	    }
	  };
	}

	/**
	 * @fileoverview Zlib namespace. Zlib の仕様に準拠した圧縮は Zlib.Deflate で実装
	 * されている. これは Inflate との共存を考慮している為.
	 */
	const ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE = 65000;
	var Zlib = {
	  Huffman: {},
	  Util: {},
	  CRC32: {}
	};
	/**
	 * Compression Method
	 * @enum {number}
	 */

	Zlib.CompressionMethod = {
	  DEFLATE: 8,
	  RESERVED: 15
	};
	/**
	 * @param {Object=} opt_params options.
	 * @constructor
	 */

	Zlib.Zip = function (opt_params) {
	  opt_params = opt_params || {};
	  /** @type {Array.<{
	   *   buffer: !(Array.<number>|Uint8Array),
	   *   option: Object,
	   *   compressed: boolean,
	   *   encrypted: boolean,
	   *   size: number,
	   *   crc32: number
	   * }>} */

	  this.files = [];
	  /** @type {(Array.<number>|Uint8Array)} */

	  this.comment = opt_params['comment'];
	  /** @type {(Array.<number>|Uint8Array)} */

	  this.password;
	};
	/**
	 * @enum {number}
	 */


	Zlib.Zip.CompressionMethod = {
	  STORE: 0,
	  DEFLATE: 8
	};
	/**
	 * @enum {number}
	 */

	Zlib.Zip.OperatingSystem = {
	  MSDOS: 0,
	  UNIX: 3,
	  MACINTOSH: 7
	};
	/**
	 * @enum {number}
	 */

	Zlib.Zip.Flags = {
	  ENCRYPT: 0x0001,
	  DESCRIPTOR: 0x0008,
	  UTF8: 0x0800
	};
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib.Zip.FileHeaderSignature = [0x50, 0x4b, 0x01, 0x02];
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib.Zip.LocalFileHeaderSignature = [0x50, 0x4b, 0x03, 0x04];
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib.Zip.CentralDirectorySignature = [0x50, 0x4b, 0x05, 0x06];
	/**
	 * @param {Array.<number>|Uint8Array} input
	 * @param {Object=} opt_params options.
	 */

	Zlib.Zip.prototype.addFile = function (input, opt_params) {
	  opt_params = opt_params || {};
	  /** @type {string} */

	  var filename =  opt_params['filename'];
	  /** @type {boolean} */

	  var compressed;
	  /** @type {number} */

	  var size = input.length;
	  /** @type {number} */

	  var crc32 = 0;

	  if ( input instanceof Array) {
	    input = new Uint8Array(input);
	  } // default


	  if (typeof opt_params['compressionMethod'] !== 'number') {
	    opt_params['compressionMethod'] = Zlib.Zip.CompressionMethod.DEFLATE;
	  } // その場で圧縮する場合


	  if (opt_params['compress']) {
	    switch (opt_params['compressionMethod']) {
	      case Zlib.Zip.CompressionMethod.STORE:
	        break;

	      case Zlib.Zip.CompressionMethod.DEFLATE:
	        crc32 = Zlib.CRC32.calc(input);
	        input = this.deflateWithOption(input, opt_params);
	        compressed = true;
	        break;

	      default:
	        throw new Error('unknown compression method:' + opt_params['compressionMethod']);
	    }
	  }

	  this.files.push({
	    buffer: input,
	    option: opt_params,
	    compressed: compressed,
	    encrypted: false,
	    size: size,
	    crc32: crc32
	  });
	};
	/**
	 * @param {(Array.<number>|Uint8Array)} password
	 */


	Zlib.Zip.prototype.setPassword = function (password) {
	  this.password = password;
	};

	Zlib.Zip.prototype.compress = function () {
	  /** @type {Array.<{
	   *   buffer: !(Array.<number>|Uint8Array),
	   *   option: Object,
	   *   compressed: boolean,
	   *   encrypted: boolean,
	   *   size: number,
	   *   crc32: number
	   * }>} */
	  var files = this.files;
	  /** @type {{
	   *   buffer: !(Array.<number>|Uint8Array),
	   *   option: Object,
	   *   compressed: boolean,
	   *   encrypted: boolean,
	   *   size: number,
	   *   crc32: number
	   * }} */

	  var file;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var output;
	  /** @type {number} */

	  var op1;
	  /** @type {number} */

	  var op2;
	  /** @type {number} */

	  var op3;
	  /** @type {number} */

	  var localFileSize = 0;
	  /** @type {number} */

	  var centralDirectorySize = 0;
	  /** @type {number} */

	  var endOfCentralDirectorySize;
	  /** @type {number} */

	  var offset;
	  /** @type {number} */

	  var needVersion;
	  /** @type {number} */

	  var flags;
	  /** @type {Zlib.Zip.CompressionMethod} */

	  var compressionMethod;
	  /** @type {Date} */

	  var date;
	  /** @type {number} */

	  var crc32;
	  /** @type {number} */

	  var size;
	  /** @type {number} */

	  var plainSize;
	  /** @type {number} */

	  var filenameLength;
	  /** @type {number} */

	  var extraFieldLength;
	  /** @type {number} */

	  var commentLength;
	  /** @type {(Array.<number>|Uint8Array)} */

	  var filename;
	  /** @type {(Array.<number>|Uint8Array)} */

	  var extraField;
	  /** @type {(Array.<number>|Uint8Array)} */

	  var comment;
	  /** @type {(Array.<number>|Uint8Array)} */

	  var buffer;
	  /** @type {*} */

	  var tmp;
	  /** @type {Array.<number>|Uint32Array|Object} */

	  var key;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;
	  /** @type {number} */

	  var j;
	  /** @type {number} */

	  var jl; // ファイルの圧縮

	  for (i = 0, il = files.length; i < il; ++i) {
	    file = files[i];
	    filenameLength = file.option['filename'] ? file.option['filename'].length : 0;
	    extraFieldLength = file.option['extraField'] ? file.option['extraField'].length : 0;
	    commentLength = file.option['comment'] ? file.option['comment'].length : 0; // 圧縮されていなかったら圧縮

	    if (!file.compressed) {
	      // 圧縮前に CRC32 の計算をしておく
	      file.crc32 = Zlib.CRC32.calc(file.buffer);

	      switch (file.option['compressionMethod']) {
	        case Zlib.Zip.CompressionMethod.STORE:
	          break;

	        case Zlib.Zip.CompressionMethod.DEFLATE:
	          file.buffer = this.deflateWithOption(file.buffer, file.option);
	          file.compressed = true;
	          break;

	        default:
	          throw new Error('unknown compression method:' + file.option['compressionMethod']);
	      }
	    } // encryption


	    if (file.option['password'] !== void 0 || this.password !== void 0) {
	      // init encryption
	      key = this.createEncryptionKey(file.option['password'] || this.password); // add header

	      buffer = file.buffer;

	      {
	        tmp = new Uint8Array(buffer.length + 12);
	        tmp.set(buffer, 12);
	        buffer = tmp;
	      }

	      for (j = 0; j < 12; ++j) {
	        buffer[j] = this.encode(key, i === 11 ? file.crc32 & 0xff : Math.random() * 256 | 0);
	      } // data encryption


	      for (jl = buffer.length; j < jl; ++j) {
	        buffer[j] = this.encode(key, buffer[j]);
	      }

	      file.buffer = buffer;
	    } // 必要バッファサイズの計算


	    localFileSize += // local file header
	    30 + filenameLength + // file data
	    file.buffer.length;
	    centralDirectorySize += // file header
	    46 + filenameLength + commentLength;
	  } // end of central directory


	  endOfCentralDirectorySize = 22 + (this.comment ? this.comment.length : 0);
	  output = new ( Uint8Array )(localFileSize + centralDirectorySize + endOfCentralDirectorySize);
	  op1 = 0;
	  op2 = localFileSize;
	  op3 = op2 + centralDirectorySize; // ファイルの圧縮

	  for (i = 0, il = files.length; i < il; ++i) {
	    file = files[i];
	    filenameLength = file.option['filename'] ? file.option['filename'].length : 0;
	    extraFieldLength = 0; // TODO

	    commentLength = file.option['comment'] ? file.option['comment'].length : 0; //-------------------------------------------------------------------------
	    // local file header & file header
	    //-------------------------------------------------------------------------

	    offset = op1; // signature
	    // local file header

	    output[op1++] = Zlib.Zip.LocalFileHeaderSignature[0];
	    output[op1++] = Zlib.Zip.LocalFileHeaderSignature[1];
	    output[op1++] = Zlib.Zip.LocalFileHeaderSignature[2];
	    output[op1++] = Zlib.Zip.LocalFileHeaderSignature[3]; // file header

	    output[op2++] = Zlib.Zip.FileHeaderSignature[0];
	    output[op2++] = Zlib.Zip.FileHeaderSignature[1];
	    output[op2++] = Zlib.Zip.FileHeaderSignature[2];
	    output[op2++] = Zlib.Zip.FileHeaderSignature[3]; // compressor info

	    needVersion = 20;
	    output[op2++] = needVersion & 0xff;
	    output[op2++] =
	    /** @type {Zlib.Zip.OperatingSystem} */
	    file.option['os'] || Zlib.Zip.OperatingSystem.MSDOS; // need version

	    output[op1++] = output[op2++] = needVersion & 0xff;
	    output[op1++] = output[op2++] = needVersion >> 8 & 0xff; // general purpose bit flag

	    flags = 0;

	    if (file.option['password'] || this.password) {
	      flags |= Zlib.Zip.Flags.ENCRYPT;
	    }

	    output[op1++] = output[op2++] = flags & 0xff;
	    output[op1++] = output[op2++] = flags >> 8 & 0xff; // compression method

	    compressionMethod =
	    /** @type {Zlib.Zip.CompressionMethod} */
	    file.option['compressionMethod'];
	    output[op1++] = output[op2++] = compressionMethod & 0xff;
	    output[op1++] = output[op2++] = compressionMethod >> 8 & 0xff; // date

	    date =
	    /** @type {(Date|undefined)} */
	    file.option['date'] || new Date();
	    output[op1++] = output[op2++] = (date.getMinutes() & 0x7) << 5 | (date.getSeconds() / 2 | 0);
	    output[op1++] = output[op2++] = date.getHours() << 3 | date.getMinutes() >> 3; //

	    output[op1++] = output[op2++] = (date.getMonth() + 1 & 0x7) << 5 | date.getDate();
	    output[op1++] = output[op2++] = (date.getFullYear() - 1980 & 0x7f) << 1 | date.getMonth() + 1 >> 3; // CRC-32

	    crc32 = file.crc32;
	    output[op1++] = output[op2++] = crc32 & 0xff;
	    output[op1++] = output[op2++] = crc32 >> 8 & 0xff;
	    output[op1++] = output[op2++] = crc32 >> 16 & 0xff;
	    output[op1++] = output[op2++] = crc32 >> 24 & 0xff; // compressed size

	    size = file.buffer.length;
	    output[op1++] = output[op2++] = size & 0xff;
	    output[op1++] = output[op2++] = size >> 8 & 0xff;
	    output[op1++] = output[op2++] = size >> 16 & 0xff;
	    output[op1++] = output[op2++] = size >> 24 & 0xff; // uncompressed size

	    plainSize = file.size;
	    output[op1++] = output[op2++] = plainSize & 0xff;
	    output[op1++] = output[op2++] = plainSize >> 8 & 0xff;
	    output[op1++] = output[op2++] = plainSize >> 16 & 0xff;
	    output[op1++] = output[op2++] = plainSize >> 24 & 0xff; // filename length

	    output[op1++] = output[op2++] = filenameLength & 0xff;
	    output[op1++] = output[op2++] = filenameLength >> 8 & 0xff; // extra field length

	    output[op1++] = output[op2++] = extraFieldLength & 0xff;
	    output[op1++] = output[op2++] = extraFieldLength >> 8 & 0xff; // file comment length

	    output[op2++] = commentLength & 0xff;
	    output[op2++] = commentLength >> 8 & 0xff; // disk number start

	    output[op2++] = 0;
	    output[op2++] = 0; // internal file attributes

	    output[op2++] = 0;
	    output[op2++] = 0; // external file attributes

	    output[op2++] = 0;
	    output[op2++] = 0;
	    output[op2++] = 0;
	    output[op2++] = 0; // relative offset of local header

	    output[op2++] = offset & 0xff;
	    output[op2++] = offset >> 8 & 0xff;
	    output[op2++] = offset >> 16 & 0xff;
	    output[op2++] = offset >> 24 & 0xff; // filename

	    filename = file.option['filename'];

	    if (filename) {
	      {
	        output.set(filename, op1);
	        output.set(filename, op2);
	        op1 += filenameLength;
	        op2 += filenameLength;
	      }
	    } // extra field


	    extraField = file.option['extraField'];

	    if (extraField) {
	      {
	        output.set(extraField, op1);
	        output.set(extraField, op2);
	        op1 += extraFieldLength;
	        op2 += extraFieldLength;
	      }
	    } // comment


	    comment = file.option['comment'];

	    if (comment) {
	      {
	        output.set(comment, op2);
	        op2 += commentLength;
	      }
	    } //-------------------------------------------------------------------------
	    // file data
	    //-------------------------------------------------------------------------


	    {
	      output.set(file.buffer, op1);
	      op1 += file.buffer.length;
	    }
	  } //-------------------------------------------------------------------------
	  // end of central directory
	  //-------------------------------------------------------------------------
	  // signature


	  output[op3++] = Zlib.Zip.CentralDirectorySignature[0];
	  output[op3++] = Zlib.Zip.CentralDirectorySignature[1];
	  output[op3++] = Zlib.Zip.CentralDirectorySignature[2];
	  output[op3++] = Zlib.Zip.CentralDirectorySignature[3]; // number of this disk

	  output[op3++] = 0;
	  output[op3++] = 0; // number of the disk with the start of the central directory

	  output[op3++] = 0;
	  output[op3++] = 0; // total number of entries in the central directory on this disk

	  output[op3++] = il & 0xff;
	  output[op3++] = il >> 8 & 0xff; // total number of entries in the central directory

	  output[op3++] = il & 0xff;
	  output[op3++] = il >> 8 & 0xff; // size of the central directory

	  output[op3++] = centralDirectorySize & 0xff;
	  output[op3++] = centralDirectorySize >> 8 & 0xff;
	  output[op3++] = centralDirectorySize >> 16 & 0xff;
	  output[op3++] = centralDirectorySize >> 24 & 0xff; // offset of start of central directory with respect to the starting disk number

	  output[op3++] = localFileSize & 0xff;
	  output[op3++] = localFileSize >> 8 & 0xff;
	  output[op3++] = localFileSize >> 16 & 0xff;
	  output[op3++] = localFileSize >> 24 & 0xff; // .ZIP file comment length

	  commentLength = this.comment ? this.comment.length : 0;
	  output[op3++] = commentLength & 0xff;
	  output[op3++] = commentLength >> 8 & 0xff; // .ZIP file comment

	  if (this.comment) {
	    {
	      output.set(this.comment, op3);
	      op3 += commentLength;
	    }
	  }

	  return output;
	};
	/**
	 * @param {!(Array.<number>|Uint8Array)} input
	 * @param {Object=} opt_params options.
	 * @return {!(Array.<number>|Uint8Array)}
	 */


	Zlib.Zip.prototype.deflateWithOption = function (input, opt_params) {
	  /** @type {Zlib.RawDeflate} */
	  var deflator = new Zlib.RawDeflate(input, opt_params['deflateOption']);
	  return deflator.compress();
	};
	/**
	 * @param {(Array.<number>|Uint32Array)} key
	 * @return {number}
	 */


	Zlib.Zip.prototype.getByte = function (key) {
	  /** @type {number} */
	  var tmp = key[2] & 0xffff | 2;
	  return tmp * (tmp ^ 1) >> 8 & 0xff;
	};
	/**
	 * @param {(Array.<number>|Uint32Array|Object)} key
	 * @param {number} n
	 * @return {number}
	 */


	Zlib.Zip.prototype.encode = function (key, n) {
	  /** @type {number} */
	  var tmp = this.getByte(
	  /** @type {(Array.<number>|Uint32Array)} */
	  key);
	  this.updateKeys(
	  /** @type {(Array.<number>|Uint32Array)} */
	  key, n);
	  return tmp ^ n;
	};
	/**
	 * @param {(Array.<number>|Uint32Array)} key
	 * @param {number} n
	 */


	Zlib.Zip.prototype.updateKeys = function (key, n) {
	  key[0] = Zlib.CRC32.single(key[0], n);
	  key[1] = (((key[1] + (key[0] & 0xff)) * 20173 >>> 0) * 6681 >>> 0) + 1 >>> 0;
	  key[2] = Zlib.CRC32.single(key[2], key[1] >>> 24);
	};
	/**
	 * @param {(Array.<number>|Uint8Array)} password
	 * @return {!(Array.<number>|Uint32Array|Object)}
	 */


	Zlib.Zip.prototype.createEncryptionKey = function (password) {
	  /** @type {!(Array.<number>|Uint32Array)} */
	  var key = [305419896, 591751049, 878082192];
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;

	  {
	    key = new Uint32Array(key);
	  }

	  for (i = 0, il = password.length; i < il; ++i) {
	    this.updateKeys(key, password[i] & 0xff);
	  }

	  return key;
	};
	/**
	 * build huffman table from length list.
	 * @param {!(Array.<number>|Uint8Array)} lengths length list.
	 * @return {!Array} huffman table.
	 */


	Zlib.Huffman.buildHuffmanTable = function (lengths) {
	  /** @type {number} length list size. */
	  var listSize = lengths.length;
	  /** @type {number} max code length for table size. */

	  var maxCodeLength = 0;
	  /** @type {number} min code length for table size. */

	  var minCodeLength = Number.POSITIVE_INFINITY;
	  /** @type {number} table size. */

	  var size;
	  /** @type {!(Array|Uint8Array)} huffman code table. */

	  var table;
	  /** @type {number} bit length. */

	  var bitLength;
	  /** @type {number} huffman code. */

	  var code;
	  /**
	   * サイズが 2^maxlength 個のテーブルを埋めるためのスキップ長.
	   * @type {number} skip length for table filling.
	   */

	  var skip;
	  /** @type {number} reversed code. */

	  var reversed;
	  /** @type {number} reverse temp. */

	  var rtemp;
	  /** @type {number} loop counter. */

	  var i;
	  /** @type {number} loop limit. */

	  var il;
	  /** @type {number} loop counter. */

	  var j;
	  /** @type {number} table value. */

	  var value; // Math.max は遅いので最長の値は for-loop で取得する

	  for (i = 0, il = listSize; i < il; ++i) {
	    if (lengths[i] > maxCodeLength) {
	      maxCodeLength = lengths[i];
	    }

	    if (lengths[i] < minCodeLength) {
	      minCodeLength = lengths[i];
	    }
	  }

	  size = 1 << maxCodeLength;
	  table = new ( Uint32Array )(size); // ビット長の短い順からハフマン符号を割り当てる

	  for (bitLength = 1, code = 0, skip = 2; bitLength <= maxCodeLength;) {
	    for (i = 0; i < listSize; ++i) {
	      if (lengths[i] === bitLength) {
	        // ビットオーダーが逆になるためビット長分並びを反転する
	        for (reversed = 0, rtemp = code, j = 0; j < bitLength; ++j) {
	          reversed = reversed << 1 | rtemp & 1;
	          rtemp >>= 1;
	        } // 最大ビット長をもとにテーブルを作るため、
	        // 最大ビット長以外では 0 / 1 どちらでも良い箇所ができる
	        // そのどちらでも良い場所は同じ値で埋めることで
	        // 本来のビット長以上のビット数取得しても問題が起こらないようにする


	        value = bitLength << 16 | i;

	        for (j = reversed; j < size; j += skip) {
	          table[j] = value;
	        }

	        ++code;
	      }
	    } // 次のビット長へ


	    ++bitLength;
	    code <<= 1;
	    skip <<= 1;
	  }

	  return [table, maxCodeLength, minCodeLength];
	}; //-----------------------------------------------------------------------------

	/** @define {number} buffer block size. */


	var ZLIB_RAW_INFLATE_BUFFER_SIZE = 0x8000; // [ 0x8000 >= ZLIB_BUFFER_BLOCK_SIZE ]
	//-----------------------------------------------------------------------------

	var buildHuffmanTable = Zlib.Huffman.buildHuffmanTable;
	/**
	 * @constructor
	 * @param {!(Uint8Array|Array.<number>)} input input buffer.
	 * @param {Object} opt_params option parameter.
	 *
	 * opt_params は以下のプロパティを指定する事ができます。
	 *   - index: input buffer の deflate コンテナの開始位置.
	 *   - blockSize: バッファのブロックサイズ.
	 *   - bufferType: Zlib.RawInflate.BufferType の値によってバッファの管理方法を指定する.
	 *   - resize: 確保したバッファが実際の大きさより大きかった場合に切り詰める.
	 */

	Zlib.RawInflate = function (input, opt_params) {
	  /** @type {!(Array.<number>|Uint8Array)} inflated buffer */
	  this.buffer;
	  /** @type {!Array.<(Array.<number>|Uint8Array)>} */

	  this.blocks = [];
	  /** @type {number} block size. */

	  this.bufferSize = ZLIB_RAW_INFLATE_BUFFER_SIZE;
	  /** @type {!number} total output buffer pointer. */

	  this.totalpos = 0;
	  /** @type {!number} input buffer pointer. */

	  this.ip = 0;
	  /** @type {!number} bit stream reader buffer. */

	  this.bitsbuf = 0;
	  /** @type {!number} bit stream reader buffer size. */

	  this.bitsbuflen = 0;
	  /** @type {!(Array.<number>|Uint8Array)} input buffer. */

	  this.input =  new Uint8Array(input) ;
	  /** @type {!(Uint8Array|Array.<number>)} output buffer. */

	  this.output;
	  /** @type {!number} output buffer pointer. */

	  this.op;
	  /** @type {boolean} is final block flag. */

	  this.bfinal = false;
	  /** @type {Zlib.RawInflate.BufferType} buffer management. */

	  this.bufferType = Zlib.RawInflate.BufferType.ADAPTIVE;
	  /** @type {boolean} resize flag for memory size optimization. */

	  this.resize = false; // option parameters

	  if (opt_params || !(opt_params = {})) {
	    if (opt_params['index']) {
	      this.ip = opt_params['index'];
	    }

	    if (opt_params['bufferSize']) {
	      this.bufferSize = opt_params['bufferSize'];
	    }

	    if (opt_params['bufferType']) {
	      this.bufferType = opt_params['bufferType'];
	    }

	    if (opt_params['resize']) {
	      this.resize = opt_params['resize'];
	    }
	  } // initialize


	  switch (this.bufferType) {
	    case Zlib.RawInflate.BufferType.BLOCK:
	      this.op = Zlib.RawInflate.MaxBackwardLength;
	      this.output = new ( Uint8Array )(Zlib.RawInflate.MaxBackwardLength + this.bufferSize + Zlib.RawInflate.MaxCopyLength);
	      break;

	    case Zlib.RawInflate.BufferType.ADAPTIVE:
	      this.op = 0;
	      this.output = new ( Uint8Array )(this.bufferSize);
	      break;

	    default:
	      throw new Error('invalid inflate mode');
	  }
	};
	/**
	 * @enum {number}
	 */


	Zlib.RawInflate.BufferType = {
	  BLOCK: 0,
	  ADAPTIVE: 1
	};
	/**
	 * decompress.
	 * @return {!(Uint8Array|Array.<number>)} inflated buffer.
	 */

	Zlib.RawInflate.prototype.decompress = function () {
	  while (!this.bfinal) {
	    this.parseBlock();
	  }

	  switch (this.bufferType) {
	    case Zlib.RawInflate.BufferType.BLOCK:
	      return this.concatBufferBlock();

	    case Zlib.RawInflate.BufferType.ADAPTIVE:
	      return this.concatBufferDynamic();

	    default:
	      throw new Error('invalid inflate mode');
	  }
	};
	/**
	 * @const
	 * @type {number} max backward length for LZ77.
	 */


	Zlib.RawInflate.MaxBackwardLength = 32768;
	/**
	 * @const
	 * @type {number} max copy length for LZ77.
	 */

	Zlib.RawInflate.MaxCopyLength = 258;
	/**
	 * huffman order
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */

	Zlib.RawInflate.Order = function (table) {
	  return  new Uint16Array(table) ;
	}([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
	/**
	 * huffman length code table.
	 * @const
	 * @type {!(Array.<number>|Uint16Array)}
	 */


	Zlib.RawInflate.LengthCodeTable = function (table) {
	  return  new Uint16Array(table) ;
	}([0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b, 0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b, 0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3, 0x00e3, 0x0102, 0x0102, 0x0102]);
	/**
	 * huffman length extra-bits table.
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */


	Zlib.RawInflate.LengthExtraTable = function (table) {
	  return  new Uint8Array(table) ;
	}([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
	/**
	 * huffman dist code table.
	 * @const
	 * @type {!(Array.<number>|Uint16Array)}
	 */


	Zlib.RawInflate.DistCodeTable = function (table) {
	  return  new Uint16Array(table) ;
	}([0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001]);
	/**
	 * huffman dist extra-bits table.
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */


	Zlib.RawInflate.DistExtraTable = function (table) {
	  return  new Uint8Array(table) ;
	}([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
	/**
	 * fixed huffman length code table
	 * @const
	 * @type {!Array}
	 */


	Zlib.RawInflate.FixedLiteralLengthTable = function (table) {
	  return table;
	}(function () {
	  var lengths = new ( Uint8Array )(288);
	  var i, il;

	  for (i = 0, il = lengths.length; i < il; ++i) {
	    lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8;
	  }

	  return buildHuffmanTable(lengths);
	}());
	/**
	 * fixed huffman distance code table
	 * @const
	 * @type {!Array}
	 */


	Zlib.RawInflate.FixedDistanceTable = function (table) {
	  return table;
	}(function () {
	  var lengths = new ( Uint8Array )(30);
	  var i, il;

	  for (i = 0, il = lengths.length; i < il; ++i) {
	    lengths[i] = 5;
	  }

	  return buildHuffmanTable(lengths);
	}());
	/**
	 * parse deflated block.
	 */


	Zlib.RawInflate.prototype.parseBlock = function () {
	  /** @type {number} header */
	  var hdr = this.readBits(3); // BFINAL

	  if (hdr & 0x1) {
	    this.bfinal = true;
	  } // BTYPE


	  hdr >>>= 1;

	  switch (hdr) {
	    // uncompressed
	    case 0:
	      this.parseUncompressedBlock();
	      break;
	    // fixed huffman

	    case 1:
	      this.parseFixedHuffmanBlock();
	      break;
	    // dynamic huffman

	    case 2:
	      this.parseDynamicHuffmanBlock();
	      break;
	    // reserved or other

	    default:
	      throw new Error('unknown BTYPE: ' + hdr);
	  }
	};
	/**
	 * read inflate bits
	 * @param {number} length bits length.
	 * @return {number} read bits.
	 */


	Zlib.RawInflate.prototype.readBits = function (length) {
	  var bitsbuf = this.bitsbuf;
	  var bitsbuflen = this.bitsbuflen;
	  var input = this.input;
	  var ip = this.ip;
	  /** @type {number} */

	  var inputLength = input.length;
	  /** @type {number} input and output byte. */

	  var octet; // input byte

	  if (ip + (length - bitsbuflen + 7 >> 3) >= inputLength) {
	    throw new Error('input buffer is broken');
	  } // not enough buffer


	  while (bitsbuflen < length) {
	    bitsbuf |= input[ip++] << bitsbuflen;
	    bitsbuflen += 8;
	  } // output byte


	  octet = bitsbuf &
	  /* MASK */
	  (1 << length) - 1;
	  bitsbuf >>>= length;
	  bitsbuflen -= length;
	  this.bitsbuf = bitsbuf;
	  this.bitsbuflen = bitsbuflen;
	  this.ip = ip;
	  return octet;
	};
	/**
	 * read huffman code using table
	 * @param {!(Array.<number>|Uint8Array|Uint16Array)} table huffman code table.
	 * @return {number} huffman code.
	 */


	Zlib.RawInflate.prototype.readCodeByTable = function (table) {
	  var bitsbuf = this.bitsbuf;
	  var bitsbuflen = this.bitsbuflen;
	  var input = this.input;
	  var ip = this.ip;
	  /** @type {number} */

	  var inputLength = input.length;
	  /** @type {!(Array.<number>|Uint8Array)} huffman code table */

	  var codeTable = table[0];
	  /** @type {number} */

	  var maxCodeLength = table[1];
	  /** @type {number} code length & code (16bit, 16bit) */

	  var codeWithLength;
	  /** @type {number} code bits length */

	  var codeLength; // not enough buffer

	  while (bitsbuflen < maxCodeLength) {
	    if (ip >= inputLength) {
	      break;
	    }

	    bitsbuf |= input[ip++] << bitsbuflen;
	    bitsbuflen += 8;
	  } // read max length


	  codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
	  codeLength = codeWithLength >>> 16;

	  if (codeLength > bitsbuflen) {
	    throw new Error('invalid code length: ' + codeLength);
	  }

	  this.bitsbuf = bitsbuf >> codeLength;
	  this.bitsbuflen = bitsbuflen - codeLength;
	  this.ip = ip;
	  return codeWithLength & 0xffff;
	};
	/**
	 * parse uncompressed block.
	 */


	Zlib.RawInflate.prototype.parseUncompressedBlock = function () {
	  var input = this.input;
	  var ip = this.ip;
	  var output = this.output;
	  var op = this.op;
	  /** @type {number} */

	  var inputLength = input.length;
	  /** @type {number} block length */

	  var len;
	  /** @type {number} number for check block length */

	  var nlen;
	  /** @type {number} output buffer length */

	  var olength = output.length;
	  /** @type {number} copy counter */

	  var preCopy; // skip buffered header bits

	  this.bitsbuf = 0;
	  this.bitsbuflen = 0; // len

	  if (ip + 1 >= inputLength) {
	    throw new Error('invalid uncompressed block header: LEN');
	  }

	  len = input[ip++] | input[ip++] << 8; // nlen

	  if (ip + 1 >= inputLength) {
	    throw new Error('invalid uncompressed block header: NLEN');
	  }

	  nlen = input[ip++] | input[ip++] << 8; // check len & nlen

	  if (len === ~nlen) {
	    throw new Error('invalid uncompressed block header: length verify');
	  } // check size


	  if (ip + len > input.length) {
	    throw new Error('input buffer is broken');
	  } // expand buffer


	  switch (this.bufferType) {
	    case Zlib.RawInflate.BufferType.BLOCK:
	      // pre copy
	      while (op + len > output.length) {
	        preCopy = olength - op;
	        len -= preCopy;

	        {
	          output.set(input.subarray(ip, ip + preCopy), op);
	          op += preCopy;
	          ip += preCopy;
	        }

	        this.op = op;
	        output = this.expandBufferBlock();
	        op = this.op;
	      }

	      break;

	    case Zlib.RawInflate.BufferType.ADAPTIVE:
	      while (op + len > output.length) {
	        output = this.expandBufferAdaptive({
	          fixRatio: 2
	        });
	      }

	      break;

	    default:
	      throw new Error('invalid inflate mode');
	  } // copy


	  {
	    output.set(input.subarray(ip, ip + len), op);
	    op += len;
	    ip += len;
	  }

	  this.ip = ip;
	  this.op = op;
	  this.output = output;
	};
	/**
	 * parse fixed huffman block.
	 */


	Zlib.RawInflate.prototype.parseFixedHuffmanBlock = function () {
	  switch (this.bufferType) {
	    case Zlib.RawInflate.BufferType.ADAPTIVE:
	      this.decodeHuffmanAdaptive(Zlib.RawInflate.FixedLiteralLengthTable, Zlib.RawInflate.FixedDistanceTable);
	      break;

	    case Zlib.RawInflate.BufferType.BLOCK:
	      this.decodeHuffmanBlock(Zlib.RawInflate.FixedLiteralLengthTable, Zlib.RawInflate.FixedDistanceTable);
	      break;

	    default:
	      throw new Error('invalid inflate mode');
	  }
	};
	/**
	 * parse dynamic huffman block.
	 */


	Zlib.RawInflate.prototype.parseDynamicHuffmanBlock = function () {
	  /** @type {number} number of literal and length codes. */
	  var hlit = this.readBits(5) + 257;
	  /** @type {number} number of distance codes. */

	  var hdist = this.readBits(5) + 1;
	  /** @type {number} number of code lengths. */

	  var hclen = this.readBits(4) + 4;
	  /** @type {!(Uint8Array|Array.<number>)} code lengths. */

	  var codeLengths = new ( Uint8Array )(Zlib.RawInflate.Order.length);
	  /** @type {!Array} code lengths table. */

	  var codeLengthsTable;
	  /** @type {!(Uint8Array|Array.<number>)} literal and length code table. */

	  var litlenTable;
	  /** @type {!(Uint8Array|Array.<number>)} distance code table. */

	  var distTable;
	  /** @type {!(Uint8Array|Array.<number>)} code length table. */

	  var lengthTable;
	  /** @type {number} */

	  var code;
	  /** @type {number} */

	  var prev;
	  /** @type {number} */

	  var repeat;
	  /** @type {number} loop counter. */

	  var i;
	  /** @type {number} loop limit. */

	  var il; // decode code lengths

	  for (i = 0; i < hclen; ++i) {
	    codeLengths[Zlib.RawInflate.Order[i]] = this.readBits(3);
	  }


	  codeLengthsTable = buildHuffmanTable(codeLengths);
	  lengthTable = new ( Uint8Array )(hlit + hdist);

	  for (i = 0, il = hlit + hdist; i < il;) {
	    code = this.readCodeByTable(codeLengthsTable);

	    switch (code) {
	      case 16:
	        repeat = 3 + this.readBits(2);

	        while (repeat--) {
	          lengthTable[i++] = prev;
	        }

	        break;

	      case 17:
	        repeat = 3 + this.readBits(3);

	        while (repeat--) {
	          lengthTable[i++] = 0;
	        }

	        prev = 0;
	        break;

	      case 18:
	        repeat = 11 + this.readBits(7);

	        while (repeat--) {
	          lengthTable[i++] = 0;
	        }

	        prev = 0;
	        break;

	      default:
	        lengthTable[i++] = code;
	        prev = code;
	        break;
	    }
	  }

	  litlenTable =  buildHuffmanTable(lengthTable.subarray(0, hlit)) ;
	  distTable =  buildHuffmanTable(lengthTable.subarray(hlit)) ;

	  switch (this.bufferType) {
	    case Zlib.RawInflate.BufferType.ADAPTIVE:
	      this.decodeHuffmanAdaptive(litlenTable, distTable);
	      break;

	    case Zlib.RawInflate.BufferType.BLOCK:
	      this.decodeHuffmanBlock(litlenTable, distTable);
	      break;

	    default:
	      throw new Error('invalid inflate mode');
	  }
	};
	/**
	 * decode huffman code
	 * @param {!(Array.<number>|Uint16Array)} litlen literal and length code table.
	 * @param {!(Array.<number>|Uint8Array)} dist distination code table.
	 */


	Zlib.RawInflate.prototype.decodeHuffmanBlock = function (litlen, dist) {
	  var output = this.output;
	  var op = this.op;
	  this.currentLitlenTable = litlen;
	  /** @type {number} output position limit. */

	  var olength = output.length - Zlib.RawInflate.MaxCopyLength;
	  /** @type {number} huffman code. */

	  var code;
	  /** @type {number} table index. */

	  var ti;
	  /** @type {number} huffman code distination. */

	  var codeDist;
	  /** @type {number} huffman code length. */

	  var codeLength;
	  var lengthCodeTable = Zlib.RawInflate.LengthCodeTable;
	  var lengthExtraTable = Zlib.RawInflate.LengthExtraTable;
	  var distCodeTable = Zlib.RawInflate.DistCodeTable;
	  var distExtraTable = Zlib.RawInflate.DistExtraTable;

	  while ((code = this.readCodeByTable(litlen)) !== 256) {
	    // literal
	    if (code < 256) {
	      if (op >= olength) {
	        this.op = op;
	        output = this.expandBufferBlock();
	        op = this.op;
	      }

	      output[op++] = code;
	      continue;
	    } // length code


	    ti = code - 257;
	    codeLength = lengthCodeTable[ti];

	    if (lengthExtraTable[ti] > 0) {
	      codeLength += this.readBits(lengthExtraTable[ti]);
	    } // dist code


	    code = this.readCodeByTable(dist);
	    codeDist = distCodeTable[code];

	    if (distExtraTable[code] > 0) {
	      codeDist += this.readBits(distExtraTable[code]);
	    } // lz77 decode


	    if (op >= olength) {
	      this.op = op;
	      output = this.expandBufferBlock();
	      op = this.op;
	    }

	    while (codeLength--) {
	      output[op] = output[op++ - codeDist];
	    }
	  }

	  while (this.bitsbuflen >= 8) {
	    this.bitsbuflen -= 8;
	    this.ip--;
	  }

	  this.op = op;
	};
	/**
	 * decode huffman code (adaptive)
	 * @param {!(Array.<number>|Uint16Array)} litlen literal and length code table.
	 * @param {!(Array.<number>|Uint8Array)} dist distination code table.
	 */


	Zlib.RawInflate.prototype.decodeHuffmanAdaptive = function (litlen, dist) {
	  var output = this.output;
	  var op = this.op;
	  this.currentLitlenTable = litlen;
	  /** @type {number} output position limit. */

	  var olength = output.length;
	  /** @type {number} huffman code. */

	  var code;
	  /** @type {number} table index. */

	  var ti;
	  /** @type {number} huffman code distination. */

	  var codeDist;
	  /** @type {number} huffman code length. */

	  var codeLength;
	  var lengthCodeTable = Zlib.RawInflate.LengthCodeTable;
	  var lengthExtraTable = Zlib.RawInflate.LengthExtraTable;
	  var distCodeTable = Zlib.RawInflate.DistCodeTable;
	  var distExtraTable = Zlib.RawInflate.DistExtraTable;

	  while ((code = this.readCodeByTable(litlen)) !== 256) {
	    // literal
	    if (code < 256) {
	      if (op >= olength) {
	        output = this.expandBufferAdaptive();
	        olength = output.length;
	      }

	      output[op++] = code;
	      continue;
	    } // length code


	    ti = code - 257;
	    codeLength = lengthCodeTable[ti];

	    if (lengthExtraTable[ti] > 0) {
	      codeLength += this.readBits(lengthExtraTable[ti]);
	    } // dist code


	    code = this.readCodeByTable(dist);
	    codeDist = distCodeTable[code];

	    if (distExtraTable[code] > 0) {
	      codeDist += this.readBits(distExtraTable[code]);
	    } // lz77 decode


	    if (op + codeLength > olength) {
	      output = this.expandBufferAdaptive();
	      olength = output.length;
	    }

	    while (codeLength--) {
	      output[op] = output[op++ - codeDist];
	    }
	  }

	  while (this.bitsbuflen >= 8) {
	    this.bitsbuflen -= 8;
	    this.ip--;
	  }

	  this.op = op;
	};
	/**
	 * expand output buffer.
	 * @param {Object=} opt_param option parameters.
	 * @return {!(Array.<number>|Uint8Array)} output buffer.
	 */


	Zlib.RawInflate.prototype.expandBufferBlock = function (opt_param) {
	  /** @type {!(Array.<number>|Uint8Array)} store buffer. */
	  var buffer = new ( Uint8Array )(this.op - Zlib.RawInflate.MaxBackwardLength);
	  /** @type {number} backward base point */

	  var backward = this.op - Zlib.RawInflate.MaxBackwardLength;
	  var output = this.output; // copy to output buffer

	  {
	    buffer.set(output.subarray(Zlib.RawInflate.MaxBackwardLength, buffer.length));
	  }

	  this.blocks.push(buffer);
	  this.totalpos += buffer.length; // copy to backward buffer

	  {
	    output.set(output.subarray(backward, backward + Zlib.RawInflate.MaxBackwardLength));
	  }

	  this.op = Zlib.RawInflate.MaxBackwardLength;
	  return output;
	};
	/**
	 * expand output buffer. (adaptive)
	 * @param {Object=} opt_param option parameters.
	 * @return {!(Array.<number>|Uint8Array)} output buffer pointer.
	 */


	Zlib.RawInflate.prototype.expandBufferAdaptive = function (opt_param) {
	  /** @type {!(Array.<number>|Uint8Array)} store buffer. */
	  var buffer;
	  /** @type {number} expantion ratio. */

	  var ratio = this.input.length / this.ip + 1 | 0;
	  /** @type {number} maximum number of huffman code. */

	  var maxHuffCode;
	  /** @type {number} new output buffer size. */

	  var newSize;
	  /** @type {number} max inflate size. */

	  var maxInflateSize;
	  var input = this.input;
	  var output = this.output;

	  if (opt_param) {
	    if (typeof opt_param.fixRatio === 'number') {
	      ratio = opt_param.fixRatio;
	    }

	    if (typeof opt_param.addRatio === 'number') {
	      ratio += opt_param.addRatio;
	    }
	  } // calculate new buffer size


	  if (ratio < 2) {
	    maxHuffCode = (input.length - this.ip) / this.currentLitlenTable[2];
	    maxInflateSize = maxHuffCode / 2 * 258 | 0;
	    newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1;
	  } else {
	    newSize = output.length * ratio;
	  } // buffer expantion


	  {
	    buffer = new Uint8Array(newSize);
	    buffer.set(output);
	  }

	  this.output = buffer;
	  return this.output;
	};
	/**
	 * concat output buffer.
	 * @return {!(Array.<number>|Uint8Array)} output buffer.
	 */


	Zlib.RawInflate.prototype.concatBufferBlock = function () {
	  /** @type {number} buffer pointer. */
	  var pos = 0;
	  /** @type {number} buffer pointer. */

	  var limit = this.totalpos + (this.op - Zlib.RawInflate.MaxBackwardLength);
	  /** @type {!(Array.<number>|Uint8Array)} output block array. */

	  var output = this.output;
	  /** @type {!Array} blocks array. */

	  var blocks = this.blocks;
	  /** @type {!(Array.<number>|Uint8Array)} output block array. */

	  var block;
	  /** @type {!(Array.<number>|Uint8Array)} output buffer. */

	  var buffer = new ( Uint8Array )(limit);
	  /** @type {number} loop counter. */

	  var i;
	  /** @type {number} loop limiter. */

	  var il;
	  /** @type {number} loop counter. */

	  var j;
	  /** @type {number} loop limiter. */

	  var jl; // single buffer

	  if (blocks.length === 0) {
	    return  this.output.subarray(Zlib.RawInflate.MaxBackwardLength, this.op) ;
	  } // copy to buffer


	  for (i = 0, il = blocks.length; i < il; ++i) {
	    block = blocks[i];

	    for (j = 0, jl = block.length; j < jl; ++j) {
	      buffer[pos++] = block[j];
	    }
	  } // current buffer


	  for (i = Zlib.RawInflate.MaxBackwardLength, il = this.op; i < il; ++i) {
	    buffer[pos++] = output[i];
	  }

	  this.blocks = [];
	  this.buffer = buffer;
	  return this.buffer;
	};
	/**
	 * concat output buffer. (dynamic)
	 * @return {!(Array.<number>|Uint8Array)} output buffer.
	 */


	Zlib.RawInflate.prototype.concatBufferDynamic = function () {
	  /** @type {Array.<number>|Uint8Array} output buffer. */
	  var buffer;
	  var op = this.op;

	  {
	    if (this.resize) {
	      buffer = new Uint8Array(op);
	      buffer.set(this.output.subarray(0, op));
	    } else {
	      buffer = this.output.subarray(0, op);
	    }
	  }

	  this.buffer = buffer;
	  return this.buffer;
	};

	var buildHuffmanTable = Zlib.Huffman.buildHuffmanTable;
	/**
	 * @param {!(Uint8Array|Array.<number>)} input input buffer.
	 * @param {number} ip input buffer pointer.
	 * @param {number=} opt_buffersize buffer block size.
	 * @constructor
	 */

	Zlib.RawInflateStream = function (input, ip, opt_buffersize) {
	  /** @type {!Array.<(Array|Uint8Array)>} */
	  this.blocks = [];
	  /** @type {number} block size. */

	  this.bufferSize = opt_buffersize ? opt_buffersize : ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE;
	  /** @type {!number} total output buffer pointer. */

	  this.totalpos = 0;
	  /** @type {!number} input buffer pointer. */

	  this.ip = ip === void 0 ? 0 : ip;
	  /** @type {!number} bit stream reader buffer. */

	  this.bitsbuf = 0;
	  /** @type {!number} bit stream reader buffer size. */

	  this.bitsbuflen = 0;
	  /** @type {!(Array|Uint8Array)} input buffer. */

	  this.input =  new Uint8Array(input) ;
	  /** @type {!(Uint8Array|Array)} output buffer. */

	  this.output = new ( Uint8Array )(this.bufferSize);
	  /** @type {!number} output buffer pointer. */

	  this.op = 0;
	  /** @type {boolean} is final block flag. */

	  this.bfinal = false;
	  /** @type {number} uncompressed block length. */

	  this.blockLength;
	  /** @type {boolean} resize flag for memory size optimization. */

	  this.resize = false;
	  /** @type {Array} */

	  this.litlenTable;
	  /** @type {Array} */

	  this.distTable;
	  /** @type {number} */

	  this.sp = 0; // stream pointer

	  /** @type {Zlib.RawInflateStream.Status} */

	  this.status = Zlib.RawInflateStream.Status.INITIALIZED; //
	  // backup
	  //

	  /** @type {!number} */

	  this.ip_;
	  /** @type {!number} */

	  this.bitsbuflen_;
	  /** @type {!number} */

	  this.bitsbuf_;
	};
	/**
	 * @enum {number}
	 */


	Zlib.RawInflateStream.BlockType = {
	  UNCOMPRESSED: 0,
	  FIXED: 1,
	  DYNAMIC: 2
	};
	/**
	 * @enum {number}
	 */

	Zlib.RawInflateStream.Status = {
	  INITIALIZED: 0,
	  BLOCK_HEADER_START: 1,
	  BLOCK_HEADER_END: 2,
	  BLOCK_BODY_START: 3,
	  BLOCK_BODY_END: 4,
	  DECODE_BLOCK_START: 5,
	  DECODE_BLOCK_END: 6
	};
	/**
	 * decompress.
	 * @return {!(Uint8Array|Array)} inflated buffer.
	 */

	Zlib.RawInflateStream.prototype.decompress = function (newInput, ip) {
	  /** @type {boolean} */
	  var stop = false;

	  if (newInput !== void 0) {
	    this.input = newInput;
	  }

	  if (ip !== void 0) {
	    this.ip = ip;
	  } // decompress


	  while (!stop) {
	    switch (this.status) {
	      // block header
	      case Zlib.RawInflateStream.Status.INITIALIZED:
	      case Zlib.RawInflateStream.Status.BLOCK_HEADER_START:
	        if (this.readBlockHeader() < 0) {
	          stop = true;
	        }

	        break;
	      // block body

	      case Zlib.RawInflateStream.Status.BLOCK_HEADER_END:
	      /* FALLTHROUGH */

	      case Zlib.RawInflateStream.Status.BLOCK_BODY_START:
	        switch (this.currentBlockType) {
	          case Zlib.RawInflateStream.BlockType.UNCOMPRESSED:
	            if (this.readUncompressedBlockHeader() < 0) {
	              stop = true;
	            }

	            break;

	          case Zlib.RawInflateStream.BlockType.FIXED:
	            if (this.parseFixedHuffmanBlock() < 0) {
	              stop = true;
	            }

	            break;

	          case Zlib.RawInflateStream.BlockType.DYNAMIC:
	            if (this.parseDynamicHuffmanBlock() < 0) {
	              stop = true;
	            }

	            break;
	        }

	        break;
	      // decode data

	      case Zlib.RawInflateStream.Status.BLOCK_BODY_END:
	      case Zlib.RawInflateStream.Status.DECODE_BLOCK_START:
	        switch (this.currentBlockType) {
	          case Zlib.RawInflateStream.BlockType.UNCOMPRESSED:
	            if (this.parseUncompressedBlock() < 0) {
	              stop = true;
	            }

	            break;

	          case Zlib.RawInflateStream.BlockType.FIXED:
	          /* FALLTHROUGH */

	          case Zlib.RawInflateStream.BlockType.DYNAMIC:
	            if (this.decodeHuffman() < 0) {
	              stop = true;
	            }

	            break;
	        }

	        break;

	      case Zlib.RawInflateStream.Status.DECODE_BLOCK_END:
	        if (this.bfinal) {
	          stop = true;
	        } else {
	          this.status = Zlib.RawInflateStream.Status.INITIALIZED;
	        }

	        break;
	    }
	  }

	  return this.concatBuffer();
	};
	/**
	 * @const
	 * @type {number} max backward length for LZ77.
	 */


	Zlib.RawInflateStream.MaxBackwardLength = 32768;
	/**
	 * @const
	 * @type {number} max copy length for LZ77.
	 */

	Zlib.RawInflateStream.MaxCopyLength = 258;
	/**
	 * huffman order
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */

	Zlib.RawInflateStream.Order = function (table) {
	  return  new Uint16Array(table) ;
	}([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
	/**
	 * huffman length code table.
	 * @const
	 * @type {!(Array.<number>|Uint16Array)}
	 */


	Zlib.RawInflateStream.LengthCodeTable = function (table) {
	  return  new Uint16Array(table) ;
	}([0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b, 0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b, 0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3, 0x00e3, 0x0102, 0x0102, 0x0102]);
	/**
	 * huffman length extra-bits table.
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */


	Zlib.RawInflateStream.LengthExtraTable = function (table) {
	  return  new Uint8Array(table) ;
	}([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
	/**
	 * huffman dist code table.
	 * @const
	 * @type {!(Array.<number>|Uint16Array)}
	 */


	Zlib.RawInflateStream.DistCodeTable = function (table) {
	  return  new Uint16Array(table) ;
	}([0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001]);
	/**
	 * huffman dist extra-bits table.
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */


	Zlib.RawInflateStream.DistExtraTable = function (table) {
	  return  new Uint8Array(table) ;
	}([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
	/**
	 * fixed huffman length code table
	 * @const
	 * @type {!Array}
	 */


	Zlib.RawInflateStream.FixedLiteralLengthTable = function (table) {
	  return table;
	}(function () {
	  var lengths = new ( Uint8Array )(288);
	  var i, il;

	  for (i = 0, il = lengths.length; i < il; ++i) {
	    lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8;
	  }

	  return buildHuffmanTable(lengths);
	}());
	/**
	 * fixed huffman distance code table
	 * @const
	 * @type {!Array}
	 */


	Zlib.RawInflateStream.FixedDistanceTable = function (table) {
	  return table;
	}(function () {
	  var lengths = new ( Uint8Array )(30);
	  var i, il;

	  for (i = 0, il = lengths.length; i < il; ++i) {
	    lengths[i] = 5;
	  }

	  return buildHuffmanTable(lengths);
	}());
	/**
	 * parse deflated block.
	 */


	Zlib.RawInflateStream.prototype.readBlockHeader = function () {
	  /** @type {number} header */
	  var hdr;
	  this.status = Zlib.RawInflateStream.Status.BLOCK_HEADER_START;
	  this.save_();

	  if ((hdr = this.readBits(3)) < 0) {
	    this.restore_();
	    return -1;
	  } // BFINAL


	  if (hdr & 0x1) {
	    this.bfinal = true;
	  } // BTYPE


	  hdr >>>= 1;

	  switch (hdr) {
	    case 0:
	      // uncompressed
	      this.currentBlockType = Zlib.RawInflateStream.BlockType.UNCOMPRESSED;
	      break;

	    case 1:
	      // fixed huffman
	      this.currentBlockType = Zlib.RawInflateStream.BlockType.FIXED;
	      break;

	    case 2:
	      // dynamic huffman
	      this.currentBlockType = Zlib.RawInflateStream.BlockType.DYNAMIC;
	      break;

	    default:
	      // reserved or other
	      throw new Error('unknown BTYPE: ' + hdr);
	  }

	  this.status = Zlib.RawInflateStream.Status.BLOCK_HEADER_END;
	};
	/**
	 * read inflate bits
	 * @param {number} length bits length.
	 * @return {number} read bits.
	 */


	Zlib.RawInflateStream.prototype.readBits = function (length) {
	  var bitsbuf = this.bitsbuf;
	  var bitsbuflen = this.bitsbuflen;
	  var input = this.input;
	  var ip = this.ip;
	  /** @type {number} input and output byte. */

	  var octet; // not enough buffer

	  while (bitsbuflen < length) {
	    // input byte
	    if (input.length <= ip) {
	      return -1;
	    }

	    octet = input[ip++]; // concat octet

	    bitsbuf |= octet << bitsbuflen;
	    bitsbuflen += 8;
	  } // output byte


	  octet = bitsbuf &
	  /* MASK */
	  (1 << length) - 1;
	  bitsbuf >>>= length;
	  bitsbuflen -= length;
	  this.bitsbuf = bitsbuf;
	  this.bitsbuflen = bitsbuflen;
	  this.ip = ip;
	  return octet;
	};
	/**
	 * read huffman code using table
	 * @param {Array} table huffman code table.
	 * @return {number} huffman code.
	 */


	Zlib.RawInflateStream.prototype.readCodeByTable = function (table) {
	  var bitsbuf = this.bitsbuf;
	  var bitsbuflen = this.bitsbuflen;
	  var input = this.input;
	  var ip = this.ip;
	  /** @type {!(Array|Uint8Array)} huffman code table */

	  var codeTable = table[0];
	  /** @type {number} */

	  var maxCodeLength = table[1];
	  /** @type {number} input byte */

	  var octet;
	  /** @type {number} code length & code (16bit, 16bit) */

	  var codeWithLength;
	  /** @type {number} code bits length */

	  var codeLength; // not enough buffer

	  while (bitsbuflen < maxCodeLength) {
	    if (input.length <= ip) {
	      return -1;
	    }

	    octet = input[ip++];
	    bitsbuf |= octet << bitsbuflen;
	    bitsbuflen += 8;
	  } // read max length


	  codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
	  codeLength = codeWithLength >>> 16;

	  if (codeLength > bitsbuflen) {
	    throw new Error('invalid code length: ' + codeLength);
	  }

	  this.bitsbuf = bitsbuf >> codeLength;
	  this.bitsbuflen = bitsbuflen - codeLength;
	  this.ip = ip;
	  return codeWithLength & 0xffff;
	};
	/**
	 * read uncompressed block header
	 */


	Zlib.RawInflateStream.prototype.readUncompressedBlockHeader = function () {
	  /** @type {number} block length */
	  var len;
	  /** @type {number} number for check block length */

	  var nlen;
	  var input = this.input;
	  var ip = this.ip;
	  this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;

	  if (ip + 4 >= input.length) {
	    return -1;
	  }

	  len = input[ip++] | input[ip++] << 8;
	  nlen = input[ip++] | input[ip++] << 8; // check len & nlen

	  if (len === ~nlen) {
	    throw new Error('invalid uncompressed block header: length verify');
	  } // skip buffered header bits


	  this.bitsbuf = 0;
	  this.bitsbuflen = 0;
	  this.ip = ip;
	  this.blockLength = len;
	  this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
	};
	/**
	 * parse uncompressed block.
	 */


	Zlib.RawInflateStream.prototype.parseUncompressedBlock = function () {
	  var input = this.input;
	  var ip = this.ip;
	  var output = this.output;
	  var op = this.op;
	  var len = this.blockLength;
	  this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_START; // copy
	  // XXX: とりあえず素直にコピー

	  while (len--) {
	    if (op === output.length) {
	      output = this.expandBuffer({
	        fixRatio: 2
	      });
	    } // not enough input buffer


	    if (ip >= input.length) {
	      this.ip = ip;
	      this.op = op;
	      this.blockLength = len + 1; // コピーしてないので戻す

	      return -1;
	    }

	    output[op++] = input[ip++];
	  }

	  if (len < 0) {
	    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_END;
	  }

	  this.ip = ip;
	  this.op = op;
	  return 0;
	};
	/**
	 * parse fixed huffman block.
	 */


	Zlib.RawInflateStream.prototype.parseFixedHuffmanBlock = function () {
	  this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
	  this.litlenTable = Zlib.RawInflateStream.FixedLiteralLengthTable;
	  this.distTable = Zlib.RawInflateStream.FixedDistanceTable;
	  this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
	  return 0;
	};
	/**
	 * オブジェクトのコンテキストを別のプロパティに退避する.
	 * @private
	 */


	Zlib.RawInflateStream.prototype.save_ = function () {
	  this.ip_ = this.ip;
	  this.bitsbuflen_ = this.bitsbuflen;
	  this.bitsbuf_ = this.bitsbuf;
	};
	/**
	 * 別のプロパティに退避したコンテキストを復元する.
	 * @private
	 */


	Zlib.RawInflateStream.prototype.restore_ = function () {
	  this.ip = this.ip_;
	  this.bitsbuflen = this.bitsbuflen_;
	  this.bitsbuf = this.bitsbuf_;
	};
	/**
	 * parse dynamic huffman block.
	 */


	Zlib.RawInflateStream.prototype.parseDynamicHuffmanBlock = function () {
	  /** @type {number} number of literal and length codes. */
	  var hlit;
	  /** @type {number} number of distance codes. */

	  var hdist;
	  /** @type {number} number of code lengths. */

	  var hclen;
	  /** @type {!(Uint8Array|Array)} code lengths. */

	  var codeLengths = new ( Uint8Array )(Zlib.RawInflateStream.Order.length);
	  /** @type {!Array} code lengths table. */

	  var codeLengthsTable;
	  this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
	  this.save_();
	  hlit = this.readBits(5) + 257;
	  hdist = this.readBits(5) + 1;
	  hclen = this.readBits(4) + 4;

	  if (hlit < 0 || hdist < 0 || hclen < 0) {
	    this.restore_();
	    return -1;
	  }

	  try {
	    parseDynamicHuffmanBlockImpl.call(this);
	  } catch (e) {
	    this.restore_();
	    return -1;
	  }

	  function parseDynamicHuffmanBlockImpl() {
	    /** @type {number} */
	    var bits;
	    var code;
	    var prev = 0;
	    var repeat;
	    /** @type {!(Uint8Array|Array.<number>)} code length table. */

	    var lengthTable;
	    /** @type {number} loop counter. */

	    var i;
	    /** @type {number} loop limit. */

	    var il; // decode code lengths

	    for (i = 0; i < hclen; ++i) {
	      if ((bits = this.readBits(3)) < 0) {
	        throw new Error('not enough input');
	      }

	      codeLengths[Zlib.RawInflateStream.Order[i]] = bits;
	    } // decode length table


	    codeLengthsTable = buildHuffmanTable(codeLengths);
	    lengthTable = new ( Uint8Array )(hlit + hdist);

	    for (i = 0, il = hlit + hdist; i < il;) {
	      code = this.readCodeByTable(codeLengthsTable);

	      if (code < 0) {
	        throw new Error('not enough input');
	      }

	      switch (code) {
	        case 16:
	          if ((bits = this.readBits(2)) < 0) {
	            throw new Error('not enough input');
	          }

	          repeat = 3 + bits;

	          while (repeat--) {
	            lengthTable[i++] = prev;
	          }

	          break;

	        case 17:
	          if ((bits = this.readBits(3)) < 0) {
	            throw new Error('not enough input');
	          }

	          repeat = 3 + bits;

	          while (repeat--) {
	            lengthTable[i++] = 0;
	          }

	          prev = 0;
	          break;

	        case 18:
	          if ((bits = this.readBits(7)) < 0) {
	            throw new Error('not enough input');
	          }

	          repeat = 11 + bits;

	          while (repeat--) {
	            lengthTable[i++] = 0;
	          }

	          prev = 0;
	          break;

	        default:
	          lengthTable[i++] = code;
	          prev = code;
	          break;
	      }
	    } // literal and length code
	    this.litlenTable =  buildHuffmanTable(lengthTable.subarray(0, hlit)) ;
	    this.distTable =  buildHuffmanTable(lengthTable.subarray(hlit)) ;
	  }

	  this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
	  return 0;
	};
	/**
	 * decode huffman code (dynamic)
	 * @return {(number|undefined)} -1 is error.
	 */


	Zlib.RawInflateStream.prototype.decodeHuffman = function () {
	  var output = this.output;
	  var op = this.op;
	  /** @type {number} huffman code. */

	  var code;
	  /** @type {number} table index. */

	  var ti;
	  /** @type {number} huffman code distination. */

	  var codeDist;
	  /** @type {number} huffman code length. */

	  var codeLength;
	  var litlen = this.litlenTable;
	  var dist = this.distTable;
	  var olength = output.length;
	  var bits;
	  this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_START;

	  while (true) {
	    this.save_();
	    code = this.readCodeByTable(litlen);

	    if (code < 0) {
	      this.op = op;
	      this.restore_();
	      return -1;
	    }

	    if (code === 256) {
	      break;
	    } // literal


	    if (code < 256) {
	      if (op === olength) {
	        output = this.expandBuffer();
	        olength = output.length;
	      }

	      output[op++] = code;
	      continue;
	    } // length code


	    ti = code - 257;
	    codeLength = Zlib.RawInflateStream.LengthCodeTable[ti];

	    if (Zlib.RawInflateStream.LengthExtraTable[ti] > 0) {
	      bits = this.readBits(Zlib.RawInflateStream.LengthExtraTable[ti]);

	      if (bits < 0) {
	        this.op = op;
	        this.restore_();
	        return -1;
	      }

	      codeLength += bits;
	    } // dist code


	    code = this.readCodeByTable(dist);

	    if (code < 0) {
	      this.op = op;
	      this.restore_();
	      return -1;
	    }

	    codeDist = Zlib.RawInflateStream.DistCodeTable[code];

	    if (Zlib.RawInflateStream.DistExtraTable[code] > 0) {
	      bits = this.readBits(Zlib.RawInflateStream.DistExtraTable[code]);

	      if (bits < 0) {
	        this.op = op;
	        this.restore_();
	        return -1;
	      }

	      codeDist += bits;
	    } // lz77 decode


	    if (op + codeLength >= olength) {
	      output = this.expandBuffer();
	      olength = output.length;
	    }

	    while (codeLength--) {
	      output[op] = output[op++ - codeDist];
	    } // break


	    if (this.ip === this.input.length) {
	      this.op = op;
	      return -1;
	    }
	  }

	  while (this.bitsbuflen >= 8) {
	    this.bitsbuflen -= 8;
	    this.ip--;
	  }

	  this.op = op;
	  this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_END;
	};
	/**
	 * expand output buffer. (dynamic)
	 * @param {Object=} opt_param option parameters.
	 * @return {!(Array|Uint8Array)} output buffer pointer.
	 */


	Zlib.RawInflateStream.prototype.expandBuffer = function (opt_param) {
	  /** @type {!(Array|Uint8Array)} store buffer. */
	  var buffer;
	  /** @type {number} expantion ratio. */

	  var ratio = this.input.length / this.ip + 1 | 0;
	  /** @type {number} maximum number of huffman code. */

	  var maxHuffCode;
	  /** @type {number} new output buffer size. */

	  var newSize;
	  /** @type {number} max inflate size. */

	  var maxInflateSize;
	  var input = this.input;
	  var output = this.output;

	  if (opt_param) {
	    if (typeof opt_param.fixRatio === 'number') {
	      ratio = opt_param.fixRatio;
	    }

	    if (typeof opt_param.addRatio === 'number') {
	      ratio += opt_param.addRatio;
	    }
	  } // calculate new buffer size


	  if (ratio < 2) {
	    maxHuffCode = (input.length - this.ip) / this.litlenTable[2];
	    maxInflateSize = maxHuffCode / 2 * 258 | 0;
	    newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1;
	  } else {
	    newSize = output.length * ratio;
	  } // buffer expantion


	  {
	    buffer = new Uint8Array(newSize);
	    buffer.set(output);
	  }

	  this.output = buffer;
	  return this.output;
	};
	/**
	 * concat output buffer. (dynamic)
	 * @return {!(Array|Uint8Array)} output buffer.
	 */


	Zlib.RawInflateStream.prototype.concatBuffer = function () {
	  /** @type {!(Array|Uint8Array)} output buffer. */
	  var buffer;
	  /** @type {number} */

	  var op = this.op;
	  /** @type {Uint8Array} */

	  var tmp;

	  if (this.resize) {
	    {
	      buffer = new Uint8Array(this.output.subarray(this.sp, op));
	    }
	  } else {
	    buffer =  this.output.subarray(this.sp, op) ;
	  }

	  this.sp = op; // compaction

	  if (op > Zlib.RawInflateStream.MaxBackwardLength + this.bufferSize) {
	    this.op = this.sp = Zlib.RawInflateStream.MaxBackwardLength;

	    {
	      tmp =
	      /** @type {Uint8Array} */
	      this.output;
	      this.output = new Uint8Array(this.bufferSize + Zlib.RawInflateStream.MaxBackwardLength);
	      this.output.set(tmp.subarray(op - Zlib.RawInflateStream.MaxBackwardLength, op));
	    }
	  }

	  return buffer;
	};
	/**
	 * @constructor
	 * @param {!(Uint8Array|Array)} input deflated buffer.
	 * @param {Object=} opt_params option parameters.
	 *
	 * opt_params は以下のプロパティを指定する事ができます。
	 *   - index: input buffer の deflate コンテナの開始位置.
	 *   - blockSize: バッファのブロックサイズ.
	 *   - verify: 伸張が終わった後 adler-32 checksum の検証を行うか.
	 *   - bufferType: Zlib.Inflate.BufferType の値によってバッファの管理方法を指定する.
	 *       Zlib.Inflate.BufferType は Zlib.RawInflate.BufferType のエイリアス.
	 */


	Zlib.Inflate = function (input, opt_params) {
	  /** @type {number} */

	  var cmf;
	  /** @type {number} */

	  var flg;
	  /** @type {!(Uint8Array|Array)} */

	  this.input = input;
	  /** @type {number} */

	  this.ip = 0;
	  /** @type {Zlib.RawInflate} */

	  this.rawinflate;
	  /** @type {(boolean|undefined)} verify flag. */

	  this.verify; // option parameters

	  if (opt_params || !(opt_params = {})) {
	    if (opt_params['index']) {
	      this.ip = opt_params['index'];
	    }

	    if (opt_params['verify']) {
	      this.verify = opt_params['verify'];
	    }
	  } // Compression Method and Flags


	  cmf = input[this.ip++];
	  flg = input[this.ip++]; // compression method

	  switch (cmf & 0x0f) {
	    case Zlib.CompressionMethod.DEFLATE:
	      this.method = Zlib.CompressionMethod.DEFLATE;
	      break;

	    default:
	      throw new Error('unsupported compression method');
	  } // fcheck


	  if (((cmf << 8) + flg) % 31 !== 0) {
	    throw new Error('invalid fcheck flag:' + ((cmf << 8) + flg) % 31);
	  } // fdict (not supported)


	  if (flg & 0x20) {
	    throw new Error('fdict flag is not supported');
	  } // RawInflate


	  this.rawinflate = new Zlib.RawInflate(input, {
	    'index': this.ip,
	    'bufferSize': opt_params['bufferSize'],
	    'bufferType': opt_params['bufferType'],
	    'resize': opt_params['resize']
	  });
	};
	/**
	 * @enum {number}
	 */


	Zlib.Inflate.BufferType = Zlib.RawInflate.BufferType;
	/**
	 * decompress.
	 * @return {!(Uint8Array|Array)} inflated buffer.
	 */

	Zlib.Inflate.prototype.decompress = function () {
	  /** @type {!(Array|Uint8Array)} input buffer. */
	  var input = this.input;
	  /** @type {!(Uint8Array|Array)} inflated buffer. */

	  var buffer;
	  /** @type {number} adler-32 checksum */

	  var adler32;
	  buffer = this.rawinflate.decompress();
	  this.ip = this.rawinflate.ip; // verify adler-32

	  if (this.verify) {
	    adler32 = (input[this.ip++] << 24 | input[this.ip++] << 16 | input[this.ip++] << 8 | input[this.ip++]) >>> 0;

	    if (adler32 !== Zlib.Adler32(buffer)) {
	      throw new Error('invalid adler-32 checksum');
	    }
	  }

	  return buffer;
	};
	/* vim:set expandtab ts=2 sw=2 tw=80: */

	/**
	 * @param {!(Uint8Array|Array)} input deflated buffer.
	 * @constructor
	 */


	Zlib.InflateStream = function (input) {
	  /** @type {!(Uint8Array|Array)} */
	  this.input = input === void 0 ? new ( Uint8Array )() : input;
	  /** @type {number} */

	  this.ip = 0;
	  /** @type {Zlib.RawInflateStream} */

	  this.rawinflate = new Zlib.RawInflateStream(this.input, this.ip);
	  /** @type {Zlib.CompressionMethod} */

	  this.method;
	  /** @type {!(Array|Uint8Array)} */

	  this.output = this.rawinflate.output;
	};
	/**
	 * decompress.
	 * @return {!(Uint8Array|Array)} inflated buffer.
	 */


	Zlib.InflateStream.prototype.decompress = function (input) {
	  /** @type {!(Uint8Array|Array)} inflated buffer. */
	  var buffer;
	  // XXX Array, Uint8Array のチェックを行うか確認する

	  if (input !== void 0) {
	    {
	      var tmp = new Uint8Array(this.input.length + input.length);
	      tmp.set(this.input, 0);
	      tmp.set(input, this.input.length);
	      this.input = tmp;
	    }
	  }

	  if (this.method === void 0) {
	    if (this.readHeader() < 0) {
	      return new ( Uint8Array )();
	    }
	  }

	  buffer = this.rawinflate.decompress(this.input, this.ip);

	  if (this.rawinflate.ip !== 0) {
	    this.input =  this.input.subarray(this.rawinflate.ip) ;
	    this.ip = 0;
	  } // verify adler-32

	  /*
	  if (this.verify) {
	    adler32 =
	      input[this.ip++] << 24 | input[this.ip++] << 16 |
	      input[this.ip++] << 8 | input[this.ip++];
	     if (adler32 !== Zlib.Adler32(buffer)) {
	      throw new Error('invalid adler-32 checksum');
	    }
	  }
	  */


	  return buffer;
	};

	Zlib.InflateStream.prototype.readHeader = function () {
	  var ip = this.ip;
	  var input = this.input; // Compression Method and Flags

	  var cmf = input[ip++];
	  var flg = input[ip++];

	  if (cmf === void 0 || flg === void 0) {
	    return -1;
	  } // compression method


	  switch (cmf & 0x0f) {
	    case Zlib.CompressionMethod.DEFLATE:
	      this.method = Zlib.CompressionMethod.DEFLATE;
	      break;

	    default:
	      throw new Error('unsupported compression method');
	  } // fcheck


	  if (((cmf << 8) + flg) % 31 !== 0) {
	    throw new Error('invalid fcheck flag:' + ((cmf << 8) + flg) % 31);
	  } // fdict (not supported)


	  if (flg & 0x20) {
	    throw new Error('fdict flag is not supported');
	  }

	  this.ip = ip;
	};
	/**
	 * @fileoverview GZIP (RFC1952) 展開コンテナ実装.
	 */

	/**
	 * @constructor
	 * @param {!(Array|Uint8Array)} input input buffer.
	 * @param {Object=} opt_params option parameters.
	 */


	Zlib.Gunzip = function (input, opt_params) {
	  /** @type {!(Array.<number>|Uint8Array)} input buffer. */
	  this.input = input;
	  /** @type {number} input buffer pointer. */

	  this.ip = 0;
	  /** @type {Array.<Zlib.GunzipMember>} */

	  this.member = [];
	  /** @type {boolean} */

	  this.decompressed = false;
	};
	/**
	 * @return {Array.<Zlib.GunzipMember>}
	 */


	Zlib.Gunzip.prototype.getMembers = function () {
	  if (!this.decompressed) {
	    this.decompress();
	  }

	  return this.member.slice();
	};
	/**
	 * inflate gzip data.
	 * @return {!(Array.<number>|Uint8Array)} inflated buffer.
	 */


	Zlib.Gunzip.prototype.decompress = function () {
	  /** @type {number} input length. */
	  var il = this.input.length;

	  while (this.ip < il) {
	    this.decodeMember();
	  }

	  this.decompressed = true;
	  return this.concatMember();
	};
	/**
	 * decode gzip member.
	 */


	Zlib.Gunzip.prototype.decodeMember = function () {
	  /** @type {Zlib.GunzipMember} */
	  var member = new Zlib.GunzipMember();
	  /** @type {number} */

	  var isize;
	  /** @type {Zlib.RawInflate} RawInflate implementation. */

	  var rawinflate;
	  /** @type {!(Array.<number>|Uint8Array)} inflated data. */

	  var inflated;
	  /** @type {number} inflate size */

	  var inflen;
	  /** @type {number} character code */

	  var c;
	  /** @type {number} character index in string. */

	  var ci;
	  /** @type {Array.<string>} character array. */

	  var str;
	  /** @type {number} modification time. */

	  var mtime;
	  /** @type {number} */

	  var crc32;
	  var input = this.input;
	  var ip = this.ip;
	  member.id1 = input[ip++];
	  member.id2 = input[ip++]; // check signature

	  if (member.id1 !== 0x1f || member.id2 !== 0x8b) {
	    throw new Error('invalid file signature:' + member.id1 + ',' + member.id2);
	  } // check compression method


	  member.cm = input[ip++];

	  switch (member.cm) {
	    case 8:
	      /* XXX: use Zlib const */
	      break;

	    default:
	      throw new Error('unknown compression method: ' + member.cm);
	  } // flags


	  member.flg = input[ip++]; // modification time

	  mtime = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24;
	  member.mtime = new Date(mtime * 1000); // extra flags

	  member.xfl = input[ip++]; // operating system

	  member.os = input[ip++]; // extra

	  if ((member.flg & Zlib.Gzip.FlagsMask.FEXTRA) > 0) {
	    member.xlen = input[ip++] | input[ip++] << 8;
	    ip = this.decodeSubField(ip, member.xlen);
	  } // fname


	  if ((member.flg & Zlib.Gzip.FlagsMask.FNAME) > 0) {
	    for (str = [], ci = 0; (c = input[ip++]) > 0;) {
	      str[ci++] = String.fromCharCode(c);
	    }

	    member.name = str.join('');
	  } // fcomment


	  if ((member.flg & Zlib.Gzip.FlagsMask.FCOMMENT) > 0) {
	    for (str = [], ci = 0; (c = input[ip++]) > 0;) {
	      str[ci++] = String.fromCharCode(c);
	    }

	    member.comment = str.join('');
	  } // fhcrc


	  if ((member.flg & Zlib.Gzip.FlagsMask.FHCRC) > 0) {
	    member.crc16 = Zlib.CRC32.calc(input, 0, ip) & 0xffff;

	    if (member.crc16 !== (input[ip++] | input[ip++] << 8)) {
	      throw new Error('invalid header crc16');
	    }
	  } // isize を事前に取得すると展開後のサイズが分かるため、
	  // inflate処理のバッファサイズが事前に分かり、高速になる


	  isize = input[input.length - 4] | input[input.length - 3] << 8 | input[input.length - 2] << 16 | input[input.length - 1] << 24; // isize の妥当性チェック
	  // ハフマン符号では最小 2-bit のため、最大で 1/4 になる
	  // LZ77 符号では 長さと距離 2-Byte で最大 258-Byte を表現できるため、
	  // 1/128 になるとする
	  // ここから入力バッファの残りが isize の 512 倍以上だったら
	  // サイズ指定のバッファ確保は行わない事とする

	  if (input.length - ip -
	  /* CRC-32 */
	  4 -
	  /* ISIZE */
	  4 < isize * 512) {
	    inflen = isize;
	  } // compressed block


	  rawinflate = new Zlib.RawInflate(input, {
	    'index': ip,
	    'bufferSize': inflen
	  });
	  member.data = inflated = rawinflate.decompress();
	  ip = rawinflate.ip; // crc32

	  member.crc32 = crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;

	  if (Zlib.CRC32.calc(inflated) !== crc32) {
	    throw new Error('invalid CRC-32 checksum: 0x' + Zlib.CRC32.calc(inflated).toString(16) + ' / 0x' + crc32.toString(16));
	  } // input size


	  member.isize = isize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;

	  if ((inflated.length & 0xffffffff) !== isize) {
	    throw new Error('invalid input size: ' + (inflated.length & 0xffffffff) + ' / ' + isize);
	  }

	  this.member.push(member);
	  this.ip = ip;
	};
	/**
	 * サブフィールドのデコード
	 * XXX: 現在は何もせずスキップする
	 */


	Zlib.Gunzip.prototype.decodeSubField = function (ip, length) {
	  return ip + length;
	};
	/**
	 * @return {!(Array.<number>|Uint8Array)}
	 */


	Zlib.Gunzip.prototype.concatMember = function () {
	  /** @type {Array.<Zlib.GunzipMember>} */
	  var member = this.member;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;
	  /** @type {number} */

	  var p = 0;
	  /** @type {number} */

	  var size = 0;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var buffer;

	  for (i = 0, il = member.length; i < il; ++i) {
	    size += member[i].data.length;
	  }

	  {
	    buffer = new Uint8Array(size);

	    for (i = 0; i < il; ++i) {
	      buffer.set(member[i].data, p);
	      p += member[i].data.length;
	    }
	  }

	  return buffer;
	};
	/**
	 * @constructor
	 */


	Zlib.GunzipMember = function () {
	  /** @type {number} signature first byte. */
	  this.id1;
	  /** @type {number} signature second byte. */

	  this.id2;
	  /** @type {number} compression method. */

	  this.cm;
	  /** @type {number} flags. */

	  this.flg;
	  /** @type {Date} modification time. */

	  this.mtime;
	  /** @type {number} extra flags. */

	  this.xfl;
	  /** @type {number} operating system number. */

	  this.os;
	  /** @type {number} CRC-16 value for FHCRC flag. */

	  this.crc16;
	  /** @type {number} extra length. */

	  this.xlen;
	  /** @type {number} CRC-32 value for verification. */

	  this.crc32;
	  /** @type {number} input size modulo 32 value. */

	  this.isize;
	  /** @type {string} filename. */

	  this.name;
	  /** @type {string} comment. */

	  this.comment;
	  /** @type {!(Uint8Array|Array.<number>)} */

	  this.data;
	};

	Zlib.GunzipMember.prototype.getName = function () {
	  return this.name;
	};

	Zlib.GunzipMember.prototype.getData = function () {
	  return this.data;
	};

	Zlib.GunzipMember.prototype.getMtime = function () {
	  return this.mtime;
	};
	/**
	 * @fileoverview GZIP (RFC1952) 実装.
	 */

	/**
	 * @constructor
	 * @param {!(Array|Uint8Array)} input input buffer.
	 * @param {Object=} opt_params option parameters.
	 */


	Zlib.Gzip = function (input, opt_params) {
	  /** @type {!(Array.<number>|Uint8Array)} input buffer. */
	  this.input = input;
	  /** @type {number} input buffer pointer. */

	  this.ip = 0;
	  /** @type {!(Array.<number>|Uint8Array)} output buffer. */

	  this.output;
	  /** @type {number} output buffer. */

	  this.op = 0;
	  /** @type {!Object} flags option flags. */

	  this.flags = {};
	  /** @type {!string} filename. */

	  this.filename;
	  /** @type {!string} comment. */

	  this.comment;
	  /** @type {!Object} deflate options. */

	  this.deflateOptions; // option parameters

	  if (opt_params) {
	    if (opt_params['flags']) {
	      this.flags = opt_params['flags'];
	    }

	    if (typeof opt_params['filename'] === 'string') {
	      this.filename = opt_params['filename'];
	    }

	    if (typeof opt_params['comment'] === 'string') {
	      this.comment = opt_params['comment'];
	    }

	    if (opt_params['deflateOptions']) {
	      this.deflateOptions = opt_params['deflateOptions'];
	    }
	  }

	  if (!this.deflateOptions) {
	    this.deflateOptions = {};
	  }
	};
	/**
	 * @type {number}
	 * @const
	 */


	Zlib.Gzip.DefaultBufferSize = 0x8000;
	/**
	 * encode gzip members.
	 * @return {!(Array|Uint8Array)} gzip binary array.
	 */

	Zlib.Gzip.prototype.compress = function () {
	  /** @type {number} flags. */
	  var flg;
	  /** @type {number} modification time. */

	  var mtime;
	  /** @type {number} CRC-16 value for FHCRC flag. */

	  var crc16;
	  /** @type {number} CRC-32 value for verification. */

	  var crc32;
	  /** @type {!Zlib.RawDeflate} raw deflate object. */

	  var rawdeflate;
	  /** @type {number} character code */

	  var c;
	  /** @type {number} loop counter. */

	  var i;
	  /** @type {number} loop limiter. */

	  var il;
	  /** @type {!(Array|Uint8Array)} output buffer. */

	  var output = new ( Uint8Array )(Zlib.Gzip.DefaultBufferSize);
	  /** @type {number} output buffer pointer. */

	  var op = 0;
	  var input = this.input;
	  var ip = this.ip;
	  var filename = this.filename;
	  var comment = this.comment; // check signature

	  output[op++] = 0x1f;
	  output[op++] = 0x8b; // check compression method

	  output[op++] = 8;
	  /* XXX: use Zlib const */
	  // flags

	  flg = 0;
	  if (this.flags['fname']) flg |= Zlib.Gzip.FlagsMask.FNAME;
	  if (this.flags['fcomment']) flg |= Zlib.Gzip.FlagsMask.FCOMMENT;
	  if (this.flags['fhcrc']) flg |= Zlib.Gzip.FlagsMask.FHCRC; // XXX: FTEXT
	  // XXX: FEXTRA

	  output[op++] = flg; // modification time

	  mtime = (Date.now ? Date.now() : +new Date()) / 1000 | 0;
	  output[op++] = mtime & 0xff;
	  output[op++] = mtime >>> 8 & 0xff;
	  output[op++] = mtime >>> 16 & 0xff;
	  output[op++] = mtime >>> 24 & 0xff; // extra flags

	  output[op++] = 0; // operating system

	  output[op++] = Zlib.Gzip.OperatingSystem.UNKNOWN; // extra

	  /* NOP */
	  // fname

	  if (this.flags['fname'] !== void 0) {
	    for (i = 0, il = filename.length; i < il; ++i) {
	      c = filename.charCodeAt(i);

	      if (c > 0xff) {
	        output[op++] = c >>> 8 & 0xff;
	      }

	      output[op++] = c & 0xff;
	    }

	    output[op++] = 0; // null termination
	  } // fcomment


	  if (this.flags['comment']) {
	    for (i = 0, il = comment.length; i < il; ++i) {
	      c = comment.charCodeAt(i);

	      if (c > 0xff) {
	        output[op++] = c >>> 8 & 0xff;
	      }

	      output[op++] = c & 0xff;
	    }

	    output[op++] = 0; // null termination
	  } // fhcrc


	  if (this.flags['fhcrc']) {
	    crc16 = Zlib.CRC32.calc(output, 0, op) & 0xffff;
	    output[op++] = crc16 & 0xff;
	    output[op++] = crc16 >>> 8 & 0xff;
	  } // add compress option


	  this.deflateOptions['outputBuffer'] = output;
	  this.deflateOptions['outputIndex'] = op; // compress

	  rawdeflate = new Zlib.RawDeflate(input, this.deflateOptions);
	  output = rawdeflate.compress();
	  op = rawdeflate.op; // expand buffer

	  {
	    if (op + 8 > output.buffer.byteLength) {
	      this.output = new Uint8Array(op + 8);
	      this.output.set(new Uint8Array(output.buffer));
	      output = this.output;
	    } else {
	      output = new Uint8Array(output.buffer);
	    }
	  } // crc32


	  crc32 = Zlib.CRC32.calc(input);
	  output[op++] = crc32 & 0xff;
	  output[op++] = crc32 >>> 8 & 0xff;
	  output[op++] = crc32 >>> 16 & 0xff;
	  output[op++] = crc32 >>> 24 & 0xff; // input size

	  il = input.length;
	  output[op++] = il & 0xff;
	  output[op++] = il >>> 8 & 0xff;
	  output[op++] = il >>> 16 & 0xff;
	  output[op++] = il >>> 24 & 0xff;
	  this.ip = ip;

	  if ( op < output.length) {
	    this.output = output = output.subarray(0, op);
	  }

	  return output;
	};
	/** @enum {number} */


	Zlib.Gzip.OperatingSystem = {
	  FAT: 0,
	  AMIGA: 1,
	  VMS: 2,
	  UNIX: 3,
	  VM_CMS: 4,
	  ATARI_TOS: 5,
	  HPFS: 6,
	  MACINTOSH: 7,
	  Z_SYSTEM: 8,
	  CP_M: 9,
	  TOPS_20: 10,
	  NTFS: 11,
	  QDOS: 12,
	  ACORN_RISCOS: 13,
	  UNKNOWN: 255
	};
	/** @enum {number} */

	Zlib.Gzip.FlagsMask = {
	  FTEXT: 0x01,
	  FHCRC: 0x02,
	  FEXTRA: 0x04,
	  FNAME: 0x08,
	  FCOMMENT: 0x10
	};
	/**
	 * @fileoverview Heap Sort 実装. ハフマン符号化で使用する.
	 */

	/**
	 * カスタムハフマン符号で使用するヒープ実装
	 * @param {number} length ヒープサイズ.
	 * @constructor
	 */

	Zlib.Heap = function (length) {
	  this.buffer = new ( Uint16Array )(length * 2);
	  this.length = 0;
	};
	/**
	 * 親ノードの index 取得
	 * @param {number} index 子ノードの index.
	 * @return {number} 親ノードの index.
	 *
	 */


	Zlib.Heap.prototype.getParent = function (index) {
	  return ((index - 2) / 4 | 0) * 2;
	};
	/**
	 * 子ノードの index 取得
	 * @param {number} index 親ノードの index.
	 * @return {number} 子ノードの index.
	 */


	Zlib.Heap.prototype.getChild = function (index) {
	  return 2 * index + 2;
	};
	/**
	 * Heap に値を追加する
	 * @param {number} index キー index.
	 * @param {number} value 値.
	 * @return {number} 現在のヒープ長.
	 */


	Zlib.Heap.prototype.push = function (index, value) {
	  var current,
	      parent,
	      heap = this.buffer,
	      swap;
	  current = this.length;
	  heap[this.length++] = value;
	  heap[this.length++] = index; // ルートノードにたどり着くまで入れ替えを試みる

	  while (current > 0) {
	    parent = this.getParent(current); // 親ノードと比較して親の方が小さければ入れ替える

	    if (heap[current] > heap[parent]) {
	      swap = heap[current];
	      heap[current] = heap[parent];
	      heap[parent] = swap;
	      swap = heap[current + 1];
	      heap[current + 1] = heap[parent + 1];
	      heap[parent + 1] = swap;
	      current = parent; // 入れ替えが必要なくなったらそこで抜ける
	    } else {
	      break;
	    }
	  }

	  return this.length;
	};
	/**
	 * Heapから一番大きい値を返す
	 * @return {{index: number, value: number, length: number}} {index: キーindex,
	 *     value: 値, length: ヒープ長} の Object.
	 */


	Zlib.Heap.prototype.pop = function () {
	  var index,
	      value,
	      heap = this.buffer,
	      swap,
	      current,
	      parent;
	  value = heap[0];
	  index = heap[1]; // 後ろから値を取る

	  this.length -= 2;
	  heap[0] = heap[this.length];
	  heap[1] = heap[this.length + 1];
	  parent = 0; // ルートノードから下がっていく

	  while (true) {
	    current = this.getChild(parent); // 範囲チェック

	    if (current >= this.length) {
	      break;
	    } // 隣のノードと比較して、隣の方が値が大きければ隣を現在ノードとして選択


	    if (current + 2 < this.length && heap[current + 2] > heap[current]) {
	      current += 2;
	    } // 親ノードと比較して親の方が小さい場合は入れ替える


	    if (heap[current] > heap[parent]) {
	      swap = heap[parent];
	      heap[parent] = heap[current];
	      heap[current] = swap;
	      swap = heap[parent + 1];
	      heap[parent + 1] = heap[current + 1];
	      heap[current + 1] = swap;
	    } else {
	      break;
	    }

	    parent = current;
	  }

	  return {
	    index: index,
	    value: value,
	    length: this.length
	  };
	};
	/* vim:set expandtab ts=2 sw=2 tw=80: */

	/**
	 * @fileoverview Deflate (RFC1951) 符号化アルゴリズム実装.
	 */

	/**
	 * Raw Deflate 実装
	 *
	 * @constructor
	 * @param {!(Array.<number>|Uint8Array)} input 符号化する対象のバッファ.
	 * @param {Object=} opt_params option parameters.
	 *
	 * typed array が使用可能なとき、outputBuffer が Array は自動的に Uint8Array に
	 * 変換されます.
	 * 別のオブジェクトになるため出力バッファを参照している変数などは
	 * 更新する必要があります.
	 */


	Zlib.RawDeflate = function (input, opt_params) {
	  /** @type {Zlib.RawDeflate.CompressionType} */
	  this.compressionType = Zlib.RawDeflate.CompressionType.DYNAMIC;
	  /** @type {number} */

	  this.lazy = 0;
	  /** @type {!(Array.<number>|Uint32Array)} */

	  this.freqsLitLen;
	  /** @type {!(Array.<number>|Uint32Array)} */

	  this.freqsDist;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  this.input =  input instanceof Array ? new Uint8Array(input) : input;
	  /** @type {!(Array.<number>|Uint8Array)} output output buffer. */

	  this.output;
	  /** @type {number} pos output buffer position. */

	  this.op = 0; // option parameters

	  if (opt_params) {
	    if (opt_params['lazy']) {
	      this.lazy = opt_params['lazy'];
	    }

	    if (typeof opt_params['compressionType'] === 'number') {
	      this.compressionType = opt_params['compressionType'];
	    }

	    if (opt_params['outputBuffer']) {
	      this.output =  opt_params['outputBuffer'] instanceof Array ? new Uint8Array(opt_params['outputBuffer']) : opt_params['outputBuffer'];
	    }

	    if (typeof opt_params['outputIndex'] === 'number') {
	      this.op = opt_params['outputIndex'];
	    }
	  }

	  if (!this.output) {
	    this.output = new ( Uint8Array )(0x8000);
	  }
	};
	/**
	 * @enum {number}
	 */


	Zlib.RawDeflate.CompressionType = {
	  NONE: 0,
	  FIXED: 1,
	  DYNAMIC: 2,
	  RESERVED: 3
	};
	/**
	 * LZ77 の最小マッチ長
	 * @const
	 * @type {number}
	 */

	Zlib.RawDeflate.Lz77MinLength = 3;
	/**
	 * LZ77 の最大マッチ長
	 * @const
	 * @type {number}
	 */

	Zlib.RawDeflate.Lz77MaxLength = 258;
	/**
	 * LZ77 のウィンドウサイズ
	 * @const
	 * @type {number}
	 */

	Zlib.RawDeflate.WindowSize = 0x8000;
	/**
	 * 最長の符号長
	 * @const
	 * @type {number}
	 */

	Zlib.RawDeflate.MaxCodeLength = 16;
	/**
	 * ハフマン符号の最大数値
	 * @const
	 * @type {number}
	 */

	Zlib.RawDeflate.HUFMAX = 286;
	/**
	 * 固定ハフマン符号の符号化テーブル
	 * @const
	 * @type {Array.<Array.<number, number>>}
	 */

	Zlib.RawDeflate.FixedHuffmanTable = function () {
	  var table = [],
	      i;

	  for (i = 0; i < 288; i++) {
	    switch (true) {
	      case i <= 143:
	        table.push([i + 0x030, 8]);
	        break;

	      case i <= 255:
	        table.push([i - 144 + 0x190, 9]);
	        break;

	      case i <= 279:
	        table.push([i - 256 + 0x000, 7]);
	        break;

	      case i <= 287:
	        table.push([i - 280 + 0x0C0, 8]);
	        break;

	      default:
	        throw 'invalid literal: ' + i;
	    }
	  }

	  return table;
	}();
	/**
	 * DEFLATE ブロックの作成
	 * @return {!(Array.<number>|Uint8Array)} 圧縮済み byte array.
	 */


	Zlib.RawDeflate.prototype.compress = function () {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  var blockArray;
	  /** @type {number} */

	  var position;
	  /** @type {number} */

	  var length;
	  var input = this.input; // compression

	  switch (this.compressionType) {
	    case Zlib.RawDeflate.CompressionType.NONE:
	      // each 65535-Byte (length header: 16-bit)
	      for (position = 0, length = input.length; position < length;) {
	        blockArray =  input.subarray(position, position + 0xffff) ;
	        position += blockArray.length;
	        this.makeNocompressBlock(blockArray, position === length);
	      }

	      break;

	    case Zlib.RawDeflate.CompressionType.FIXED:
	      this.output = this.makeFixedHuffmanBlock(input, true);
	      this.op = this.output.length;
	      break;

	    case Zlib.RawDeflate.CompressionType.DYNAMIC:
	      this.output = this.makeDynamicHuffmanBlock(input, true);
	      this.op = this.output.length;
	      break;

	    default:
	      throw 'invalid compression type';
	  }

	  return this.output;
	};
	/**
	 * 非圧縮ブロックの作成
	 * @param {!(Array.<number>|Uint8Array)} blockArray ブロックデータ byte array.
	 * @param {!boolean} isFinalBlock 最後のブロックならばtrue.
	 * @return {!(Array.<number>|Uint8Array)} 非圧縮ブロック byte array.
	 */


	Zlib.RawDeflate.prototype.makeNocompressBlock = function (blockArray, isFinalBlock) {
	  /** @type {number} */
	  var bfinal;
	  /** @type {Zlib.RawDeflate.CompressionType} */

	  var btype;
	  /** @type {number} */

	  var len;
	  /** @type {number} */

	  var nlen;
	  var output = this.output;
	  var op = this.op; // expand buffer

	  {
	    output = new Uint8Array(this.output.buffer);

	    while (output.length <= op + blockArray.length + 5) {
	      output = new Uint8Array(output.length << 1);
	    }

	    output.set(this.output);
	  } // header


	  bfinal = isFinalBlock ? 1 : 0;
	  btype = Zlib.RawDeflate.CompressionType.NONE;
	  output[op++] = bfinal | btype << 1; // length

	  len = blockArray.length;
	  nlen = ~len + 0x10000 & 0xffff;
	  output[op++] = len & 0xff;
	  output[op++] = len >>> 8 & 0xff;
	  output[op++] = nlen & 0xff;
	  output[op++] = nlen >>> 8 & 0xff; // copy buffer

	  {
	    output.set(blockArray, op);
	    op += blockArray.length;
	    output = output.subarray(0, op);
	  }

	  this.op = op;
	  this.output = output;
	  return output;
	};
	/**
	 * 固定ハフマンブロックの作成
	 * @param {!(Array.<number>|Uint8Array)} blockArray ブロックデータ byte array.
	 * @param {!boolean} isFinalBlock 最後のブロックならばtrue.
	 * @return {!(Array.<number>|Uint8Array)} 固定ハフマン符号化ブロック byte array.
	 */


	Zlib.RawDeflate.prototype.makeFixedHuffmanBlock = function (blockArray, isFinalBlock) {
	  /** @type {Zlib.BitStream} */
	  var stream = new Zlib.BitStream( new Uint8Array(this.output.buffer) , this.op);
	  /** @type {number} */

	  var bfinal;
	  /** @type {Zlib.RawDeflate.CompressionType} */

	  var btype;
	  /** @type {!(Array.<number>|Uint16Array)} */

	  var data; // header

	  bfinal = isFinalBlock ? 1 : 0;
	  btype = Zlib.RawDeflate.CompressionType.FIXED;
	  stream.writeBits(bfinal, 1, true);
	  stream.writeBits(btype, 2, true);
	  data = this.lz77(blockArray);
	  this.fixedHuffman(data, stream);
	  return stream.finish();
	};
	/**
	 * 動的ハフマンブロックの作成
	 * @param {!(Array.<number>|Uint8Array)} blockArray ブロックデータ byte array.
	 * @param {!boolean} isFinalBlock 最後のブロックならばtrue.
	 * @return {!(Array.<number>|Uint8Array)} 動的ハフマン符号ブロック byte array.
	 */


	Zlib.RawDeflate.prototype.makeDynamicHuffmanBlock = function (blockArray, isFinalBlock) {
	  /** @type {Zlib.BitStream} */
	  var stream = new Zlib.BitStream( new Uint8Array(this.output.buffer) , this.op);
	  /** @type {number} */

	  var bfinal;
	  /** @type {Zlib.RawDeflate.CompressionType} */

	  var btype;
	  /** @type {!(Array.<number>|Uint16Array)} */

	  var data;
	  /** @type {number} */

	  var hlit;
	  /** @type {number} */

	  var hdist;
	  /** @type {number} */

	  var hclen;
	  /** @const @type {Array.<number>} */

	  var hclenOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var litLenLengths;
	  /** @type {!(Array.<number>|Uint16Array)} */

	  var litLenCodes;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var distLengths;
	  /** @type {!(Array.<number>|Uint16Array)} */

	  var distCodes;
	  /** @type {{
	   *   codes: !(Array.<number>|Uint32Array),
	   *   freqs: !(Array.<number>|Uint8Array)
	   * }} */

	  var treeSymbols;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var treeLengths;
	  /** @type {Array} */

	  var transLengths = new Array(19);
	  /** @type {!(Array.<number>|Uint16Array)} */

	  var treeCodes;
	  /** @type {number} */

	  var code;
	  /** @type {number} */

	  var bitlen;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il; // header

	  bfinal = isFinalBlock ? 1 : 0;
	  btype = Zlib.RawDeflate.CompressionType.DYNAMIC;
	  stream.writeBits(bfinal, 1, true);
	  stream.writeBits(btype, 2, true);
	  data = this.lz77(blockArray); // リテラル・長さ, 距離のハフマン符号と符号長の算出

	  litLenLengths = this.getLengths_(this.freqsLitLen, 15);
	  litLenCodes = this.getCodesFromLengths_(litLenLengths);
	  distLengths = this.getLengths_(this.freqsDist, 7);
	  distCodes = this.getCodesFromLengths_(distLengths); // HLIT, HDIST の決定

	  for (hlit = 286; hlit > 257 && litLenLengths[hlit - 1] === 0; hlit--) {}

	  for (hdist = 30; hdist > 1 && distLengths[hdist - 1] === 0; hdist--) {} // HCLEN


	  treeSymbols = this.getTreeSymbols_(hlit, litLenLengths, hdist, distLengths);
	  treeLengths = this.getLengths_(treeSymbols.freqs, 7);

	  for (i = 0; i < 19; i++) {
	    transLengths[i] = treeLengths[hclenOrder[i]];
	  }

	  for (hclen = 19; hclen > 4 && transLengths[hclen - 1] === 0; hclen--) {}

	  treeCodes = this.getCodesFromLengths_(treeLengths); // 出力

	  stream.writeBits(hlit - 257, 5, true);
	  stream.writeBits(hdist - 1, 5, true);
	  stream.writeBits(hclen - 4, 4, true);

	  for (i = 0; i < hclen; i++) {
	    stream.writeBits(transLengths[i], 3, true);
	  } // ツリーの出力


	  for (i = 0, il = treeSymbols.codes.length; i < il; i++) {
	    code = treeSymbols.codes[i];
	    stream.writeBits(treeCodes[code], treeLengths[code], true); // extra bits

	    if (code >= 16) {
	      i++;

	      switch (code) {
	        case 16:
	          bitlen = 2;
	          break;

	        case 17:
	          bitlen = 3;
	          break;

	        case 18:
	          bitlen = 7;
	          break;

	        default:
	          throw 'invalid code: ' + code;
	      }

	      stream.writeBits(treeSymbols.codes[i], bitlen, true);
	    }
	  }

	  this.dynamicHuffman(data, [litLenCodes, litLenLengths], [distCodes, distLengths], stream);
	  return stream.finish();
	};
	/**
	 * 動的ハフマン符号化(カスタムハフマンテーブル)
	 * @param {!(Array.<number>|Uint16Array)} dataArray LZ77 符号化済み byte array.
	 * @param {!Zlib.BitStream} stream 書き込み用ビットストリーム.
	 * @return {!Zlib.BitStream} ハフマン符号化済みビットストリームオブジェクト.
	 */


	Zlib.RawDeflate.prototype.dynamicHuffman = function (dataArray, litLen, dist, stream) {
	  /** @type {number} */
	  var index;
	  /** @type {number} */

	  var length;
	  /** @type {number} */

	  var literal;
	  /** @type {number} */

	  var code;
	  /** @type {number} */

	  var litLenCodes;
	  /** @type {number} */

	  var litLenLengths;
	  /** @type {number} */

	  var distCodes;
	  /** @type {number} */

	  var distLengths;
	  litLenCodes = litLen[0];
	  litLenLengths = litLen[1];
	  distCodes = dist[0];
	  distLengths = dist[1]; // 符号を BitStream に書き込んでいく

	  for (index = 0, length = dataArray.length; index < length; ++index) {
	    literal = dataArray[index]; // literal or length

	    stream.writeBits(litLenCodes[literal], litLenLengths[literal], true); // 長さ・距離符号

	    if (literal > 256) {
	      // length extra
	      stream.writeBits(dataArray[++index], dataArray[++index], true); // distance

	      code = dataArray[++index];
	      stream.writeBits(distCodes[code], distLengths[code], true); // distance extra

	      stream.writeBits(dataArray[++index], dataArray[++index], true); // 終端
	    } else if (literal === 256) {
	      break;
	    }
	  }

	  return stream;
	};
	/**
	 * 固定ハフマン符号化
	 * @param {!(Array.<number>|Uint16Array)} dataArray LZ77 符号化済み byte array.
	 * @param {!Zlib.BitStream} stream 書き込み用ビットストリーム.
	 * @return {!Zlib.BitStream} ハフマン符号化済みビットストリームオブジェクト.
	 */


	Zlib.RawDeflate.prototype.fixedHuffman = function (dataArray, stream) {
	  /** @type {number} */
	  var index;
	  /** @type {number} */

	  var length;
	  /** @type {number} */

	  var literal; // 符号を BitStream に書き込んでいく

	  for (index = 0, length = dataArray.length; index < length; index++) {
	    literal = dataArray[index]; // 符号の書き込み

	    Zlib.BitStream.prototype.writeBits.apply(stream, Zlib.RawDeflate.FixedHuffmanTable[literal]); // 長さ・距離符号

	    if (literal > 0x100) {
	      // length extra
	      stream.writeBits(dataArray[++index], dataArray[++index], true); // distance

	      stream.writeBits(dataArray[++index], 5); // distance extra

	      stream.writeBits(dataArray[++index], dataArray[++index], true); // 終端
	    } else if (literal === 0x100) {
	      break;
	    }
	  }

	  return stream;
	};
	/**
	 * マッチ情報
	 * @param {!number} length マッチした長さ.
	 * @param {!number} backwardDistance マッチ位置との距離.
	 * @constructor
	 */


	Zlib.RawDeflate.Lz77Match = function (length, backwardDistance) {
	  /** @type {number} match length. */
	  this.length = length;
	  /** @type {number} backward distance. */

	  this.backwardDistance = backwardDistance;
	};
	/**
	 * 長さ符号テーブル.
	 * [コード, 拡張ビット, 拡張ビット長] の配列となっている.
	 * @const
	 * @type {!(Array.<number>|Uint32Array)}
	 */


	Zlib.RawDeflate.Lz77Match.LengthCodeTable = function (table) {
	  return  new Uint32Array(table) ;
	}(function () {
	  /** @type {!Array} */
	  var table = [];
	  /** @type {number} */

	  var i;
	  /** @type {!Array.<number>} */

	  var c;

	  for (i = 3; i <= 258; i++) {
	    c = code(i);
	    table[i] = c[2] << 24 | c[1] << 16 | c[0];
	  }
	  /**
	   * @param {number} length lz77 length.
	   * @return {!Array.<number>} lz77 codes.
	   */


	  function code(length) {
	    switch (true) {
	      case length === 3:
	        return [257, length - 3, 0];

	      case length === 4:
	        return [258, length - 4, 0];

	      case length === 5:
	        return [259, length - 5, 0];

	      case length === 6:
	        return [260, length - 6, 0];

	      case length === 7:
	        return [261, length - 7, 0];

	      case length === 8:
	        return [262, length - 8, 0];

	      case length === 9:
	        return [263, length - 9, 0];

	      case length === 10:
	        return [264, length - 10, 0];

	      case length <= 12:
	        return [265, length - 11, 1];

	      case length <= 14:
	        return [266, length - 13, 1];

	      case length <= 16:
	        return [267, length - 15, 1];

	      case length <= 18:
	        return [268, length - 17, 1];

	      case length <= 22:
	        return [269, length - 19, 2];

	      case length <= 26:
	        return [270, length - 23, 2];

	      case length <= 30:
	        return [271, length - 27, 2];

	      case length <= 34:
	        return [272, length - 31, 2];

	      case length <= 42:
	        return [273, length - 35, 3];

	      case length <= 50:
	        return [274, length - 43, 3];

	      case length <= 58:
	        return [275, length - 51, 3];

	      case length <= 66:
	        return [276, length - 59, 3];

	      case length <= 82:
	        return [277, length - 67, 4];

	      case length <= 98:
	        return [278, length - 83, 4];

	      case length <= 114:
	        return [279, length - 99, 4];

	      case length <= 130:
	        return [280, length - 115, 4];

	      case length <= 162:
	        return [281, length - 131, 5];

	      case length <= 194:
	        return [282, length - 163, 5];

	      case length <= 226:
	        return [283, length - 195, 5];

	      case length <= 257:
	        return [284, length - 227, 5];

	      case length === 258:
	        return [285, length - 258, 0];

	      default:
	        throw 'invalid length: ' + length;
	    }
	  }

	  return table;
	}());
	/**
	 * 距離符号テーブル
	 * @param {!number} dist 距離.
	 * @return {!Array.<number>} コード、拡張ビット、拡張ビット長の配列.
	 * @private
	 */


	Zlib.RawDeflate.Lz77Match.prototype.getDistanceCode_ = function (dist) {
	  /** @type {!Array.<number>} distance code table. */
	  var r;

	  switch (true) {
	    case dist === 1:
	      r = [0, dist - 1, 0];
	      break;

	    case dist === 2:
	      r = [1, dist - 2, 0];
	      break;

	    case dist === 3:
	      r = [2, dist - 3, 0];
	      break;

	    case dist === 4:
	      r = [3, dist - 4, 0];
	      break;

	    case dist <= 6:
	      r = [4, dist - 5, 1];
	      break;

	    case dist <= 8:
	      r = [5, dist - 7, 1];
	      break;

	    case dist <= 12:
	      r = [6, dist - 9, 2];
	      break;

	    case dist <= 16:
	      r = [7, dist - 13, 2];
	      break;

	    case dist <= 24:
	      r = [8, dist - 17, 3];
	      break;

	    case dist <= 32:
	      r = [9, dist - 25, 3];
	      break;

	    case dist <= 48:
	      r = [10, dist - 33, 4];
	      break;

	    case dist <= 64:
	      r = [11, dist - 49, 4];
	      break;

	    case dist <= 96:
	      r = [12, dist - 65, 5];
	      break;

	    case dist <= 128:
	      r = [13, dist - 97, 5];
	      break;

	    case dist <= 192:
	      r = [14, dist - 129, 6];
	      break;

	    case dist <= 256:
	      r = [15, dist - 193, 6];
	      break;

	    case dist <= 384:
	      r = [16, dist - 257, 7];
	      break;

	    case dist <= 512:
	      r = [17, dist - 385, 7];
	      break;

	    case dist <= 768:
	      r = [18, dist - 513, 8];
	      break;

	    case dist <= 1024:
	      r = [19, dist - 769, 8];
	      break;

	    case dist <= 1536:
	      r = [20, dist - 1025, 9];
	      break;

	    case dist <= 2048:
	      r = [21, dist - 1537, 9];
	      break;

	    case dist <= 3072:
	      r = [22, dist - 2049, 10];
	      break;

	    case dist <= 4096:
	      r = [23, dist - 3073, 10];
	      break;

	    case dist <= 6144:
	      r = [24, dist - 4097, 11];
	      break;

	    case dist <= 8192:
	      r = [25, dist - 6145, 11];
	      break;

	    case dist <= 12288:
	      r = [26, dist - 8193, 12];
	      break;

	    case dist <= 16384:
	      r = [27, dist - 12289, 12];
	      break;

	    case dist <= 24576:
	      r = [28, dist - 16385, 13];
	      break;

	    case dist <= 32768:
	      r = [29, dist - 24577, 13];
	      break;

	    default:
	      throw 'invalid distance';
	  }

	  return r;
	};
	/**
	 * マッチ情報を LZ77 符号化配列で返す.
	 * なお、ここでは以下の内部仕様で符号化している
	 * [ CODE, EXTRA-BIT-LEN, EXTRA, CODE, EXTRA-BIT-LEN, EXTRA ]
	 * @return {!Array.<number>} LZ77 符号化 byte array.
	 */


	Zlib.RawDeflate.Lz77Match.prototype.toLz77Array = function () {
	  /** @type {number} */
	  var length = this.length;
	  /** @type {number} */

	  var dist = this.backwardDistance;
	  /** @type {Array} */

	  var codeArray = [];
	  /** @type {number} */

	  var pos = 0;
	  /** @type {!Array.<number>} */

	  var code; // length

	  code = Zlib.RawDeflate.Lz77Match.LengthCodeTable[length];
	  codeArray[pos++] = code & 0xffff;
	  codeArray[pos++] = code >> 16 & 0xff;
	  codeArray[pos++] = code >> 24; // distance

	  code = this.getDistanceCode_(dist);
	  codeArray[pos++] = code[0];
	  codeArray[pos++] = code[1];
	  codeArray[pos++] = code[2];
	  return codeArray;
	};
	/**
	 * LZ77 実装
	 * @param {!(Array.<number>|Uint8Array)} dataArray LZ77 符号化するバイト配列.
	 * @return {!(Array.<number>|Uint16Array)} LZ77 符号化した配列.
	 */


	Zlib.RawDeflate.prototype.lz77 = function (dataArray) {
	  /** @type {number} input position */
	  var position;
	  /** @type {number} input length */

	  var length;
	  /** @type {number} loop counter */

	  var i;
	  /** @type {number} loop limiter */

	  var il;
	  /** @type {number} chained-hash-table key */

	  var matchKey;
	  /** @type {Object.<number, Array.<number>>} chained-hash-table */

	  var table = {};
	  /** @const @type {number} */

	  var windowSize = Zlib.RawDeflate.WindowSize;
	  /** @type {Array.<number>} match list */

	  var matchList;
	  /** @type {Zlib.RawDeflate.Lz77Match} longest match */

	  var longestMatch;
	  /** @type {Zlib.RawDeflate.Lz77Match} previous longest match */

	  var prevMatch;
	  /** @type {!(Array.<number>|Uint16Array)} lz77 buffer */

	  var lz77buf =  new Uint16Array(dataArray.length * 2) ;
	  /** @type {number} lz77 output buffer pointer */

	  var pos = 0;
	  /** @type {number} lz77 skip length */

	  var skipLength = 0;
	  /** @type {!(Array.<number>|Uint32Array)} */

	  var freqsLitLen = new ( Uint32Array )(286);
	  /** @type {!(Array.<number>|Uint32Array)} */

	  var freqsDist = new ( Uint32Array )(30);
	  /** @type {number} */

	  var lazy = this.lazy;
	  /** @type {*} temporary variable */

	  var tmp; // 初期化

	  freqsLitLen[256] = 1; // EOB の最低出現回数は 1

	  /**
	   * マッチデータの書き込み
	   * @param {Zlib.RawDeflate.Lz77Match} match LZ77 Match data.
	   * @param {!number} offset スキップ開始位置(相対指定).
	   * @private
	   */

	  function writeMatch(match, offset) {
	    /** @type {Array.<number>} */
	    var lz77Array = match.toLz77Array();
	    /** @type {number} */

	    var i;
	    /** @type {number} */

	    var il;

	    for (i = 0, il = lz77Array.length; i < il; ++i) {
	      lz77buf[pos++] = lz77Array[i];
	    }

	    freqsLitLen[lz77Array[0]]++;
	    freqsDist[lz77Array[3]]++;
	    skipLength = match.length + offset - 1;
	    prevMatch = null;
	  } // LZ77 符号化


	  for (position = 0, length = dataArray.length; position < length; ++position) {
	    // ハッシュキーの作成
	    for (matchKey = 0, i = 0, il = Zlib.RawDeflate.Lz77MinLength; i < il; ++i) {
	      if (position + i === length) {
	        break;
	      }

	      matchKey = matchKey << 8 | dataArray[position + i];
	    } // テーブルが未定義だったら作成する


	    if (table[matchKey] === void 0) {
	      table[matchKey] = [];
	    }

	    matchList = table[matchKey]; // skip

	    if (skipLength-- > 0) {
	      matchList.push(position);
	      continue;
	    } // マッチテーブルの更新 (最大戻り距離を超えているものを削除する)


	    while (matchList.length > 0 && position - matchList[0] > windowSize) {
	      matchList.shift();
	    } // データ末尾でマッチしようがない場合はそのまま流しこむ


	    if (position + Zlib.RawDeflate.Lz77MinLength >= length) {
	      if (prevMatch) {
	        writeMatch(prevMatch, -1);
	      }

	      for (i = 0, il = length - position; i < il; ++i) {
	        tmp = dataArray[position + i];
	        lz77buf[pos++] = tmp;
	        ++freqsLitLen[tmp];
	      }

	      break;
	    } // マッチ候補から最長のものを探す


	    if (matchList.length > 0) {
	      longestMatch = this.searchLongestMatch_(dataArray, position, matchList);

	      if (prevMatch) {
	        // 現在のマッチの方が前回のマッチよりも長い
	        if (prevMatch.length < longestMatch.length) {
	          // write previous literal
	          tmp = dataArray[position - 1];
	          lz77buf[pos++] = tmp;
	          ++freqsLitLen[tmp]; // write current match

	          writeMatch(longestMatch, 0);
	        } else {
	          // write previous match
	          writeMatch(prevMatch, -1);
	        }
	      } else if (longestMatch.length < lazy) {
	        prevMatch = longestMatch;
	      } else {
	        writeMatch(longestMatch, 0);
	      } // 前回マッチしていて今回マッチがなかったら前回のを採用

	    } else if (prevMatch) {
	      writeMatch(prevMatch, -1);
	    } else {
	      tmp = dataArray[position];
	      lz77buf[pos++] = tmp;
	      ++freqsLitLen[tmp];
	    }

	    matchList.push(position); // マッチテーブルに現在の位置を保存
	  } // 終端処理


	  lz77buf[pos++] = 256;
	  freqsLitLen[256]++;
	  this.freqsLitLen = freqsLitLen;
	  this.freqsDist = freqsDist;
	  return (
	    /** @type {!(Uint16Array|Array.<number>)} */
	     lz77buf.subarray(0, pos) 
	  );
	};
	/**
	 * マッチした候補の中から最長一致を探す
	 * @param {!Object} data plain data byte array.
	 * @param {!number} position plain data byte array position.
	 * @param {!Array.<number>} matchList 候補となる位置の配列.
	 * @return {!Zlib.RawDeflate.Lz77Match} 最長かつ最短距離のマッチオブジェクト.
	 * @private
	 */


	Zlib.RawDeflate.prototype.searchLongestMatch_ = function (data, position, matchList) {
	  var match,
	      currentMatch,
	      matchMax = 0,
	      matchLength,
	      i,
	      j,
	      l,
	      dl = data.length; // 候補を後ろから 1 つずつ絞り込んでゆく

	  permatch: for (i = 0, l = matchList.length; i < l; i++) {
	    match = matchList[l - i - 1];
	    matchLength = Zlib.RawDeflate.Lz77MinLength; // 前回までの最長一致を末尾から一致検索する

	    if (matchMax > Zlib.RawDeflate.Lz77MinLength) {
	      for (j = matchMax; j > Zlib.RawDeflate.Lz77MinLength; j--) {
	        if (data[match + j - 1] !== data[position + j - 1]) {
	          continue permatch;
	        }
	      }

	      matchLength = matchMax;
	    } // 最長一致探索


	    while (matchLength < Zlib.RawDeflate.Lz77MaxLength && position + matchLength < dl && data[match + matchLength] === data[position + matchLength]) {
	      ++matchLength;
	    } // マッチ長が同じ場合は後方を優先


	    if (matchLength > matchMax) {
	      currentMatch = match;
	      matchMax = matchLength;
	    } // 最長が確定したら後の処理は省略


	    if (matchLength === Zlib.RawDeflate.Lz77MaxLength) {
	      break;
	    }
	  }

	  return new Zlib.RawDeflate.Lz77Match(matchMax, position - currentMatch);
	};
	/**
	 * Tree-Transmit Symbols の算出
	 * reference: PuTTY Deflate implementation
	 * @param {number} hlit HLIT.
	 * @param {!(Array.<number>|Uint8Array)} litlenLengths リテラルと長さ符号の符号長配列.
	 * @param {number} hdist HDIST.
	 * @param {!(Array.<number>|Uint8Array)} distLengths 距離符号の符号長配列.
	 * @return {{
	 *   codes: !(Array.<number>|Uint32Array),
	 *   freqs: !(Array.<number>|Uint8Array)
	 * }} Tree-Transmit Symbols.
	 */


	Zlib.RawDeflate.prototype.getTreeSymbols_ = function (hlit, litlenLengths, hdist, distLengths) {
	  var src = new ( Uint32Array )(hlit + hdist),
	      i,
	      j,
	      runLength,
	      l,
	      result = new ( Uint32Array )(286 + 30),
	      nResult,
	      rpt,
	      freqs = new ( Uint8Array )(19);
	  j = 0;

	  for (i = 0; i < hlit; i++) {
	    src[j++] = litlenLengths[i];
	  }

	  for (i = 0; i < hdist; i++) {
	    src[j++] = distLengths[i];
	  } // 初期化


	  nResult = 0;

	  for (i = 0, l = src.length; i < l; i += j) {
	    // Run Length Encoding
	    for (j = 1; i + j < l && src[i + j] === src[i]; ++j) {}

	    runLength = j;

	    if (src[i] === 0) {
	      // 0 の繰り返しが 3 回未満ならばそのまま
	      if (runLength < 3) {
	        while (runLength-- > 0) {
	          result[nResult++] = 0;
	          freqs[0]++;
	        }
	      } else {
	        while (runLength > 0) {
	          // 繰り返しは最大 138 までなので切り詰める
	          rpt = runLength < 138 ? runLength : 138;

	          if (rpt > runLength - 3 && rpt < runLength) {
	            rpt = runLength - 3;
	          } // 3-10 回 -> 17


	          if (rpt <= 10) {
	            result[nResult++] = 17;
	            result[nResult++] = rpt - 3;
	            freqs[17]++; // 11-138 回 -> 18
	          } else {
	            result[nResult++] = 18;
	            result[nResult++] = rpt - 11;
	            freqs[18]++;
	          }

	          runLength -= rpt;
	        }
	      }
	    } else {
	      result[nResult++] = src[i];
	      freqs[src[i]]++;
	      runLength--; // 繰り返し回数が3回未満ならばランレングス符号は要らない

	      if (runLength < 3) {
	        while (runLength-- > 0) {
	          result[nResult++] = src[i];
	          freqs[src[i]]++;
	        } // 3 回以上ならばランレングス符号化

	      } else {
	        while (runLength > 0) {
	          // runLengthを 3-6 で分割
	          rpt = runLength < 6 ? runLength : 6;

	          if (rpt > runLength - 3 && rpt < runLength) {
	            rpt = runLength - 3;
	          }

	          result[nResult++] = 16;
	          result[nResult++] = rpt - 3;
	          freqs[16]++;
	          runLength -= rpt;
	        }
	      }
	    }
	  }

	  return {
	    codes:  result.subarray(0, nResult) ,
	    freqs: freqs
	  };
	};
	/**
	 * ハフマン符号の長さを取得する
	 * @param {!(Array.<number>|Uint8Array|Uint32Array)} freqs 出現カウント.
	 * @param {number} limit 符号長の制限.
	 * @return {!(Array.<number>|Uint8Array)} 符号長配列.
	 * @private
	 */


	Zlib.RawDeflate.prototype.getLengths_ = function (freqs, limit) {
	  /** @type {number} */
	  var nSymbols = freqs.length;
	  /** @type {Zlib.Heap} */

	  var heap = new Zlib.Heap(2 * Zlib.RawDeflate.HUFMAX);
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var length = new ( Uint8Array )(nSymbols);
	  /** @type {Array} */

	  var nodes;
	  /** @type {!(Array.<number>|Uint32Array)} */

	  var values;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var codeLength;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il; // 配列の初期化


	  for (i = 0; i < nSymbols; ++i) {
	    if (freqs[i] > 0) {
	      heap.push(i, freqs[i]);
	    }
	  }

	  nodes = new Array(heap.length / 2);
	  values = new ( Uint32Array )(heap.length / 2); // 非 0 の要素が一つだけだった場合は、そのシンボルに符号長 1 を割り当てて終了

	  if (nodes.length === 1) {
	    length[heap.pop().index] = 1;
	    return length;
	  } // Reverse Package Merge Algorithm による Canonical Huffman Code の符号長決定


	  for (i = 0, il = heap.length / 2; i < il; ++i) {
	    nodes[i] = heap.pop();
	    values[i] = nodes[i].value;
	  }

	  codeLength = this.reversePackageMerge_(values, values.length, limit);

	  for (i = 0, il = nodes.length; i < il; ++i) {
	    length[nodes[i].index] = codeLength[i];
	  }

	  return length;
	};
	/**
	 * Reverse Package Merge Algorithm.
	 * @param {!(Array.<number>|Uint32Array)} freqs sorted probability.
	 * @param {number} symbols number of symbols.
	 * @param {number} limit code length limit.
	 * @return {!(Array.<number>|Uint8Array)} code lengths.
	 */


	Zlib.RawDeflate.prototype.reversePackageMerge_ = function (freqs, symbols, limit) {
	  /** @type {!(Array.<number>|Uint16Array)} */
	  var minimumCost = new ( Uint16Array )(limit);
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var flag = new ( Uint8Array )(limit);
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var codeLength = new ( Uint8Array )(symbols);
	  /** @type {Array} */

	  var value = new Array(limit);
	  /** @type {Array} */

	  var type = new Array(limit);
	  /** @type {Array.<number>} */

	  var currentPosition = new Array(limit);
	  /** @type {number} */

	  var excess = (1 << limit) - symbols;
	  /** @type {number} */

	  var half = 1 << limit - 1;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var j;
	  /** @type {number} */

	  var t;
	  /** @type {number} */

	  var weight;
	  /** @type {number} */

	  var next;
	  /**
	   * @param {number} j
	   */

	  function takePackage(j) {
	    /** @type {number} */
	    var x = type[j][currentPosition[j]];

	    if (x === symbols) {
	      takePackage(j + 1);
	      takePackage(j + 1);
	    } else {
	      --codeLength[x];
	    }

	    ++currentPosition[j];
	  }

	  minimumCost[limit - 1] = symbols;

	  for (j = 0; j < limit; ++j) {
	    if (excess < half) {
	      flag[j] = 0;
	    } else {
	      flag[j] = 1;
	      excess -= half;
	    }

	    excess <<= 1;
	    minimumCost[limit - 2 - j] = (minimumCost[limit - 1 - j] / 2 | 0) + symbols;
	  }

	  minimumCost[0] = flag[0];
	  value[0] = new Array(minimumCost[0]);
	  type[0] = new Array(minimumCost[0]);

	  for (j = 1; j < limit; ++j) {
	    if (minimumCost[j] > 2 * minimumCost[j - 1] + flag[j]) {
	      minimumCost[j] = 2 * minimumCost[j - 1] + flag[j];
	    }

	    value[j] = new Array(minimumCost[j]);
	    type[j] = new Array(minimumCost[j]);
	  }

	  for (i = 0; i < symbols; ++i) {
	    codeLength[i] = limit;
	  }

	  for (t = 0; t < minimumCost[limit - 1]; ++t) {
	    value[limit - 1][t] = freqs[t];
	    type[limit - 1][t] = t;
	  }

	  for (i = 0; i < limit; ++i) {
	    currentPosition[i] = 0;
	  }

	  if (flag[limit - 1] === 1) {
	    --codeLength[0];
	    ++currentPosition[limit - 1];
	  }

	  for (j = limit - 2; j >= 0; --j) {
	    i = 0;
	    weight = 0;
	    next = currentPosition[j + 1];

	    for (t = 0; t < minimumCost[j]; t++) {
	      weight = value[j + 1][next] + value[j + 1][next + 1];

	      if (weight > freqs[i]) {
	        value[j][t] = weight;
	        type[j][t] = symbols;
	        next += 2;
	      } else {
	        value[j][t] = freqs[i];
	        type[j][t] = i;
	        ++i;
	      }
	    }

	    currentPosition[j] = 0;

	    if (flag[j] === 1) {
	      takePackage(j);
	    }
	  }

	  return codeLength;
	};
	/**
	 * 符号長配列からハフマン符号を取得する
	 * reference: PuTTY Deflate implementation
	 * @param {!(Array.<number>|Uint8Array)} lengths 符号長配列.
	 * @return {!(Array.<number>|Uint16Array)} ハフマン符号配列.
	 * @private
	 */


	Zlib.RawDeflate.prototype.getCodesFromLengths_ = function (lengths) {
	  var codes = new ( Uint16Array )(lengths.length),
	      count = [],
	      startCode = [],
	      code = 0,
	      i,
	      il,
	      j,
	      m; // Count the codes of each length.

	  for (i = 0, il = lengths.length; i < il; i++) {
	    count[lengths[i]] = (count[lengths[i]] | 0) + 1;
	  } // Determine the starting code for each length block.


	  for (i = 1, il = Zlib.RawDeflate.MaxCodeLength; i <= il; i++) {
	    startCode[i] = code;
	    code += count[i] | 0;
	    code <<= 1;
	  } // Determine the code for each symbol. Mirrored, of course.


	  for (i = 0, il = lengths.length; i < il; i++) {
	    code = startCode[lengths[i]];
	    startCode[lengths[i]] += 1;
	    codes[i] = 0;

	    for (j = 0, m = lengths[i]; j < m; j++) {
	      codes[i] = codes[i] << 1 | code & 1;
	      code >>>= 1;
	    }
	  }

	  return codes;
	};
	/**
	 * @param {!(Array.<number>|Uint8Array)} input input buffer.
	 * @param {Object=} opt_params options.
	 * @constructor
	 */


	Zlib.Unzip = function (input, opt_params) {
	  opt_params = opt_params || {};
	  /** @type {!(Array.<number>|Uint8Array)} */

	  this.input =  input instanceof Array ? new Uint8Array(input) : input;
	  /** @type {number} */

	  this.ip = 0;
	  /** @type {number} */

	  this.eocdrOffset;
	  /** @type {number} */

	  this.numberOfThisDisk;
	  /** @type {number} */

	  this.startDisk;
	  /** @type {number} */

	  this.totalEntriesThisDisk;
	  /** @type {number} */

	  this.totalEntries;
	  /** @type {number} */

	  this.centralDirectorySize;
	  /** @type {number} */

	  this.centralDirectoryOffset;
	  /** @type {number} */

	  this.commentLength;
	  /** @type {(Array.<number>|Uint8Array)} */

	  this.comment;
	  /** @type {Array.<Zlib.Unzip.FileHeader>} */

	  this.fileHeaderList;
	  /** @type {Object.<string, number>} */

	  this.filenameToIndex;
	  /** @type {boolean} */

	  this.verify = opt_params['verify'] || false;
	  /** @type {(Array.<number>|Uint8Array)} */

	  this.password = opt_params['password'];
	};

	Zlib.Unzip.CompressionMethod = Zlib.Zip.CompressionMethod;
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib.Unzip.FileHeaderSignature = Zlib.Zip.FileHeaderSignature;
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib.Unzip.LocalFileHeaderSignature = Zlib.Zip.LocalFileHeaderSignature;
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib.Unzip.CentralDirectorySignature = Zlib.Zip.CentralDirectorySignature;
	/**
	 * @param {!(Array.<number>|Uint8Array)} input input buffer.
	 * @param {number} ip input position.
	 * @constructor
	 */

	Zlib.Unzip.FileHeader = function (input, ip) {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  this.input = input;
	  /** @type {number} */

	  this.offset = ip;
	  /** @type {number} */

	  this.length;
	  /** @type {number} */

	  this.version;
	  /** @type {number} */

	  this.os;
	  /** @type {number} */

	  this.needVersion;
	  /** @type {number} */

	  this.flags;
	  /** @type {number} */

	  this.compression;
	  /** @type {number} */

	  this.time;
	  /** @type {number} */

	  this.date;
	  /** @type {number} */

	  this.crc32;
	  /** @type {number} */

	  this.compressedSize;
	  /** @type {number} */

	  this.plainSize;
	  /** @type {number} */

	  this.fileNameLength;
	  /** @type {number} */

	  this.extraFieldLength;
	  /** @type {number} */

	  this.fileCommentLength;
	  /** @type {number} */

	  this.diskNumberStart;
	  /** @type {number} */

	  this.internalFileAttributes;
	  /** @type {number} */

	  this.externalFileAttributes;
	  /** @type {number} */

	  this.relativeOffset;
	  /** @type {string} */

	  this.filename;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  this.extraField;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  this.comment;
	};

	Zlib.Unzip.FileHeader.prototype.parse = function () {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  var input = this.input;
	  /** @type {number} */

	  var ip = this.offset; // central file header signature

	  if (input[ip++] !== Zlib.Unzip.FileHeaderSignature[0] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[1] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[2] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[3]) {
	    throw new Error('invalid file header signature');
	  } // version made by


	  this.version = input[ip++];
	  this.os = input[ip++]; // version needed to extract

	  this.needVersion = input[ip++] | input[ip++] << 8; // general purpose bit flag

	  this.flags = input[ip++] | input[ip++] << 8; // compression method

	  this.compression = input[ip++] | input[ip++] << 8; // last mod file time

	  this.time = input[ip++] | input[ip++] << 8; //last mod file date

	  this.date = input[ip++] | input[ip++] << 8; // crc-32

	  this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // compressed size

	  this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // uncompressed size

	  this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // file name length

	  this.fileNameLength = input[ip++] | input[ip++] << 8; // extra field length

	  this.extraFieldLength = input[ip++] | input[ip++] << 8; // file comment length

	  this.fileCommentLength = input[ip++] | input[ip++] << 8; // disk number start

	  this.diskNumberStart = input[ip++] | input[ip++] << 8; // internal file attributes

	  this.internalFileAttributes = input[ip++] | input[ip++] << 8; // external file attributes

	  this.externalFileAttributes = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24; // relative offset of local header

	  this.relativeOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // file name

	  this.filename = String.fromCharCode.apply(null,  input.subarray(ip, ip += this.fileNameLength) ); // extra field

	  this.extraField =  input.subarray(ip, ip += this.extraFieldLength) ; // file comment

	  this.comment =  input.subarray(ip, ip + this.fileCommentLength) ;
	  this.length = ip - this.offset;
	};
	/**
	 * @param {!(Array.<number>|Uint8Array)} input input buffer.
	 * @param {number} ip input position.
	 * @constructor
	 */


	Zlib.Unzip.LocalFileHeader = function (input, ip) {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  this.input = input;
	  /** @type {number} */

	  this.offset = ip;
	  /** @type {number} */

	  this.length;
	  /** @type {number} */

	  this.needVersion;
	  /** @type {number} */

	  this.flags;
	  /** @type {number} */

	  this.compression;
	  /** @type {number} */

	  this.time;
	  /** @type {number} */

	  this.date;
	  /** @type {number} */

	  this.crc32;
	  /** @type {number} */

	  this.compressedSize;
	  /** @type {number} */

	  this.plainSize;
	  /** @type {number} */

	  this.fileNameLength;
	  /** @type {number} */

	  this.extraFieldLength;
	  /** @type {string} */

	  this.filename;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  this.extraField;
	};

	Zlib.Unzip.LocalFileHeader.Flags = Zlib.Zip.Flags;

	Zlib.Unzip.LocalFileHeader.prototype.parse = function () {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  var input = this.input;
	  /** @type {number} */

	  var ip = this.offset; // local file header signature

	  if (input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[0] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[1] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[2] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[3]) {
	    throw new Error('invalid local file header signature');
	  } // version needed to extract


	  this.needVersion = input[ip++] | input[ip++] << 8; // general purpose bit flag

	  this.flags = input[ip++] | input[ip++] << 8; // compression method

	  this.compression = input[ip++] | input[ip++] << 8; // last mod file time

	  this.time = input[ip++] | input[ip++] << 8; //last mod file date

	  this.date = input[ip++] | input[ip++] << 8; // crc-32

	  this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // compressed size

	  this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // uncompressed size

	  this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // file name length

	  this.fileNameLength = input[ip++] | input[ip++] << 8; // extra field length

	  this.extraFieldLength = input[ip++] | input[ip++] << 8; // file name

	  this.filename = String.fromCharCode.apply(null,  input.subarray(ip, ip += this.fileNameLength) ); // extra field

	  this.extraField =  input.subarray(ip, ip += this.extraFieldLength) ;
	  this.length = ip - this.offset;
	};

	Zlib.Unzip.prototype.searchEndOfCentralDirectoryRecord = function () {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  var input = this.input;
	  /** @type {number} */

	  var ip;

	  for (ip = input.length - 12; ip > 0; --ip) {
	    if (input[ip] === Zlib.Unzip.CentralDirectorySignature[0] && input[ip + 1] === Zlib.Unzip.CentralDirectorySignature[1] && input[ip + 2] === Zlib.Unzip.CentralDirectorySignature[2] && input[ip + 3] === Zlib.Unzip.CentralDirectorySignature[3]) {
	      this.eocdrOffset = ip;
	      return;
	    }
	  }

	  throw new Error('End of Central Directory Record not found');
	};

	Zlib.Unzip.prototype.parseEndOfCentralDirectoryRecord = function () {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  var input = this.input;
	  /** @type {number} */

	  var ip;

	  if (!this.eocdrOffset) {
	    this.searchEndOfCentralDirectoryRecord();
	  }

	  ip = this.eocdrOffset; // signature

	  if (input[ip++] !== Zlib.Unzip.CentralDirectorySignature[0] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[1] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[2] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[3]) {
	    throw new Error('invalid signature');
	  } // number of this disk


	  this.numberOfThisDisk = input[ip++] | input[ip++] << 8; // number of the disk with the start of the central directory

	  this.startDisk = input[ip++] | input[ip++] << 8; // total number of entries in the central directory on this disk

	  this.totalEntriesThisDisk = input[ip++] | input[ip++] << 8; // total number of entries in the central directory

	  this.totalEntries = input[ip++] | input[ip++] << 8; // size of the central directory

	  this.centralDirectorySize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // offset of start of central directory with respect to the starting disk number

	  this.centralDirectoryOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // .ZIP file comment length

	  this.commentLength = input[ip++] | input[ip++] << 8; // .ZIP file comment

	  this.comment =  input.subarray(ip, ip + this.commentLength) ;
	};

	Zlib.Unzip.prototype.parseFileHeader = function () {
	  /** @type {Array.<Zlib.Unzip.FileHeader>} */
	  var filelist = [];
	  /** @type {Object.<string, number>} */

	  var filetable = {};
	  /** @type {number} */

	  var ip;
	  /** @type {Zlib.Unzip.FileHeader} */

	  var fileHeader;
	  /*: @type {number} */

	  var i;
	  /*: @type {number} */

	  var il;

	  if (this.fileHeaderList) {
	    return;
	  }

	  if (this.centralDirectoryOffset === void 0) {
	    this.parseEndOfCentralDirectoryRecord();
	  }

	  ip = this.centralDirectoryOffset;

	  for (i = 0, il = this.totalEntries; i < il; ++i) {
	    fileHeader = new Zlib.Unzip.FileHeader(this.input, ip);
	    fileHeader.parse();
	    ip += fileHeader.length;
	    filelist[i] = fileHeader;
	    filetable[fileHeader.filename] = i;
	  }

	  if (this.centralDirectorySize < ip - this.centralDirectoryOffset) {
	    throw new Error('invalid file header size');
	  }

	  this.fileHeaderList = filelist;
	  this.filenameToIndex = filetable;
	};
	/**
	 * @param {number} index file header index.
	 * @param {Object=} opt_params
	 * @return {!(Array.<number>|Uint8Array)} file data.
	 */


	Zlib.Unzip.prototype.getFileData = function (index, opt_params) {
	  opt_params = opt_params || {};
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var input = this.input;
	  /** @type {Array.<Zlib.Unzip.FileHeader>} */

	  var fileHeaderList = this.fileHeaderList;
	  /** @type {Zlib.Unzip.LocalFileHeader} */

	  var localFileHeader;
	  /** @type {number} */

	  var offset;
	  /** @type {number} */

	  var length;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var buffer;
	  /** @type {number} */

	  var crc32;
	  /** @type {Array.<number>|Uint32Array|Object} */

	  var key;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;

	  if (!fileHeaderList) {
	    this.parseFileHeader();
	  }

	  if (fileHeaderList[index] === void 0) {
	    throw new Error('wrong index');
	  }

	  offset = fileHeaderList[index].relativeOffset;
	  localFileHeader = new Zlib.Unzip.LocalFileHeader(this.input, offset);
	  localFileHeader.parse();
	  offset += localFileHeader.length;
	  length = localFileHeader.compressedSize; // decryption

	  if ((localFileHeader.flags & Zlib.Unzip.LocalFileHeader.Flags.ENCRYPT) !== 0) {
	    if (!(opt_params['password'] || this.password)) {
	      throw new Error('please set password');
	    }

	    key = this.createDecryptionKey(opt_params['password'] || this.password); // encryption header

	    for (i = offset, il = offset + 12; i < il; ++i) {
	      this.decode(key, input[i]);
	    }

	    offset += 12;
	    length -= 12; // decryption

	    for (i = offset, il = offset + length; i < il; ++i) {
	      input[i] = this.decode(key, input[i]);
	    }
	  }

	  switch (localFileHeader.compression) {
	    case Zlib.Unzip.CompressionMethod.STORE:
	      buffer =  this.input.subarray(offset, offset + length) ;
	      break;

	    case Zlib.Unzip.CompressionMethod.DEFLATE:
	      buffer = new Zlib.RawInflate(this.input, {
	        'index': offset,
	        'bufferSize': localFileHeader.plainSize
	      }).decompress();
	      break;

	    default:
	      throw new Error('unknown compression type');
	  }

	  if (this.verify) {
	    crc32 = Zlib.CRC32.calc(buffer);

	    if (localFileHeader.crc32 !== crc32) {
	      throw new Error('wrong crc: file=0x' + localFileHeader.crc32.toString(16) + ', data=0x' + crc32.toString(16));
	    }
	  }

	  return buffer;
	};
	/**
	 * @return {Array.<string>}
	 */


	Zlib.Unzip.prototype.getFilenames = function () {
	  /** @type {Array.<string>} */
	  var filenameList = [];
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;
	  /** @type {Array.<Zlib.Unzip.FileHeader>} */

	  var fileHeaderList;

	  if (!this.fileHeaderList) {
	    this.parseFileHeader();
	  }

	  fileHeaderList = this.fileHeaderList;

	  for (i = 0, il = fileHeaderList.length; i < il; ++i) {
	    filenameList[i] = fileHeaderList[i].filename;
	  }

	  return filenameList;
	};
	/**
	 * @param {string} filename extract filename.
	 * @param {Object=} opt_params
	 * @return {!(Array.<number>|Uint8Array)} decompressed data.
	 */


	Zlib.Unzip.prototype.decompress = function (filename, opt_params) {
	  /** @type {number} */
	  var index;

	  if (!this.filenameToIndex) {
	    this.parseFileHeader();
	  }

	  index = this.filenameToIndex[filename];

	  if (index === void 0) {
	    throw new Error(filename + ' not found');
	  }

	  return this.getFileData(index, opt_params);
	};
	/**
	 * @param {(Array.<number>|Uint8Array)} password
	 */


	Zlib.Unzip.prototype.setPassword = function (password) {
	  this.password = password;
	};
	/**
	 * @param {(Array.<number>|Uint32Array|Object)} key
	 * @param {number} n
	 * @return {number}
	 */


	Zlib.Unzip.prototype.decode = function (key, n) {
	  n ^= this.getByte(
	  /** @type {(Array.<number>|Uint32Array)} */
	  key);
	  this.updateKeys(
	  /** @type {(Array.<number>|Uint32Array)} */
	  key, n);
	  return n;
	}; // common method


	Zlib.Unzip.prototype.updateKeys = Zlib.Zip.prototype.updateKeys;
	Zlib.Unzip.prototype.createDecryptionKey = Zlib.Zip.prototype.createEncryptionKey;
	Zlib.Unzip.prototype.getByte = Zlib.Zip.prototype.getByte;
	/**
	 * @fileoverview 雑多な関数群をまとめたモジュール実装.
	 */

	/**
	 * Byte String から Byte Array に変換.
	 * @param {!string} str byte string.
	 * @return {!Array.<number>} byte array.
	 */

	Zlib.Util.stringToByteArray = function (str) {
	  /** @type {!Array.<(string|number)>} */
	  var tmp = str.split('');
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;

	  for (i = 0, il = tmp.length; i < il; i++) {
	    tmp[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
	  }

	  return tmp;
	};
	/**
	 * @fileoverview Adler32 checksum 実装.
	 */

	/**
	 * Adler32 ハッシュ値の作成
	 * @param {!(Array|Uint8Array|string)} array 算出に使用する byte array.
	 * @return {number} Adler32 ハッシュ値.
	 */


	Zlib.Adler32 = function (array) {
	  if (typeof array === 'string') {
	    array = Zlib.Util.stringToByteArray(array);
	  }

	  return Zlib.Adler32.update(1, array);
	};
	/**
	 * Adler32 ハッシュ値の更新
	 * @param {number} adler 現在のハッシュ値.
	 * @param {!(Array|Uint8Array)} array 更新に使用する byte array.
	 * @return {number} Adler32 ハッシュ値.
	 */


	Zlib.Adler32.update = function (adler, array) {
	  /** @type {number} */
	  var s1 = adler & 0xffff;
	  /** @type {number} */

	  var s2 = adler >>> 16 & 0xffff;
	  /** @type {number} array length */

	  var len = array.length;
	  /** @type {number} loop length (don't overflow) */

	  var tlen;
	  /** @type {number} array index */

	  var i = 0;

	  while (len > 0) {
	    tlen = len > Zlib.Adler32.OptimizationParameter ? Zlib.Adler32.OptimizationParameter : len;
	    len -= tlen;

	    do {
	      s1 += array[i++];
	      s2 += s1;
	    } while (--tlen);

	    s1 %= 65521;
	    s2 %= 65521;
	  }

	  return (s2 << 16 | s1) >>> 0;
	};
	/**
	 * Adler32 最適化パラメータ
	 * 現状では 1024 程度が最適.
	 * @see http://jsperf.com/adler-32-simple-vs-optimized/3
	 * @define {number}
	 */


	Zlib.Adler32.OptimizationParameter = 1024;
	/**
	 * ビットストリーム
	 * @constructor
	 * @param {!(Array|Uint8Array)=} buffer output buffer.
	 * @param {number=} bufferPosition start buffer pointer.
	 */

	Zlib.BitStream = function (buffer, bufferPosition) {
	  /** @type {number} buffer index. */
	  this.index = typeof bufferPosition === 'number' ? bufferPosition : 0;
	  /** @type {number} bit index. */

	  this.bitindex = 0;
	  /** @type {!(Array|Uint8Array)} bit-stream output buffer. */

	  this.buffer = buffer instanceof ( Uint8Array ) ? buffer : new ( Uint8Array )(Zlib.BitStream.DefaultBlockSize); // 入力された index が足りなかったら拡張するが、倍にしてもダメなら不正とする

	  if (this.buffer.length * 2 <= this.index) {
	    throw new Error("invalid index");
	  } else if (this.buffer.length <= this.index) {
	    this.expandBuffer();
	  }
	};
	/**
	 * デフォルトブロックサイズ.
	 * @const
	 * @type {number}
	 */


	Zlib.BitStream.DefaultBlockSize = 0x8000;
	/**
	 * expand buffer.
	 * @return {!(Array|Uint8Array)} new buffer.
	 */

	Zlib.BitStream.prototype.expandBuffer = function () {
	  /** @type {!(Array|Uint8Array)} old buffer. */
	  var oldbuf = this.buffer;
	  /** @type {number} loop limiter. */

	  var il = oldbuf.length;
	  /** @type {!(Array|Uint8Array)} new buffer. */

	  var buffer = new ( Uint8Array )(il << 1); // copy buffer

	  {
	    buffer.set(oldbuf);
	  }

	  return this.buffer = buffer;
	};
	/**
	 * 数値をビットで指定した数だけ書き込む.
	 * @param {number} number 書き込む数値.
	 * @param {number} n 書き込むビット数.
	 * @param {boolean=} reverse 逆順に書き込むならば true.
	 */


	Zlib.BitStream.prototype.writeBits = function (number, n, reverse) {
	  var buffer = this.buffer;
	  var index = this.index;
	  var bitindex = this.bitindex;
	  /** @type {number} current octet. */

	  var current = buffer[index];
	  /** @type {number} loop counter. */

	  var i;
	  /**
	   * 32-bit 整数のビット順を逆にする
	   * @param {number} n 32-bit integer.
	   * @return {number} reversed 32-bit integer.
	   * @private
	   */

	  function rev32_(n) {
	    return Zlib.BitStream.ReverseTable[n & 0xFF] << 24 | Zlib.BitStream.ReverseTable[n >>> 8 & 0xFF] << 16 | Zlib.BitStream.ReverseTable[n >>> 16 & 0xFF] << 8 | Zlib.BitStream.ReverseTable[n >>> 24 & 0xFF];
	  }

	  if (reverse && n > 1) {
	    number = n > 8 ? rev32_(number) >> 32 - n : Zlib.BitStream.ReverseTable[number] >> 8 - n;
	  } // Byte 境界を超えないとき


	  if (n + bitindex < 8) {
	    current = current << n | number;
	    bitindex += n; // Byte 境界を超えるとき
	  } else {
	    for (i = 0; i < n; ++i) {
	      current = current << 1 | number >> n - i - 1 & 1; // next byte

	      if (++bitindex === 8) {
	        bitindex = 0;
	        buffer[index++] = Zlib.BitStream.ReverseTable[current];
	        current = 0; // expand

	        if (index === buffer.length) {
	          buffer = this.expandBuffer();
	        }
	      }
	    }
	  }

	  buffer[index] = current;
	  this.buffer = buffer;
	  this.bitindex = bitindex;
	  this.index = index;
	};
	/**
	 * ストリームの終端処理を行う
	 * @return {!(Array|Uint8Array)} 終端処理後のバッファを byte array で返す.
	 */


	Zlib.BitStream.prototype.finish = function () {
	  var buffer = this.buffer;
	  var index = this.index;
	  /** @type {!(Array|Uint8Array)} output buffer. */

	  var output; // bitindex が 0 の時は余分に index が進んでいる状態

	  if (this.bitindex > 0) {
	    buffer[index] <<= 8 - this.bitindex;
	    buffer[index] = Zlib.BitStream.ReverseTable[buffer[index]];
	    index++;
	  } // array truncation


	  {
	    output = buffer.subarray(0, index);
	  }

	  return output;
	};
	/**
	 * 0-255 のビット順を反転したテーブル
	 * @const
	 * @type {!(Uint8Array|Array.<number>)}
	 */


	Zlib.BitStream.ReverseTable = function (table) {
	  return table;
	}(function () {
	  /** @type {!(Array|Uint8Array)} reverse table. */
	  var table = new ( Uint8Array )(256);
	  /** @type {number} loop counter. */

	  var i; // generate

	  for (i = 0; i < 256; ++i) {
	    table[i] = function (n) {
	      var r = n;
	      var s = 7;

	      for (n >>>= 1; n; n >>>= 1) {
	        r <<= 1;
	        r |= n & 1;
	        --s;
	      }

	      return (r << s & 0xff) >>> 0;
	    }(i);
	  }

	  return table;
	}());
	/**
	 * CRC32 ハッシュ値を取得
	 * @param {!(Array.<number>|Uint8Array)} data data byte array.
	 * @param {number=} pos data position.
	 * @param {number=} length data length.
	 * @return {number} CRC32.
	 */

	Zlib.CRC32.calc = function (data, pos, length) {
	  return Zlib.CRC32.update(data, 0, pos, length);
	};
	/**
	 * CRC32ハッシュ値を更新
	 * @param {!(Array.<number>|Uint8Array)} data data byte array.
	 * @param {number} crc CRC32.
	 * @param {number=} pos data position.
	 * @param {number=} length data length.
	 * @return {number} CRC32.
	 */


	Zlib.CRC32.update = function (data, crc, pos, length) {
	  var table = Zlib.CRC32.Table;
	  var i = typeof pos === 'number' ? pos : pos = 0;
	  var il = typeof length === 'number' ? length : data.length;
	  crc ^= 0xffffffff; // loop unrolling for performance

	  for (i = il & 7; i--; ++pos) {
	    crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 0xff];
	  }

	  for (i = il >> 3; i--; pos += 8) {
	    crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 1]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 2]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 3]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 4]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 5]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 6]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 7]) & 0xff];
	  }

	  return (crc ^ 0xffffffff) >>> 0;
	};
	/**
	 * @param {number} num
	 * @param {number} crc
	 * @returns {number}
	 */


	Zlib.CRC32.single = function (num, crc) {
	  return (Zlib.CRC32.Table[(num ^ crc) & 0xff] ^ num >>> 8) >>> 0;
	};
	/**
	 * @type {Array.<number>}
	 * @const
	 * @private
	 */


	Zlib.CRC32.Table_ = [0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f, 0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9, 0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d];
	/**
	 * @type {!(Array.<number>|Uint32Array)} CRC-32 Table.
	 * @const
	 */

	Zlib.CRC32.Table =   new Uint32Array(Zlib.CRC32.Table_) ;
	/**
	 * @fileoverview Deflate (RFC1951) 実装.
	 * Deflateアルゴリズム本体は Zlib.RawDeflate で実装されている.
	 */

	/**
	 * Zlib Deflate
	 * @constructor
	 * @param {!(Array|Uint8Array)} input 符号化する対象の byte array.
	 * @param {Object=} opt_params option parameters.
	 */

	Zlib.Deflate = function (input, opt_params) {
	  /** @type {!(Array|Uint8Array)} */
	  this.input = input;
	  /** @type {!(Array|Uint8Array)} */

	  this.output = new ( Uint8Array )(Zlib.Deflate.DefaultBufferSize);
	  /** @type {Zlib.Deflate.CompressionType} */

	  this.compressionType = Zlib.Deflate.CompressionType.DYNAMIC;
	  /** @type {Zlib.RawDeflate} */

	  this.rawDeflate;
	  /** @type {Object} */

	  var rawDeflateOption = {};
	  /** @type {string} */

	  var prop; // option parameters

	  if (opt_params || !(opt_params = {})) {
	    if (typeof opt_params['compressionType'] === 'number') {
	      this.compressionType = opt_params['compressionType'];
	    }
	  } // copy options


	  for (prop in opt_params) {
	    rawDeflateOption[prop] = opt_params[prop];
	  } // set raw-deflate output buffer


	  rawDeflateOption['outputBuffer'] = this.output;
	  this.rawDeflate = new Zlib.RawDeflate(this.input, rawDeflateOption);
	};
	/**
	 * @const
	 * @type {number} デフォルトバッファサイズ.
	 */


	Zlib.Deflate.DefaultBufferSize = 0x8000;
	/**
	 * @enum {number}
	 */

	Zlib.Deflate.CompressionType = Zlib.RawDeflate.CompressionType;
	/**
	 * 直接圧縮に掛ける.
	 * @param {!(Array|Uint8Array)} input target buffer.
	 * @param {Object=} opt_params option parameters.
	 * @return {!(Array|Uint8Array)} compressed data byte array.
	 */

	Zlib.Deflate.compress = function (input, opt_params) {
	  return new Zlib.Deflate(input, opt_params).compress();
	};
	/**
	 * Deflate Compression.
	 * @return {!(Array|Uint8Array)} compressed data byte array.
	 */


	Zlib.Deflate.prototype.compress = function () {
	  /** @type {Zlib.CompressionMethod} */
	  var cm;
	  /** @type {number} */

	  var cinfo;
	  /** @type {number} */

	  var cmf;
	  /** @type {number} */

	  var flg;
	  /** @type {number} */

	  var fcheck;
	  /** @type {number} */

	  var fdict;
	  /** @type {number} */

	  var flevel;
	  /** @type {number} */

	  var adler;
	  /** @type {!(Array|Uint8Array)} */

	  var output;
	  /** @type {number} */

	  var pos = 0;
	  output = this.output; // Compression Method and Flags

	  cm = Zlib.CompressionMethod.DEFLATE;

	  switch (cm) {
	    case Zlib.CompressionMethod.DEFLATE:
	      cinfo = Math.LOG2E * Math.log(Zlib.RawDeflate.WindowSize) - 8;
	      break;

	    default:
	      throw new Error('invalid compression method');
	  }

	  cmf = cinfo << 4 | cm;
	  output[pos++] = cmf; // Flags

	  fdict = 0;

	  switch (cm) {
	    case Zlib.CompressionMethod.DEFLATE:
	      switch (this.compressionType) {
	        case Zlib.Deflate.CompressionType.NONE:
	          flevel = 0;
	          break;

	        case Zlib.Deflate.CompressionType.FIXED:
	          flevel = 1;
	          break;

	        case Zlib.Deflate.CompressionType.DYNAMIC:
	          flevel = 2;
	          break;

	        default:
	          throw new Error('unsupported compression type');
	      }

	      break;

	    default:
	      throw new Error('invalid compression method');
	  }

	  flg = flevel << 6 | fdict << 5;
	  fcheck = 31 - (cmf * 256 + flg) % 31;
	  flg |= fcheck;
	  output[pos++] = flg; // Adler-32 checksum

	  adler = Zlib.Adler32(this.input);
	  this.rawDeflate.op = pos;
	  output = this.rawDeflate.compress();
	  pos = output.length;

	  {
	    // subarray 分を元にもどす
	    output = new Uint8Array(output.buffer); // expand buffer

	    if (output.length <= pos + 4) {
	      this.output = new Uint8Array(output.length + 4);
	      this.output.set(output);
	      output = this.output;
	    }

	    output = output.subarray(0, pos + 4);
	  } // adler32


	  output[pos++] = adler >> 24 & 0xff;
	  output[pos++] = adler >> 16 & 0xff;
	  output[pos++] = adler >> 8 & 0xff;
	  output[pos++] = adler & 0xff;
	  return output;
	};

	let _btoa;

	if (typeof btoa === 'undefined') {
	  _btoa = require('btoa');
	} else {
	  _btoa = btoa;
	}

	if (typeof process === 'object' && typeof window === 'undefined') {
	  global.atob = function (str) {
	    return Buffer.from(str, 'base64').toString('binary');
	  };
	}

	// Convenience functions for the gapi oAuth library.

	async function load(library) {
	  return new Promise(function (resolve, reject) {
	    gapi.load(library, {
	      callback: resolve,
	      onerror: reject
	    });
	  });
	}

	async function init(config) {
	  if (isInitialized()) {
	    console.warn("oAuth has already been initialized");
	    return;
	  }

	  gapi.apiKey = config.apiKey; // copy config, gapi will modify it

	  const configCopy = Object.assign({}, config);

	  if (!configCopy.scope) {
	    configCopy.scope = 'profile';
	  }

	  if (!config.client_id) {
	    config.client_id = config.clientId;
	  }

	  await load("auth2");
	  return new Promise(function (resolve, reject) {
	    gapi.auth2.init(configCopy).then(resolve, reject);
	  });
	}

	function isInitialized() {
	  return gapi.auth2 && gapi.auth2.getAuthInstance();
	}

	function div(options) {
	  return create("div", options);
	}

	function create(tag, options) {
	  const elem = document.createElement(tag);

	  if (options) {
	    if (options.class) {
	      elem.classList.add(options.class);
	    }

	    if (options.id) {
	      elem.id = options.id;
	    }

	    if (options.style) {
	      applyStyle(elem, options.style);
	    }
	  }

	  return elem;
	}

	function hide(elem) {
	  const cssStyle = getComputedStyle(elem);

	  if (cssStyle.display !== "none") {
	    elem._initialDisplay = cssStyle.display;
	  }

	  elem.style.display = "none";
	}

	function show(elem) {
	  const currentDisplay = getComputedStyle(elem).display;

	  if (currentDisplay === "none") {
	    const d = elem._initialDisplay || "block";
	    elem.style.display = d;
	  }
	}

	function offset(elem) {
	  // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
	  // Support: IE <=11 only
	  // Running getBoundingClientRect on a
	  // disconnected node in IE throws an error
	  if (!elem.getClientRects().length) {
	    return {
	      top: 0,
	      left: 0
	    };
	  } // Get document-relative position by adding viewport scroll to viewport-relative gBCR


	  const rect = elem.getBoundingClientRect();
	  const win = elem.ownerDocument.defaultView;
	  return {
	    top: rect.top + win.pageYOffset,
	    left: rect.left + win.pageXOffset
	  };
	}

	function applyStyle(elem, style) {
	  for (let key of Object.keys(style)) {
	    elem.style[key] = style[key];
	  }
	}

	function guid() {
	  return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
	}

	function createIcon(name, color) {
	  return iconMarkup(name, color);
	}

	function iconMarkup(name, color) {
	  color = color || "currentColor";
	  let icon = icons[name];

	  if (!icon) {
	    console.error(`No icon named: ${name}`);
	    icon = icons["question"];
	  }

	  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	  svg.setAttributeNS(null, 'viewBox', '0 0 ' + icon[0] + ' ' + icon[1]);
	  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	  path.setAttributeNS(null, 'fill', color);
	  path.setAttributeNS(null, 'd', icon[4]);
	  svg.appendChild(path);
	  return svg;
	}

	const icons = {
	  "check": [512, 512, [], "f00c", "M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"],
	  "cog": [512, 512, [], "f013", "M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z"],
	  "exclamation": [192, 512, [], "f12a", "M176 432c0 44.112-35.888 80-80 80s-80-35.888-80-80 35.888-80 80-80 80 35.888 80 80zM25.26 25.199l13.6 272C39.499 309.972 50.041 320 62.83 320h66.34c12.789 0 23.331-10.028 23.97-22.801l13.6-272C167.425 11.49 156.496 0 142.77 0H49.23C35.504 0 24.575 11.49 25.26 25.199z"],
	  "exclamation-circle": [512, 512, [], "f06a", "M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zm-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"],
	  "exclamation-triangle": [576, 512, [], "f071", "M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"],
	  "minus": [448, 512, [], "f068", "M424 318.2c13.3 0 24-10.7 24-24v-76.4c0-13.3-10.7-24-24-24H24c-13.3 0-24 10.7-24 24v76.4c0 13.3 10.7 24 24 24h400z"],
	  "minus-circle": [512, 512, [], "f056", "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zM124 296c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h264c6.6 0 12 5.4 12 12v56c0 6.6-5.4 12-12 12H124z"],
	  "minus-square": [448, 512, [], "f146", "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM92 296c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h264c6.6 0 12 5.4 12 12v56c0 6.6-5.4 12-12 12H92z"],
	  "plus": [448, 512, [], "f067", "M448 294.2v-76.4c0-13.3-10.7-24-24-24H286.2V56c0-13.3-10.7-24-24-24h-76.4c-13.3 0-24 10.7-24 24v137.8H24c-13.3 0-24 10.7-24 24v76.4c0 13.3 10.7 24 24 24h137.8V456c0 13.3 10.7 24 24 24h76.4c13.3 0 24-10.7 24-24V318.2H424c13.3 0 24-10.7 24-24z"],
	  "plus-circle": [512, 512, [], "f055", "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm144 276c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92h-92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z"],
	  "plus-square": [448, 512, [], "f0fe", "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-32 252c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92H92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z"],
	  "question": [384, 512, [], "f128", "M202.021 0C122.202 0 70.503 32.703 29.914 91.026c-7.363 10.58-5.093 25.086 5.178 32.874l43.138 32.709c10.373 7.865 25.132 6.026 33.253-4.148 25.049-31.381 43.63-49.449 82.757-49.449 30.764 0 68.816 19.799 68.816 49.631 0 22.552-18.617 34.134-48.993 51.164-35.423 19.86-82.299 44.576-82.299 106.405V320c0 13.255 10.745 24 24 24h72.471c13.255 0 24-10.745 24-24v-5.773c0-42.86 125.268-44.645 125.268-160.627C377.504 66.256 286.902 0 202.021 0zM192 373.459c-38.196 0-69.271 31.075-69.271 69.271 0 38.195 31.075 69.27 69.271 69.27s69.271-31.075 69.271-69.271-31.075-69.27-69.271-69.27z"],
	  "save": [448, 512, [], "f0c7", "M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"],
	  "search": [512, 512, [], "f002", "M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"],
	  "share": [512, 512, [], "f064", "M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z"],
	  "spinner": [512, 512, [], "f110", "M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"],
	  "square": [448, 512, [], "f0c8", "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z"],
	  "square-full": [512, 512, [], "f45c", "M512 512H0V0h512v512z"],
	  "times": [384, 512, [], "f00d", "M323.1 441l53.9-53.9c9.4-9.4 9.4-24.5 0-33.9L279.8 256l97.2-97.2c9.4-9.4 9.4-24.5 0-33.9L323.1 71c-9.4-9.4-24.5-9.4-33.9 0L192 168.2 94.8 71c-9.4-9.4-24.5-9.4-33.9 0L7 124.9c-9.4 9.4-9.4 24.5 0 33.9l97.2 97.2L7 353.2c-9.4 9.4-9.4 24.5 0 33.9L60.9 441c9.4 9.4 24.5 9.4 33.9 0l97.2-97.2 97.2 97.2c9.3 9.3 24.5 9.3 33.9 0z"],
	  "times-circle": [512, 512, [], "f057", "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"],
	  "wrench": [512, 512, [], "f0ad", "M481.156 200c9.3 0 15.12 10.155 10.325 18.124C466.295 259.992 420.419 288 368 288c-79.222 0-143.501-63.974-143.997-143.079C223.505 65.469 288.548-.001 368.002 0c52.362.001 98.196 27.949 123.4 69.743C496.24 77.766 490.523 88 481.154 88H376l-40 56 40 56h105.156zm-171.649 93.003L109.255 493.255c-24.994 24.993-65.515 24.994-90.51 0-24.993-24.994-24.993-65.516 0-90.51L218.991 202.5c16.16 41.197 49.303 74.335 90.516 90.503zM104 432c0-13.255-10.745-24-24-24s-24 10.745-24 24 10.745 24 24 24 24-10.745 24-24z"]
	};

	function attachDialogCloseHandlerWithParent(parent, closeHandler) {
	  var container = document.createElement("div");
	  parent.appendChild(container);
	  container.appendChild(createIcon("times"));
	  container.addEventListener('click', function (e) {
	    e.preventDefault();
	    e.stopPropagation();
	    closeHandler();
	  });
	}
	/**
	 * @fileoverview Zlib namespace. Zlib の仕様に準拠した圧縮は Zlib.Deflate で実装
	 * されている. これは Inflate との共存を考慮している為.
	 */


	const ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE$1 = 65000;
	var Zlib$1 = {
	  Huffman: {},
	  Util: {},
	  CRC32: {}
	};
	/**
	 * Compression Method
	 * @enum {number}
	 */

	Zlib$1.CompressionMethod = {
	  DEFLATE: 8,
	  RESERVED: 15
	};
	/**
	 * @param {Object=} opt_params options.
	 * @constructor
	 */

	Zlib$1.Zip = function (opt_params) {
	  opt_params = opt_params || {};
	  /** @type {Array.<{
	   *   buffer: !(Array.<number>|Uint8Array),
	   *   option: Object,
	   *   compressed: boolean,
	   *   encrypted: boolean,
	   *   size: number,
	   *   crc32: number
	   * }>} */

	  this.files = [];
	  /** @type {(Array.<number>|Uint8Array)} */

	  this.comment = opt_params['comment'];
	  /** @type {(Array.<number>|Uint8Array)} */

	  this.password;
	};
	/**
	 * @enum {number}
	 */


	Zlib$1.Zip.CompressionMethod = {
	  STORE: 0,
	  DEFLATE: 8
	};
	/**
	 * @enum {number}
	 */

	Zlib$1.Zip.OperatingSystem = {
	  MSDOS: 0,
	  UNIX: 3,
	  MACINTOSH: 7
	};
	/**
	 * @enum {number}
	 */

	Zlib$1.Zip.Flags = {
	  ENCRYPT: 0x0001,
	  DESCRIPTOR: 0x0008,
	  UTF8: 0x0800
	};
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib$1.Zip.FileHeaderSignature = [0x50, 0x4b, 0x01, 0x02];
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib$1.Zip.LocalFileHeaderSignature = [0x50, 0x4b, 0x03, 0x04];
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib$1.Zip.CentralDirectorySignature = [0x50, 0x4b, 0x05, 0x06];
	/**
	 * @param {Array.<number>|Uint8Array} input
	 * @param {Object=} opt_params options.
	 */

	Zlib$1.Zip.prototype.addFile = function (input, opt_params) {
	  opt_params = opt_params || {};
	  /** @type {string} */

	  var filename = opt_params['filename'];
	  /** @type {boolean} */

	  var compressed;
	  /** @type {number} */

	  var size = input.length;
	  /** @type {number} */

	  var crc32 = 0;

	  if (input instanceof Array) {
	    input = new Uint8Array(input);
	  } // default


	  if (typeof opt_params['compressionMethod'] !== 'number') {
	    opt_params['compressionMethod'] = Zlib$1.Zip.CompressionMethod.DEFLATE;
	  } // その場で圧縮する場合


	  if (opt_params['compress']) {
	    switch (opt_params['compressionMethod']) {
	      case Zlib$1.Zip.CompressionMethod.STORE:
	        break;

	      case Zlib$1.Zip.CompressionMethod.DEFLATE:
	        crc32 = Zlib$1.CRC32.calc(input);
	        input = this.deflateWithOption(input, opt_params);
	        compressed = true;
	        break;

	      default:
	        throw new Error('unknown compression method:' + opt_params['compressionMethod']);
	    }
	  }

	  this.files.push({
	    buffer: input,
	    option: opt_params,
	    compressed: compressed,
	    encrypted: false,
	    size: size,
	    crc32: crc32
	  });
	};
	/**
	 * @param {(Array.<number>|Uint8Array)} password
	 */


	Zlib$1.Zip.prototype.setPassword = function (password) {
	  this.password = password;
	};

	Zlib$1.Zip.prototype.compress = function () {
	  /** @type {Array.<{
	   *   buffer: !(Array.<number>|Uint8Array),
	   *   option: Object,
	   *   compressed: boolean,
	   *   encrypted: boolean,
	   *   size: number,
	   *   crc32: number
	   * }>} */
	  var files = this.files;
	  /** @type {{
	   *   buffer: !(Array.<number>|Uint8Array),
	   *   option: Object,
	   *   compressed: boolean,
	   *   encrypted: boolean,
	   *   size: number,
	   *   crc32: number
	   * }} */

	  var file;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var output;
	  /** @type {number} */

	  var op1;
	  /** @type {number} */

	  var op2;
	  /** @type {number} */

	  var op3;
	  /** @type {number} */

	  var localFileSize = 0;
	  /** @type {number} */

	  var centralDirectorySize = 0;
	  /** @type {number} */

	  var endOfCentralDirectorySize;
	  /** @type {number} */

	  var offset;
	  /** @type {number} */

	  var needVersion;
	  /** @type {number} */

	  var flags;
	  /** @type {Zlib.Zip.CompressionMethod} */

	  var compressionMethod;
	  /** @type {Date} */

	  var date;
	  /** @type {number} */

	  var crc32;
	  /** @type {number} */

	  var size;
	  /** @type {number} */

	  var plainSize;
	  /** @type {number} */

	  var filenameLength;
	  /** @type {number} */

	  var extraFieldLength;
	  /** @type {number} */

	  var commentLength;
	  /** @type {(Array.<number>|Uint8Array)} */

	  var filename;
	  /** @type {(Array.<number>|Uint8Array)} */

	  var extraField;
	  /** @type {(Array.<number>|Uint8Array)} */

	  var comment;
	  /** @type {(Array.<number>|Uint8Array)} */

	  var buffer;
	  /** @type {*} */

	  var tmp;
	  /** @type {Array.<number>|Uint32Array|Object} */

	  var key;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;
	  /** @type {number} */

	  var j;
	  /** @type {number} */

	  var jl; // ファイルの圧縮

	  for (i = 0, il = files.length; i < il; ++i) {
	    file = files[i];
	    filenameLength = file.option['filename'] ? file.option['filename'].length : 0;
	    extraFieldLength = file.option['extraField'] ? file.option['extraField'].length : 0;
	    commentLength = file.option['comment'] ? file.option['comment'].length : 0; // 圧縮されていなかったら圧縮

	    if (!file.compressed) {
	      // 圧縮前に CRC32 の計算をしておく
	      file.crc32 = Zlib$1.CRC32.calc(file.buffer);

	      switch (file.option['compressionMethod']) {
	        case Zlib$1.Zip.CompressionMethod.STORE:
	          break;

	        case Zlib$1.Zip.CompressionMethod.DEFLATE:
	          file.buffer = this.deflateWithOption(file.buffer, file.option);
	          file.compressed = true;
	          break;

	        default:
	          throw new Error('unknown compression method:' + file.option['compressionMethod']);
	      }
	    } // encryption


	    if (file.option['password'] !== void 0 || this.password !== void 0) {
	      // init encryption
	      key = this.createEncryptionKey(file.option['password'] || this.password); // add header

	      buffer = file.buffer;
	      {
	        tmp = new Uint8Array(buffer.length + 12);
	        tmp.set(buffer, 12);
	        buffer = tmp;
	      }

	      for (j = 0; j < 12; ++j) {
	        buffer[j] = this.encode(key, i === 11 ? file.crc32 & 0xff : Math.random() * 256 | 0);
	      } // data encryption


	      for (jl = buffer.length; j < jl; ++j) {
	        buffer[j] = this.encode(key, buffer[j]);
	      }

	      file.buffer = buffer;
	    } // 必要バッファサイズの計算


	    localFileSize += // local file header
	    30 + filenameLength + // file data
	    file.buffer.length;
	    centralDirectorySize += // file header
	    46 + filenameLength + commentLength;
	  } // end of central directory


	  endOfCentralDirectorySize = 22 + (this.comment ? this.comment.length : 0);
	  output = new Uint8Array(localFileSize + centralDirectorySize + endOfCentralDirectorySize);
	  op1 = 0;
	  op2 = localFileSize;
	  op3 = op2 + centralDirectorySize; // ファイルの圧縮

	  for (i = 0, il = files.length; i < il; ++i) {
	    file = files[i];
	    filenameLength = file.option['filename'] ? file.option['filename'].length : 0;
	    extraFieldLength = 0; // TODO

	    commentLength = file.option['comment'] ? file.option['comment'].length : 0; //-------------------------------------------------------------------------
	    // local file header & file header
	    //-------------------------------------------------------------------------

	    offset = op1; // signature
	    // local file header

	    output[op1++] = Zlib$1.Zip.LocalFileHeaderSignature[0];
	    output[op1++] = Zlib$1.Zip.LocalFileHeaderSignature[1];
	    output[op1++] = Zlib$1.Zip.LocalFileHeaderSignature[2];
	    output[op1++] = Zlib$1.Zip.LocalFileHeaderSignature[3]; // file header

	    output[op2++] = Zlib$1.Zip.FileHeaderSignature[0];
	    output[op2++] = Zlib$1.Zip.FileHeaderSignature[1];
	    output[op2++] = Zlib$1.Zip.FileHeaderSignature[2];
	    output[op2++] = Zlib$1.Zip.FileHeaderSignature[3]; // compressor info

	    needVersion = 20;
	    output[op2++] = needVersion & 0xff;
	    output[op2++] =
	    /** @type {Zlib.Zip.OperatingSystem} */
	    file.option['os'] || Zlib$1.Zip.OperatingSystem.MSDOS; // need version

	    output[op1++] = output[op2++] = needVersion & 0xff;
	    output[op1++] = output[op2++] = needVersion >> 8 & 0xff; // general purpose bit flag

	    flags = 0;

	    if (file.option['password'] || this.password) {
	      flags |= Zlib$1.Zip.Flags.ENCRYPT;
	    }

	    output[op1++] = output[op2++] = flags & 0xff;
	    output[op1++] = output[op2++] = flags >> 8 & 0xff; // compression method

	    compressionMethod =
	    /** @type {Zlib.Zip.CompressionMethod} */
	    file.option['compressionMethod'];
	    output[op1++] = output[op2++] = compressionMethod & 0xff;
	    output[op1++] = output[op2++] = compressionMethod >> 8 & 0xff; // date

	    date =
	    /** @type {(Date|undefined)} */
	    file.option['date'] || new Date();
	    output[op1++] = output[op2++] = (date.getMinutes() & 0x7) << 5 | (date.getSeconds() / 2 | 0);
	    output[op1++] = output[op2++] = date.getHours() << 3 | date.getMinutes() >> 3; //

	    output[op1++] = output[op2++] = (date.getMonth() + 1 & 0x7) << 5 | date.getDate();
	    output[op1++] = output[op2++] = (date.getFullYear() - 1980 & 0x7f) << 1 | date.getMonth() + 1 >> 3; // CRC-32

	    crc32 = file.crc32;
	    output[op1++] = output[op2++] = crc32 & 0xff;
	    output[op1++] = output[op2++] = crc32 >> 8 & 0xff;
	    output[op1++] = output[op2++] = crc32 >> 16 & 0xff;
	    output[op1++] = output[op2++] = crc32 >> 24 & 0xff; // compressed size

	    size = file.buffer.length;
	    output[op1++] = output[op2++] = size & 0xff;
	    output[op1++] = output[op2++] = size >> 8 & 0xff;
	    output[op1++] = output[op2++] = size >> 16 & 0xff;
	    output[op1++] = output[op2++] = size >> 24 & 0xff; // uncompressed size

	    plainSize = file.size;
	    output[op1++] = output[op2++] = plainSize & 0xff;
	    output[op1++] = output[op2++] = plainSize >> 8 & 0xff;
	    output[op1++] = output[op2++] = plainSize >> 16 & 0xff;
	    output[op1++] = output[op2++] = plainSize >> 24 & 0xff; // filename length

	    output[op1++] = output[op2++] = filenameLength & 0xff;
	    output[op1++] = output[op2++] = filenameLength >> 8 & 0xff; // extra field length

	    output[op1++] = output[op2++] = extraFieldLength & 0xff;
	    output[op1++] = output[op2++] = extraFieldLength >> 8 & 0xff; // file comment length

	    output[op2++] = commentLength & 0xff;
	    output[op2++] = commentLength >> 8 & 0xff; // disk number start

	    output[op2++] = 0;
	    output[op2++] = 0; // internal file attributes

	    output[op2++] = 0;
	    output[op2++] = 0; // external file attributes

	    output[op2++] = 0;
	    output[op2++] = 0;
	    output[op2++] = 0;
	    output[op2++] = 0; // relative offset of local header

	    output[op2++] = offset & 0xff;
	    output[op2++] = offset >> 8 & 0xff;
	    output[op2++] = offset >> 16 & 0xff;
	    output[op2++] = offset >> 24 & 0xff; // filename

	    filename = file.option['filename'];

	    if (filename) {
	      {
	        output.set(filename, op1);
	        output.set(filename, op2);
	        op1 += filenameLength;
	        op2 += filenameLength;
	      }
	    } // extra field


	    extraField = file.option['extraField'];

	    if (extraField) {
	      {
	        output.set(extraField, op1);
	        output.set(extraField, op2);
	        op1 += extraFieldLength;
	        op2 += extraFieldLength;
	      }
	    } // comment


	    comment = file.option['comment'];

	    if (comment) {
	      {
	        output.set(comment, op2);
	        op2 += commentLength;
	      }
	    } //-------------------------------------------------------------------------
	    // file data
	    //-------------------------------------------------------------------------


	    {
	      output.set(file.buffer, op1);
	      op1 += file.buffer.length;
	    }
	  } //-------------------------------------------------------------------------
	  // end of central directory
	  //-------------------------------------------------------------------------
	  // signature


	  output[op3++] = Zlib$1.Zip.CentralDirectorySignature[0];
	  output[op3++] = Zlib$1.Zip.CentralDirectorySignature[1];
	  output[op3++] = Zlib$1.Zip.CentralDirectorySignature[2];
	  output[op3++] = Zlib$1.Zip.CentralDirectorySignature[3]; // number of this disk

	  output[op3++] = 0;
	  output[op3++] = 0; // number of the disk with the start of the central directory

	  output[op3++] = 0;
	  output[op3++] = 0; // total number of entries in the central directory on this disk

	  output[op3++] = il & 0xff;
	  output[op3++] = il >> 8 & 0xff; // total number of entries in the central directory

	  output[op3++] = il & 0xff;
	  output[op3++] = il >> 8 & 0xff; // size of the central directory

	  output[op3++] = centralDirectorySize & 0xff;
	  output[op3++] = centralDirectorySize >> 8 & 0xff;
	  output[op3++] = centralDirectorySize >> 16 & 0xff;
	  output[op3++] = centralDirectorySize >> 24 & 0xff; // offset of start of central directory with respect to the starting disk number

	  output[op3++] = localFileSize & 0xff;
	  output[op3++] = localFileSize >> 8 & 0xff;
	  output[op3++] = localFileSize >> 16 & 0xff;
	  output[op3++] = localFileSize >> 24 & 0xff; // .ZIP file comment length

	  commentLength = this.comment ? this.comment.length : 0;
	  output[op3++] = commentLength & 0xff;
	  output[op3++] = commentLength >> 8 & 0xff; // .ZIP file comment

	  if (this.comment) {
	    {
	      output.set(this.comment, op3);
	      op3 += commentLength;
	    }
	  }

	  return output;
	};
	/**
	 * @param {!(Array.<number>|Uint8Array)} input
	 * @param {Object=} opt_params options.
	 * @return {!(Array.<number>|Uint8Array)}
	 */


	Zlib$1.Zip.prototype.deflateWithOption = function (input, opt_params) {
	  /** @type {Zlib.RawDeflate} */
	  var deflator = new Zlib$1.RawDeflate(input, opt_params['deflateOption']);
	  return deflator.compress();
	};
	/**
	 * @param {(Array.<number>|Uint32Array)} key
	 * @return {number}
	 */


	Zlib$1.Zip.prototype.getByte = function (key) {
	  /** @type {number} */
	  var tmp = key[2] & 0xffff | 2;
	  return tmp * (tmp ^ 1) >> 8 & 0xff;
	};
	/**
	 * @param {(Array.<number>|Uint32Array|Object)} key
	 * @param {number} n
	 * @return {number}
	 */


	Zlib$1.Zip.prototype.encode = function (key, n) {
	  /** @type {number} */
	  var tmp = this.getByte(
	  /** @type {(Array.<number>|Uint32Array)} */
	  key);
	  this.updateKeys(
	  /** @type {(Array.<number>|Uint32Array)} */
	  key, n);
	  return tmp ^ n;
	};
	/**
	 * @param {(Array.<number>|Uint32Array)} key
	 * @param {number} n
	 */


	Zlib$1.Zip.prototype.updateKeys = function (key, n) {
	  key[0] = Zlib$1.CRC32.single(key[0], n);
	  key[1] = (((key[1] + (key[0] & 0xff)) * 20173 >>> 0) * 6681 >>> 0) + 1 >>> 0;
	  key[2] = Zlib$1.CRC32.single(key[2], key[1] >>> 24);
	};
	/**
	 * @param {(Array.<number>|Uint8Array)} password
	 * @return {!(Array.<number>|Uint32Array|Object)}
	 */


	Zlib$1.Zip.prototype.createEncryptionKey = function (password) {
	  /** @type {!(Array.<number>|Uint32Array)} */
	  var key = [305419896, 591751049, 878082192];
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;
	  {
	    key = new Uint32Array(key);
	  }

	  for (i = 0, il = password.length; i < il; ++i) {
	    this.updateKeys(key, password[i] & 0xff);
	  }

	  return key;
	};
	/**
	 * build huffman table from length list.
	 * @param {!(Array.<number>|Uint8Array)} lengths length list.
	 * @return {!Array} huffman table.
	 */


	Zlib$1.Huffman.buildHuffmanTable = function (lengths) {
	  /** @type {number} length list size. */
	  var listSize = lengths.length;
	  /** @type {number} max code length for table size. */

	  var maxCodeLength = 0;
	  /** @type {number} min code length for table size. */

	  var minCodeLength = Number.POSITIVE_INFINITY;
	  /** @type {number} table size. */

	  var size;
	  /** @type {!(Array|Uint8Array)} huffman code table. */

	  var table;
	  /** @type {number} bit length. */

	  var bitLength;
	  /** @type {number} huffman code. */

	  var code;
	  /**
	   * サイズが 2^maxlength 個のテーブルを埋めるためのスキップ長.
	   * @type {number} skip length for table filling.
	   */

	  var skip;
	  /** @type {number} reversed code. */

	  var reversed;
	  /** @type {number} reverse temp. */

	  var rtemp;
	  /** @type {number} loop counter. */

	  var i;
	  /** @type {number} loop limit. */

	  var il;
	  /** @type {number} loop counter. */

	  var j;
	  /** @type {number} table value. */

	  var value; // Math.max は遅いので最長の値は for-loop で取得する

	  for (i = 0, il = listSize; i < il; ++i) {
	    if (lengths[i] > maxCodeLength) {
	      maxCodeLength = lengths[i];
	    }

	    if (lengths[i] < minCodeLength) {
	      minCodeLength = lengths[i];
	    }
	  }

	  size = 1 << maxCodeLength;
	  table = new Uint32Array(size); // ビット長の短い順からハフマン符号を割り当てる

	  for (bitLength = 1, code = 0, skip = 2; bitLength <= maxCodeLength;) {
	    for (i = 0; i < listSize; ++i) {
	      if (lengths[i] === bitLength) {
	        // ビットオーダーが逆になるためビット長分並びを反転する
	        for (reversed = 0, rtemp = code, j = 0; j < bitLength; ++j) {
	          reversed = reversed << 1 | rtemp & 1;
	          rtemp >>= 1;
	        } // 最大ビット長をもとにテーブルを作るため、
	        // 最大ビット長以外では 0 / 1 どちらでも良い箇所ができる
	        // そのどちらでも良い場所は同じ値で埋めることで
	        // 本来のビット長以上のビット数取得しても問題が起こらないようにする


	        value = bitLength << 16 | i;

	        for (j = reversed; j < size; j += skip) {
	          table[j] = value;
	        }

	        ++code;
	      }
	    } // 次のビット長へ


	    ++bitLength;
	    code <<= 1;
	    skip <<= 1;
	  }

	  return [table, maxCodeLength, minCodeLength];
	}; //-----------------------------------------------------------------------------

	/** @define {number} buffer block size. */


	var ZLIB_RAW_INFLATE_BUFFER_SIZE$1 = 0x8000; // [ 0x8000 >= ZLIB_BUFFER_BLOCK_SIZE ]
	//-----------------------------------------------------------------------------

	var buildHuffmanTable$1 = Zlib$1.Huffman.buildHuffmanTable;
	/**
	 * @constructor
	 * @param {!(Uint8Array|Array.<number>)} input input buffer.
	 * @param {Object} opt_params option parameter.
	 *
	 * opt_params は以下のプロパティを指定する事ができます。
	 *   - index: input buffer の deflate コンテナの開始位置.
	 *   - blockSize: バッファのブロックサイズ.
	 *   - bufferType: Zlib.RawInflate.BufferType の値によってバッファの管理方法を指定する.
	 *   - resize: 確保したバッファが実際の大きさより大きかった場合に切り詰める.
	 */

	Zlib$1.RawInflate = function (input, opt_params) {
	  /** @type {!(Array.<number>|Uint8Array)} inflated buffer */
	  this.buffer;
	  /** @type {!Array.<(Array.<number>|Uint8Array)>} */

	  this.blocks = [];
	  /** @type {number} block size. */

	  this.bufferSize = ZLIB_RAW_INFLATE_BUFFER_SIZE$1;
	  /** @type {!number} total output buffer pointer. */

	  this.totalpos = 0;
	  /** @type {!number} input buffer pointer. */

	  this.ip = 0;
	  /** @type {!number} bit stream reader buffer. */

	  this.bitsbuf = 0;
	  /** @type {!number} bit stream reader buffer size. */

	  this.bitsbuflen = 0;
	  /** @type {!(Array.<number>|Uint8Array)} input buffer. */

	  this.input = new Uint8Array(input);
	  /** @type {!(Uint8Array|Array.<number>)} output buffer. */

	  this.output;
	  /** @type {!number} output buffer pointer. */

	  this.op;
	  /** @type {boolean} is final block flag. */

	  this.bfinal = false;
	  /** @type {Zlib.RawInflate.BufferType} buffer management. */

	  this.bufferType = Zlib$1.RawInflate.BufferType.ADAPTIVE;
	  /** @type {boolean} resize flag for memory size optimization. */

	  this.resize = false; // option parameters

	  if (opt_params || !(opt_params = {})) {
	    if (opt_params['index']) {
	      this.ip = opt_params['index'];
	    }

	    if (opt_params['bufferSize']) {
	      this.bufferSize = opt_params['bufferSize'];
	    }

	    if (opt_params['bufferType']) {
	      this.bufferType = opt_params['bufferType'];
	    }

	    if (opt_params['resize']) {
	      this.resize = opt_params['resize'];
	    }
	  } // initialize


	  switch (this.bufferType) {
	    case Zlib$1.RawInflate.BufferType.BLOCK:
	      this.op = Zlib$1.RawInflate.MaxBackwardLength;
	      this.output = new Uint8Array(Zlib$1.RawInflate.MaxBackwardLength + this.bufferSize + Zlib$1.RawInflate.MaxCopyLength);
	      break;

	    case Zlib$1.RawInflate.BufferType.ADAPTIVE:
	      this.op = 0;
	      this.output = new Uint8Array(this.bufferSize);
	      break;

	    default:
	      throw new Error('invalid inflate mode');
	  }
	};
	/**
	 * @enum {number}
	 */


	Zlib$1.RawInflate.BufferType = {
	  BLOCK: 0,
	  ADAPTIVE: 1
	};
	/**
	 * decompress.
	 * @return {!(Uint8Array|Array.<number>)} inflated buffer.
	 */

	Zlib$1.RawInflate.prototype.decompress = function () {
	  while (!this.bfinal) {
	    this.parseBlock();
	  }

	  switch (this.bufferType) {
	    case Zlib$1.RawInflate.BufferType.BLOCK:
	      return this.concatBufferBlock();

	    case Zlib$1.RawInflate.BufferType.ADAPTIVE:
	      return this.concatBufferDynamic();

	    default:
	      throw new Error('invalid inflate mode');
	  }
	};
	/**
	 * @const
	 * @type {number} max backward length for LZ77.
	 */


	Zlib$1.RawInflate.MaxBackwardLength = 32768;
	/**
	 * @const
	 * @type {number} max copy length for LZ77.
	 */

	Zlib$1.RawInflate.MaxCopyLength = 258;
	/**
	 * huffman order
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */

	Zlib$1.RawInflate.Order = function (table) {
	  return new Uint16Array(table);
	}([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
	/**
	 * huffman length code table.
	 * @const
	 * @type {!(Array.<number>|Uint16Array)}
	 */


	Zlib$1.RawInflate.LengthCodeTable = function (table) {
	  return new Uint16Array(table);
	}([0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b, 0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b, 0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3, 0x00e3, 0x0102, 0x0102, 0x0102]);
	/**
	 * huffman length extra-bits table.
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */


	Zlib$1.RawInflate.LengthExtraTable = function (table) {
	  return new Uint8Array(table);
	}([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
	/**
	 * huffman dist code table.
	 * @const
	 * @type {!(Array.<number>|Uint16Array)}
	 */


	Zlib$1.RawInflate.DistCodeTable = function (table) {
	  return new Uint16Array(table);
	}([0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001]);
	/**
	 * huffman dist extra-bits table.
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */


	Zlib$1.RawInflate.DistExtraTable = function (table) {
	  return new Uint8Array(table);
	}([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
	/**
	 * fixed huffman length code table
	 * @const
	 * @type {!Array}
	 */


	Zlib$1.RawInflate.FixedLiteralLengthTable = function (table) {
	  return table;
	}(function () {
	  var lengths = new Uint8Array(288);
	  var i, il;

	  for (i = 0, il = lengths.length; i < il; ++i) {
	    lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8;
	  }

	  return buildHuffmanTable$1(lengths);
	}());
	/**
	 * fixed huffman distance code table
	 * @const
	 * @type {!Array}
	 */


	Zlib$1.RawInflate.FixedDistanceTable = function (table) {
	  return table;
	}(function () {
	  var lengths = new Uint8Array(30);
	  var i, il;

	  for (i = 0, il = lengths.length; i < il; ++i) {
	    lengths[i] = 5;
	  }

	  return buildHuffmanTable$1(lengths);
	}());
	/**
	 * parse deflated block.
	 */


	Zlib$1.RawInflate.prototype.parseBlock = function () {
	  /** @type {number} header */
	  var hdr = this.readBits(3); // BFINAL

	  if (hdr & 0x1) {
	    this.bfinal = true;
	  } // BTYPE


	  hdr >>>= 1;

	  switch (hdr) {
	    // uncompressed
	    case 0:
	      this.parseUncompressedBlock();
	      break;
	    // fixed huffman

	    case 1:
	      this.parseFixedHuffmanBlock();
	      break;
	    // dynamic huffman

	    case 2:
	      this.parseDynamicHuffmanBlock();
	      break;
	    // reserved or other

	    default:
	      throw new Error('unknown BTYPE: ' + hdr);
	  }
	};
	/**
	 * read inflate bits
	 * @param {number} length bits length.
	 * @return {number} read bits.
	 */


	Zlib$1.RawInflate.prototype.readBits = function (length) {
	  var bitsbuf = this.bitsbuf;
	  var bitsbuflen = this.bitsbuflen;
	  var input = this.input;
	  var ip = this.ip;
	  /** @type {number} */

	  var inputLength = input.length;
	  /** @type {number} input and output byte. */

	  var octet; // input byte

	  if (ip + (length - bitsbuflen + 7 >> 3) >= inputLength) {
	    throw new Error('input buffer is broken');
	  } // not enough buffer


	  while (bitsbuflen < length) {
	    bitsbuf |= input[ip++] << bitsbuflen;
	    bitsbuflen += 8;
	  } // output byte


	  octet = bitsbuf &
	  /* MASK */
	  (1 << length) - 1;
	  bitsbuf >>>= length;
	  bitsbuflen -= length;
	  this.bitsbuf = bitsbuf;
	  this.bitsbuflen = bitsbuflen;
	  this.ip = ip;
	  return octet;
	};
	/**
	 * read huffman code using table
	 * @param {!(Array.<number>|Uint8Array|Uint16Array)} table huffman code table.
	 * @return {number} huffman code.
	 */


	Zlib$1.RawInflate.prototype.readCodeByTable = function (table) {
	  var bitsbuf = this.bitsbuf;
	  var bitsbuflen = this.bitsbuflen;
	  var input = this.input;
	  var ip = this.ip;
	  /** @type {number} */

	  var inputLength = input.length;
	  /** @type {!(Array.<number>|Uint8Array)} huffman code table */

	  var codeTable = table[0];
	  /** @type {number} */

	  var maxCodeLength = table[1];
	  /** @type {number} code length & code (16bit, 16bit) */

	  var codeWithLength;
	  /** @type {number} code bits length */

	  var codeLength; // not enough buffer

	  while (bitsbuflen < maxCodeLength) {
	    if (ip >= inputLength) {
	      break;
	    }

	    bitsbuf |= input[ip++] << bitsbuflen;
	    bitsbuflen += 8;
	  } // read max length


	  codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
	  codeLength = codeWithLength >>> 16;

	  if (codeLength > bitsbuflen) {
	    throw new Error('invalid code length: ' + codeLength);
	  }

	  this.bitsbuf = bitsbuf >> codeLength;
	  this.bitsbuflen = bitsbuflen - codeLength;
	  this.ip = ip;
	  return codeWithLength & 0xffff;
	};
	/**
	 * parse uncompressed block.
	 */


	Zlib$1.RawInflate.prototype.parseUncompressedBlock = function () {
	  var input = this.input;
	  var ip = this.ip;
	  var output = this.output;
	  var op = this.op;
	  /** @type {number} */

	  var inputLength = input.length;
	  /** @type {number} block length */

	  var len;
	  /** @type {number} number for check block length */

	  var nlen;
	  /** @type {number} output buffer length */

	  var olength = output.length;
	  /** @type {number} copy counter */

	  var preCopy; // skip buffered header bits

	  this.bitsbuf = 0;
	  this.bitsbuflen = 0; // len

	  if (ip + 1 >= inputLength) {
	    throw new Error('invalid uncompressed block header: LEN');
	  }

	  len = input[ip++] | input[ip++] << 8; // nlen

	  if (ip + 1 >= inputLength) {
	    throw new Error('invalid uncompressed block header: NLEN');
	  }

	  nlen = input[ip++] | input[ip++] << 8; // check len & nlen

	  if (len === ~nlen) {
	    throw new Error('invalid uncompressed block header: length verify');
	  } // check size


	  if (ip + len > input.length) {
	    throw new Error('input buffer is broken');
	  } // expand buffer


	  switch (this.bufferType) {
	    case Zlib$1.RawInflate.BufferType.BLOCK:
	      // pre copy
	      while (op + len > output.length) {
	        preCopy = olength - op;
	        len -= preCopy;
	        {
	          output.set(input.subarray(ip, ip + preCopy), op);
	          op += preCopy;
	          ip += preCopy;
	        }
	        this.op = op;
	        output = this.expandBufferBlock();
	        op = this.op;
	      }

	      break;

	    case Zlib$1.RawInflate.BufferType.ADAPTIVE:
	      while (op + len > output.length) {
	        output = this.expandBufferAdaptive({
	          fixRatio: 2
	        });
	      }

	      break;

	    default:
	      throw new Error('invalid inflate mode');
	  } // copy


	  {
	    output.set(input.subarray(ip, ip + len), op);
	    op += len;
	    ip += len;
	  }
	  this.ip = ip;
	  this.op = op;
	  this.output = output;
	};
	/**
	 * parse fixed huffman block.
	 */


	Zlib$1.RawInflate.prototype.parseFixedHuffmanBlock = function () {
	  switch (this.bufferType) {
	    case Zlib$1.RawInflate.BufferType.ADAPTIVE:
	      this.decodeHuffmanAdaptive(Zlib$1.RawInflate.FixedLiteralLengthTable, Zlib$1.RawInflate.FixedDistanceTable);
	      break;

	    case Zlib$1.RawInflate.BufferType.BLOCK:
	      this.decodeHuffmanBlock(Zlib$1.RawInflate.FixedLiteralLengthTable, Zlib$1.RawInflate.FixedDistanceTable);
	      break;

	    default:
	      throw new Error('invalid inflate mode');
	  }
	};
	/**
	 * parse dynamic huffman block.
	 */


	Zlib$1.RawInflate.prototype.parseDynamicHuffmanBlock = function () {
	  /** @type {number} number of literal and length codes. */
	  var hlit = this.readBits(5) + 257;
	  /** @type {number} number of distance codes. */

	  var hdist = this.readBits(5) + 1;
	  /** @type {number} number of code lengths. */

	  var hclen = this.readBits(4) + 4;
	  /** @type {!(Uint8Array|Array.<number>)} code lengths. */

	  var codeLengths = new Uint8Array(Zlib$1.RawInflate.Order.length);
	  /** @type {!Array} code lengths table. */

	  var codeLengthsTable;
	  /** @type {!(Uint8Array|Array.<number>)} literal and length code table. */

	  var litlenTable;
	  /** @type {!(Uint8Array|Array.<number>)} distance code table. */

	  var distTable;
	  /** @type {!(Uint8Array|Array.<number>)} code length table. */

	  var lengthTable;
	  /** @type {number} */

	  var code;
	  /** @type {number} */

	  var prev;
	  /** @type {number} */

	  var repeat;
	  /** @type {number} loop counter. */

	  var i;
	  /** @type {number} loop limit. */

	  var il; // decode code lengths

	  for (i = 0; i < hclen; ++i) {
	    codeLengths[Zlib$1.RawInflate.Order[i]] = this.readBits(3);
	  } // decode length table


	  codeLengthsTable = buildHuffmanTable$1(codeLengths);
	  lengthTable = new Uint8Array(hlit + hdist);

	  for (i = 0, il = hlit + hdist; i < il;) {
	    code = this.readCodeByTable(codeLengthsTable);

	    switch (code) {
	      case 16:
	        repeat = 3 + this.readBits(2);

	        while (repeat--) {
	          lengthTable[i++] = prev;
	        }

	        break;

	      case 17:
	        repeat = 3 + this.readBits(3);

	        while (repeat--) {
	          lengthTable[i++] = 0;
	        }

	        prev = 0;
	        break;

	      case 18:
	        repeat = 11 + this.readBits(7);

	        while (repeat--) {
	          lengthTable[i++] = 0;
	        }

	        prev = 0;
	        break;

	      default:
	        lengthTable[i++] = code;
	        prev = code;
	        break;
	    }
	  }

	  litlenTable = buildHuffmanTable$1(lengthTable.subarray(0, hlit));
	  distTable = buildHuffmanTable$1(lengthTable.subarray(hlit));

	  switch (this.bufferType) {
	    case Zlib$1.RawInflate.BufferType.ADAPTIVE:
	      this.decodeHuffmanAdaptive(litlenTable, distTable);
	      break;

	    case Zlib$1.RawInflate.BufferType.BLOCK:
	      this.decodeHuffmanBlock(litlenTable, distTable);
	      break;

	    default:
	      throw new Error('invalid inflate mode');
	  }
	};
	/**
	 * decode huffman code
	 * @param {!(Array.<number>|Uint16Array)} litlen literal and length code table.
	 * @param {!(Array.<number>|Uint8Array)} dist distination code table.
	 */


	Zlib$1.RawInflate.prototype.decodeHuffmanBlock = function (litlen, dist) {
	  var output = this.output;
	  var op = this.op;
	  this.currentLitlenTable = litlen;
	  /** @type {number} output position limit. */

	  var olength = output.length - Zlib$1.RawInflate.MaxCopyLength;
	  /** @type {number} huffman code. */

	  var code;
	  /** @type {number} table index. */

	  var ti;
	  /** @type {number} huffman code distination. */

	  var codeDist;
	  /** @type {number} huffman code length. */

	  var codeLength;
	  var lengthCodeTable = Zlib$1.RawInflate.LengthCodeTable;
	  var lengthExtraTable = Zlib$1.RawInflate.LengthExtraTable;
	  var distCodeTable = Zlib$1.RawInflate.DistCodeTable;
	  var distExtraTable = Zlib$1.RawInflate.DistExtraTable;

	  while ((code = this.readCodeByTable(litlen)) !== 256) {
	    // literal
	    if (code < 256) {
	      if (op >= olength) {
	        this.op = op;
	        output = this.expandBufferBlock();
	        op = this.op;
	      }

	      output[op++] = code;
	      continue;
	    } // length code


	    ti = code - 257;
	    codeLength = lengthCodeTable[ti];

	    if (lengthExtraTable[ti] > 0) {
	      codeLength += this.readBits(lengthExtraTable[ti]);
	    } // dist code


	    code = this.readCodeByTable(dist);
	    codeDist = distCodeTable[code];

	    if (distExtraTable[code] > 0) {
	      codeDist += this.readBits(distExtraTable[code]);
	    } // lz77 decode


	    if (op >= olength) {
	      this.op = op;
	      output = this.expandBufferBlock();
	      op = this.op;
	    }

	    while (codeLength--) {
	      output[op] = output[op++ - codeDist];
	    }
	  }

	  while (this.bitsbuflen >= 8) {
	    this.bitsbuflen -= 8;
	    this.ip--;
	  }

	  this.op = op;
	};
	/**
	 * decode huffman code (adaptive)
	 * @param {!(Array.<number>|Uint16Array)} litlen literal and length code table.
	 * @param {!(Array.<number>|Uint8Array)} dist distination code table.
	 */


	Zlib$1.RawInflate.prototype.decodeHuffmanAdaptive = function (litlen, dist) {
	  var output = this.output;
	  var op = this.op;
	  this.currentLitlenTable = litlen;
	  /** @type {number} output position limit. */

	  var olength = output.length;
	  /** @type {number} huffman code. */

	  var code;
	  /** @type {number} table index. */

	  var ti;
	  /** @type {number} huffman code distination. */

	  var codeDist;
	  /** @type {number} huffman code length. */

	  var codeLength;
	  var lengthCodeTable = Zlib$1.RawInflate.LengthCodeTable;
	  var lengthExtraTable = Zlib$1.RawInflate.LengthExtraTable;
	  var distCodeTable = Zlib$1.RawInflate.DistCodeTable;
	  var distExtraTable = Zlib$1.RawInflate.DistExtraTable;

	  while ((code = this.readCodeByTable(litlen)) !== 256) {
	    // literal
	    if (code < 256) {
	      if (op >= olength) {
	        output = this.expandBufferAdaptive();
	        olength = output.length;
	      }

	      output[op++] = code;
	      continue;
	    } // length code


	    ti = code - 257;
	    codeLength = lengthCodeTable[ti];

	    if (lengthExtraTable[ti] > 0) {
	      codeLength += this.readBits(lengthExtraTable[ti]);
	    } // dist code


	    code = this.readCodeByTable(dist);
	    codeDist = distCodeTable[code];

	    if (distExtraTable[code] > 0) {
	      codeDist += this.readBits(distExtraTable[code]);
	    } // lz77 decode


	    if (op + codeLength > olength) {
	      output = this.expandBufferAdaptive();
	      olength = output.length;
	    }

	    while (codeLength--) {
	      output[op] = output[op++ - codeDist];
	    }
	  }

	  while (this.bitsbuflen >= 8) {
	    this.bitsbuflen -= 8;
	    this.ip--;
	  }

	  this.op = op;
	};
	/**
	 * expand output buffer.
	 * @param {Object=} opt_param option parameters.
	 * @return {!(Array.<number>|Uint8Array)} output buffer.
	 */


	Zlib$1.RawInflate.prototype.expandBufferBlock = function (opt_param) {
	  /** @type {!(Array.<number>|Uint8Array)} store buffer. */
	  var buffer = new Uint8Array(this.op - Zlib$1.RawInflate.MaxBackwardLength);
	  /** @type {number} backward base point */

	  var backward = this.op - Zlib$1.RawInflate.MaxBackwardLength;
	  var output = this.output; // copy to output buffer

	  {
	    buffer.set(output.subarray(Zlib$1.RawInflate.MaxBackwardLength, buffer.length));
	  }
	  this.blocks.push(buffer);
	  this.totalpos += buffer.length; // copy to backward buffer

	  {
	    output.set(output.subarray(backward, backward + Zlib$1.RawInflate.MaxBackwardLength));
	  }
	  this.op = Zlib$1.RawInflate.MaxBackwardLength;
	  return output;
	};
	/**
	 * expand output buffer. (adaptive)
	 * @param {Object=} opt_param option parameters.
	 * @return {!(Array.<number>|Uint8Array)} output buffer pointer.
	 */


	Zlib$1.RawInflate.prototype.expandBufferAdaptive = function (opt_param) {
	  /** @type {!(Array.<number>|Uint8Array)} store buffer. */
	  var buffer;
	  /** @type {number} expantion ratio. */

	  var ratio = this.input.length / this.ip + 1 | 0;
	  /** @type {number} maximum number of huffman code. */

	  var maxHuffCode;
	  /** @type {number} new output buffer size. */

	  var newSize;
	  /** @type {number} max inflate size. */

	  var maxInflateSize;
	  var input = this.input;
	  var output = this.output;

	  if (opt_param) {
	    if (typeof opt_param.fixRatio === 'number') {
	      ratio = opt_param.fixRatio;
	    }

	    if (typeof opt_param.addRatio === 'number') {
	      ratio += opt_param.addRatio;
	    }
	  } // calculate new buffer size


	  if (ratio < 2) {
	    maxHuffCode = (input.length - this.ip) / this.currentLitlenTable[2];
	    maxInflateSize = maxHuffCode / 2 * 258 | 0;
	    newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1;
	  } else {
	    newSize = output.length * ratio;
	  } // buffer expantion


	  {
	    buffer = new Uint8Array(newSize);
	    buffer.set(output);
	  }
	  this.output = buffer;
	  return this.output;
	};
	/**
	 * concat output buffer.
	 * @return {!(Array.<number>|Uint8Array)} output buffer.
	 */


	Zlib$1.RawInflate.prototype.concatBufferBlock = function () {
	  /** @type {number} buffer pointer. */
	  var pos = 0;
	  /** @type {number} buffer pointer. */

	  var limit = this.totalpos + (this.op - Zlib$1.RawInflate.MaxBackwardLength);
	  /** @type {!(Array.<number>|Uint8Array)} output block array. */

	  var output = this.output;
	  /** @type {!Array} blocks array. */

	  var blocks = this.blocks;
	  /** @type {!(Array.<number>|Uint8Array)} output block array. */

	  var block;
	  /** @type {!(Array.<number>|Uint8Array)} output buffer. */

	  var buffer = new Uint8Array(limit);
	  /** @type {number} loop counter. */

	  var i;
	  /** @type {number} loop limiter. */

	  var il;
	  /** @type {number} loop counter. */

	  var j;
	  /** @type {number} loop limiter. */

	  var jl; // single buffer

	  if (blocks.length === 0) {
	    return this.output.subarray(Zlib$1.RawInflate.MaxBackwardLength, this.op);
	  } // copy to buffer


	  for (i = 0, il = blocks.length; i < il; ++i) {
	    block = blocks[i];

	    for (j = 0, jl = block.length; j < jl; ++j) {
	      buffer[pos++] = block[j];
	    }
	  } // current buffer


	  for (i = Zlib$1.RawInflate.MaxBackwardLength, il = this.op; i < il; ++i) {
	    buffer[pos++] = output[i];
	  }

	  this.blocks = [];
	  this.buffer = buffer;
	  return this.buffer;
	};
	/**
	 * concat output buffer. (dynamic)
	 * @return {!(Array.<number>|Uint8Array)} output buffer.
	 */


	Zlib$1.RawInflate.prototype.concatBufferDynamic = function () {
	  /** @type {Array.<number>|Uint8Array} output buffer. */
	  var buffer;
	  var op = this.op;
	  {
	    if (this.resize) {
	      buffer = new Uint8Array(op);
	      buffer.set(this.output.subarray(0, op));
	    } else {
	      buffer = this.output.subarray(0, op);
	    }
	  }
	  this.buffer = buffer;
	  return this.buffer;
	};

	var buildHuffmanTable$1 = Zlib$1.Huffman.buildHuffmanTable;
	/**
	 * @param {!(Uint8Array|Array.<number>)} input input buffer.
	 * @param {number} ip input buffer pointer.
	 * @param {number=} opt_buffersize buffer block size.
	 * @constructor
	 */

	Zlib$1.RawInflateStream = function (input, ip, opt_buffersize) {
	  /** @type {!Array.<(Array|Uint8Array)>} */
	  this.blocks = [];
	  /** @type {number} block size. */

	  this.bufferSize = opt_buffersize ? opt_buffersize : ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE$1;
	  /** @type {!number} total output buffer pointer. */

	  this.totalpos = 0;
	  /** @type {!number} input buffer pointer. */

	  this.ip = ip === void 0 ? 0 : ip;
	  /** @type {!number} bit stream reader buffer. */

	  this.bitsbuf = 0;
	  /** @type {!number} bit stream reader buffer size. */

	  this.bitsbuflen = 0;
	  /** @type {!(Array|Uint8Array)} input buffer. */

	  this.input = new Uint8Array(input);
	  /** @type {!(Uint8Array|Array)} output buffer. */

	  this.output = new Uint8Array(this.bufferSize);
	  /** @type {!number} output buffer pointer. */

	  this.op = 0;
	  /** @type {boolean} is final block flag. */

	  this.bfinal = false;
	  /** @type {number} uncompressed block length. */

	  this.blockLength;
	  /** @type {boolean} resize flag for memory size optimization. */

	  this.resize = false;
	  /** @type {Array} */

	  this.litlenTable;
	  /** @type {Array} */

	  this.distTable;
	  /** @type {number} */

	  this.sp = 0; // stream pointer

	  /** @type {Zlib.RawInflateStream.Status} */

	  this.status = Zlib$1.RawInflateStream.Status.INITIALIZED; //
	  // backup
	  //

	  /** @type {!number} */

	  this.ip_;
	  /** @type {!number} */

	  this.bitsbuflen_;
	  /** @type {!number} */

	  this.bitsbuf_;
	};
	/**
	 * @enum {number}
	 */


	Zlib$1.RawInflateStream.BlockType = {
	  UNCOMPRESSED: 0,
	  FIXED: 1,
	  DYNAMIC: 2
	};
	/**
	 * @enum {number}
	 */

	Zlib$1.RawInflateStream.Status = {
	  INITIALIZED: 0,
	  BLOCK_HEADER_START: 1,
	  BLOCK_HEADER_END: 2,
	  BLOCK_BODY_START: 3,
	  BLOCK_BODY_END: 4,
	  DECODE_BLOCK_START: 5,
	  DECODE_BLOCK_END: 6
	};
	/**
	 * decompress.
	 * @return {!(Uint8Array|Array)} inflated buffer.
	 */

	Zlib$1.RawInflateStream.prototype.decompress = function (newInput, ip) {
	  /** @type {boolean} */
	  var stop = false;

	  if (newInput !== void 0) {
	    this.input = newInput;
	  }

	  if (ip !== void 0) {
	    this.ip = ip;
	  } // decompress


	  while (!stop) {
	    switch (this.status) {
	      // block header
	      case Zlib$1.RawInflateStream.Status.INITIALIZED:
	      case Zlib$1.RawInflateStream.Status.BLOCK_HEADER_START:
	        if (this.readBlockHeader() < 0) {
	          stop = true;
	        }

	        break;
	      // block body

	      case Zlib$1.RawInflateStream.Status.BLOCK_HEADER_END:
	      /* FALLTHROUGH */

	      case Zlib$1.RawInflateStream.Status.BLOCK_BODY_START:
	        switch (this.currentBlockType) {
	          case Zlib$1.RawInflateStream.BlockType.UNCOMPRESSED:
	            if (this.readUncompressedBlockHeader() < 0) {
	              stop = true;
	            }

	            break;

	          case Zlib$1.RawInflateStream.BlockType.FIXED:
	            if (this.parseFixedHuffmanBlock() < 0) {
	              stop = true;
	            }

	            break;

	          case Zlib$1.RawInflateStream.BlockType.DYNAMIC:
	            if (this.parseDynamicHuffmanBlock() < 0) {
	              stop = true;
	            }

	            break;
	        }

	        break;
	      // decode data

	      case Zlib$1.RawInflateStream.Status.BLOCK_BODY_END:
	      case Zlib$1.RawInflateStream.Status.DECODE_BLOCK_START:
	        switch (this.currentBlockType) {
	          case Zlib$1.RawInflateStream.BlockType.UNCOMPRESSED:
	            if (this.parseUncompressedBlock() < 0) {
	              stop = true;
	            }

	            break;

	          case Zlib$1.RawInflateStream.BlockType.FIXED:
	          /* FALLTHROUGH */

	          case Zlib$1.RawInflateStream.BlockType.DYNAMIC:
	            if (this.decodeHuffman() < 0) {
	              stop = true;
	            }

	            break;
	        }

	        break;

	      case Zlib$1.RawInflateStream.Status.DECODE_BLOCK_END:
	        if (this.bfinal) {
	          stop = true;
	        } else {
	          this.status = Zlib$1.RawInflateStream.Status.INITIALIZED;
	        }

	        break;
	    }
	  }

	  return this.concatBuffer();
	};
	/**
	 * @const
	 * @type {number} max backward length for LZ77.
	 */


	Zlib$1.RawInflateStream.MaxBackwardLength = 32768;
	/**
	 * @const
	 * @type {number} max copy length for LZ77.
	 */

	Zlib$1.RawInflateStream.MaxCopyLength = 258;
	/**
	 * huffman order
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */

	Zlib$1.RawInflateStream.Order = function (table) {
	  return new Uint16Array(table);
	}([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
	/**
	 * huffman length code table.
	 * @const
	 * @type {!(Array.<number>|Uint16Array)}
	 */


	Zlib$1.RawInflateStream.LengthCodeTable = function (table) {
	  return new Uint16Array(table);
	}([0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b, 0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b, 0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3, 0x00e3, 0x0102, 0x0102, 0x0102]);
	/**
	 * huffman length extra-bits table.
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */


	Zlib$1.RawInflateStream.LengthExtraTable = function (table) {
	  return new Uint8Array(table);
	}([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
	/**
	 * huffman dist code table.
	 * @const
	 * @type {!(Array.<number>|Uint16Array)}
	 */


	Zlib$1.RawInflateStream.DistCodeTable = function (table) {
	  return new Uint16Array(table);
	}([0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001]);
	/**
	 * huffman dist extra-bits table.
	 * @const
	 * @type {!(Array.<number>|Uint8Array)}
	 */


	Zlib$1.RawInflateStream.DistExtraTable = function (table) {
	  return new Uint8Array(table);
	}([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
	/**
	 * fixed huffman length code table
	 * @const
	 * @type {!Array}
	 */


	Zlib$1.RawInflateStream.FixedLiteralLengthTable = function (table) {
	  return table;
	}(function () {
	  var lengths = new Uint8Array(288);
	  var i, il;

	  for (i = 0, il = lengths.length; i < il; ++i) {
	    lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8;
	  }

	  return buildHuffmanTable$1(lengths);
	}());
	/**
	 * fixed huffman distance code table
	 * @const
	 * @type {!Array}
	 */


	Zlib$1.RawInflateStream.FixedDistanceTable = function (table) {
	  return table;
	}(function () {
	  var lengths = new Uint8Array(30);
	  var i, il;

	  for (i = 0, il = lengths.length; i < il; ++i) {
	    lengths[i] = 5;
	  }

	  return buildHuffmanTable$1(lengths);
	}());
	/**
	 * parse deflated block.
	 */


	Zlib$1.RawInflateStream.prototype.readBlockHeader = function () {
	  /** @type {number} header */
	  var hdr;
	  this.status = Zlib$1.RawInflateStream.Status.BLOCK_HEADER_START;
	  this.save_();

	  if ((hdr = this.readBits(3)) < 0) {
	    this.restore_();
	    return -1;
	  } // BFINAL


	  if (hdr & 0x1) {
	    this.bfinal = true;
	  } // BTYPE


	  hdr >>>= 1;

	  switch (hdr) {
	    case 0:
	      // uncompressed
	      this.currentBlockType = Zlib$1.RawInflateStream.BlockType.UNCOMPRESSED;
	      break;

	    case 1:
	      // fixed huffman
	      this.currentBlockType = Zlib$1.RawInflateStream.BlockType.FIXED;
	      break;

	    case 2:
	      // dynamic huffman
	      this.currentBlockType = Zlib$1.RawInflateStream.BlockType.DYNAMIC;
	      break;

	    default:
	      // reserved or other
	      throw new Error('unknown BTYPE: ' + hdr);
	  }

	  this.status = Zlib$1.RawInflateStream.Status.BLOCK_HEADER_END;
	};
	/**
	 * read inflate bits
	 * @param {number} length bits length.
	 * @return {number} read bits.
	 */


	Zlib$1.RawInflateStream.prototype.readBits = function (length) {
	  var bitsbuf = this.bitsbuf;
	  var bitsbuflen = this.bitsbuflen;
	  var input = this.input;
	  var ip = this.ip;
	  /** @type {number} input and output byte. */

	  var octet; // not enough buffer

	  while (bitsbuflen < length) {
	    // input byte
	    if (input.length <= ip) {
	      return -1;
	    }

	    octet = input[ip++]; // concat octet

	    bitsbuf |= octet << bitsbuflen;
	    bitsbuflen += 8;
	  } // output byte


	  octet = bitsbuf &
	  /* MASK */
	  (1 << length) - 1;
	  bitsbuf >>>= length;
	  bitsbuflen -= length;
	  this.bitsbuf = bitsbuf;
	  this.bitsbuflen = bitsbuflen;
	  this.ip = ip;
	  return octet;
	};
	/**
	 * read huffman code using table
	 * @param {Array} table huffman code table.
	 * @return {number} huffman code.
	 */


	Zlib$1.RawInflateStream.prototype.readCodeByTable = function (table) {
	  var bitsbuf = this.bitsbuf;
	  var bitsbuflen = this.bitsbuflen;
	  var input = this.input;
	  var ip = this.ip;
	  /** @type {!(Array|Uint8Array)} huffman code table */

	  var codeTable = table[0];
	  /** @type {number} */

	  var maxCodeLength = table[1];
	  /** @type {number} input byte */

	  var octet;
	  /** @type {number} code length & code (16bit, 16bit) */

	  var codeWithLength;
	  /** @type {number} code bits length */

	  var codeLength; // not enough buffer

	  while (bitsbuflen < maxCodeLength) {
	    if (input.length <= ip) {
	      return -1;
	    }

	    octet = input[ip++];
	    bitsbuf |= octet << bitsbuflen;
	    bitsbuflen += 8;
	  } // read max length


	  codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
	  codeLength = codeWithLength >>> 16;

	  if (codeLength > bitsbuflen) {
	    throw new Error('invalid code length: ' + codeLength);
	  }

	  this.bitsbuf = bitsbuf >> codeLength;
	  this.bitsbuflen = bitsbuflen - codeLength;
	  this.ip = ip;
	  return codeWithLength & 0xffff;
	};
	/**
	 * read uncompressed block header
	 */


	Zlib$1.RawInflateStream.prototype.readUncompressedBlockHeader = function () {
	  /** @type {number} block length */
	  var len;
	  /** @type {number} number for check block length */

	  var nlen;
	  var input = this.input;
	  var ip = this.ip;
	  this.status = Zlib$1.RawInflateStream.Status.BLOCK_BODY_START;

	  if (ip + 4 >= input.length) {
	    return -1;
	  }

	  len = input[ip++] | input[ip++] << 8;
	  nlen = input[ip++] | input[ip++] << 8; // check len & nlen

	  if (len === ~nlen) {
	    throw new Error('invalid uncompressed block header: length verify');
	  } // skip buffered header bits


	  this.bitsbuf = 0;
	  this.bitsbuflen = 0;
	  this.ip = ip;
	  this.blockLength = len;
	  this.status = Zlib$1.RawInflateStream.Status.BLOCK_BODY_END;
	};
	/**
	 * parse uncompressed block.
	 */


	Zlib$1.RawInflateStream.prototype.parseUncompressedBlock = function () {
	  var input = this.input;
	  var ip = this.ip;
	  var output = this.output;
	  var op = this.op;
	  var len = this.blockLength;
	  this.status = Zlib$1.RawInflateStream.Status.DECODE_BLOCK_START; // copy
	  // XXX: とりあえず素直にコピー

	  while (len--) {
	    if (op === output.length) {
	      output = this.expandBuffer({
	        fixRatio: 2
	      });
	    } // not enough input buffer


	    if (ip >= input.length) {
	      this.ip = ip;
	      this.op = op;
	      this.blockLength = len + 1; // コピーしてないので戻す

	      return -1;
	    }

	    output[op++] = input[ip++];
	  }

	  if (len < 0) {
	    this.status = Zlib$1.RawInflateStream.Status.DECODE_BLOCK_END;
	  }

	  this.ip = ip;
	  this.op = op;
	  return 0;
	};
	/**
	 * parse fixed huffman block.
	 */


	Zlib$1.RawInflateStream.prototype.parseFixedHuffmanBlock = function () {
	  this.status = Zlib$1.RawInflateStream.Status.BLOCK_BODY_START;
	  this.litlenTable = Zlib$1.RawInflateStream.FixedLiteralLengthTable;
	  this.distTable = Zlib$1.RawInflateStream.FixedDistanceTable;
	  this.status = Zlib$1.RawInflateStream.Status.BLOCK_BODY_END;
	  return 0;
	};
	/**
	 * オブジェクトのコンテキストを別のプロパティに退避する.
	 * @private
	 */


	Zlib$1.RawInflateStream.prototype.save_ = function () {
	  this.ip_ = this.ip;
	  this.bitsbuflen_ = this.bitsbuflen;
	  this.bitsbuf_ = this.bitsbuf;
	};
	/**
	 * 別のプロパティに退避したコンテキストを復元する.
	 * @private
	 */


	Zlib$1.RawInflateStream.prototype.restore_ = function () {
	  this.ip = this.ip_;
	  this.bitsbuflen = this.bitsbuflen_;
	  this.bitsbuf = this.bitsbuf_;
	};
	/**
	 * parse dynamic huffman block.
	 */


	Zlib$1.RawInflateStream.prototype.parseDynamicHuffmanBlock = function () {
	  /** @type {number} number of literal and length codes. */
	  var hlit;
	  /** @type {number} number of distance codes. */

	  var hdist;
	  /** @type {number} number of code lengths. */

	  var hclen;
	  /** @type {!(Uint8Array|Array)} code lengths. */

	  var codeLengths = new Uint8Array(Zlib$1.RawInflateStream.Order.length);
	  /** @type {!Array} code lengths table. */

	  var codeLengthsTable;
	  this.status = Zlib$1.RawInflateStream.Status.BLOCK_BODY_START;
	  this.save_();
	  hlit = this.readBits(5) + 257;
	  hdist = this.readBits(5) + 1;
	  hclen = this.readBits(4) + 4;

	  if (hlit < 0 || hdist < 0 || hclen < 0) {
	    this.restore_();
	    return -1;
	  }

	  try {
	    parseDynamicHuffmanBlockImpl.call(this);
	  } catch (e) {
	    this.restore_();
	    return -1;
	  }

	  function parseDynamicHuffmanBlockImpl() {
	    /** @type {number} */
	    var bits;
	    var code;
	    var prev = 0;
	    var repeat;
	    /** @type {!(Uint8Array|Array.<number>)} code length table. */

	    var lengthTable;
	    /** @type {number} loop counter. */

	    var i;
	    /** @type {number} loop limit. */

	    var il; // decode code lengths

	    for (i = 0; i < hclen; ++i) {
	      if ((bits = this.readBits(3)) < 0) {
	        throw new Error('not enough input');
	      }

	      codeLengths[Zlib$1.RawInflateStream.Order[i]] = bits;
	    } // decode length table


	    codeLengthsTable = buildHuffmanTable$1(codeLengths);
	    lengthTable = new Uint8Array(hlit + hdist);

	    for (i = 0, il = hlit + hdist; i < il;) {
	      code = this.readCodeByTable(codeLengthsTable);

	      if (code < 0) {
	        throw new Error('not enough input');
	      }

	      switch (code) {
	        case 16:
	          if ((bits = this.readBits(2)) < 0) {
	            throw new Error('not enough input');
	          }

	          repeat = 3 + bits;

	          while (repeat--) {
	            lengthTable[i++] = prev;
	          }

	          break;

	        case 17:
	          if ((bits = this.readBits(3)) < 0) {
	            throw new Error('not enough input');
	          }

	          repeat = 3 + bits;

	          while (repeat--) {
	            lengthTable[i++] = 0;
	          }

	          prev = 0;
	          break;

	        case 18:
	          if ((bits = this.readBits(7)) < 0) {
	            throw new Error('not enough input');
	          }

	          repeat = 11 + bits;

	          while (repeat--) {
	            lengthTable[i++] = 0;
	          }

	          prev = 0;
	          break;

	        default:
	          lengthTable[i++] = code;
	          prev = code;
	          break;
	      }
	    }

	    this.litlenTable = buildHuffmanTable$1(lengthTable.subarray(0, hlit));
	    this.distTable = buildHuffmanTable$1(lengthTable.subarray(hlit));
	  }

	  this.status = Zlib$1.RawInflateStream.Status.BLOCK_BODY_END;
	  return 0;
	};
	/**
	 * decode huffman code (dynamic)
	 * @return {(number|undefined)} -1 is error.
	 */


	Zlib$1.RawInflateStream.prototype.decodeHuffman = function () {
	  var output = this.output;
	  var op = this.op;
	  /** @type {number} huffman code. */

	  var code;
	  /** @type {number} table index. */

	  var ti;
	  /** @type {number} huffman code distination. */

	  var codeDist;
	  /** @type {number} huffman code length. */

	  var codeLength;
	  var litlen = this.litlenTable;
	  var dist = this.distTable;
	  var olength = output.length;
	  var bits;
	  this.status = Zlib$1.RawInflateStream.Status.DECODE_BLOCK_START;

	  while (true) {
	    this.save_();
	    code = this.readCodeByTable(litlen);

	    if (code < 0) {
	      this.op = op;
	      this.restore_();
	      return -1;
	    }

	    if (code === 256) {
	      break;
	    } // literal


	    if (code < 256) {
	      if (op === olength) {
	        output = this.expandBuffer();
	        olength = output.length;
	      }

	      output[op++] = code;
	      continue;
	    } // length code


	    ti = code - 257;
	    codeLength = Zlib$1.RawInflateStream.LengthCodeTable[ti];

	    if (Zlib$1.RawInflateStream.LengthExtraTable[ti] > 0) {
	      bits = this.readBits(Zlib$1.RawInflateStream.LengthExtraTable[ti]);

	      if (bits < 0) {
	        this.op = op;
	        this.restore_();
	        return -1;
	      }

	      codeLength += bits;
	    } // dist code


	    code = this.readCodeByTable(dist);

	    if (code < 0) {
	      this.op = op;
	      this.restore_();
	      return -1;
	    }

	    codeDist = Zlib$1.RawInflateStream.DistCodeTable[code];

	    if (Zlib$1.RawInflateStream.DistExtraTable[code] > 0) {
	      bits = this.readBits(Zlib$1.RawInflateStream.DistExtraTable[code]);

	      if (bits < 0) {
	        this.op = op;
	        this.restore_();
	        return -1;
	      }

	      codeDist += bits;
	    } // lz77 decode


	    if (op + codeLength >= olength) {
	      output = this.expandBuffer();
	      olength = output.length;
	    }

	    while (codeLength--) {
	      output[op] = output[op++ - codeDist];
	    } // break


	    if (this.ip === this.input.length) {
	      this.op = op;
	      return -1;
	    }
	  }

	  while (this.bitsbuflen >= 8) {
	    this.bitsbuflen -= 8;
	    this.ip--;
	  }

	  this.op = op;
	  this.status = Zlib$1.RawInflateStream.Status.DECODE_BLOCK_END;
	};
	/**
	 * expand output buffer. (dynamic)
	 * @param {Object=} opt_param option parameters.
	 * @return {!(Array|Uint8Array)} output buffer pointer.
	 */


	Zlib$1.RawInflateStream.prototype.expandBuffer = function (opt_param) {
	  /** @type {!(Array|Uint8Array)} store buffer. */
	  var buffer;
	  /** @type {number} expantion ratio. */

	  var ratio = this.input.length / this.ip + 1 | 0;
	  /** @type {number} maximum number of huffman code. */

	  var maxHuffCode;
	  /** @type {number} new output buffer size. */

	  var newSize;
	  /** @type {number} max inflate size. */

	  var maxInflateSize;
	  var input = this.input;
	  var output = this.output;

	  if (opt_param) {
	    if (typeof opt_param.fixRatio === 'number') {
	      ratio = opt_param.fixRatio;
	    }

	    if (typeof opt_param.addRatio === 'number') {
	      ratio += opt_param.addRatio;
	    }
	  } // calculate new buffer size


	  if (ratio < 2) {
	    maxHuffCode = (input.length - this.ip) / this.litlenTable[2];
	    maxInflateSize = maxHuffCode / 2 * 258 | 0;
	    newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1;
	  } else {
	    newSize = output.length * ratio;
	  } // buffer expantion


	  {
	    buffer = new Uint8Array(newSize);
	    buffer.set(output);
	  }
	  this.output = buffer;
	  return this.output;
	};
	/**
	 * concat output buffer. (dynamic)
	 * @return {!(Array|Uint8Array)} output buffer.
	 */


	Zlib$1.RawInflateStream.prototype.concatBuffer = function () {
	  /** @type {!(Array|Uint8Array)} output buffer. */
	  var buffer;
	  /** @type {number} */

	  var op = this.op;
	  /** @type {Uint8Array} */

	  var tmp;

	  if (this.resize) {
	    {
	      buffer = new Uint8Array(this.output.subarray(this.sp, op));
	    }
	  } else {
	    buffer = this.output.subarray(this.sp, op);
	  }

	  this.sp = op; // compaction

	  if (op > Zlib$1.RawInflateStream.MaxBackwardLength + this.bufferSize) {
	    this.op = this.sp = Zlib$1.RawInflateStream.MaxBackwardLength;
	    {
	      tmp =
	      /** @type {Uint8Array} */
	      this.output;
	      this.output = new Uint8Array(this.bufferSize + Zlib$1.RawInflateStream.MaxBackwardLength);
	      this.output.set(tmp.subarray(op - Zlib$1.RawInflateStream.MaxBackwardLength, op));
	    }
	  }

	  return buffer;
	};
	/**
	 * @constructor
	 * @param {!(Uint8Array|Array)} input deflated buffer.
	 * @param {Object=} opt_params option parameters.
	 *
	 * opt_params は以下のプロパティを指定する事ができます。
	 *   - index: input buffer の deflate コンテナの開始位置.
	 *   - blockSize: バッファのブロックサイズ.
	 *   - verify: 伸張が終わった後 adler-32 checksum の検証を行うか.
	 *   - bufferType: Zlib.Inflate.BufferType の値によってバッファの管理方法を指定する.
	 *       Zlib.Inflate.BufferType は Zlib.RawInflate.BufferType のエイリアス.
	 */


	Zlib$1.Inflate = function (input, opt_params) {
	  /** @type {number} */
	  var cmf;
	  /** @type {number} */

	  var flg;
	  /** @type {!(Uint8Array|Array)} */

	  this.input = input;
	  /** @type {number} */

	  this.ip = 0;
	  /** @type {Zlib.RawInflate} */

	  this.rawinflate;
	  /** @type {(boolean|undefined)} verify flag. */

	  this.verify; // option parameters

	  if (opt_params || !(opt_params = {})) {
	    if (opt_params['index']) {
	      this.ip = opt_params['index'];
	    }

	    if (opt_params['verify']) {
	      this.verify = opt_params['verify'];
	    }
	  } // Compression Method and Flags


	  cmf = input[this.ip++];
	  flg = input[this.ip++]; // compression method

	  switch (cmf & 0x0f) {
	    case Zlib$1.CompressionMethod.DEFLATE:
	      this.method = Zlib$1.CompressionMethod.DEFLATE;
	      break;

	    default:
	      throw new Error('unsupported compression method');
	  } // fcheck


	  if (((cmf << 8) + flg) % 31 !== 0) {
	    throw new Error('invalid fcheck flag:' + ((cmf << 8) + flg) % 31);
	  } // fdict (not supported)


	  if (flg & 0x20) {
	    throw new Error('fdict flag is not supported');
	  } // RawInflate


	  this.rawinflate = new Zlib$1.RawInflate(input, {
	    'index': this.ip,
	    'bufferSize': opt_params['bufferSize'],
	    'bufferType': opt_params['bufferType'],
	    'resize': opt_params['resize']
	  });
	};
	/**
	 * @enum {number}
	 */


	Zlib$1.Inflate.BufferType = Zlib$1.RawInflate.BufferType;
	/**
	 * decompress.
	 * @return {!(Uint8Array|Array)} inflated buffer.
	 */

	Zlib$1.Inflate.prototype.decompress = function () {
	  /** @type {!(Array|Uint8Array)} input buffer. */
	  var input = this.input;
	  /** @type {!(Uint8Array|Array)} inflated buffer. */

	  var buffer;
	  /** @type {number} adler-32 checksum */

	  var adler32;
	  buffer = this.rawinflate.decompress();
	  this.ip = this.rawinflate.ip; // verify adler-32

	  if (this.verify) {
	    adler32 = (input[this.ip++] << 24 | input[this.ip++] << 16 | input[this.ip++] << 8 | input[this.ip++]) >>> 0;

	    if (adler32 !== Zlib$1.Adler32(buffer)) {
	      throw new Error('invalid adler-32 checksum');
	    }
	  }

	  return buffer;
	};
	/* vim:set expandtab ts=2 sw=2 tw=80: */

	/**
	 * @param {!(Uint8Array|Array)} input deflated buffer.
	 * @constructor
	 */


	Zlib$1.InflateStream = function (input) {
	  /** @type {!(Uint8Array|Array)} */
	  this.input = input === void 0 ? new Uint8Array() : input;
	  /** @type {number} */

	  this.ip = 0;
	  /** @type {Zlib.RawInflateStream} */

	  this.rawinflate = new Zlib$1.RawInflateStream(this.input, this.ip);
	  /** @type {Zlib.CompressionMethod} */

	  this.method;
	  /** @type {!(Array|Uint8Array)} */

	  this.output = this.rawinflate.output;
	};
	/**
	 * decompress.
	 * @return {!(Uint8Array|Array)} inflated buffer.
	 */


	Zlib$1.InflateStream.prototype.decompress = function (input) {
	  /** @type {!(Uint8Array|Array)} inflated buffer. */
	  var buffer; // 新しい入力を入力バッファに結合する
	  // XXX Array, Uint8Array のチェックを行うか確認する

	  if (input !== void 0) {
	    {
	      var tmp = new Uint8Array(this.input.length + input.length);
	      tmp.set(this.input, 0);
	      tmp.set(input, this.input.length);
	      this.input = tmp;
	    }
	  }

	  if (this.method === void 0) {
	    if (this.readHeader() < 0) {
	      return new Uint8Array();
	    }
	  }

	  buffer = this.rawinflate.decompress(this.input, this.ip);

	  if (this.rawinflate.ip !== 0) {
	    this.input = this.input.subarray(this.rawinflate.ip);
	    this.ip = 0;
	  } // verify adler-32

	  /*
	  if (this.verify) {
	    adler32 =
	      input[this.ip++] << 24 | input[this.ip++] << 16 |
	      input[this.ip++] << 8 | input[this.ip++];
	     if (adler32 !== Zlib.Adler32(buffer)) {
	      throw new Error('invalid adler-32 checksum');
	    }
	  }
	  */


	  return buffer;
	};

	Zlib$1.InflateStream.prototype.readHeader = function () {
	  var ip = this.ip;
	  var input = this.input; // Compression Method and Flags

	  var cmf = input[ip++];
	  var flg = input[ip++];

	  if (cmf === void 0 || flg === void 0) {
	    return -1;
	  } // compression method


	  switch (cmf & 0x0f) {
	    case Zlib$1.CompressionMethod.DEFLATE:
	      this.method = Zlib$1.CompressionMethod.DEFLATE;
	      break;

	    default:
	      throw new Error('unsupported compression method');
	  } // fcheck


	  if (((cmf << 8) + flg) % 31 !== 0) {
	    throw new Error('invalid fcheck flag:' + ((cmf << 8) + flg) % 31);
	  } // fdict (not supported)


	  if (flg & 0x20) {
	    throw new Error('fdict flag is not supported');
	  }

	  this.ip = ip;
	};
	/**
	 * @fileoverview GZIP (RFC1952) 展開コンテナ実装.
	 */

	/**
	 * @constructor
	 * @param {!(Array|Uint8Array)} input input buffer.
	 * @param {Object=} opt_params option parameters.
	 */


	Zlib$1.Gunzip = function (input, opt_params) {
	  /** @type {!(Array.<number>|Uint8Array)} input buffer. */
	  this.input = input;
	  /** @type {number} input buffer pointer. */

	  this.ip = 0;
	  /** @type {Array.<Zlib.GunzipMember>} */

	  this.member = [];
	  /** @type {boolean} */

	  this.decompressed = false;
	};
	/**
	 * @return {Array.<Zlib.GunzipMember>}
	 */


	Zlib$1.Gunzip.prototype.getMembers = function () {
	  if (!this.decompressed) {
	    this.decompress();
	  }

	  return this.member.slice();
	};
	/**
	 * inflate gzip data.
	 * @return {!(Array.<number>|Uint8Array)} inflated buffer.
	 */


	Zlib$1.Gunzip.prototype.decompress = function () {
	  /** @type {number} input length. */
	  var il = this.input.length;

	  while (this.ip < il) {
	    this.decodeMember();
	  }

	  this.decompressed = true;
	  return this.concatMember();
	};
	/**
	 * decode gzip member.
	 */


	Zlib$1.Gunzip.prototype.decodeMember = function () {
	  /** @type {Zlib.GunzipMember} */
	  var member = new Zlib$1.GunzipMember();
	  /** @type {number} */

	  var isize;
	  /** @type {Zlib.RawInflate} RawInflate implementation. */

	  var rawinflate;
	  /** @type {!(Array.<number>|Uint8Array)} inflated data. */

	  var inflated;
	  /** @type {number} inflate size */

	  var inflen;
	  /** @type {number} character code */

	  var c;
	  /** @type {number} character index in string. */

	  var ci;
	  /** @type {Array.<string>} character array. */

	  var str;
	  /** @type {number} modification time. */

	  var mtime;
	  /** @type {number} */

	  var crc32;
	  var input = this.input;
	  var ip = this.ip;
	  member.id1 = input[ip++];
	  member.id2 = input[ip++]; // check signature

	  if (member.id1 !== 0x1f || member.id2 !== 0x8b) {
	    throw new Error('invalid file signature:' + member.id1 + ',' + member.id2);
	  } // check compression method


	  member.cm = input[ip++];

	  switch (member.cm) {
	    case 8:
	      /* XXX: use Zlib const */
	      break;

	    default:
	      throw new Error('unknown compression method: ' + member.cm);
	  } // flags


	  member.flg = input[ip++]; // modification time

	  mtime = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24;
	  member.mtime = new Date(mtime * 1000); // extra flags

	  member.xfl = input[ip++]; // operating system

	  member.os = input[ip++]; // extra

	  if ((member.flg & Zlib$1.Gzip.FlagsMask.FEXTRA) > 0) {
	    member.xlen = input[ip++] | input[ip++] << 8;
	    ip = this.decodeSubField(ip, member.xlen);
	  } // fname


	  if ((member.flg & Zlib$1.Gzip.FlagsMask.FNAME) > 0) {
	    for (str = [], ci = 0; (c = input[ip++]) > 0;) {
	      str[ci++] = String.fromCharCode(c);
	    }

	    member.name = str.join('');
	  } // fcomment


	  if ((member.flg & Zlib$1.Gzip.FlagsMask.FCOMMENT) > 0) {
	    for (str = [], ci = 0; (c = input[ip++]) > 0;) {
	      str[ci++] = String.fromCharCode(c);
	    }

	    member.comment = str.join('');
	  } // fhcrc


	  if ((member.flg & Zlib$1.Gzip.FlagsMask.FHCRC) > 0) {
	    member.crc16 = Zlib$1.CRC32.calc(input, 0, ip) & 0xffff;

	    if (member.crc16 !== (input[ip++] | input[ip++] << 8)) {
	      throw new Error('invalid header crc16');
	    }
	  } // isize を事前に取得すると展開後のサイズが分かるため、
	  // inflate処理のバッファサイズが事前に分かり、高速になる


	  isize = input[input.length - 4] | input[input.length - 3] << 8 | input[input.length - 2] << 16 | input[input.length - 1] << 24; // isize の妥当性チェック
	  // ハフマン符号では最小 2-bit のため、最大で 1/4 になる
	  // LZ77 符号では 長さと距離 2-Byte で最大 258-Byte を表現できるため、
	  // 1/128 になるとする
	  // ここから入力バッファの残りが isize の 512 倍以上だったら
	  // サイズ指定のバッファ確保は行わない事とする

	  if (input.length - ip -
	  /* CRC-32 */
	  4 -
	  /* ISIZE */
	  4 < isize * 512) {
	    inflen = isize;
	  } // compressed block


	  rawinflate = new Zlib$1.RawInflate(input, {
	    'index': ip,
	    'bufferSize': inflen
	  });
	  member.data = inflated = rawinflate.decompress();
	  ip = rawinflate.ip; // crc32

	  member.crc32 = crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;

	  if (Zlib$1.CRC32.calc(inflated) !== crc32) {
	    throw new Error('invalid CRC-32 checksum: 0x' + Zlib$1.CRC32.calc(inflated).toString(16) + ' / 0x' + crc32.toString(16));
	  } // input size


	  member.isize = isize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;

	  if ((inflated.length & 0xffffffff) !== isize) {
	    throw new Error('invalid input size: ' + (inflated.length & 0xffffffff) + ' / ' + isize);
	  }

	  this.member.push(member);
	  this.ip = ip;
	};
	/**
	 * サブフィールドのデコード
	 * XXX: 現在は何もせずスキップする
	 */


	Zlib$1.Gunzip.prototype.decodeSubField = function (ip, length) {
	  return ip + length;
	};
	/**
	 * @return {!(Array.<number>|Uint8Array)}
	 */


	Zlib$1.Gunzip.prototype.concatMember = function () {
	  /** @type {Array.<Zlib.GunzipMember>} */
	  var member = this.member;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;
	  /** @type {number} */

	  var p = 0;
	  /** @type {number} */

	  var size = 0;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var buffer;

	  for (i = 0, il = member.length; i < il; ++i) {
	    size += member[i].data.length;
	  }

	  {
	    buffer = new Uint8Array(size);

	    for (i = 0; i < il; ++i) {
	      buffer.set(member[i].data, p);
	      p += member[i].data.length;
	    }
	  }
	  return buffer;
	};
	/**
	 * @constructor
	 */


	Zlib$1.GunzipMember = function () {
	  /** @type {number} signature first byte. */
	  this.id1;
	  /** @type {number} signature second byte. */

	  this.id2;
	  /** @type {number} compression method. */

	  this.cm;
	  /** @type {number} flags. */

	  this.flg;
	  /** @type {Date} modification time. */

	  this.mtime;
	  /** @type {number} extra flags. */

	  this.xfl;
	  /** @type {number} operating system number. */

	  this.os;
	  /** @type {number} CRC-16 value for FHCRC flag. */

	  this.crc16;
	  /** @type {number} extra length. */

	  this.xlen;
	  /** @type {number} CRC-32 value for verification. */

	  this.crc32;
	  /** @type {number} input size modulo 32 value. */

	  this.isize;
	  /** @type {string} filename. */

	  this.name;
	  /** @type {string} comment. */

	  this.comment;
	  /** @type {!(Uint8Array|Array.<number>)} */

	  this.data;
	};

	Zlib$1.GunzipMember.prototype.getName = function () {
	  return this.name;
	};

	Zlib$1.GunzipMember.prototype.getData = function () {
	  return this.data;
	};

	Zlib$1.GunzipMember.prototype.getMtime = function () {
	  return this.mtime;
	};
	/**
	 * @fileoverview GZIP (RFC1952) 実装.
	 */

	/**
	 * @constructor
	 * @param {!(Array|Uint8Array)} input input buffer.
	 * @param {Object=} opt_params option parameters.
	 */


	Zlib$1.Gzip = function (input, opt_params) {
	  /** @type {!(Array.<number>|Uint8Array)} input buffer. */
	  this.input = input;
	  /** @type {number} input buffer pointer. */

	  this.ip = 0;
	  /** @type {!(Array.<number>|Uint8Array)} output buffer. */

	  this.output;
	  /** @type {number} output buffer. */

	  this.op = 0;
	  /** @type {!Object} flags option flags. */

	  this.flags = {};
	  /** @type {!string} filename. */

	  this.filename;
	  /** @type {!string} comment. */

	  this.comment;
	  /** @type {!Object} deflate options. */

	  this.deflateOptions; // option parameters

	  if (opt_params) {
	    if (opt_params['flags']) {
	      this.flags = opt_params['flags'];
	    }

	    if (typeof opt_params['filename'] === 'string') {
	      this.filename = opt_params['filename'];
	    }

	    if (typeof opt_params['comment'] === 'string') {
	      this.comment = opt_params['comment'];
	    }

	    if (opt_params['deflateOptions']) {
	      this.deflateOptions = opt_params['deflateOptions'];
	    }
	  }

	  if (!this.deflateOptions) {
	    this.deflateOptions = {};
	  }
	};
	/**
	 * @type {number}
	 * @const
	 */


	Zlib$1.Gzip.DefaultBufferSize = 0x8000;
	/**
	 * encode gzip members.
	 * @return {!(Array|Uint8Array)} gzip binary array.
	 */

	Zlib$1.Gzip.prototype.compress = function () {
	  /** @type {number} flags. */
	  var flg;
	  /** @type {number} modification time. */

	  var mtime;
	  /** @type {number} CRC-16 value for FHCRC flag. */

	  var crc16;
	  /** @type {number} CRC-32 value for verification. */

	  var crc32;
	  /** @type {!Zlib.RawDeflate} raw deflate object. */

	  var rawdeflate;
	  /** @type {number} character code */

	  var c;
	  /** @type {number} loop counter. */

	  var i;
	  /** @type {number} loop limiter. */

	  var il;
	  /** @type {!(Array|Uint8Array)} output buffer. */

	  var output = new Uint8Array(Zlib$1.Gzip.DefaultBufferSize);
	  /** @type {number} output buffer pointer. */

	  var op = 0;
	  var input = this.input;
	  var ip = this.ip;
	  var filename = this.filename;
	  var comment = this.comment; // check signature

	  output[op++] = 0x1f;
	  output[op++] = 0x8b; // check compression method

	  output[op++] = 8;
	  /* XXX: use Zlib const */
	  // flags

	  flg = 0;
	  if (this.flags['fname']) flg |= Zlib$1.Gzip.FlagsMask.FNAME;
	  if (this.flags['fcomment']) flg |= Zlib$1.Gzip.FlagsMask.FCOMMENT;
	  if (this.flags['fhcrc']) flg |= Zlib$1.Gzip.FlagsMask.FHCRC; // XXX: FTEXT
	  // XXX: FEXTRA

	  output[op++] = flg; // modification time

	  mtime = (Date.now ? Date.now() : +new Date()) / 1000 | 0;
	  output[op++] = mtime & 0xff;
	  output[op++] = mtime >>> 8 & 0xff;
	  output[op++] = mtime >>> 16 & 0xff;
	  output[op++] = mtime >>> 24 & 0xff; // extra flags

	  output[op++] = 0; // operating system

	  output[op++] = Zlib$1.Gzip.OperatingSystem.UNKNOWN; // extra

	  /* NOP */
	  // fname

	  if (this.flags['fname'] !== void 0) {
	    for (i = 0, il = filename.length; i < il; ++i) {
	      c = filename.charCodeAt(i);

	      if (c > 0xff) {
	        output[op++] = c >>> 8 & 0xff;
	      }

	      output[op++] = c & 0xff;
	    }

	    output[op++] = 0; // null termination
	  } // fcomment


	  if (this.flags['comment']) {
	    for (i = 0, il = comment.length; i < il; ++i) {
	      c = comment.charCodeAt(i);

	      if (c > 0xff) {
	        output[op++] = c >>> 8 & 0xff;
	      }

	      output[op++] = c & 0xff;
	    }

	    output[op++] = 0; // null termination
	  } // fhcrc


	  if (this.flags['fhcrc']) {
	    crc16 = Zlib$1.CRC32.calc(output, 0, op) & 0xffff;
	    output[op++] = crc16 & 0xff;
	    output[op++] = crc16 >>> 8 & 0xff;
	  } // add compress option


	  this.deflateOptions['outputBuffer'] = output;
	  this.deflateOptions['outputIndex'] = op; // compress

	  rawdeflate = new Zlib$1.RawDeflate(input, this.deflateOptions);
	  output = rawdeflate.compress();
	  op = rawdeflate.op; // expand buffer

	  {
	    if (op + 8 > output.buffer.byteLength) {
	      this.output = new Uint8Array(op + 8);
	      this.output.set(new Uint8Array(output.buffer));
	      output = this.output;
	    } else {
	      output = new Uint8Array(output.buffer);
	    }
	  } // crc32

	  crc32 = Zlib$1.CRC32.calc(input);
	  output[op++] = crc32 & 0xff;
	  output[op++] = crc32 >>> 8 & 0xff;
	  output[op++] = crc32 >>> 16 & 0xff;
	  output[op++] = crc32 >>> 24 & 0xff; // input size

	  il = input.length;
	  output[op++] = il & 0xff;
	  output[op++] = il >>> 8 & 0xff;
	  output[op++] = il >>> 16 & 0xff;
	  output[op++] = il >>> 24 & 0xff;
	  this.ip = ip;

	  if (op < output.length) {
	    this.output = output = output.subarray(0, op);
	  }

	  return output;
	};
	/** @enum {number} */


	Zlib$1.Gzip.OperatingSystem = {
	  FAT: 0,
	  AMIGA: 1,
	  VMS: 2,
	  UNIX: 3,
	  VM_CMS: 4,
	  ATARI_TOS: 5,
	  HPFS: 6,
	  MACINTOSH: 7,
	  Z_SYSTEM: 8,
	  CP_M: 9,
	  TOPS_20: 10,
	  NTFS: 11,
	  QDOS: 12,
	  ACORN_RISCOS: 13,
	  UNKNOWN: 255
	};
	/** @enum {number} */

	Zlib$1.Gzip.FlagsMask = {
	  FTEXT: 0x01,
	  FHCRC: 0x02,
	  FEXTRA: 0x04,
	  FNAME: 0x08,
	  FCOMMENT: 0x10
	};
	/**
	 * @fileoverview Heap Sort 実装. ハフマン符号化で使用する.
	 */

	/**
	 * カスタムハフマン符号で使用するヒープ実装
	 * @param {number} length ヒープサイズ.
	 * @constructor
	 */

	Zlib$1.Heap = function (length) {
	  this.buffer = new Uint16Array(length * 2);
	  this.length = 0;
	};
	/**
	 * 親ノードの index 取得
	 * @param {number} index 子ノードの index.
	 * @return {number} 親ノードの index.
	 *
	 */


	Zlib$1.Heap.prototype.getParent = function (index) {
	  return ((index - 2) / 4 | 0) * 2;
	};
	/**
	 * 子ノードの index 取得
	 * @param {number} index 親ノードの index.
	 * @return {number} 子ノードの index.
	 */


	Zlib$1.Heap.prototype.getChild = function (index) {
	  return 2 * index + 2;
	};
	/**
	 * Heap に値を追加する
	 * @param {number} index キー index.
	 * @param {number} value 値.
	 * @return {number} 現在のヒープ長.
	 */


	Zlib$1.Heap.prototype.push = function (index, value) {
	  var current,
	      parent,
	      heap = this.buffer,
	      swap;
	  current = this.length;
	  heap[this.length++] = value;
	  heap[this.length++] = index; // ルートノードにたどり着くまで入れ替えを試みる

	  while (current > 0) {
	    parent = this.getParent(current); // 親ノードと比較して親の方が小さければ入れ替える

	    if (heap[current] > heap[parent]) {
	      swap = heap[current];
	      heap[current] = heap[parent];
	      heap[parent] = swap;
	      swap = heap[current + 1];
	      heap[current + 1] = heap[parent + 1];
	      heap[parent + 1] = swap;
	      current = parent; // 入れ替えが必要なくなったらそこで抜ける
	    } else {
	      break;
	    }
	  }

	  return this.length;
	};
	/**
	 * Heapから一番大きい値を返す
	 * @return {{index: number, value: number, length: number}} {index: キーindex,
	 *     value: 値, length: ヒープ長} の Object.
	 */


	Zlib$1.Heap.prototype.pop = function () {
	  var index,
	      value,
	      heap = this.buffer,
	      swap,
	      current,
	      parent;
	  value = heap[0];
	  index = heap[1]; // 後ろから値を取る

	  this.length -= 2;
	  heap[0] = heap[this.length];
	  heap[1] = heap[this.length + 1];
	  parent = 0; // ルートノードから下がっていく

	  while (true) {
	    current = this.getChild(parent); // 範囲チェック

	    if (current >= this.length) {
	      break;
	    } // 隣のノードと比較して、隣の方が値が大きければ隣を現在ノードとして選択


	    if (current + 2 < this.length && heap[current + 2] > heap[current]) {
	      current += 2;
	    } // 親ノードと比較して親の方が小さい場合は入れ替える


	    if (heap[current] > heap[parent]) {
	      swap = heap[parent];
	      heap[parent] = heap[current];
	      heap[current] = swap;
	      swap = heap[parent + 1];
	      heap[parent + 1] = heap[current + 1];
	      heap[current + 1] = swap;
	    } else {
	      break;
	    }

	    parent = current;
	  }

	  return {
	    index: index,
	    value: value,
	    length: this.length
	  };
	};
	/* vim:set expandtab ts=2 sw=2 tw=80: */

	/**
	 * @fileoverview Deflate (RFC1951) 符号化アルゴリズム実装.
	 */

	/**
	 * Raw Deflate 実装
	 *
	 * @constructor
	 * @param {!(Array.<number>|Uint8Array)} input 符号化する対象のバッファ.
	 * @param {Object=} opt_params option parameters.
	 *
	 * typed array が使用可能なとき、outputBuffer が Array は自動的に Uint8Array に
	 * 変換されます.
	 * 別のオブジェクトになるため出力バッファを参照している変数などは
	 * 更新する必要があります.
	 */


	Zlib$1.RawDeflate = function (input, opt_params) {
	  /** @type {Zlib.RawDeflate.CompressionType} */
	  this.compressionType = Zlib$1.RawDeflate.CompressionType.DYNAMIC;
	  /** @type {number} */

	  this.lazy = 0;
	  /** @type {!(Array.<number>|Uint32Array)} */

	  this.freqsLitLen;
	  /** @type {!(Array.<number>|Uint32Array)} */

	  this.freqsDist;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  this.input = input instanceof Array ? new Uint8Array(input) : input;
	  /** @type {!(Array.<number>|Uint8Array)} output output buffer. */

	  this.output;
	  /** @type {number} pos output buffer position. */

	  this.op = 0; // option parameters

	  if (opt_params) {
	    if (opt_params['lazy']) {
	      this.lazy = opt_params['lazy'];
	    }

	    if (typeof opt_params['compressionType'] === 'number') {
	      this.compressionType = opt_params['compressionType'];
	    }

	    if (opt_params['outputBuffer']) {
	      this.output = opt_params['outputBuffer'] instanceof Array ? new Uint8Array(opt_params['outputBuffer']) : opt_params['outputBuffer'];
	    }

	    if (typeof opt_params['outputIndex'] === 'number') {
	      this.op = opt_params['outputIndex'];
	    }
	  }

	  if (!this.output) {
	    this.output = new Uint8Array(0x8000);
	  }
	};
	/**
	 * @enum {number}
	 */


	Zlib$1.RawDeflate.CompressionType = {
	  NONE: 0,
	  FIXED: 1,
	  DYNAMIC: 2,
	  RESERVED: 3
	};
	/**
	 * LZ77 の最小マッチ長
	 * @const
	 * @type {number}
	 */

	Zlib$1.RawDeflate.Lz77MinLength = 3;
	/**
	 * LZ77 の最大マッチ長
	 * @const
	 * @type {number}
	 */

	Zlib$1.RawDeflate.Lz77MaxLength = 258;
	/**
	 * LZ77 のウィンドウサイズ
	 * @const
	 * @type {number}
	 */

	Zlib$1.RawDeflate.WindowSize = 0x8000;
	/**
	 * 最長の符号長
	 * @const
	 * @type {number}
	 */

	Zlib$1.RawDeflate.MaxCodeLength = 16;
	/**
	 * ハフマン符号の最大数値
	 * @const
	 * @type {number}
	 */

	Zlib$1.RawDeflate.HUFMAX = 286;
	/**
	 * 固定ハフマン符号の符号化テーブル
	 * @const
	 * @type {Array.<Array.<number, number>>}
	 */

	Zlib$1.RawDeflate.FixedHuffmanTable = function () {
	  var table = [],
	      i;

	  for (i = 0; i < 288; i++) {
	    switch (true) {
	      case i <= 143:
	        table.push([i + 0x030, 8]);
	        break;

	      case i <= 255:
	        table.push([i - 144 + 0x190, 9]);
	        break;

	      case i <= 279:
	        table.push([i - 256 + 0x000, 7]);
	        break;

	      case i <= 287:
	        table.push([i - 280 + 0x0C0, 8]);
	        break;

	      default:
	        throw 'invalid literal: ' + i;
	    }
	  }

	  return table;
	}();
	/**
	 * DEFLATE ブロックの作成
	 * @return {!(Array.<number>|Uint8Array)} 圧縮済み byte array.
	 */


	Zlib$1.RawDeflate.prototype.compress = function () {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  var blockArray;
	  /** @type {number} */

	  var position;
	  /** @type {number} */

	  var length;
	  var input = this.input; // compression

	  switch (this.compressionType) {
	    case Zlib$1.RawDeflate.CompressionType.NONE:
	      // each 65535-Byte (length header: 16-bit)
	      for (position = 0, length = input.length; position < length;) {
	        blockArray = input.subarray(position, position + 0xffff);
	        position += blockArray.length;
	        this.makeNocompressBlock(blockArray, position === length);
	      }

	      break;

	    case Zlib$1.RawDeflate.CompressionType.FIXED:
	      this.output = this.makeFixedHuffmanBlock(input, true);
	      this.op = this.output.length;
	      break;

	    case Zlib$1.RawDeflate.CompressionType.DYNAMIC:
	      this.output = this.makeDynamicHuffmanBlock(input, true);
	      this.op = this.output.length;
	      break;

	    default:
	      throw 'invalid compression type';
	  }

	  return this.output;
	};
	/**
	 * 非圧縮ブロックの作成
	 * @param {!(Array.<number>|Uint8Array)} blockArray ブロックデータ byte array.
	 * @param {!boolean} isFinalBlock 最後のブロックならばtrue.
	 * @return {!(Array.<number>|Uint8Array)} 非圧縮ブロック byte array.
	 */


	Zlib$1.RawDeflate.prototype.makeNocompressBlock = function (blockArray, isFinalBlock) {
	  /** @type {number} */
	  var bfinal;
	  /** @type {Zlib.RawDeflate.CompressionType} */

	  var btype;
	  /** @type {number} */

	  var len;
	  /** @type {number} */

	  var nlen;
	  var output = this.output;
	  var op = this.op; // expand buffer

	  {
	    output = new Uint8Array(this.output.buffer);

	    while (output.length <= op + blockArray.length + 5) {
	      output = new Uint8Array(output.length << 1);
	    }

	    output.set(this.output);
	  } // header

	  bfinal = isFinalBlock ? 1 : 0;
	  btype = Zlib$1.RawDeflate.CompressionType.NONE;
	  output[op++] = bfinal | btype << 1; // length

	  len = blockArray.length;
	  nlen = ~len + 0x10000 & 0xffff;
	  output[op++] = len & 0xff;
	  output[op++] = len >>> 8 & 0xff;
	  output[op++] = nlen & 0xff;
	  output[op++] = nlen >>> 8 & 0xff; // copy buffer

	  {
	    output.set(blockArray, op);
	    op += blockArray.length;
	    output = output.subarray(0, op);
	  }
	  this.op = op;
	  this.output = output;
	  return output;
	};
	/**
	 * 固定ハフマンブロックの作成
	 * @param {!(Array.<number>|Uint8Array)} blockArray ブロックデータ byte array.
	 * @param {!boolean} isFinalBlock 最後のブロックならばtrue.
	 * @return {!(Array.<number>|Uint8Array)} 固定ハフマン符号化ブロック byte array.
	 */


	Zlib$1.RawDeflate.prototype.makeFixedHuffmanBlock = function (blockArray, isFinalBlock) {
	  /** @type {Zlib.BitStream} */
	  var stream = new Zlib$1.BitStream(new Uint8Array(this.output.buffer), this.op);
	  /** @type {number} */

	  var bfinal;
	  /** @type {Zlib.RawDeflate.CompressionType} */

	  var btype;
	  /** @type {!(Array.<number>|Uint16Array)} */

	  var data; // header

	  bfinal = isFinalBlock ? 1 : 0;
	  btype = Zlib$1.RawDeflate.CompressionType.FIXED;
	  stream.writeBits(bfinal, 1, true);
	  stream.writeBits(btype, 2, true);
	  data = this.lz77(blockArray);
	  this.fixedHuffman(data, stream);
	  return stream.finish();
	};
	/**
	 * 動的ハフマンブロックの作成
	 * @param {!(Array.<number>|Uint8Array)} blockArray ブロックデータ byte array.
	 * @param {!boolean} isFinalBlock 最後のブロックならばtrue.
	 * @return {!(Array.<number>|Uint8Array)} 動的ハフマン符号ブロック byte array.
	 */


	Zlib$1.RawDeflate.prototype.makeDynamicHuffmanBlock = function (blockArray, isFinalBlock) {
	  /** @type {Zlib.BitStream} */
	  var stream = new Zlib$1.BitStream(new Uint8Array(this.output.buffer), this.op);
	  /** @type {number} */

	  var bfinal;
	  /** @type {Zlib.RawDeflate.CompressionType} */

	  var btype;
	  /** @type {!(Array.<number>|Uint16Array)} */

	  var data;
	  /** @type {number} */

	  var hlit;
	  /** @type {number} */

	  var hdist;
	  /** @type {number} */

	  var hclen;
	  /** @const @type {Array.<number>} */

	  var hclenOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var litLenLengths;
	  /** @type {!(Array.<number>|Uint16Array)} */

	  var litLenCodes;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var distLengths;
	  /** @type {!(Array.<number>|Uint16Array)} */

	  var distCodes;
	  /** @type {{
	   *   codes: !(Array.<number>|Uint32Array),
	   *   freqs: !(Array.<number>|Uint8Array)
	   * }} */

	  var treeSymbols;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var treeLengths;
	  /** @type {Array} */

	  var transLengths = new Array(19);
	  /** @type {!(Array.<number>|Uint16Array)} */

	  var treeCodes;
	  /** @type {number} */

	  var code;
	  /** @type {number} */

	  var bitlen;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il; // header

	  bfinal = isFinalBlock ? 1 : 0;
	  btype = Zlib$1.RawDeflate.CompressionType.DYNAMIC;
	  stream.writeBits(bfinal, 1, true);
	  stream.writeBits(btype, 2, true);
	  data = this.lz77(blockArray); // リテラル・長さ, 距離のハフマン符号と符号長の算出

	  litLenLengths = this.getLengths_(this.freqsLitLen, 15);
	  litLenCodes = this.getCodesFromLengths_(litLenLengths);
	  distLengths = this.getLengths_(this.freqsDist, 7);
	  distCodes = this.getCodesFromLengths_(distLengths); // HLIT, HDIST の決定

	  for (hlit = 286; hlit > 257 && litLenLengths[hlit - 1] === 0; hlit--) {}

	  for (hdist = 30; hdist > 1 && distLengths[hdist - 1] === 0; hdist--) {} // HCLEN


	  treeSymbols = this.getTreeSymbols_(hlit, litLenLengths, hdist, distLengths);
	  treeLengths = this.getLengths_(treeSymbols.freqs, 7);

	  for (i = 0; i < 19; i++) {
	    transLengths[i] = treeLengths[hclenOrder[i]];
	  }

	  for (hclen = 19; hclen > 4 && transLengths[hclen - 1] === 0; hclen--) {}

	  treeCodes = this.getCodesFromLengths_(treeLengths); // 出力

	  stream.writeBits(hlit - 257, 5, true);
	  stream.writeBits(hdist - 1, 5, true);
	  stream.writeBits(hclen - 4, 4, true);

	  for (i = 0; i < hclen; i++) {
	    stream.writeBits(transLengths[i], 3, true);
	  } // ツリーの出力


	  for (i = 0, il = treeSymbols.codes.length; i < il; i++) {
	    code = treeSymbols.codes[i];
	    stream.writeBits(treeCodes[code], treeLengths[code], true); // extra bits

	    if (code >= 16) {
	      i++;

	      switch (code) {
	        case 16:
	          bitlen = 2;
	          break;

	        case 17:
	          bitlen = 3;
	          break;

	        case 18:
	          bitlen = 7;
	          break;

	        default:
	          throw 'invalid code: ' + code;
	      }

	      stream.writeBits(treeSymbols.codes[i], bitlen, true);
	    }
	  }

	  this.dynamicHuffman(data, [litLenCodes, litLenLengths], [distCodes, distLengths], stream);
	  return stream.finish();
	};
	/**
	 * 動的ハフマン符号化(カスタムハフマンテーブル)
	 * @param {!(Array.<number>|Uint16Array)} dataArray LZ77 符号化済み byte array.
	 * @param {!Zlib.BitStream} stream 書き込み用ビットストリーム.
	 * @return {!Zlib.BitStream} ハフマン符号化済みビットストリームオブジェクト.
	 */


	Zlib$1.RawDeflate.prototype.dynamicHuffman = function (dataArray, litLen, dist, stream) {
	  /** @type {number} */
	  var index;
	  /** @type {number} */

	  var length;
	  /** @type {number} */

	  var literal;
	  /** @type {number} */

	  var code;
	  /** @type {number} */

	  var litLenCodes;
	  /** @type {number} */

	  var litLenLengths;
	  /** @type {number} */

	  var distCodes;
	  /** @type {number} */

	  var distLengths;
	  litLenCodes = litLen[0];
	  litLenLengths = litLen[1];
	  distCodes = dist[0];
	  distLengths = dist[1]; // 符号を BitStream に書き込んでいく

	  for (index = 0, length = dataArray.length; index < length; ++index) {
	    literal = dataArray[index]; // literal or length

	    stream.writeBits(litLenCodes[literal], litLenLengths[literal], true); // 長さ・距離符号

	    if (literal > 256) {
	      // length extra
	      stream.writeBits(dataArray[++index], dataArray[++index], true); // distance

	      code = dataArray[++index];
	      stream.writeBits(distCodes[code], distLengths[code], true); // distance extra

	      stream.writeBits(dataArray[++index], dataArray[++index], true); // 終端
	    } else if (literal === 256) {
	      break;
	    }
	  }

	  return stream;
	};
	/**
	 * 固定ハフマン符号化
	 * @param {!(Array.<number>|Uint16Array)} dataArray LZ77 符号化済み byte array.
	 * @param {!Zlib.BitStream} stream 書き込み用ビットストリーム.
	 * @return {!Zlib.BitStream} ハフマン符号化済みビットストリームオブジェクト.
	 */


	Zlib$1.RawDeflate.prototype.fixedHuffman = function (dataArray, stream) {
	  /** @type {number} */
	  var index;
	  /** @type {number} */

	  var length;
	  /** @type {number} */

	  var literal; // 符号を BitStream に書き込んでいく

	  for (index = 0, length = dataArray.length; index < length; index++) {
	    literal = dataArray[index]; // 符号の書き込み

	    Zlib$1.BitStream.prototype.writeBits.apply(stream, Zlib$1.RawDeflate.FixedHuffmanTable[literal]); // 長さ・距離符号

	    if (literal > 0x100) {
	      // length extra
	      stream.writeBits(dataArray[++index], dataArray[++index], true); // distance

	      stream.writeBits(dataArray[++index], 5); // distance extra

	      stream.writeBits(dataArray[++index], dataArray[++index], true); // 終端
	    } else if (literal === 0x100) {
	      break;
	    }
	  }

	  return stream;
	};
	/**
	 * マッチ情報
	 * @param {!number} length マッチした長さ.
	 * @param {!number} backwardDistance マッチ位置との距離.
	 * @constructor
	 */


	Zlib$1.RawDeflate.Lz77Match = function (length, backwardDistance) {
	  /** @type {number} match length. */
	  this.length = length;
	  /** @type {number} backward distance. */

	  this.backwardDistance = backwardDistance;
	};
	/**
	 * 長さ符号テーブル.
	 * [コード, 拡張ビット, 拡張ビット長] の配列となっている.
	 * @const
	 * @type {!(Array.<number>|Uint32Array)}
	 */


	Zlib$1.RawDeflate.Lz77Match.LengthCodeTable = function (table) {
	  return new Uint32Array(table);
	}(function () {
	  /** @type {!Array} */
	  var table = [];
	  /** @type {number} */

	  var i;
	  /** @type {!Array.<number>} */

	  var c;

	  for (i = 3; i <= 258; i++) {
	    c = code(i);
	    table[i] = c[2] << 24 | c[1] << 16 | c[0];
	  }
	  /**
	   * @param {number} length lz77 length.
	   * @return {!Array.<number>} lz77 codes.
	   */


	  function code(length) {
	    switch (true) {
	      case length === 3:
	        return [257, length - 3, 0];

	      case length === 4:
	        return [258, length - 4, 0];

	      case length === 5:
	        return [259, length - 5, 0];

	      case length === 6:
	        return [260, length - 6, 0];

	      case length === 7:
	        return [261, length - 7, 0];

	      case length === 8:
	        return [262, length - 8, 0];

	      case length === 9:
	        return [263, length - 9, 0];

	      case length === 10:
	        return [264, length - 10, 0];

	      case length <= 12:
	        return [265, length - 11, 1];

	      case length <= 14:
	        return [266, length - 13, 1];

	      case length <= 16:
	        return [267, length - 15, 1];

	      case length <= 18:
	        return [268, length - 17, 1];

	      case length <= 22:
	        return [269, length - 19, 2];

	      case length <= 26:
	        return [270, length - 23, 2];

	      case length <= 30:
	        return [271, length - 27, 2];

	      case length <= 34:
	        return [272, length - 31, 2];

	      case length <= 42:
	        return [273, length - 35, 3];

	      case length <= 50:
	        return [274, length - 43, 3];

	      case length <= 58:
	        return [275, length - 51, 3];

	      case length <= 66:
	        return [276, length - 59, 3];

	      case length <= 82:
	        return [277, length - 67, 4];

	      case length <= 98:
	        return [278, length - 83, 4];

	      case length <= 114:
	        return [279, length - 99, 4];

	      case length <= 130:
	        return [280, length - 115, 4];

	      case length <= 162:
	        return [281, length - 131, 5];

	      case length <= 194:
	        return [282, length - 163, 5];

	      case length <= 226:
	        return [283, length - 195, 5];

	      case length <= 257:
	        return [284, length - 227, 5];

	      case length === 258:
	        return [285, length - 258, 0];

	      default:
	        throw 'invalid length: ' + length;
	    }
	  }

	  return table;
	}());
	/**
	 * 距離符号テーブル
	 * @param {!number} dist 距離.
	 * @return {!Array.<number>} コード、拡張ビット、拡張ビット長の配列.
	 * @private
	 */


	Zlib$1.RawDeflate.Lz77Match.prototype.getDistanceCode_ = function (dist) {
	  /** @type {!Array.<number>} distance code table. */
	  var r;

	  switch (true) {
	    case dist === 1:
	      r = [0, dist - 1, 0];
	      break;

	    case dist === 2:
	      r = [1, dist - 2, 0];
	      break;

	    case dist === 3:
	      r = [2, dist - 3, 0];
	      break;

	    case dist === 4:
	      r = [3, dist - 4, 0];
	      break;

	    case dist <= 6:
	      r = [4, dist - 5, 1];
	      break;

	    case dist <= 8:
	      r = [5, dist - 7, 1];
	      break;

	    case dist <= 12:
	      r = [6, dist - 9, 2];
	      break;

	    case dist <= 16:
	      r = [7, dist - 13, 2];
	      break;

	    case dist <= 24:
	      r = [8, dist - 17, 3];
	      break;

	    case dist <= 32:
	      r = [9, dist - 25, 3];
	      break;

	    case dist <= 48:
	      r = [10, dist - 33, 4];
	      break;

	    case dist <= 64:
	      r = [11, dist - 49, 4];
	      break;

	    case dist <= 96:
	      r = [12, dist - 65, 5];
	      break;

	    case dist <= 128:
	      r = [13, dist - 97, 5];
	      break;

	    case dist <= 192:
	      r = [14, dist - 129, 6];
	      break;

	    case dist <= 256:
	      r = [15, dist - 193, 6];
	      break;

	    case dist <= 384:
	      r = [16, dist - 257, 7];
	      break;

	    case dist <= 512:
	      r = [17, dist - 385, 7];
	      break;

	    case dist <= 768:
	      r = [18, dist - 513, 8];
	      break;

	    case dist <= 1024:
	      r = [19, dist - 769, 8];
	      break;

	    case dist <= 1536:
	      r = [20, dist - 1025, 9];
	      break;

	    case dist <= 2048:
	      r = [21, dist - 1537, 9];
	      break;

	    case dist <= 3072:
	      r = [22, dist - 2049, 10];
	      break;

	    case dist <= 4096:
	      r = [23, dist - 3073, 10];
	      break;

	    case dist <= 6144:
	      r = [24, dist - 4097, 11];
	      break;

	    case dist <= 8192:
	      r = [25, dist - 6145, 11];
	      break;

	    case dist <= 12288:
	      r = [26, dist - 8193, 12];
	      break;

	    case dist <= 16384:
	      r = [27, dist - 12289, 12];
	      break;

	    case dist <= 24576:
	      r = [28, dist - 16385, 13];
	      break;

	    case dist <= 32768:
	      r = [29, dist - 24577, 13];
	      break;

	    default:
	      throw 'invalid distance';
	  }

	  return r;
	};
	/**
	 * マッチ情報を LZ77 符号化配列で返す.
	 * なお、ここでは以下の内部仕様で符号化している
	 * [ CODE, EXTRA-BIT-LEN, EXTRA, CODE, EXTRA-BIT-LEN, EXTRA ]
	 * @return {!Array.<number>} LZ77 符号化 byte array.
	 */


	Zlib$1.RawDeflate.Lz77Match.prototype.toLz77Array = function () {
	  /** @type {number} */
	  var length = this.length;
	  /** @type {number} */

	  var dist = this.backwardDistance;
	  /** @type {Array} */

	  var codeArray = [];
	  /** @type {number} */

	  var pos = 0;
	  /** @type {!Array.<number>} */

	  var code; // length

	  code = Zlib$1.RawDeflate.Lz77Match.LengthCodeTable[length];
	  codeArray[pos++] = code & 0xffff;
	  codeArray[pos++] = code >> 16 & 0xff;
	  codeArray[pos++] = code >> 24; // distance

	  code = this.getDistanceCode_(dist);
	  codeArray[pos++] = code[0];
	  codeArray[pos++] = code[1];
	  codeArray[pos++] = code[2];
	  return codeArray;
	};
	/**
	 * LZ77 実装
	 * @param {!(Array.<number>|Uint8Array)} dataArray LZ77 符号化するバイト配列.
	 * @return {!(Array.<number>|Uint16Array)} LZ77 符号化した配列.
	 */


	Zlib$1.RawDeflate.prototype.lz77 = function (dataArray) {
	  /** @type {number} input position */
	  var position;
	  /** @type {number} input length */

	  var length;
	  /** @type {number} loop counter */

	  var i;
	  /** @type {number} loop limiter */

	  var il;
	  /** @type {number} chained-hash-table key */

	  var matchKey;
	  /** @type {Object.<number, Array.<number>>} chained-hash-table */

	  var table = {};
	  /** @const @type {number} */

	  var windowSize = Zlib$1.RawDeflate.WindowSize;
	  /** @type {Array.<number>} match list */

	  var matchList;
	  /** @type {Zlib.RawDeflate.Lz77Match} longest match */

	  var longestMatch;
	  /** @type {Zlib.RawDeflate.Lz77Match} previous longest match */

	  var prevMatch;
	  /** @type {!(Array.<number>|Uint16Array)} lz77 buffer */

	  var lz77buf = new Uint16Array(dataArray.length * 2);
	  /** @type {number} lz77 output buffer pointer */

	  var pos = 0;
	  /** @type {number} lz77 skip length */

	  var skipLength = 0;
	  /** @type {!(Array.<number>|Uint32Array)} */

	  var freqsLitLen = new Uint32Array(286);
	  /** @type {!(Array.<number>|Uint32Array)} */

	  var freqsDist = new Uint32Array(30);
	  /** @type {number} */

	  var lazy = this.lazy;
	  /** @type {*} temporary variable */

	  var tmp;
	  freqsLitLen[256] = 1; // EOB の最低出現回数は 1

	  /**
	   * マッチデータの書き込み
	   * @param {Zlib.RawDeflate.Lz77Match} match LZ77 Match data.
	   * @param {!number} offset スキップ開始位置(相対指定).
	   * @private
	   */

	  function writeMatch(match, offset) {
	    /** @type {Array.<number>} */
	    var lz77Array = match.toLz77Array();
	    /** @type {number} */

	    var i;
	    /** @type {number} */

	    var il;

	    for (i = 0, il = lz77Array.length; i < il; ++i) {
	      lz77buf[pos++] = lz77Array[i];
	    }

	    freqsLitLen[lz77Array[0]]++;
	    freqsDist[lz77Array[3]]++;
	    skipLength = match.length + offset - 1;
	    prevMatch = null;
	  } // LZ77 符号化


	  for (position = 0, length = dataArray.length; position < length; ++position) {
	    // ハッシュキーの作成
	    for (matchKey = 0, i = 0, il = Zlib$1.RawDeflate.Lz77MinLength; i < il; ++i) {
	      if (position + i === length) {
	        break;
	      }

	      matchKey = matchKey << 8 | dataArray[position + i];
	    } // テーブルが未定義だったら作成する


	    if (table[matchKey] === void 0) {
	      table[matchKey] = [];
	    }

	    matchList = table[matchKey]; // skip

	    if (skipLength-- > 0) {
	      matchList.push(position);
	      continue;
	    } // マッチテーブルの更新 (最大戻り距離を超えているものを削除する)


	    while (matchList.length > 0 && position - matchList[0] > windowSize) {
	      matchList.shift();
	    } // データ末尾でマッチしようがない場合はそのまま流しこむ


	    if (position + Zlib$1.RawDeflate.Lz77MinLength >= length) {
	      if (prevMatch) {
	        writeMatch(prevMatch, -1);
	      }

	      for (i = 0, il = length - position; i < il; ++i) {
	        tmp = dataArray[position + i];
	        lz77buf[pos++] = tmp;
	        ++freqsLitLen[tmp];
	      }

	      break;
	    } // マッチ候補から最長のものを探す


	    if (matchList.length > 0) {
	      longestMatch = this.searchLongestMatch_(dataArray, position, matchList);

	      if (prevMatch) {
	        // 現在のマッチの方が前回のマッチよりも長い
	        if (prevMatch.length < longestMatch.length) {
	          // write previous literal
	          tmp = dataArray[position - 1];
	          lz77buf[pos++] = tmp;
	          ++freqsLitLen[tmp]; // write current match

	          writeMatch(longestMatch, 0);
	        } else {
	          // write previous match
	          writeMatch(prevMatch, -1);
	        }
	      } else if (longestMatch.length < lazy) {
	        prevMatch = longestMatch;
	      } else {
	        writeMatch(longestMatch, 0);
	      } // 前回マッチしていて今回マッチがなかったら前回のを採用

	    } else if (prevMatch) {
	      writeMatch(prevMatch, -1);
	    } else {
	      tmp = dataArray[position];
	      lz77buf[pos++] = tmp;
	      ++freqsLitLen[tmp];
	    }

	    matchList.push(position); // マッチテーブルに現在の位置を保存
	  } // 終端処理


	  lz77buf[pos++] = 256;
	  freqsLitLen[256]++;
	  this.freqsLitLen = freqsLitLen;
	  this.freqsDist = freqsDist;
	  return (
	    /** @type {!(Uint16Array|Array.<number>)} */
	    lz77buf.subarray(0, pos)
	  );
	};
	/**
	 * マッチした候補の中から最長一致を探す
	 * @param {!Object} data plain data byte array.
	 * @param {!number} position plain data byte array position.
	 * @param {!Array.<number>} matchList 候補となる位置の配列.
	 * @return {!Zlib.RawDeflate.Lz77Match} 最長かつ最短距離のマッチオブジェクト.
	 * @private
	 */


	Zlib$1.RawDeflate.prototype.searchLongestMatch_ = function (data, position, matchList) {
	  var match,
	      currentMatch,
	      matchMax = 0,
	      matchLength,
	      i,
	      j,
	      l,
	      dl = data.length; // 候補を後ろから 1 つずつ絞り込んでゆく

	  permatch: for (i = 0, l = matchList.length; i < l; i++) {
	    match = matchList[l - i - 1];
	    matchLength = Zlib$1.RawDeflate.Lz77MinLength; // 前回までの最長一致を末尾から一致検索する

	    if (matchMax > Zlib$1.RawDeflate.Lz77MinLength) {
	      for (j = matchMax; j > Zlib$1.RawDeflate.Lz77MinLength; j--) {
	        if (data[match + j - 1] !== data[position + j - 1]) {
	          continue permatch;
	        }
	      }

	      matchLength = matchMax;
	    } // 最長一致探索


	    while (matchLength < Zlib$1.RawDeflate.Lz77MaxLength && position + matchLength < dl && data[match + matchLength] === data[position + matchLength]) {
	      ++matchLength;
	    } // マッチ長が同じ場合は後方を優先


	    if (matchLength > matchMax) {
	      currentMatch = match;
	      matchMax = matchLength;
	    } // 最長が確定したら後の処理は省略


	    if (matchLength === Zlib$1.RawDeflate.Lz77MaxLength) {
	      break;
	    }
	  }

	  return new Zlib$1.RawDeflate.Lz77Match(matchMax, position - currentMatch);
	};
	/**
	 * Tree-Transmit Symbols の算出
	 * reference: PuTTY Deflate implementation
	 * @param {number} hlit HLIT.
	 * @param {!(Array.<number>|Uint8Array)} litlenLengths リテラルと長さ符号の符号長配列.
	 * @param {number} hdist HDIST.
	 * @param {!(Array.<number>|Uint8Array)} distLengths 距離符号の符号長配列.
	 * @return {{
	 *   codes: !(Array.<number>|Uint32Array),
	 *   freqs: !(Array.<number>|Uint8Array)
	 * }} Tree-Transmit Symbols.
	 */


	Zlib$1.RawDeflate.prototype.getTreeSymbols_ = function (hlit, litlenLengths, hdist, distLengths) {
	  var src = new Uint32Array(hlit + hdist),
	      i,
	      j,
	      runLength,
	      l,
	      result = new Uint32Array(286 + 30),
	      nResult,
	      rpt,
	      freqs = new Uint8Array(19);
	  j = 0;

	  for (i = 0; i < hlit; i++) {
	    src[j++] = litlenLengths[i];
	  }

	  for (i = 0; i < hdist; i++) {
	    src[j++] = distLengths[i];
	  } // 符号化


	  nResult = 0;

	  for (i = 0, l = src.length; i < l; i += j) {
	    // Run Length Encoding
	    for (j = 1; i + j < l && src[i + j] === src[i]; ++j) {}

	    runLength = j;

	    if (src[i] === 0) {
	      // 0 の繰り返しが 3 回未満ならばそのまま
	      if (runLength < 3) {
	        while (runLength-- > 0) {
	          result[nResult++] = 0;
	          freqs[0]++;
	        }
	      } else {
	        while (runLength > 0) {
	          // 繰り返しは最大 138 までなので切り詰める
	          rpt = runLength < 138 ? runLength : 138;

	          if (rpt > runLength - 3 && rpt < runLength) {
	            rpt = runLength - 3;
	          } // 3-10 回 -> 17


	          if (rpt <= 10) {
	            result[nResult++] = 17;
	            result[nResult++] = rpt - 3;
	            freqs[17]++; // 11-138 回 -> 18
	          } else {
	            result[nResult++] = 18;
	            result[nResult++] = rpt - 11;
	            freqs[18]++;
	          }

	          runLength -= rpt;
	        }
	      }
	    } else {
	      result[nResult++] = src[i];
	      freqs[src[i]]++;
	      runLength--; // 繰り返し回数が3回未満ならばランレングス符号は要らない

	      if (runLength < 3) {
	        while (runLength-- > 0) {
	          result[nResult++] = src[i];
	          freqs[src[i]]++;
	        } // 3 回以上ならばランレングス符号化

	      } else {
	        while (runLength > 0) {
	          // runLengthを 3-6 で分割
	          rpt = runLength < 6 ? runLength : 6;

	          if (rpt > runLength - 3 && rpt < runLength) {
	            rpt = runLength - 3;
	          }

	          result[nResult++] = 16;
	          result[nResult++] = rpt - 3;
	          freqs[16]++;
	          runLength -= rpt;
	        }
	      }
	    }
	  }

	  return {
	    codes: result.subarray(0, nResult),
	    freqs: freqs
	  };
	};
	/**
	 * ハフマン符号の長さを取得する
	 * @param {!(Array.<number>|Uint8Array|Uint32Array)} freqs 出現カウント.
	 * @param {number} limit 符号長の制限.
	 * @return {!(Array.<number>|Uint8Array)} 符号長配列.
	 * @private
	 */


	Zlib$1.RawDeflate.prototype.getLengths_ = function (freqs, limit) {
	  /** @type {number} */
	  var nSymbols = freqs.length;
	  /** @type {Zlib.Heap} */

	  var heap = new Zlib$1.Heap(2 * Zlib$1.RawDeflate.HUFMAX);
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var length = new Uint8Array(nSymbols);
	  /** @type {Array} */

	  var nodes;
	  /** @type {!(Array.<number>|Uint32Array)} */

	  var values;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var codeLength;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il; // ヒープの構築

	  for (i = 0; i < nSymbols; ++i) {
	    if (freqs[i] > 0) {
	      heap.push(i, freqs[i]);
	    }
	  }

	  nodes = new Array(heap.length / 2);
	  values = new Uint32Array(heap.length / 2); // 非 0 の要素が一つだけだった場合は、そのシンボルに符号長 1 を割り当てて終了

	  if (nodes.length === 1) {
	    length[heap.pop().index] = 1;
	    return length;
	  } // Reverse Package Merge Algorithm による Canonical Huffman Code の符号長決定


	  for (i = 0, il = heap.length / 2; i < il; ++i) {
	    nodes[i] = heap.pop();
	    values[i] = nodes[i].value;
	  }

	  codeLength = this.reversePackageMerge_(values, values.length, limit);

	  for (i = 0, il = nodes.length; i < il; ++i) {
	    length[nodes[i].index] = codeLength[i];
	  }

	  return length;
	};
	/**
	 * Reverse Package Merge Algorithm.
	 * @param {!(Array.<number>|Uint32Array)} freqs sorted probability.
	 * @param {number} symbols number of symbols.
	 * @param {number} limit code length limit.
	 * @return {!(Array.<number>|Uint8Array)} code lengths.
	 */


	Zlib$1.RawDeflate.prototype.reversePackageMerge_ = function (freqs, symbols, limit) {
	  /** @type {!(Array.<number>|Uint16Array)} */
	  var minimumCost = new Uint16Array(limit);
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var flag = new Uint8Array(limit);
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var codeLength = new Uint8Array(symbols);
	  /** @type {Array} */

	  var value = new Array(limit);
	  /** @type {Array} */

	  var type = new Array(limit);
	  /** @type {Array.<number>} */

	  var currentPosition = new Array(limit);
	  /** @type {number} */

	  var excess = (1 << limit) - symbols;
	  /** @type {number} */

	  var half = 1 << limit - 1;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var j;
	  /** @type {number} */

	  var t;
	  /** @type {number} */

	  var weight;
	  /** @type {number} */

	  var next;
	  /**
	   * @param {number} j
	   */

	  function takePackage(j) {
	    /** @type {number} */
	    var x = type[j][currentPosition[j]];

	    if (x === symbols) {
	      takePackage(j + 1);
	      takePackage(j + 1);
	    } else {
	      --codeLength[x];
	    }

	    ++currentPosition[j];
	  }

	  minimumCost[limit - 1] = symbols;

	  for (j = 0; j < limit; ++j) {
	    if (excess < half) {
	      flag[j] = 0;
	    } else {
	      flag[j] = 1;
	      excess -= half;
	    }

	    excess <<= 1;
	    minimumCost[limit - 2 - j] = (minimumCost[limit - 1 - j] / 2 | 0) + symbols;
	  }

	  minimumCost[0] = flag[0];
	  value[0] = new Array(minimumCost[0]);
	  type[0] = new Array(minimumCost[0]);

	  for (j = 1; j < limit; ++j) {
	    if (minimumCost[j] > 2 * minimumCost[j - 1] + flag[j]) {
	      minimumCost[j] = 2 * minimumCost[j - 1] + flag[j];
	    }

	    value[j] = new Array(minimumCost[j]);
	    type[j] = new Array(minimumCost[j]);
	  }

	  for (i = 0; i < symbols; ++i) {
	    codeLength[i] = limit;
	  }

	  for (t = 0; t < minimumCost[limit - 1]; ++t) {
	    value[limit - 1][t] = freqs[t];
	    type[limit - 1][t] = t;
	  }

	  for (i = 0; i < limit; ++i) {
	    currentPosition[i] = 0;
	  }

	  if (flag[limit - 1] === 1) {
	    --codeLength[0];
	    ++currentPosition[limit - 1];
	  }

	  for (j = limit - 2; j >= 0; --j) {
	    i = 0;
	    weight = 0;
	    next = currentPosition[j + 1];

	    for (t = 0; t < minimumCost[j]; t++) {
	      weight = value[j + 1][next] + value[j + 1][next + 1];

	      if (weight > freqs[i]) {
	        value[j][t] = weight;
	        type[j][t] = symbols;
	        next += 2;
	      } else {
	        value[j][t] = freqs[i];
	        type[j][t] = i;
	        ++i;
	      }
	    }

	    currentPosition[j] = 0;

	    if (flag[j] === 1) {
	      takePackage(j);
	    }
	  }

	  return codeLength;
	};
	/**
	 * 符号長配列からハフマン符号を取得する
	 * reference: PuTTY Deflate implementation
	 * @param {!(Array.<number>|Uint8Array)} lengths 符号長配列.
	 * @return {!(Array.<number>|Uint16Array)} ハフマン符号配列.
	 * @private
	 */


	Zlib$1.RawDeflate.prototype.getCodesFromLengths_ = function (lengths) {
	  var codes = new Uint16Array(lengths.length),
	      count = [],
	      startCode = [],
	      code = 0,
	      i,
	      il,
	      j,
	      m; // Count the codes of each length.

	  for (i = 0, il = lengths.length; i < il; i++) {
	    count[lengths[i]] = (count[lengths[i]] | 0) + 1;
	  } // Determine the starting code for each length block.


	  for (i = 1, il = Zlib$1.RawDeflate.MaxCodeLength; i <= il; i++) {
	    startCode[i] = code;
	    code += count[i] | 0;
	    code <<= 1;
	  } // Determine the code for each symbol. Mirrored, of course.


	  for (i = 0, il = lengths.length; i < il; i++) {
	    code = startCode[lengths[i]];
	    startCode[lengths[i]] += 1;
	    codes[i] = 0;

	    for (j = 0, m = lengths[i]; j < m; j++) {
	      codes[i] = codes[i] << 1 | code & 1;
	      code >>>= 1;
	    }
	  }

	  return codes;
	};
	/**
	 * @param {!(Array.<number>|Uint8Array)} input input buffer.
	 * @param {Object=} opt_params options.
	 * @constructor
	 */


	Zlib$1.Unzip = function (input, opt_params) {
	  opt_params = opt_params || {};
	  /** @type {!(Array.<number>|Uint8Array)} */

	  this.input = input instanceof Array ? new Uint8Array(input) : input;
	  /** @type {number} */

	  this.ip = 0;
	  /** @type {number} */

	  this.eocdrOffset;
	  /** @type {number} */

	  this.numberOfThisDisk;
	  /** @type {number} */

	  this.startDisk;
	  /** @type {number} */

	  this.totalEntriesThisDisk;
	  /** @type {number} */

	  this.totalEntries;
	  /** @type {number} */

	  this.centralDirectorySize;
	  /** @type {number} */

	  this.centralDirectoryOffset;
	  /** @type {number} */

	  this.commentLength;
	  /** @type {(Array.<number>|Uint8Array)} */

	  this.comment;
	  /** @type {Array.<Zlib.Unzip.FileHeader>} */

	  this.fileHeaderList;
	  /** @type {Object.<string, number>} */

	  this.filenameToIndex;
	  /** @type {boolean} */

	  this.verify = opt_params['verify'] || false;
	  /** @type {(Array.<number>|Uint8Array)} */

	  this.password = opt_params['password'];
	};

	Zlib$1.Unzip.CompressionMethod = Zlib$1.Zip.CompressionMethod;
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib$1.Unzip.FileHeaderSignature = Zlib$1.Zip.FileHeaderSignature;
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib$1.Unzip.LocalFileHeaderSignature = Zlib$1.Zip.LocalFileHeaderSignature;
	/**
	 * @type {Array.<number>}
	 * @const
	 */

	Zlib$1.Unzip.CentralDirectorySignature = Zlib$1.Zip.CentralDirectorySignature;
	/**
	 * @param {!(Array.<number>|Uint8Array)} input input buffer.
	 * @param {number} ip input position.
	 * @constructor
	 */

	Zlib$1.Unzip.FileHeader = function (input, ip) {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  this.input = input;
	  /** @type {number} */

	  this.offset = ip;
	  /** @type {number} */

	  this.length;
	  /** @type {number} */

	  this.version;
	  /** @type {number} */

	  this.os;
	  /** @type {number} */

	  this.needVersion;
	  /** @type {number} */

	  this.flags;
	  /** @type {number} */

	  this.compression;
	  /** @type {number} */

	  this.time;
	  /** @type {number} */

	  this.date;
	  /** @type {number} */

	  this.crc32;
	  /** @type {number} */

	  this.compressedSize;
	  /** @type {number} */

	  this.plainSize;
	  /** @type {number} */

	  this.fileNameLength;
	  /** @type {number} */

	  this.extraFieldLength;
	  /** @type {number} */

	  this.fileCommentLength;
	  /** @type {number} */

	  this.diskNumberStart;
	  /** @type {number} */

	  this.internalFileAttributes;
	  /** @type {number} */

	  this.externalFileAttributes;
	  /** @type {number} */

	  this.relativeOffset;
	  /** @type {string} */

	  this.filename;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  this.extraField;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  this.comment;
	};

	Zlib$1.Unzip.FileHeader.prototype.parse = function () {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  var input = this.input;
	  /** @type {number} */

	  var ip = this.offset; // central file header signature

	  if (input[ip++] !== Zlib$1.Unzip.FileHeaderSignature[0] || input[ip++] !== Zlib$1.Unzip.FileHeaderSignature[1] || input[ip++] !== Zlib$1.Unzip.FileHeaderSignature[2] || input[ip++] !== Zlib$1.Unzip.FileHeaderSignature[3]) {
	    throw new Error('invalid file header signature');
	  } // version made by


	  this.version = input[ip++];
	  this.os = input[ip++]; // version needed to extract

	  this.needVersion = input[ip++] | input[ip++] << 8; // general purpose bit flag

	  this.flags = input[ip++] | input[ip++] << 8; // compression method

	  this.compression = input[ip++] | input[ip++] << 8; // last mod file time

	  this.time = input[ip++] | input[ip++] << 8; //last mod file date

	  this.date = input[ip++] | input[ip++] << 8; // crc-32

	  this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // compressed size

	  this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // uncompressed size

	  this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // file name length

	  this.fileNameLength = input[ip++] | input[ip++] << 8; // extra field length

	  this.extraFieldLength = input[ip++] | input[ip++] << 8; // file comment length

	  this.fileCommentLength = input[ip++] | input[ip++] << 8; // disk number start

	  this.diskNumberStart = input[ip++] | input[ip++] << 8; // internal file attributes

	  this.internalFileAttributes = input[ip++] | input[ip++] << 8; // external file attributes

	  this.externalFileAttributes = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24; // relative offset of local header

	  this.relativeOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // file name

	  this.filename = String.fromCharCode.apply(null, input.subarray(ip, ip += this.fileNameLength)); // extra field

	  this.extraField = input.subarray(ip, ip += this.extraFieldLength); // file comment

	  this.comment = input.subarray(ip, ip + this.fileCommentLength);
	  this.length = ip - this.offset;
	};
	/**
	 * @param {!(Array.<number>|Uint8Array)} input input buffer.
	 * @param {number} ip input position.
	 * @constructor
	 */


	Zlib$1.Unzip.LocalFileHeader = function (input, ip) {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  this.input = input;
	  /** @type {number} */

	  this.offset = ip;
	  /** @type {number} */

	  this.length;
	  /** @type {number} */

	  this.needVersion;
	  /** @type {number} */

	  this.flags;
	  /** @type {number} */

	  this.compression;
	  /** @type {number} */

	  this.time;
	  /** @type {number} */

	  this.date;
	  /** @type {number} */

	  this.crc32;
	  /** @type {number} */

	  this.compressedSize;
	  /** @type {number} */

	  this.plainSize;
	  /** @type {number} */

	  this.fileNameLength;
	  /** @type {number} */

	  this.extraFieldLength;
	  /** @type {string} */

	  this.filename;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  this.extraField;
	};

	Zlib$1.Unzip.LocalFileHeader.Flags = Zlib$1.Zip.Flags;

	Zlib$1.Unzip.LocalFileHeader.prototype.parse = function () {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  var input = this.input;
	  /** @type {number} */

	  var ip = this.offset; // local file header signature

	  if (input[ip++] !== Zlib$1.Unzip.LocalFileHeaderSignature[0] || input[ip++] !== Zlib$1.Unzip.LocalFileHeaderSignature[1] || input[ip++] !== Zlib$1.Unzip.LocalFileHeaderSignature[2] || input[ip++] !== Zlib$1.Unzip.LocalFileHeaderSignature[3]) {
	    throw new Error('invalid local file header signature');
	  } // version needed to extract


	  this.needVersion = input[ip++] | input[ip++] << 8; // general purpose bit flag

	  this.flags = input[ip++] | input[ip++] << 8; // compression method

	  this.compression = input[ip++] | input[ip++] << 8; // last mod file time

	  this.time = input[ip++] | input[ip++] << 8; //last mod file date

	  this.date = input[ip++] | input[ip++] << 8; // crc-32

	  this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // compressed size

	  this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // uncompressed size

	  this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // file name length

	  this.fileNameLength = input[ip++] | input[ip++] << 8; // extra field length

	  this.extraFieldLength = input[ip++] | input[ip++] << 8; // file name

	  this.filename = String.fromCharCode.apply(null, input.subarray(ip, ip += this.fileNameLength)); // extra field

	  this.extraField = input.subarray(ip, ip += this.extraFieldLength);
	  this.length = ip - this.offset;
	};

	Zlib$1.Unzip.prototype.searchEndOfCentralDirectoryRecord = function () {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  var input = this.input;
	  /** @type {number} */

	  var ip;

	  for (ip = input.length - 12; ip > 0; --ip) {
	    if (input[ip] === Zlib$1.Unzip.CentralDirectorySignature[0] && input[ip + 1] === Zlib$1.Unzip.CentralDirectorySignature[1] && input[ip + 2] === Zlib$1.Unzip.CentralDirectorySignature[2] && input[ip + 3] === Zlib$1.Unzip.CentralDirectorySignature[3]) {
	      this.eocdrOffset = ip;
	      return;
	    }
	  }

	  throw new Error('End of Central Directory Record not found');
	};

	Zlib$1.Unzip.prototype.parseEndOfCentralDirectoryRecord = function () {
	  /** @type {!(Array.<number>|Uint8Array)} */
	  var input = this.input;
	  /** @type {number} */

	  var ip;

	  if (!this.eocdrOffset) {
	    this.searchEndOfCentralDirectoryRecord();
	  }

	  ip = this.eocdrOffset; // signature

	  if (input[ip++] !== Zlib$1.Unzip.CentralDirectorySignature[0] || input[ip++] !== Zlib$1.Unzip.CentralDirectorySignature[1] || input[ip++] !== Zlib$1.Unzip.CentralDirectorySignature[2] || input[ip++] !== Zlib$1.Unzip.CentralDirectorySignature[3]) {
	    throw new Error('invalid signature');
	  } // number of this disk


	  this.numberOfThisDisk = input[ip++] | input[ip++] << 8; // number of the disk with the start of the central directory

	  this.startDisk = input[ip++] | input[ip++] << 8; // total number of entries in the central directory on this disk

	  this.totalEntriesThisDisk = input[ip++] | input[ip++] << 8; // total number of entries in the central directory

	  this.totalEntries = input[ip++] | input[ip++] << 8; // size of the central directory

	  this.centralDirectorySize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // offset of start of central directory with respect to the starting disk number

	  this.centralDirectoryOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0; // .ZIP file comment length

	  this.commentLength = input[ip++] | input[ip++] << 8; // .ZIP file comment

	  this.comment = input.subarray(ip, ip + this.commentLength);
	};

	Zlib$1.Unzip.prototype.parseFileHeader = function () {
	  /** @type {Array.<Zlib.Unzip.FileHeader>} */
	  var filelist = [];
	  /** @type {Object.<string, number>} */

	  var filetable = {};
	  /** @type {number} */

	  var ip;
	  /** @type {Zlib.Unzip.FileHeader} */

	  var fileHeader;
	  /*: @type {number} */

	  var i;
	  /*: @type {number} */

	  var il;

	  if (this.fileHeaderList) {
	    return;
	  }

	  if (this.centralDirectoryOffset === void 0) {
	    this.parseEndOfCentralDirectoryRecord();
	  }

	  ip = this.centralDirectoryOffset;

	  for (i = 0, il = this.totalEntries; i < il; ++i) {
	    fileHeader = new Zlib$1.Unzip.FileHeader(this.input, ip);
	    fileHeader.parse();
	    ip += fileHeader.length;
	    filelist[i] = fileHeader;
	    filetable[fileHeader.filename] = i;
	  }

	  if (this.centralDirectorySize < ip - this.centralDirectoryOffset) {
	    throw new Error('invalid file header size');
	  }

	  this.fileHeaderList = filelist;
	  this.filenameToIndex = filetable;
	};
	/**
	 * @param {number} index file header index.
	 * @param {Object=} opt_params
	 * @return {!(Array.<number>|Uint8Array)} file data.
	 */


	Zlib$1.Unzip.prototype.getFileData = function (index, opt_params) {
	  opt_params = opt_params || {};
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var input = this.input;
	  /** @type {Array.<Zlib.Unzip.FileHeader>} */

	  var fileHeaderList = this.fileHeaderList;
	  /** @type {Zlib.Unzip.LocalFileHeader} */

	  var localFileHeader;
	  /** @type {number} */

	  var offset;
	  /** @type {number} */

	  var length;
	  /** @type {!(Array.<number>|Uint8Array)} */

	  var buffer;
	  /** @type {number} */

	  var crc32;
	  /** @type {Array.<number>|Uint32Array|Object} */

	  var key;
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;

	  if (!fileHeaderList) {
	    this.parseFileHeader();
	  }

	  if (fileHeaderList[index] === void 0) {
	    throw new Error('wrong index');
	  }

	  offset = fileHeaderList[index].relativeOffset;
	  localFileHeader = new Zlib$1.Unzip.LocalFileHeader(this.input, offset);
	  localFileHeader.parse();
	  offset += localFileHeader.length;
	  length = localFileHeader.compressedSize; // decryption

	  if ((localFileHeader.flags & Zlib$1.Unzip.LocalFileHeader.Flags.ENCRYPT) !== 0) {
	    if (!(opt_params['password'] || this.password)) {
	      throw new Error('please set password');
	    }

	    key = this.createDecryptionKey(opt_params['password'] || this.password); // encryption header

	    for (i = offset, il = offset + 12; i < il; ++i) {
	      this.decode(key, input[i]);
	    }

	    offset += 12;
	    length -= 12; // decryption

	    for (i = offset, il = offset + length; i < il; ++i) {
	      input[i] = this.decode(key, input[i]);
	    }
	  }

	  switch (localFileHeader.compression) {
	    case Zlib$1.Unzip.CompressionMethod.STORE:
	      buffer = this.input.subarray(offset, offset + length);
	      break;

	    case Zlib$1.Unzip.CompressionMethod.DEFLATE:
	      buffer = new Zlib$1.RawInflate(this.input, {
	        'index': offset,
	        'bufferSize': localFileHeader.plainSize
	      }).decompress();
	      break;

	    default:
	      throw new Error('unknown compression type');
	  }

	  if (this.verify) {
	    crc32 = Zlib$1.CRC32.calc(buffer);

	    if (localFileHeader.crc32 !== crc32) {
	      throw new Error('wrong crc: file=0x' + localFileHeader.crc32.toString(16) + ', data=0x' + crc32.toString(16));
	    }
	  }

	  return buffer;
	};
	/**
	 * @return {Array.<string>}
	 */


	Zlib$1.Unzip.prototype.getFilenames = function () {
	  /** @type {Array.<string>} */
	  var filenameList = [];
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;
	  /** @type {Array.<Zlib.Unzip.FileHeader>} */

	  var fileHeaderList;

	  if (!this.fileHeaderList) {
	    this.parseFileHeader();
	  }

	  fileHeaderList = this.fileHeaderList;

	  for (i = 0, il = fileHeaderList.length; i < il; ++i) {
	    filenameList[i] = fileHeaderList[i].filename;
	  }

	  return filenameList;
	};
	/**
	 * @param {string} filename extract filename.
	 * @param {Object=} opt_params
	 * @return {!(Array.<number>|Uint8Array)} decompressed data.
	 */


	Zlib$1.Unzip.prototype.decompress = function (filename, opt_params) {
	  /** @type {number} */
	  var index;

	  if (!this.filenameToIndex) {
	    this.parseFileHeader();
	  }

	  index = this.filenameToIndex[filename];

	  if (index === void 0) {
	    throw new Error(filename + ' not found');
	  }

	  return this.getFileData(index, opt_params);
	};
	/**
	 * @param {(Array.<number>|Uint8Array)} password
	 */


	Zlib$1.Unzip.prototype.setPassword = function (password) {
	  this.password = password;
	};
	/**
	 * @param {(Array.<number>|Uint32Array|Object)} key
	 * @param {number} n
	 * @return {number}
	 */


	Zlib$1.Unzip.prototype.decode = function (key, n) {
	  n ^= this.getByte(
	  /** @type {(Array.<number>|Uint32Array)} */
	  key);
	  this.updateKeys(
	  /** @type {(Array.<number>|Uint32Array)} */
	  key, n);
	  return n;
	}; // common method


	Zlib$1.Unzip.prototype.updateKeys = Zlib$1.Zip.prototype.updateKeys;
	Zlib$1.Unzip.prototype.createDecryptionKey = Zlib$1.Zip.prototype.createEncryptionKey;
	Zlib$1.Unzip.prototype.getByte = Zlib$1.Zip.prototype.getByte;
	/**
	 * @fileoverview 雑多な関数群をまとめたモジュール実装.
	 */

	/**
	 * Byte String から Byte Array に変換.
	 * @param {!string} str byte string.
	 * @return {!Array.<number>} byte array.
	 */

	Zlib$1.Util.stringToByteArray = function (str) {
	  /** @type {!Array.<(string|number)>} */
	  var tmp = str.split('');
	  /** @type {number} */

	  var i;
	  /** @type {number} */

	  var il;

	  for (i = 0, il = tmp.length; i < il; i++) {
	    tmp[i] = (tmp[i].charCodeAt(0) & 0xff) >>> 0;
	  }

	  return tmp;
	};
	/**
	 * @fileoverview Adler32 checksum 実装.
	 */

	/**
	 * Adler32 ハッシュ値の作成
	 * @param {!(Array|Uint8Array|string)} array 算出に使用する byte array.
	 * @return {number} Adler32 ハッシュ値.
	 */


	Zlib$1.Adler32 = function (array) {
	  if (typeof array === 'string') {
	    array = Zlib$1.Util.stringToByteArray(array);
	  }

	  return Zlib$1.Adler32.update(1, array);
	};
	/**
	 * Adler32 ハッシュ値の更新
	 * @param {number} adler 現在のハッシュ値.
	 * @param {!(Array|Uint8Array)} array 更新に使用する byte array.
	 * @return {number} Adler32 ハッシュ値.
	 */


	Zlib$1.Adler32.update = function (adler, array) {
	  /** @type {number} */
	  var s1 = adler & 0xffff;
	  /** @type {number} */

	  var s2 = adler >>> 16 & 0xffff;
	  /** @type {number} array length */

	  var len = array.length;
	  /** @type {number} loop length (don't overflow) */

	  var tlen;
	  /** @type {number} array index */

	  var i = 0;

	  while (len > 0) {
	    tlen = len > Zlib$1.Adler32.OptimizationParameter ? Zlib$1.Adler32.OptimizationParameter : len;
	    len -= tlen;

	    do {
	      s1 += array[i++];
	      s2 += s1;
	    } while (--tlen);

	    s1 %= 65521;
	    s2 %= 65521;
	  }

	  return (s2 << 16 | s1) >>> 0;
	};
	/**
	 * Adler32 最適化パラメータ
	 * 現状では 1024 程度が最適.
	 * @see http://jsperf.com/adler-32-simple-vs-optimized/3
	 * @define {number}
	 */


	Zlib$1.Adler32.OptimizationParameter = 1024;
	/**
	 * ビットストリーム
	 * @constructor
	 * @param {!(Array|Uint8Array)=} buffer output buffer.
	 * @param {number=} bufferPosition start buffer pointer.
	 */

	Zlib$1.BitStream = function (buffer, bufferPosition) {
	  /** @type {number} buffer index. */
	  this.index = typeof bufferPosition === 'number' ? bufferPosition : 0;
	  /** @type {number} bit index. */

	  this.bitindex = 0;
	  /** @type {!(Array|Uint8Array)} bit-stream output buffer. */

	  this.buffer = buffer instanceof Uint8Array ? buffer : new Uint8Array(Zlib$1.BitStream.DefaultBlockSize); // 入力された index が足りなかったら拡張するが、倍にしてもダメなら不正とする

	  if (this.buffer.length * 2 <= this.index) {
	    throw new Error("invalid index");
	  } else if (this.buffer.length <= this.index) {
	    this.expandBuffer();
	  }
	};
	/**
	 * デフォルトブロックサイズ.
	 * @const
	 * @type {number}
	 */


	Zlib$1.BitStream.DefaultBlockSize = 0x8000;
	/**
	 * expand buffer.
	 * @return {!(Array|Uint8Array)} new buffer.
	 */

	Zlib$1.BitStream.prototype.expandBuffer = function () {
	  /** @type {!(Array|Uint8Array)} old buffer. */
	  var oldbuf = this.buffer;
	  /** @type {number} loop limiter. */

	  var il = oldbuf.length;
	  /** @type {!(Array|Uint8Array)} new buffer. */

	  var buffer = new Uint8Array(il << 1); // copy buffer

	  {
	    buffer.set(oldbuf);
	  }
	  return this.buffer = buffer;
	};
	/**
	 * 数値をビットで指定した数だけ書き込む.
	 * @param {number} number 書き込む数値.
	 * @param {number} n 書き込むビット数.
	 * @param {boolean=} reverse 逆順に書き込むならば true.
	 */


	Zlib$1.BitStream.prototype.writeBits = function (number, n, reverse) {
	  var buffer = this.buffer;
	  var index = this.index;
	  var bitindex = this.bitindex;
	  /** @type {number} current octet. */

	  var current = buffer[index];
	  /** @type {number} loop counter. */

	  var i;
	  /**
	   * 32-bit 整数のビット順を逆にする
	   * @param {number} n 32-bit integer.
	   * @return {number} reversed 32-bit integer.
	   * @private
	   */

	  function rev32_(n) {
	    return Zlib$1.BitStream.ReverseTable[n & 0xFF] << 24 | Zlib$1.BitStream.ReverseTable[n >>> 8 & 0xFF] << 16 | Zlib$1.BitStream.ReverseTable[n >>> 16 & 0xFF] << 8 | Zlib$1.BitStream.ReverseTable[n >>> 24 & 0xFF];
	  }

	  if (reverse && n > 1) {
	    number = n > 8 ? rev32_(number) >> 32 - n : Zlib$1.BitStream.ReverseTable[number] >> 8 - n;
	  } // Byte 境界を超えないとき


	  if (n + bitindex < 8) {
	    current = current << n | number;
	    bitindex += n; // Byte 境界を超えるとき
	  } else {
	    for (i = 0; i < n; ++i) {
	      current = current << 1 | number >> n - i - 1 & 1; // next byte

	      if (++bitindex === 8) {
	        bitindex = 0;
	        buffer[index++] = Zlib$1.BitStream.ReverseTable[current];
	        current = 0; // expand

	        if (index === buffer.length) {
	          buffer = this.expandBuffer();
	        }
	      }
	    }
	  }

	  buffer[index] = current;
	  this.buffer = buffer;
	  this.bitindex = bitindex;
	  this.index = index;
	};
	/**
	 * ストリームの終端処理を行う
	 * @return {!(Array|Uint8Array)} 終端処理後のバッファを byte array で返す.
	 */


	Zlib$1.BitStream.prototype.finish = function () {
	  var buffer = this.buffer;
	  var index = this.index;
	  /** @type {!(Array|Uint8Array)} output buffer. */

	  var output; // bitindex が 0 の時は余分に index が進んでいる状態

	  if (this.bitindex > 0) {
	    buffer[index] <<= 8 - this.bitindex;
	    buffer[index] = Zlib$1.BitStream.ReverseTable[buffer[index]];
	    index++;
	  } // array truncation


	  {
	    output = buffer.subarray(0, index);
	  }
	  return output;
	};
	/**
	 * 0-255 のビット順を反転したテーブル
	 * @const
	 * @type {!(Uint8Array|Array.<number>)}
	 */


	Zlib$1.BitStream.ReverseTable = function (table) {
	  return table;
	}(function () {
	  /** @type {!(Array|Uint8Array)} reverse table. */
	  var table = new Uint8Array(256);
	  /** @type {number} loop counter. */

	  var i; // generate

	  for (i = 0; i < 256; ++i) {
	    table[i] = function (n) {
	      var r = n;
	      var s = 7;

	      for (n >>>= 1; n; n >>>= 1) {
	        r <<= 1;
	        r |= n & 1;
	        --s;
	      }

	      return (r << s & 0xff) >>> 0;
	    }(i);
	  }

	  return table;
	}());
	/**
	 * CRC32 ハッシュ値を取得
	 * @param {!(Array.<number>|Uint8Array)} data data byte array.
	 * @param {number=} pos data position.
	 * @param {number=} length data length.
	 * @return {number} CRC32.
	 */


	Zlib$1.CRC32.calc = function (data, pos, length) {
	  return Zlib$1.CRC32.update(data, 0, pos, length);
	};
	/**
	 * CRC32ハッシュ値を更新
	 * @param {!(Array.<number>|Uint8Array)} data data byte array.
	 * @param {number} crc CRC32.
	 * @param {number=} pos data position.
	 * @param {number=} length data length.
	 * @return {number} CRC32.
	 */


	Zlib$1.CRC32.update = function (data, crc, pos, length) {
	  var table = Zlib$1.CRC32.Table;
	  var i = typeof pos === 'number' ? pos : pos = 0;
	  var il = typeof length === 'number' ? length : data.length;
	  crc ^= 0xffffffff; // loop unrolling for performance

	  for (i = il & 7; i--; ++pos) {
	    crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 0xff];
	  }

	  for (i = il >> 3; i--; pos += 8) {
	    crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 1]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 2]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 3]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 4]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 5]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 6]) & 0xff];
	    crc = crc >>> 8 ^ table[(crc ^ data[pos + 7]) & 0xff];
	  }

	  return (crc ^ 0xffffffff) >>> 0;
	};
	/**
	 * @param {number} num
	 * @param {number} crc
	 * @returns {number}
	 */


	Zlib$1.CRC32.single = function (num, crc) {
	  return (Zlib$1.CRC32.Table[(num ^ crc) & 0xff] ^ num >>> 8) >>> 0;
	};
	/**
	 * @type {Array.<number>}
	 * @const
	 * @private
	 */


	Zlib$1.CRC32.Table_ = [0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f, 0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9, 0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d];
	/**
	 * @type {!(Array.<number>|Uint32Array)} CRC-32 Table.
	 * @const
	 */

	Zlib$1.CRC32.Table = new Uint32Array(Zlib$1.CRC32.Table_);
	/**
	 * @fileoverview Deflate (RFC1951) 実装.
	 * Deflateアルゴリズム本体は Zlib.RawDeflate で実装されている.
	 */

	/**
	 * Zlib Deflate
	 * @constructor
	 * @param {!(Array|Uint8Array)} input 符号化する対象の byte array.
	 * @param {Object=} opt_params option parameters.
	 */

	Zlib$1.Deflate = function (input, opt_params) {
	  /** @type {!(Array|Uint8Array)} */
	  this.input = input;
	  /** @type {!(Array|Uint8Array)} */

	  this.output = new Uint8Array(Zlib$1.Deflate.DefaultBufferSize);
	  /** @type {Zlib.Deflate.CompressionType} */

	  this.compressionType = Zlib$1.Deflate.CompressionType.DYNAMIC;
	  /** @type {Zlib.RawDeflate} */

	  this.rawDeflate;
	  /** @type {Object} */

	  var rawDeflateOption = {};
	  /** @type {string} */

	  var prop; // option parameters

	  if (opt_params || !(opt_params = {})) {
	    if (typeof opt_params['compressionType'] === 'number') {
	      this.compressionType = opt_params['compressionType'];
	    }
	  } // copy options


	  for (prop in opt_params) {
	    rawDeflateOption[prop] = opt_params[prop];
	  } // set raw-deflate output buffer


	  rawDeflateOption['outputBuffer'] = this.output;
	  this.rawDeflate = new Zlib$1.RawDeflate(this.input, rawDeflateOption);
	};
	/**
	 * @const
	 * @type {number} デフォルトバッファサイズ.
	 */


	Zlib$1.Deflate.DefaultBufferSize = 0x8000;
	/**
	 * @enum {number}
	 */

	Zlib$1.Deflate.CompressionType = Zlib$1.RawDeflate.CompressionType;
	/**
	 * 直接圧縮に掛ける.
	 * @param {!(Array|Uint8Array)} input target buffer.
	 * @param {Object=} opt_params option parameters.
	 * @return {!(Array|Uint8Array)} compressed data byte array.
	 */

	Zlib$1.Deflate.compress = function (input, opt_params) {
	  return new Zlib$1.Deflate(input, opt_params).compress();
	};
	/**
	 * Deflate Compression.
	 * @return {!(Array|Uint8Array)} compressed data byte array.
	 */


	Zlib$1.Deflate.prototype.compress = function () {
	  /** @type {Zlib.CompressionMethod} */
	  var cm;
	  /** @type {number} */

	  var cinfo;
	  /** @type {number} */

	  var cmf;
	  /** @type {number} */

	  var flg;
	  /** @type {number} */

	  var fcheck;
	  /** @type {number} */

	  var fdict;
	  /** @type {number} */

	  var flevel;
	  /** @type {number} */

	  var adler;
	  /** @type {!(Array|Uint8Array)} */

	  var output;
	  /** @type {number} */

	  var pos = 0;
	  output = this.output; // Compression Method and Flags

	  cm = Zlib$1.CompressionMethod.DEFLATE;

	  switch (cm) {
	    case Zlib$1.CompressionMethod.DEFLATE:
	      cinfo = Math.LOG2E * Math.log(Zlib$1.RawDeflate.WindowSize) - 8;
	      break;

	    default:
	      throw new Error('invalid compression method');
	  }

	  cmf = cinfo << 4 | cm;
	  output[pos++] = cmf; // Flags

	  fdict = 0;

	  switch (cm) {
	    case Zlib$1.CompressionMethod.DEFLATE:
	      switch (this.compressionType) {
	        case Zlib$1.Deflate.CompressionType.NONE:
	          flevel = 0;
	          break;

	        case Zlib$1.Deflate.CompressionType.FIXED:
	          flevel = 1;
	          break;

	        case Zlib$1.Deflate.CompressionType.DYNAMIC:
	          flevel = 2;
	          break;

	        default:
	          throw new Error('unsupported compression type');
	      }

	      break;

	    default:
	      throw new Error('invalid compression method');
	  }

	  flg = flevel << 6 | fdict << 5;
	  fcheck = 31 - (cmf * 256 + flg) % 31;
	  flg |= fcheck;
	  output[pos++] = flg; // Adler-32 checksum

	  adler = Zlib$1.Adler32(this.input);
	  this.rawDeflate.op = pos;
	  output = this.rawDeflate.compress();
	  pos = output.length;
	  {
	    // subarray 分を元にもどす
	    output = new Uint8Array(output.buffer); // expand buffer

	    if (output.length <= pos + 4) {
	      this.output = new Uint8Array(output.length + 4);
	      this.output.set(output);
	      output = this.output;
	    }

	    output = output.subarray(0, pos + 4);
	  } // adler32

	  output[pos++] = adler >> 24 & 0xff;
	  output[pos++] = adler >> 16 & 0xff;
	  output[pos++] = adler >> 8 & 0xff;
	  output[pos++] = adler & 0xff;
	  return output;
	};

	let _btoa$1;

	if (typeof btoa === 'undefined') {
	  _btoa$1 = require('btoa');
	} else {
	  _btoa$1 = btoa;
	}

	function getExtension(url) {
	  if (undefined === url) {
	    return undefined;
	  }

	  let path = isFilePath(url) || url.google_url ? url.name : url;
	  let filename = path.toLowerCase(); //Strip parameters -- handle local files later

	  let index = filename.indexOf("?");

	  if (index > 0) {
	    filename = filename.substr(0, index);
	  } //Strip aux extensions .gz, .tab, and .txt


	  if (filename.endsWith(".gz")) {
	    filename = filename.substr(0, filename.length - 3);
	  } else if (filename.endsWith(".txt") || filename.endsWith(".tab") || filename.endsWith(".bgz")) {
	    filename = filename.substr(0, filename.length - 4);
	  }

	  index = filename.lastIndexOf(".");
	  return index < 0 ? filename : filename.substr(1 + index);
	}

	function isFilePath(path) {
	  return path instanceof File;
	}

	function download(filename, data) {
	  const element = document.createElement('a');
	  element.setAttribute('href', data);
	  element.setAttribute('download', filename);
	  element.style.display = 'none';
	  document.body.appendChild(element);
	  element.click();
	  document.body.removeChild(element);
	}
	/*
	 * The MIT License (MIT)
	 *
	 * Copyright (c) 2014 Broad Institute
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */


	const knownFileExtensions = new Set(["narrowpeak", "broadpeak", "regionpeak", "peaks", "bedgraph", "wig", "gff3", "gff", "gtf", "fusionjuncspan", "refflat", "seg", "aed", "bed", "vcf", "bb", "bigbed", "bw", "bigwig", "bam", "tdf", "refgene", "genepred", "genepredext", "bedpe", "bp", "snp", "rmsk", "cram", "gwas"]);

	function inferFileFormat(fn) {
	  var idx, ext;
	  fn = fn.toLowerCase(); // Special case -- UCSC refgene files

	  if (fn.endsWith("refgene.txt.gz") || fn.endsWith("refgene.txt.bgz") || fn.endsWith("refgene.txt") || fn.endsWith("refgene.sorted.txt.gz") || fn.endsWith("refgene.sorted.txt.bgz")) {
	    return "refgene";
	  } //Strip parameters -- handle local files later


	  idx = fn.indexOf("?");

	  if (idx > 0) {
	    fn = fn.substr(0, idx);
	  } //Strip aux extensions .gz, .tab, and .txt


	  if (fn.endsWith(".gz")) {
	    fn = fn.substr(0, fn.length - 3);
	  }

	  if (fn.endsWith(".txt") || fn.endsWith(".tab") || fn.endsWith(".bgz")) {
	    fn = fn.substr(0, fn.length - 4);
	  }

	  idx = fn.lastIndexOf(".");
	  ext = idx < 0 ? fn : fn.substr(idx + 1);

	  switch (ext) {
	    case "bw":
	      return "bigwig";

	    case "bb":
	      return "bigbed";

	    default:
	      if (knownFileExtensions.has(ext)) {
	        return ext;
	      } else {
	        return undefined;
	      }

	  }
	}

	if (typeof process === 'object' && typeof window === 'undefined') {
	  global.atob = function (str) {
	    return Buffer.from(str, 'base64').toString('binary');
	  };
	}

	function parseUri(str) {
	  var o = options,
	      m = o.parser["loose"].exec(str),
	      uri = {},
	      i = 14;

	  while (i--) uri[o.key[i]] = m[i] || "";

	  uri[o.q.name] = {};
	  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
	    if ($1) uri[o.q.name][$1] = $2;
	  });
	  return uri;
	}

	const options = {
	  strictMode: false,
	  key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
	  q: {
	    name: "queryKey",
	    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	  },
	  parser: {
	    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
	    loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	  }
	};

	function isGoogleDriveURL(url) {
	  return url.indexOf("drive.google.com") >= 0 || url.indexOf("www.googleapis.com/drive") > 0;
	}

	function driveDownloadURL(link) {
	  // Return a google drive download url for the sharable link
	  //https://drive.google.com/open?id=0B-lleX9c2pZFbDJ4VVRxakJzVGM
	  //https://drive.google.com/file/d/1_FC4kCeO8E3V4dJ1yIW7A0sn1yURKIX-/view?usp=sharing
	  var id = getGoogleDriveFileID(link);
	  return id ? "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media&supportsTeamDrives=true" : link;
	}

	function getGoogleDriveFileID(link) {
	  //https://drive.google.com/file/d/1_FC4kCeO8E3V4dJ1yIW7A0sn1yURKIX-/view?usp=sharing
	  var i1, i2;

	  if (link.includes("/open?id=")) {
	    i1 = link.indexOf("/open?id=") + 9;
	    i2 = link.indexOf("&");

	    if (i1 > 0 && i2 > i1) {
	      return link.substring(i1, i2);
	    } else if (i1 > 0) {
	      return link.substring(i1);
	    }
	  } else if (link.includes("/file/d/")) {
	    i1 = link.indexOf("/file/d/") + 8;
	    i2 = link.lastIndexOf("/");
	    return link.substring(i1, i2);
	  }
	} // Convenience functions for the gapi oAuth library.


	const FIVE_MINUTES = 5 * 60 * 1000;

	async function getAccessToken(scope) {
	  if (typeof gapi === "undefined") {
	    throw Error("Google authentication requires the 'gapi' library");
	  }

	  if (!gapi.auth2) {
	    throw Error("Google 'auth2' has not been initialized");
	  }

	  let currentUser = gapi.auth2.getAuthInstance().currentUser.get();

	  if (currentUser.isSignedIn()) {
	    if (!currentUser.hasGrantedScopes(scope)) {
	      await currentUser.grant({
	        scope
	      });
	    }

	    const {
	      access_token,
	      expires_at
	    } = currentUser.getAuthResponse();

	    if (Date.now() < expires_at - FIVE_MINUTES) {
	      return {
	        access_token,
	        expires_at
	      };
	    } else {
	      const {
	        access_token,
	        expires_at
	      } = currentUser.reloadAuthResponse();
	      return {
	        access_token,
	        expires_at
	      };
	    }
	  } else {
	    currentUser = await signIn(scope);
	    const {
	      access_token,
	      expires_at
	    } = currentUser.getAuthResponse();
	    return {
	      access_token,
	      expires_at
	    };
	  }
	}

	async function signIn(scope) {
	  const options = new gapi.auth2.SigninOptionsBuilder();
	  options.setPrompt('select_account');
	  options.setScope(scope);
	  return gapi.auth2.getAuthInstance().signIn(options);
	}

	function getApiKey() {
	  return gapi.apiKey;
	}
	/*
	 *  Author: Jim Robinson, 2020
	 *
	 * Wrapper functions for the Google picker API
	 *
	 * PREQUISITES
	 *    gapi loaded
	 *    oauth2 loaded and initialized
	 *
	 * This wrapper is stateless -- this is important as multiple copies of igv-utils might be present
	 * in an application.  All state is held in the gapi library itself.
	 */


	async function init$1() {
	  return new Promise(function (resolve, reject) {
	    gapi.load("picker", {
	      callback: resolve,
	      onerror: reject
	    });
	  });
	}

	async function createDropdownButtonPicker(multipleFileSelection, filePickerHandler) {
	  if (typeof gapi === "undefined") {
	    throw Error("Google authentication requires the 'gapi' library");
	  }

	  if (typeof google === "undefined" || !google.picker) {
	    await init$1();
	  }

	  const {
	    access_token
	  } = await getAccessToken('https://www.googleapis.com/auth/drive.file');

	  if (access_token) {
	    const view = new google.picker.DocsView(google.picker.ViewId.DOCS);
	    view.setIncludeFolders(true);
	    const teamView = new google.picker.DocsView(google.picker.ViewId.DOCS);
	    teamView.setEnableTeamDrives(true);
	    teamView.setIncludeFolders(true);
	    let picker;

	    if (multipleFileSelection) {
	      picker = new google.picker.PickerBuilder().enableFeature(google.picker.Feature.MULTISELECT_ENABLED).setOAuthToken(access_token).addView(view).addView(teamView).enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES).setCallback(function (data) {
	        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
	          filePickerHandler(data[google.picker.Response.DOCUMENTS]);
	        }
	      }).build();
	    } else {
	      picker = new google.picker.PickerBuilder().disableFeature(google.picker.Feature.MULTISELECT_ENABLED).setOAuthToken(access_token).addView(view).addView(teamView).enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES).setCallback(function (data) {
	        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
	          filePickerHandler(data[google.picker.Response.DOCUMENTS]);
	        }
	      }).build();
	    }

	    picker.setVisible(true);
	  } else {
	    throw Error("Sign into Google before using picker");
	  }
	}

	async function getDriveFileInfo(googleDriveURL) {
	  const id = getGoogleDriveFileID(googleDriveURL);
	  let endPoint = "https://www.googleapis.com/drive/v3/files/" + id + "?supportsTeamDrives=true";
	  const apiKey = getApiKey();

	  if (apiKey) {
	    endPoint += "&key=" + apiKey;
	  }

	  const response = await fetch(endPoint);
	  let json = await response.json();

	  if (json.error && json.error.code === 404) {
	    const {
	      access_token
	    } = await getAccessToken("https://www.googleapis.com/auth/drive.readonly");

	    if (access_token) {
	      const response = await fetch(endPoint, {
	        headers: {
	          'Authorization': `Bearer ${access_token}`
	        }
	      });
	      json = await response.json();

	      if (json.error) {
	        throw Error(json.error);
	      }
	    } else {
	      throw Error(json.error);
	    }
	  }

	  return json;
	}
	/**
	 * Make the target element movable by clicking and dragging on the handle.  This is not a general purprose function,
	 * it makes several options specific to igv dialogs, the primary one being that the
	 * target is absolutely positioned in pixel coordinates

	 */


	let dragData; // Its assumed we are only dragging one element at a time.

	function makeDraggable(target, handle) {
	  handle.addEventListener('mousedown', dragStart.bind(target));
	}

	function dragStart(event) {
	  event.stopPropagation();
	  event.preventDefault();
	  const pageCoords = offset(this);
	  const dragFunction = drag.bind(this);
	  const dragEndFunction = dragEnd.bind(this);
	  const computedStyle = getComputedStyle(this);
	  const top = parseInt(computedStyle.top.replace("px", ""));
	  const left = parseInt(computedStyle.left.replace("px", ""));
	  dragData = {
	    dragFunction: dragFunction,
	    dragEndFunction: dragEndFunction,
	    screenX: event.screenX,
	    screenY: event.screenY,
	    top: top,
	    left: left
	  };
	  document.addEventListener('mousemove', dragFunction);
	  document.addEventListener('mouseup', dragEndFunction);
	  document.addEventListener('mouseleave', dragEndFunction);
	  document.addEventListener('mouseexit', dragEndFunction);
	}

	function drag(event) {
	  if (!dragData) {
	    return;
	  }

	  event.stopPropagation();
	  event.preventDefault();
	  const dx = event.screenX - dragData.screenX;
	  const dy = event.screenY - dragData.screenY;
	  this.style.left = `${dragData.left + dx}px`;
	  this.style.top = `${dragData.top + dy}px`;
	}

	function dragEnd(event) {
	  if (!dragData) {
	    return;
	  }

	  event.stopPropagation();
	  event.preventDefault();
	  const dragFunction = dragData.dragFunction;
	  const dragEndFunction = dragData.dragEndFunction;
	  document.removeEventListener('mousemove', dragFunction);
	  document.removeEventListener('mouseup', dragEndFunction);
	  document.removeEventListener('mouseleave', dragEndFunction);
	  document.removeEventListener('mouseexit', dragEndFunction);
	  dragData = undefined;
	}

	const httpMessages = {
	  "401": "Access unauthorized",
	  "403": "Access forbidden",
	  "404": "Not found"
	};

	class AlertDialog {
	  constructor(parent) {
	    // container
	    this.container = div({
	      class: "igv-widgets-alert-dialog-container"
	    });
	    parent.appendChild(this.container);
	    this.parent = parent;
	    this.container.setAttribute('tabIndex', '-1'); // header

	    const header = div();
	    this.container.appendChild(header);
	    const error = div();
	    header.appendChild(error);
	    error.textContent = "ERROR"; // body container

	    let bodyContainer = div({
	      id: 'igv-widgets-alert-dialog-body'
	    });
	    this.container.appendChild(bodyContainer); // body copy

	    this.body = div({
	      id: 'igv-widgets-alert-dialog-body-copy'
	    });
	    bodyContainer.appendChild(this.body); // ok container

	    let ok_container = div();
	    this.container.appendChild(ok_container); // ok

	    this.ok = div();
	    ok_container.appendChild(this.ok);
	    this.ok.textContent = 'OK';

	    const okHandler = () => {
	      if (typeof this.callback === 'function') {
	        this.callback("OK");
	        this.callback = undefined;
	      }

	      this.body.innerHTML = '';
	      hide(this.container);
	    };

	    this.ok.addEventListener('click', event => {
	      event.stopPropagation();
	      okHandler();
	    });
	    this.container.addEventListener('keypress', event => {
	      event.stopPropagation();

	      if ('Enter' === event.key) {
	        okHandler();
	      }
	    });
	    makeDraggable(this.container, header);
	    hide(this.container);
	  }

	  present(alert, callback) {
	    let string = alert.message || alert;

	    if (httpMessages.hasOwnProperty(string)) {
	      string = httpMessages[string];
	    }

	    this.body.innerHTML = string;
	    this.callback = callback;
	    show(this.container); // DOMUtils.show(this.container, "flex");

	    const {
	      width,
	      height
	    } = this.parent.getBoundingClientRect();
	    const {
	      width: w,
	      height: h
	    } = this.container.getBoundingClientRect();
	    const x = 0.5 * (width - w); // const y = -(0.5 * (height - h))

	    const y = 0.5 * (height - h);
	    this.container.style.left = `${x}px`;
	    this.container.style.top = `${y}px`;
	    this.container.focus();
	  }

	}

	class AlertSingleton {
	  constructor(root) {
	    if (root) {
	      this.alertDialog = undefined;
	    }
	  }

	  init(root) {
	    this.alertDialog = new AlertDialog(root);
	  }

	  present(alert, callback) {
	    this.alertDialog.present(alert, callback);
	  }

	}

	var AlertSingleton$1 = new AlertSingleton();
	let subscribers = {};

	class EventBus {
	  constructor() {}

	  subscribe(eventType, object) {
	    let subscriberList = subscribers[eventType];

	    if (undefined === subscriberList) {
	      subscriberList = [];
	      subscribers[eventType] = subscriberList;
	    }

	    subscriberList.push(object);
	  }

	  post(event) {
	    const subscriberList = subscribers[event.type];

	    if (subscriberList) {
	      for (let subscriber of subscriberList) {
	        if ("function" === typeof subscriber.receiveEvent) {
	          subscriber.receiveEvent(event);
	        } else if ("function" === typeof subscriber) {
	          subscriber(event);
	        }
	      }
	    }
	  }

	  static createEvent(type, data, propogate) {
	    return {
	      type: type,
	      data: data || {},
	      propogate: propogate !== undefined ? propogate : true
	    };
	  }

	} // Global event bus


	EventBus.globalBus = new EventBus();
	/**
	 * @fileoverview
	 * - Using the 'QRCode for Javascript library'
	 * - Fixed dataset of 'QRCode for Javascript library' for support full-spec.
	 * - this library has no dependencies.
	 *
	 * @author davidshimjs
	 * @see <a href="http://www.d-project.com/" target="_blank">http://www.d-project.com/</a>
	 * @see <a href="http://jeromeetienne.github.com/jquery-qrcode/" target="_blank">http://jeromeetienne.github.com/jquery-qrcode/</a>
	 */
	//---------------------------------------------------------------------
	// QRCode for JavaScript
	//
	// Copyright (c) 2009 Kazuhiko Arase
	//
	// URL: http://www.d-project.com/
	//
	// Licensed under the MIT license:
	//   http://www.opensource.org/licenses/mit-license.php
	//
	// The word "QR Code" is registered trademark of
	// DENSO WAVE INCORPORATED
	//   http://www.denso-wave.com/qrcode/faqpatent-e.html
	//
	//---------------------------------------------------------------------

	function QR8bitByte(data) {
	  this.mode = QRMode.MODE_8BIT_BYTE;
	  this.data = data;
	  this.parsedData = []; // Added to support UTF-8 Characters

	  for (var i = 0, l = this.data.length; i < l; i++) {
	    var byteArray = [];
	    var code = this.data.charCodeAt(i);

	    if (code > 0x10000) {
	      byteArray[0] = 0xF0 | (code & 0x1C0000) >>> 18;
	      byteArray[1] = 0x80 | (code & 0x3F000) >>> 12;
	      byteArray[2] = 0x80 | (code & 0xFC0) >>> 6;
	      byteArray[3] = 0x80 | code & 0x3F;
	    } else if (code > 0x800) {
	      byteArray[0] = 0xE0 | (code & 0xF000) >>> 12;
	      byteArray[1] = 0x80 | (code & 0xFC0) >>> 6;
	      byteArray[2] = 0x80 | code & 0x3F;
	    } else if (code > 0x80) {
	      byteArray[0] = 0xC0 | (code & 0x7C0) >>> 6;
	      byteArray[1] = 0x80 | code & 0x3F;
	    } else {
	      byteArray[0] = code;
	    }

	    this.parsedData.push(byteArray);
	  }

	  this.parsedData = Array.prototype.concat.apply([], this.parsedData);

	  if (this.parsedData.length != this.data.length) {
	    this.parsedData.unshift(191);
	    this.parsedData.unshift(187);
	    this.parsedData.unshift(239);
	  }
	}

	QR8bitByte.prototype = {
	  getLength: function (buffer) {
	    return this.parsedData.length;
	  },
	  write: function (buffer) {
	    for (var i = 0, l = this.parsedData.length; i < l; i++) {
	      buffer.put(this.parsedData[i], 8);
	    }
	  }
	};

	function QRCodeModel(typeNumber, errorCorrectLevel) {
	  this.typeNumber = typeNumber;
	  this.errorCorrectLevel = errorCorrectLevel;
	  this.modules = null;
	  this.moduleCount = 0;
	  this.dataCache = null;
	  this.dataList = [];
	}

	QRCodeModel.prototype = {
	  addData: function (data) {
	    var newData = new QR8bitByte(data);
	    this.dataList.push(newData);
	    this.dataCache = null;
	  },
	  isDark: function (row, col) {
	    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
	      throw new Error(row + "," + col);
	    }

	    return this.modules[row][col];
	  },
	  getModuleCount: function () {
	    return this.moduleCount;
	  },
	  make: function () {
	    this.makeImpl(false, this.getBestMaskPattern());
	  },
	  makeImpl: function (test, maskPattern) {
	    this.moduleCount = this.typeNumber * 4 + 17;
	    this.modules = new Array(this.moduleCount);

	    for (var row = 0; row < this.moduleCount; row++) {
	      this.modules[row] = new Array(this.moduleCount);

	      for (var col = 0; col < this.moduleCount; col++) {
	        this.modules[row][col] = null;
	      }
	    }

	    this.setupPositionProbePattern(0, 0);
	    this.setupPositionProbePattern(this.moduleCount - 7, 0);
	    this.setupPositionProbePattern(0, this.moduleCount - 7);
	    this.setupPositionAdjustPattern();
	    this.setupTimingPattern();
	    this.setupTypeInfo(test, maskPattern);

	    if (this.typeNumber >= 7) {
	      this.setupTypeNumber(test);
	    }

	    if (this.dataCache == null) {
	      this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
	    }

	    this.mapData(this.dataCache, maskPattern);
	  },
	  setupPositionProbePattern: function (row, col) {
	    for (var r = -1; r <= 7; r++) {
	      if (row + r <= -1 || this.moduleCount <= row + r) continue;

	      for (var c = -1; c <= 7; c++) {
	        if (col + c <= -1 || this.moduleCount <= col + c) continue;

	        if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
	          this.modules[row + r][col + c] = true;
	        } else {
	          this.modules[row + r][col + c] = false;
	        }
	      }
	    }
	  },
	  getBestMaskPattern: function () {
	    var minLostPoint = 0;
	    var pattern = 0;

	    for (var i = 0; i < 8; i++) {
	      this.makeImpl(true, i);
	      var lostPoint = QRUtil.getLostPoint(this);

	      if (i == 0 || minLostPoint > lostPoint) {
	        minLostPoint = lostPoint;
	        pattern = i;
	      }
	    }

	    return pattern;
	  },
	  createMovieClip: function (target_mc, instance_name, depth) {
	    var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
	    var cs = 1;
	    this.make();

	    for (var row = 0; row < this.modules.length; row++) {
	      var y = row * cs;

	      for (var col = 0; col < this.modules[row].length; col++) {
	        var x = col * cs;
	        var dark = this.modules[row][col];

	        if (dark) {
	          qr_mc.beginFill(0, 100);
	          qr_mc.moveTo(x, y);
	          qr_mc.lineTo(x + cs, y);
	          qr_mc.lineTo(x + cs, y + cs);
	          qr_mc.lineTo(x, y + cs);
	          qr_mc.endFill();
	        }
	      }
	    }

	    return qr_mc;
	  },
	  setupTimingPattern: function () {
	    for (var r = 8; r < this.moduleCount - 8; r++) {
	      if (this.modules[r][6] != null) {
	        continue;
	      }

	      this.modules[r][6] = r % 2 == 0;
	    }

	    for (var c = 8; c < this.moduleCount - 8; c++) {
	      if (this.modules[6][c] != null) {
	        continue;
	      }

	      this.modules[6][c] = c % 2 == 0;
	    }
	  },
	  setupPositionAdjustPattern: function () {
	    var pos = QRUtil.getPatternPosition(this.typeNumber);

	    for (var i = 0; i < pos.length; i++) {
	      for (var j = 0; j < pos.length; j++) {
	        var row = pos[i];
	        var col = pos[j];

	        if (this.modules[row][col] != null) {
	          continue;
	        }

	        for (var r = -2; r <= 2; r++) {
	          for (var c = -2; c <= 2; c++) {
	            if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
	              this.modules[row + r][col + c] = true;
	            } else {
	              this.modules[row + r][col + c] = false;
	            }
	          }
	        }
	      }
	    }
	  },
	  setupTypeNumber: function (test) {
	    var bits = QRUtil.getBCHTypeNumber(this.typeNumber);

	    for (var i = 0; i < 18; i++) {
	      var mod = !test && (bits >> i & 1) == 1;
	      this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
	    }

	    for (var i = 0; i < 18; i++) {
	      var mod = !test && (bits >> i & 1) == 1;
	      this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
	    }
	  },
	  setupTypeInfo: function (test, maskPattern) {
	    var data = this.errorCorrectLevel << 3 | maskPattern;
	    var bits = QRUtil.getBCHTypeInfo(data);

	    for (var i = 0; i < 15; i++) {
	      var mod = !test && (bits >> i & 1) == 1;

	      if (i < 6) {
	        this.modules[i][8] = mod;
	      } else if (i < 8) {
	        this.modules[i + 1][8] = mod;
	      } else {
	        this.modules[this.moduleCount - 15 + i][8] = mod;
	      }
	    }

	    for (var i = 0; i < 15; i++) {
	      var mod = !test && (bits >> i & 1) == 1;

	      if (i < 8) {
	        this.modules[8][this.moduleCount - i - 1] = mod;
	      } else if (i < 9) {
	        this.modules[8][15 - i - 1 + 1] = mod;
	      } else {
	        this.modules[8][15 - i - 1] = mod;
	      }
	    }

	    this.modules[this.moduleCount - 8][8] = !test;
	  },
	  mapData: function (data, maskPattern) {
	    var inc = -1;
	    var row = this.moduleCount - 1;
	    var bitIndex = 7;
	    var byteIndex = 0;

	    for (var col = this.moduleCount - 1; col > 0; col -= 2) {
	      if (col == 6) col--;

	      while (true) {
	        for (var c = 0; c < 2; c++) {
	          if (this.modules[row][col - c] == null) {
	            var dark = false;

	            if (byteIndex < data.length) {
	              dark = (data[byteIndex] >>> bitIndex & 1) == 1;
	            }

	            var mask = QRUtil.getMask(maskPattern, row, col - c);

	            if (mask) {
	              dark = !dark;
	            }

	            this.modules[row][col - c] = dark;
	            bitIndex--;

	            if (bitIndex == -1) {
	              byteIndex++;
	              bitIndex = 7;
	            }
	          }
	        }

	        row += inc;

	        if (row < 0 || this.moduleCount <= row) {
	          row -= inc;
	          inc = -inc;
	          break;
	        }
	      }
	    }
	  }
	};
	QRCodeModel.PAD0 = 0xEC;
	QRCodeModel.PAD1 = 0x11;

	QRCodeModel.createData = function (typeNumber, errorCorrectLevel, dataList) {
	  var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
	  var buffer = new QRBitBuffer();

	  for (var i = 0; i < dataList.length; i++) {
	    var data = dataList[i];
	    buffer.put(data.mode, 4);
	    buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
	    data.write(buffer);
	  }

	  var totalDataCount = 0;

	  for (var i = 0; i < rsBlocks.length; i++) {
	    totalDataCount += rsBlocks[i].dataCount;
	  }

	  if (buffer.getLengthInBits() > totalDataCount * 8) {
	    throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
	  }

	  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
	    buffer.put(0, 4);
	  }

	  while (buffer.getLengthInBits() % 8 != 0) {
	    buffer.putBit(false);
	  }

	  while (true) {
	    if (buffer.getLengthInBits() >= totalDataCount * 8) {
	      break;
	    }

	    buffer.put(QRCodeModel.PAD0, 8);

	    if (buffer.getLengthInBits() >= totalDataCount * 8) {
	      break;
	    }

	    buffer.put(QRCodeModel.PAD1, 8);
	  }

	  return QRCodeModel.createBytes(buffer, rsBlocks);
	};

	QRCodeModel.createBytes = function (buffer, rsBlocks) {
	  var offset = 0;
	  var maxDcCount = 0;
	  var maxEcCount = 0;
	  var dcdata = new Array(rsBlocks.length);
	  var ecdata = new Array(rsBlocks.length);

	  for (var r = 0; r < rsBlocks.length; r++) {
	    var dcCount = rsBlocks[r].dataCount;
	    var ecCount = rsBlocks[r].totalCount - dcCount;
	    maxDcCount = Math.max(maxDcCount, dcCount);
	    maxEcCount = Math.max(maxEcCount, ecCount);
	    dcdata[r] = new Array(dcCount);

	    for (var i = 0; i < dcdata[r].length; i++) {
	      dcdata[r][i] = 0xff & buffer.buffer[i + offset];
	    }

	    offset += dcCount;
	    var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
	    var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
	    var modPoly = rawPoly.mod(rsPoly);
	    ecdata[r] = new Array(rsPoly.getLength() - 1);

	    for (var i = 0; i < ecdata[r].length; i++) {
	      var modIndex = i + modPoly.getLength() - ecdata[r].length;
	      ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
	    }
	  }

	  var totalCodeCount = 0;

	  for (var i = 0; i < rsBlocks.length; i++) {
	    totalCodeCount += rsBlocks[i].totalCount;
	  }

	  var data = new Array(totalCodeCount);
	  var index = 0;

	  for (var i = 0; i < maxDcCount; i++) {
	    for (var r = 0; r < rsBlocks.length; r++) {
	      if (i < dcdata[r].length) {
	        data[index++] = dcdata[r][i];
	      }
	    }
	  }

	  for (var i = 0; i < maxEcCount; i++) {
	    for (var r = 0; r < rsBlocks.length; r++) {
	      if (i < ecdata[r].length) {
	        data[index++] = ecdata[r][i];
	      }
	    }
	  }

	  return data;
	};

	var QRMode = {
	  MODE_NUMBER: 1 << 0,
	  MODE_ALPHA_NUM: 1 << 1,
	  MODE_8BIT_BYTE: 1 << 2,
	  MODE_KANJI: 1 << 3
	};
	var QRErrorCorrectLevel = {
	  L: 1,
	  M: 0,
	  Q: 3,
	  H: 2
	};
	var QRMaskPattern = {
	  PATTERN000: 0,
	  PATTERN001: 1,
	  PATTERN010: 2,
	  PATTERN011: 3,
	  PATTERN100: 4,
	  PATTERN101: 5,
	  PATTERN110: 6,
	  PATTERN111: 7
	};
	var QRUtil = {
	  PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
	  G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0,
	  G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0,
	  G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1,
	  getBCHTypeInfo: function (data) {
	    var d = data << 10;

	    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
	      d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
	    }

	    return (data << 10 | d) ^ QRUtil.G15_MASK;
	  },
	  getBCHTypeNumber: function (data) {
	    var d = data << 12;

	    while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
	      d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
	    }

	    return data << 12 | d;
	  },
	  getBCHDigit: function (data) {
	    var digit = 0;

	    while (data != 0) {
	      digit++;
	      data >>>= 1;
	    }

	    return digit;
	  },
	  getPatternPosition: function (typeNumber) {
	    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
	  },
	  getMask: function (maskPattern, i, j) {
	    switch (maskPattern) {
	      case QRMaskPattern.PATTERN000:
	        return (i + j) % 2 == 0;

	      case QRMaskPattern.PATTERN001:
	        return i % 2 == 0;

	      case QRMaskPattern.PATTERN010:
	        return j % 3 == 0;

	      case QRMaskPattern.PATTERN011:
	        return (i + j) % 3 == 0;

	      case QRMaskPattern.PATTERN100:
	        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;

	      case QRMaskPattern.PATTERN101:
	        return i * j % 2 + i * j % 3 == 0;

	      case QRMaskPattern.PATTERN110:
	        return (i * j % 2 + i * j % 3) % 2 == 0;

	      case QRMaskPattern.PATTERN111:
	        return (i * j % 3 + (i + j) % 2) % 2 == 0;

	      default:
	        throw new Error("bad maskPattern:" + maskPattern);
	    }
	  },
	  getErrorCorrectPolynomial: function (errorCorrectLength) {
	    var a = new QRPolynomial([1], 0);

	    for (var i = 0; i < errorCorrectLength; i++) {
	      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
	    }

	    return a;
	  },
	  getLengthInBits: function (mode, type) {
	    if (1 <= type && type < 10) {
	      switch (mode) {
	        case QRMode.MODE_NUMBER:
	          return 10;

	        case QRMode.MODE_ALPHA_NUM:
	          return 9;

	        case QRMode.MODE_8BIT_BYTE:
	          return 8;

	        case QRMode.MODE_KANJI:
	          return 8;

	        default:
	          throw new Error("mode:" + mode);
	      }
	    } else if (type < 27) {
	      switch (mode) {
	        case QRMode.MODE_NUMBER:
	          return 12;

	        case QRMode.MODE_ALPHA_NUM:
	          return 11;

	        case QRMode.MODE_8BIT_BYTE:
	          return 16;

	        case QRMode.MODE_KANJI:
	          return 10;

	        default:
	          throw new Error("mode:" + mode);
	      }
	    } else if (type < 41) {
	      switch (mode) {
	        case QRMode.MODE_NUMBER:
	          return 14;

	        case QRMode.MODE_ALPHA_NUM:
	          return 13;

	        case QRMode.MODE_8BIT_BYTE:
	          return 16;

	        case QRMode.MODE_KANJI:
	          return 12;

	        default:
	          throw new Error("mode:" + mode);
	      }
	    } else {
	      throw new Error("type:" + type);
	    }
	  },
	  getLostPoint: function (qrCode) {
	    var moduleCount = qrCode.getModuleCount();
	    var lostPoint = 0;

	    for (var row = 0; row < moduleCount; row++) {
	      for (var col = 0; col < moduleCount; col++) {
	        var sameCount = 0;
	        var dark = qrCode.isDark(row, col);

	        for (var r = -1; r <= 1; r++) {
	          if (row + r < 0 || moduleCount <= row + r) {
	            continue;
	          }

	          for (var c = -1; c <= 1; c++) {
	            if (col + c < 0 || moduleCount <= col + c) {
	              continue;
	            }

	            if (r == 0 && c == 0) {
	              continue;
	            }

	            if (dark == qrCode.isDark(row + r, col + c)) {
	              sameCount++;
	            }
	          }
	        }

	        if (sameCount > 5) {
	          lostPoint += 3 + sameCount - 5;
	        }
	      }
	    }

	    for (var row = 0; row < moduleCount - 1; row++) {
	      for (var col = 0; col < moduleCount - 1; col++) {
	        var count = 0;
	        if (qrCode.isDark(row, col)) count++;
	        if (qrCode.isDark(row + 1, col)) count++;
	        if (qrCode.isDark(row, col + 1)) count++;
	        if (qrCode.isDark(row + 1, col + 1)) count++;

	        if (count == 0 || count == 4) {
	          lostPoint += 3;
	        }
	      }
	    }

	    for (var row = 0; row < moduleCount; row++) {
	      for (var col = 0; col < moduleCount - 6; col++) {
	        if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) {
	          lostPoint += 40;
	        }
	      }
	    }

	    for (var col = 0; col < moduleCount; col++) {
	      for (var row = 0; row < moduleCount - 6; row++) {
	        if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) {
	          lostPoint += 40;
	        }
	      }
	    }

	    var darkCount = 0;

	    for (var col = 0; col < moduleCount; col++) {
	      for (var row = 0; row < moduleCount; row++) {
	        if (qrCode.isDark(row, col)) {
	          darkCount++;
	        }
	      }
	    }

	    var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
	    lostPoint += ratio * 10;
	    return lostPoint;
	  }
	};
	var QRMath = {
	  glog: function (n) {
	    if (n < 1) {
	      throw new Error("glog(" + n + ")");
	    }

	    return QRMath.LOG_TABLE[n];
	  },
	  gexp: function (n) {
	    while (n < 0) {
	      n += 255;
	    }

	    while (n >= 256) {
	      n -= 255;
	    }

	    return QRMath.EXP_TABLE[n];
	  },
	  EXP_TABLE: new Array(256),
	  LOG_TABLE: new Array(256)
	};

	for (var i = 0; i < 8; i++) {
	  QRMath.EXP_TABLE[i] = 1 << i;
	}

	for (var i = 8; i < 256; i++) {
	  QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
	}

	for (var i = 0; i < 255; i++) {
	  QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
	}

	function QRPolynomial(num, shift) {
	  if (num.length == undefined) {
	    throw new Error(num.length + "/" + shift);
	  }

	  var offset = 0;

	  while (offset < num.length && num[offset] == 0) {
	    offset++;
	  }

	  this.num = new Array(num.length - offset + shift);

	  for (var i = 0; i < num.length - offset; i++) {
	    this.num[i] = num[i + offset];
	  }
	}

	QRPolynomial.prototype = {
	  get: function (index) {
	    return this.num[index];
	  },
	  getLength: function () {
	    return this.num.length;
	  },
	  multiply: function (e) {
	    var num = new Array(this.getLength() + e.getLength() - 1);

	    for (var i = 0; i < this.getLength(); i++) {
	      for (var j = 0; j < e.getLength(); j++) {
	        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
	      }
	    }

	    return new QRPolynomial(num, 0);
	  },
	  mod: function (e) {
	    if (this.getLength() - e.getLength() < 0) {
	      return this;
	    }

	    var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
	    var num = new Array(this.getLength());

	    for (var i = 0; i < this.getLength(); i++) {
	      num[i] = this.get(i);
	    }

	    for (var i = 0; i < e.getLength(); i++) {
	      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
	    }

	    return new QRPolynomial(num, 0).mod(e);
	  }
	};

	function QRRSBlock(totalCount, dataCount) {
	  this.totalCount = totalCount;
	  this.dataCount = dataCount;
	}

	QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];

	QRRSBlock.getRSBlocks = function (typeNumber, errorCorrectLevel) {
	  var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);

	  if (rsBlock == undefined) {
	    throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
	  }

	  var length = rsBlock.length / 3;
	  var list = [];

	  for (var i = 0; i < length; i++) {
	    var count = rsBlock[i * 3 + 0];
	    var totalCount = rsBlock[i * 3 + 1];
	    var dataCount = rsBlock[i * 3 + 2];

	    for (var j = 0; j < count; j++) {
	      list.push(new QRRSBlock(totalCount, dataCount));
	    }
	  }

	  return list;
	};

	QRRSBlock.getRsBlockTable = function (typeNumber, errorCorrectLevel) {
	  switch (errorCorrectLevel) {
	    case QRErrorCorrectLevel.L:
	      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];

	    case QRErrorCorrectLevel.M:
	      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];

	    case QRErrorCorrectLevel.Q:
	      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];

	    case QRErrorCorrectLevel.H:
	      return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];

	    default:
	      return undefined;
	  }
	};

	function QRBitBuffer() {
	  this.buffer = [];
	  this.length = 0;
	}

	QRBitBuffer.prototype = {
	  get: function (index) {
	    var bufIndex = Math.floor(index / 8);
	    return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
	  },
	  put: function (num, length) {
	    for (var i = 0; i < length; i++) {
	      this.putBit((num >>> length - i - 1 & 1) == 1);
	    }
	  },
	  getLengthInBits: function () {
	    return this.length;
	  },
	  putBit: function (bit) {
	    var bufIndex = Math.floor(this.length / 8);

	    if (this.buffer.length <= bufIndex) {
	      this.buffer.push(0);
	    }

	    if (bit) {
	      this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
	    }

	    this.length++;
	  }
	};
	var QRCodeLimitLength = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]];
	var useSVG = document.documentElement.tagName.toLowerCase() === "svg";
	let Drawing;

	if (useSVG) {
	  Drawing = function (el, htOption) {
	    this._el = el;
	    this._htOption = htOption;
	  };

	  Drawing.prototype.draw = function (oQRCode) {
	    var _htOption = this._htOption;
	    var _el = this._el;
	    var nCount = oQRCode.getModuleCount();
	    var nWidth = Math.floor(_htOption.width / nCount);
	    var nHeight = Math.floor(_htOption.height / nCount);
	    this.clear();

	    function makeSVG(tag, attrs) {
	      var el = document.createElementNS('http://www.w3.org/2000/svg', tag);

	      for (var k in attrs) if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);

	      return el;
	    }

	    var svg = makeSVG("svg", {
	      'viewBox': '0 0 ' + String(nCount) + " " + String(nCount),
	      'width': '100%',
	      'height': '100%',
	      'fill': _htOption.colorLight
	    });
	    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

	    _el.appendChild(svg);

	    svg.appendChild(makeSVG("rect", {
	      "fill": _htOption.colorLight,
	      "width": "100%",
	      "height": "100%"
	    }));
	    svg.appendChild(makeSVG("rect", {
	      "fill": _htOption.colorDark,
	      "width": "1",
	      "height": "1",
	      "id": "template"
	    }));

	    for (var row = 0; row < nCount; row++) {
	      for (var col = 0; col < nCount; col++) {
	        if (oQRCode.isDark(row, col)) {
	          var child = makeSVG("use", {
	            "x": String(col),
	            "y": String(row)
	          });
	          child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template");
	          svg.appendChild(child);
	        }
	      }
	    }
	  };

	  Drawing.prototype.clear = function () {
	    while (this._el.hasChildNodes()) this._el.removeChild(this._el.lastChild);
	  };
	} else {
	  /**
	   * Drawing QRCode by using canvas
	   *
	   * @constructor
	   * @param {HTMLElement} el
	   * @param {Object} htOption QRCode Options
	   */
	  Drawing = function (el, htOption) {
	    this._bIsPainted = false;
	    this._htOption = htOption;
	    this._elCanvas = document.createElement("canvas");
	    this._elCanvas.width = htOption.width;
	    this._elCanvas.height = htOption.height;
	    el.appendChild(this._elCanvas);
	    this._el = el;
	    this._oContext = this._elCanvas.getContext("2d");
	    this._bIsPainted = false;
	    this._elImage = document.createElement("img");
	    this._elImage.alt = "Scan me!";
	    this._elImage.style.display = "none";

	    this._el.appendChild(this._elImage);

	    this._bSupportDataURI = null;
	  };
	  /**
	   * Draw the QRCode
	   *
	   * @param {QRCode} oQRCode
	   */


	  Drawing.prototype.draw = function (oQRCode) {
	    var _elImage = this._elImage;
	    var _oContext = this._oContext;
	    var _htOption = this._htOption;
	    var nCount = oQRCode.getModuleCount();
	    var nWidth = _htOption.width / nCount;
	    var nHeight = _htOption.height / nCount;
	    var nRoundedWidth = Math.round(nWidth);
	    var nRoundedHeight = Math.round(nHeight);
	    _elImage.style.display = "none";
	    this.clear();

	    for (var row = 0; row < nCount; row++) {
	      for (var col = 0; col < nCount; col++) {
	        var bIsDark = oQRCode.isDark(row, col);
	        var nLeft = col * nWidth;
	        var nTop = row * nHeight;
	        _oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
	        _oContext.lineWidth = 1;
	        _oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;

	        _oContext.fillRect(nLeft, nTop, nWidth, nHeight); // 안티 앨리어싱 방지 처리


	        _oContext.strokeRect(Math.floor(nLeft) + 0.5, Math.floor(nTop) + 0.5, nRoundedWidth, nRoundedHeight);

	        _oContext.strokeRect(Math.ceil(nLeft) - 0.5, Math.ceil(nTop) - 0.5, nRoundedWidth, nRoundedHeight);
	      }
	    }

	    this._bIsPainted = true;
	  };
	  /**
	   * Make the image from Canvas if the browser supports Data URI.
	   */


	  Drawing.prototype.makeImage = function () {
	    if (this._bIsPainted) {
	      this._elImage.src = this._elCanvas.toDataURL("image/png");
	      this._elImage.style.display = "block";
	      this._elCanvas.style.display = "none";
	    }
	  };
	  /**
	   * Return whether the QRCode is painted or not
	   *
	   * @return {Boolean}
	   */


	  Drawing.prototype.isPainted = function () {
	    return this._bIsPainted;
	  };
	  /**
	   * Clear the QRCode
	   */


	  Drawing.prototype.clear = function () {
	    this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);

	    this._bIsPainted = false;
	  };
	  /**
	   * @private
	   * @param {Number} nNumber
	   */


	  Drawing.prototype.round = function (nNumber) {
	    if (!nNumber) {
	      return nNumber;
	    }

	    return Math.floor(nNumber * 1000) / 1000;
	  };
	}
	/**
	 * Get the type by string length
	 *
	 * @private
	 * @param {String} sText
	 * @param {Number} nCorrectLevel
	 * @return {Number} type
	 */


	function _getTypeNumber(sText, nCorrectLevel) {
	  var nType = 1;

	  var length = _getUTF8Length(sText);

	  for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
	    var nLimit = 0;

	    switch (nCorrectLevel) {
	      case QRErrorCorrectLevel.L:
	        nLimit = QRCodeLimitLength[i][0];
	        break;

	      case QRErrorCorrectLevel.M:
	        nLimit = QRCodeLimitLength[i][1];
	        break;

	      case QRErrorCorrectLevel.Q:
	        nLimit = QRCodeLimitLength[i][2];
	        break;

	      case QRErrorCorrectLevel.H:
	        nLimit = QRCodeLimitLength[i][3];
	        break;
	    }

	    if (length <= nLimit) {
	      break;
	    } else {
	      nType++;
	    }
	  }

	  if (nType > QRCodeLimitLength.length) {
	    throw new Error("Too long data");
	  }

	  return nType;
	}

	function _getUTF8Length(sText) {
	  var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
	  return replacedText.length + (replacedText.length != sText ? 3 : 0);
	}
	/**
	 * @class QRCode
	 * @constructor
	 * @example
	 * new QRCode(document.getElementById("test"), "http://jindo.dev.naver.com/collie");
	 *
	 * @example
	 * var oQRCode = new QRCode("test", {
	 *    text : "http://naver.com",
	 *    width : 128,
	 *    height : 128
	 * });
	 *
	 * oQRCode.clear(); // Clear the QRCode.
	 * oQRCode.makeCode("http://map.naver.com"); // Re-create the QRCode.
	 *
	 * @param {HTMLElement|String} el target element or 'id' attribute of element.
	 * @param {Object|String} vOption
	 * @param {String} vOption.text QRCode link data
	 * @param {Number} [vOption.width=256]
	 * @param {Number} [vOption.height=256]
	 * @param {String} [vOption.colorDark="#000000"]
	 * @param {String} [vOption.colorLight="#ffffff"]
	 * @param {QRCode.CorrectLevel} [vOption.correctLevel=QRCode.CorrectLevel.H] [L|M|Q|H]
	 */


	const QRCode = function (el, vOption) {
	  this._htOption = {
	    width: 256,
	    height: 256,
	    typeNumber: 4,
	    colorDark: "#000000",
	    colorLight: "#ffffff",
	    correctLevel: QRErrorCorrectLevel.H
	  };

	  if (typeof vOption === 'string') {
	    vOption = {
	      text: vOption
	    };
	  } // Overwrites options


	  if (vOption) {
	    for (var i in vOption) {
	      this._htOption[i] = vOption[i];
	    }
	  }

	  if (typeof el == "string") {
	    el = document.getElementById(el);
	  }

	  if (this._htOption.useSVG) {
	    Drawing = svgDrawer;
	  }

	  this._el = el;
	  this._oQRCode = null;
	  this._oDrawing = new Drawing(this._el, this._htOption);

	  if (this._htOption.text) {
	    this.makeCode(this._htOption.text);
	  }
	};
	/**
	 * Make the QRCode
	 *
	 * @param {String} sText link data
	 */


	QRCode.prototype.makeCode = function (sText) {
	  this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);

	  this._oQRCode.addData(sText);

	  this._oQRCode.make();

	  this._el.title = sText;

	  this._oDrawing.draw(this._oQRCode);

	  this.makeImage();
	};
	/**
	 * Make the Image from Canvas element
	 * - It occurs automatically
	 * - Android below 3 doesn't support Data-URI spec.
	 *
	 * @private
	 */


	QRCode.prototype.makeImage = function () {
	  if (typeof this._oDrawing.makeImage == "function") {
	    this._oDrawing.makeImage();
	  }
	};
	/**
	 * Clear the QRCode
	 */


	QRCode.prototype.clear = function () {
	  this._oDrawing.clear();
	};
	/**
	 * @name QRCode.CorrectLevel
	 */


	QRCode.CorrectLevel = QRErrorCorrectLevel;
	/*
	 * The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 * Author: Jim Robinson
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */

	class FileLoadManager {
	  constructor() {
	    this.dictionary = {};
	  }

	  inputHandler(path, isIndexFile) {
	    this.ingestPath(path, isIndexFile);
	  }

	  ingestPath(path, isIndexFile) {
	    let key = true === isIndexFile ? 'index' : 'data';
	    this.dictionary[key] = path.trim();
	  }

	  didDragDrop(dataTransfer) {
	    var files;
	    files = dataTransfer.files;
	    return files && files.length > 0;
	  }

	  dragDropHandler(dataTransfer, isIndexFile) {
	    var url, files;
	    url = dataTransfer.getData('text/uri-list');
	    files = dataTransfer.files;

	    if (files && files.length > 0) {
	      this.ingestPath(files[0], isIndexFile);
	    } else if (url && '' !== url) {
	      this.ingestPath(url, isIndexFile);
	    }
	  }

	  indexName() {
	    return itemName(this.dictionary.index);
	  }

	  dataName() {
	    return itemName(this.dictionary.data);
	  }

	  reset() {
	    this.dictionary = {};
	  }

	}

	function itemName(item) {
	  return isFilePath(item) ? item.name : item;
	}
	/*
	 * The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 * Author: Jim Robinson
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */


	class FileLoadWidget {
	  constructor({
	    widgetParent,
	    dataTitle,
	    indexTitle,
	    mode,
	    fileLoadManager,
	    dataOnly,
	    doURL
	  }) {
	    dataTitle = dataTitle || 'Data';
	    indexTitle = indexTitle || 'Index';
	    this.fileLoadManager = fileLoadManager;
	    dataOnly = dataOnly || false; // TODO: Remove?

	    doURL = doURL || false; // file load widget

	    this.container = div({
	      class: 'igv-file-load-widget-container'
	    });
	    widgetParent.appendChild(this.container);
	    let config;

	    if ('localFile' === mode) {
	      // local data/index
	      config = {
	        parent: this.container,
	        doURL: false,
	        dataTitle: dataTitle + ' file',
	        indexTitle: indexTitle + ' file',
	        dataOnly
	      };
	    } else {
	      // url data/index
	      config = {
	        parent: this.container,
	        doURL: true,
	        dataTitle: dataTitle + ' URL',
	        indexTitle: indexTitle + ' URL',
	        dataOnly
	      };
	    }

	    this.createInputContainer(config); // error message container

	    this.error_message = div({
	      class: 'igv-flw-error-message-container'
	    });
	    this.container.appendChild(this.error_message); // error message

	    this.error_message.appendChild(div({
	      class: 'igv-flw-error-message'
	    })); // error dismiss button

	    attachDialogCloseHandlerWithParent(this.error_message, () => {
	      this.dismissErrorMessage();
	    });
	    this.dismissErrorMessage();
	  }

	  retrievePaths() {
	    this.fileLoadManager.ingestPath(this.inputData.value, false);

	    if (this.inputIndex) {
	      this.fileLoadManager.ingestPath(this.inputIndex.value, true);
	    }

	    let paths = [];

	    if (this.fileLoadManager.dictionary) {
	      if (this.fileLoadManager.dictionary.data) {
	        paths.push(this.fileLoadManager.dictionary.data);
	      }

	      if (this.fileLoadManager.dictionary.index) {
	        paths.push(this.fileLoadManager.dictionary.index);
	      }
	    } // clear input elements


	    this.container.querySelectorAll('.igv-flw-input-row').forEach(div => {
	      div.querySelector('input').value = '';
	    });
	    return paths;
	  }

	  presentErrorMessage(message) {
	    this.error_message.querySelector('.igv-flw-error-message').textContent = message;
	    show(this.error_message);
	  }

	  dismissErrorMessage() {
	    hide(this.error_message);
	    this.error_message.querySelector('.igv-flw-error-message').textContent = '';
	  }

	  present() {
	    show(this.container);
	  }

	  dismiss() {
	    this.dismissErrorMessage(); // const e = this.container.querySelector('.igv-flw-local-file-name-container');
	    // if (e) {
	    //     DOMUtils.hide(e);
	    // }
	    // clear input elements

	    this.container.querySelectorAll('.igv-flw-input-row').forEach(div => {
	      div.querySelector('input').value = '';
	    });
	    this.fileLoadManager.reset();
	  }

	  createInputContainer({
	    parent,
	    doURL,
	    dataTitle,
	    indexTitle,
	    dataOnly
	  }) {
	    // container
	    const container = div({
	      class: 'igv-flw-input-container'
	    });
	    parent.appendChild(container); // data

	    const input_data_row = div({
	      class: 'igv-flw-input-row'
	    });
	    container.appendChild(input_data_row);
	    let label; // label

	    label = div({
	      class: 'igv-flw-input-label'
	    });
	    input_data_row.appendChild(label);
	    label.textContent = dataTitle;

	    if (true === doURL) {
	      this.createURLContainer(input_data_row, 'igv-flw-data-url', false);
	    } else {
	      this.createLocalFileContainer(input_data_row, 'igv-flw-local-data-file', false);
	    }

	    if (true === dataOnly) {
	      return;
	    } // index


	    const input_index_row = div({
	      class: 'igv-flw-input-row'
	    });
	    container.appendChild(input_index_row); // label

	    label = div({
	      class: 'igv-flw-input-label'
	    });
	    input_index_row.appendChild(label);
	    label.textContent = indexTitle;

	    if (true === doURL) {
	      this.createURLContainer(input_index_row, 'igv-flw-index-url', true);
	    } else {
	      this.createLocalFileContainer(input_index_row, 'igv-flw-local-index-file', true);
	    }
	  }

	  createURLContainer(parent, id, isIndexFile) {
	    const input = create('input');
	    input.setAttribute('type', 'text'); // input.setAttribute('placeholder', (true === isIndexFile ? 'Enter index URL' : 'Enter data URL'));

	    parent.appendChild(input);

	    if (isIndexFile) {
	      this.inputIndex = input;
	    } else {
	      this.inputData = input;
	    }
	  }

	  createLocalFileContainer(parent, id, isIndexFile) {
	    const file_chooser_container = div({
	      class: 'igv-flw-file-chooser-container'
	    });
	    parent.appendChild(file_chooser_container);
	    const str = `${id}${guid()}`;
	    const label = create('label');
	    label.setAttribute('for', str);
	    file_chooser_container.appendChild(label);
	    label.textContent = 'Choose file';
	    const input = create('input', {
	      class: 'igv-flw-file-chooser-input'
	    });
	    input.setAttribute('id', str);
	    input.setAttribute('name', str);
	    input.setAttribute('type', 'file');
	    file_chooser_container.appendChild(input);
	    const file_name = div({
	      class: 'igv-flw-local-file-name-container'
	    });
	    parent.appendChild(file_name);
	    hide(file_name);
	    input.addEventListener('change', e => {
	      this.dismissErrorMessage();
	      const file = e.target.files[0];
	      this.fileLoadManager.inputHandler(file, isIndexFile);
	      const {
	        name
	      } = file;
	      file_name.textContent = name;
	      file_name.setAttribute('title', name);
	      show(file_name);
	    });
	  }

	}
	/*
	 *  The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
	 * associated documentation files (the "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
	 * following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all copies or substantial
	 * portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
	 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *
	 */


	function getIndexObjectWithDataName(name) {
	  let extension, dataSuffix, lookup, indexObject, aa;
	  extension = getExtension(name);

	  if (false === isKnownFileExtension(extension)) {
	    return undefined;
	  }

	  dataSuffix = name.split('.').pop();
	  lookup = indexLookup(dataSuffix);
	  indexObject = {}; // aa

	  aa = name + '.' + lookup.index;
	  indexObject[aa] = {};
	  indexObject[aa].data = name;
	  indexObject[aa].isOptional = lookup.isOptional;

	  if ('bam' === extension || 'cram' === extension) {
	    let bb, parts; // bb

	    parts = name.split('.');
	    parts.pop();
	    bb = parts.join('.') + '.' + lookup.index;
	    indexObject[bb] = {};
	    indexObject[bb].data = name;
	    indexObject[bb].isOptional = lookup.isOptional;
	  }

	  return indexObject;
	}

	function isKnownFileExtension(extension) {
	  let fasta = new Set(['fa', 'fasta']);
	  let union = new Set([...TrackUtils.knownFileExtensions, ...fasta]);
	  return union.has(extension);
	}

	function configureModal(fileLoadWidget, modal, okHandler) {
	  const doDismiss = () => {
	    fileLoadWidget.dismiss();
	    $(modal).modal('hide');
	  };

	  const doOK = async () => {
	    const result = await okHandler(fileLoadWidget);

	    if (true === result) {
	      fileLoadWidget.dismiss();
	      $(modal).modal('hide');
	    }
	  };

	  let dismiss; // upper dismiss - x - button

	  dismiss = modal.querySelector('.modal-header button');
	  dismiss.addEventListener('click', doDismiss); // lower dismiss - close - button

	  dismiss = modal.querySelector('.modal-footer button:nth-child(1)');
	  dismiss.addEventListener('click', doDismiss); // ok - button

	  const ok = modal.querySelector('.modal-footer button:nth-child(2)');
	  ok.addEventListener('click', doOK);
	  modal.addEventListener('keypress', event => {
	    if ('Enter' === event.key) {
	      doOK();
	    }
	  });
	}

	function indexLookup(dataSuffix) {
	  const fa = {
	    index: 'fai',
	    isOptional: false
	  };
	  const fasta = {
	    index: 'fai',
	    isOptional: false
	  };
	  const bam = {
	    index: 'bai',
	    isOptional: false
	  };
	  const cram = {
	    index: 'crai',
	    isOptional: false
	  };
	  const gz = {
	    index: 'tbi',
	    isOptional: true
	  };
	  const bgz = {
	    index: 'tbi',
	    isOptional: true
	  };
	  const any = {
	    index: 'idx',
	    isOptional: true
	  };
	  const lut = {
	    fa,
	    fasta,
	    bam,
	    cram,
	    gz,
	    bgz
	  };

	  if (lut[dataSuffix]) {
	    return lut[dataSuffix];
	  } else {
	    return any;
	  }
	}

	var utils = /*#__PURE__*/Object.freeze({
	  __proto__: null,
	  getIndexObjectWithDataName: getIndexObjectWithDataName,
	  isKnownFileExtension: isKnownFileExtension,
	  configureModal: configureModal
	});

	class FileLoad {
	  constructor({
	    localFileInput,
	    dropboxButton,
	    googleEnabled,
	    googleDriveButton,
	    igvxhr
	  }) {
	    this.igvxhr = igvxhr;
	    localFileInput.addEventListener('change', async () => {
	      if (true === FileLoad.isValidLocalFileInput(localFileInput)) {
	        await this.loadPaths(Array.from(localFileInput.files));
	        localFileInput.value = '';
	      }
	    });
	    dropboxButton.addEventListener('click', () => {
	      const config = {
	        success: dbFiles => this.loadPaths(dbFiles.map(dbFile => dbFile.link)),
	        cancel: () => {},
	        linkType: 'preview',
	        multiselect: true,
	        folderselect: false
	      };
	      Dropbox.choose(config);
	    });

	    if (false === googleEnabled) {
	      hide(googleDriveButton.parentElement);
	    }

	    if (true === googleEnabled && googleDriveButton) {
	      googleDriveButton.addEventListener('click', () => {
	        createDropdownButtonPicker(true, responses => {
	          const paths = responses.map(({
	            name,
	            url
	          }) => {
	            return {
	              filename: name,
	              name,
	              google_url: driveDownloadURL(url)
	            };
	          });
	          this.loadPaths(paths);
	        });
	      });
	    }
	  }

	  async loadPaths(paths) {//console.log('FileLoad: loadPaths(...)');
	  }

	  static isValidLocalFileInput(input) {
	    return input.files && input.files.length > 0;
	  }

	  static getIndexURL(indexValue) {
	    if (indexValue) {
	      if (indexValue[0]) {
	        return indexValue[0].path;
	      } else if (indexValue[1]) {
	        return indexValue[1].path;
	      } else {
	        return undefined;
	      }
	    } else {
	      return undefined;
	    }
	  }

	  static getIndexPaths(dataPathNames, indexPathCandidates) {
	    // add info about presence and requirement (or not) of an index path
	    const list = Object.keys(dataPathNames).map(function (dataPathName) {
	      let indexObject; // assess the data files need/requirement for index files

	      indexObject = getIndexObjectWithDataName(dataPathName); // identify the presence/absence of associated index files

	      for (let p in indexObject) {
	        if (indexObject.hasOwnProperty(p)) {
	          indexObject[p].missing = undefined === indexPathCandidates[p];
	        }
	      }

	      return indexObject;
	    }).filter(function (indexObject) {
	      // prune optional AND missing index files
	      if (1 === Object.keys(indexObject).length) {
	        let obj;
	        obj = indexObject[Object.keys(indexObject)[0]];

	        if (true === obj.missing && true === obj.isOptional) {
	          return false;
	        } else if (false === obj.missing && false === obj.isOptional) {
	          return true;
	        } else if (true === obj.missing && false === obj.isOptional) {
	          return true;
	        } else
	          /*( false === obj.missing && true === obj.isOptional)*/
	          {
	            return true;
	          }
	      } else {
	        return true;
	      }
	    });
	    return list.reduce(function (accumulator, indexObject) {
	      for (let key in indexObject) {
	        if (indexObject.hasOwnProperty(key)) {
	          let value;
	          value = indexObject[key];

	          if (undefined === accumulator[value.data]) {
	            accumulator[value.data] = [];
	          }

	          accumulator[value.data].push(false === value.missing ? {
	            name: key,
	            path: indexPathCandidates[key]
	          } : undefined);
	        }
	      }

	      return accumulator;
	    }, {});
	  }

	}

	const referenceSet = new Set(['fai', 'fa', 'fasta']);
	const dataSet = new Set(['fna', 'fa', 'fasta']);
	const indexSet = new Set(['fai']); // const errorString = 'ERROR: Load either: 1) single JSON file. 2) data file (.fa or .fasta ) & index file (.fai).';

	const errorString = 'ERROR: Select both a sequence file (.fa or .fasta) and an index file (.fai).';

	class GenomeFileLoad extends FileLoad {
	  constructor({
	    localFileInput,
	    dropboxButton,
	    googleEnabled,
	    googleDriveButton,
	    loadHandler,
	    igvxhr
	  }) {
	    super({
	      localFileInput,
	      dropboxButton,
	      googleEnabled,
	      googleDriveButton,
	      igvxhr
	    });
	    this.loadHandler = loadHandler;
	  }

	  async loadPaths(paths) {
	    if (1 === paths.length) {
	      const path = paths[0];

	      if ('json' === getExtension(path)) {
	        const json = await this.igvxhr.loadJson(path.google_url || path);
	        this.loadHandler(json);
	      } else if ('xml' === getExtension(path)) {
	        const key = true === isFilePath(path) ? 'file' : 'url';
	        const o = {};
	        o[key] = path;
	        this.loadHandler(o);
	      } else {
	        AlertSingleton$1.present(`${errorString}`);
	      }
	    } else if (2 === paths.length) {
	      let [a, b] = paths.map(path => {
	        return getExtension(path);
	      });

	      if (false === GenomeFileLoad.extensionValidator(a, b)) {
	        AlertSingleton$1.present(`${errorString}`);
	        return;
	      }

	      const [dataPath, indexPath] = GenomeFileLoad.retrieveDataPathAndIndexPath(paths);
	      await this.loadHandler({
	        fastaURL: dataPath,
	        indexURL: indexPath
	      });
	    } else {
	      AlertSingleton$1.present(`${errorString}`);
	    }
	  }

	  static retrieveDataPathAndIndexPath(paths) {
	    let [a, b] = paths.map(path => getExtension(path));
	    const [la, lb] = paths;
	    let pa;
	    let pb;

	    if (dataSet.has(a) && indexSet.has(b)) {
	      pa = la.google_url || la;
	      pb = lb.google_url || lb;
	    } else {
	      pa = lb.google_url || lb;
	      pb = la.google_url || la;
	    }

	    return [pa, pb];
	  }

	  static extensionValidator(a, b) {
	    if (dataSet.has(a) && indexSet.has(b)) {
	      return true;
	    } else {
	      return dataSet.has(b) && indexSet.has(a);
	    }
	  }

	  static pathValidator(extension) {
	    return referenceSet.has(extension);
	  }

	  static configurationHandler(dataKey, dataValue, indexPaths) {
	    return {
	      fastaURL: dataValue,
	      indexURL: FileLoad.getIndexURL(indexPaths[dataKey])
	    };
	  }

	}

	class SessionFileLoad extends FileLoad {
	  constructor({
	    localFileInput,
	    dropboxButton,
	    googleEnabled,
	    googleDriveButton,
	    loadHandler,
	    igvxhr
	  }) {
	    super({
	      localFileInput,
	      dropboxButton,
	      googleEnabled,
	      googleDriveButton,
	      igvxhr
	    });
	    this.loadHandler = loadHandler;
	  }

	  async loadPaths(paths) {
	    const path = paths[0];

	    if ('json' === getExtension(path)) {
	      const json = await this.igvxhr.loadJson(path.google_url || path);
	      this.loadHandler(json);
	    } else if ('xml' === getExtension(path)) {
	      const key = true === isFilePath(path) ? 'file' : 'url';
	      const o = {};
	      o[key] = path;
	      this.loadHandler(o);
	    }
	  }

	}
	/*
	 *  The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
	 * associated documentation files (the "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
	 * following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all copies or substantial
	 * portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
	 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *
	 */


	class MultipleTrackFileLoad {
	  constructor({
	    $localFileInput,
	    $dropboxButton,
	    $googleDriveButton,
	    fileLoadHandler,
	    multipleFileSelection
	  }) {
	    this.fileLoadHandler = fileLoadHandler;
	    $localFileInput.on('change', async () => {
	      if (true === MultipleTrackFileLoad.isValidLocalFileInput($localFileInput)) {
	        const input = $localFileInput.get(0);
	        const {
	          files
	        } = input;
	        const paths = Array.from(files);
	        input.value = '';
	        await ingestPaths({
	          paths,
	          fileLoadHandler
	        });
	      }
	    });
	    $dropboxButton.on('click', () => {
	      const obj = {
	        success: dbFiles => ingestPaths({
	          paths: dbFiles.map(({
	            link
	          }) => link),
	          fileLoadHandler
	        }),
	        cancel: () => {},
	        linkType: "preview",
	        multiselect: multipleFileSelection,
	        folderselect: false
	      };
	      Dropbox.choose(obj);
	    });

	    if ($googleDriveButton) {
	      $googleDriveButton.on('click', () => {
	        createDropdownButtonPicker(multipleFileSelection, async responses => {
	          // const paths = responses.map(async ({ name, url }) => {
	          //     return { url: GoogleUtils.driveDownloadURL(url), name, filename: name, format: TrackUtils.inferFileFormat(name) }
	          // });
	          await ingestPaths({
	            paths: responses.map(({
	              name,
	              url
	            }) => url),
	            fileLoadHandler
	          });
	        });
	      });
	    }
	  }

	  async loadPaths(paths) {
	    await ingestPaths({
	      paths,
	      fileLoadHandler: this.fileLoadHandler
	    });
	  }

	  static isValidLocalFileInput($input) {
	    return $input.get(0).files && $input.get(0).files.length > 0;
	  }

	  static async getFilename(path) {
	    if (path instanceof File) {
	      return path.name;
	    } else if (isGoogleDriveURL(path)) {
	      const info = await getDriveFileInfo(path);
	      return info.name || info.originalFileName;
	    } else {
	      const result = parseUri(path);
	      return result.file;
	    }
	  }

	  static isGoogleDrivePath(path) {
	    return path instanceof File ? false : isGoogleDriveURL(path);
	  }

	}

	const indexExtensions = new Set(['bai', 'csi', 'tbi', 'idx', 'crai']);
	const requireIndex = new Set(['bam', 'cram']);

	async function ingestPaths({
	  paths,
	  fileLoadHandler
	}) {
	  try {
	    await doIngestPaths({
	      paths,
	      fileLoadHandler
	    });
	  } catch (e) {
	    console.error(e);
	    AlertSingleton$1.present(e.message);
	  }
	}

	async function doIngestPaths({
	  paths,
	  fileLoadHandler
	}) {
	  // Search for index files  (.bai, .csi, .tbi, .idx)
	  const indexLUT = new Map();
	  const dataPaths = [];

	  for (let path of paths) {
	    const name = await MultipleTrackFileLoad.getFilename(path);
	    const extension = getExtension(name);

	    if (indexExtensions.has(extension)) {
	      // key is the data file name
	      const key = createIndexLUTKey(name, extension);
	      indexLUT.set(key, {
	        indexURL: path,
	        indexFilename: MultipleTrackFileLoad.isGoogleDrivePath(path) ? name : undefined
	      });
	    } else {
	      dataPaths.push(path);
	    }
	  }

	  const configurations = [];

	  for (let dataPath of dataPaths) {
	    const name = await MultipleTrackFileLoad.getFilename(dataPath);
	    const format = inferFileFormat(name);

	    if (format) {
	      if (indexLUT.has(name)) {
	        const {
	          indexURL,
	          indexFilename
	        } = indexLUT.get(name);
	        configurations.push({
	          url: dataPath,
	          name,
	          indexURL,
	          indexFilename,
	          format
	        });
	      } else if (requireIndex.has(getExtension(name))) {
	        throw new Error(`ERROR: ${name} does not have an index file.`);
	      } else {
	        configurations.push({
	          url: dataPath,
	          name,
	          format
	        });
	      }
	    } else {
	      throw new Error(`ERROR: Unable to load track file ${name}. Unknown format.`);
	    }
	  }

	  if (configurations) {
	    fileLoadHandler(configurations);
	  }
	}

	const createIndexLUTKey = (name, extension) => {
	  let key = name.substring(0, name.length - (extension.length + 1)); // bam and cram files (.bai, .crai) have 2 conventions:
	  // <data>.bam.bai
	  // <data>.bai - we will support this one

	  if ('bai' === extension && !key.endsWith('bam')) {
	    return `${key}.bam`;
	  } else if ('crai' === extension && !key.endsWith('cram')) {
	    return `${key}.cram`;
	  } else {
	    return key;
	  }
	};

	const createURLModal = (id, title) => {
	  const html = `<div id="${id}" class="modal">

            <div class="modal-dialog modal-lg">
    
                <div class="modal-content">
    
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
    
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
    
                    </div>
    
                    <div class="modal-body">
                    </div>
    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">OK</button>
                    </div>
    
                </div>
    
            </div>

        </div>`;
	  return html;
	};

	let fileLoadWidget;

	function createSessionWidgets($rootContainer, igvxhr, prefix, localFileInputId, dropboxButtonId, googleDriveButtonId, urlModalId, sessionSaveModalId, googleEnabled, loadHandler, JSONProvider) {
	  const $urlModal = $(createURLModal(urlModalId, 'Session URL'));
	  $rootContainer.append($urlModal);

	  if (!googleEnabled) {
	    $(`#${googleDriveButtonId}`).parent().hide();
	  }

	  const fileLoadWidgetConfig = {
	    widgetParent: $urlModal.find('.modal-body').get(0),
	    dataTitle: 'Session',
	    indexTitle: undefined,
	    mode: 'url',
	    fileLoadManager: new FileLoadManager(),
	    dataOnly: true,
	    doURL: undefined
	  };
	  fileLoadWidget = new FileLoadWidget(fileLoadWidgetConfig);
	  const sessionFileLoadConfig = {
	    localFileInput: document.querySelector(`#${localFileInputId}`),
	    dropboxButton: document.querySelector(`#${dropboxButtonId}`),
	    googleEnabled,
	    googleDriveButton: document.querySelector(`#${googleDriveButtonId}`),
	    loadHandler,
	    igvxhr
	  };
	  const sessionFileLoad = new SessionFileLoad(sessionFileLoadConfig);
	  configureModal(fileLoadWidget, $urlModal.get(0), async fileLoadWidget => {
	    await sessionFileLoad.loadPaths(fileLoadWidget.retrievePaths());
	    return true;
	  });
	  configureSaveSessionModal$1($rootContainer, prefix, JSONProvider, sessionSaveModalId);
	}

	function configureSaveSessionModal$1($rootContainer, prefix, JSONProvider, sessionSaveModalId) {
	  const modal = `<div id="${sessionSaveModalId}" class="modal fade igv-app-file-save-modal">

            <div class="modal-dialog modal-lg">
    
                <div class="modal-content">
    
                    <div class="modal-header">
    
                        <div class="modal-title">
                            <div>
                                Save Session File
                            </div>
                        </div>
    
                        <button type="button" class="close" data-dismiss="modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
    
                    <div class="modal-body">
                        <input class="form-control" type="text" placeholder="igv-app-session.json">
    
                        <div>
                            Enter session filename with .json suffix
                        </div>
    
                    </div>
    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-sm btn-secondary">OK</button>
                    </div>
    
                </div>
    
            </div>
    
        </div>`;
	  const $modal = $(modal);
	  $rootContainer.append($modal);
	  let $input = $modal.find('input');

	  let okHandler = () => {
	    const extensions = new Set(['json', 'xml']);
	    let filename = $input.val();

	    if (undefined === filename || '' === filename) {
	      filename = $input.attr('placeholder');
	    } else if (false === extensions.has(getExtension(filename))) {
	      filename = filename + '.json';
	    }

	    const json = JSONProvider();

	    if (json) {
	      const jsonString = JSON.stringify(json, null, '\t');
	      const data = URL.createObjectURL(new Blob([jsonString], {
	        type: "application/octet-stream"
	      }));
	      download(filename, data);
	    }

	    $modal.modal('hide');
	  };

	  const $ok = $modal.find('.modal-footer button:nth-child(2)');
	  $ok.on('click', okHandler);
	  $modal.on('show.bs.modal', e => {
	    $input.val(`${prefix}-session.json`);
	  });
	  $input.on('keyup', e => {
	    // enter key
	    if (13 === e.keyCode) {
	      okHandler();
	    }
	  });
	}

	class ModalTable {
	  constructor(args) {
	    this.datasource = args.datasource;
	    this.selectHandler = args.selectHandler;
	    this.pageLength = args.pageLength || 10;

	    if (args.selectionStyle) {
	      this.select = {
	        style: args.selectionStyle
	      };
	    } else {
	      this.select = true;
	    }

	    const id = args.id;
	    const title = args.title || '';
	    const parent = args.parent ? $(args.parent) : $('body');
	    const html = `
        <div id="${id}" class="modal fade">
        
            <div class="modal-dialog modal-xl">
        
                <div class="modal-content">
        
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
        
                    <div class="modal-body">
        
                        <div id="${id}-spinner" class="spinner-border" style="display: none;">
                            <!-- spinner -->
                        </div>
        
                        <div id="${id}-datatable-container">
        
                        </div>
                    </div>
        
                    <div class="modal-footer">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">OK</button>
                    </div>
        
                </div>
        
            </div>
        
        </div>
    `;
	    const $m = $(html);
	    parent.append($m);
	    this.$modal = $m;
	    this.$datatableContainer = $m.find(`#${id}-datatable-container`);
	    this.$spinner = $m.find(`#${id}-spinner`);
	    const $okButton = $m.find('.modal-footer button:nth-child(2)');
	    $m.on('shown.bs.modal', e => {
	      this.buildTable();
	    });
	    $m.on('hidden.bs.modal', e => {
	      $(e.relatedTarget).find('tr.selected').removeClass('selected');
	    });
	    $okButton.on('click', e => {
	      const selected = this.getSelectedTableRowsData.call(this, this.$dataTable.$('tr.selected'));

	      if (selected && this.selectHandler) {
	        this.selectHandler(selected);
	      }
	    });
	  }

	  remove() {
	    this.$modal.remove();
	  }

	  setDatasource(datasource) {
	    this.datasource = datasource;
	    this.$datatableContainer.empty();
	    this.$table = undefined;
	  }

	  async buildTable() {
	    if (!this.$table && this.datasource) {
	      this.$table = $('<table class="display"></table>');
	      this.$datatableContainer.append(this.$table);

	      try {
	        this.startSpinner();
	        const tableData = await this.datasource.tableData();
	        const tableColumns = await this.datasource.tableColumns();
	        const config = {
	          data: tableData,
	          columns: tableColumns.map(c => ({
	            title: c,
	            data: c
	          })),
	          pageLength: this.pageLength,
	          select: this.select,
	          autoWidth: false,
	          paging: true,
	          scrollX: true,
	          scrollY: '400px'
	        };

	        if (this.datasource.columnDefs) {
	          config.columnDefs = this.datasource.columnDefs;
	        } // API object


	        this.api = this.$table.DataTable(config); // Preserve sort order. For some reason it gets garbled by default
	        // this.api.column( 0 ).data().sort().draw();
	        // Adjust column widths

	        this.api.columns.adjust().draw(); // jQuery object

	        this.$dataTable = this.$table.dataTable();
	        this.tableData = tableData;
	      } catch (e) {} finally {
	        this.stopSpinner();
	      }
	    }
	  }

	  getSelectedTableRowsData($rows) {
	    const tableData = this.tableData;
	    const result = [];

	    if ($rows.length > 0) {
	      $rows.removeClass('selected');
	      const api = this.$table.api();
	      $rows.each(function () {
	        const index = api.row(this).index();
	        result.push(tableData[index]);
	      });
	      return this.datasource.tableSelectionHandler(result);
	    } else {
	      return undefined;
	    }
	  }

	  startSpinner() {
	    if (this.$spinner) this.$spinner.show();
	  }

	  stopSpinner() {
	    if (this.$spinner) this.$spinner.hide();
	  }

	}

	class GenericMapDatasource {
	  constructor(config) {
	    this.isJSON = config.isJSON || false;

	    if (config.genomeId) {
	      this.genomeId = config.genomeId;
	    }

	    if (config.dataSetPathPrefix) {
	      this.dataSetPathPrefix = config.dataSetPathPrefix;
	    }

	    if (config.urlPrefix) {
	      this.urlPrefix = config.urlPrefix;
	    }

	    if (config.dataSetPath) {
	      this.path = config.dataSetPath;
	    }

	    this.addIndexColumn = config.addIndexColumn || false;
	    this.columnDictionary = {};

	    for (let column of config.columns) {
	      this.columnDictionary[column] = column;
	    }

	    if (config.hiddenColumns || config.titles) {
	      this.columnDefs = [];
	      const keys = Object.keys(this.columnDictionary);

	      if (config.hiddenColumns) {
	        for (let column of config.hiddenColumns) {
	          this.columnDefs.push({
	            visible: false,
	            searchable: false,
	            targets: keys.indexOf(column)
	          });
	        }
	      }

	      if (config.titles) {
	        for (let [column, title] of Object.entries(config.titles)) {
	          this.columnDefs.push({
	            title,
	            targets: keys.indexOf(column)
	          });
	        }
	      }
	    } else {
	      this.columnDefs = undefined;
	    }

	    if (config.parser) {
	      this.parser = config.parser;
	    }

	    if (config.selectionHandler) {
	      this.selectionHandler = config.selectionHandler;
	    }
	  }

	  async tableColumns() {
	    return Object.keys(this.columnDictionary);
	  }

	  async tableData() {
	    let response = undefined;

	    try {
	      response = await fetch(this.path);
	    } catch (e) {
	      console.error(e);
	      return undefined;
	    }

	    if (response) {
	      if (true === this.isJSON) {
	        const obj = await response.json();
	        return this.parser(obj, this.columnDictionary, this.addIndexColumn);
	      } else {
	        const str = await response.text();
	        return this.parser(str, this.columnDictionary, this.addIndexColumn);
	      }
	    }
	  }

	  tableSelectionHandler(selectionList) {
	    if (this.selectionHandler) {
	      return this.selectionHandler(selectionList);
	    } else {
	      return selectionList;
	    }
	  }

	}
	/*
	 * The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 * Author: Jim Robinson
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */


	const getDataWrapper = function (data) {
	  if (typeof data == 'string' || data instanceof String) {
	    return new StringDataWrapper(data);
	  } else {
	    return new ByteArrayDataWrapper(data);
	  }
	}; // Data might be a string, or an UInt8Array


	var StringDataWrapper = function (string) {
	  this.data = string;
	  this.ptr = 0;
	};

	StringDataWrapper.prototype.nextLine = function () {
	  //return this.split(/\r\n|\n|\r/gm);
	  var start = this.ptr,
	      idx = this.data.indexOf('\n', start);

	  if (idx > 0) {
	    this.ptr = idx + 1; // Advance pointer for next line

	    return idx === start ? undefined : this.data.substring(start, idx).trim();
	  } else {
	    // Last line
	    this.ptr = this.data.length;
	    return start >= this.data.length ? undefined : this.data.substring(start).trim();
	  }
	}; // For use in applications where whitespace carries meaning
	// Returns "" for an empty row (not undefined like nextLine), since this is needed in AED


	StringDataWrapper.prototype.nextLineNoTrim = function () {
	  var start = this.ptr,
	      idx = this.data.indexOf('\n', start),
	      data = this.data;

	  if (idx > 0) {
	    this.ptr = idx + 1; // Advance pointer for next line

	    if (idx > start && data.charAt(idx - 1) === '\r') {
	      // Trim CR manually in CR/LF sequence
	      return data.substring(start, idx - 1);
	    }

	    return data.substring(start, idx);
	  } else {
	    var length = data.length;
	    this.ptr = length; // Return undefined only at the very end of the data

	    return start >= length ? undefined : data.substring(start);
	  }
	};

	var ByteArrayDataWrapper = function (array) {
	  this.data = array;
	  this.length = this.data.length;
	  this.ptr = 0;
	};

	ByteArrayDataWrapper.prototype.nextLine = function () {
	  var c, result;
	  result = "";
	  if (this.ptr >= this.length) return undefined;

	  for (var i = this.ptr; i < this.length; i++) {
	    c = String.fromCharCode(this.data[i]);
	    if (c === '\r') continue;
	    if (c === '\n') break;
	    result = result + c;
	  }

	  this.ptr = i + 1;
	  return result;
	}; // The ByteArrayDataWrapper does not do any trimming by default, can reuse the function


	ByteArrayDataWrapper.prototype.nextLineNoTrim = ByteArrayDataWrapper.prototype.nextLine;

	class EncodeTrackDatasource extends GenericMapDatasource {
	  constructor(config) {
	    super(config);

	    if (config.filter) {
	      this.filter = config.filter;
	    }

	    this.suffix = config.suffix || '.txt';
	  }

	  async tableData() {
	    let response = undefined;

	    try {
	      const url = `${this.urlPrefix}${canonicalId(this.genomeId)}${this.suffix}`;
	      response = await fetch(url);
	    } catch (e) {
	      console.error(e);
	      return undefined;
	    }

	    if (response) {
	      const str = await response.text();
	      const records = this.parseTabData(str, this.filter, this.columnDictionary);
	      records.sort(encodeSort);
	      return records;
	    }
	  }

	  parseTabData(str, filter, columnDictionary) {
	    const dataWrapper = getDataWrapper(str);
	    dataWrapper.nextLine(); // Skip header

	    const records = [];
	    let line;
	    const keys = Object.keys(columnDictionary);

	    while (line = dataWrapper.nextLine()) {
	      const record = {};
	      const tokens = line.split("\t");

	      for (let key of keys) {
	        record[key] = tokens[keys.indexOf(key)];
	      } // additions and edits


	      record['Experiment'] = record['ID'].substr(13).replace("/", "");
	      record['HREF'] = `${this.dataSetPathPrefix}${record['HREF']}`;
	      record['name'] = constructName(record);

	      if (undefined === filter || filter(record)) {
	        records.push(record);
	      }
	    } // while(line)


	    return records;
	  }

	  static supportsGenome(genomeId) {
	    const knownGenomes = new Set(["ce10", "ce11", "dm3", "dm6", "GRCh38", "hg19", "mm9", "mm10"]);
	    const id = canonicalId(genomeId);
	    return knownGenomes.has(id);
	  }

	}

	function constructName(record) {
	  let name = record["Biosample"] || "";

	  if (record["Target"]) {
	    name += " " + record["Target"];
	  }

	  if (record["AssayType"].toLowerCase() !== "chip-seq") {
	    name += " " + record["AssayType"];
	  }

	  return name;
	}

	function encodeSort(a, b) {
	  var aa1, aa2, cc1, cc2, tt1, tt2;
	  aa1 = a['Assay Type'];
	  aa2 = b['Assay Type'];
	  cc1 = a['Biosample'];
	  cc2 = b['Biosample'];
	  tt1 = a['Target'];
	  tt2 = b['Target'];

	  if (aa1 === aa2) {
	    if (cc1 === cc2) {
	      if (tt1 === tt2) {
	        return 0;
	      } else if (tt1 < tt2) {
	        return -1;
	      } else {
	        return 1;
	      }
	    } else if (cc1 < cc2) {
	      return -1;
	    } else {
	      return 1;
	    }
	  } else {
	    if (aa1 < aa2) {
	      return -1;
	    } else {
	      return 1;
	    }
	  }
	}

	function canonicalId(genomeId) {
	  switch (genomeId) {
	    case "hg38":
	      return "GRCh38";

	    case "CRCh37":
	      return "hg19";

	    case "GRCm38":
	      return "mm10";

	    case "NCBI37":
	      return "mm9";

	    case "WBcel235":
	      return "ce11";

	    case "WS220":
	      return "ce10";

	    default:
	      return genomeId;
	  }
	}

	const encodeTrackDatasourceSignalConfigurator = genomeId => {
	  return {
	    isJSON: false,
	    genomeId,
	    suffix: '.signals.txt',
	    dataSetPathPrefix: 'https://www.encodeproject.org',
	    urlPrefix: 'https://s3.amazonaws.com/igv.org.app/encode/',
	    dataSetPath: undefined,
	    addIndexColumn: false,
	    columns: ['ID', // hide
	    'Assembly', // hide
	    'Biosample', 'AssayType', 'Target', 'BioRep', 'TechRep', 'OutputType', 'Format', 'Lab', 'HREF', // hide
	    'Accession', 'Experiment'],
	    titles: {
	      AssayType: 'Assay Type',
	      OutputType: 'Output Type',
	      BioRep: 'Bio Rep',
	      TechRep: 'Tech Rep'
	    },
	    hiddenColumns: ['ID', 'Assembly', 'HREF'],
	    parser: undefined,
	    selectionHandler: selectionList => {
	      return selectionList.map(({
	        name,
	        HREF
	      }) => {
	        return {
	          name,
	          url: HREF
	        };
	      });
	    }
	  };
	};

	const encodeTrackDatasourceOtherConfigurator = genomeId => {
	  return {
	    isJSON: false,
	    genomeId,
	    suffix: '.other.txt',
	    dataSetPathPrefix: 'https://www.encodeproject.org',
	    urlPrefix: 'https://s3.amazonaws.com/igv.org.app/encode/',
	    dataSetPath: undefined,
	    addIndexColumn: false,
	    columns: ['ID', // hide
	    'Assembly', // hide
	    'Biosample', 'AssayType', 'Target', 'BioRep', 'TechRep', 'OutputType', 'Format', 'Lab', 'HREF', // hide
	    'Accession', 'Experiment'],
	    titles: {
	      AssayType: 'Assay Type',
	      OutputType: 'Output Type',
	      BioRep: 'Bio Rep',
	      TechRep: 'Tech Rep'
	    },
	    hiddenColumns: ['ID', 'Assembly', 'HREF'],
	    parser: undefined,
	    selectionHandler: selectionList => {
	      return selectionList.map(({
	        name,
	        HREF
	      }) => {
	        return {
	          name,
	          url: HREF
	        };
	      });
	    }
	  };
	};

	function createGenericSelectModal(id, select_id) {
	  return `<div id="${id}" class="modal">

                <div class="modal-dialog modal-lg">
    
                    <div class="modal-content">
    
                        <div class="modal-header">
                            <div class="modal-title"></div>
                            <button type="button" class="close" data-dismiss="modal">
                                <span>&times;</span>
                            </button>
                        </div>
            
                        <div class="modal-body">
                            <div class="form-group">
                                <select id="${select_id}" class="form-control" multiple></select>
                            </div>
                            <div id="igv-widgets-generic-select-modal-footnotes"></div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">OK</button>
                        </div>
    
                    </div>
    
                </div>

            </div>`;
	}

	const createTrackURLModal = id => {
	  const html = `<div id="${id}" class="modal">

            <div class="modal-dialog modal-lg">
    
                <div class="modal-content">
    
                    <div class="modal-header">
                        <div class="modal-title">Track URL</div>
    
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
    
                    </div>
    
                    <div class="modal-body">
                    </div>
    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">OK</button>
                    </div>
    
                </div>
    
            </div>

        </div>`;
	  return html;
	};

	let fileLoadWidget$1;
	let multipleTrackFileLoad;
	let encodeModalTables = [];
	let genomeChangeListener;

	function createTrackWidgets($igvMain, $localFileInput, $dropboxButton, googleEnabled, $googleDriveButton, encodeTrackModalIds, urlModalId, trackLoadHandler) {
	  const $urlModal = $(createTrackURLModal(urlModalId));
	  $igvMain.append($urlModal);
	  let fileLoadWidgetConfig = {
	    widgetParent: $urlModal.find('.modal-body').get(0),
	    dataTitle: 'Track',
	    indexTitle: 'Index',
	    mode: 'url',
	    fileLoadManager: new FileLoadManager(),
	    dataOnly: false,
	    doURL: true
	  };
	  fileLoadWidget$1 = new FileLoadWidget(fileLoadWidgetConfig);
	  configureModal(fileLoadWidget$1, $urlModal.get(0), async fileLoadWidget => {
	    const paths = fileLoadWidget.retrievePaths();
	    await multipleTrackFileLoad.loadPaths(paths);
	    return true;
	  });

	  if (!googleEnabled) {
	    $googleDriveButton.parent().hide();
	  }

	  const multipleTrackFileLoadConfig = {
	    $localFileInput,
	    $dropboxButton,
	    $googleDriveButton: googleEnabled ? $googleDriveButton : undefined,
	    fileLoadHandler: trackLoadHandler,
	    multipleFileSelection: true
	  };
	  multipleTrackFileLoad = new MultipleTrackFileLoad(multipleTrackFileLoadConfig);

	  for (let encodeTrackModalId of encodeTrackModalIds) {
	    const encodeModalTableConfig = {
	      id: encodeTrackModalId,
	      title: 'ENCODE',
	      selectionStyle: 'multi',
	      pageLength: 100,
	      selectHandler: trackLoadHandler
	    };
	    encodeModalTables.push(new ModalTable(encodeModalTableConfig));
	  }

	  genomeChangeListener = {
	    receiveEvent: async ({
	      data
	    }) => {
	      const {
	        genomeID
	      } = data;
	      encodeModalTables[0].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceSignalConfigurator(genomeID)));
	      encodeModalTables[1].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceOtherConfigurator(genomeID)));
	    }
	  };
	  EventBus.globalBus.subscribe('DidChangeGenome', genomeChangeListener);
	}

	function createTrackWidgetsWithTrackRegistry($igvMain, $dropdownMenu, $localFileInput, $dropboxButton, googleEnabled, $googleDriveButton, encodeTrackModalIds, urlModalId, selectModalId, GtexUtils, trackRegistryFile, trackLoadHandler) {
	  createTrackWidgets($igvMain, $localFileInput, $dropboxButton, googleEnabled, $googleDriveButton, encodeTrackModalIds, urlModalId, trackLoadHandler);
	  const $genericSelectModal = $(createGenericSelectModal(selectModalId, `${selectModalId}-select`));
	  $igvMain.append($genericSelectModal);
	  const $select = $genericSelectModal.find('select');
	  const $dismiss = $genericSelectModal.find('.modal-footer button:nth-child(1)');
	  $dismiss.on('click', () => $genericSelectModal.modal('hide'));
	  const $ok = $genericSelectModal.find('.modal-footer button:nth-child(2)');

	  const okHandler = () => {
	    const configurations = [];
	    const $selectedOptions = $select.find('option:selected');
	    $selectedOptions.each(function () {
	      //console.log(`You selected ${$(this).val()}`);
	      configurations.push($(this).data('track'));
	      $(this).removeAttr('selected');
	    });

	    if (configurations.length > 0) {
	      trackLoadHandler(configurations);
	    }

	    $genericSelectModal.modal('hide');
	  };

	  $ok.on('click', okHandler);
	  $genericSelectModal.get(0).addEventListener('keypress', event => {
	    if ('Enter' === event.key) {
	      okHandler();
	    }
	  });
	  genomeChangeListener = {
	    receiveEvent: async ({
	      data
	    }) => {
	      const {
	        genomeID
	      } = data;
	      const encodeIsSupported = EncodeTrackDatasource.supportsGenome(genomeID);

	      if (encodeIsSupported) {
	        //console.log(`ENCODE supports genome ${genomeID}`)
	        encodeModalTables[0].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceSignalConfigurator(genomeID)));
	        encodeModalTables[1].setDatasource(new EncodeTrackDatasource(encodeTrackDatasourceOtherConfigurator(genomeID)));
	      }

	      await updateTrackMenus(genomeID, GtexUtils, encodeIsSupported, encodeModalTables, trackRegistryFile, $dropdownMenu, $genericSelectModal);
	    }
	  };
	  EventBus.globalBus.subscribe('DidChangeGenome', genomeChangeListener);
	}

	async function updateTrackMenus(genomeID, GtexUtils, encodeIsSupported, encodeModalTables, trackRegistryFile, $dropdownMenu, $genericSelectModal) {
	  const id_prefix = 'genome_specific_';
	  const $divider = $dropdownMenu.find('.dropdown-divider');
	  const searchString = '[id^=' + id_prefix + ']';
	  const $found = $dropdownMenu.find(searchString);
	  $found.remove();
	  const paths = await getPathsWithTrackRegistryFile(genomeID, trackRegistryFile);

	  if (undefined === paths) {
	    console.warn(`There are no tracks in the track registryy for genome ${genomeID}`);
	    return;
	  }

	  let responses = [];

	  try {
	    responses = await Promise.all(paths.map(path => fetch(path)));
	  } catch (e) {
	    AlertSingleton$1.present(e.message);
	  }

	  let jsons = [];

	  try {
	    jsons = await Promise.all(responses.map(response => response.json()));
	  } catch (e) {
	    AlertSingleton$1.present(e.message);
	  }

	  let buttonConfigurations = [];

	  for (let json of jsons) {
	    if ('ENCODE' === json.type) {
	      let i = 0;

	      for (let config of [encodeTrackDatasourceSignalConfigurator(genomeID), encodeTrackDatasourceOtherConfigurator(json.genomeID)]) {
	        encodeModalTables[i++].setDatasource(new EncodeTrackDatasource(config));
	      }

	      buttonConfigurations.push(json);
	    } else if ('GTEX' === json.type) {
	      let info = undefined;

	      try {
	        info = await GtexUtils.getTissueInfo(json.datasetId);
	      } catch (e) {
	        AlertSingleton$1.present(e.message);
	      }

	      if (info) {
	        json.tracks = info.tissueInfo.map(tissue => GtexUtils.trackConfiguration(tissue));
	        buttonConfigurations.push(json);
	      }
	    } else {
	      buttonConfigurations.push(json);
	    }
	  } // for (json)


	  let configurations = [];

	  for (let config of buttonConfigurations) {
	    if (config.type && 'ENCODE' === config.type) ;else {
	      configurations.unshift(config);
	    }
	  }

	  if (encodeIsSupported) {
	    createDropdownButton($divider, 'ENCODE Other', id_prefix).on('click', () => encodeModalTables[1].$modal.modal('show'));
	    createDropdownButton($divider, 'ENCODE Signals', id_prefix).on('click', () => encodeModalTables[0].$modal.modal('show'));
	  }

	  for (let config of configurations) {
	    const $button = createDropdownButton($divider, config.label, id_prefix);
	    $button.on('click', () => {
	      configureSelectModal($genericSelectModal, config);
	      $genericSelectModal.modal('show');
	    });
	  }
	}

	function createDropdownButton($divider, buttonText, id_prefix) {
	  const $button = $('<button>', {
	    class: 'dropdown-item',
	    type: 'button'
	  });
	  $button.text(`${buttonText} ...`);
	  $button.attr('id', `${id_prefix}${buttonText.toLowerCase().split(' ').join('_')}`);
	  $button.insertAfter($divider);
	  return $button;
	}

	function configureSelectModal($genericSelectModal, buttonConfiguration) {
	  let markup = `<div>${buttonConfiguration.label}</div>`; // if (buttonConfiguration.description) {
	  //     markup += `<div>${ buttonConfiguration.description }</div>`
	  // }

	  $genericSelectModal.find('.modal-title').text(`${buttonConfiguration.label}`);
	  let $select = $genericSelectModal.find('select');
	  $select.empty();
	  buttonConfiguration.tracks.reduce(($accumulator, configuration) => {
	    const $option = $('<option>', {
	      value: configuration.name,
	      text: configuration.name
	    });
	    $select.append($option);
	    $option.data('track', configuration);
	    $accumulator.append($option);
	    return $accumulator;
	  }, $select);

	  if (buttonConfiguration.description) {
	    $genericSelectModal.find('#igv-widgets-generic-select-modal-footnotes').html(buttonConfiguration.description);
	  }
	}

	async function getPathsWithTrackRegistryFile(genomeID, trackRegistryFile) {
	  let response = undefined;

	  try {
	    response = await fetch(trackRegistryFile);
	  } catch (e) {
	    console.error(e);
	  }

	  let trackRegistry = undefined;

	  if (response) {
	    trackRegistry = await response.json();
	  } else {
	    const e = new Error("Error retrieving registry via getPathsWithTrackRegistryFile()");
	    AlertSingleton$1.present(e.message);
	    throw e;
	  }

	  return trackRegistry[genomeID];
	}

	const dropboxButtonImageLiteral = `<svg width="75px" height="64px" viewBox="0 0 75 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>Shape</title>
        <desc>Created with Sketch.</desc>
        <defs></defs>
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="dropbox" fill="#0061FF" fill-rule="nonzero">
                <path d="M37.6,12 L18.8,24 L37.6,36 L18.8,48 L1.42108547e-14,35.9 L18.8,23.9 L1.42108547e-14,12 L18.8,0 L37.6,12 Z M18.7,51.8 L37.5,39.8 L56.3,51.8 L37.5,63.8 L18.7,51.8 Z M37.6,35.9 L56.4,23.9 L37.6,12 L56.3,0 L75.1,12 L56.3,24 L75.1,36 L56.3,48 L37.6,35.9 Z" id="Shape"></path>
            </g>
        </g>
    </svg>`;
	const googleDriveImageLiteral = `<svg viewBox="0 0 139 120.4" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><radialGradient id="a" cx="-254.81979" cy="705.83588" gradientTransform="matrix(2.827 1.6322 -1.6322 2.827 2092.1199 -1494.5786)" gradientUnits="userSpaceOnUse" r="82.978401"><stop offset="0" stop-color="#4387fd"/><stop offset=".65" stop-color="#3078f0"/><stop offset=".9099" stop-color="#2b72ea"/><stop offset="1" stop-color="#286ee6"/></radialGradient><radialGradient id="b" cx="-254.8174" cy="705.83691" gradientTransform="matrix(2.827 1.6322 -1.6322 2.827 2092.1199 -1494.5786)" gradientUnits="userSpaceOnUse" r="82.973"><stop offset="0" stop-color="#ffd24d"/><stop offset="1" stop-color="#f6c338"/></radialGradient><path d="m24.2 120.4-24.2-41.9 45.3-78.5 24.2 41.9z" fill="#0da960"/><path d="m24.2 120.4 24.2-41.9h90.6l-24.2 41.9z" fill="url(#a)"/><path d="m139 78.5h-48.4l-45.3-78.5h48.4z" fill="url(#b)"/><path d="m69.5 78.5h-21.1l10.5-18.3-34.7 60.2z" fill="#2d6fdd"/><path d="m90.6 78.5h48.4l-58.9-18.3z" fill="#e5b93c"/><path d="m58.9 60.2 10.6-18.3-24.2-41.9z" fill="#0c9b57"/></svg>`;

	const dropboxButtonImageBase64 = () => window.btoa(dropboxButtonImageLiteral);

	const googleDriveButtonImageBase64 = () => window.btoa(googleDriveImageLiteral);

	const dropboxDropdownItem = id => {
	  return `<div class="dropdown-item">
                <div id="${id}" class="igv-app-dropdown-item-cloud-storage">
                    <div>Dropbox File</div>
                    <div>
                        <img src="data:image/svg+xml;base64,${dropboxButtonImageBase64()}" width="18" height="18">
                    </div>
                </div>
            </div>`;
	};

	const googleDriveDropdownItem = id => {
	  return `<div class="dropdown-item">
                <div id="${id}" class="igv-app-dropdown-item-cloud-storage">
                    <div>Google Drive File</div>
                    <div>
                        <img src="data:image/svg+xml;base64,${googleDriveButtonImageBase64()}" width="18" height="18">
                    </div>
                </div>
            </div>`;
	};

	var Globals = {};

	// https://tc39.github.io/ecma262/#sec-object.keys

	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// https://tc39.github.io/ecma262/#sec-object.defineproperties

	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;

	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);

	  return O;
	};

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () {
	  /* empty */
	};

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	}; // Create object with fake `null` prototype: use ActiveX Object with cleared prototype


	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak

	  return temp;
	}; // Create object with fake `null` prototype: use iframe Object with cleared prototype


	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe); // https://github.com/zloirock/core-js/issues/475

	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	}; // Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug


	var activeXDocument;

	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) {
	    /* ignore */
	  }

	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;

	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];

	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true; // `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create

	var objectCreate = Object.create || function create(O, Properties) {
	  var result;

	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();

	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype$1 = Array.prototype; // Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
	  objectDefineProperty.f(ArrayPrototype$1, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	} // add a key to Array.prototype[@@unscopables]


	var addToUnscopables = function (key) {
	  ArrayPrototype$1[UNSCOPABLES][key] = true;
	};

	var $find = arrayIteration.find;
	var FIND = 'find';
	var SKIPS_HOLES = true;
	var USES_TO_LENGTH$1 = arrayMethodUsesToLength(FIND); // Shouldn't skip holes

	if (FIND in []) Array(1)[FIND](function () {
	  SKIPS_HOLES = false;
	}); // `Array.prototype.find` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.find

	_export({
	  target: 'Array',
	  proto: true,
	  forced: SKIPS_HOLES || !USES_TO_LENGTH$1
	}, {
	  find: function find(callbackfn
	  /* , that = undefined */
	  ) {
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	}); // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	addToUnscopables(FIND);

	var defineProperty$2 = objectDefineProperty.f;
	var FunctionPrototype = Function.prototype;
	var FunctionPrototypeToString = FunctionPrototype.toString;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME = 'name'; // Function instances `.name` property
	// https://tc39.github.io/ecma262/#sec-function-instances-name

	if (descriptors && !(NAME in FunctionPrototype)) {
	  defineProperty$2(FunctionPrototype, NAME, {
	    configurable: true,
	    get: function () {
	      try {
	        return FunctionPrototypeToString.call(this).match(nameRE)[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}

	var fileLoadWidget$2;

	function creatGenomeWidgets(_ref) {
	  var $igvMain = _ref.$igvMain,
	      urlModalId = _ref.urlModalId,
	      genomeFileLoad = _ref.genomeFileLoad;
	  var $urlModal = $(createURLModal(urlModalId, 'Genome URL'));
	  $igvMain.append($urlModal);
	  var config = {
	    widgetParent: $urlModal.find('.modal-body').get(0),
	    dataTitle: 'Genome',
	    indexTitle: 'Index',
	    mode: 'url',
	    fileLoadManager: new FileLoadManager(),
	    dataOnly: false,
	    doURL: true
	  };
	  fileLoadWidget$2 = new FileLoadWidget(config);
	  utils.configureModal(fileLoadWidget$2, $urlModal.get(0), /*#__PURE__*/function () {
	    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fileLoadWidget) {
	      return regeneratorRuntime.wrap(function _callee$(_context) {
	        while (1) {
	          switch (_context.prev = _context.next) {
	            case 0:
	              _context.next = 2;
	              return genomeFileLoad.loadPaths(fileLoadWidget.retrievePaths());

	            case 2:
	              return _context.abrupt("return", true);

	            case 3:
	            case "end":
	              return _context.stop();
	          }
	        }
	      }, _callee);
	    }));

	    return function (_x) {
	      return _ref2.apply(this, arguments);
	    };
	  }());
	}

	function initializeGenomeWidgets(_x2, _x3, _x4) {
	  return _initializeGenomeWidgets.apply(this, arguments);
	}

	function _initializeGenomeWidgets() {
	  _initializeGenomeWidgets = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(browser, genomes, $dropdown_menu) {
	    var genomeDictionary;
	    return regeneratorRuntime.wrap(function _callee4$(_context4) {
	      while (1) {
	        switch (_context4.prev = _context4.next) {
	          case 0:
	            _context4.prev = 0;
	            _context4.next = 3;
	            return getAppLaunchGenomes(genomes);

	          case 3:
	            genomeDictionary = _context4.sent;

	            if (genomeDictionary) {
	              genomeDropdownLayout({
	                browser: browser,
	                genomeDictionary: genomeDictionary,
	                $dropdown_menu: $dropdown_menu
	              });
	            }

	            _context4.next = 10;
	            break;

	          case 7:
	            _context4.prev = 7;
	            _context4.t0 = _context4["catch"](0);
	            AlertSingleton$1.present(_context4.t0.message);

	          case 10:
	          case "end":
	            return _context4.stop();
	        }
	      }
	    }, _callee4, null, [[0, 7]]);
	  }));
	  return _initializeGenomeWidgets.apply(this, arguments);
	}

	function getAppLaunchGenomes(_x5) {
	  return _getAppLaunchGenomes.apply(this, arguments);
	}

	function _getAppLaunchGenomes() {
	  _getAppLaunchGenomes = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(genomes) {
	    var response, json;
	    return regeneratorRuntime.wrap(function _callee5$(_context5) {
	      while (1) {
	        switch (_context5.prev = _context5.next) {
	          case 0:
	            if (!(undefined === genomes)) {
	              _context5.next = 2;
	              break;
	            }

	            return _context5.abrupt("return", undefined);

	          case 2:
	            if (!Array.isArray(genomes)) {
	              _context5.next = 6;
	              break;
	            }

	            return _context5.abrupt("return", buildDictionary(genomes));

	          case 6:
	            response = undefined;
	            _context5.prev = 7;
	            _context5.next = 10;
	            return fetch(genomes);

	          case 10:
	            response = _context5.sent;
	            _context5.next = 16;
	            break;

	          case 13:
	            _context5.prev = 13;
	            _context5.t0 = _context5["catch"](7);
	            AlertSingleton$1.present(_context5.t0.message);

	          case 16:
	            if (!response) {
	              _context5.next = 21;
	              break;
	            }

	            _context5.next = 19;
	            return response.json();

	          case 19:
	            json = _context5.sent;
	            return _context5.abrupt("return", buildDictionary(json));

	          case 21:
	          case "end":
	            return _context5.stop();
	        }
	      }
	    }, _callee5, null, [[7, 13]]);
	  }));
	  return _getAppLaunchGenomes.apply(this, arguments);
	}

	function buildDictionary(array) {
	  var dictionary = {};

	  if (true === Array.isArray(array)) {
	    var _iterator = _createForOfIteratorHelper(array),
	        _step;

	    try {
	      for (_iterator.s(); !(_step = _iterator.n()).done;) {
	        var json = _step.value;
	        dictionary[json.id] = json;
	      }
	    } catch (err) {
	      _iterator.e(err);
	    } finally {
	      _iterator.f();
	    }
	  } else {
	    dictionary[array.id] = array;
	  }

	  return dictionary;
	}

	function genomeDropdownLayout(_ref3) {
	  var browser = _ref3.browser,
	      genomeDictionary = _ref3.genomeDictionary,
	      $dropdown_menu = _ref3.$dropdown_menu;
	  // discard all buttons preceeding the divider div
	  var $divider = $dropdown_menu.find('.dropdown-divider');
	  $divider.prevAll().remove();

	  for (var key in genomeDictionary) {
	    if (genomeDictionary.hasOwnProperty(key)) {
	      (function () {
	        var $button = createButton(genomeDictionary[key].name);
	        $button.insertBefore($divider);
	        $button.data('id', key);
	        var str = "click.genome-dropdown.".concat(key);
	        $button.on(str, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
	          var id;
	          return regeneratorRuntime.wrap(function _callee2$(_context2) {
	            while (1) {
	              switch (_context2.prev = _context2.next) {
	                case 0:
	                  id = $button.data('id');

	                  if (!(id !== browser.genome.id)) {
	                    _context2.next = 4;
	                    break;
	                  }

	                  _context2.next = 4;
	                  return loadGenome(genomeDictionary[id]);

	                case 4:
	                case "end":
	                  return _context2.stop();
	              }
	            }
	          }, _callee2);
	        })));
	      })();
	    } // if (...)

	  } // for (...)


	  function createButton(title) {
	    var $button = $('<button>', {
	      class: 'dropdown-item',
	      type: 'button'
	    });
	    $button.text(title);
	    return $button;
	  }
	}

	function genomeWidgetConfigurator(googleEnabled) {
	  var genomeFileLoadConfig = {
	    localFileInput: document.getElementById('igv-app-dropdown-local-genome-file-input'),
	    dropboxButton: document.getElementById('igv-app-dropdown-dropbox-genome-file-button'),
	    googleEnabled: googleEnabled,
	    googleDriveButton: document.getElementById('igv-app-dropdown-google-drive-genome-file-button'),
	    loadHandler: function () {
	      var _loadHandler = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(configuration) {
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return loadGenome(configuration);

	              case 2:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3);
	      }));

	      function loadHandler(_x6) {
	        return _loadHandler.apply(this, arguments);
	      }

	      return loadHandler;
	    }(),
	    igvxhr: igv.xhr
	  };
	  var genomeFileLoad = new GenomeFileLoad(genomeFileLoadConfig);
	  return {
	    $igvMain: $('#igv-main'),
	    urlModalId: 'igv-app-genome-from-url-modal',
	    genomeFileLoad: genomeFileLoad
	  };
	}

	function loadGenome(_x7) {
	  return _loadGenome.apply(this, arguments);
	}

	function _loadGenome() {
	  _loadGenome = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(genome) {
	    var g;
	    return regeneratorRuntime.wrap(function _callee6$(_context6) {
	      while (1) {
	        switch (_context6.prev = _context6.next) {
	          case 0:
	            g = undefined;
	            _context6.prev = 1;
	            _context6.next = 4;
	            return Globals.browser.loadGenome(genome);

	          case 4:
	            g = _context6.sent;
	            _context6.next = 10;
	            break;

	          case 7:
	            _context6.prev = 7;
	            _context6.t0 = _context6["catch"](1);
	            AlertSingleton$1.present(_context6.t0.message);

	          case 10:
	            if (g) {
	              EventBus.globalBus.post({
	                type: "DidChangeGenome",
	                data: {
	                  genomeID: g.id
	                }
	              });
	            }

	          case 11:
	          case "end":
	            return _context6.stop();
	        }
	      }
	    }, _callee6, null, [[1, 7]]);
	  }));
	  return _loadGenome.apply(this, arguments);
	}

	var $indexOf = arrayIncludes.indexOf;
	var nativeIndexOf = [].indexOf;
	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
	var STRICT_METHOD$1 = arrayMethodIsStrict('indexOf');
	var USES_TO_LENGTH$2 = arrayMethodUsesToLength('indexOf', {
	  ACCESSORS: true,
	  1: 0
	}); // `Array.prototype.indexOf` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.indexof

	_export({
	  target: 'Array',
	  proto: true,
	  forced: NEGATIVE_ZERO || !STRICT_METHOD$1 || !USES_TO_LENGTH$2
	}, {
	  indexOf: function indexOf(searchElement
	  /* , fromIndex = 0 */
	  ) {
	    return NEGATIVE_ZERO // convert -0 to +0
	    ? nativeIndexOf.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var min$2 = Math.min;
	var nativeLastIndexOf = [].lastIndexOf;
	var NEGATIVE_ZERO$1 = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
	var STRICT_METHOD$2 = arrayMethodIsStrict('lastIndexOf'); // For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method

	var USES_TO_LENGTH$3 = arrayMethodUsesToLength('indexOf', {
	  ACCESSORS: true,
	  1: 0
	});
	var FORCED$1 = NEGATIVE_ZERO$1 || !STRICT_METHOD$2 || !USES_TO_LENGTH$3; // `Array.prototype.lastIndexOf` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof

	var arrayLastIndexOf = FORCED$1 ? function lastIndexOf(searchElement
	/* , fromIndex = @[*-1] */
	) {
	  // convert -0 to +0
	  if (NEGATIVE_ZERO$1) return nativeLastIndexOf.apply(this, arguments) || 0;
	  var O = toIndexedObject(this);
	  var length = toLength(O.length);
	  var index = length - 1;
	  if (arguments.length > 1) index = min$2(index, toInteger(arguments[1]));
	  if (index < 0) index = length + index;

	  for (; index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;

	  return -1;
	} : nativeLastIndexOf;

	// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof

	_export({
	  target: 'Array',
	  proto: true,
	  forced: arrayLastIndexOf !== [].lastIndexOf
	}, {
	  lastIndexOf: arrayLastIndexOf
	});

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));else object[propertyKey] = value;
	};

	var SPECIES$4 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};

	    constructor[SPECIES$4] = function () {
	      return {
	        foo: 1
	      };
	    };

	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');
	var USES_TO_LENGTH$4 = arrayMethodUsesToLength('slice', {
	  ACCESSORS: true,
	  0: 0,
	  1: 2
	});
	var SPECIES$5 = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max$1 = Math.max; // `Array.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects

	_export({
	  target: 'Array',
	  proto: true,
	  forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$4
	}, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = toLength(O.length);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length); // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible

	    var Constructor, result, n;

	    if (isArray(O)) {
	      Constructor = O.constructor; // cross-realm fallback

	      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES$5];
	        if (Constructor === null) Constructor = undefined;
	      }

	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }

	    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));

	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);

	    result.length = n;
	    return result;
	  }
	});

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded'; // We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679

	var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});
	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};

	var FORCED$2 = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT; // `Array.prototype.concat` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species

	_export({
	  target: 'Array',
	  proto: true,
	  forced: FORCED$2
	}, {
	  concat: function concat(arg) {
	    // eslint-disable-line no-unused-vars
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;

	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];

	      if (isConcatSpreadable(E)) {
	        len = toLength(E.length);
	        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);

	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty(A, n++, E);
	      }
	    }

	    A.length = n;
	    return A;
	  }
	});

	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags


	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	// so we use an intermediate function.


	function RE(s, f) {
	  return RegExp(s, f);
	}

	var UNSUPPORTED_Y = fails(function () {
	  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	  var re = RE('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});
	var BROKEN_CARET = fails(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = RE('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});
	var regexpStickyHelpers = {
	  UNSUPPORTED_Y: UNSUPPORTED_Y,
	  BROKEN_CARET: BROKEN_CARET
	};

	var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.

	var nativeReplace = String.prototype.replace;
	var patchedExec = nativeExec;

	var UPDATES_LAST_INDEX_WRONG = function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	}();

	var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET; // nonparticipating capturing group, copied from es5-shim's String#split patch.

	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;
	    var sticky = UNSUPPORTED_Y$1 && re.sticky;
	    var flags = regexpFlags.call(re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = flags.replace('y', '');

	      if (flags.indexOf('g') === -1) {
	        flags += 'g';
	      }

	      strCopy = String(str).slice(re.lastIndex); // Support anchored sticky behavior.

	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      } // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.


	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }

	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
	    match = nativeExec.call(sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = match.input.slice(charsAdded);
	        match[0] = match[0].slice(charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }

	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var regexpExec = patchedExec;

	_export({
	  target: 'RegExp',
	  proto: true,
	  forced: /./.exec !== regexpExec
	}, {
	  exec: regexpExec
	});

	var SPECIES$6 = wellKnownSymbol('species');
	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;

	  re.exec = function () {
	    var result = [];
	    result.groups = {
	      a: '7'
	    };
	    return result;
	  };

	  return ''.replace(re, '$<a>') !== '7';
	}); // IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0

	var REPLACE_KEEPS_$0 = function () {
	  return 'a'.replace(/./, '$0') === '$0';
	}();

	var REPLACE = wellKnownSymbol('replace'); // Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string

	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function () {
	  if (/./[REPLACE]) {
	    return /./[REPLACE]('a', '$0') === '';
	  }

	  return false;
	}(); // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper


	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  var re = /(?:)/;
	  var originalExec = re.exec;

	  re.exec = function () {
	    return originalExec.apply(this, arguments);
	  };

	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
	  var SYMBOL = wellKnownSymbol(KEY);
	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};

	    O[SYMBOL] = function () {
	      return 7;
	    };

	    return ''[KEY](O) != 7;
	  });
	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {}; // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.

	      re.constructor = {};

	      re.constructor[SPECIES$6] = function () {
	        return re;
	      };

	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () {
	      execCalled = true;
	      return null;
	    };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === 'replace' && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0 && !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE) || KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      if (regexp.exec === regexpExec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return {
	            done: true,
	            value: nativeRegExpMethod.call(regexp, str, arg2)
	          };
	        }

	        return {
	          done: true,
	          value: nativeMethod.call(str, regexp, arg2)
	        };
	      }

	      return {
	        done: false
	      };
	    }, {
	      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
	      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    });
	    var stringMethod = methods[0];
	    var regexMethod = methods[1];
	    redefine(String.prototype, KEY, stringMethod);
	    redefine(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	    // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	    ? function (string, arg) {
	      return regexMethod.call(string, this, arg);
	    } // 21.2.5.6 RegExp.prototype[@@match](string)
	    // 21.2.5.9 RegExp.prototype[@@search](string)
	    : function (string) {
	      return regexMethod.call(string, this);
	    });
	  }

	  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
	};

	var createMethod$2 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$2(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$2(true)
	};

	var charAt = stringMultibyte.charAt; // `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex

	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt(S, index).length : 1);
	};

	// https://tc39.github.io/ecma262/#sec-regexpexec

	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;

	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);

	    if (typeof result !== 'object') {
	      throw TypeError('RegExp exec method returned something other than an Object or null');
	    }

	    return result;
	  }

	  if (classofRaw(R) !== 'RegExp') {
	    throw TypeError('RegExp#exec called on incompatible receiver');
	  }

	  return regexpExec.call(R, S);
	};

	var max$2 = Math.max;
	var min$3 = Math.min;
	var floor$1 = Math.floor;
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	}; // @@replace logic


	fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
	  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
	  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';
	  return [// `String.prototype.replace` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.replace
	  function replace(searchValue, replaceValue) {
	    var O = requireObjectCoercible(this);
	    var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
	    return replacer !== undefined ? replacer.call(searchValue, O, replaceValue) : nativeReplace.call(String(O), searchValue, replaceValue);
	  }, // `RegExp.prototype[@@replace]` method
	  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
	  function (regexp, replaceValue) {
	    if (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0 || typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1) {
	      var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
	      if (res.done) return res.value;
	    }

	    var rx = anObject(regexp);
	    var S = String(this);
	    var functionalReplace = typeof replaceValue === 'function';
	    if (!functionalReplace) replaceValue = String(replaceValue);
	    var global = rx.global;

	    if (global) {
	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	    }

	    var results = [];

	    while (true) {
	      var result = regexpExecAbstract(rx, S);
	      if (result === null) break;
	      results.push(result);
	      if (!global) break;
	      var matchStr = String(result[0]);
	      if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	    }

	    var accumulatedResult = '';
	    var nextSourcePosition = 0;

	    for (var i = 0; i < results.length; i++) {
	      result = results[i];
	      var matched = String(result[0]);
	      var position = max$2(min$3(toInteger(result.index), S.length), 0);
	      var captures = []; // NOTE: This is equivalent to
	      //   captures = result.slice(1).map(maybeToString)
	      // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	      // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	      // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.

	      for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));

	      var namedCaptures = result.groups;

	      if (functionalReplace) {
	        var replacerArgs = [matched].concat(captures, position, S);
	        if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
	        var replacement = String(replaceValue.apply(undefined, replacerArgs));
	      } else {
	        replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	      }

	      if (position >= nextSourcePosition) {
	        accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
	        nextSourcePosition = position + matched.length;
	      }
	    }

	    return accumulatedResult + S.slice(nextSourcePosition);
	  }]; // https://tc39.github.io/ecma262/#sec-getsubstitution

	  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
	    var tailPos = position + matched.length;
	    var m = captures.length;
	    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;

	    if (namedCaptures !== undefined) {
	      namedCaptures = toObject(namedCaptures);
	      symbols = SUBSTITUTION_SYMBOLS;
	    }

	    return nativeReplace.call(replacement, symbols, function (match, ch) {
	      var capture;

	      switch (ch.charAt(0)) {
	        case '$':
	          return '$';

	        case '&':
	          return matched;

	        case '`':
	          return str.slice(0, position);

	        case "'":
	          return str.slice(tailPos);

	        case '<':
	          capture = namedCaptures[ch.slice(1, -1)];
	          break;

	        default:
	          // \d\d?
	          var n = +ch;
	          if (n === 0) return match;

	          if (n > m) {
	            var f = floor$1(n / 10);
	            if (f === 0) return match;
	            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
	            return match;
	          }

	          capture = captures[n - 1];
	      }

	      return capture === undefined ? '' : capture;
	    });
	  }
	});

	var MATCH = wellKnownSymbol('match'); // `IsRegExp` abstract operation
	// https://tc39.github.io/ecma262/#sec-isregexp

	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	var notARegexp = function (it) {
	  if (isRegexp(it)) {
	    throw TypeError("The method doesn't accept regular expressions");
	  }

	  return it;
	};

	var MATCH$1 = wellKnownSymbol('match');

	var correctIsRegexpLogic = function (METHOD_NAME) {
	  var regexp = /./;

	  try {
	    '/./'[METHOD_NAME](regexp);
	  } catch (e) {
	    try {
	      regexp[MATCH$1] = false;
	      return '/./'[METHOD_NAME](regexp);
	    } catch (f) {
	      /* empty */
	    }
	  }

	  return false;
	};

	var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
	var nativeStartsWith = ''.startsWith;
	var min$4 = Math.min;
	var CORRECT_IS_REGEXP_LOGIC = correctIsRegexpLogic('startsWith'); // https://github.com/zloirock/core-js/pull/702

	var MDN_POLYFILL_BUG =  !CORRECT_IS_REGEXP_LOGIC && !!function () {
	  var descriptor = getOwnPropertyDescriptor$3(String.prototype, 'startsWith');
	  return descriptor && !descriptor.writable;
	}(); // `String.prototype.startsWith` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.startswith

	_export({
	  target: 'String',
	  proto: true,
	  forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC
	}, {
	  startsWith: function startsWith(searchString
	  /* , position = 0 */
	  ) {
	    var that = String(requireObjectCoercible(this));
	    notARegexp(searchString);
	    var index = toLength(min$4(arguments.length > 1 ? arguments[1] : undefined, that.length));
	    var search = String(searchString);
	    return nativeStartsWith ? nativeStartsWith.call(that, search, index) : that.slice(index, index + search.length) === search;
	  }
	});

	/*
	 *  The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
	 * associated documentation files (the "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
	 * following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all copies or substantial
	 * portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
	 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *
	 */
	function bitlyShortener(accessToken) {
	  if (!accessToken || accessToken === "BITLY_TOKEN") {
	    return undefined;
	  } else {
	    return /*#__PURE__*/function () {
	      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
	        var api, devIP, endpoint;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                api = "https://api-ssl.bitly.com/v3/shorten";
	                devIP = "192.168.1.11";

	                if (url.startsWith("http://localhost")) {
	                  url = url.replace("localhost", devIP);
	                } // Dev hack


	                endpoint = api + "?access_token=" + accessToken + "&longUrl=" + encodeURIComponent(url);
	                return _context.abrupt("return", igv.xhr.loadJson(endpoint, {}).then(function (json) {
	                  return json.data.url;
	                }));

	              case 5:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));

	      return function (_x) {
	        return _ref.apply(this, arguments);
	      };
	    }();
	  }
	}

	function googleShortener(apiKey) {
	  if (!apiKey || apiKey === "API_KEY") {
	    return undefined;
	  } else {
	    return /*#__PURE__*/function () {
	      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url) {
	        var api, endpoint;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                api = "https://www.googleapis.com/urlshortener/v1/url";
	                endpoint = api + "?key=" + apiKey;
	                return _context2.abrupt("return", igv.xhr.loadJson(endpoint, {
	                  sendData: JSON.stringify({
	                    "longUrl": url
	                  }),
	                  contentType: "application/json"
	                }).then(function (json) {
	                  return json.id;
	                }));

	              case 3:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));

	      return function (_x2) {
	        return _ref2.apply(this, arguments);
	      };
	    }();
	  }
	}

	function tinyURLShortener(_ref3) {
	  var endpoint = _ref3.endpoint;
	  endpoint = endpoint || "https://2et6uxfezb.execute-api.us-east-1.amazonaws.com/dev/tinyurl/";
	  return /*#__PURE__*/function () {
	    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(url) {
	      var enc, response;
	      return regeneratorRuntime.wrap(function _callee3$(_context3) {
	        while (1) {
	          switch (_context3.prev = _context3.next) {
	            case 0:
	              enc = encodeURIComponent(url);
	              _context3.next = 3;
	              return fetch("".concat(endpoint).concat(enc));

	            case 3:
	              response = _context3.sent;

	              if (!response.ok) {
	                _context3.next = 8;
	                break;
	              }

	              return _context3.abrupt("return", response.text());

	            case 8:
	              throw new Error(response.statusText);

	            case 9:
	            case "end":
	              return _context3.stop();
	          }
	        }
	      }, _callee3);
	    }));

	    return function (_x3) {
	      return _ref4.apply(this, arguments);
	    };
	  }();
	}

	var urlShortener;
	function setURLShortener(obj) {
	  var fn;

	  if (typeof obj === "function") {
	    fn = obj;
	  } else if (obj.provider) {
	    if ("tinyURL" === obj.provider) {
	      fn = tinyURLShortener(obj);
	    } else if ("bitly" === obj.provider && obj.apiKey) {
	      fn = bitlyShortener(obj.apiKey);
	    } else if ("google" === obj.provider && obj.apiKey) {
	      fn = googleShortener(obj.apiKey);
	    } else {
	      AlertSingleton$1.present("Unknown URL shortener provider: ".concat(obj.provider));
	    }
	  } else {
	    AlertSingleton$1.present("URL shortener object must either be an object specifying a provider and apiKey, or a function");
	  }

	  if (fn) {
	    urlShortener = {
	      shortenURL: fn
	    };
	  }

	  return fn;
	}
	function sessionURL() {
	  var surl, path, idx;
	  path = window.location.href.slice();
	  idx = path.indexOf("?");
	  surl = (idx > 0 ? path.substring(0, idx) : path) + "?sessionURL=blob:" + Globals.browser.compressedSession();
	  return surl;
	}
	function shortSessionURL(base, session) {
	  var url = base + "?sessionURL=blob:" + session;
	  return shortenURL(url);
	}

	function shortenURL(url) {
	  if (urlShortener) {
	    return urlShortener.shortenURL(url);
	  } else {
	    return Promise.resolve(url);
	  }
	}

	function createShareWidgets(_ref) {
	  var browser = _ref.browser,
	      $container = _ref.$container,
	      $modal = _ref.$modal,
	      $share_input = _ref.$share_input,
	      $copy_link_button = _ref.$copy_link_button,
	      $tweet_button_container = _ref.$tweet_button_container,
	      $email_button = _ref.$email_button,
	      $qrcode_button = _ref.$qrcode_button,
	      $qrcode_image = _ref.$qrcode_image,
	      $embed_container = _ref.$embed_container,
	      $embed_button = _ref.$embed_button,
	      embedTarget = _ref.embedTarget;

	  if (undefined === embedTarget) {
	    embedTarget = getEmbedTarget();
	  }

	  $modal.on('shown.bs.modal', /*#__PURE__*/function () {
	    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(e) {
	      var href, idx, session, snippet, shortURL, obj, qrcode, _obj;

	      return regeneratorRuntime.wrap(function _callee$(_context) {
	        while (1) {
	          switch (_context.prev = _context.next) {
	            case 0:
	              href = window.location.href.slice();
	              idx = href.indexOf("?");

	              if (idx > 0) {
	                href = href.substring(0, idx);
	              }

	              session = undefined;

	              try {
	                session = browser.compressedSession();
	              } catch (e) {
	                AlertSingleton$1.present(e.message);
	              }

	              if (!session) {
	                _context.next = 20;
	                break;
	              }

	              if (embedTarget) {
	                snippet = getEmbeddableSnippet($container, embedTarget, session);
	                $embed_container.find('textarea').val(snippet);
	                $embed_container.find('textarea').get(0).select();
	              }

	              _context.next = 9;
	              return shortSessionURL(href, session);

	            case 9:
	              shortURL = _context.sent;
	              $share_input.val(shortURL);
	              $share_input.get(0).select();
	              $email_button.attr('href', 'mailto:?body=' + shortURL); // QR code generation

	              $qrcode_image.empty();
	              obj = {
	                width: 128,
	                height: 128,
	                correctLevel: QRCode.CorrectLevel.H
	              };
	              qrcode = new QRCode($qrcode_image.get(0), obj);
	              qrcode.makeCode(shortURL);

	              if ($tweet_button_container) {
	                $tweet_button_container.empty();
	                _obj = {
	                  text: ''
	                };
	                window.twttr.widgets.createShareButton(shortURL, $tweet_button_container.get(0), _obj);
	              }

	              _context.next = 21;
	              break;

	            case 20:
	              $modal.modal('hide');

	            case 21:
	            case "end":
	              return _context.stop();
	          }
	        }
	      }, _callee);
	    }));

	    return function (_x) {
	      return _ref2.apply(this, arguments);
	    };
	  }());
	  $modal.on('hidden.bs.modal', function (e) {
	    $embed_container.hide();
	    $qrcode_image.hide();
	  });
	  $copy_link_button.on('click', function (e) {
	    $share_input.get(0).select();
	    var success = document.execCommand('copy');

	    if (success) {
	      $modal.modal('hide');
	    }
	  });

	  if (undefined === embedTarget) {
	    $embed_button.hide();
	  } else {
	    $embed_container.find('button').on('click', function (e) {
	      var success;
	      $embed_container.find('textarea').get(0).select();
	      success = document.execCommand('copy');

	      if (success) {
	        $modal.modal('hide');
	      }
	    });
	    $embed_button.on('click', function (e) {
	      $qrcode_image.hide();
	      $embed_container.toggle();
	    });
	  }

	  $qrcode_button.on('click', function (e) {
	    $embed_container.hide();
	    $qrcode_image.toggle();
	  });
	}

	function getEmbeddableSnippet($container, embedTarget, session) {
	  var embedUrl = embedTarget + "?sessionURL=blob:" + session;
	  var height = $container.height() + 50;
	  return '<iframe src="' + embedUrl + '" style="width:100%; height:' + height + 'px"  allowfullscreen></iframe>';
	}
	/**
	 * Get the default embed html target.  Assumes an "embed.html" file in same directory as this page
	 */


	function getEmbedTarget() {
	  var href = window.location.href.slice();
	  var idx = href.indexOf("?");

	  if (idx > 0) {
	    href = href.substring(0, idx);
	  }

	  idx = href.lastIndexOf("/");
	  return href.substring(0, idx) + "/embed.html";
	}

	function shareWidgetConfigurator(browser, $container, _ref3) {
	  var urlShortener = _ref3.urlShortener,
	      embedTarget = _ref3.embedTarget;
	  var urlShortenerFn;

	  if (urlShortener) {
	    urlShortenerFn = setURLShortener(urlShortener) !== undefined;
	  }

	  var $igv_app_tweet_button_container = $('#igv-app-tweet-button-container');

	  if (!urlShortenerFn) {
	    $igv_app_tweet_button_container.hide();
	  }

	  return {
	    browser: browser,
	    $container: $container,
	    $modal: $('#igv-app-share-modal'),
	    $share_input: $('#igv-app-share-input'),
	    $copy_link_button: $('#igv-app-copy-link-button'),
	    $tweet_button_container: urlShortenerFn ? $igv_app_tweet_button_container : undefined,
	    $email_button: $('#igv-app-email-button'),
	    $qrcode_button: $('#igv-app-qrcode-button'),
	    $qrcode_image: $('#igv-app-qrcode-image'),
	    $embed_container: $('#igv-app-embed-container'),
	    $embed_button: $('#igv-app-embed-button'),
	    embedTarget: embedTarget
	  };
	}

	var correctPrototypeGetter = !fails(function () {
	  function F() {
	    /* empty */
	  }

	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO$1 = sharedKey('IE_PROTO');
	var ObjectPrototype = Object.prototype; // `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof

	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];

	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  }

	  return O instanceof Object ? ObjectPrototype : null;
	};

	var ITERATOR$3 = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	var returnThis = function () {
	  return this;
	}; // `%IteratorPrototype%` object
	// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object


	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	if ([].keys) {
	  arrayIterator = [].keys(); // Safari 8 has buggy iterators w/o `next`

	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}

	if (IteratorPrototype == undefined) IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

	if ( !has(IteratorPrototype, ITERATOR$3)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR$3, returnThis);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

	var returnThis$1 = function () {
	  return this;
	};

	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, {
	    next: createPropertyDescriptor(1, next)
	  });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  }

	  return it;
	};

	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.

	/* eslint-disable no-proto */

	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;

	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) {
	    /* empty */
	  }

	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$4 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis$2 = function () {
	  return this;
	};

	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];

	    switch (KIND) {
	      case KEYS:
	        return function keys() {
	          return new IteratorConstructor(this, KIND);
	        };

	      case VALUES:
	        return function values() {
	          return new IteratorConstructor(this, KIND);
	        };

	      case ENTRIES:
	        return function entries() {
	          return new IteratorConstructor(this, KIND);
	        };
	    }

	    return function () {
	      return new IteratorConstructor(this);
	    };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$4] || IterablePrototype['@@iterator'] || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY; // fix native

	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));

	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$4] != 'function') {
	          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$4, returnThis$2);
	        }
	      } // Set @@toStringTag to native iterators


	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  } // fix Array#{values, @@iterator}.name in V8 / FF


	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;

	    defaultIterator = function values() {
	      return nativeIterator.call(this);
	    };
	  } // define iterator


	  if ( IterablePrototype[ITERATOR$4] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$4, defaultIterator);
	  }

	  iterators[NAME] = defaultIterator; // export additional methods

	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({
	      target: NAME,
	      proto: true,
	      forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME
	    }, methods);
	  }

	  return methods;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$1 = internalState.set;
	var getInternalState$1 = internalState.getterFor(ARRAY_ITERATOR); // `Array.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.github.io/ecma262/#sec-createarrayiterator

	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState$1(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated),
	    // target
	    index: 0,
	    // next index
	    kind: kind // kind

	  }); // `%ArrayIteratorPrototype%.next` method
	  // https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState$1(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;

	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return {
	      value: undefined,
	      done: true
	    };
	  }

	  if (kind == 'keys') return {
	    value: index,
	    done: false
	  };
	  if (kind == 'values') return {
	    value: target[index],
	    done: false
	  };
	  return {
	    value: [index, target[index]],
	    done: false
	  };
	}, 'values'); // argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject

	iterators.Arguments = iterators.Array; // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	var freezing = !fails(function () {
	  return Object.isExtensible(Object.preventExtensions({}));
	});

	var internalMetadata = createCommonjsModule(function (module) {
	  var defineProperty = objectDefineProperty.f;
	  var METADATA = uid('meta');
	  var id = 0;

	  var isExtensible = Object.isExtensible || function () {
	    return true;
	  };

	  var setMetadata = function (it) {
	    defineProperty(it, METADATA, {
	      value: {
	        objectID: 'O' + ++id,
	        // object ID
	        weakData: {} // weak collections IDs

	      }
	    });
	  };

	  var fastKey = function (it, create) {
	    // return a primitive with prefix
	    if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

	    if (!has(it, METADATA)) {
	      // can't set metadata to uncaught frozen object
	      if (!isExtensible(it)) return 'F'; // not necessary to add metadata

	      if (!create) return 'E'; // add missing metadata

	      setMetadata(it); // return object ID
	    }

	    return it[METADATA].objectID;
	  };

	  var getWeakData = function (it, create) {
	    if (!has(it, METADATA)) {
	      // can't set metadata to uncaught frozen object
	      if (!isExtensible(it)) return true; // not necessary to add metadata

	      if (!create) return false; // add missing metadata

	      setMetadata(it); // return the store of weak collections IDs
	    }

	    return it[METADATA].weakData;
	  }; // add metadata on freeze-family methods calling


	  var onFreeze = function (it) {
	    if (freezing && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
	    return it;
	  };

	  var meta = module.exports = {
	    REQUIRED: false,
	    fastKey: fastKey,
	    getWeakData: getWeakData,
	    onFreeze: onFreeze
	  };
	  hiddenKeys[METADATA] = true;
	});
	var internalMetadata_1 = internalMetadata.REQUIRED;
	var internalMetadata_2 = internalMetadata.fastKey;
	var internalMetadata_3 = internalMetadata.getWeakData;
	var internalMetadata_4 = internalMetadata.onFreeze;

	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if ( // it can work only with native `setPrototypeOf`
	  objectSetPrototypeOf && // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	  typeof (NewTarget = dummy.constructor) == 'function' && NewTarget !== Wrapper && isObject(NewTargetPrototype = NewTarget.prototype) && NewTargetPrototype !== Wrapper.prototype) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = global_1[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var Constructor = NativeConstructor;
	  var exported = {};

	  var fixMethod = function (KEY) {
	    var nativeMethod = NativePrototype[KEY];
	    redefine(NativePrototype, KEY, KEY == 'add' ? function add(value) {
	      nativeMethod.call(this, value === 0 ? 0 : value);
	      return this;
	    } : KEY == 'delete' ? function (key) {
	      return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	    } : KEY == 'get' ? function get(key) {
	      return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
	    } : KEY == 'has' ? function has(key) {
	      return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	    } : function set(key, value) {
	      nativeMethod.call(this, key === 0 ? 0 : key, value);
	      return this;
	    });
	  }; // eslint-disable-next-line max-len


	  if (isForced_1(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
	    new NativeConstructor().entries().next();
	  })))) {
	    // create collection constructor
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    internalMetadata.REQUIRED = true;
	  } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
	    var instance = new Constructor(); // early implementations not supports chaining

	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance; // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false

	    var THROWS_ON_PRIMITIVES = fails(function () {
	      instance.has(1);
	    }); // most early implementations doesn't supports iterables, most modern - not close it correctly
	    // eslint-disable-next-line no-new

	    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) {
	      new NativeConstructor(iterable);
	    }); // for early implementations -0 and +0 not the same

	    var BUGGY_ZERO = !IS_WEAK && fails(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new NativeConstructor();
	      var index = 5;

	      while (index--) $instance[ADDER](index, index);

	      return !$instance.has(-0);
	    });

	    if (!ACCEPT_ITERABLES) {
	      Constructor = wrapper(function (dummy, iterable) {
	        anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
	        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
	        if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	        return that;
	      });
	      Constructor.prototype = NativePrototype;
	      NativePrototype.constructor = Constructor;
	    }

	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }

	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER); // weak collections should not contains .clear method

	    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
	  }

	  exported[CONSTRUCTOR_NAME] = Constructor;
	  _export({
	    global: true,
	    forced: Constructor != NativeConstructor
	  }, exported);
	  setToStringTag(Constructor, CONSTRUCTOR_NAME);
	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);
	  return Constructor;
	};

	var defineProperty$3 = objectDefineProperty.f;
	var fastKey = internalMetadata.fastKey;
	var setInternalState$2 = internalState.set;
	var internalStateGetterFor = internalState.getterFor;
	var collectionStrong = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, CONSTRUCTOR_NAME);
	      setInternalState$2(that, {
	        type: CONSTRUCTOR_NAME,
	        index: objectCreate(null),
	        first: undefined,
	        last: undefined,
	        size: 0
	      });
	      if (!descriptors) that.size = 0;
	      if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	    });
	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var entry = getEntry(that, key);
	      var previous, index; // change existing entry

	      if (entry) {
	        entry.value = value; // create new entry
	      } else {
	        state.last = entry = {
	          index: index = fastKey(key, true),
	          key: key,
	          value: value,
	          previous: previous = state.last,
	          next: undefined,
	          removed: false
	        };
	        if (!state.first) state.first = entry;
	        if (previous) previous.next = entry;
	        if (descriptors) state.size++;else that.size++; // add to index

	        if (index !== 'F') state.index[index] = entry;
	      }

	      return that;
	    };

	    var getEntry = function (that, key) {
	      var state = getInternalState(that); // fast case

	      var index = fastKey(key);
	      var entry;
	      if (index !== 'F') return state.index[index]; // frozen object case

	      for (entry = state.first; entry; entry = entry.next) {
	        if (entry.key == key) return entry;
	      }
	    };

	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear() {
	        var that = this;
	        var state = getInternalState(that);
	        var data = state.index;
	        var entry = state.first;

	        while (entry) {
	          entry.removed = true;
	          if (entry.previous) entry.previous = entry.previous.next = undefined;
	          delete data[entry.index];
	          entry = entry.next;
	        }

	        state.first = state.last = undefined;
	        if (descriptors) state.size = 0;else that.size = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function (key) {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = getEntry(that, key);

	        if (entry) {
	          var next = entry.next;
	          var prev = entry.previous;
	          delete state.index[entry.index];
	          entry.removed = true;
	          if (prev) prev.next = next;
	          if (next) next.previous = prev;
	          if (state.first == entry) state.first = next;
	          if (state.last == entry) state.last = prev;
	          if (descriptors) state.size--;else that.size--;
	        }

	        return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn
	      /* , that = undefined */
	      ) {
	        var state = getInternalState(this);
	        var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
	        var entry;

	        while (entry = entry ? entry.next : state.first) {
	          boundFunction(entry.value, entry.key, this); // revert to the last existing entry

	          while (entry && entry.removed) entry = entry.previous;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });
	    redefineAll(C.prototype, IS_MAP ? {
	      // 23.1.3.6 Map.prototype.get(key)
	      get: function get(key) {
	        var entry = getEntry(this, key);
	        return entry && entry.value;
	      },
	      // 23.1.3.9 Map.prototype.set(key, value)
	      set: function set(key, value) {
	        return define(this, key === 0 ? 0 : key, value);
	      }
	    } : {
	      // 23.2.3.1 Set.prototype.add(value)
	      add: function add(value) {
	        return define(this, value = value === 0 ? 0 : value, value);
	      }
	    });
	    if (descriptors) defineProperty$3(C.prototype, 'size', {
	      get: function () {
	        return getInternalState(this).size;
	      }
	    });
	    return C;
	  },
	  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
	    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
	    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
	    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME); // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11

	    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
	      setInternalState$2(this, {
	        type: ITERATOR_NAME,
	        target: iterated,
	        state: getInternalCollectionState(iterated),
	        kind: kind,
	        last: undefined
	      });
	    }, function () {
	      var state = getInternalIteratorState(this);
	      var kind = state.kind;
	      var entry = state.last; // revert to the last existing entry

	      while (entry && entry.removed) entry = entry.previous; // get next entry


	      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
	        // or finish the iteration
	        state.target = undefined;
	        return {
	          value: undefined,
	          done: true
	        };
	      } // return step by kind


	      if (kind == 'keys') return {
	        value: entry.key,
	        done: false
	      };
	      if (kind == 'values') return {
	        value: entry.value,
	        done: false
	      };
	      return {
	        value: [entry.key, entry.value],
	        done: false
	      };
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true); // add [@@species], 23.1.2.2, 23.2.2.2

	    setSpecies(CONSTRUCTOR_NAME);
	  }
	};

	// https://tc39.github.io/ecma262/#sec-set-objects


	var es_set = collection('Set', function (init) {
	  return function Set() {
	    return init(this, arguments.length ? arguments[0] : undefined);
	  };
	}, collectionStrong);

	var charAt$1 = stringMultibyte.charAt;
	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$3 = internalState.set;
	var getInternalState$2 = internalState.getterFor(STRING_ITERATOR); // `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator

	defineIterator(String, 'String', function (iterated) {
	  setInternalState$3(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  }); // `%StringIteratorPrototype%.next` method
	  // https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$2(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return {
	    value: undefined,
	    done: true
	  };
	  point = charAt$1(string, index);
	  state.index += point.length;
	  return {
	    value: point,
	    done: false
	  };
	});

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;

	  if (CollectionPrototype) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype[ITERATOR$5] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype, ITERATOR$5, ArrayValues);
	    } catch (error) {
	      CollectionPrototype[ITERATOR$5] = ArrayValues;
	    }

	    if (!CollectionPrototype[TO_STRING_TAG$3]) {
	      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$3, COLLECTION_NAME);
	    }

	    if (domIterables[COLLECTION_NAME]) for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      }
	    }
	  }
	}

	/*
	 *  The MIT License (MIT)
	 *
	 * Copyright (c) 2016-2017 The Regents of the University of California
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
	 * associated documentation files (the "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
	 * following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all copies or substantial
	 * portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
	 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *
	 */
	function createSVGWidget(_ref) {
	  var browser = _ref.browser,
	      $saveModal = _ref.$saveModal;
	  var input_default_value = 'igv-app.svg';
	  var $input = $saveModal.find('input');
	  $saveModal.on('show.bs.modal', function (e) {
	    $input.val(input_default_value);
	  });
	  $saveModal.on('hidden.bs.modal', function (e) {
	    $input.val(input_default_value);
	  });

	  var okHandler = function okHandler() {
	    var fn = $input.val();
	    var extensions = new Set(['svg']);

	    if (undefined === fn || '' === fn) {
	      fn = $input.attr('placeholder');
	    } else if (false === extensions.has(igv.getExtension({
	      url: fn
	    }))) {
	      fn = fn + '.svg';
	    } // dismiss modal


	    $saveModal.modal('hide');
	    browser.saveSVGtoFile({
	      filename: fn
	    });
	  }; // ok - button


	  var $ok = $saveModal.find('.modal-footer button:nth-child(2)');
	  $ok.on('click', okHandler);
	  $input.on('keyup', function (e) {
	    if (13 === e.keyCode) {
	      okHandler();
	    }
	  }); // upper dismiss - x - button

	  var $dismiss = $saveModal.find('.modal-header button:nth-child(1)');
	  $dismiss.on('click', function () {
	    $saveModal.modal('hide');
	  }); // lower dismiss - close - button

	  $dismiss = $saveModal.find('.modal-footer button:nth-child(1)');
	  $dismiss.on('click', function () {
	    $saveModal.modal('hide');
	  });
	}

	var _version = "1.3.0";

	function version$1() {
	  return _version;
	}

	$(document).ready( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
	  return regeneratorRuntime.wrap(function _callee$(_context) {
	    while (1) {
	      switch (_context.prev = _context.next) {
	        case 0:
	          return _context.abrupt("return", main($('#igv-app-container'), igvwebConfig));

	        case 1:
	        case "end":
	          return _context.stop();
	      }
	    }
	  }, _callee);
	})));
	var googleEnabled = false; // For development with igv.js (1) comment out the script include of igv.min.js in index.html, (2) uncomment the 2 lines below
	// import igv from '../node_modules/igv/dist/igv.js'
	// import igv from '../node_modules/igv/dist/igv.esm.js'
	// window.igv = igv;

	function main(_x, _x2) {
	  return _main.apply(this, arguments);
	}

	function _main() {
	  _main = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2($container, config) {
	    var enableGoogle, tmp, browser;
	    return regeneratorRuntime.wrap(function _callee2$(_context2) {
	      while (1) {
	        switch (_context2.prev = _context2.next) {
	          case 0:
	            AlertSingleton$1.init($container.get(0));
	            $('#igv-app-version').text("IGV-Web app version ".concat(version$1()));
	            $('#igv-igvjs-version').text("igv.js version ".concat(igv.version()));
	            enableGoogle = (config.clientId || config.apiKey) && (window.location.protocol === "https:" || window.location.host === "localhost");

	            if (!enableGoogle) {
	              _context2.next = 15;
	              break;
	            }

	            _context2.prev = 5;
	            _context2.next = 8;
	            return init({
	              client_id: config.clientId,
	              apiKey: config.apiKey,
	              scope: 'https://www.googleapis.com/auth/userinfo.profile'
	            });

	          case 8:
	            googleEnabled = true;
	            _context2.next = 15;
	            break;

	          case 11:
	            _context2.prev = 11;
	            _context2.t0 = _context2["catch"](5);
	            console.error(_context2.t0);
	            AlertSingleton$1.present(_context2.t0.message);

	          case 15:
	            if (!config.genomes) {
	              _context2.next = 21;
	              break;
	            }

	            _context2.next = 18;
	            return getGenomesArray(config.genomes);

	          case 18:
	            tmp = _context2.sent;
	            config.genomes = tmp;
	            config.igvConfig.genomes = tmp;

	          case 21:
	            _context2.next = 23;
	            return igv.createBrowser($container.get(0), config.igvConfig);

	          case 23:
	            browser = _context2.sent;

	            if (!browser) {
	              _context2.next = 28;
	              break;
	            }

	            Globals.browser = browser;
	            _context2.next = 28;
	            return initializationHelper(browser, $container, config);

	          case 28:
	          case "end":
	            return _context2.stop();
	        }
	      }
	    }, _callee2, null, [[5, 11]]);
	  }));
	  return _main.apply(this, arguments);
	}

	function initializationHelper(_x3, _x4, _x5) {
	  return _initializationHelper.apply(this, arguments);
	}

	function _initializationHelper() {
	  _initializationHelper = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(browser, $container, options) {
	    var $main;
	    return regeneratorRuntime.wrap(function _callee5$(_context5) {
	      while (1) {
	        switch (_context5.prev = _context5.next) {
	          case 0:
	            ['track', 'genome'].forEach(function (str) {
	              var imgElement;
	              imgElement = document.querySelector("img#igv-app-".concat(str, "-dropbox-button-image"));
	              imgElement.src = "data:image/svg+xml;base64,".concat(dropboxButtonImageBase64());
	              imgElement = document.querySelector("img#igv-app-".concat(str, "-google-drive-button-image"));
	              imgElement.src = "data:image/svg+xml;base64,".concat(googleDriveButtonImageBase64());
	            }); // Session - Dropbox and Google Drive buttons

	            $('div#igv-session-dropdown-menu > :nth-child(1)').after(dropboxDropdownItem('igv-app-dropdown-dropbox-session-file-button'));
	            $('div#igv-session-dropdown-menu > :nth-child(2)').after(googleDriveDropdownItem('igv-app-dropdown-google-drive-session-file-button'));
	            creatGenomeWidgets(genomeWidgetConfigurator(googleEnabled));
	            _context5.next = 6;
	            return initializeGenomeWidgets(browser, options.genomes, $('#igv-app-genome-dropdown-menu'));

	          case 6:
	            $main = $('#igv-main');
	            createTrackWidgetsWithTrackRegistry($main, $('#igv-app-track-dropdown-menu'), $('#igv-app-dropdown-local-track-file-input'), $('#igv-app-dropdown-dropbox-track-file-button'), googleEnabled, $('#igv-app-dropdown-google-drive-track-file-button'), ['igv-app-encode-signal-modal', 'igv-app-encode-others-modal'], 'igv-app-track-from-url-modal', 'igv-app-track-select-modal', igv.GtexUtils, options.trackRegistryFile, /*#__PURE__*/function () {
	              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(configurations) {
	                return regeneratorRuntime.wrap(function _callee3$(_context3) {
	                  while (1) {
	                    switch (_context3.prev = _context3.next) {
	                      case 0:
	                        _context3.next = 2;
	                        return browser.loadTrackList(configurations);

	                      case 2:
	                        return _context3.abrupt("return", _context3.sent);

	                      case 3:
	                      case "end":
	                        return _context3.stop();
	                    }
	                  }
	                }, _callee3);
	              }));

	              return function (_x7) {
	                return _ref2.apply(this, arguments);
	              };
	            }());
	            $('#igv-app-session-save-button').on('click', function () {
	              var json = undefined;

	              try {
	                json = browser.toJSON();
	              } catch (e) {
	                AlertSingleton$1.present(e.message);
	              }

	              if (json) {
	                $('#igv-app-session-save-modal').modal('show');
	              }
	            });
	            createSessionWidgets($main, igv.xhr, 'igv-webapp', 'igv-app-dropdown-local-session-file-input', 'igv-app-dropdown-dropbox-session-file-button', 'igv-app-dropdown-google-drive-session-file-button', 'igv-app-session-url-modal', 'igv-app-session-save-modal', googleEnabled, /*#__PURE__*/function () {
	              var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(config) {
	                return regeneratorRuntime.wrap(function _callee4$(_context4) {
	                  while (1) {
	                    switch (_context4.prev = _context4.next) {
	                      case 0:
	                        _context4.next = 2;
	                        return browser.loadSession(config);

	                      case 2:
	                      case "end":
	                        return _context4.stop();
	                    }
	                  }
	                }, _callee4);
	              }));

	              return function (_x8) {
	                return _ref3.apply(this, arguments);
	              };
	            }(), function () {
	              return browser.toJSON();
	            });
	            createSVGWidget({
	              browser: browser,
	              $saveModal: $('#igv-app-svg-save-modal')
	            });
	            createShareWidgets(shareWidgetConfigurator(browser, $container, options));
	            createAppBookmarkHandler($('#igv-app-bookmark-button'));
	            EventBus.globalBus.post({
	              type: "DidChangeGenome",
	              data: {
	                genomeID: browser.genome.id
	              }
	            });

	          case 14:
	          case "end":
	            return _context5.stop();
	        }
	      }
	    }, _callee5);
	  }));
	  return _initializationHelper.apply(this, arguments);
	}

	function createAppBookmarkHandler($bookmark_button) {
	  $bookmark_button.on('click', function (e) {
	    var url = undefined;

	    try {
	      url = sessionURL();
	    } catch (e) {
	      AlertSingleton$1.present(e.message);
	    }

	    if (url) {
	      window.history.pushState({}, "IGV", url);
	      var str = /Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl';
	      var blurb = 'A bookmark URL has been created. Press ' + str + '+D to save.';
	      alert(blurb);
	    }
	  });
	}

	function getGenomesArray(_x6) {
	  return _getGenomesArray.apply(this, arguments);
	}

	function _getGenomesArray() {
	  _getGenomesArray = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(genomes) {
	    var response;
	    return regeneratorRuntime.wrap(function _callee6$(_context6) {
	      while (1) {
	        switch (_context6.prev = _context6.next) {
	          case 0:
	            if (!(undefined === genomes)) {
	              _context6.next = 2;
	              break;
	            }

	            return _context6.abrupt("return", undefined);

	          case 2:
	            if (!Array.isArray(genomes)) {
	              _context6.next = 6;
	              break;
	            }

	            return _context6.abrupt("return", genomes);

	          case 6:
	            response = undefined;
	            _context6.prev = 7;
	            _context6.next = 10;
	            return fetch(genomes);

	          case 10:
	            response = _context6.sent;
	            return _context6.abrupt("return", response.json());

	          case 14:
	            _context6.prev = 14;
	            _context6.t0 = _context6["catch"](7);
	            AlertSingleton$1.present(_context6.t0.message);

	          case 17:
	          case "end":
	            return _context6.stop();
	        }
	      }
	    }, _callee6, null, [[7, 14]]);
	  }));
	  return _getGenomesArray.apply(this, arguments);
	}

	exports.main = main;

	Object.defineProperty(exports, '__esModule', { value: true });

})));

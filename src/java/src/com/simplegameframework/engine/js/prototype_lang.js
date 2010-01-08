/**
 * Adds setTimeout, clearTimeout, setInterval, and clearInterval onto the
 * global context. This is a Rhino-specific script that invokes the native
 * Java classes java.lang.Thread and java.lang.Runnable.
 *
 * Also, it is always recommended, for Rhino at least, to pass a function
 * reference to the 'fn' parameter, rather than a String of Javascript.
 * Though passing a String is supported through the use of 'eval', 'eval'
 * is an expensive call in Rhino, since the String must first be compiled.
 */
(function() {
    var timers = [];

    setInterval = function(fn, time) {
        var num = timers.length;
        // Default to 1 second if no time supplied
        time = time || 1000;
        timers[num] = new java.lang.Thread(new java.lang.Runnable({
            run: function() {
                while (true) {
                    java.lang.Thread.currentThread().sleep(time);
                    typeof fn == "function" ? fn() : eval(fn);
                }
            }
        }));

        timers[num].start();

        return num;
    };

    setTimeout = function(fn, time) {
        // Deafult to run instantly if no time specified
        time = time || 0;
        return num = setInterval(function() {
            typeof fn == "function" ? fn() : eval(fn);
            clearInterval(num);
        }, time);
    };

    clearInterval = function(num) {
        if ( timers[num] ) {
            timers[num].stop();
            delete timers[num];
        }
    };
})();
var Prototype = {
  Version: '1.6.1',

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x; }
};
/**
 * == Language ==
 * Additions to JavaScript's "standard library" and extensions to
 * built-in JavaScript objects.
**/

var Abstract = { };

/** section: Language
 * Try
**/

/**
 *  Try.these(function...) -> ?
 *  - function (Function): A function that may throw an exception.
 *
 *  Accepts an arbitrary number of functions and returns the result of the
 *  first one that doesn't throw an error.
 **/
var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

/** section: Language
 * class Object
 *
 *  Extensions to the built-in `Object` object.
 *
 *  Because it is dangerous and invasive to augment `Object.prototype` (i.e.,
 *  add instance methods to objects), all these methods are static methods that
 *  take an `Object` as their first parameter.
 *
**/
(function() {

  var _toString = Object.prototype.toString;

  /**
   *  Object.extend(destination, source) -> Object
   *  - destination (Object): The object to receive the new properties.
   *  - source (Object): The object whose properties will be duplicated.
   *
   *  Copies all properties from the source to the destination object. Returns
   *  the destination object.
  **/
  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  /**
   *  Object.inspect(object) -> String
   *  - object (Object): The item to be inspected.
   *
   *  Returns the debug-oriented string representation of the object.
   *
   *  `undefined` and `null` are represented as such.
   *
   *  Other types are checked for a `inspect` method. If there is one, it is
   *  used; otherwise, it reverts to the `toString` method.
   *
   *  Prototype provides `inspect` methods for many types, both built-in and
   *  library-defined &mdash; among them `String`, `Array`, `Enumerable` and `Hash`.
   *  These attempt to provide useful string representations (from a
   *  developer's standpoint) for their respective types.
  **/
  function inspect(object) {
    try {
      if (isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  }

  /**
   *  Object.toJSON(object) -> String
   *  - object (Object): The object to be serialized.
   *
   *  Returns a JSON string.
   *
   *  `undefined` and `function` types have no JSON representation. `boolean`
   *  and `null` are coerced to strings.
   *
   *  For other types, `Object.toJSON` looks for a `toJSON` method on `object`.
   *  If there is one, it is used; otherwise the object is treated like a
   *  generic `Object`.
  **/
  function toJSON(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = toJSON(object[property]);
      if (!isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  }

  /**
   *  Object.toQueryString(object) -> String
   *  object (Object): The object whose property/value pairs will be converted.
   *
   *  Turns an object into its URL-encoded query string representation.
   *
   *  This is a form of serialization, and is mostly useful to provide complex
   *  parameter sets for stuff such as objects in the Ajax namespace (e.g.
   *  [[Ajax.Request]]).
   *
   *  Undefined-value pairs will be serialized as if empty-valued. Array-valued
   *  pairs will get serialized with one name/value pair per array element. All
   *  values get URI-encoded using JavaScript's native `encodeURIComponent`
   *  function.
   *
   *  The order of pairs in the serialized form is not guaranteed (and mostly
   *  irrelevant anyway) &mdash; except for array-based parts, which are serialized
   *  in array order.
  **/
  function toQueryString(object) {
    return $H(object).toQueryString();
  }

  /**
   *  Object.toHTML(object) -> String
   *  - object (Object): The object to convert to HTML.
   *
   *  Converts the object to its HTML representation.
   *
   *  Returns the return value of `object`'s `toHTML` method if it exists; else
   *  runs `object` through [[String.interpret]].
  **/
  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  }

  /**
   *  Object.keys(object) -> Array
   *  - object (Object): The object to pull keys from.
   *
   *  Returns an array of the object's property names.
   *
   *  Note that the order of the resulting array is browser-dependent &mdash; it
   *  relies on the `for&#8230;in` loop, for which the ECMAScript spec does not
   *  prescribe an enumeration order. Sort the resulting array if you wish to
   *  normalize the order of the object keys.
  **/
  function keys(object) {
    var results = [];
    for (var property in object)
      results.push(property);
    return results;
  }

  /**
   *  Object.values(object) -> Array
   *  - object (Object): The object to pull values from.
   *
   *  Returns an array of the object's values.
   *
   *  Note that the order of the resulting array is browser-dependent &mdash; it
   *  relies on the `for&#8230;in` loop, for which the ECMAScript spec does not
   *  prescribe an enumeration order.
   *
   *  Also, remember that while property _names_ are unique, property _values_
   *  have no such constraint.
  **/
  function values(object) {
    var results = [];
    for (var property in object)
      results.push(object[property]);
    return results;
  }

  /**
   *  Object.clone(object) -> Object
   *  - object (Object): The object to clone.
   *
   *  Creates and returns a shallow duplicate of the passed object by copying
   *  all of the original's key/value pairs onto an empty object.
   *
   *  Do note that this is a _shallow_ copy, not a _deep_ copy. Nested objects
   *  will retain their references.
   *
   *  <h5>Examples</h5>
   *
   *      var original = {name: 'primaryColors', values: ['red', 'green', 'blue']};
   *      var copy = Object.clone(original);
   *      original.name;
   *      // -> "primaryColors"
   *      original.values[0];
   *      // -> "red"
   *      copy.name;
   *      // -> "primaryColors"
   *      copy.name = "secondaryColors";
   *      original.name;
   *      // -> "primaryColors"
   *      copy.name;
   *      // -> "secondaryColors"
   *      copy.values[0] = 'magenta';
   *      copy.values[1] = 'cyan';
   *      copy.values[2] = 'yellow';
   *      original.values[0];
   *      // -> "magenta" (it was a shallow copy, so they shared the array)
  **/
  function clone(object) {
    return extend({ }, object);
  }

  /**
   *  Object.isElement(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is a DOM node of type 1; `false` otherwise.
  **/
  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  /**
   *  Object.isArray(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is an array; false otherwise.
  **/
  function isArray(object) {
    return _toString.call(object) == "[object Array]";
  }
  
  var hasNativeIsArray = (typeof Array.isArray == 'function') 
    && Array.isArray([]) && !Array.isArray({});
  
  if (hasNativeIsArray) {
    isArray = Array.isArray;
  }

  /**
   *  Object.isHash(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is an instance of the [[Hash]] class; `false`
   *  otherwise.
  **/
  function isHash(object) {
    return object instanceof Hash;
  }

  /**
   *  Object.isFunction(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type `function`; `false` otherwise.
  **/
  function isFunction(object) {
    return typeof object === "function";
  }

  /**
   *  Object.isString(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type `string`; `false` otherwise.
  **/
  function isString(object) {
    return _toString.call(object) == "[object String]";
  }

  /**
   *  Object.isNumber(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type `number`; `false` otherwise.
  **/
  function isNumber(object) {
    return _toString.call(object) == "[object Number]";
  }

  /**
   *  Object.isUndefined(object) -> Boolean
   *  - object (Object): The object to test.
   *
   *  Returns `true` if `object` is of type `string`; `false` otherwise.
  **/
  function isUndefined(object) {
    return typeof object === "undefined";
  }

  extend(Object, {
    extend:        extend,
    inspect:       inspect,
    toJSON:        toJSON,
    toQueryString: toQueryString,
    toHTML:        toHTML,
    keys:          keys,
    values:        values,
    clone:         clone,
    isElement:     isElement,
    isArray:       isArray,
    isHash:        isHash,
    isFunction:    isFunction,
    isString:      isString,
    isNumber:      isNumber,
    isUndefined:   isUndefined
  });
})();
/** section: Language
 * mixin Enumerable
 *
 *  `Enumerable` provides a large set of useful methods for enumerations &mdash;
 *  objects that act as collections of values. It is a cornerstone of
 *  Prototype.
 *
 *  `Enumerable` is a _mixin_: a set of methods intended not for standaone
 *  use, but for incorporation into other objects.
 *
 *  Prototype mixes `Enumerable` into several classes. The most visible cases
 *  are [[Array]] and [[Hash]], but you'll find it in less obvious spots as
 *  well, such as in [[ObjectRange]] and various DOM- or Ajax-related objects.
 *
 *  <h5>The <code>context</code> parameter</h5>
 *
 *  Every method of `Enumerable` that takes an iterator also takes the "context
 *  object" as the next (optional) parameter. The context object is what the
 *  iterator will be _bound_ to &mdash; what the keyword `this` will refer to inside
 *  the iterator.
 *
 *      var myObject = {};
 *
 *      ['foo', 'bar', 'baz'].each(function(name, index) {
 *        this[name] = index;
 *      }, myObject); // we have specified the context
 *
 *      myObject;
 *      // -> { foo: 0, bar: 1, baz: 2}
 *
 *  If there is no `context` argument, the iterator function will execute in
 *  the scope from which the `Enumerable` method itself was called.
 *
 *  <h5>Mixing <code>Enumerable</code> into your own objects</h5>
 *
 *  So, let's say you've created your very own collection-like object (say,
 *  some sort of Set, or perhaps something that dynamically fetches data
 *  ranges from the server side, lazy-loading style). You want to be able to
 *  mix `Enumerable` in (and we commend you for it). How do you go about this?
 *
 *  The Enumerable module basically makes only one requirement on your object:
 *  it must provide a method named `_each` (note the leading underscore) that
 *  will accept a function as its unique argument, and will contain the actual
 *  "raw iteration" algorithm, invoking its argument with each element in turn.
 *
 *  As detailed in the documentation for [[Enumerable#each]], `Enumerable`
 *  provides all the extra layers (handling iteration short-circuits, passing
 *  numeric indices, etc.). You just need to implement the actual iteration,
 *  as fits your internal structure.
 *
 *  If you're still confused, just have a look at the Prototype source code for
 *  [[Array]], [[Hash]], or [[ObjectRange]]. They all begin with their own
 *  `_each` method, which should help you grasp the idea.
 *
 *  Once you're done with this, you just need to mix `Enumerable` in, which
 *  you'll usually do before defining your methods, so as to make sure whatever
 *  overrides you provide for `Enumerable` methods will indeed prevail. In
 *  short, your code will probably end up looking like this:
 *
 *
 *      var YourObject = Class.create(Enumerable, {
 *        initialize: function() { // with whatever constructor arguments you need
 *          // Your construction code
 *        },
 *
 *        _each: function(iterator) {
 *          // Your iteration code, invoking iterator at every turn
 *        },
 *
 *        // Your other methods here, including Enumerable overrides
 *      });
 *
 *  Then, obviously, your object can be used like this:
 *
 *      var obj = new YourObject();
 *      // Populate the collection somehow
 *      obj.pluck('somePropName');
 *      obj.invoke('someMethodName');
 *      obj.size();
 *      // etc.
 *
**/

var $break = { };

var Enumerable = (function() {
  /**
   *  Enumerable#each(iterator[, context]) -> Enumerable
   *  - iterator (Function): A `Function` that expects an item in the
   *    collection as the first argument and a numerical index as the second.
   *  - context (Object): The scope in which to call `iterator`. Affects what
   *    the keyword `this` means inside `iterator`.
   *
   *  Calls `iterator` for each item in the collection.
   *
   *  <h5>Examples</h5>
   *
   *      ['one', 'two', 'three'].each(alert);
   *      // Alerts "one", then alerts "two", then alerts "three"
   *
   *  <h5>Built-In Variants</h5>
   *
   *  Most of the common use cases for `each` are already available pre-coded
   *  as other methods on `Enumerable`. Whether you want to find the first
   *  matching item in an enumeration, or transform it, or determine whether it
   *  has any (or all) values matching a particular condition, `Enumerable`
   *  has a method to do that for you.
  **/
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  }

  /**
   *  Enumerable#eachSlice(number[, iterator = Prototype.K[, context]]) -> Enumerable
   *  - number (Number): The number of items to include in each slice.
   *  - iterator (Function): An optional function to use to transform each
   *    element before it's included in the slice; if this is not provided,
   *    the element itself is included.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Groups items into chunks of the given size. The final "slice" may have
   *  fewer than `number` items; it won't "pad" the last group with empty
   *  values. For that behavior, use [[Enumerable#inGroupsOf]].
   *
   *  <h5>Example</h5>
   *
   *      var students = [
   *        { name: 'Sunny', age: 20 },
   *        { name: 'Audrey', age: 21 },
   *        { name: 'Matt', age: 20 },
   *        { name: 'Amelie', age: 26 },
   *        { name: 'Will', age: 21 }
   *      ];
   *
   *      students.eachSlice(3, function(student) {
   *        return student.name;
   *      });
   *      // -> [['Sunny', 'Audrey', 'Matt'], ['Amelie', 'Will']]
  **/
  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  }

  /**
   *  Enumerable#all([iterator = Prototype.K[, context]]) -> Boolean
   *  - iterator (Function): An optional function to use to evaluate
   *    each element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Determines whether all the elements are "truthy" (boolean-equivalent to
   *  `true`), either directly or through computation by the provided iterator.
   *  Stops on the first falsy element found (e.g., the first element that
   *  is boolean-equivalent to `false`, such as `undefined`, `0`, or indeed
   *  `false`);
   *
   *  <h5>Examples</h5>
   *
   *      [].all();
   *      // -> true (empty arrays have no elements that could be falsy)
   *
   *      $R(1, 5).all();
   *      // -> true (all values in [1..5] are truthy)
   *
   *      [0, 1, 2].all();
   *      // -> false (with only one loop cycle: 0 is falsy)
   *
   *      [9, 10, 15].all(function(n) { return n >= 10; });
   *      // -> false (the iterator returns false on 9)
  **/
  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  }

  /**
   *  Enumerable#any([iterator = Prototype.K[, context]]) -> Boolean
   *  - iterator (Function): An optional function to use to evaluate each
   *    element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Determines whether at least one element is truthy (boolean-equivalent to
   *  `true`), either directly or through computation by the provided iterator.
   *
   *  <h5>Examples</h5>
   *
   *      [].any();
   *      // -> false (empty arrays have no elements that could be truthy)
   *
   *      $R(0, 2).any();
   *      // -> true (on the second loop, 1 is truthy)
   *
   *      [2, 4, 6, 8, 10].any(function(n) { return n > 5; });
   *      // -> true (the iterator will return true on 6)
  **/
  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  }

  /**
   *  Enumerable#collect([iterator = Prototype.K[, context]]) -> Array
   *  - iterator (Function): The iterator function to apply to each element
   *    in the enumeration.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns the result of applying `iterator` to each element. If no
   *  `iterator` is provided, the elements are simply copied to the
   *  returned array.
   *
   *  <h5>Examples</h5>
   *
   *      ['Hitch', "Hiker's", 'Guide', 'to', 'the', 'Galaxy'].collect(function(s) {
   *        return s.charAt(0).toUpperCase();
   *      });
   *      // -> ['H', 'H', 'G', 'T', 'T', 'G']
   *
   *      $R(1,5).collect(function(n) {
   *        return n * n;
   *      });
   *      // -> [1, 4, 9, 16, 25]
  **/
  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  /**
   *  Enumerable#detect(iterator[, context]) -> firstElement | undefined
   *  - iterator (Function): The iterator function to apply to each element
   *    in the enumeration.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns the first element for which the iterator returns a truthy value.
   *  Aliased by the [[Enumerable#find]] method.
   *
   *  <h5>Example</h5>
   *
   *      [1, 7, -2, -4, 5].detect(function(n) { return n < 0; });
   *      // -> -2
  **/
  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  /**
   *  Enumerable#findAll(iterator[, context]) -> Array
   *  - iterator (Function): An iterator function to use to test the elements.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns all the elements for which the iterator returned a truthy value.
   *  For the opposite operation, see [[Enumerable#reject]].
   *
   *  <h5>Example</h5>
   *
   *      [1, 'two', 3, 'four', 5].findAll(Object.isString);
   *      // -> ['two', 'four']
  **/
  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  /**
   *  Enumerable#grep(filter[, iterator = Prototype.K[, context]]) -> Array
   *  - filter (RegExp | String | Object): The filter to apply to elements. This
   *    can be a `RegExp` instance, a regular expression [[String]], or any
   *    object with a `match` function.
   *  - iterator (Function): An optional function to apply to selected elements
   *    before including them in the result.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns an array containing all of the elements for which the given
   *  filter returns `true` (or a truthy value). If an iterator is provided,
   *  it is used to produce the returned value for each selected element; this
   *  is done *after* the element has been selected by the filter.
   *
   *  If the given filter is a [[String]], it is converted into a `RegExp`
   *  object. To select elements, each element is passed into the filter's
   *  `match` function, which should return a truthy value to select the element
   *  or a falsy value not to. Note that the `RegExp` `match` function will
   *  convert elements to Strings to perform matching.
   *
   *  <h5>Examples</h5>
   *
   *      // Get all strings containing a repeated letter
   *      ['hello', 'world', 'this', 'is', 'cool'].grep(/(.)\1/);
   *      // -> ['hello', 'cool']
   *
   *      // Get all numbers ending with 0 or 5 and subtract 1 from them
   *      $R(1, 30).grep(/[05]$/, function(n) { return n - 1; });
   *      // -> [4, 9, 14, 19, 24, 29]
  **/
  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  }

  /**
   *  Enumerable#include(object) -> Boolean
   *  - object (?): The object to look for.
   *
   *  Determines whether a given object is in the enumerable or not,
   *  based on the `==` comparison operator (equality with implicit type
   *  conversion).
   *
   *  <h5>Examples</h5>
   *
   *      $R(1, 15).include(10);
   *      // -> true
   *
   *      ['hello', 'world'].include('HELLO');
   *      // -> false ('hello' != 'HELLO')
   *
   *      [1, 2, '3', '4', '5'].include(3);
   *      // -> true ('3' == 3)
  **/
  function include(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  }

  /**
   *  Enumerable#inGroupsOf(number[, fillWith = null]) -> [group...]
   *  - number (Number): The number of items to include in each group.
   *  - fillWith (Object): An optional filler to use if the last group needs
   *    any; defaults to `null`.
   *
   *  Like [[Enumerable#eachSlice]], but pads out the last chunk with the
   *  specified value if necessary and doesn't support the `iterator` function.
   *
   *  <h5>Examples</h5>
   *
   *      var students = [
   *        { name: 'Sunny',  age: 20 },
   *        { name: 'Audrey', age: 21 },
   *        { name: 'Matt',   age: 20 },
   *        { name: 'Amelie', age: 26 },
   *        { name: 'Will',   age: 21 }
   *      ];
   *
   *      students.inGroupsOf(2, { name: '', age: 0 });
   *      // -> [
   *      //      [{ name: 'Sunny', age: 20 }, { name: 'Audrey', age: 21 }],
   *      //      [{ name: 'Matt', age: 20 },  { name: 'Amelie', age: 26 }],
   *      //      [{ name: 'Will', age: 21 },  { name: '', age: 0 }]
   *      //    ]
  **/
  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  }

  /**
   *  Enumerable#inject(accumulator, iterator[, context]) -> accumulatedValue
   *  - accumulator (?): The initial value to which the `iterator` adds.
   *  - iterator (Function): An iterator function used to build the accumulated
   *    result.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Incrementally builds a result value based on the successive results
   *  of the iterator. This can be used for array construction, numerical
   *  sums/averages, etc.
   *
   *  The `iterator` function is called once for each element in the
   *  enumeration, receiving the current value of the accumulator as its first
   *  argument, the element as its second argument, and the element's index as
   *  its third. It returns the new value for the accumulator.
   *
   *  <h5>Examples</h5>
   *
   *      $R(1,10).inject(0, function(acc, n) { return acc + n; });
   *      // -> 55 (sum of 1 to 10)
   *
   *      ['a', 'b', 'c', 'd', 'e'].inject([], function(string, value, index) {
   *        if (index % 2 === 0) { // even numbers
   *          string += value;
   *        }
   *        return string;
   *      });
   *      // -> 'ace'
  **/
  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  }

  /**
   *  Enumerable#invoke(methodName[, arg...]) -> Array
   *  - methodName (String): The name of the method to invoke.
   *  - args (?): Optional arguments to pass to the method.
   *
   *  Invokes the same method, with the same arguments, for all items in a
   *  collection. Returns an array of the results of the method calls.
   *
   *  <h5>Examples</h5>
   *
   *      ['hello', 'world'].invoke('toUpperCase');
   *      // -> ['HELLO', 'WORLD']
   *
   *      ['hello', 'world'].invoke('substring', 0, 3);
   *      // -> ['hel', 'wor']
   *
   *      $$('input').invoke('stopObserving', 'change');
   *      // -> Stops observing the 'change' event on all input elements,
   *      // returns an array of the element references.
  **/
  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  /** related to: Enumerable#min
   *  Enumerable#max([iterator = Prototype.K[, context]]) -> maxValue
   *  - iterator (Function): An optional function to use to evaluate each
   *    element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns the maximum element (or element-based `iterator` result), or
   *  `undefined` if the enumeration is empty. Elements are either compared
   *  directly, or by first calling `iterator` and comparing returned values.
   *  If multiple "max" elements (or results) are equivalent, the one closest
   *  to the end of the enumeration is returned.
   *
   *  If provided, `iterator` is called with two arguments: The element being
   *  evaluated, and its index in the enumeration; it should return the value
   *  `max` should consider (and potentially return).
   *
   *  <h5>Examples</h5>
   *
   *      ['c', 'b', 'a'].max();
   *      // -> 'c'
   *
   *      [1, 3, '3', 2].max();
   *      // -> '3' (because both 3 and '3' are "max", and '3' was later)
   *
   *      ['zero', 'one', 'two'].max(function(item) { return item.length; });
   *      // -> 4
  **/
  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  }

  /** related to: Enumerable#max
   *  Enumerable#min([iterator = Prototype.K[, context]]) -> minValue
   *  - iterator (Function): An optional function to use to evaluate each
   *    element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns the minimum element (or element-based `iterator` result), or
   *  `undefined` if the enumeration is empty. Elements are either compared
   *  directly, or by first calling `iterator` and comparing returned values.
   *  If multiple "min" elements (or results) are equivalent, the one closest
   *  to the *beginning* of the enumeration is returned.
   *
   *  If provided, `iterator` is called with two arguments: The element being
   *  evaluated, and its index in the enumeration; it should return the value
   *  `min` should consider (and potentially return).
   *
   *  <h5>Examples</h5>
   *
   *      ['c', 'b', 'a'].min();
   *      // -> 'a'
   *
   *      [3, 1, '1', 2].min();
   *      // -> 1 (because both 1 and '1' are "min", and 1 was earlier)
   *
   *      ['un', 'deux', 'trois'].min(function(item) { return item.length; });
   *      // -> 2
  **/
  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  }

  /**
   *  Enumerable#partition([iterator = Prototype.K[, context]]) -> [TrueArray, FalseArray]
   *  - iterator (Function): An optional function to use to evaluate each
   *    element in the enumeration; the function should return the value to
   *    test. If this is not provided, the element itself is tested.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Partitions the elements in two groups: those regarded as true, and those
   *  considered false. By default, regular JavaScript boolean equivalence
   *  (e.g., truthiness vs. falsiness) is used, but an iterator can be provided
   *  that computes a boolean representation of the elements.
   *
   *  Using `partition` is more efficient than using [[Enumerable#findAll]] and
   *  then using [[Enumerable#reject]] because the enumeration is only processed
   *  once.
   *
   *  <h5>Examples</h5>
   *
   *      ['hello', null, 42, false, true, , 17].partition();
   *      // -> [['hello', 42, true, 17], [null, false, undefined]]
   *
   *      $R(1, 10).partition(function(n) {
   *        return 0 == n % 2;
   *      });
   *      // -> [[2, 4, 6, 8, 10], [1, 3, 5, 7, 9]]
  **/
  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  }

  /**
   *  Enumerable#pluck(property) -> Array
   *  - property (String): The name of the property to fetch.
   *
   *  Pre-baked implementation for a common use-case of [[Enumerable#collect]]
   *  and [[Enumerable#each]]: fetching the same property for all of the
   *  elements. Returns an array of the property values.
   *
   *  <h5>Example</h5>
   *
   *      ['hello', 'world', 'this', 'is', 'nice'].pluck('length');
   *      // -> [5, 5, 4, 2, 4]
  **/
  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  }

  /**
   *  Enumerable#reject(iterator[, context]) -> Array
   *  - iterator (Function): An iterator function to use to test the elements.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Returns all the elements for which the iterator returns a falsy value.
   *  For the opposite operation, see [[Enumerable#findAll]].
   *
   *  <h5>Example</h5>
   *
   *      [1, "two", 3, "four", 5].reject(Object.isString);
   *      // -> [1, 3, 5]
  **/
  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  /**
   *  Enumerable#sortBy(iterator[, context]) -> Array
   *  - iterator (Function): The function to use to compute the criterion for
   *    each element in the enumeration.
   *  - context (Object): An optional object to use as `this` within
   *    calls to the iterator.
   *
   *  Creates a custom-sorted array of the elements based on the criteria
   *  computed, for each element, by the iterator. Computed criteria must have
   *  well-defined ordering semantics (i.e. the `<` operator must exist between
   *  any two criteria).
   *
   *  `sortBy` does not guarantee a *stable* sort; adjacent equivalent elements
   *  may be swapped.
   *
   *  <h5>Example</h5>
   *
   *      ['hello', 'world', 'this', 'is', 'nice'].sortBy(function(s) {
   *        return s.length;
   *      });
   *      // -> ['is', 'nice', 'this', 'world', 'hello']
  **/
  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  /**
   *  Enumerable#toArray() -> Array
   *
   *  Returns an Array containing the elements of the enumeration.
   *
   *  <h5>Example</h5>
   *
   *      $R(1, 5).toArray();
   *      // -> [1, 2, 3, 4, 5]
   *
   *      $H({ name: 'Sunny', age: 20 }).toArray();
   *      // -> [['name', 'Sunny'], ['age', 20]]
  **/
  function toArray() {
    return this.map();
  }

  /**
   *  Enumerable#zip(sequence...[, iterator = Prototype.K]) -> Array
   *  - sequence (Object): A sequence to zip with this enumerable (there can
   *    be several of these if desired).
   *  - iterator (Function): Optional function to use to transform the tuples
   *    once generated; this is always the last argument provided.
   *
   *  Zips together (think of the zipper on a pair of trousers) 2+ sequences,
   *  returning a new array of tuples. Each tuple is an array containing one
   *  value per original sequence. Tuples can be transformed to something else
   *  by applying the optional `iterator` on them.
   *
   *  If supplied, `iterator` is called with each tuple as its only argument
   *  and should return the value to use in place of that tuple.
   *
   *  <h5>Examples</h5>
   *
   *      var firstNames = ['Jane', 'Nitin', 'Guy'];
   *      var lastNames  = ['Doe',  'Patel', 'Forcier'];
   *      var ages       = [23,     41,      17];
   *
   *      firstNames.zip(lastNames);
   *      // -> [['Jane', 'Doe'], ['Nitin', 'Patel'], ['Guy', 'Forcier']]
   *
   *      firstNames.zip(lastNames, ages);
   *      // -> [['Jane', 'Doe', 23], ['Nitin', 'Patel', 41], ['Guy', 'Forcier', 17]]
   *
   *      firstNames.zip(lastNames, ages, function(tuple) {
   *        return tuple[0] + ' ' + tuple[1] + ' is ' + tuple[2];
   *      });
   *      // -> ['Jane Doe is 23', 'Nitin Patel is 41', 'Guy Forcier is 17']
  **/
  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  }

  /**
   *  Enumerable#size() -> Number
   *
   *  Returns the size of the enumeration.
  **/
  function size() {
    return this.toArray().length;
  }

  /**
   *  Enumerable#inspect() -> String
   *
   *  Returns the debug-oriented string representation of the object.
  **/
  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }

  /** alias of: Enumerable#collect
   *  Enumerable#map([iterator = Prototype.K[, context]]) -> Array
  **/

  /** alias of: Enumerable#any
   *  Enumerable#some([iterator = Prototype.K[, context]]) -> Boolean
  **/

  /** alias of: Enumerable#all
   *  Enumerable#every([iterator = Prototype.K[, context]]) -> Boolean
  **/

  /** alias of: Enumerable#findAll
   *  Enumerable#select(iterator[, context]) -> Array
  **/

  /** alias of: Enumerable#findAll
   *  Enumerable#filter(iterator[, context]) -> Array
  **/

  /** alias of: Enumerable#include
   *  Enumerable#member(object) -> Boolean
  **/

  /** alias of: Enumerable#toArray
   *  Enumerable#entries() -> Array
  **/

  /** alias of: Enumerable#detect
   *  Enumerable#find(iterator[, context]) -> firstElement | undefined
  **/

  return {
    each:       each,
    eachSlice:  eachSlice,
    all:        all,
    every:      all,
    any:        any,
    some:       any,
    collect:    collect,
    map:        collect,
    detect:     detect,
    findAll:    findAll,
    select:     findAll,
    filter:     findAll,
    grep:       grep,
    include:    include,
    member:     include,
    inGroupsOf: inGroupsOf,
    inject:     inject,
    invoke:     invoke,
    max:        max,
    min:        min,
    partition:  partition,
    pluck:      pluck,
    reject:     reject,
    sortBy:     sortBy,
    toArray:    toArray,
    entries:    toArray,
    zip:        zip,
    size:       size,
    inspect:    inspect,
    find:       detect
  };
})();
/** section: Language, related to: Array
 *    $A(iterable) -> Array
 *
 *  Accepts an array-like collection (anything with numeric indices) and returns
 *  its equivalent as an actual Array object.
 *  This method is a convenience alias of [[Array.from]], but is the preferred way
 *  of casting to an Array.
 **/
function $A(iterable) {
  if (!iterable) return [];
  // Safari <2.0.4 crashes when accessing property of a node list with property accessor.
  // It nevertheless works fine with `in` operator, which is why we use it here
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

/** section: Language, related to: Array
 *  $w(string) -> Array
 *  - string (String): A string with zero or more spaces.
 *
 *  Splits a string into an array, treating all whitespace as delimiters.
 *
 *  Equivalent to Ruby's `%w{foo bar}` or Perl's `qw(foo bar)`.
**/
function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

/** alias of: $A
 *  Array.from(iterable) -> Array
**/
Array.from = $A;

/** section: Language
 * class Array
 *  includes Enumerable
 *
 *  Prototype extends all native JavaScript arrays with quite a few powerful
 *  methods.
 *
 *  This is done in two ways:
 *
 *  * It mixes in the [[Enumerable]] module, which brings in a ton of methods.
 *  * It adds quite a few extra methods, which are documented in this section.
 *
 *  With Prototype, arrays become much, much more than the trivial objects we
 *  used to manipulate, limiting ourselves to using their `length` property and
 *  their `[]` indexing operator. They become very powerful objects that
 *  greatly simplify the code for 99% of the common use cases involving them.
 *
 *  <h5>Why you should stop using for...in to iterate</h5>
 *
 *  Many JavaScript authors have been misled into using the `for...in` JavaScript
 *  construct to loop over array elements. This kind of code just won't work
 *  with Prototype.
 *
 *  The ECMA 262 standard, which defines ECMAScript 3rd edition, supposedly
 *  implemented by all major browsers including MSIE, defines ten methods
 *  on Array (&sect;15.4.4), including nice methods like `concat`, `join`, `pop`, and
 *  `push`.
 *
 *  This same standard explicitly defines that the `for...in` construct (&sect;12.6.4)
 *  exists to enumerate the properties of the object appearing on the right side
 *  of the `in` keyword. Only properties specifically marked as _non-enumerable_
 *  are ignored by such a loop. By default, the `prototype` and `length`
 *  properties are so marked, which prevents you from enumerating over array
 *  methods when using for...in. This comfort led developers to use `for...in` as a
 *  shortcut for indexing loops, when it is not its actual purpose.
 *
 *  However, Prototype has no way to mark the methods it adds to
 *  `Array.prototype` as non-enumerable. Therefore, using `for...in` on arrays
 *  when using Prototype will enumerate all extended methods as well, such as
 *  those coming from the [[Enumerable]] module, and those Prototype puts in the
 *  Array namespace (listed further below).
 *
 *  <h5>What you should use instead</h5>
 *
 *  You can revert to vanilla loops:
 *
 *      for (var index = 0; index < myArray.length; ++index) {
 *        var item = myArray[index];
 *        // Your code working on item here...
 *      }
 *
 *  Or you can use iterators, such as [[Array#each]]:
 *
 *      myArray.each(function(item) {
 *        // Your code working on item here...
 *      });
 *
 *
 *  The inability to use `for...in` on arrays is not much of a burden: as you'll
 *  see, most of what you used to loop over arrays for can be concisely done
 *  using the new methods provided by Array or the mixed-in [[Enumerable]]
 *  module. So manual loops should be fairly rare.
 *
 *
 *  <h5>A note on performance</h5>
 *
 *  Should you have a very large array, using iterators with lexical closures
 *  (anonymous functions that you pass to the iterators and that get invoked at
 *  every loop iteration) in methods like [[Array#each]] &mdash; _or_ relying on
 *  repetitive array construction (such as uniq), may yield unsatisfactory
 *  performance. In such cases, you're better off writing manual indexing loops,
 *  but take care then to cache the length property and use the prefix `++`
 *  operator:
 *
 *      // Custom loop with cached length property: maximum full-loop
 *      // performance on very large arrays!
 *      for (var index = 0, len = myArray.length; index < len; ++index) {
 *        var item = myArray[index];
 *        // Your code working on item here...
 *      }
 *
**/

(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

  function each(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  }
  if (!_each) _each = each;

  /**
   *  Array#clear() -> Array
   *
   *  Clears the array (makes it empty) and returns the array reference.
   *
   *  <h5>Example</h5>
   *
   *      var guys = ['Sam', 'Justin', 'Andrew', 'Dan'];
   *      guys.clear();
   *      // -> []
   *      guys
   *      // -> []
  **/
  function clear() {
    this.length = 0;
    return this;
  }

  /**
   *  Array#first() -> ?
   *
   *  Returns the array's first item (e.g., `array[0]`).
  **/
  function first() {
    return this[0];
  }

  /**
   *  Array#last() -> ?
   *
   *  Returns the array's last item (e.g., `array[array.length - 1]`).
  **/
  function last() {
    return this[this.length - 1];
  }

  /**
   *  Array#compact() -> Array
   *
   *  Returns a **copy** of the array without any `null` or `undefined` values.
   *
   *  <h5>Example</h5>
   *
   *      var orig = [undefined, 'A', undefined, 'B', null, 'C'];
   *      var copy = orig.compact();
   *      // orig -> [undefined, 'A', undefined, 'B', null, 'C'];
   *      // copy -> ['A', 'B', 'C'];
  **/
  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  /**
   *  Array#flatten() -> Array
   *
   *  Returns a flattened (one-dimensional) copy of the array, leaving
   *  the original array unchanged.
   *
   *  Nested arrays are recursively injected inline. This can prove very
   *  useful when handling the results of a recursive collection algorithm,
   *  for instance.
   *
   *  <h5>Example</h5>
   *
   *      var a = ['frank', ['bob', 'lisa'], ['jill', ['tom', 'sally']]];
   *      var b = a.flatten();
   *      // a -> ['frank', ['bob', 'lisa'], ['jill', ['tom', 'sally']]]
   *      // b -> ['frank', 'bob', 'lisa', 'jill', 'tom', 'sally']
  **/
  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  /**
   *  Array#without(value[, value...]) -> Array
   *  - value (?): A value to exclude.
   *
   *  Produces a new version of the array that does not contain any of the
   *  specified values, leaving the original array unchanged.
   *
   *  <h5>Examples</h5>
   *
   *      [3, 5, 6].without(3)
   *      // -> [5, 6]
   *
   *      [3, 5, 6, 20].without(20, 6)
   *      // -> [3, 5]
  **/
  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  /**
   *  Array#reverse([inline = true]) -> Array
   *  - inline (Boolean): Whether to modify the array in place. Defaults to `true`.
   *      Clones the original array when `false`.
   *
   *  Reverses the array's contents, optionally cloning it first.
   *
   *  <h5>Examples</h5>
   *
   *      // Making a copy
   *      var nums = [3, 5, 6, 1, 20];
   *      var rev = nums.reverse(false);
   *      // nums -> [3, 5, 6, 1, 20]
   *      // rev -> [20, 1, 6, 5, 3]
   *
   *      // Working inline
   *      var nums = [3, 5, 6, 1, 20];
   *      nums.reverse();
   *      // nums -> [20, 1, 6, 5, 3]
  **/
  function reverse(inline) {
    return (inline === false ? this.toArray() : this)._reverse();
  }

  /**
   *  Array#uniq([sorted = false]) -> Array
   *  - sorted (Boolean): Whether the array has already been sorted. If `true`,
   *      a less-costly algorithm will be used.
   *
   *  Produces a duplicate-free version of an array. If no duplicates are
   *  found, the original array is returned.
   *
   *  On large arrays when `sorted` is `false`, this method has a potentially
   *  large performance cost.
   *
   *  <h5>Examples</h5>
   *
   *      [1, 3, 2, 1].uniq();
   *      // -> [1, 2, 3]
   *
   *      ['A', 'a'].uniq();
   *      // -> ['A', 'a'] (because String comparison is case-sensitive)
  **/
  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  /**
   *  Array#intersect(array) -> Array
   *  - array (Array): A collection of values.
   *
   *  Returns an array containing every item that is shared between the two
   *  given arrays.
  **/
  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  }

  /** alias of: Array#clone
   *  Array#toArray() -> Array
  **/

  /**
   *  Array#clone() -> Array
   *
   *  Returns a duplicate of the array, leaving the original array intact.
  **/
  function clone() {
    return slice.call(this, 0);
  }

  /** related to: Enumerable#size
   *  Array#size() -> Number
   *
   *  Returns the size of the array (e.g., `array.length`).
   *
   *  This is just a local optimization of the mixed-in [[Enumerable#size]]
   *  which avoids array cloning and uses the array's native length property.
  **/
  function size() {
    return this.length;
  }

  /** related to: Object.inspect
   *  Array#inspect() -> String
   *
   *  Returns the debug-oriented string representation of an array.
   *
   *  <h5>Example</h5>
   *
   *      ['Apples', {good: 'yes', bad: 'no'}, 3, 34].inspect()
   *      // -> "['Apples', [object Object], 3, 34]"
  **/
  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  /** related to: Object.toJSON
   *  Array#toJSON() -> String
   *
   *  Returns a JSON string representation of the array.
   *
   *  <h5>Example</h5>
   *
   *      ['a', {b: null}].toJSON();
   *      //-> '["a", {"b": null}]'
  **/
  function toJSON() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }

  /**
   *  Array#indexOf(item[, offset = 0]) -> Number
   *  - item (?): A value that may or may not be in the array.
   *  - offset (Number): The number of initial items to skip before beginning
   *      the search.
   *
   *  Returns the index of the first occurrence of `item` within the array,
   *  or `-1` if `item` doesn't exist in the array. `Array#indexOf` compares
   *  items using *strict equality* (`===`).
   *
   *  <h5>Examples</h5>
   *
   *      [3, 5, 6, 1, 20].indexOf(1)
   *      // -> 3
   *
   *      [3, 5, 6, 1, 20].indexOf(90)
   *      // -> -1 (not found)
   *
   *      ['1', '2', '3'].indexOf(1);
   *      // -> -1 (not found, 1 !== '1')
  **/
  function indexOf(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
      if (this[i] === item) return i;
    return -1;
  }

  /** related to: Array#indexOf
   *  Array#lastIndexOf(item[, offset]) -> Number
   *  - item (?): A value that may or may not be in the array.
   *  - offset (Number): The number of items at the end to skip before beginning
   *      the search.
   *
   *  Returns the position of the last occurrence of `item` within the array &mdash; or
   *  `-1` if `item` doesn't exist in the array.
  **/
  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
  }

  // Replaces a built-in function. No PDoc needed.
  function concat() {
    var array = slice.call(this, 0), item;
    for (var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else {
        array.push(item);
      }
    }
    return array;
  }

  Object.extend(arrayProto, Enumerable);

  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;

  Object.extend(arrayProto, {
    _each:     _each,
    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect,
    toJSON:    toJSON
  });

  // fix for opera
  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2)

  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

  // use native browser JS 1.6 implementation if available
  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
/* Based on Alex Arnell's inheritance implementation. */

/** section: Language
 * Class
 *
 *  Manages Prototype's class-based OOP system.
 *
 *  Refer to Prototype's web site for a [tutorial on classes and
 *  inheritance](http://prototypejs.org/learn/class-inheritance).
**/
var Class = (function() {
  
  // Some versions of JScript fail to enumerate over properties, names of which 
  // correspond to non-enumerable properties in the prototype chain
  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      // check actual property name, so that it works with augmented Object.prototype
      if (p === 'toString') return false;
    }
    return true;
  })();
  
  /**
   *  Class.create([superclass][, methods...]) -> Class
   *    - superclass (Class): The optional superclass to inherit methods from.
   *    - methods (Object): An object whose properties will be "mixed-in" to the
   *        new class. Any number of mixins can be added; later mixins take
   *        precedence.
   *
   *  `Class.create` creates a class and returns a constructor function for
   *  instances of the class. Calling the constructor function (typically as
   *  part of a `new` statement) will invoke the class's `initialize` method.
   *
   *  `Class.create` accepts two kinds of arguments. If the first argument is
   *  a `Class`, it's used as the new class's superclass, and all its methods
   *  are inherited. Otherwise, any arguments passed are treated as objects,
   *  and their methods are copied over ("mixed in") as instance methods of the
   *  new class. In cases of method name overlap, later arguments take
   *  precedence over earlier arguments.
   *
   *  If a subclass overrides an instance method declared in a superclass, the
   *  subclass's method can still access the original method. To do so, declare
   *  the subclass's method as normal, but insert `$super` as the first
   *  argument. This makes `$super` available as a method for use within the
   *  function.
   *
   *  To extend a class after it has been defined, use [[Class#addMethods]].
   *
   *  For details, see the
   *  [inheritance tutorial](http://prototypejs.org/learn/class-inheritance)
   *  on the Prototype website.
  **/
  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  /**
   *  Class#addMethods(methods) -> Class
   *    - methods (Object): The methods to add to the class.
   *
   *  Adds methods to an existing class.
   *
   *  `Class#addMethods` is a method available on classes that have been
   *  defined with `Class.create`. It can be used to add new instance methods
   *  to that class, or overwrite existing methods, after the class has been
   *  defined.
   *
   *  New methods propagate down the inheritance chain. If the class has
   *  subclasses, those subclasses will receive the new methods &mdash; even in
   *  the context of `$super` calls. The new methods also propagate to instances
   *  of the class and of all its subclasses, even those that have already been
   *  instantiated.
   *
   *  <h5>Examples</h5>
   *
   *      var Animal = Class.create({
   *        initialize: function(name, sound) {
   *          this.name  = name;
   *          this.sound = sound;
   *        },
   *
   *        speak: function() {
   *          alert(this.name + " says: " + this.sound + "!");
   *        }
   *      });
   *
   *      // subclassing Animal
   *      var Snake = Class.create(Animal, {
   *        initialize: function($super, name) {
   *          $super(name, 'hissssssssss');
   *        }
   *      });
   *
   *      var ringneck = new Snake("Ringneck");
   *      ringneck.speak();
   *
   *      //-> alerts "Ringneck says: hissssssss!"
   *
   *      // adding Snake#speak (with a supercall)
   *      Snake.addMethods({
   *        speak: function($super) {
   *          $super();
   *          alert("You should probably run. He looks really mad.");
   *        }
   *      });
   *
   *      ringneck.speak();
   *      //-> alerts "Ringneck says: hissssssss!"
   *      //-> alerts "You should probably run. He looks really mad."
   *
   *      // redefining Animal#speak
   *      Animal.addMethods({
   *        speak: function() {
   *          alert(this.name + 'snarls: ' + this.sound + '!');
   *        }
   *      });
   *
   *      ringneck.speak();
   *      //-> alerts "Ringneck snarls: hissssssss!"
   *      //-> alerts "You should probably run. He looks really mad."
  **/
  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

    // IE6 doesn't enumerate `toString` and `valueOf` (among other built-in `Object.prototype`) properties,
    // Force copy if they're not Object.prototype ones.
    // Do not copy other Object.prototype.* for performance reasons
    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
/** section: Language
 * class Function
 *
 *  Extensions to the built-in `Function` object.
**/
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  /**
   *  Function#argumentNames() -> Array
   *
   *  Reads the argument names as stated in the function definition and returns
   *  the values as an array of strings (or an empty array if the function is
   *  defined without parameters).
   *
   *  <h5>Examples</h5>
   *
   *      function fn(foo, bar) {
   *        return foo + bar;
   *      }
   *      fn.argumentNames();
   *      //-> ['foo', 'bar']
   *
   *      Prototype.emptyFunction.argumentNames();
   *      //-> []
  **/
  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  /** related to: Function#bindAsEventListener
   *  Function#bind(context[, args...]) -> Function
   *  - context (Object): The object to bind to.
   *  - args (?): Optional additional arguments to curry for the function.
   *
   *  Binds this function to the given `context` by wrapping it in another
   *  function and returning the wrapper. Whenever the resulting "bound"
   *  function is called, it will call the original ensuring that `this` is set
   *  to `context`. Also optionally curries arguments for the function.
   *
   *  <h5>Examples</h5>
   *
   *  A typical use of `Function#bind` is to ensure that a callback (event
   *  handler, etc.) that is an object method gets called with the correct
   *  object as its context (`this` value):
   *
   *      var AlertOnClick = Class.create({
   *        initialize: function(msg) {
   *          this.msg = msg;
   *        },
   *        handleClick: function(event) {
   *          event.stop();
   *          alert(this.msg);
   *        }
   *      });
   *      var myalert = new AlertOnClick("Clicked!");
   *      $('foo').observe('click', myalert.handleClick); // <= WRONG
   *      // -> If 'foo' is clicked, the alert will be blank; "this" is wrong
   *      $('bar').observe('click', myalert.handleClick.bind(myalert)); // <= RIGHT
   *      // -> If 'bar' is clicked, the alert will be "Clicked!"
   *
   *  `bind` can also *curry* (burn in) arguments for the function if you
   *  provide them after the `context` argument:
   *
   *      var Averager = Class.create({
   *        initialize: function() {
   *          this.count = 0;
   *          this.total = 0;
   *        },
   *        add: function(addend) {
   *          ++this.count;
   *          this.total += addend;
   *        },
   *        getAverage: function() {
   *          return this.count == 0 ? NaN : this.total / this.count;
   *        }
   *      });
   *      var a = new Averager();
   *      var b = new Averager();
   *      var aAdd5 = a.add.bind(a, 5);   // Bind to a, curry 5
   *      var aAdd10 = a.add.bind(a, 10); // Bind to a, curry 10
   *      var bAdd20 = b.add.bind(b, 20); // Bind to b, curry 20
   *      aAdd5();
   *      aAdd10();
   *      bAdd20();
   *      bAdd20();
   *      alert(a.getAverage());
   *      // -> Alerts "7.5" (average of [5, 10])
   *      alert(b.getAverage());
   *      // -> Alerts "20" (average of [20, 20])
   *
   *  (To curry without binding, see [[Function#curry]].)
  **/
  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  /** related to: Function#bind
   *  Function#bindAsEventListener(context[, args...]) -> Function
   *  - context (Object): The object to bind to.
   *  - args (?): Optional arguments to curry after the event argument.
   *
   *  An event-specific variant of [[Function#bind]] which ensures the function
   *  will recieve the current event object as the first argument when
   *  executing.
   *
   *  It is not necessary to use `bindAsEventListener` for all bound event
   *  handlers; [[Function#bind]] works well for the vast majority of cases.
   *  `bindAsEventListener` is only needed when:
   *
   *  - Using old-style DOM0 handlers rather than handlers hooked up via
   *    [[Event.observe]], because `bindAsEventListener` gets the event object
   *    from the right place (even on MSIE). (If you're using `Event.observe`,
   *    that's already handled.)
   *  - You want to bind an event handler and curry additional arguments but
   *    have those arguments appear after, rather than before, the event object.
   *    This mostly happens if the number of arguments will vary, and so you
   *    want to know the event object is the first argument.
   *
   *  <h5>Example</h5>
   *
   *      var ContentUpdater = Class.create({
   *        initialize: function(initialData) {
   *          this.data = Object.extend({}, initialData);
   *        },
   *        // On an event, update the content in the elements whose
   *        // IDs are passed as arguments from our data
   *        updateTheseHandler: function(event) {
   *          var argIndex, id, element;
   *          event.stop();
   *          for (argIndex = 1; argIndex < arguments.length; ++argIndex) {
   *            id = arguments[argIndex];
   *            element = $(id);
   *            if (element) {
   *              element.update(String(this.data[id]).escapeHTML());
   *            }
   *          }
   *        }
   *      });
   *      var cu = new ContentUpdater({
   *        dispName: 'Joe Bloggs',
   *        dispTitle: 'Manager <provisional>',
   *        dispAge: 47
   *      });
   *      // Using bindAsEventListener because of the variable arg lists:
   *      $('btnUpdateName').observe('click',
   *        cu.updateTheseHandler.bindAsEventListener(cu, 'dispName')
   *      );
   *      $('btnUpdateAll').observe('click',
   *        cu.updateTheseHandler.bindAsEventListener(cu, 'dispName', 'dispTitle', 'dispAge')
   *      );
  **/
  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  /**
   *  Function#curry(args...) -> Function
   *  - args (?): The arguments to curry.
   *
   *  *Curries* (burns in) arguments to a function, returning a new function
   *  that when called with call the original passing in the curried arguments
   *  (along with any new ones):
   *
   *      function showArguments() {
   *        alert($A(arguments).join(', '));
   *      }
   *      showArguments(1, 2,, 3);
   *      // -> alerts "1, 2, 3"
   *
   *      var f = showArguments.curry(1, 2, 3);
   *      f('a', 'b');
   *      // -> alerts "1, 2, 3, a, b"
   *
   *  `Function#curry` works just like [[Function#bind]] without the initial
   *  context argument. Use `bind` if you need to curry arguments _and_ set
   *  context at the same time.
   *
   *  The name "curry" comes from [mathematics](http://en.wikipedia.org/wiki/Currying).
  **/
  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  /**
   *  Function#delay(timeout[, args...]) -> Number
   *  - timeout (Number): The time, in seconds, to wait before calling the
   *    function.
   *  - args (?): Optional arguments to pass to the function when calling it.
   *
   *  Schedules the function to run after the specified amount of time, passing
   *  any arguments given.
   *
   *  Behaves much like `window.setTimeout`, but the timeout is in seconds
   *  rather than milliseconds. Returns an integer ID that can be used to
   *  clear the timeout with `window.clearTimeout` before it runs.
   *
   *  To schedule a function to run as soon as the interpreter is idle, use
   *  [[Function#defer]].
   *
   *  <h5>Example</h5>
   *
   *      function showMsg(msg) {
   *        alert(msg);
   *      }
   *      showMsg.delay(0.1, "Hi there!");
   *      // -> Waits a 10th of a second, then alerts "Hi there!"
  **/
  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  /**
   *  Function#defer(args...) -> Number
   *  - args (?): Optional arguments to pass into the function.
   *
   *  Schedules the function to run as soon as the interpreter is idle.
   *
   *  A "deferred" function will not run immediately; rather, it will run as soon
   *  as the interpreter's call stack is empty.
   *
   *  Behaves much like `window.setTimeout` with a delay set to `0`. Returns an
   *  ID that can be used to clear the timeout with `window.clearTimeout` before
   *  it runs.
   *
   *  <h5>Example</h5>
   *
   *      function showMsg(msg) {
   *        alert(msg);
   *      }
   *
   *      showMsg("One");
   *      showMsg.defer("Two");
   *      showMsg("Three");
   *      // Alerts "One", then "Three", then (after a brief pause) "Two"
   *      // Note that "Three" happens before "Two"
  **/
  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  /**
   *  Function#wrap(wrapper) -> Function
   *  - wrapper (Function): The function to use as a wrapper.
   *
   *  Returns a function "wrapped" around the original function.
   *
   *  `Function#wrap` distills the essence of aspect-oriented programming into
   *  a single method, letting you easily build on existing functions by
   *  specifying before and after behavior, transforming the return value, or
   *  even preventing the original function from being called.
   *
   *  The wraper function is called with this signature:
   *
   *      function wrapper(callOriginal[, args...])
   *
   *  ...where `callOriginal` is a function that can be used to call the
   *  original (wrapped) function (or not, as appropriate). (`callOriginal` is
   *  not a direct reference to the original function, there's a layer of
   *  indirection in-between that sets up the proper context \[`this` value\] for
   *  it.)
   *
   *  <h5>Example</h5>
   *
   *      // Wrap String#capitalize so it accepts an additional argument
   *      String.prototype.capitalize = String.prototype.capitalize.wrap(
   *        function(callOriginal, eachWord) {
   *          if (eachWord && this.include(" ")) {
   *            // capitalize each word in the string
   *            return this.split(" ").invoke("capitalize").join(" ");
   *          } else {
   *            // proceed using the original function
   *            return callOriginal();
   *          }
   *        });
   *
   *      "hello world".capitalize();
   *      // -> "Hello world" (only the 'H' is capitalized)
   *      "hello world".capitalize(true);
   *      // -> "Hello World" (both 'H' and 'W' are capitalized)
  **/
  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  /**
   *  Function#methodize() -> Function
   *
   *  Wraps the function inside another function that, when called, pushes
   *  `this` to the original function as the first argument (with any further
   *  arguments following it).
   *
   *  The `methodize` method transforms the original function that has an
   *  explicit first argument to a function that passes `this` (the current
   *  context) as an implicit first argument at call time. It is useful when we
   *  want to transform a function that takes an object to a method of that
   *  object or its prototype, shortening its signature by one argument.
   *
   *  <h5>Example</h5>
   *
   *      // A function that sets a name on a target object
   *      function setName(target, name) {
   *        target.name = name;
   *      }
   *
   *      // Use it
   *      obj = {};
   *      setName(obj, 'Fred');
   *      obj.name;
   *      // -> "Fred"
   *
   *      // Make it a method of the object
   *      obj.setName = setName.methodize();
   *
   *      // Use the method instead
   *      obj.setName('Barney');
   *      obj.name;
   *      // -> "Barney"
   *
   *  The example above is quite simplistic. It's more useful to copy methodized
   *  functions to object prototypes so that new methods are immediately shared
   *  among instances. In the Prototype library, `methodize` is used in various
   *  places such as the DOM module, so that (for instance) you can hide an
   *  element either by calling the static version of `Element.hide` and passing in
   *  an element reference or ID, like so:
   *
   *      Element.hide('myElement');
   *
   *  ...or if you already have an element reference, just calling the
   *  methodized form instead:
   *
   *      myElement.hide();
  **/
  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  }
})());

/** section: Language
 * class Date
 *
 *  Extensions to the built-in `Date` object.
**/

/**
 *  Date#toJSON() -> String
 *
 *  Produces a string representation of the date in ISO 8601 format.
 *  The time zone is always UTC, as denoted by the suffix "Z".
 *
 *  <h5>Example</h5>
 *
 *      var d = new Date(1969, 11, 31, 19);
 *      d.getTimezoneOffset();
 *      //-> -180 (time offest is given in minutes.)
 *      d.toJSON();
 *      //-> '"1969-12-31T16:00:00Z"'
**/
Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

/** section: Language
 * class RegExp
 *
 *  Extensions to the built-in `RegExp` object.
**/

/** alias of: RegExp#test
 *  RegExp#match(str) -> Boolean
 *
 *  Return true if string matches the regular expression, false otherwise.
 **/
RegExp.prototype.match = RegExp.prototype.test;

/**
 *  RegExp.escape(str) -> String
 *  - str (String): A string intended to be used in a `RegExp` constructor.
 *
 *  Escapes any characters in the string that have special meaning in a
 *  regular expression.
 *
 *  Use before passing a string into the `RegExp` constructor.
**/
RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
/** section: Language
 * class PeriodicalExecuter
 *
 *  A class that oversees the calling of a particular function periodically.
 *
 *  `PeriodicalExecuter` shields you from multiple parallel executions of the
 *  `callback` function, should it take longer than the given interval to
 *  execute.
 *
 *  This is especially useful if you use one to interact with the user at
 *  given intervals (e.g. use a prompt or confirm call): this will avoid
 *  multiple message boxes all waiting to be actioned.
**/
var PeriodicalExecuter = Class.create({
  /**
   *  new PeriodicalExecuter(callback, frequency)
   *  - callback (Function): the function to be executed at each interval.
   *  - frequency (Number): the amount of time, in sections, to wait in between
   *      callbacks.
   *
   *  Creates an `PeriodicalExecuter`.
  **/
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  /**
   *  PeriodicalExecuter#stop() -> undefined
   *
   *  Stops the periodical executer (there will be no further triggers).
  **/
  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      // IE doesn't support `finally` statements unless all errors are caught.
      // We mimic the behaviour of `finally` statements by duplicating code
      // that would belong in it. First at the bottom of the `try` statement
      // (for errorless cases). Secondly, inside a `catch` statement which
      // rethrows any caught errors.
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false;
      } catch(e) {
        this.currentlyExecuting = false;
        throw e;
      }
    }
  }
});
/** section: Language
 * class String
 *
 *  Extensions to the built-in `String` class.
 *
 *  Prototype enhances the `String` object with a series of useful methods for
 *  ranging from the trivial to the complex. Tired of stripping trailing
 *  whitespace? Try [[String#strip]]. Want to replace `replace`? Have a look at
 *  [[String#sub]] and [[String#gsub]]. Need to parse a query string? We have
 *  [[String#toQueryParams]].
**/
Object.extend(String, {
  /**
   *  String.interpret(value) -> String
   *
   *  Coerces `value` into a string. Returns an empty string for `null`.
  **/
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, (function() {

  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }

  /**
   *  String#gsub(pattern, replacement) -> String
   *
   *  Returns the string with every occurence of a given pattern replaced by either
   *  a regular string, the returned value of a function or a [[Template]] string.
   *  The pattern can be a string or a regular expression.
   *
   *  <h5>Example</h5>
   *
   *      ""hello".gsub(/([aeiou])/, '<#{1}>');
   *      // => "h<e>ll<o>"
  **/
  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  /**
   *  String#sub(pattern, replacement[, count = 1]) -> String
   *
   *  Returns a string with the first count occurrences of pattern replaced by either
   *  a regular string, the returned value of a function or a [[Template]] string.
   *  The pattern can be a string or a regular expression.
   *
   *  <h5>Example</h5>
   *
   *      "20091201".sub(/^(\d{4})(\d{2})(\d{2})$/, "#{1}-#{2}-#{3}");
   *      // => "2009-12-01"
  **/
  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  /** related to: String#gsub
   *  String#scan(pattern, iterator) -> String
   *
   *  Allows iterating over every occurrence of the given pattern (which can be a
   *  string or a regular expression).
   *  Returns the original string.
  **/
  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  /**
   *  String#truncate([length = 30[, suffix = '...']]) -> String
   *
   *  Truncates a string to given `length` and appends `suffix` to it (indicating
   *  that it is only an excerpt).
  **/
  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  /**
   *  String#strip() -> String
   *
   *  Strips all leading and trailing whitespace from a string.
  **/
  function strip() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  /**
   *  String#stripTags() -> String
   *
   *  Strips a string of any HTML tags.
   *
   *  Note that `stripTags` will only strip HTML 4.01 tags &mdash; like `div`,
   *  `span`, and `abbr`. It _will not_ strip namespace-prefixed tags such
   *  as `h:table` or `xsl:template`.
   *
   *  <h5>Caveat User</h5>
   *
   *  Note that the processing `stripTags` does is good enough for most purposes, but
   *  you cannot rely on it for security purposes. If you're processing end-user-supplied
   *  content, `stripTags` is _not_ sufficiently robust to ensure that the content
   *  is completely devoid of HTML tags in the case of a user intentionally trying to circumvent
   *  tag restrictions. But then, you'll be running them through [[String#escapeHTML]] anyway,
   *  won't you?
  **/
  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  /**
   *  String#stripScripts() -> String
   *
   *  Strips a string of things that look like an HTML script blocks.
   *
   *  <h5>Example</h5>
   *
   *      "<p>This is a test.<script>alert("Look, a test!");</script>End of test</p>".stripScripts();
   *      // => "<p>This is a test.End of test</p>"
   *
   *  <h5>Caveat User</h5>
   *
   *  Note that the processing `stripScripts` does is good enough for most purposes,
   *  but you cannot rely on it for security purposes. If you're processing end-user-supplied
   *  content, `stripScripts` is probably not sufficiently robust to prevent hack attacks.
  **/
  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  }

  /**
   *  String#extractScripts() -> Array
   *
   *  Extracts the content of any script blocks present in the string and
   *  returns them as an array of strings.
  **/
  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img'),
        matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  /**
   *  String#evalScripts() -> Array
   *
   *  Evaluates the content of any inline `<script>` block present in the string.
   *  Returns an array containing the value returned by each script.
   *  `<script>`  blocks referencing external files will be treated as though
   *  they were empty (the result for that position in the array will be `undefined`);
   *  external files are _not_ loaded and processed by `evalScripts`.
   *
   *  <h5>About `evalScripts`, `var`s, and defining functions</h5>
   *
   *  `evalScripts` evaluates script blocks, but this **does not** mean they are
   *  evaluated in the global scope. They aren't, they're evaluated in the scope of
   *  the `evalScripts` method. This has important ramifications for your scripts:
   *
   *  * Anything in your script declared with the `var` keyword will be
   *    discarded momentarily after evaluation, and will be invisible to any
   *    other scope.
   *  * If any `<script>` blocks _define functions_, they will need to be assigned to
   *    properties of the `window` object.
   *
   *  For example, this won't work:
   *
   *      // This kind of script won't work if processed by evalScripts:
   *      function coolFunc() {
   *        // Amazing stuff!
   *      }
   *
   *  Instead, use the following syntax:
   *
   *      // This kind of script WILL work if processed by evalScripts:
   *      window.coolFunc = function() {
   *        // Amazing stuff!
   *      }
   *
   *  (You can leave off the `window.` part of that, but it's bad form.)
  **/
  function evalScripts() {
    return this.extractScripts().map(function(script) { return eval(script) });
  }

  /**
   *  String#escapeHTML() -> String
   *
   *  Converts HTML special characters to their entity equivalents.
  **/
  function escapeHTML() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /** related to: String#escapeHTML
   *  String#unescapeHTML() -> String
   *
   *  Strips tags and converts the entity forms of special HTML characters
   *  to their normal form.
  **/
  function unescapeHTML() {
    // Warning: In 1.7 String#unescapeHTML will no longer call String#stripTags.
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  }

  /**
   *  String#parseQuery([separator = '&']) -> Object
  **/

  /** alias of: String#parseQuery, related to: Hash#toQueryString
   *  String#toQueryParams([separator = '&']) -> Object
   *
   *  Parses a URI-like query string and returns an object composed of
   *  parameter/value pairs.
  **/
  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift()),
            value = pair.length > 1 ? pair.join('=') : pair[0];
            
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  }

  /**
   *  String#toArray() -> Array
   *
   *  Splits the string character-by-character and returns an array with
   *  the result.
  **/
  function toArray() {
    return this.split('');
  }

  /**
   *  String#succ() -> String
   *
   *  Used internally by ObjectRange.
   *  Converts the last character of the string to the following character in
   *  the Unicode alphabet.
  **/
  function succ() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  }

  /**
   *  String#times(count) -> String
   *
   *  Concatenates the string `count` times.
  **/
  function times(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  }

  /**
   *  String#camelize() -> String
   *
   *  Converts a string separated by dashes into a camelCase equivalent.
   *  For instance, 'foo-bar' would be converted to 'fooBar'.
   *
   *  <h5>Examples</h5>
   *
   *      'background-color'.camelize();
   *      // -> 'backgroundColor'
   *
   *      '-moz-binding'.camelize();
   *      // -> 'MozBinding'
  **/
  function camelize() {
    return this.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  }

  /**
   *  String#capitalize() -> String
   *
   *  Capitalizes the first letter of a string and downcases all the others.
  **/
  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  }

  /**
   *  String#underscore() -> String
   *
   *  Converts a camelized string into a series of words separated by an
   *  underscore (`_`).
  **/
  function underscore() {
    return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
  }

  /**
   *  String#dasherize() -> String
   *
   *  Replaces every instance of the underscore character ("_") by a dash ("-").
  **/
  function dasherize() {
    return this.replace(/_/g, '-');
  }

  /** related to: Object.inspect
   *  String#inspect([useDoubleQuotes = false]) -> String
   *
   *  Returns a debug-oriented version of the string (i.e. wrapped in single or
   *  double quotes, with backslashes and quotes escaped).
  **/
  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character];
      }
      return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  }

  /** related to: Object.toJSON
   *  String#toJSON() -> String
   *
   *  Returns a JSON string.
  **/
  function toJSON() {
    return this.inspect(true);
  }

  /**
   *  String#unfilterJSON([filter = Prototype.JSONFilter]) -> String
   *
   *  Strips comment delimiters around Ajax JSON or JavaScript responses.
   *  This security method is called internally.
  **/
  function unfilterJSON(filter) {
    return this.replace(filter || Prototype.JSONFilter, '$1');
  }

  /**
   *  String#isJSON() -> Boolean
   *
   *  Check if the string is valid JSON by the use of regular expressions.
   *  This security method is called internally.
  **/
  function isJSON() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  }

  /**
   *  String#evalJSON([sanitize = false]) -> object
   *
   *  Evaluates the JSON in the string and returns the resulting object.
   *
   *  If the optional `sanitize` parameter is set to `true`, the string is
   *  checked for possible malicious attempts; if one is detected, `eval`
   *  is _not called_.
  **/
  function evalJSON(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  }

  /**
   *  String#include(substring) -> Boolean
   *
   *  Checks if the string contains `substring`.
  **/
  function include(pattern) {
    return this.indexOf(pattern) > -1;
  }

  /**
   *  String#startsWith(substring) -> Boolean
   *
   *  Checks if the string starts with `substring`.
  **/
  function startsWith(pattern) {
    // We use `lastIndexOf` instead of `indexOf` to avoid tying execution
    // time to string length when string doesn't start with pattern.
    return this.lastIndexOf(pattern, 0) === 0;
  }

  /**
   *  String#endsWith(substring) -> Boolean
   *
   *  Checks if the string ends with `substring`.
  **/
  function endsWith(pattern) {
    var d = this.length - pattern.length;
    // We use `indexOf` instead of `lastIndexOf` to avoid tying execution
    // time to string length when string doesn't end with pattern.
    return d >= 0 && this.indexOf(pattern, d) === d;
  }

  /**
   *  String#empty() -> Boolean
   *
   *  Checks if the string is empty.
  **/
  function empty() {
    return this == '';
  }

  /**
   *  String#blank() -> Boolean
   *
   *  Check if the string is "blank" &mdash; either empty (length of `0`) or containing
   *  only whitespace.
  **/
  function blank() {
    return /^\s*$/.test(this);
  }

  /**
   *  String#interpolate(object[, pattern]) -> String
   *
   *  Treats the string as a [[Template]] and fills it with `object`'s
   *  properties.
  **/
  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }

  return {
    gsub:           gsub,
    sub:            sub,
    scan:           scan,
    truncate:       truncate,
    // Firefox 3.5+ supports String.prototype.trim
    // (`trim` is ~ 5x faster than `strip` in FF3.5)
    strip:          String.prototype.trim || strip,
    stripTags:      stripTags,
    stripScripts:   stripScripts,
    extractScripts: extractScripts,
    evalScripts:    evalScripts,
    escapeHTML:     escapeHTML,
    unescapeHTML:   unescapeHTML,
    toQueryParams:  toQueryParams,
    parseQuery:     toQueryParams,
    toArray:        toArray,
    succ:           succ,
    times:          times,
    camelize:       camelize,
    capitalize:     capitalize,
    underscore:     underscore,
    dasherize:      dasherize,
    inspect:        inspect,
    toJSON:         toJSON,
    unfilterJSON:   unfilterJSON,
    isJSON:         isJSON,
    evalJSON:       evalJSON,
    include:        include,
    startsWith:     startsWith,
    endsWith:       endsWith,
    empty:          empty,
    blank:          blank,
    interpolate:    interpolate
  };
})());

/** section: Language
 * class Template
 *
 *  A class for sophisticated string interpolation.
 *
 *  Any time you have a group of similar objects and you need to produce
 *  formatted output for these objects, maybe inside a loop, you typically
 *  resort to concatenating string literals with the object's fields:
 *
 *      "The TV show " + title + " was created by " + author + ".";
 *
 *  There's nothing wrong with this approach, except that it is hard to
 *  visualize the output immediately just by glancing at the concatenation
 *  expression. The `Template` class provides a much nicer and clearer way of
 *  achieving this formatting.
 *
 *  <h5>Straightforward templates</h5>
 *
 *  The `Template` class uses a basic formatting syntax, similar to what is
 *  used in Ruby. The templates are created from strings that have embedded
 *  symbols in the form (e.g., `#{fieldName}`) that will be replaced by
 *  actual values when the template is applied (evaluated) to an object.
 *
 *      // the template (our formatting expression)
 *      var myTemplate = new Template(
 *       'The TV show #{title} was created by #{author}.');
 *
 *      // our data to be formatted by the template
 *      var show = {
 *        title: 'The Simpsons',
 *        author: 'Matt Groening',
 *        network: 'FOX'
 *      };
 *
 *      // let's format our data
 *      myTemplate.evaluate(show);
 *      // -> "The TV show The Simpsons was created by Matt Groening."
 *
 *  <h5>Templates are meant to be reused</h5>
 *
 *  As the example illustrates, `Template` objects are not tied to specific
 *  data. The data is bound to the template only during the evaluation of the
 *  template, without affecting the template itself. The next example shows the
 *  same template being used with a handful of distinct objects.
 *
 *      // creating a few similar objects
 *      var conversion1 = { from: 'meters', to: 'feet', factor: 3.28 };
 *      var conversion2 = { from: 'kilojoules', to: 'BTUs', factor: 0.9478 };
 *      var conversion3 = { from: 'megabytes', to: 'gigabytes', factor: 1024 };
 *
 *      // the template
 *      var templ = new Template(
 *       'Multiply by #{factor} to convert from #{from} to #{to}.');
 *
 *      // let's format each object
 *      [conversion1, conversion2, conversion3].each( function(conv){
 *          templ.evaluate(conv);
 *      });
 *      // -> Multiply by 3.28 to convert from meters to feet.
 *      // -> Multiply by 0.9478 to convert from kilojoules to BTUs.
 *      // -> Multiply by 1024 to convert from megabytes to gigabytes.
 *
 *  <h5>Escape sequence</h5>
 *
 *  There's always the chance that one day you'll need to have a literal in your
 *  template that looks like a symbol, but is not supposed to be replaced. For
 *  these situations there's an escape character: the backslash (<code>\\</code>).
 *
 *      // NOTE: you're seeing two backslashes here because the backslash
 *      // is also an escape character in JavaScript strings, so a literal
 *      // backslash is represented by two backslashes.
 *      var t = new Template(
 *       'in #{lang} we also use the \\#{variable} syntax for templates.');
 *      var data = { lang:'Ruby', variable: '(not used)' };
 *      t.evaluate(data);
 *      // -> in Ruby we also use the #{variable} syntax for templates.
 *
 *  <h5>Custom syntaxes</h5>
 *
 *  The default syntax of the template strings will probably be enough for most
 *  scenarios. In the rare occasion where the default Ruby-like syntax is
 *  inadequate, there's a provision for customization. `Template`'s
 *  constructor accepts an optional second argument that is a regular expression
 *  object to match the replaceable symbols in the template string. Let's put
 *  together a template that uses a syntax similar to the now ubiquitous `{{ }}`
 *  constructs:
 *
 *      // matches symbols like '{{ field }}'
 *      var syntax = /(^|.|\r|\n)(\{{\s*(\w+)\s*}})/;
 *
 *      var t = new Template(
 *       '<div>Name: <b>{{ name }}</b>, Age: <b>{{ age }}</b></div>',
 *       syntax);
 *      t.evaluate( {name: 'John Smith', age: 26} );
 *      // -> <div>Name: <b>John Smith</b>, Age: <b>26</b></div>
 *
 *  There are important constraints to any custom syntax. Any syntax must
 *  provide at least three groupings in the regular expression. The first
 *  grouping is to capture what comes before the symbol, to detect the backslash
 *  escape character (no, you cannot use a different character). The second
 *  grouping captures the entire symbol and will be completely replaced upon
 *  evaluation. Lastly, the third required grouping captures the name of the
 *  field inside the symbol.
 *
**/
var Template = Class.create({
  /**
   *  new Template(template[, pattern = Template.Pattern])
   *
   *  Creates a Template object.
   *
   *  The optional `pattern` argument expects a `RegExp` that defines a custom
   *  syntax for the replaceable symbols in `template`.
  **/
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  /**
   *  Template#evaluate(object) -> String
   *
   *  Applies the template to `object`'s data, producing a formatted string
   *  with symbols replaced by `object`'s corresponding properties.
  **/
  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return (match[1] + '');

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3],
          pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
          
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
/** section: Language, related to: Hash
 *  $H([object]) -> Hash
 *
 *  Creates a `Hash`. This is purely a convenience wrapper around the Hash
 *  constructor, it does not do anything other than pass any argument it's
 *  given into the Hash constructor and return the result.
 **/
function $H(object) {
  return new Hash(object);
};

/** section: Language
 * class Hash
 *  includes Enumerable
 *
 *  A set of key/value pairs.
 *
 *  `Hash` can be thought of as an associative array, binding unique keys to
 *  values (which are not necessarily unique), though it can not guarantee
 *  consistent order its elements when iterating. Because of the nature of
 *  JavaScript, every object is in fact a hash; but `Hash` adds a number of
 *  methods that let you enumerate keys and values, iterate over key/value
 *  pairs, merge two hashes together, and much more.
 *
 *  <h5>Creating a hash</h5>
 *
 *  You can create a Hash either via `new Hash()` or the convenience alias
 *  `$H()`; there is **no** difference between them. In either case, you may
 *  optionally pass in an object to seed the `Hash`. If you pass in a `Hash`,
 *  it will be cloned.
 *
**/
var Hash = Class.create(Enumerable, (function() {
  /**
   *  new Hash([object])
   *
   *  Creates a new `Hash`. If `object` is given, the new hash will be populated
   *  with all the object's properties. See [[$H]].
   **/
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }

  // Docs for #each even though technically it's implemented by Enumerable
  /**
   *  Hash#each(iterator[, context]) -> Hash
   *  - iterator (Function): A function that expects each item in the `Hash`
   *    as the first argument and a numerical index as the second.
   *  - context (Object): The scope in which to call `iterator`. Determines what
   *    `this` means inside `iterator`.
   *
   *  Iterates over the name/value pairs in the hash.
   *
   *  This is actually just the [[Enumerable#each #each]] method from the
   *  mixed-in [[Enumerable]] module. It is documented here to describe the
   *  structure of the elements passed to the iterator and the order of
   *  iteration.
   *
   *  The iterator's first argument (the "item") is an object with two
   *  properties:
   *
   *  - `key`: the key name as a `String`
   *  - `value`: the corresponding value (which may be `undefined`)
   *
   *  The order of iteration is implementation-dependent, as it relies on
   *  the order of the native `for..in` loop. Although most modern
   *  implementations exhibit *ordered* behavior, this is not standardized and
   *  may not always be the case, and so cannot be relied upon.
   *
   *  <h5>Example</h5>
   *
   *      var h = $H({version: 1.6, author: 'The Core Team'});
   *
   *      h.each(function(pair) {
   *        alert(pair.key + ' = "' + pair.value + '"');
   *      });
   *      // Alerts 'version = "1.6"' and 'author = "The Core Team"'
   *      // -or-
   *      // Alerts 'author = "The Core Team"' and 'version = "1.6"'
  **/

  // Our _internal_ each
  function _each(iterator) {
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  }

  /**
   *  Hash#set(key, value) -> value
   *  - key (String): The key to use for this value.
   *  - value (?): The value to use for this key.
   *
   *  Stores `value` in the hash using the key `key` and returns `value`.
   *
   *  <h5>Example</h5>
   *
   *      var h = $H();
   *      h.keys();
   *      // -> [] (initially empty)
   *      h.set('a', 'apple');
   *      // -> "apple"
   *      h.keys();
   *      // -> ["a"] (has the new entry)
   *      h.get('a');
   *      // -> "apple"
  **/
  function set(key, value) {
    return this._object[key] = value;
  }

  /**
   *  Hash#get(key) -> value
   *
   *  Returns the stored value for the given `key`.
   *
   *  <h5>Examples</h5>
   *
   *      var h = new Hash({a: 'apple', b: 'banana', c: 'coconut'});
   *      h.get('a');
   *      // -> 'apple'
  **/
  function get(key) {
    // simulating poorly supported hasOwnProperty
    if (this._object[key] !== Object.prototype[key])
      return this._object[key];
  }

  /**
   *  Hash#unset(key) -> value
   *
   *  Deletes the stored pair for the given `key` from the hash and returns its
   *  value.
   *
   *  <h5>Example</h5>
   *
   *      var h = new Hash({a: 'apple', b: 'banana', c: 'coconut'});
   *      h.keys();
   *      // -> ["a", "b", "c"]
   *      h.unset('a');
   *      // -> 'apple'
   *      h.keys();
   *      // -> ["b", "c"] ("a" is no longer in the hash)
  **/
  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  /**
   *  Hash#toObject() -> Object
   *
   *  Returns a cloned, vanilla object whose properties (and property values)
   *  match the keys (and values) from the hash.
   *
   *  <h5>Example</h5>
   *
   *      var h = new Hash({ a: 'apple', b: 'banana', c: 'coconut' });
   *      var obj = h.toObject();
   *      obj.a;
   *      // -> "apple"
  **/
  function toObject() {
    return Object.clone(this._object);
  }

  /**
   *  Hash#keys() -> [String...]
   *
   *  Provides an Array containing the keys for items stored in the hash.
   *
   *  The order of the keys is not guaranteed.
   *
   *  <h5>Example</h5>
   *
   *      var h = $H({one: "uno", two: "due", three: "tre"});
   *      h.keys();
   *      // -> ["one", "three", "two"] (these may be in any order)
  **/
  function keys() {
    return this.pluck('key');
  }

  /**
   *  Hash#values() -> Array
   *
   *  Collects the values of the hash and returns them in an array.
   *
   *  The order of the values is not guaranteed.
   *
   *  <h5>Example</h5>
   *
   *      var h = $H({one: "uno", two: "due", three: "tre"});
   *      h.values();
   *      // -> ["uno", "tre", "due"] (these may be in any order)
  **/
  function values() {
    return this.pluck('value');
  }

  /**
   *  Hash#index(value) -> String
   *
   *  Returns the first key in the hash whose value matches `value`.
   *  Returns `false` if there is no such key.
  **/
  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  }

  /**
   *  Hash#merge(object) -> Hash
   *  - object (Object | Hash): The object to merge with this hash to produce
   *    the resulting hash.
   *
   *  Returns a new `Hash` instance with `object`'s key/value pairs merged in;
   *  this hash remains unchanged.
   *
   *  To modify the original hash in place, use [[Hash#update]].
   *
   *  <h5>Example</h5>
   *
   *      var h = $H({one: "uno", two: "due"});
   *      var h2 = h.merge({three: "tre"});
   *      h.keys();
   *      // -> ["one", "two"] (unchanged)
   *      h2.keys();
   *      // -> ["one", "two", "three"] (has merged contents)
  **/
  function merge(object) {
    return this.clone().update(object);
  }

  /**
   *  Hash#update(object) -> Hash
   *  - object (Object | Hash): The object to merge with this hash to produce
   *    the resulting hash.
   *
   *  Updates a hash *in place* with the key/value pairs of `object`, returns
   *  the hash.
   *
   *  `update` modifies the hash. To get a new hash instead, use
   *  [[Hash#merge]].
   *
   *  <h5>Example</h5>
   *
   *      var h = $H({one: "uno", two: "due"});
   *      h.update({three: "tre"});
   *      // -> h (a reference to the original hash)
   *      h.keys();
   *      // -> ["one", "two", "three"] (has merged contents)
  **/
  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  }

  // Private. No PDoc necessary.
  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  /** related to: String#toQueryParams
   *  Hash#toQueryString() -> String
   *
   *  Returns a URL-encoded string containing the hash's contents as query
   *  parameters according to the following rules:
   *
   *  - An undefined value results a parameter with no value portion at all
   *    (simply the key name, no equal sign).
   *  - A null value results a parameter with a blank value (the key followed
   *    by an equal sign and nothing else).
   *  - A boolean value results a parameter with the value "true" or "false".
   *  - An Array value results in a parameter for each array element, in
   *    array order, each using the same key.
   *  - All keys and values are URI-encoded using JavaScript's native
   *    `encodeURIComponent` function.
   *
   *  The order of pairs in the string is not guaranteed, other than the order
   *  of array values described above.
   *
   *  <h5>Example</h5>
   *
   *      $H({action: 'ship',
   *          order_id: 123,
   *          fees: ['f1', 'f2']
   *      }).toQueryString();
   *      // -> "action=ship&order_id=123&fees=f1&fees=f2"
   *
   *      $H({comment: '',
   *          'key with spaces': true,
   *          related_order: undefined,
   *          contents: null,
   *          'label': 'a demo'
   *      }).toQueryString();
   *      // -> "comment=&key%20with%20spaces=true&related_order&contents=&label=a%20demo"
   *
   *      // an empty hash is an empty query string:
   *      $H().toQueryString();
   *      // -> ""
  **/
  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;

      if (values && typeof values == 'object') {
        if (Object.isArray(values))
          return results.concat(values.map(toQueryPair.curry(key)));
      } else results.push(toQueryPair(key, values));
      return results;
    }).join('&');
  }

  /** related to: Object.inspect
   *  Hash#inspect() -> String
   *
   *  Returns the debug-oriented string representation of the Hash.
  **/
  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

  /** related to: Object.toJSON
   *  Hash#toJSON() -> String
   *
   *  Returns a JSON string containing the keys and values in this hash.
   *
   *  <h5>Example</h5>
   *
   *      var h = $H({'a': 'apple', 'b': 23, 'c': false});
   *      h.toJSON();
   *      // -> {"a": "apple", "b": 23, "c": false}
  **/
  function toJSON() {
    return Object.toJSON(this.toObject());
  }

  /**
   *  Hash#clone() -> Hash
   *
   *  Returns a clone of this Hash.
  **/
  function clone() {
    return new Hash(this);
  }

  return {
    initialize:             initialize,
    _each:                  _each,
    set:                    set,
    get:                    get,
    unset:                  unset,
    toObject:               toObject,
    toTemplateReplacements: toObject,
    keys:                   keys,
    values:                 values,
    index:                  index,
    merge:                  merge,
    update:                 update,
    toQueryString:          toQueryString,
    inspect:                inspect,
    toJSON:                 toJSON,
    clone:                  clone
  };
})());

Hash.from = $H;
/** section: Language
 * class Number
 *
 *  Extensions to the built-in `Number` object.
 *
 *  Prototype extends native JavaScript numbers in order to provide:
 *
 *  * [[ObjectRange]] compatibility, through [[Number#succ]].
 *  * Numerical loops with [[Number#times]].
 *  * Simple utility methods such as [[Number#toColorPart]] and
 *    [[Number#toPaddedString]].
 *  * Instance-method aliases of many functions in the `Math` namespace.
 *
**/
Object.extend(Number.prototype, (function() {
  /**
   *  Number#toColorPart() -> String
   *
   *  Produces a 2-digit hexadecimal representation of the number
   *  (which is therefore assumed to be in the \[0..255\] range, inclusive).
   *  Useful for composing CSS color strings.
   *
   *  <h5>Example</h5>
   *
   *      10.toColorPart()
   *      // -> "0a"
  **/
  function toColorPart() {
    return this.toPaddedString(2, 16);
  }

  /**
   *  Number#succ() -> Number
   *
   *  Returns the successor of the current Number, as defined by current + 1.
   *  Used to make numbers compatible with ObjectRange.
  **/
  function succ() {
    return this + 1;
  }

  /**
   *  Number#times(iterator[,context]) -> Number
   *  - iterator (Function): An iterator function to call.
   *  - context (Object): An optional context (`this` value) to use when
   *    calling `iterator`.
   *
   *  Calls `iterator` the specified number of times, passing in a number as
   *  the first parameter. The number will be 0 on first call, 1 on second
   *  call, etc. `times` returns the number instance it was called on.
   *
   *  <h5>Example</h5>
   *
   *      (3).times(alert);
   *      // -> Alerts "0", then "1", then "2"; returns 3
   *
   *      var obj = {count: 0, total: 0};
   *      function add(addend) {
   *        ++this.count;
   *        this.total += addend;
   *      }
   *      (4).times(add, obj);
   *      // -> 4
   *      obj.count;
   *      // -> 4
   *      obj.total;
   *      // -> 6 (e.g., 0 + 1 + 2 + 3)
  **/
  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  }

  /**
   *  Number#toPaddedString(length[, radix]) -> String
   *  - length (Number): The minimum length for the resulting string.
   *  - radix (Number): An optional radix for the string representation,
   *    defaults to 10 (decimal).
   *
   *  Returns a string representation of the number padded with leading 0s so
   *  that the string's length is at least equal to `length`. Takes an optional
   *  `radix` argument which specifies the base to use for conversion.
   *
   *  <h5>Examples</h5>
   *
   *      (13).toPaddedString(4);
   *      // -> "0013"
   *
   *      (13).toPaddedString(2);
   *      // -> "13"
   *
   *      (13).toPaddedString(1);
   *      // -> "13"
   *
   *      (13).toPaddedString(4, 16)
   *      // -> "000d"
   *
   *      (13).toPaddedString(4, 2);
   *      // -> "1101"
  **/
  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  }

  /** related to: Object.toJSON
   *  Number#toJSON() -> String
   *
   *  Returns a JSON string representation of the number.
  **/
  function toJSON() {
    return isFinite(this) ? this.toString() : 'null';
  }

  /**
   *  Number#abs() -> Number
   *
   *  Returns the absolute value of the number. Convenience method that simply
   *  calls `Math.abs` on this instance and returns the result.
  **/
  function abs() {
    return Math.abs(this);
  }

  /**
   *  Number#round() -> Number
   *
   *  Rounds the number to the nearest integer. Convenience method that simply
   *  calls `Math.round` on this instance and returns the result.
  **/
  function round() {
    return Math.round(this);
  }

  /**
   *  Number#ceil() -> Number
   *
   *  Returns the smallest integer greater than or equal to the number.
   *  Convenience method that simply calls `Math.ceil` on this instance and
   *  returns the result.
  **/
  function ceil() {
    return Math.ceil(this);
  }

  /**
   *  Number#floor() -> Number
   *
   *  Returns the largest integer less than or equal to the number.
   *  Convenience method that simply calls `Math.floor` on this instance and
   *  returns the result.
  **/
  function floor() {
    return Math.floor(this);
  }

  return {
    toColorPart:    toColorPart,
    succ:           succ,
    times:          times,
    toPaddedString: toPaddedString,
    toJSON:         toJSON,
    abs:            abs,
    round:          round,
    ceil:           ceil,
    floor:          floor
  };
})());
/** section: Language
 * class ObjectRange
 *  includes Enumerable
 *
 *  A succession of values.
 *
 *  An `ObjectRange` can model a range of any value that implements a `succ`
 *  method (which links that value to its "successor").
 *
 *  Prototype provides such a method for [[Number]] and [[String]], but you
 *  are (of course) welcome to implement useful semantics in your own objects,
 *  in order to enable ranges based on them.
 *
 *  `ObjectRange` mixes in [[Enumerable]], which makes ranges very versatile.
 *  It takes care, however, to override the default code for `include`, to
 *  achieve better efficiency.
 *
 *  While `ObjectRange` does provide a constructor, the preferred way to obtain
 *  a range is to use the [[$R]] utility function, which is strictly equivalent
 *  (only way more concise to use).
**/

/** section: Language
 *  $R(start, end[, exclusive = false]) -> ObjectRange
 *
 *  Creates a new ObjectRange object.
 *  This method is a convenience wrapper around the [[ObjectRange]] constructor,
 *  but $R is the preferred alias.
**/
function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  /**
   *  new ObjectRange(start, end[, exclusive = false])
   *
   *  Creates a new `ObjectRange`.
   *
   *  The `exclusive` argument specifies whether `end` itself is a part of the
   *  range.
  **/
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  }

  function _each(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  }

  /**
   *  ObjectRange#include(value) -> Boolean
   *
   *  Determines whether the value is included in the range.
  **/
  function include(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }

  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());

/** section: scripty2 core
 * class Function
 *  
 *  Extensions to the built-in `Function` object.
**/

/**
 *  Function#optionize() -> Function
 *
 *  Given a function whose last parameter is an object
 *  of options, return a function that accepts a variable
 *  number of arguments and always passes the last argument
 *  that is an object to the options parameter. This way,
 *  the function can be called with just options, leaving
 *  the other parameters undefined.
 *
 *      var logOptions = function(a, b, options){
 *        console.log(options);
 *      }.optionize();
 *      logOptions({hello: "world"}) -> logs {hello: "world"}
 *      logOptions(1, {hello: "world"}) -> logs {hello: "world"}
 *      logOptions(1, 2, {hello: "world"}) -> logs {hello: "world"}
 *
 *  But note that providing too many arguments will not work:
 *
 *      logOptions(1,2,3, {hello: "world"}) -> logs 3
**/
Function.prototype.optionize = function(){
  var self = this, argumentNames = self.argumentNames(), optionIndex = this.length - 1;
  
  var method = function() {
    var args = $A(arguments);
    
    var options = (typeof args.last() === 'object') ? args.pop() : {};
    var prefilledArgs = [];
    if (optionIndex > 0) {
      prefilledArgs = ((args.length > 0 ? args : [null]).inGroupsOf(
       optionIndex).flatten()).concat(options);
    }
    
    return self.apply(this, prefilledArgs);    
  };
  method.argumentNames = function() { return argumentNames; };
  return method;
};

Function.ABSTRACT = function() {
  throw "Abstract method. Implement in subclass.";
};

/** section: scripty2 core
 * class Number
 *  
 *  Extensions to the built-in `Number` object.
**/
Object.extend(Number.prototype, {
  /**
   *  Number#constrain(min, max) -> Number
   *  
   *  Returns `min` if number is less than `min`, `max` if number is greater
   *  than `max`. Returns itself otherwise.
  **/
  constrain: function(n1, n2) {
    var min = (n1 < n2) ? n1 : n2;
    var max = (n1 < n2) ? n2 : n1;
    
    var num = Number(this);
    
    if (num < min) num = min;
    if (num > max) num = max;
    
    return num;
  },
  
  /**
   *  Number#nearer(n1, n2) -> Number
   *  
   *  Returns either `n1` or `n2` — whichever is closer to the number, in
   *  absolute terms.
  **/
  nearer: function(n1, n2) {
    var num = Number(this);
    
    var diff1 = Math.abs(num - n1);
    var diff2 = Math.abs(num - n2);
    
    return (diff1 < diff2) ? n1 : n2;
  },
  
  /**
   *  Number#tween(target, position) -> Number
   *  - target (Number): tween target
   *  - position (Number): position between 0 (start of tween) and (end of
   *    tween); can also be < 0 and > 1.
   *
   *  Returns the number that is a given percentage between this number and
   *  a target number.
   *
   *      (1).tween(2, 0.5) -> 1.5
   *      (1).tween(2, 0) -> 1
   *      (1).tween(2, 1) -> 2
  **/
  tween: function(target, position) {
    return this + (target-this) * position;
  }
});

/** section: scripty2 core
 * class Object
 *  
 *  Extensions to the built-in `Object` object.
**/

/**
 *  Object.propertize(property, object) -> Object
 *  - property (String | Object): item or name of item
 *  - object (Object): namespace in which to look for named item
 *
 *  If `property` is a string, finds it in the provided `object`.
 *  Otherwise returns `property`.
 *
 *      Object.propertize(S2.FX.Transitions.sinusoidal, S2.FX.Transitions) -> S2.FX.Transitions.sinusoidal
 *      Object.propertize('sinusoidal', S2.FX.Transitions) -> S2.FX.Transitions.sinusoidal
 *
**/
Object.propertize = function(property, object){
  return Object.isString(property) ? object[property] : property;
};

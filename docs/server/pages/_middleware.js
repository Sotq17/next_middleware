(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([[909],{

/***/ 6942:
/***/ (function(__unused_webpack_module, exports) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),

/***/ 8455:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(6942)
var ieee754 = __webpack_require__(8320)
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof SharedArrayBuffer !== 'undefined' &&
      (isInstance(value, SharedArrayBuffer) ||
      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

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

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
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
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()


/***/ }),

/***/ 8320:
/***/ (function(__unused_webpack_module, exports) {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ 8647:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* export default binding */ __WEBPACK_DEFAULT_EXPORT__; }
/* harmony export */ });
/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4384);

        

        var mod = __webpack_require__(9184)
        var handler = mod.middleware || mod.default;

        if (typeof handler !== 'function') {
          throw new Error('The Middleware "pages/_middleware" must export a `middleware` or a `default` function');
        }

        /* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(opts) {
          return (0,next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_0__/* .adapter */ .V)({
              ...opts,
              page: "/_middleware",
              handler,
          })
        }
    

/***/ }),

/***/ 8796:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.TRACE_OUTPUT_VERSION = exports.STATIC_STATUS_PAGES = exports.OPTIMIZED_FONT_PROVIDERS = exports.GOOGLE_FONT_PROVIDER = exports.FLIGHT_PROPS_ID = exports.SERVER_PROPS_ID = exports.STATIC_PROPS_ID = exports.PERMANENT_REDIRECT_STATUS = exports.TEMPORARY_REDIRECT_STATUS = exports.MIDDLEWARE_SSR_RUNTIME_WEBPACK = exports.CLIENT_STATIC_FILES_RUNTIME_POLYFILLS_SYMBOL = exports.CLIENT_STATIC_FILES_RUNTIME_WEBPACK = exports.CLIENT_STATIC_FILES_RUNTIME_AMP = exports.CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH = exports.CLIENT_STATIC_FILES_RUNTIME_MAIN = exports.MIDDLEWARE_REACT_LOADABLE_MANIFEST = exports.MIDDLEWARE_BUILD_MANIFEST = exports.MIDDLEWARE_FLIGHT_MANIFEST = exports.STRING_LITERAL_DROP_BUNDLE = exports.BODY_RENDER_TARGET = exports.CLIENT_STATIC_FILES_RUNTIME = exports.CLIENT_STATIC_FILES_PATH = exports.CLIENT_PUBLIC_FILES_PATH = exports.BLOCKED_PAGES = exports.BUILD_ID_FILE = exports.CONFIG_FILES = exports.SERVERLESS_DIRECTORY = exports.SERVER_DIRECTORY = exports.FONT_MANIFEST = exports.REACT_LOADABLE_MANIFEST = exports.DEV_MIDDLEWARE_MANIFEST = exports.MIDDLEWARE_MANIFEST = exports.DEV_CLIENT_PAGES_MANIFEST = exports.SERVER_FILES_MANIFEST = exports.IMAGES_MANIFEST = exports.ROUTES_MANIFEST = exports.PRERENDER_MANIFEST = exports.EXPORT_DETAIL = exports.EXPORT_MARKER = exports.BUILD_MANIFEST = exports.PAGES_MANIFEST = exports.PHASE_DEVELOPMENT_SERVER = exports.PHASE_PRODUCTION_SERVER = exports.PHASE_PRODUCTION_BUILD = exports.PHASE_EXPORT = void 0;
const PHASE_EXPORT = 'phase-export';
exports.PHASE_EXPORT = PHASE_EXPORT;
const PHASE_PRODUCTION_BUILD = 'phase-production-build';
exports.PHASE_PRODUCTION_BUILD = PHASE_PRODUCTION_BUILD;
const PHASE_PRODUCTION_SERVER = 'phase-production-server';
exports.PHASE_PRODUCTION_SERVER = PHASE_PRODUCTION_SERVER;
const PHASE_DEVELOPMENT_SERVER = 'phase-development-server';
exports.PHASE_DEVELOPMENT_SERVER = PHASE_DEVELOPMENT_SERVER;
const PAGES_MANIFEST = 'pages-manifest.json';
exports.PAGES_MANIFEST = PAGES_MANIFEST;
const BUILD_MANIFEST = 'build-manifest.json';
exports.BUILD_MANIFEST = BUILD_MANIFEST;
const EXPORT_MARKER = 'export-marker.json';
exports.EXPORT_MARKER = EXPORT_MARKER;
const EXPORT_DETAIL = 'export-detail.json';
exports.EXPORT_DETAIL = EXPORT_DETAIL;
const PRERENDER_MANIFEST = 'prerender-manifest.json';
exports.PRERENDER_MANIFEST = PRERENDER_MANIFEST;
const ROUTES_MANIFEST = 'routes-manifest.json';
exports.ROUTES_MANIFEST = ROUTES_MANIFEST;
const IMAGES_MANIFEST = 'images-manifest.json';
exports.IMAGES_MANIFEST = IMAGES_MANIFEST;
const SERVER_FILES_MANIFEST = 'required-server-files.json';
exports.SERVER_FILES_MANIFEST = SERVER_FILES_MANIFEST;
const DEV_CLIENT_PAGES_MANIFEST = '_devPagesManifest.json';
exports.DEV_CLIENT_PAGES_MANIFEST = DEV_CLIENT_PAGES_MANIFEST;
const MIDDLEWARE_MANIFEST = 'middleware-manifest.json';
exports.MIDDLEWARE_MANIFEST = MIDDLEWARE_MANIFEST;
const DEV_MIDDLEWARE_MANIFEST = '_devMiddlewareManifest.json';
exports.DEV_MIDDLEWARE_MANIFEST = DEV_MIDDLEWARE_MANIFEST;
const REACT_LOADABLE_MANIFEST = 'react-loadable-manifest.json';
exports.REACT_LOADABLE_MANIFEST = REACT_LOADABLE_MANIFEST;
const FONT_MANIFEST = 'font-manifest.json';
exports.FONT_MANIFEST = FONT_MANIFEST;
const SERVER_DIRECTORY = 'server';
exports.SERVER_DIRECTORY = SERVER_DIRECTORY;
const SERVERLESS_DIRECTORY = 'serverless';
exports.SERVERLESS_DIRECTORY = SERVERLESS_DIRECTORY;
const CONFIG_FILES = [
    'next.config.js',
    'next.config.mjs'
];
exports.CONFIG_FILES = CONFIG_FILES;
const BUILD_ID_FILE = 'BUILD_ID';
exports.BUILD_ID_FILE = BUILD_ID_FILE;
const BLOCKED_PAGES = [
    '/_document',
    '/_app',
    '/_error'
];
exports.BLOCKED_PAGES = BLOCKED_PAGES;
const CLIENT_PUBLIC_FILES_PATH = 'public';
exports.CLIENT_PUBLIC_FILES_PATH = CLIENT_PUBLIC_FILES_PATH;
const CLIENT_STATIC_FILES_PATH = 'static';
exports.CLIENT_STATIC_FILES_PATH = CLIENT_STATIC_FILES_PATH;
const CLIENT_STATIC_FILES_RUNTIME = 'runtime';
exports.CLIENT_STATIC_FILES_RUNTIME = CLIENT_STATIC_FILES_RUNTIME;
const BODY_RENDER_TARGET = '__NEXT_BODY_RENDER_TARGET__';
exports.BODY_RENDER_TARGET = BODY_RENDER_TARGET;
const STRING_LITERAL_DROP_BUNDLE = '__NEXT_DROP_CLIENT_FILE__';
exports.STRING_LITERAL_DROP_BUNDLE = STRING_LITERAL_DROP_BUNDLE;
const MIDDLEWARE_FLIGHT_MANIFEST = 'middleware-flight-manifest';
exports.MIDDLEWARE_FLIGHT_MANIFEST = MIDDLEWARE_FLIGHT_MANIFEST;
const MIDDLEWARE_BUILD_MANIFEST = 'middleware-build-manifest';
exports.MIDDLEWARE_BUILD_MANIFEST = MIDDLEWARE_BUILD_MANIFEST;
const MIDDLEWARE_REACT_LOADABLE_MANIFEST = 'middleware-react-loadable-manifest';
exports.MIDDLEWARE_REACT_LOADABLE_MANIFEST = MIDDLEWARE_REACT_LOADABLE_MANIFEST;
const CLIENT_STATIC_FILES_RUNTIME_MAIN = `main`;
exports.CLIENT_STATIC_FILES_RUNTIME_MAIN = CLIENT_STATIC_FILES_RUNTIME_MAIN;
const CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH = `react-refresh`;
exports.CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH = CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH;
const CLIENT_STATIC_FILES_RUNTIME_AMP = `amp`;
exports.CLIENT_STATIC_FILES_RUNTIME_AMP = CLIENT_STATIC_FILES_RUNTIME_AMP;
const CLIENT_STATIC_FILES_RUNTIME_WEBPACK = `webpack`;
exports.CLIENT_STATIC_FILES_RUNTIME_WEBPACK = CLIENT_STATIC_FILES_RUNTIME_WEBPACK;
const CLIENT_STATIC_FILES_RUNTIME_POLYFILLS_SYMBOL = Symbol(`polyfills`);
exports.CLIENT_STATIC_FILES_RUNTIME_POLYFILLS_SYMBOL = CLIENT_STATIC_FILES_RUNTIME_POLYFILLS_SYMBOL;
const MIDDLEWARE_SSR_RUNTIME_WEBPACK = 'middleware-ssr-runtime';
exports.MIDDLEWARE_SSR_RUNTIME_WEBPACK = MIDDLEWARE_SSR_RUNTIME_WEBPACK;
const TEMPORARY_REDIRECT_STATUS = 307;
exports.TEMPORARY_REDIRECT_STATUS = TEMPORARY_REDIRECT_STATUS;
const PERMANENT_REDIRECT_STATUS = 308;
exports.PERMANENT_REDIRECT_STATUS = PERMANENT_REDIRECT_STATUS;
const STATIC_PROPS_ID = '__N_SSG';
exports.STATIC_PROPS_ID = STATIC_PROPS_ID;
const SERVER_PROPS_ID = '__N_SSP';
exports.SERVER_PROPS_ID = SERVER_PROPS_ID;
const FLIGHT_PROPS_ID = '__N_RSC';
exports.FLIGHT_PROPS_ID = FLIGHT_PROPS_ID;
const GOOGLE_FONT_PROVIDER = 'https://fonts.googleapis.com/css';
exports.GOOGLE_FONT_PROVIDER = GOOGLE_FONT_PROVIDER;
const OPTIMIZED_FONT_PROVIDERS = [
    {
        url: GOOGLE_FONT_PROVIDER,
        preconnect: 'https://fonts.gstatic.com'
    },
    {
        url: 'https://use.typekit.net',
        preconnect: 'https://use.typekit.net'
    }, 
];
exports.OPTIMIZED_FONT_PROVIDERS = OPTIMIZED_FONT_PROVIDERS;
const STATIC_STATUS_PAGES = [
    '/500'
];
exports.STATIC_STATUS_PAGES = STATIC_STATUS_PAGES;
const TRACE_OUTPUT_VERSION = 1;
exports.TRACE_OUTPUT_VERSION = TRACE_OUTPUT_VERSION; //# sourceMappingURL=constants.js.map


/***/ }),

/***/ 2399:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.detectDomainLocale = detectDomainLocale;
function detectDomainLocale(domainItems, hostname, detectedLocale) {
    let domainItem;
    if (domainItems) {
        if (detectedLocale) {
            detectedLocale = detectedLocale.toLowerCase();
        }
        for (const item of domainItems){
            var ref, ref1;
            // remove port if present
            const domainHostname = (ref = item.domain) === null || ref === void 0 ? void 0 : ref.split(':')[0].toLowerCase();
            if (hostname === domainHostname || detectedLocale === item.defaultLocale.toLowerCase() || ((ref1 = item.locales) === null || ref1 === void 0 ? void 0 : ref1.some((locale)=>locale.toLowerCase() === detectedLocale
            ))) {
                domainItem = item;
                break;
            }
        }
    }
    return domainItem;
} //# sourceMappingURL=detect-domain-locale.js.map


/***/ }),

/***/ 8993:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.getLocaleMetadata = getLocaleMetadata;
var _acceptHeader = __webpack_require__(5681);
var _denormalizePagePath = __webpack_require__(6166);
var _detectDomainLocale = __webpack_require__(2399);
var _formatUrl = __webpack_require__(4871);
var _normalizeLocalePath = __webpack_require__(6293);
function getLocaleMetadata(params) {
    const { i18n  } = params.nextConfig;
    const { cookies , headers , nextConfig , url  } = params;
    const path = (0, _normalizeLocalePath).normalizeLocalePath(url.pathname, i18n.locales);
    const domain = (0, _detectDomainLocale).detectDomainLocale(i18n.domains, getHostname(url, headers));
    const defaultLocale = (domain === null || domain === void 0 ? void 0 : domain.defaultLocale) || i18n.defaultLocale;
    const preferredLocale = getAcceptPreferredLocale(i18n, headers);
    return {
        path,
        domain,
        defaultLocale,
        locale: (path === null || path === void 0 ? void 0 : path.detectedLocale) || defaultLocale,
        redirect: getRedirect({
            locale: {
                preferred: preferredLocale,
                default: defaultLocale,
                detected: (path === null || path === void 0 ? void 0 : path.detectedLocale) || (domain === null || domain === void 0 ? void 0 : domain.defaultLocale) || getLocaleFromCookie(i18n, cookies) || preferredLocale || i18n.defaultLocale
            },
            domain,
            nextConfig,
            url
        }),
        trailingSlash: url.pathname !== '/' ? url.pathname.endsWith('/') : nextConfig.trailingSlash
    };
}
function getLocaleFromCookie(i18n, cookies) {
    var ref, ref1;
    const nextLocale = (ref = cookies()) === null || ref === void 0 ? void 0 : (ref1 = ref.NEXT_LOCALE) === null || ref1 === void 0 ? void 0 : ref1.toLowerCase();
    return nextLocale ? i18n.locales.find((locale)=>nextLocale === locale.toLowerCase()
    ) : undefined;
}
function getAcceptPreferredLocale(i18n, headers) {
    const value = headers === null || headers === void 0 ? void 0 : headers['accept-language'];
    if (i18n.localeDetection !== false && value && !Array.isArray(value)) {
        try {
            return (0, _acceptHeader).acceptLanguage(value, i18n.locales);
        } catch (err) {
        }
    }
}
function getHostname(parsed, headers) {
    var ref;
    return (ref = !Array.isArray(headers === null || headers === void 0 ? void 0 : headers.host) && (headers === null || headers === void 0 ? void 0 : headers.host) || parsed.hostname) === null || ref === void 0 ? void 0 : ref.split(':')[0].toLowerCase();
}
function getRedirect({ domain , locale , nextConfig , url  }) {
    const isRootPath = (0, _denormalizePagePath).denormalizePagePath(url.pathname) === '/';
    if (nextConfig.i18n.localeDetection !== false && isRootPath) {
        const preferredDomain = (0, _detectDomainLocale).detectDomainLocale(nextConfig.i18n.domains, undefined, locale.preferred);
        if (domain && preferredDomain) {
            const isPDomain = preferredDomain.domain === domain.domain;
            const isPLocale = preferredDomain.defaultLocale === locale.preferred;
            if (!isPDomain || !isPLocale) {
                const scheme = `http${preferredDomain.http ? '' : 's'}`;
                const rlocale = isPLocale ? '' : locale.preferred;
                return `${scheme}://${preferredDomain.domain}/${rlocale}`;
            }
        }
        if (locale.detected.toLowerCase() !== locale.default.toLowerCase()) {
            return (0, _formatUrl).formatUrl({
                ...url,
                pathname: `${nextConfig.basePath || ''}/${locale.detected}`
            });
        }
    }
} //# sourceMappingURL=get-locale-metadata.js.map


/***/ }),

/***/ 6293:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.normalizeLocalePath = normalizeLocalePath;
function normalizeLocalePath(pathname, locales) {
    let detectedLocale;
    // first item will be empty string from splitting at first char
    const pathnameParts = pathname.split('/');
    (locales || []).some((locale)=>{
        if (pathnameParts[1].toLowerCase() === locale.toLowerCase()) {
            detectedLocale = locale;
            pathnameParts.splice(1, 1);
            pathname = pathnameParts.join('/') || '/';
            return true;
        }
        return false;
    });
    return {
        pathname,
        detectedLocale
    };
} //# sourceMappingURL=normalize-locale-path.js.map


/***/ }),

/***/ 4871:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.formatUrl = formatUrl;
var querystring = _interopRequireWildcard(__webpack_require__(1307));
function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {
        };
        if (obj != null) {
            for(var key in obj){
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {
                    };
                    if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                    } else {
                        newObj[key] = obj[key];
                    }
                }
            }
        }
        newObj.default = obj;
        return newObj;
    }
}
const slashedProtocols = /https?|ftp|gopher|file/;
function formatUrl(urlObj) {
    let { auth , hostname  } = urlObj;
    let protocol = urlObj.protocol || '';
    let pathname = urlObj.pathname || '';
    let hash = urlObj.hash || '';
    let query = urlObj.query || '';
    let host = false;
    auth = auth ? encodeURIComponent(auth).replace(/%3A/i, ':') + '@' : '';
    if (urlObj.host) {
        host = auth + urlObj.host;
    } else if (hostname) {
        host = auth + (~hostname.indexOf(':') ? `[${hostname}]` : hostname);
        if (urlObj.port) {
            host += ':' + urlObj.port;
        }
    }
    if (query && typeof query === 'object') {
        query = String(querystring.urlQueryToSearchParams(query));
    }
    let search = urlObj.search || query && `?${query}` || '';
    if (protocol && protocol.substr(-1) !== ':') protocol += ':';
    if (urlObj.slashes || (!protocol || slashedProtocols.test(protocol)) && host !== false) {
        host = '//' + (host || '');
        if (pathname && pathname[0] !== '/') pathname = '/' + pathname;
    } else if (!host) {
        host = '';
    }
    if (hash && hash[0] !== '#') hash = '#' + hash;
    if (search && search[0] !== '?') search = '?' + search;
    pathname = pathname.replace(/[?#]/g, encodeURIComponent);
    search = search.replace('#', '%23');
    return `${protocol}${host}${pathname}${search}${hash}`;
} //# sourceMappingURL=format-url.js.map


/***/ }),

/***/ 1307:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.searchParamsToUrlQuery = searchParamsToUrlQuery;
exports.urlQueryToSearchParams = urlQueryToSearchParams;
exports.assign = assign;
function searchParamsToUrlQuery(searchParams) {
    const query = {
    };
    searchParams.forEach((value, key)=>{
        if (typeof query[key] === 'undefined') {
            query[key] = value;
        } else if (Array.isArray(query[key])) {
            query[key].push(value);
        } else {
            query[key] = [
                query[key],
                value
            ];
        }
    });
    return query;
}
function stringifyUrlQueryParam(param) {
    if (typeof param === 'string' || typeof param === 'number' && !isNaN(param) || typeof param === 'boolean') {
        return String(param);
    } else {
        return '';
    }
}
function urlQueryToSearchParams(urlQuery) {
    const result = new URLSearchParams();
    Object.entries(urlQuery).forEach(([key, value])=>{
        if (Array.isArray(value)) {
            value.forEach((item)=>result.append(key, stringifyUrlQueryParam(item))
            );
        } else {
            result.set(key, stringifyUrlQueryParam(value));
        }
    });
    return result;
}
function assign(target, ...searchParamsList) {
    searchParamsList.forEach((searchParams)=>{
        Array.from(searchParams.keys()).forEach((key)=>target.delete(key)
        );
        searchParams.forEach((value, key)=>target.append(key, value)
        );
    });
    return target;
} //# sourceMappingURL=querystring.js.map


/***/ }),

/***/ 9184:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "middleware": function() { return /* binding */ middleware; }
});

// EXTERNAL MODULE: ./node_modules/next/dist/server/web/spec-extension/request.js
var request = __webpack_require__(7953);
// EXTERNAL MODULE: ./node_modules/next/dist/server/web/spec-extension/response.js
var response = __webpack_require__(7057);
;// CONCATENATED MODULE: ./node_modules/next/server.js



;// CONCATENATED MODULE: ./src/pages/_middleware.ts
/* provided dependency */ var Buffer = __webpack_require__(8455)["Buffer"];

// Nextのリクエスト前に動かすmiddleware
function middleware(req) {
    const basicAuth = req.headers.get('authorization');
    if (basicAuth) {
        const auth = basicAuth.split(' ')[1];
        const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
        if (user === "admin" && pwd === "pass") {
            return response.NextResponse.next();
        }
    }
    return new Response('Auth required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"'
        }
    });
}


/***/ }),

/***/ 9802:
/***/ (function(module) {

var __dirname = "/";
module.exports=(()=>{"use strict";var e={583:(e,r)=>{r.parse=parse;r.serialize=serialize;var i=decodeURIComponent;var t=encodeURIComponent;var a=/; */;var n=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;function parse(e,r){if(typeof e!=="string"){throw new TypeError("argument str must be a string")}var t={};var n=r||{};var o=e.split(a);var s=n.decode||i;for(var p=0;p<o.length;p++){var f=o[p];var u=f.indexOf("=");if(u<0){continue}var c=f.substr(0,u).trim();var v=f.substr(++u,f.length).trim();if('"'==v[0]){v=v.slice(1,-1)}if(undefined==t[c]){t[c]=tryDecode(v,s)}}return t}function serialize(e,r,i){var a=i||{};var o=a.encode||t;if(typeof o!=="function"){throw new TypeError("option encode is invalid")}if(!n.test(e)){throw new TypeError("argument name is invalid")}var s=o(r);if(s&&!n.test(s)){throw new TypeError("argument val is invalid")}var p=e+"="+s;if(null!=a.maxAge){var f=a.maxAge-0;if(isNaN(f)||!isFinite(f)){throw new TypeError("option maxAge is invalid")}p+="; Max-Age="+Math.floor(f)}if(a.domain){if(!n.test(a.domain)){throw new TypeError("option domain is invalid")}p+="; Domain="+a.domain}if(a.path){if(!n.test(a.path)){throw new TypeError("option path is invalid")}p+="; Path="+a.path}if(a.expires){if(typeof a.expires.toUTCString!=="function"){throw new TypeError("option expires is invalid")}p+="; Expires="+a.expires.toUTCString()}if(a.httpOnly){p+="; HttpOnly"}if(a.secure){p+="; Secure"}if(a.sameSite){var u=typeof a.sameSite==="string"?a.sameSite.toLowerCase():a.sameSite;switch(u){case true:p+="; SameSite=Strict";break;case"lax":p+="; SameSite=Lax";break;case"strict":p+="; SameSite=Strict";break;case"none":p+="; SameSite=None";break;default:throw new TypeError("option sameSite is invalid")}}return p}function tryDecode(e,r){try{return r(e)}catch(r){return e}}}};var r={};function __nccwpck_require__(i){if(r[i]){return r[i].exports}var t=r[i]={exports:{}};var a=true;try{e[i](t,t.exports,__nccwpck_require__);a=false}finally{if(a)delete r[i]}return t.exports}__nccwpck_require__.ab=__dirname+"/";return __nccwpck_require__(583)})();

/***/ }),

/***/ 2824:
/***/ (function(module, exports, __webpack_require__) {

var __dirname = "/";
var __WEBPACK_AMD_DEFINE_RESULT__;module.exports=(()=>{var i={578:function(i,s){(function(e,o){"use strict";var r="0.7.28",a="",l="?",w="function",n="undefined",t="object",b="string",d="major",u="model",p="name",v="type",f="vendor",g="version",c="architecture",x="console",k="mobile",m="tablet",y="smarttv",S="wearable",_="embedded",h=255;var A={extend:function(i,s){var e={};for(var o in i){if(s[o]&&s[o].length%2===0){e[o]=s[o].concat(i[o])}else{e[o]=i[o]}}return e},has:function(i,s){return typeof i===b?s.toLowerCase().indexOf(i.toLowerCase())!==-1:false},lowerize:function(i){return i.toLowerCase()},major:function(i){return typeof i===b?i.replace(/[^\d\.]/g,"").split(".")[0]:o},trim:function(i,s){i=i.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"");return typeof s===n?i:i.substring(0,h)}};var z={rgx:function(i,s){var e=0,r,a,l,n,b,d;while(e<s.length&&!b){var u=s[e],p=s[e+1];r=a=0;while(r<u.length&&!b){b=u[r++].exec(i);if(!!b){for(l=0;l<p.length;l++){d=b[++a];n=p[l];if(typeof n===t&&n.length>0){if(n.length==2){if(typeof n[1]==w){this[n[0]]=n[1].call(this,d)}else{this[n[0]]=n[1]}}else if(n.length==3){if(typeof n[1]===w&&!(n[1].exec&&n[1].test)){this[n[0]]=d?n[1].call(this,d,n[2]):o}else{this[n[0]]=d?d.replace(n[1],n[2]):o}}else if(n.length==4){this[n[0]]=d?n[3].call(this,d.replace(n[1],n[2])):o}}else{this[n]=d?d:o}}}}e+=2}},str:function(i,s){for(var e in s){if(typeof s[e]===t&&s[e].length>0){for(var r=0;r<s[e].length;r++){if(A.has(s[e][r],i)){return e===l?o:e}}}else if(A.has(s[e],i)){return e===l?o:e}}return i}};var B={browser:{oldSafari:{version:{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}},oldEdge:{version:{.1:"12.",21:"13.",31:"14.",39:"15.",41:"16.",42:"17.",44:"18."}}},os:{windows:{version:{ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2000:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",8.1:"NT 6.3",10:["NT 6.4","NT 10.0"],RT:"ARM"}}}};var O={browser:[[/\b(?:crmo|crios)\/([\w\.]+)/i],[g,[p,"Chrome"]],[/edg(?:e|ios|a)?\/([\w\.]+)/i],[g,[p,"Edge"]],[/(opera\smini)\/([\w\.-]+)/i,/(opera\s[mobiletab]{3,6})\b.+version\/([\w\.-]+)/i,/(opera)(?:.+version\/|[\/\s]+)([\w\.]+)/i],[p,g],[/opios[\/\s]+([\w\.]+)/i],[g,[p,"Opera Mini"]],[/\sopr\/([\w\.]+)/i],[g,[p,"Opera"]],[/(kindle)\/([\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]*)/i,/(avant\s|iemobile|slim)(?:browser)?[\/\s]?([\w\.]*)/i,/(ba?idubrowser)[\/\s]?([\w\.]+)/i,/(?:ms|\()(ie)\s([\w\.]+)/i,/(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon)\/([\w\.-]+)/i,/(rekonq|puffin|brave|whale|qqbrowserlite|qq)\/([\w\.]+)/i,/(weibo)__([\d\.]+)/i],[p,g],[/(?:[\s\/]uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i],[g,[p,"UCBrowser"]],[/(?:windowswechat)?\sqbcore\/([\w\.]+)\b.*(?:windowswechat)?/i],[g,[p,"WeChat(Win) Desktop"]],[/micromessenger\/([\w\.]+)/i],[g,[p,"WeChat"]],[/konqueror\/([\w\.]+)/i],[g,[p,"Konqueror"]],[/trident.+rv[:\s]([\w\.]{1,9})\b.+like\sgecko/i],[g,[p,"IE"]],[/yabrowser\/([\w\.]+)/i],[g,[p,"Yandex"]],[/(avast|avg)\/([\w\.]+)/i],[[p,/(.+)/,"$1 Secure Browser"],g],[/focus\/([\w\.]+)/i],[g,[p,"Firefox Focus"]],[/opt\/([\w\.]+)/i],[g,[p,"Opera Touch"]],[/coc_coc_browser\/([\w\.]+)/i],[g,[p,"Coc Coc"]],[/dolfin\/([\w\.]+)/i],[g,[p,"Dolphin"]],[/coast\/([\w\.]+)/i],[g,[p,"Opera Coast"]],[/xiaomi\/miuibrowser\/([\w\.]+)/i],[g,[p,"MIUI Browser"]],[/fxios\/([\w\.-]+)/i],[g,[p,"Firefox"]],[/(qihu|qhbrowser|qihoobrowser|360browser)/i],[[p,"360 Browser"]],[/(oculus|samsung|sailfish)browser\/([\w\.]+)/i],[[p,/(.+)/,"$1 Browser"],g],[/(comodo_dragon)\/([\w\.]+)/i],[[p,/_/g," "],g],[/\s(electron)\/([\w\.]+)\ssafari/i,/(tesla)(?:\sqtcarbrowser|\/(20[12]\d\.[\w\.-]+))/i,/m?(qqbrowser|baiduboxapp|2345Explorer)[\/\s]?([\w\.]+)/i],[p,g],[/(MetaSr)[\/\s]?([\w\.]+)/i,/(LBBROWSER)/i],[p],[/;fbav\/([\w\.]+);/i],[g,[p,"Facebook"]],[/FBAN\/FBIOS|FB_IAB\/FB4A/i],[[p,"Facebook"]],[/safari\s(line)\/([\w\.]+)/i,/\b(line)\/([\w\.]+)\/iab/i,/(chromium|instagram)[\/\s]([\w\.-]+)/i],[p,g],[/\bgsa\/([\w\.]+)\s.*safari\//i],[g,[p,"GSA"]],[/headlesschrome(?:\/([\w\.]+)|\s)/i],[g,[p,"Chrome Headless"]],[/\swv\).+(chrome)\/([\w\.]+)/i],[[p,"Chrome WebView"],g],[/droid.+\sversion\/([\w\.]+)\b.+(?:mobile\ssafari|safari)/i],[g,[p,"Android Browser"]],[/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i],[p,g],[/version\/([\w\.]+)\s.*mobile\/\w+\s(safari)/i],[g,[p,"Mobile Safari"]],[/version\/([\w\.]+)\s.*(mobile\s?safari|safari)/i],[g,p],[/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i],[p,[g,z.str,B.browser.oldSafari.version]],[/(webkit|khtml)\/([\w\.]+)/i],[p,g],[/(navigator|netscape)\/([\w\.-]+)/i],[[p,"Netscape"],g],[/ile\svr;\srv:([\w\.]+)\).+firefox/i],[g,[p,"Firefox Reality"]],[/ekiohf.+(flow)\/([\w\.]+)/i,/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,/(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([\w\.-]+)$/i,/(firefox)\/([\w\.]+)\s[\w\s\-]+\/[\w\.]+$/i,/(mozilla)\/([\w\.]+)\s.+rv\:.+gecko\/\d+/i,/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,/(links)\s\(([\w\.]+)/i,/(gobrowser)\/?([\w\.]*)/i,/(ice\s?browser)\/v?([\w\._]+)/i,/(mosaic)[\/\s]([\w\.]+)/i],[p,g]],cpu:[[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],[[c,"amd64"]],[/(ia32(?=;))/i],[[c,A.lowerize]],[/((?:i[346]|x)86)[;\)]/i],[[c,"ia32"]],[/\b(aarch64|armv?8e?l?)\b/i],[[c,"arm64"]],[/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i],[[c,"armhf"]],[/windows\s(ce|mobile);\sppc;/i],[[c,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],[[c,/ower/,"",A.lowerize]],[/(sun4\w)[;\)]/i],[[c,"sparc"]],[/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?:64|(?=v(?:[1-7]|[5-7]1)l?|;|eabi))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i],[[c,A.lowerize]]],device:[[/\b(sch-i[89]0\d|shw-m380s|sm-[pt]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus\s10)/i],[u,[f,"Samsung"],[v,m]],[/\b((?:s[cgp]h|gt|sm)-\w+|galaxy\snexus)/i,/\ssamsung[\s-]([\w-]+)/i,/sec-(sgh\w+)/i],[u,[f,"Samsung"],[v,k]],[/\((ip(?:hone|od)[\s\w]*);/i],[u,[f,"Apple"],[v,k]],[/\((ipad);[\w\s\),;-]+apple/i,/applecoremedia\/[\w\.]+\s\((ipad)/i,/\b(ipad)\d\d?,\d\d?[;\]].+ios/i],[u,[f,"Apple"],[v,m]],[/\b((?:agr|ags[23]|bah2?|sht?)-a?[lw]\d{2})/i],[u,[f,"Huawei"],[v,m]],[/d\/huawei([\w\s-]+)[;\)]/i,/\b(nexus\s6p|vog-[at]?l\d\d|ane-[at]?l[x\d]\d|eml-a?l\d\da?|lya-[at]?l\d[\dc]|clt-a?l\d\di?|ele-l\d\d)/i,/\b(\w{2,4}-[atu][ln][01259][019])[;\)\s]/i],[u,[f,"Huawei"],[v,k]],[/\b(poco[\s\w]+)(?:\sbuild|\))/i,/\b;\s(\w+)\sbuild\/hm\1/i,/\b(hm[\s\-_]?note?[\s_]?(?:\d\w)?)\sbuild/i,/\b(redmi[\s\-_]?(?:note|k)?[\w\s_]+)(?:\sbuild|\))/i,/\b(mi[\s\-_]?(?:a\d|one|one[\s_]plus|note lte)?[\s_]?(?:\d?\w?)[\s_]?(?:plus)?)\sbuild/i],[[u,/_/g," "],[f,"Xiaomi"],[v,k]],[/\b(mi[\s\-_]?(?:pad)(?:[\w\s_]+))(?:\sbuild|\))/i],[[u,/_/g," "],[f,"Xiaomi"],[v,m]],[/;\s(\w+)\sbuild.+\soppo/i,/\s(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007)\b/i],[u,[f,"OPPO"],[v,k]],[/\svivo\s(\w+)(?:\sbuild|\))/i,/\s(v[12]\d{3}\w?[at])(?:\sbuild|;)/i],[u,[f,"Vivo"],[v,k]],[/\s(rmx[12]\d{3})(?:\sbuild|;)/i],[u,[f,"Realme"],[v,k]],[/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?:?(\s4g)?)\b[\w\s]+build\//i,/\smot(?:orola)?[\s-](\w*)/i,/((?:moto[\s\w\(\)]+|xt\d{3,4}|nexus\s6)(?=\sbuild|\)))/i],[u,[f,"Motorola"],[v,k]],[/\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i],[u,[f,"Motorola"],[v,m]],[/((?=lg)?[vl]k\-?\d{3})\sbuild|\s3\.[\s\w;-]{10}lg?-([06cv9]{3,4})/i],[u,[f,"LG"],[v,m]],[/(lm-?f100[nv]?|nexus\s[45])/i,/lg[e;\s\/-]+((?!browser|netcast)\w+)/i,/\blg(\-?[\d\w]+)\sbuild/i],[u,[f,"LG"],[v,k]],[/(ideatab[\w\-\s]+)/i,/lenovo\s?(s(?:5000|6000)(?:[\w-]+)|tab(?:[\s\w]+)|yt[\d\w-]{6}|tb[\d\w-]{6})/i],[u,[f,"Lenovo"],[v,m]],[/(?:maemo|nokia).*(n900|lumia\s\d+)/i,/nokia[\s_-]?([\w\.-]*)/i],[[u,/_/g," "],[f,"Nokia"],[v,k]],[/droid.+;\s(pixel\sc)[\s)]/i],[u,[f,"Google"],[v,m]],[/droid.+;\s(pixel[\s\daxl]{0,6})(?:\sbuild|\))/i],[u,[f,"Google"],[v,k]],[/droid.+\s([c-g]\d{4}|so[-l]\w+|xq-a\w[4-7][12])(?=\sbuild\/|\).+chrome\/(?![1-6]{0,1}\d\.))/i],[u,[f,"Sony"],[v,k]],[/sony\stablet\s[ps]\sbuild\//i,/(?:sony)?sgp\w+(?:\sbuild\/|\))/i],[[u,"Xperia Tablet"],[f,"Sony"],[v,m]],[/\s(kb2005|in20[12]5|be20[12][59])\b/i,/\ba000(1)\sbuild/i,/\boneplus\s(a\d{4})[\s)]/i],[u,[f,"OnePlus"],[v,k]],[/(alexa)webm/i,/(kf[a-z]{2}wi)(\sbuild\/|\))/i,/(kf[a-z]+)(\sbuild\/|\)).+silk\//i],[u,[f,"Amazon"],[v,m]],[/(sd|kf)[0349hijorstuw]+(\sbuild\/|\)).+silk\//i],[[u,"Fire Phone"],[f,"Amazon"],[v,k]],[/\((playbook);[\w\s\),;-]+(rim)/i],[u,f,[v,m]],[/((?:bb[a-f]|st[hv])100-\d)/i,/\(bb10;\s(\w+)/i],[u,[f,"BlackBerry"],[v,k]],[/(?:\b|asus_)(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus\s7|padfone|p00[cj])/i],[u,[f,"ASUS"],[v,m]],[/\s(z[es]6[027][01][km][ls]|zenfone\s\d\w?)\b/i],[u,[f,"ASUS"],[v,k]],[/(nexus\s9)/i],[u,[f,"HTC"],[v,m]],[/(htc)[;_\s-]{1,2}([\w\s]+(?=\)|\sbuild)|\w+)/i,/(zte)-(\w*)/i,/(alcatel|geeksphone|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]*)/i],[f,[u,/_/g," "],[v,k]],[/droid[x\d\.\s;]+\s([ab][1-7]\-?[0178a]\d\d?)/i],[u,[f,"Acer"],[v,m]],[/droid.+;\s(m[1-5]\snote)\sbuild/i,/\bmz-([\w-]{2,})/i],[u,[f,"Meizu"],[v,k]],[/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]*)/i,/(hp)\s([\w\s]+\w)/i,/(asus)-?(\w+)/i,/(microsoft);\s(lumia[\s\w]+)/i,/(lenovo)[_\s-]?([\w-]+)/i,/linux;.+(jolla);/i,/droid.+;\s(oppo)\s?([\w\s]+)\sbuild/i],[f,u,[v,k]],[/(archos)\s(gamepad2?)/i,/(hp).+(touchpad(?!.+tablet)|tablet)/i,/(kindle)\/([\w\.]+)/i,/\s(nook)[\w\s]+build\/(\w+)/i,/(dell)\s(strea[kpr\s\d]*[\dko])/i,/[;\/]\s?(le[\s\-]+pan)[\s\-]+(\w{1,9})\sbuild/i,/[;\/]\s?(trinity)[\-\s]*(t\d{3})\sbuild/i,/\b(gigaset)[\s\-]+(q\w{1,9})\sbuild/i,/\b(vodafone)\s([\w\s]+)(?:\)|\sbuild)/i],[f,u,[v,m]],[/\s(surface\sduo)\s/i],[u,[f,"Microsoft"],[v,m]],[/droid\s[\d\.]+;\s(fp\du?)\sbuild/i],[u,[f,"Fairphone"],[v,k]],[/\s(u304aa)\sbuild/i],[u,[f,"AT&T"],[v,k]],[/sie-(\w*)/i],[u,[f,"Siemens"],[v,k]],[/[;\/]\s?(rct\w+)\sbuild/i],[u,[f,"RCA"],[v,m]],[/[;\/\s](venue[\d\s]{2,7})\sbuild/i],[u,[f,"Dell"],[v,m]],[/[;\/]\s?(q(?:mv|ta)\w+)\sbuild/i],[u,[f,"Verizon"],[v,m]],[/[;\/]\s(?:barnes[&\s]+noble\s|bn[rt])([\w\s\+]*)\sbuild/i],[u,[f,"Barnes & Noble"],[v,m]],[/[;\/]\s(tm\d{3}\w+)\sbuild/i],[u,[f,"NuVision"],[v,m]],[/;\s(k88)\sbuild/i],[u,[f,"ZTE"],[v,m]],[/;\s(nx\d{3}j)\sbuild/i],[u,[f,"ZTE"],[v,k]],[/[;\/]\s?(gen\d{3})\sbuild.*49h/i],[u,[f,"Swiss"],[v,k]],[/[;\/]\s?(zur\d{3})\sbuild/i],[u,[f,"Swiss"],[v,m]],[/[;\/]\s?((zeki)?tb.*\b)\sbuild/i],[u,[f,"Zeki"],[v,m]],[/[;\/]\s([yr]\d{2})\sbuild/i,/[;\/]\s(dragon[\-\s]+touch\s|dt)(\w{5})\sbuild/i],[[f,"Dragon Touch"],u,[v,m]],[/[;\/]\s?(ns-?\w{0,9})\sbuild/i],[u,[f,"Insignia"],[v,m]],[/[;\/]\s?((nxa|Next)-?\w{0,9})\sbuild/i],[u,[f,"NextBook"],[v,m]],[/[;\/]\s?(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05]))\sbuild/i],[[f,"Voice"],u,[v,k]],[/[;\/]\s?(lvtel\-)?(v1[12])\sbuild/i],[[f,"LvTel"],u,[v,k]],[/;\s(ph-1)\s/i],[u,[f,"Essential"],[v,k]],[/[;\/]\s?(v(100md|700na|7011|917g).*\b)\sbuild/i],[u,[f,"Envizen"],[v,m]],[/[;\/]\s?(trio[\s\w\-\.]+)\sbuild/i],[u,[f,"MachSpeed"],[v,m]],[/[;\/]\s?tu_(1491)\sbuild/i],[u,[f,"Rotor"],[v,m]],[/(shield[\w\s]+)\sbuild/i],[u,[f,"Nvidia"],[v,m]],[/(sprint)\s(\w+)/i],[f,u,[v,k]],[/(kin\.[onetw]{3})/i],[[u,/\./g," "],[f,"Microsoft"],[v,k]],[/droid\s[\d\.]+;\s(cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],[u,[f,"Zebra"],[v,m]],[/droid\s[\d\.]+;\s(ec30|ps20|tc[2-8]\d[kx])\)/i],[u,[f,"Zebra"],[v,k]],[/\s(ouya)\s/i,/(nintendo)\s([wids3utch]+)/i],[f,u,[v,x]],[/droid.+;\s(shield)\sbuild/i],[u,[f,"Nvidia"],[v,x]],[/(playstation\s[345portablevi]+)/i],[u,[f,"Sony"],[v,x]],[/[\s\(;](xbox(?:\sone)?(?!;\sxbox))[\s\);]/i],[u,[f,"Microsoft"],[v,x]],[/smart-tv.+(samsung)/i],[f,[v,y]],[/hbbtv.+maple;(\d+)/i],[[u,/^/,"SmartTV"],[f,"Samsung"],[v,y]],[/(?:linux;\snetcast.+smarttv|lg\snetcast\.tv-201\d)/i],[[f,"LG"],[v,y]],[/(apple)\s?tv/i],[f,[u,"Apple TV"],[v,y]],[/crkey/i],[[u,"Chromecast"],[f,"Google"],[v,y]],[/droid.+aft([\w])(\sbuild\/|\))/i],[u,[f,"Amazon"],[v,y]],[/\(dtv[\);].+(aquos)/i],[u,[f,"Sharp"],[v,y]],[/hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i],[[f,A.trim],[u,A.trim],[v,y]],[/[\s\/\(](android\s|smart[-\s]?|opera\s)tv[;\)\s]/i],[[v,y]],[/((pebble))app\/[\d\.]+\s/i],[f,u,[v,S]],[/droid.+;\s(glass)\s\d/i],[u,[f,"Google"],[v,S]],[/droid\s[\d\.]+;\s(wt63?0{2,3})\)/i],[u,[f,"Zebra"],[v,S]],[/(tesla)(?:\sqtcarbrowser|\/20[12]\d\.[\w\.-]+)/i],[f,[v,_]],[/droid .+?; ([^;]+?)(?: build|\) applewebkit).+? mobile safari/i],[u,[v,k]],[/droid .+?;\s([^;]+?)(?: build|\) applewebkit).+?(?! mobile) safari/i],[u,[v,m]],[/\s(tablet|tab)[;\/]/i,/\s(mobile)(?:[;\/]|\ssafari)/i],[[v,A.lowerize]],[/(android[\w\.\s\-]{0,9});.+build/i],[u,[f,"Generic"]],[/(phone)/i],[[v,k]]],engine:[[/windows.+\sedge\/([\w\.]+)/i],[g,[p,"EdgeHTML"]],[/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],[g,[p,"Blink"]],[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,/ekioh(flow)\/([\w\.]+)/i,/(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,/(icab)[\/\s]([23]\.[\d\.]+)/i],[p,g],[/rv\:([\w\.]{1,9})\b.+(gecko)/i],[g,p]],os:[[/microsoft\s(windows)\s(vista|xp)/i],[p,g],[/(windows)\snt\s6\.2;\s(arm)/i,/(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s\w]*)/i,/(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)(?!.+xbox)/i],[p,[g,z.str,B.os.windows.version]],[/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],[[p,"Windows"],[g,z.str,B.os.windows.version]],[/ip[honead]{2,4}\b(?:.*os\s([\w]+)\slike\smac|;\sopera)/i,/cfnetwork\/.+darwin/i],[[g,/_/g,"."],[p,"iOS"]],[/(mac\sos\sx)\s?([\w\s\.]*)/i,/(macintosh|mac(?=_powerpc)\s)(?!.+haiku)/i],[[p,"Mac OS"],[g,/_/g,"."]],[/(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|sailfish|contiki)[\/\s-]?([\w\.]*)/i,/(blackberry)\w*\/([\w\.]*)/i,/(tizen|kaios)[\/\s]([\w\.]+)/i,/\((series40);/i],[p,g],[/\(bb(10);/i],[g,[p,"BlackBerry"]],[/(?:symbian\s?os|symbos|s60(?=;)|series60)[\/\s-]?([\w\.]*)/i],[g,[p,"Symbian"]],[/mozilla.+\(mobile;.+gecko.+firefox/i],[[p,"Firefox OS"]],[/web0s;.+rt(tv)/i,/\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],[g,[p,"webOS"]],[/crkey\/([\d\.]+)/i],[g,[p,"Chromecast"]],[/(cros)\s[\w]+\s([\w\.]+\w)/i],[[p,"Chromium OS"],g],[/(nintendo|playstation)\s([wids345portablevuch]+)/i,/(xbox);\s+xbox\s([^\);]+)/i,/(mint)[\/\s\(\)]?(\w*)/i,/(mageia|vectorlinux)[;\s]/i,/(joli|[kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?=\slinux)|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus|raspbian)(?:\sgnu\/linux)?(?:\slinux)?[\/\s-]?(?!chrom|package)([\w\.-]*)/i,/(hurd|linux)\s?([\w\.]*)/i,/(gnu)\s?([\w\.]*)/i,/\s([frentopc-]{0,4}bsd|dragonfly)\s?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,/(haiku)\s(\w+)/i],[p,g],[/(sunos)\s?([\w\.\d]*)/i],[[p,"Solaris"],g],[/((?:open)?solaris)[\/\s-]?([\w\.]*)/i,/(aix)\s((\d)(?=\.|\)|\s)[\w\.])*/i,/(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms|fuchsia)/i,/(unix)\s?([\w\.]*)/i],[p,g]]};var M=function(i,s){if(typeof i==="object"){s=i;i=o}if(!(this instanceof M)){return new M(i,s).getResult()}var r=i||(typeof e!=="undefined"&&e.navigator&&e.navigator.userAgent?e.navigator.userAgent:a);var l=s?A.extend(O,s):O;this.getBrowser=function(){var i={name:o,version:o};z.rgx.call(i,r,l.browser);i.major=A.major(i.version);return i};this.getCPU=function(){var i={architecture:o};z.rgx.call(i,r,l.cpu);return i};this.getDevice=function(){var i={vendor:o,model:o,type:o};z.rgx.call(i,r,l.device);return i};this.getEngine=function(){var i={name:o,version:o};z.rgx.call(i,r,l.engine);return i};this.getOS=function(){var i={name:o,version:o};z.rgx.call(i,r,l.os);return i};this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}};this.getUA=function(){return r};this.setUA=function(i){r=typeof i===b&&i.length>h?A.trim(i,h):i;return this};this.setUA(r);return this};M.VERSION=r;M.BROWSER={NAME:p,MAJOR:d,VERSION:g};M.CPU={ARCHITECTURE:c};M.DEVICE={MODEL:u,VENDOR:f,TYPE:v,CONSOLE:x,MOBILE:k,SMARTTV:y,TABLET:m,WEARABLE:S,EMBEDDED:_};M.ENGINE={NAME:p,VERSION:g};M.OS={NAME:p,VERSION:g};if(typeof s!==n){if("object"!==n&&i.exports){s=i.exports=M}s.UAParser=M}else{if(true){!(__WEBPACK_AMD_DEFINE_RESULT__ = (function(){return M}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))}else {}}var R=typeof e!=="undefined"&&(e.jQuery||e.Zepto);if(R&&!R.ua){var E=new M;R.ua=E.getResult();R.ua.get=function(){return E.getUA()};R.ua.set=function(i){E.setUA(i);var s=E.getResult();for(var e in s){R.ua[e]=s[e]}}}})(typeof window==="object"?window:this)}};var s={};function __nccwpck_require__(e){if(s[e]){return s[e].exports}var o=s[e]={exports:{}};var r=true;try{i[e].call(o.exports,o,o.exports,__nccwpck_require__);r=false}finally{if(r)delete s[e]}return o.exports}__nccwpck_require__.ab=__dirname+"/";return __nccwpck_require__(578)})();

/***/ }),

/***/ 5681:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.acceptLanguage = acceptLanguage;
function acceptLanguage(header = '', preferences) {
    return parse(header, preferences, {
        type: 'accept-language',
        prefixMatch: true
    })[0] || '';
}
function parse(raw, preferences, options) {
    const lowers = new Map();
    const header = raw.replace(/[ \t]/g, '');
    if (preferences) {
        let pos = 0;
        for (const preference of preferences){
            const lower = preference.toLowerCase();
            lowers.set(lower, {
                orig: preference,
                pos: pos++
            });
            if (options.prefixMatch) {
                const parts = lower.split('-');
                while(parts.pop(), parts.length > 0){
                    const joined = parts.join('-');
                    if (!lowers.has(joined)) {
                        lowers.set(joined, {
                            orig: preference,
                            pos: pos++
                        });
                    }
                }
            }
        }
    }
    const parts = header.split(',');
    const selections = [];
    const map = new Set();
    for(let i = 0; i < parts.length; ++i){
        const part = parts[i];
        if (!part) {
            continue;
        }
        const params = part.split(';');
        if (params.length > 2) {
            throw new Error(`Invalid ${options.type} header`);
        }
        let token = params[0].toLowerCase();
        if (!token) {
            throw new Error(`Invalid ${options.type} header`);
        }
        const selection = {
            token,
            pos: i,
            q: 1
        };
        if (preferences && lowers.has(token)) {
            selection.pref = lowers.get(token).pos;
        }
        map.add(selection.token);
        if (params.length === 2) {
            const q = params[1];
            const [key, value] = q.split('=');
            if (!value || key !== 'q' && key !== 'Q') {
                throw new Error(`Invalid ${options.type} header`);
            }
            const score = parseFloat(value);
            if (score === 0) {
                continue;
            }
            if (Number.isFinite(score) && score <= 1 && score >= 0.001) {
                selection.q = score;
            }
        }
        selections.push(selection);
    }
    selections.sort((a, b)=>{
        if (b.q !== a.q) {
            return b.q - a.q;
        }
        if (b.pref !== a.pref) {
            if (a.pref === undefined) {
                return 1;
            }
            if (b.pref === undefined) {
                return -1;
            }
            return a.pref - b.pref;
        }
        return a.pos - b.pos;
    });
    const values = selections.map((selection)=>selection.token
    );
    if (!preferences || !preferences.length) {
        return values;
    }
    const preferred = [];
    for (const selection of values){
        if (selection === '*') {
            for (const [preference, value] of lowers){
                if (!map.has(preference)) {
                    preferred.push(value.orig);
                }
            }
        } else {
            const lower = selection.toLowerCase();
            if (lowers.has(lower)) {
                preferred.push(lowers.get(lower).orig);
            }
        }
    }
    return preferred;
}

//# sourceMappingURL=accept-header.js.map

/***/ }),

/***/ 6166:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.normalizePathSep = normalizePathSep;
exports.denormalizePagePath = denormalizePagePath;
function normalizePathSep(path) {
    return path.replace(/\\/g, '/');
}
function denormalizePagePath(page) {
    page = normalizePathSep(page);
    if (page.startsWith('/index/')) {
        page = page.slice(6);
    } else if (page === '/index') {
        page = '/';
    }
    return page;
}

//# sourceMappingURL=denormalize-page-path.js.map

/***/ }),

/***/ 3198:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.isBlockedPage = isBlockedPage;
exports.cleanAmpPath = cleanAmpPath;
exports.isBot = isBot;
var _constants = __webpack_require__(8796);
function isBlockedPage(pathname) {
    return _constants.BLOCKED_PAGES.includes(pathname);
}
function cleanAmpPath(pathname) {
    if (pathname.match(/\?amp=(y|yes|true|1)/)) {
        pathname = pathname.replace(/\?amp=(y|yes|true|1)&?/, '?');
    }
    if (pathname.match(/&amp=(y|yes|true|1)/)) {
        pathname = pathname.replace(/&amp=(y|yes|true|1)/, '');
    }
    pathname = pathname.replace(/\?$/, '');
    return pathname;
}
function isBot(userAgent) {
    return /Googlebot|Mediapartners-Google|AdsBot-Google|googleweblight|Storebot-Google|Bingbot|BingPreview|Slurp|DuckDuckBot|baiduspider|yandex|sogou|LinkedInBot|bitlybot|tumblr|vkShare|quora link preview|facebookexternalhit|facebookcatalog|Twitterbot|applebot|redditbot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|ia_archiver/i.test(userAgent);
}

//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 4384:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({
    value: true
});
exports.V = adapter;
var _error = __webpack_require__(928);
var _utils = __webpack_require__(5625);
var _fetchEvent = __webpack_require__(3125);
var _request = __webpack_require__(7953);
var _response = __webpack_require__(7057);
var _fetchEvent1 = __webpack_require__(3502);
async function adapter(params) {
    const url = params.request.url.startsWith('/') ? `https://${params.request.headers.host}${params.request.url}` : params.request.url;
    const request = new NextRequestHint({
        page: params.page,
        input: url,
        init: {
            geo: params.request.geo,
            headers: (0, _utils).fromNodeHeaders(params.request.headers),
            ip: params.request.ip,
            method: params.request.method,
            nextConfig: params.request.nextConfig,
            page: params.request.page
        }
    });
    const event = new _fetchEvent.NextFetchEvent({
        request,
        page: params.page
    });
    const original = await params.handler(request, event);
    return {
        response: original || _response.NextResponse.next(),
        waitUntil: Promise.all(event[_fetchEvent1.waitUntilSymbol])
    };
}
class NextRequestHint extends _request.NextRequest {
    constructor(params){
        super(params.input, params.init);
        this.sourcePage = params.page;
    }
    get request() {
        throw new _error.DeprecationError({
            page: this.sourcePage
        });
    }
    respondWith() {
        throw new _error.DeprecationError({
            page: this.sourcePage
        });
    }
    waitUntil() {
        throw new _error.DeprecationError({
            page: this.sourcePage
        });
    }
}

//# sourceMappingURL=adapter.js.map

/***/ }),

/***/ 928:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
class DeprecationError extends Error {
    constructor({ page  }){
        super(`The middleware "${page}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return new Response("Hello " + request.url)
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
    }
}
exports.DeprecationError = DeprecationError;

//# sourceMappingURL=error.js.map

/***/ }),

/***/ 2961:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
var _getLocaleMetadata = __webpack_require__(8993);
var _cookie = _interopRequireDefault(__webpack_require__(9802));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
class NextURL extends URL {
    constructor(url, options = {
    }){
        super(formatRelative(url));
        this._options = options;
        this._basePath = '';
        this._url = formatRelative(url);
        this.analyzeUrl();
    }
    get absolute() {
        return this._url.hostname !== 'localhost';
    }
    analyzeUrl() {
        const { headers ={
        } , basePath , i18n  } = this._options;
        if (basePath && this._url.pathname.startsWith(basePath)) {
            this._url.pathname = this._url.pathname.replace(basePath, '') || '/';
            this._basePath = basePath;
        } else {
            this._basePath = '';
        }
        if (i18n) {
            var ref;
            this._locale = (0, _getLocaleMetadata).getLocaleMetadata({
                cookies: ()=>{
                    const value = headers['cookie'];
                    return value ? _cookie.default.parse(Array.isArray(value) ? value.join(';') : value) : {
                    };
                },
                headers: headers,
                nextConfig: {
                    basePath: basePath,
                    i18n: i18n
                },
                url: {
                    hostname: this._url.hostname || null,
                    pathname: this._url.pathname
                }
            });
            if ((ref = this._locale) === null || ref === void 0 ? void 0 : ref.path.detectedLocale) {
                this._url.pathname = this._locale.path.pathname;
            }
        }
    }
    formatPathname() {
        var ref, ref1;
        const { i18n  } = this._options;
        let pathname = this._url.pathname;
        if (((ref = this._locale) === null || ref === void 0 ? void 0 : ref.locale) && (i18n === null || i18n === void 0 ? void 0 : i18n.defaultLocale) !== ((ref1 = this._locale) === null || ref1 === void 0 ? void 0 : ref1.locale)) {
            var ref5;
            pathname = `/${(ref5 = this._locale) === null || ref5 === void 0 ? void 0 : ref5.locale}${pathname}`;
        }
        if (this._basePath) {
            pathname = `${this._basePath}${pathname}`;
        }
        return pathname;
    }
    get locale() {
        if (!this._locale) {
            throw new TypeError(`The URL is not configured with i18n`);
        }
        return this._locale.locale;
    }
    set locale(locale) {
        if (!this._locale) {
            throw new TypeError(`The URL is not configured with i18n`);
        }
        this._locale.locale = locale;
    }
    get defaultLocale() {
        var ref;
        return (ref = this._locale) === null || ref === void 0 ? void 0 : ref.defaultLocale;
    }
    get domainLocale() {
        var ref;
        return (ref = this._locale) === null || ref === void 0 ? void 0 : ref.domain;
    }
    get searchParams() {
        return this._url.searchParams;
    }
    get host() {
        return this.absolute ? this._url.host : '';
    }
    set host(value) {
        this._url.host = value;
    }
    get hostname() {
        return this.absolute ? this._url.hostname : '';
    }
    set hostname(value) {
        this._url.hostname = value || 'localhost';
    }
    get port() {
        return this.absolute ? this._url.port : '';
    }
    set port(value) {
        this._url.port = value;
    }
    get protocol() {
        return this.absolute ? this._url.protocol : '';
    }
    set protocol(value) {
        this._url.protocol = value;
    }
    get href() {
        const pathname = this.formatPathname();
        return this.absolute ? `${this.protocol}//${this.host}${pathname}${this._url.search}` : `${pathname}${this._url.search}`;
    }
    set href(url) {
        this._url = formatRelative(url);
        this.analyzeUrl();
    }
    get origin() {
        return this.absolute ? this._url.origin : '';
    }
    get pathname() {
        return this._url.pathname;
    }
    set pathname(value) {
        this._url.pathname = value;
    }
    get hash() {
        return this._url.hash;
    }
    set hash(value) {
        this._url.hash = value;
    }
    get search() {
        return this._url.search;
    }
    set search(value) {
        this._url.search = value;
    }
    get password() {
        return this._url.password;
    }
    set password(value) {
        this._url.password = value;
    }
    get username() {
        return this._url.username;
    }
    set username(value) {
        this._url.username = value;
    }
    get basePath() {
        return this._basePath;
    }
    set basePath(value) {
        this._basePath = value.startsWith('/') ? value : `/${value}`;
    }
    toString() {
        return this.href;
    }
    toJSON() {
        return this.href;
    }
}
exports.NextURL = NextURL;
function formatRelative(url) {
    return url.startsWith('/') ? new URL(url.replace(/^\/+/, '/'), new URL('https://localhost')) : new URL(url);
}

//# sourceMappingURL=next-url.js.map

/***/ }),

/***/ 3502:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.waitUntilSymbol = exports.passThroughSymbol = exports.responseSymbol = void 0;
var _key, _key1;
const responseSymbol = Symbol('response');
exports.responseSymbol = responseSymbol;
const passThroughSymbol = Symbol('passThrough');
exports.passThroughSymbol = passThroughSymbol;
const waitUntilSymbol = Symbol('waitUntil');
exports.waitUntilSymbol = waitUntilSymbol;
class FetchEvent {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(_request){
        this[_key] = [];
        this[_key1] = false;
    }
    respondWith(response) {
        if (!this[responseSymbol]) {
            this[responseSymbol] = Promise.resolve(response);
        }
    }
    passThroughOnException() {
        this[passThroughSymbol] = true;
    }
    waitUntil(promise) {
        this[waitUntilSymbol].push(promise);
    }
}
exports.FetchEvent = FetchEvent;
_key = waitUntilSymbol;
_key1 = passThroughSymbol;

//# sourceMappingURL=fetch-event.js.map

/***/ }),

/***/ 3125:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
var _error = __webpack_require__(928);
var _fetchEvent = __webpack_require__(3502);
class NextFetchEvent extends _fetchEvent.FetchEvent {
    constructor(params){
        super(params.request);
        this.sourcePage = params.page;
    }
    // @ts-ignore
    get request() {
        throw new _error.DeprecationError({
            page: this.sourcePage
        });
    }
    respondWith() {
        throw new _error.DeprecationError({
            page: this.sourcePage
        });
    }
}
exports.NextFetchEvent = NextFetchEvent;

//# sourceMappingURL=fetch-event.js.map

/***/ }),

/***/ 7953:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.INTERNALS = void 0;
var _nextUrl = __webpack_require__(2961);
var _utils = __webpack_require__(3198);
var _utils1 = __webpack_require__(5625);
var _cookie = _interopRequireDefault(__webpack_require__(9802));
var _uaParserJs = _interopRequireDefault(__webpack_require__(2824));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const INTERNALS = Symbol('internal request');
exports.INTERNALS = INTERNALS;
class NextRequest extends Request {
    constructor(input, init = {
    }){
        var ref, ref1, ref2;
        super(input, init);
        const cookieParser = ()=>{
            const value = this.headers.get('cookie');
            return value ? _cookie.default.parse(value) : {
            };
        };
        this[INTERNALS] = {
            cookieParser,
            geo: init.geo || {
            },
            ip: init.ip,
            page: init.page,
            url: new _nextUrl.NextURL(typeof input === 'string' ? input : input.url, {
                basePath: (ref = init.nextConfig) === null || ref === void 0 ? void 0 : ref.basePath,
                headers: (0, _utils1).toNodeHeaders(this.headers),
                i18n: (ref1 = init.nextConfig) === null || ref1 === void 0 ? void 0 : ref1.i18n,
                trailingSlash: (ref2 = init.nextConfig) === null || ref2 === void 0 ? void 0 : ref2.trailingSlash
            })
        };
    }
    get cookies() {
        return this[INTERNALS].cookieParser();
    }
    get geo() {
        return this[INTERNALS].geo;
    }
    get ip() {
        return this[INTERNALS].ip;
    }
    get preflight() {
        return this.headers.get('x-middleware-preflight');
    }
    get nextUrl() {
        return this[INTERNALS].url;
    }
    get page() {
        var ref, ref1;
        return {
            name: (ref = this[INTERNALS].page) === null || ref === void 0 ? void 0 : ref.name,
            params: (ref1 = this[INTERNALS].page) === null || ref1 === void 0 ? void 0 : ref1.params
        };
    }
    get ua() {
        if (typeof this[INTERNALS].ua !== 'undefined') {
            return this[INTERNALS].ua || undefined;
        }
        const uaString = this.headers.get('user-agent');
        if (!uaString) {
            this[INTERNALS].ua = null;
            return this[INTERNALS].ua || undefined;
        }
        this[INTERNALS].ua = {
            ...(0, _uaParserJs).default(uaString),
            isBot: (0, _utils).isBot(uaString)
        };
        return this[INTERNALS].ua;
    }
    get url() {
        return this[INTERNALS].url.toString();
    }
}
exports.NextRequest = NextRequest;

//# sourceMappingURL=request.js.map

/***/ }),

/***/ 7057:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
var _nextUrl = __webpack_require__(2961);
var _utils = __webpack_require__(5625);
var _cookie = _interopRequireDefault(__webpack_require__(9802));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const INTERNALS = Symbol('internal response');
const REDIRECTS = new Set([
    301,
    302,
    303,
    307,
    308
]);
class NextResponse extends Response {
    constructor(body, init = {
    }){
        var ref, ref1, ref2;
        super(body, init);
        const cookieParser = ()=>{
            const value = this.headers.get('cookie');
            return value ? _cookie.default.parse(value) : {
            };
        };
        this[INTERNALS] = {
            cookieParser,
            url: init.url ? new _nextUrl.NextURL(init.url, {
                basePath: (ref = init.nextConfig) === null || ref === void 0 ? void 0 : ref.basePath,
                i18n: (ref1 = init.nextConfig) === null || ref1 === void 0 ? void 0 : ref1.i18n,
                trailingSlash: (ref2 = init.nextConfig) === null || ref2 === void 0 ? void 0 : ref2.trailingSlash,
                headers: (0, _utils).toNodeHeaders(this.headers)
            }) : undefined
        };
    }
    get cookies() {
        return this[INTERNALS].cookieParser();
    }
    cookie(name, value, opts = {
    }) {
        const val = typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value);
        if (opts.maxAge) {
            opts.expires = new Date(Date.now() + opts.maxAge);
            opts.maxAge /= 1000;
        }
        if (opts.path == null) {
            opts.path = '/';
        }
        this.headers.append('Set-Cookie', _cookie.default.serialize(name, String(val), opts));
        return this;
    }
    clearCookie(name, opts = {
    }) {
        return this.cookie(name, '', {
            expires: new Date(1),
            path: '/',
            ...opts
        });
    }
    static redirect(url, status = 302) {
        if (!REDIRECTS.has(status)) {
            throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new NextResponse(null, {
            headers: {
                Location: typeof url === 'string' ? url : url.toString()
            },
            status
        });
    }
    static rewrite(destination) {
        return new NextResponse(null, {
            headers: {
                'x-middleware-rewrite': typeof destination === 'string' ? destination : destination.toString()
            }
        });
    }
    static next() {
        return new NextResponse(null, {
            headers: {
                'x-middleware-next': '1'
            }
        });
    }
}
exports.NextResponse = NextResponse;

//# sourceMappingURL=response.js.map

/***/ }),

/***/ 5625:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
exports.streamToIterator = streamToIterator;
exports.notImplemented = notImplemented;
exports.fromNodeHeaders = fromNodeHeaders;
exports.toNodeHeaders = toNodeHeaders;
exports.splitCookiesString = splitCookiesString;
async function* streamToIterator(readable) {
    const reader = readable.getReader();
    while(true){
        const { value , done  } = await reader.read();
        if (done) break;
        if (value) {
            yield value;
        }
    }
    reader.releaseLock();
}
function notImplemented(name, method) {
    throw new Error(`Failed to get the '${method}' property on '${name}': the property is not implemented`);
}
function fromNodeHeaders(object) {
    const headers = new Headers();
    for (let [key, value] of Object.entries(object)){
        const values = Array.isArray(value) ? value : [
            value
        ];
        for (let v of values){
            if (v !== undefined) {
                headers.append(key, v);
            }
        }
    }
    return headers;
}
function toNodeHeaders(headers) {
    const result = {
    };
    if (headers) {
        for (const [key, value] of headers.entries()){
            result[key] = value;
            if (key.toLowerCase() === 'set-cookie') {
                result[key] = splitCookiesString(value);
            }
        }
    }
    return result;
}
function splitCookiesString(cookiesString) {
    var cookiesStrings = [];
    var pos = 0;
    var start;
    var ch;
    var lastComma;
    var nextStart;
    var cookiesSeparatorFound;
    function skipWhitespace() {
        while(pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))){
            pos += 1;
        }
        return pos < cookiesString.length;
    }
    function notSpecialChar() {
        ch = cookiesString.charAt(pos);
        return ch !== '=' && ch !== ';' && ch !== ',';
    }
    while(pos < cookiesString.length){
        start = pos;
        cookiesSeparatorFound = false;
        while(skipWhitespace()){
            ch = cookiesString.charAt(pos);
            if (ch === ',') {
                // ',' is a cookie separator if we have later first '=', not ';' or ','
                lastComma = pos;
                pos += 1;
                skipWhitespace();
                nextStart = pos;
                while(pos < cookiesString.length && notSpecialChar()){
                    pos += 1;
                }
                // currently special character
                if (pos < cookiesString.length && cookiesString.charAt(pos) === '=') {
                    // we found cookies separator
                    cookiesSeparatorFound = true;
                    // pos is inside the next cookie, so back up and return it.
                    pos = nextStart;
                    cookiesStrings.push(cookiesString.substring(start, lastComma));
                    start = pos;
                } else {
                    // in param ',' or param separator ';',
                    // we continue from that comma
                    pos = lastComma + 1;
                }
            } else {
                pos += 1;
            }
        }
        if (!cookiesSeparatorFound || pos >= cookiesString.length) {
            cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
        }
    }
    return cookiesStrings;
}

//# sourceMappingURL=utils.js.map

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ var __webpack_exports__ = (__webpack_exec__(8647));
/******/ (_ENTRIES = typeof _ENTRIES === "undefined" ? {} : _ENTRIES)["middleware_pages/_middleware"] = __webpack_exports__;
/******/ }
]);
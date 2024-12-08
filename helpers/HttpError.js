/**
 * @module HttpError
 */

/**
 * Predefined HTTP status messages mapped by their status codes.
 * @constant
 * @type {Object<number, string>}
 */
const ERROR_MESSAGES = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot", // A fun Easter egg from an April Fools' joke in the HTTP specification
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required"
}
/**
 * Creates a custom HTTP error object.
 *
 * @function
 * @param {number} statusCode - The HTTP status code representing the type of error.
 * @param {string} [message] - An optional custom error message. Defaults to the standard message for the given status code.
 * @returns {Error} An error object with an added `statusCode` property.
 *
 * @example
 * const HttpError = require('./HttpError');
 *
 * // Default message
 * const error = HttpError(404);
 * console.log(error.message); // "Not Found"
 * console.log(error.statusCode); // 404
 *
 * // Custom message
 * const error = HttpError(400, "Invalid input");
 * console.log(error.message); // "Invalid input"
 * console.log(error.statusCode); // 400
 */
const HttpError=(statusCode, message=ERROR_MESSAGES[statusCode]) => {
    const error=new Error(message)
    error.statusCode = statusCode
    return error
}

module.exports=HttpError;
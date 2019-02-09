/**
 * Mali metadata middleware. If the call has metadata with the specified property the
 * specified type the middleware function is executed.
 * @module @malijs/metadata
 *
 * @param  {String} name The name of the metadata object property
 * @param  {Options} options
 * @param  {Boolean} options.truthy optional check for truthiness on the param value within the request.
 *                                           Default: <code>false</code>
 * @param  {Function} fn The middleware function to execute
 *
 * @example
 * const metadata = require('@malijs/metadata')
 *
 * async function requestId (requestId, ctx, next) {
 *   ctx.req.requestId = requestId
 *   await next()
 * }
 *
 * app.use(metadata('requestId', { truthy: true }, requestId))
 */
module.exports = function (name, options, fn) {
  if (!fn && typeof options === 'function') {
    fn = options
    options = {}
  }

  return function metadata (ctx, next) {
    if (options.truthy && !ctx.metadata[name]) {
      return next()
    }
    return fn(ctx.metadata[name], ctx, next)
  }
}

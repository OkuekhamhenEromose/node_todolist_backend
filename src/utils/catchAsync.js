/**
 * Async route handler wrapper.
 *
 * Express route handlers that use async/await must handle rejected promises.
 * Without this wrapper, an unhandled rejection crashes the Node.js process
 * or hangs the request.
 *
 * This eliminates try/catch boilerplate in every controller.
 *
 * Usage:
 *   router.get('/', catchAsync(async (req, res) => { ... }));
 */
const catchAsync = (fn) =>{
  return (req, res, next) =>{
    // If fn rejects, the rejected promise is caught and forwarded to next()
    // Express error handler then receives the error
    fn(req, res, next).catch(next);
  }
}

module.exports = catchAsync;

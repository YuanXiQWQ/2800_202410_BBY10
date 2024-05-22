/**
 * Checks if the session is valid.
 * A valid session must have `username` and `goal` in `userData`.
 *
 * @param {Object} req - The request object.
 * @returns {boolean} True if the session is valid, otherwise false.
 */
const isValidSession = req => !!(req?.session?.userData?.username && req?.session?.userData?.goal);

/**
 * Middleware to handle authentication.
 * If the user is not authenticated, proceed to the next middleware.
 * If authenticated, redirects to /exercises for root and signup paths.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export function authValidation(req, res, next) {
    if (!isValidSession(req)) {
        next();
    } else if (req.path === "/" || req.path === "/signup") {
        res.redirect("/exercises");
    } else {
        next();
    }
}

/**
 * Middleware to validate the session.
 * If the session is valid, proceed to the next middleware.
 * If not, redirect to the root path.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export function sessionValidation(req, res, next) {
    isValidSession(req) ? next() : res.redirect("/");
}

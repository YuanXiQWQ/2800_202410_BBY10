
function isValidSession(req) {
    if (req?.session?.userData?.username && req?.session?.userData?.goal) {
      return true;
    }
    return false;
  }
  
  export function authValidation(req, res, next) {
    if (!isValidSession(req)) {
      next();
    } else {
      res.redirect("/exercises");
    }
  }
  
  export function sessionValidation(req, res, next) {
    if (isValidSession(req)) {
      next();
    } else {
      res.redirect("/");
    }
}
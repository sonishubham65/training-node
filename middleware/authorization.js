/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @description: This middleware authorize the person for the particular route.
 * Middlware helps to protecte the route and checks the user role as 'manager'.
 */
module.exports.manager = (req, res, next) => {
    if (req.user.role == 'manager') {
        next();
    } else {
        res.status(403).json({
            message: "You are not authorized to perform this action."
        })
    }
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @description: This middleware authorize the person for the particular route.
 * Middlware helps to protecte the route and checks the user role as 'employee'.
 */
module.exports.employee = (req, res, next) => {
    if (req.user.role == 'employee') {
        next();
    } else {
        res.status(403).json({
            message: "You are not authorized to perform this action."
        })
    }
}
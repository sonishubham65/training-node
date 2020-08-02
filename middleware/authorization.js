module.exports.manager = (req, res, next) => {
    if (req.user.role == 'manager') {
        next();
    } else {
        res.status(403).json({
            message: "You are not authorized to perform this action."
        })
    }
}
module.exports.employee = (req, res, next) => {
    if (req.user.role == 'employee') {
        next();
    } else {
        res.status(403).json({
            message: "You are not authorized to perform this action."
        })
    }
}
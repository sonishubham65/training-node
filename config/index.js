const { model } = require("../models/User");

module.exports = {
    validation: {
        password: {
            regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,30}$"
        }, email: {
            allow: ['com', 'net', 'in']
        }
    }
}
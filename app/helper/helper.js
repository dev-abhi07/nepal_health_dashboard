const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');

const Helper = {};

Helper.response = (status, message, data = [], res, statusCode) => {
    return res.status(statusCode).json({
        status,
        message,
        data,
    });
};

Helper.formatToIST = (
    datetime = new Date(),
    format = "YYYY-MM-DD HH:mm:ss"
) => {
    return moment(datetime).tz("Asia/Kolkata").format(format);
};


module.exports = Helper;

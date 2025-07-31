const sequelize = require("../../connection/connection");
const Helper = require("../../helper/helper");
const admin_login = require("../../models/AdminUser");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {

    const { loginId, password } = req.body;
    const hashedInput = CryptoJS.SHA256(password).toString();
    console.log("Login ID:", hashedInput);

    try {
        const user = await admin_login.findOne({
            where: {
                LoginId: loginId
            }
        })

          if (!user) {
            return Helper.response(false, "User not exists!", [], res, 401);
        }


        if (user.Password != hashedInput) {
            return Helper.response(false, "Invalid login credentials", [], res, 401);
        }

        if (user && user.IsActive === 1) {
            return Helper.response(true, "User is not active", [], res, 403);
        }

        const token = jwt.sign(
            { user: user.Pk_AdminUserId },
            process.env.SECRET_KEY,
            { expiresIn: '8h' }
        );
       
        await user.update({ token });

        const baseUrl = process.env.BASE_URL;

        return Helper.response(true, 'You have Logged In Successfully!', { baseUrl, user }, res, 200)
    } catch (error) {
        return Helper.response(0, 'Something went wrong', error, res, 500);
    }

}
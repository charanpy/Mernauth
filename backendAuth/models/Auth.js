const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
            email: {
                        type: String,
                        trim: true,
                        required: true,
                        lowercase: true
            },
            name: {
                        type: String,
                        trim: true,
                        required: true
            },
            hashed_password: {
                        type: String,
                        required: true
            },
            salt: String,
            role: {
                        type: Number,
                        default: 0
            },
            resetPasswordLink: {
                        date: String,
                        default: ''
            }
}, { timestamps: true })

//////////////////////
// ^Virtualpassword //
//////////////////////
userSchema.virtual('password')
            .set(function (password) {
                        this._password = password;
                        this.salt = this.makeSalt()
                        this.hashed_password = this.encryptPassword(password)
            })
            .get(function () {
                        return this._password
            })

userSchema.methods = {
            //^salt
            makeSalt: function () {
                        return Math.round(new Date().valueOf() * Math.random()) + ''
            },
            //^encrypt password
            encryptPassword: function (password) {
                        if (!password) return '';
                        try {
                                    return crypto
                                                .createHmac("sha1", this.salt)
                                                .update(password)
                                                .digest('hex')
                        } catch (e) {
                                    return ''
                        }
            },
            //^Compare password
            authenticate: function (plainPassword) {
                        return this.encryptPassword(plainPassword) === this.hashed_password
            }
}

module.exports = User = mongoose.model("User", userSchema);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

// schema
const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, requried: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  usertype: { type: String, required: true },
});

userSchema.pre("save", function (next) {
  var user = this;

  // Generate a unique salt and hash the password.
  bcrypt
    .genSalt(10)
    .then((salt) => {
      bcrypt
        .hash(user.password, salt)
        .then((encryptedPwd) => {
          // Password was hashed, update the user password.
          // The new hased password will be saved to the database.
          user.password = encryptedPwd;
          next();
        })
        .catch((err) => {
          console.log(`Error occured when hashing. ${err}`);
        });
    })
    .catch((err) => {
      console.log(`Error occured when salting. ${err}`);
    });
});

// model & export
const User = mongoose.model("user", userSchema);
module.exports = User;

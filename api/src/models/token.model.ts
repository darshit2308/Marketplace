// import { Schema, model } from 'mongoose';

// // Define the User schema
// const userSchema = new Schema({
//   name: {
//     type: String,
//     required: true
// },
//   email: {
//     type: String,
//     required: true,
//     unique: true
// },
//   age:
//   { type: Number,
//     required: false
// },
// });

// // Create the User model
// const User = model('User', userSchema);

// export default User;

import { Schema, model } from "mongoose";
const tokenDetails = new Schema({
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  whitelist: {
    type: [String],
    required: true,
  },
  contributors: {
    type: [String],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  whitelistAddr: {
    type: String,
    required: true,
  },
  instanceAddr: {
    type: String,
    required: true,
  },
});

// Create the TokenDetails model
const TokenDetails = model("TokenDetails", tokenDetails);

export default TokenDetails;

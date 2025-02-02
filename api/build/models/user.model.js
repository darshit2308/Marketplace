"use strict";
// import { Schema, model } from 'mongoose';
Object.defineProperty(exports, "__esModule", { value: true });
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
const mongoose_1 = require("mongoose");
const tokenDetails = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    leaves: {
        type: [String], // Array of strings
        default: []
    }
});
// Create the TokenDetails model
const TokenDetails = (0, mongoose_1.model)('TokenDetails', tokenDetails);
exports.default = TokenDetails;
//# sourceMappingURL=user.model.js.map
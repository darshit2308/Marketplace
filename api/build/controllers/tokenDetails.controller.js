"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLeaf = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
// Controller function to add commitement to the leaves array
const addLeaf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, commitment } = req.body;
        // Step 1: Find the TokenDetails object using the symbol
        const tokenDetails = yield user_model_1.default.findOne({ symbol });
        // Step 2: If the token details are not found, return an error
        if (!tokenDetails) {
            return res.status(404).json({ message: 'Token details not found' });
        }
        // Step 3: Add the commitment to the leaves array
        tokenDetails.leaves.push(commitment);
        // Step 4: Save the updated object back to the database
        yield tokenDetails.save();
        // Step 5: Return a success response
        res.status(200).json({ message: 'Commitment added successfully', tokenDetails });
    }
    catch (error) {
        // Handle any errors
        res.status(500).json({ message: 'Error adding commitment', error });
    }
});
exports.addLeaf = addLeaf;
//# sourceMappingURL=tokenDetails.controller.js.map
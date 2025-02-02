import { Request, Response } from "express";
import TokenDetails from "../models/user.model";

// Controller function to add commitement to the leaves array

export const addLeaf = async (req , res) => {
    try {
        const {symbol , commitment} = req.body;

        // Step 1: Find the TokenDetails object using the symbol
        const tokenDetails = await TokenDetails.findOne({ symbol });

        // Step 2: If the token details are not found, return an error
        if (!tokenDetails) {
        return res.status(404).json({ message: 'Token details not found' });
        }

        // Step 3: Add the commitment to the leaves array
        tokenDetails.leaves.push(commitment);

        // Step 4: Save the updated object back to the database
        await tokenDetails.save();

        // Step 5: Return a success response
        res.status(200).json({ message: 'Commitment added successfully', tokenDetails });
    }
    catch (error) {
        // Handle any errors
        res.status(500).json({ message: 'Error adding commitment', error });
    }
};

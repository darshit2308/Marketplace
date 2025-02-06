import { Request, Response } from "express";
import TokenDetails from "../models/user.model";

// Controller function to add commitement to the whiteList array

export const createToken = async (req: Request, res: Response) => {
  try {
    const { name, symbol } = req.body;

    const whitelist: string[] = [];
    const contributors: string[] = [];

    await TokenDetails.create({
      name,
      symbol,
      whitelist,
      contributors,
    });

    res.send("Created successfully");
  } catch (error) {
    res.status(500).json({ message: "error creating.", error });
  }
};

export const addInWhiteList = async (req: Request, res: Response) => {
  try {
    const { symbol, commitment } = req.body;

    // Step 1: Find the TokenDetails object using the symbol
    const tokenDetails = await TokenDetails.findOne({ symbol });

    // Step 2: If the token details are not found, return an error
    if (!tokenDetails) {
      res.status(404).json({ message: "Token details not found" });
      return;
    }

    // Step 3: Add the commitment to the whiteList array
    //tokenDetails.whitelist.push(commitment);
    let newWhitelist = tokenDetails.whitelist;
    newWhitelist.push(commitment);
    tokenDetails.whitelist = newWhitelist;

    // Step 4: Save the updated object back to the database
    await tokenDetails.save();

    // Step 5: Return a success response
    res
      .status(200)
      .json({ message: "Commitment added successfully", tokenDetails });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Error adding commitment", error });
  }
};

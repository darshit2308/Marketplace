import { Request, Response } from "express";
import TokenDetails from "../models/token.model";

// Controller function to add commitement to the whiteList array

export const createToken = async (req: Request, res: Response) => {
  try {
    const { name, symbol, address, whitelistAddr, instanceAddr } = req.body;

    const whitelist: string[] = [];
    const contributors: string[] = [];

    await TokenDetails.create({
      name,
      symbol,
      whitelist,
      contributors,
      address,
      whitelistAddr,
      instanceAddr,
    });

    res.send("Created successfully");
  } catch (error) {
    res.status(500).json({ message: "error creating.", error });
  }
};

export const addInWhiteList = async (req: Request, res: Response) => {
  try {
    const { symbol, hash } = req.body;

    // Step 1: Find the TokenDetails object using the symbol
    const tokenDetails = await TokenDetails.findOne({ symbol });

    // Step 2: If the token details are not found, return an error
    if (!tokenDetails) {
      res.status(404).json({ message: "Token details not found" });
      return;
    }

    // Step 3: Add the hash to the whiteList array
    //tokenDetails.whitelist.push(hash);
    let newWhitelist = tokenDetails.whitelist;
    newWhitelist.push(hash);
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

export const addContributor = async (req: Request, res: Response) => {
  try {
    const { symbol, contributor } = req.body;

    // Step 1: Find the TokenDetails object using the symbol
    const tokenDetails = await TokenDetails.findOne({ symbol });

    // Step 2: If the token details are not found, return an error
    if (!tokenDetails) {
      res.status(404).json({ message: "Token details not found" });
      return;
    }

    // Step 3: Add the contributor to the contributors array
    //tokenDetails.contributors.push(contributor);
    let newContributors = tokenDetails.contributors;
    newContributors.push(contributor);
    tokenDetails.contributors = newContributors;

    // Step 4: Save the updated object back to the database
    await tokenDetails.save();

    // Step 5: Return a success response
    res
      .status(200)
      .json({ message: "Contributor added successfully", tokenDetails });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Error adding contributor", error });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.query;

    // Step 1: Find the TokenDetails object using the symbol
    const tokenDetails = await TokenDetails.findOne({ symbol });

    // Step 2: If the token details are not found, return an error
    if (!tokenDetails) {
      res.status(404).json({ message: "Token details not found" });
      return;
    }

    // Step 3: Return the token details
    res.status(200).json({ tokenDetails });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Error getting token details", error });
  }
};

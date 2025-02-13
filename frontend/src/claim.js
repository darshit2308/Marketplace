import React from "react";
import "../src/register.css";
import { useState } from "react";
import callMethod from "./utils/callMethod";
import { ethers } from "ethers";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
      token: "",
      walletAddress: "",
    });
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };
  
    const handleSubmit = async(e) => {
      e.preventDefault(); 
      console.log("Form Data Submitted:", formData);
      if (!window.ethereum)
        alert("Please install metamask or a similar wallet")
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  provider.send("eth_requestAccounts", []);
  const addresses = await provider.listAccounts();
  console.log(addresses);
  const address = addresses[0].address;
  callMethod(formData.amount, address, formData.token, "claim");
    };
  
    return (
      <div className="register-page">
        <h1>Claim</h1>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="token">Token:</label>
            <input
              type="text"
              id="token"
              name="token"
              value={formData.token}
              onChange={handleInputChange}
              placeholder="Enter your token"
              required
            />
            <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Enter the amount that you contributed(in eth)"
            required/>
          </div>
          
  
          {/* <div className="form-group">
            <label htmlFor="walletAddress">Wallet Address:</label>
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleInputChange}
              placeholder="Enter your wallet address"
              required
            />
          </div> */}
  
          <button type="submit" className="register-button">
            Claim
          </button>
        </form>
      </div>
    );
  };
  
  export default RegisterPage;
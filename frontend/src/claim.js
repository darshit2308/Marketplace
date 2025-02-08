import React from "react";
import "../src/register.css";
import { useState } from "react";

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
  
    const handleSubmit = (e) => {
      e.preventDefault(); 
      console.log("Form Data Submitted:", formData);
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
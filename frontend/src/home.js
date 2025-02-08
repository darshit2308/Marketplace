import React from "react";
import "../src/home.css";
import { useNavigate } from "react-router-dom";

console.log("inside home");
const Home = () => {

  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  }


  return (
    <div>
      <div className="background" >
      </div>
      <button className="register" onClick={handleRegisterClick}>
        <div>Register</div>
      </button>
    </div>
    
  )
}
export default Home;
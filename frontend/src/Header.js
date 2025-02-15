// import React from "react";
// import { Link } from "react-router-dom";
// import "./header.css"; // Import header-specific styles

// const Header = () => {
//   return (
//     <nav className="navigation">
//       <ul>
//         <li>
//           <Link to="/">Home</Link>
//         </li>
//         <li>
//           <Link to="/register">Register</Link>
//         </li>
//         <li>
//           <Link to="/contribute">Contribute</Link>
//         </li>
//         <li>
//           <Link to="/claiming">Claiming</Link>
//         </li>
//       </ul>
//     </nav>
//   );
// };

// export default Header;
import React from "react";
import { Link } from "react-router-dom";
import "./header.css"; // Ensure your CSS file is correctly linked

const Header = () => {
  return (
    <nav className="header">
      <div className="logo-container">
        {/* Make logo clickable and redirect to home */}
        <Link to="/" className="logo-link">
          <div className="logo-container">
            <img src="/logo.png" alt="VeilPad Logo" className="logo" />
            <h1 className="site-name">VeilPad</h1>
          </div>
        </Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/contribute">Contribute</Link>
        </li>
        <li>
          <Link to="/claiming">Claim</Link>
        </li>
      </ul>

      <div className="right-section">
        <Link to="/ExploreVeilpad" className="explore-btn">
          Explore VeilPad
        </Link>
      </div>
    </nav>
  );
};

export default Header;

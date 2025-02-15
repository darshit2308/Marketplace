// import React from "react";
// import { Github, Linkedin, Mail, MessageCircle } from "lucide-react";
// import { Link } from "react-router-dom";
// import "./Footer.css";

// const Footer = () => {
//   const teamMembers = [
//     {
//       name: "Alice Chen",
//       role: "Full Stack Developer",
//       github: "https://github.com/alicechen",
//       linkedin: "https://linkedin.com/in/alicechen",
//     },
//     {
//       name: "Bob Smith",
//       role: "Blockchain Specialist",
//       github: "https://github.com/bobsmith",
//       linkedin: "https://linkedin.com/in/bobsmith",
//     },
//     {
//       name: "Carol Wu",
//       role: "UI/UX Designer",
//       github: "https://github.com/carolwu",
//       linkedin: "https://linkedin.com/in/carolwu",
//     },
//   ];

//   return (
//     <footer className="footer">
//       <div className="footer-content">
//         <div className="footer-grid">
//           {/* Quick Links Section */}
//           <div className="footer-section">
//             <h3>Quick Links</h3>
//             <ul>
//               <li>
//                 <Link to="/">Home</Link>
//               </li>
//               <li>
//                 <Link to="/register">Register</Link>
//               </li>
//               <li>
//                 <Link to="/contribute">Contribute</Link>
//               </li>
//               <li>
//                 <Link to="/claiming">Claiming</Link>
//               </li>
//               <li>
//                 <Link to="/privacy">Privacy Policy</Link>
//               </li>
//               <li>
//                 <Link to="/terms">Terms & Conditions</Link>
//               </li>
//             </ul>
//           </div>

//           {/* About Section */}
//           <div className="footer-section">
//             <h3>About VeilPad</h3>
//             <p>
//               Building the future of decentralized finance through secure
//               blockchain solutions.
//             </p>
//             <p>Launching March 2025</p>
//           </div>

//           {/* Team Section */}
//           <div className="footer-section">
//             <h3>Meet the Team</h3>
//             <div className="team-grid">
//               {teamMembers.map((member) => (
//                 <div key={member.name} className="team-member">
//                   <p className="member-name">{member.name}</p>
//                   <p className="member-role">{member.role}</p>
//                   <div className="social-links">
//                     <a
//                       href={member.github}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="social-icon"
//                     >
//                       <Github size={18} />
//                     </a>
//                     <a
//                       href={member.linkedin}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="social-icon"
//                     >
//                       <Linkedin size={18} />
//                     </a>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Bottom Section */}
//         <div className="footer-bottom">
//           <div className="contact-links">
//             <a href="mailto:team@veilpad.dev" className="contact-link">
//               <Mail size={18} />
//               <span>team@veilpad.dev</span>
//             </a>
//             <a href="https://discord.gg/veilpad" className="contact-link">
//               <MessageCircle size={18} />
//               <span>Join Discord</span>
//             </a>
//           </div>
//           <div className="copyright">
//             <p>Built with React, Solidity, and ❤️</p>
//             <p>© 2025 VeilPad. All rights reserved.</p>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
import React from "react";
import { Github, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const teamMembers = [
    {
      name: "Ankit Baidsen",
      role: "Blockchain/Backend Dev",
      github: "https://github.com/neetance",
      linkedin: "https://linkedin.com/in/ankit-baidsen-202106290/",
    },
    {
      name: "Darshit Khandelwal",
      role: "Fullstack Developer",
      github: "https://github.com/darshit2308",
      linkedin: "https://www.linkedin.com/in/darshit-khandelwal-49bb25288/",
    },
    {
      name: "Ritesh Pandit",
      role: "Fullstack Developer",
      github: "https://github.com/Slambot01",
      linkedin: "https://www.linkedin.com/in/ritesh-pandit-0a5479283/",
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* Quick Links Section */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
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
                <Link to="/claiming">Claiming</Link>
              </li>
            </ul>
          </div>

          {/* Connect Us Section */}
          <div className="footer-section">
            <h3>Connect With Us</h3>
            <div className="team-grid">
              {teamMembers.map((member) => (
                <div key={member.name} className="team-member">
                  {/* Social Icons FIRST */}
                  <div className="social-links">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                    >
                      <Github size={18} />
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                    >
                      <Linkedin size={18} />
                    </a>
                  </div>

                  {/* Name and Role NEXT */}
                  <p className="member-name">{member.name}</p>
                  <p className="member-role">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="footer-section">
            <h3>About VeilPad</h3>
            <p>
              Revolutionising token launchpads and marketplaces with
              zero-knowledge
            </p>
            <p></p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p>Built with React, Solidity, and ZKVerify</p>
          <p>© 2025 VeilPad. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

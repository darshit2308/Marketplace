import React from "react";
import { Zap, Lock, Globe } from "lucide-react";
import "./HomeContent.css";

const HomeContent = () => {
  const features = [
    {
      icon: <Zap />,
      title: "Lightning Fast",
      description:
        "Process thousands of transactions per second with our optimized blockchain network.",
    },
    {
      icon: <Lock />,
      title: "Bank-Grade Security",
      description:
        "Allows secure token buying with zero-knowledge transactions.",
    },
    {
      icon: <Globe />,
      title: "Global Access",
      description:
        "Connect and transact with users worldwide on our decentralized network.",
    },
    // {
    //   icon: <Shield />,
    //   title: "Secure Platform",
    //   description:
    //     "Stay confident with our fully compliant and secure blockchain platform.",
    // },
  ];

  const teamMembers = [
    {
      name: "Ankit Baidsen",
      role: "Blockchain/Backend Developer",
      image: "/image1.png",
      description:
        "Specializes in developing clean and efficient smart contracts and integrating them with dApps",
    },
    {
      name: "Darshit Khandelwal",
      role: "Fullstack Developer",
      image: "/image2.png",
      description:
        "Fullstack developer, experienced in developing a variety of web applications",
    },
    {
      name: "Ritesh Pandit",
      role: "Full Stack Developer",
      image: "/image3.png",
      description:
        "Designed multiple UIs, bringing web pages to life with his creativity and skills",
    },
  ];

  return (
    <div className="home-content">
      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <p className="team-description">
          Built by a team of hackathon enthusiasts, our project leverages
          zero-knowledge to provide a secure and anonymous token launchpad.
        </p>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <img src={member.image} alt={member.name} />
              <h3>{member.name}</h3>
              <div className="member-role">{member.role}</div>
              <p>{member.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeContent;

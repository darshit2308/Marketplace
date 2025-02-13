// import React from "react";
// import "../src/home.css";
// import { useNavigate } from "react-router-dom";

// console.log("inside home");
// const Home = () => {
//   const navigate = useNavigate();

//   const handleRegisterClick = () => {
//     navigate("/register");
//   };

//   return (
//     <div>
//       <div className="background"></div>
//       <button className="register" onClick={handleRegisterClick}>
//         <div>Register</div>
//       </button>
//     </div>
//   );
// };
// export default Home;
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // Import Link from React Router
import { Shield } from "lucide-react";
import "./home.css";
import ExploreVeilpad from "./ExploreVeilpad"; // Import ExploreVeilpad component
import HomeContent from "./HomeContent";
import Footer from "./Footer";

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const particleCount = 100;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 6 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgb(188, 185, 149)";
        // ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.shadowBlur = 10;
        // ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowColor = "rgba(255, 255, 255, 0.48)";
        ctx.fill();
        ctx.closePath();
      }
    }

    function init() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      connectParticles();
      requestAnimationFrame(animate);
    }

    init();
    animate();
  }, []);

  return <canvas ref={canvasRef} className="animated-background" />;
};

const Home = () => {
  const [showExplore, setShowExplore] = useState(false); // State to toggle ExploreVeilpad

  return (
    <div className="home-container">
      <AnimatedBackground />

      <main className="main-content">
        <div className="trusted-badge">
          <Shield className="icon" />
          <span>Trusted Platform</span>
        </div>

        <h1 className="title">
          Revolutionizing Token Launchpads
          <br />
          <span className="subtitle">With Zero Knowledge</span>
        </h1>
        <p className="description">
          A token launchpad powered by zero-knowledge proofs where 
               users can register in whitelist, contribute and 
                claim tokens while being completely anonymous
        </p>

        {/* Register Button */}
        <Link to="/register" className="register-btn">
          Register
        </Link>

        {/* Conditionally render ExploreVeilpad section */}
        {showExplore && <ExploreVeilpad />}

        <HomeContent />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
import React from "react";
import DiagonalGreenWave from "./DiagonalGreenWave";
import heroine from "../../assets/hero.png";
import "./Home.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <DiagonalGreenWave />

      {/* Text Content */}
      <div className="absolute top-1/2 left-4 sm:left-10 lg:left-20 -translate-y-1/2 max-w-xl lg:max-w-2xl px-4 sm:px-0">
        <h1 className="text-3xl sm:text-4xl font-black mb-4 sm:mb-6 welcome">
          Welcome To <span className=" home-head underline ">AcnePilot</span>
        </h1>

        <p className="w-full sm:w-[80%] lg:w-[70%] text-base sm:text-lg leading-relaxed text-gray-700">
          "AcnePilot is an AI-powered dermatology platform that guides you from
          acne assessment to personalized treatment, delivering intelligent
          severity analysis and adaptive daily care plans for safe and consistent
          skincare results."
        </p>

        {/* Buttons */}
        <div className="buttons mt-10 sm:mt-16 lg:mt-20 flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="bg-teal-500 text-white px-8 sm:px-16 py-3 text-base sm:text-lg font-semibold border-2 border-teal-500 hover:bg-transparent hover:text-teal-500 transition-all duration-300 text-center"
          >
            GO TO DASHBOARD
          </Link>
          <Link
            to="/register"
            className="bg-transparent text-teal-500 px-8 sm:px-16 py-3 text-base sm:text-lg font-semibold border-2 border-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-300 text-center"
          >
            JOIN WITH US
          </Link>
        </div>
      </div>

      {/* Heroine Image — hidden on mobile, smaller on tablet, full on desktop */}
      <div className="hidden sm:block absolute bottom-0 right-4 md:right-8 lg:right-16 h-[65%] md:h-[75%] lg:h-[90%]">
        <img
          src={heroine}
          alt="Heroine"
          className="h-full object-contain"
          style={{ filter: "drop-shadow(0 0 10px black)" }}
        />
      </div>
    </div>
  );
};

export default Home;
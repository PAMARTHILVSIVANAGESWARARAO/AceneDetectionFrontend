import React, { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const baseData = {
  labels: ["Clean", "Mild", "Moderate", "Severe", "Unknown"],
  datasets: [
    {
      label: "Correct Predictions",
      data: [165, 132, 130, 138, 185],
      backgroundColor: "rgba(20,184,166,0.85)",
      borderRadius: 0,
      barPercentage: 0.7,
    },
    {
      label: "Incorrect Predictions",
      data: [45, 80, 85, 75, 30],
      backgroundColor: "rgba(14,165,233,0.85)",
      borderRadius: 0,
      barPercentage: 0.7,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const Analytics = () => {
  const listRef = useRef(null);

  useEffect(() => {
    animate(".explanation-item", {
      opacity: [0, 1],
      translateY: [20, 0],
      easing: "easeOutQuad",
      duration: 800,
      delay: stagger(150),
    });
  }, []);

  return (
    <div className="w-full flex flex-col gap-10 p-4 sm:p-8">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700;800&display=swap');
        `}
      </style>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "Playfair Display, serif",
          fontWeight: 800,
          textAlign: "center",
          fontSize: "clamp(28px, 5vw, 56px)",
          background: "linear-gradient(90deg, #14b8a6, #0ea5e9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "1px",
          textDecoration: "underline",
          textDecorationColor: "rgba(14,165,233,0.85)",
          textDecorationThickness: "4px",
          textUnderlineOffset: "6px",
          marginTop: 20,
        }}
      >
        Our Proposed Model Performance
      </h1>

      {/* Main Section with equal heights */}
      <div className="w-full flex flex-col lg:flex-row gap-8">
        {/* Graph */}
        <div
          className="
            w-full 
            lg:w-[40%] 
            h-95.5 
            sm:h-105 
            md:h-120 
            lg:h-135
            bg-white 
            rounded-2xl 
            shadow-xl 
            p-4 sm:p-6
          "
        >
          <div className="w-full h-full">
            <Bar data={baseData} options={options} />
          </div>
        </div>

        {/* Explanation Content (now fits without scrollbar) */}
        <div
          className="
            w-full 
            lg:w-[60%] 
            h-95.5 
            sm:h-105 
            md:h-120 
            lg:h-135
            bg-transparent 
            rounded-2xl 
            p-4 sm:p-6
            /* overflow-y-auto removed – content now fits */
          "
        >
          <ol className="space-y-3" ref={listRef}> {/* Reduced from space-y-6 to space-y-3 */}
            <li className="explanation-item flex gap-3 items-start border-2 border-teal-500 rounded-xl p-3 opacity-0"> {/* Reduced padding and gap */}
              <div className="min-w-10 h-10 bg-teal-500 text-white text-xl font-bold flex items-center justify-center rounded-full"> {/* Smaller circle, smaller text */}
                1
              </div>
              <div>
                <p className="text-gray-800 text-sm sm:text-base font-medium"> {/* Slightly smaller text on mobile */}
                  Correct outnumber incorrect by 3:1, saving time.
                </p>
              </div>
            </li>

            <li className="explanation-item flex gap-3 items-start border-2 border-teal-500 rounded-xl p-3 opacity-0">
              <div className="min-w-10 h-10 bg-teal-500 text-white text-xl font-bold flex items-center justify-center rounded-full">
                2
              </div>
              <div>
                <p className="text-gray-800 text-sm sm:text-base font-medium">
                  138 correct vs 75 wrong in severe cases
                </p>
              </div>
            </li>

            <li className="explanation-item flex gap-3 items-start border-2 border-teal-500 rounded-xl p-3 opacity-0">
              <div className="min-w-10 h-10 bg-teal-500 text-white text-xl font-bold flex items-center justify-center rounded-full">
                3
              </div>
              <div>
                <p className="text-gray-800 text-sm sm:text-base font-medium">
                  Only 30 wrong in 'Unknown' – minimal ambiguity.
                </p>
              </div>
            </li>

            <li className="explanation-item flex gap-3 items-start border-2 border-teal-500 rounded-xl p-3 opacity-0">
              <div className="min-w-10 h-10 bg-teal-500 text-white text-xl font-bold flex items-center justify-center rounded-full">
                4
              </div>
              <div>
                <p className="text-gray-800 text-sm sm:text-base font-medium">
                  Unknown:{" "}
                  <span className="font-semibold text-teal-600">
                    185 correct
                  </span>{" "}
                  vs 30 incorrect predictions.
                </p>
              </div>
            </li>

            <li className="explanation-item flex gap-3 items-start border-2 border-teal-500 rounded-xl p-3 opacity-0">
              <div className="min-w-10 h-10 bg-teal-500 text-white text-xl font-bold flex items-center justify-center rounded-full">
                5
              </div>
              <div>
                <p className="text-gray-800 text-sm sm:text-base font-medium">
                  750+ Successes, Total correct predictions you can trust Us.
                </p>
              </div>
            </li>

            <li className="explanation-item flex gap-3 items-start border-2 border-teal-500 rounded-xl p-3 opacity-0">
              <div className="min-w-10 h-10 bg-teal-500 text-white text-xl font-bold flex items-center justify-center rounded-full">
                6
              </div>
              <div>
                <p className="text-gray-800 text-sm sm:text-base font-medium">
                  To handle mispredictions, we cross-verify acne severity using
                  mental health, stress level, sleep cycle, skin type, and
                  medication history data from the questionnaire before final AI
                  treatment generation.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* Footer styled like the main heading */}
      <div
          style={{
            marginTop: 60,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            opacity: 0.5,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: i === 2 ? 24 : 6,
                height: 6,
                borderRadius: 999,
                background: "#14b8a6",
                transition: "width 0.3s",
              }}
            />
          ))}
        </div>
    </div>
  );
};

export default Analytics;

import React from "react";
import "./info.css";

export default function Info() {
  return (
    <div className="mt-24 ml-10">
      <div className="container mx-auto px-4 py-6">

        {/* Title */}
        <h1 className="text-3xl font-semibold mb-6 text-blue-600">
          COET Chatbot 🤖
        </h1>

        {/* About Card */}
        <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            About College of Engineering Thalassery 🎓
          </h2>
          <p className="text-gray-700 leading-relaxed">
            College of Engineering Thalassery (COET) is a reputed government cost-sharing 
            engineering institution under CAPE. It offers B.Tech, M.Tech, MCA, and MBA 
            programs with strong academic excellence, research culture, and placement support.
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Chatbot Features 💡
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Instant answers for admissions & courses</li>
            <li>Placement & hostel information</li>
            <li>Human-like conversation</li>
            <li>Smart AI query understanding</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-gray-500 py-4 text-center mt-6 text-sm">
          © {new Date().getFullYear()} College of Engineering Thalassery
        </div>

      </div>
    </div>
  );
}

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./HeroPage/Hero";
import NotFoundPage from "./HeroPage/NotFound/NotFoundPage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
    </BrowserRouter>
  );
};

export default App;
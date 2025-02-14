import './index.css'
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Agent from './components/Agents';
import ChatPage from './pages/ChatPage';
import VoiceChatPage from './pages/VoiceChatPage';
import InsightsPage from './pages/InsightsPage';
import TransactionPage from './pages/TransactionPage';
import Layout from './components/Layout';
import Trending from './pages/TrendingTokens';

const App = () => {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 animate-pulse bg-[url('/animated-bg.svg')] bg-cover opacity-10"></div>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Agent />
            <Features />
          </>
        } />
        <Route element={<Layout />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/voice-chat" element={<VoiceChatPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/transactions" element={<TransactionPage />} />
          <Route path="/trending" element={<Trending />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App
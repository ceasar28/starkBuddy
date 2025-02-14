import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { FaCoins, FaComments, FaMicrophoneAlt, FaChartLine, FaExchangeAlt } from "react-icons/fa";

const Layout = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex h-[calc(100vh-5rem)] overflow-hidden z-10">
            {/* Main Content */}
            <div className="custom-scrollbar flex-1 bg-black text-white p-6 overflow-auto z-20">
                <Outlet />
            </div>

            {/* Collapsible Sidebar */}
            <div className={`fixed right-0 top-13 md:top-16.5 lg:top-24 h-full bg-[#1c1c1c] transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"} w-66 shadow-lg z-30`}>
                <button
                    className="absolute left-[-50px] top-4 bg-black text-[#3fe8ab] p-3 rounded-l-lg"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                <div className="p-6 flex flex-col justify-between h-full text-white">
                    {/* Main navigation links */}
                    <nav className="flex flex-col space-y-10 mb-auto">
                        <Link
                            to="/chat"
                            className={`flex items-center text-base md:text-xl hover:text-[#3fe8ab] transition ${location.pathname === "/chat" ? "text-[#3fe8ab]" : ""}`}
                        >
                            <FaComments className="mr-4 text-base md:text-xl" />
                            Chat
                        </Link>
                        <Link
                            to="/voice-chat"
                            className={`flex items-center text-base md:text-xl hover:text-[#3fe8ab] transition ${location.pathname === "/voice-chat" ? "text-[#3fe8ab]" : ""}`}
                        >
                            <FaMicrophoneAlt className="mr-4 text-base md:text-xl" />
                            Voice Chat
                        </Link>
                        <Link
                            to="/insights"
                            className={`flex items-center text-base md:text-xl hover:text-[#3fe8ab] transition ${location.pathname === "/insights" ? "text-[#3fe8ab]" : ""}`}
                        >
                            <FaCoins className="mr-4 text-base md:text-xl" />
                            Token Insights
                        </Link>
                        <Link
                            to="/transactions"
                            className={`flex items-center text-base md:text-xl hover:text-[#3fe8ab] transition ${location.pathname === "/transactions" ? "text-[#3fe8ab]" : ""}`}
                        >
                            <FaExchangeAlt className="mr-4 text-base md:text-xl" />
                            Transaction Insights
                        </Link>
                        <Link
                            to="/trending"
                            className={`flex items-center text-base md:text-xl hover:text-[#3fe8ab] transition ${location.pathname === "/trending" ? "text-[#3fe8ab]" : ""}`}
                        >
                            <FaChartLine className="mr-4 text-base md:text-xl" />
                            Trending
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Layout;
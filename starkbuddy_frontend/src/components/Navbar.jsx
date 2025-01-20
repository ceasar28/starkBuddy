import React from "react";
import { FaTwitter, FaTelegram } from "react-icons/fa";

const Navbar = () => {
    return (
        <nav className="flex flex-wrap items-center justify-between px-4 py-4 md:px-6 md:py-6">
            {/* Logo and Text */}
            <div className="flex items-center">
                <img
                    src="/assets/StarkBuddyNoBG.png"
                    alt="StarkBuddy Logo"
                    className="h-12 w-12 md:h-16 md:w-16 mr-2 md:mr-4"
                />
                <span className="text-lg md:text-2xl font-bold text-[#3fe8ab]">StarkBuddy</span>
            </div>
            
            {/* Icons */}
            <ul className="flex items-center space-x-4 md:space-x-14">
                <li>
                    <a
                        href="https://t.me/starkBuddy_ai_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-10 w-10 md:h-14 md:w-14 bg-[#3fe8ab] text-white rounded-lg hover:bg-[#32d097] transform hover:scale-105 transition-all"
                    >
                        <FaTelegram className="text-xl md:text-4xl align-middle" />
                    </a>
                </li>
                <li>
                    <a
                        href="https://x.com/StarkBuddy_ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-10 w-10 md:h-14 md:w-14 bg-[#3fe8ab] text-white rounded-lg hover:bg-[#32d097] transform hover:scale-105 transition-all"
                    >
                        <FaTwitter className="text-xl md:text-4xl align-middle" />
                    </a>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
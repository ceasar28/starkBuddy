import React from "react";
import { FaTwitter, FaTelegram } from "react-icons/fa";

const Agent = () => {
    return (
        <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 mb-16 md:mb-0 md:space-x-8 py-8">
            <a
                href="https://t.me/starkBuddy_ai_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-[240px] px-6 py-3 bg-[#3fe8ab] text-white text-lg md:text-2xl rounded-lg space-x-3 hover:bg-[#32d097] transform hover:scale-105 transition-all"
            >
                <FaTelegram className="text-2xl md:text-4xl" />
                <span>Telegram Agent</span>
            </a>
            <a
                href="https://x.com/StarkBuddy_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-[240px] px-6 py-3 bg-[#3fe8ab] text-white text-lg md:text-2xl rounded-lg space-x-3 hover:bg-[#32d097] transform hover:scale-105 transition-all"
            >
                <FaTwitter className="text-2xl md:text-4xl" />
                <span>Twitter Agent</span>
            </a>
        </div>
    );
};

export default Agent;

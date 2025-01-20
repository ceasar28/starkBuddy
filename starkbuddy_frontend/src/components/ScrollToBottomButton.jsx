import React from "react";

import { FiChevronDown } from "react-icons/fi";

const ScrollToBottomButton = ({ onClick }) => (
    <div
        onClick={onClick}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#31c08c] text-black rounded-full p-3 cursor-pointer hover:bg-[#3fe8ab] transition-transform transform hover:scale-110"
    >
        <FiChevronDown className="w-8 h-8" />
    </div>
);

export default ScrollToBottomButton;
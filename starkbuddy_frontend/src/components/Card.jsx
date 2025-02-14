import React from "react";
import { FiChevronRight } from "react-icons/fi";

const Card = ({ title, description, link }) => {
    return (
        <div className="relative p-6 border border-[#3fe8ab] rounded-lg shadow-lg min-h-[170px] flex flex-col justify-between">
            <h3 className="text-xl font-bold text-[#3fe8ab] mb-4">{title}</h3>
            <p className="mb-4 text-white pr-16">{description}</p>
            <a
                href={link}
                className="text-[#3fe8ab] hover:text-[#1c7e67] hover:underline flex items-center"
            >
                {/* Circle container for the arrow */}
                <div className="absolute right-6 bottom-1/2 transform translate-y-1/2 flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#3fe8ab] hover:bg-[#3fe8ab] hover:text-white transition-all duration-300 hover:scale-110">
                    <FiChevronRight className="w-8 h-8 transition-transform transform hover:translate-x-4 duration-300" />
                </div>
            </a>
        </div>
    );
};

export default Card;
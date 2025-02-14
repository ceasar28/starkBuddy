import React from "react";

const ChatInput = ({ value, placeholder, onChange, onKeyPress, onSend }) => (
    <div className="flex items-center space-x-2 mt-4 relative w-full">
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyPress={onKeyPress}
            className="flex-1 px-4 py-2 bg-[#333] text-white rounded-lg focus:outline-none cursor-text z-10"
        />
        <button
            onClick={onSend}
            className="px-4 py-2 bg-[#31c08c] text-black font-bold rounded-lg hover:bg-[#3fe8ab] transition z-20 flex items-center justify-center"
        >
            Send
        </button>
    </div>
);

export default ChatInput;
import React from "react";
import ReactMarkdown from "react-markdown";

const Message = ({ type, text }) => {
    const messageLines = text.split("\n");

    return (
        <div className={`flex ${type === "user" ? "justify-end" : "justify-start"}`}>
            <div
                className={`p-3 rounded-lg inline-block ${type === "user" ? "text-black bg-[#31c08c]" : "text-white bg-[#0e0e0e]"}`}
            >
                {messageLines.map((line, index) => (
                    <div key={index}>
                        <ReactMarkdown>
                            {line}
                        </ReactMarkdown>
                        {index < messageLines.length - 1 && <br />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Message;
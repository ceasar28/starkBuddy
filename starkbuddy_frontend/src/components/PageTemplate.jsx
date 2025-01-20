import React, { useState, useEffect, useRef } from "react";
import { FiChevronLeft } from "react-icons/fi";
import Message from "./Message";
import ScrollToBottomButton from "./ScrollToBottomButton";
import ChatInput from "./ChatInput";
import { getOrCreateUsername } from "../utils/getUsername";

const PageTemplate = ({ title, placeholder, endpoint, generatePayload, formatReply }) => {
  const [username, setUsername] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatBoxRef = useRef(null);

  const handleSend = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { type: "user", text: input }];
      setMessages(newMessages);
      setInput("");

      try {
        setIsLoading(true);
        // Dynamically generate payload based on the page type
        const payload = generatePayload(input, username);

        if (payload === "Invalid transaction hash." || payload === "Invalid address.") {
          const systemMessage = { type: "system", text: payload };
          setMessages((prevMessages) => [...prevMessages, systemMessage]);
          setIsLoading(false);
          return;
        }
        // Send the dynamic payload to the API endpoint
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        const formattedResponse = formatReply(data);

        if (formattedResponse) {
          const systemMessage = { type: "system", text: formattedResponse };
          setMessages((prevMessages) => [...prevMessages, systemMessage]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching reply:", error);
        const systemMessage = { type: "system", text: "Invalid Input." };
        setMessages((prevMessages) => [...prevMessages, systemMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const user = getOrCreateUsername();
    setUsername(user);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleScroll = (e) => {
    const isScrolledUp = e.target.scrollTop < e.target.scrollHeight - e.target.clientHeight;
    setShowScrollToBottom(isScrolledUp);
  };

  return (
    <div className="bg-black text-white">
      <div className="hidden md:flex absolute left-6 top-1/2 transform -translate-y-1/2 lg:left-12 items-center justify-center w-20 h-20 border-2 border-[#3fe8ab] rounded-full hover:bg-[#3fe8ab] hover:text-black transition-all">
        <a href="/" className="flex items-center justify-center w-full h-full">
          <FiChevronLeft className="w-12 h-12 transition-transform transform hover:scale-110" />
        </a>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-8 md:px-6 lg:px-8 min-h-[80vh]">
        <h1 className="text-sm md:text-4xl font-bold text-[#3fe8ab] mb-6 text-center">{title}</h1>
        <div className="relative w-full max-w-4xl bg-[#1c1c1c] rounded-lg shadow-lg p-6 md:p-8 flex flex-col space-y-6">
          <div
            ref={chatBoxRef}
            className="flex-1 overflow-y-auto space-y-6 max-h-[50vh] custom-scrollbar"
            onScroll={handleScroll}
          >
            {messages.map((message, index) => (
              <Message key={index} type={message.type} text={message.text} />
            ))}
            {/* Show loading indicator while awaiting response */}
            {isLoading && <Message type="system" text="Typing..." />}
            <div ref={chatEndRef} />
          </div>

          {showScrollToBottom && <ScrollToBottomButton onClick={() => chatEndRef.current.scrollIntoView({ behavior: "smooth" })} />}
          <ChatInput value={input} placeholder={placeholder} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};

export default PageTemplate;
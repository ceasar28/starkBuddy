import React, { useState, useRef, useEffect } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { Mic, Pause, Play, Square, Trash2, Send, User } from "lucide-react";
import OpenAI from "openai";
import { getOrCreateUsername } from "../utils/getUsername";
import Message from "../components/Message";

const VoiceChatPage = () => {
    const title = "Voice Chat";
    const endpoint = "https://app.eventblink.xyz/starkbuddy/1829d6bd-dd04-0e9f-9e38-f5be69bef551/message";

    const [username, setUsername] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Initialize username from local storage or generate one.
    useEffect(() => {
        const user = getOrCreateUsername();
        setUsername(user);
    }, []);

    // Auto-scroll when messages update.
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Voice Recording Functions
    const handleStartRecording = async () => {
        audioChunksRef.current = [];
        setIsRecording(true);
        setIsPaused(false);
        setHasRecording(false);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            setIsRecording(false);
            setIsPaused(false);
            setHasRecording(true);
        };

        mediaRecorderRef.current.start();
    };

    const handlePauseRecording = () => {
        if (isPaused) {
            mediaRecorderRef.current.resume();
        } else {
            mediaRecorderRef.current.pause();
        }
        setIsPaused((prev) => !prev);
    };

    const handleStopRecording = () => {
        mediaRecorderRef.current.stop();
        setHasRecording(true);
    };

    const handleDeleteRecording = () => {
        audioChunksRef.current = [];
        setHasRecording(false);
    };

    const handleSendRecording = async () => {
        // Create an audio blob from the recorded chunks.
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        const apikey = import.meta.env.VITE_OPENAI_API_KEY;
        const openai = new OpenAI({
            apiKey: apikey,
            dangerouslyAllowBrowser: true,
        });
        // Reset the recording state.
        audioChunksRef.current = [];
        setHasRecording(false);

        try {
            // Add a placeholder message for user processing.
            setMessages((prev) => [
                ...prev,
                { user: "user", message: "Processing your voice message..." },
            ]);

            // Transcribe the audio using OpenAI's Whisper model.
            const transcriptionData = await openai.audio.transcriptions.create({
                file: formData.get("file"),
                model: "whisper-1",
            });
            const userMessage = transcriptionData.text;

            // Remove the placeholder message and add the actual transcribed message.
            setMessages((prev) =>
                prev.filter((msg) => msg.message !== "Processing your voice message...")
            );
            setMessages((prev) => [...prev, { user: "user", message: userMessage }]);

            setLoading(true);
            // Send the transcribed message to your chat endpoint.
            const chatResponse = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userName: username,
                    name: username,
                    text: userMessage,
                }),
            });
            const chatData = await chatResponse.json();
            const botMessage = chatData[0].text;

            // Convert the bot's response to speech using OpenAI TTS.
            const mp3Response = await openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: botMessage,
            });
            const audioResponseBlob = new Blob(
                [await mp3Response.arrayBuffer()],
                { type: "audio/mpeg" }
            );
            const audioUrl = URL.createObjectURL(audioResponseBlob);
            const audio = new Audio(audioUrl);
            audio.play();

            setMessages((prev) => [...prev, { user: "bot", message: botMessage }]);
            setLoading(false);
        } catch (error) {
            console.error("Error handling voice message:", error);
            setLoading(false);
            setMessages((prev) => [
                ...prev,
                { user: "bot", message: "Sorry, something went wrong." },
            ]);
        }
    };

    return (
        <div className="bg-black text-white">
            {/* Back button */}
            <div className="hidden md:flex absolute left-6 top-1/2 transform -translate-y-1/2 lg:left-12 items-center justify-center w-20 h-20 border-2 border-[#3fe8ab] rounded-full hover:bg-[#3fe8ab] hover:text-black transition-all">
                <a href="/" className="flex items-center justify-center w-full h-full">
                    <FiChevronLeft className="w-12 h-12 transition-transform transform hover:scale-110" />
                </a>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center px-4 py-8 md:px-6 lg:px-8 min-h-[80vh]">
                <h1 className="text-sm md:text-4xl font-bold text-[#3fe8ab] mb-6 text-center">
                    {title}
                </h1>
                <div className="relative w-full max-w-4xl bg-[#1c1c1c] rounded-lg shadow-lg p-6 md:p-8 flex flex-col space-y-6">
                    {/* Message Display Area */}
                    <div className="flex-1 overflow-y-auto space-y-6 max-h-[50vh] custom-scrollbar">
                        {messages.map((message, index) => (
                            <Message key={index} type={message.user} text={message.message} />
                        ))}
                        {loading && (
                            <div className="mb-2 p-2 rounded-lg flex border border-[#3fe8ab] self-start">
                                <div className="flex-1">Processing your message...</div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Footer: Voice Chat Controls */}
                    <div className="p-4 border-t border-[#3fe8ab] flex items-center justify-center space-x-4">
                        {!isRecording && !hasRecording && (
                            <button
                                onClick={handleStartRecording}
                                className="p-4 rounded-full bg-[#3fe8ab] hover:opacity-90"
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        )}
                        {isRecording && (
                            <>
                                <button
                                    onClick={handlePauseRecording}
                                    className="p-4 rounded-full bg-[#3fe8ab] hover:opacity-90"
                                >
                                    {isPaused ? (
                                        <Play className="w-5 h-5" />
                                    ) : (
                                        <Pause className="w-5 h-5" />
                                    )}
                                </button>
                                <button
                                    onClick={handleStopRecording}
                                    className="p-4 rounded-full bg-[#3fe8ab] hover:opacity-90"
                                >
                                    <Square className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        {hasRecording && !isRecording && (
                            <>
                                <button
                                    onClick={handleDeleteRecording}
                                    className="p-4 rounded-full bg-[#3fe8ab] hover:opacity-90"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleSendRecording}
                                    className="p-4 rounded-full bg-[#3fe8ab] hover:opacity-80"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceChatPage;
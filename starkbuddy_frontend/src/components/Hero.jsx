import React from "react";

const Hero = () => {
    return (
        <section className="flex flex-col items-center justify-center text-center px-4 py-8 min-h-[70vh] md:min-h-[40vh]">
            <h1 className="text-4xl md:text-6xl font-bold text-[#3fe8ab] mb-6">StarkBuddy</h1>
            <p className="text-xs md:text-lg max-w-2xl text-white leading-relaxed">
                Your AI-powered assistant for deep insights into the StarkNet blockchain. <br />
                Chat with StarkBuddy, explore transactions, analyze token sentiment, and track market trends in real time. <br />
                Engage with our AI agents on Twitter and Telegram for seamless interaction.
            </p>
        </section>
    );
};

export default Hero;
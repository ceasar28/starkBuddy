import React from "react";

const Hero = () => {
    return (
        <section className="flex flex-col items-center justify-center text-center px-4 py-8 min-h-[70vh] md:min-h-[40vh]">
            <h1 className="text-4xl md:text-6xl font-bold text-[#3fe8ab] mb-6">StarkBuddy</h1>
            <p className="text-xs md:text-lg max-w-2xl text-white leading-relaxed">
                Your AI-powered assistant for actionable insights on the StarkNet blockchain. <br />
                Chat with StarkBuddy, interact with our Twitter and Telegram agents. <br />
                Track transactions, analyze tokens, and stay informed with real-time updates.
            </p>
        </section>
    );
};

export default Hero;
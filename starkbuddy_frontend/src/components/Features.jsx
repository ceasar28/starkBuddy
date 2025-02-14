import React from "react";
import Card from "./Card";

const Features = () => {
    const features = [
        {
            title: "Chat with StarkBuddy",
            description: "Connect instantly with our intelligent AI assistant to navigate StarkNet data, answer your questions, and unlock actionable insights.",
            link: "/chat",
        },
        {
            title: "Voice Chat with StarkBuddy",
            description: "Experience hands-free interaction with our AI—speak your queries and receive spoken responses for a seamless, natural conversation.",
            link: "/voice-chat",
        },
        {
            title: "Sentiment Analysis",
            description: "Dive into token sentiment and market trends using our advanced analytics to uncover performance patterns and potential opportunities.",
            link: "/insights",
        },
        {
            title: "Transaction Details",
            description: "Access detailed information about transactions with just a hash, revealing the story behind every transfer on StarkNet.",
            link: "/transactions",
        },
        {
            title: "Trending Tokens",
            description: "Stay ahead of the curve by exploring the most popular tokens on StarkNet, complete with price, volume, and performance insights.",
            link: "/trending",
        }
    ];

    return (
        <section className="py-8 px-4 bg-black text-white">
            <div className="flex flex-wrap justify-center gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="w-full md:w-1/3 lg:w-1/4"
                    >
                        <Card {...feature} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
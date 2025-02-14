import React from "react";
import Card from "./Card";

const Features = () => {
    const features = [
        {
            title: "Chat with StarkBuddy",
            description: "Engage with our AI agent to explore StarkNet data, answer queries, and gain actionable insights.",
            link: "/chat",
        },
        {
            title: "Token Insights",
            description: "Analyze any token using its contract address to discover trends, performance, and statistics.",
            link: "/insights",
        },
        {
            title: "Transaction Details",
            description: "Retrieve comprehensive details of transactions using their hashes for deep analysis.",
            link: "/transactions",
        },
    ];

    return (
        <section className="py-8 px-4 bg-black text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <Card key={index} {...feature} />
                ))}
            </div>
        </section>
    );
};

export default Features;
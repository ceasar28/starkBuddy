import React, { useEffect, useState } from 'react';

const TrendingTokensTab = () => {
    const [trendingTokens, setTrendingTokens] = useState([]);

    useEffect(() => {
        fetchTrendingTokens();
    }, []);

    const fetchTrendingTokens = async () => {
        try {
            const response = await fetch(
                'https://api.geckoterminal.com/api/v2/networks/starknet-alpha/trending_pools?include=base_token&page=10'
            );
            const data = await response.json();

            const tokens = data.data.map((pool) => {
                const baseTokenId = pool.relationships.base_token.data.id;
                const baseTokenData = data.included.find((token) => token.id === baseTokenId);

                return {
                    name: pool.attributes.name,
                    logo:
                        (baseTokenData.attributes.image_url === "missing.png" ||
                            baseTokenData.attributes.image_url === null)
                            ? 'https://coin-images.coingecko.com/coins/images/26433/large/starknet.png?1696525507'
                            : baseTokenData.attributes.image_url,
                    price: parseFloat(pool.attributes.base_token_price_usd).toFixed(4),
                    volumeH1: parseFloat(pool.attributes.volume_usd.h1).toFixed(4)
                };
            });

            setTrendingTokens(tokens);
        } catch (error) {
            console.error('Error fetching tokens:', error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-sm md:text-4xl font-bold text-[#3fe8ab] mb-6 text-center">
                Trending Starknet Tokens
            </h1>
            <div className="p-3 pb-15">
                {/* Use a flex container with wrapping and center justification */}
                <div className="flex flex-wrap justify-center gap-6">
                    {trendingTokens.length ? (
                        trendingTokens.map((token, index) => (
                            <div
                                key={index}
                                // Set fixed widths via calc() so that on larger screens you get 4 columns,
                                // on medium screens 3 columns, on small screens 2 columns, etc.
                                className="border border-gray-700 p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:border-[#3fe8ab] cursor-pointer hover:opacity-80
                           w-full sm:w-[calc(50%-1.5rem)] md:w-[calc(33.33%-1.5rem)] lg:w-[calc(25%-1.5rem)]"
                            >
                                <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-full">
                                    <img
                                        src={token.logo}
                                        alt={token.name}
                                        className="w-16 h-16 object-cover rounded-full"
                                    />
                                </div>
                                <div className="flex flex-col items-center">
                                    <p className="font-bold text-xl truncate w-full text-center">{token.name}</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-bold text-sm">Price:</p>
                                        <p className="text-sm">${token.price}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-bold text-sm">Volume (1hr):</p>
                                        <p className="text-sm">${token.volumeH1}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-xl">Loading tokens...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrendingTokensTab;
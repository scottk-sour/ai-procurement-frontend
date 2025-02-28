export const useAIRecommendations = () => {
    const getAIRecommendations = async (quotes, userId) => {
      try {
        // Simulate AI recommendations (replace with actual API call to TENDORAI's backend AI)
        const response = await fetch(`http://localhost:5000/api/ai/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quotes, userId }),
        });
        if (!response.ok) throw new Error('Failed to fetch AI recommendations');
        const data = await response.json();
        return data.recommendations || quotes.map((vendor) => ({
          ...vendor,
          aiRecommendation: Math.random() > 0.5 ? "Highly Recommended for Your Needs" : "Good Match, Consider Reviewing",
        }));
      } catch (error) {
        console.error('❌ Error fetching AI recommendations:', error.message);
        return quotes.map((vendor) => ({
          ...vendor,
          aiRecommendation: "Standard Recommendation",
        }));
      }
    };
    return { getAIRecommendations };
  };
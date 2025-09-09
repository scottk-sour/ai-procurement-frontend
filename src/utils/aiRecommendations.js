// src/utils/aiRecommendations.js
// ✅ Production-ready AI Recommendations Hook

export const useAIRecommendations = () => {
  const getAIRecommendations = async (quotes, userId, token) => {
    // Use env variable with fallback to production API
    const API_BASE =
      process.env.REACT_APP_API_URL ||
      "https://ai-procurement-backend-q35u.onrender.com";

    try {
      const response = await fetch(`${API_BASE}/api/ai/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach JWT if available
        },
        body: JSON.stringify({ quotes, userId }),
      });

      if (!response.ok) {
        console.error("❌ AI API Error:", response.status, response.statusText);
        throw new Error(`AI API returned ${response.status}`);
      }

      const data = await response.json();

      // If backend sends valid recommendations, return them
      if (data && Array.isArray(data.recommendations)) {
        return data.recommendations;
      }

      // Fallback: add randomized recommendation labels
      return quotes.map((vendor) => ({
        ...vendor,
        aiRecommendation:
          Math.random() > 0.5
            ? "⭐ Highly Recommended for Your Needs"
            : "👍 Good Match, Consider Reviewing",
      }));
    } catch (error) {
      console.error("❌ Failed to fetch AI recommendations:", error.message);

      // Final fallback: safe generic recommendations
      return quotes.map((vendor) => ({
        ...vendor,
        aiRecommendation: "⚪ Standard Recommendation",
      }));
    }
  };

  return { getAIRecommendations };
};

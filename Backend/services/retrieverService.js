import axios from "axios";
import * as cheerio from "cheerio";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
};

const fallbackTravelTips = [
  "Check weather before traveling.",
  "Try local cuisine and street food.",
  "Carry cash for local transport.",
  "Visit major attractions early morning.",
  "Respect local culture and traditions."
];

export async function retrieveDestinationData(place) {
  if (!place?.trim()) {
    throw new Error("place is required");
  }

  const normalizedPlace = place.trim();

  const wikiSearch = await axios.get(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(normalizedPlace)}&format=json`,
    { headers }
  );

  const pageTitle = wikiSearch.data?.query?.search?.[0]?.title || normalizedPlace;

  const wiki = await axios.get(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
    { headers }
  );

  const description = wiki.data?.extract || `Travel information for ${normalizedPlace}`;

  const weather = await axios
    .get(`https://wttr.in/${encodeURIComponent(normalizedPlace)}?format=j1`, { headers })
    .then((res) => res.data?.current_condition?.[0] || null)
    .catch(() => null);

  const topPlaces = [
    `${normalizedPlace} Local Market`,
    `${normalizedPlace} View Point`,
    `${normalizedPlace} Old Town`,
    `${normalizedPlace} Nature Park`,
    `${normalizedPlace} Cultural Center`
  ];

  let travelArticles = [];
  try {
    const blogSearch = await axios.get(
      `https://www.bing.com/search?q=${encodeURIComponent(normalizedPlace + " travel guide")}`,
      { headers }
    );

    const $ = cheerio.load(blogSearch.data);
    $("li.b_algo h2 a").each((_, el) => {
      travelArticles.push({
        title: $(el).text(),
        link: $(el).attr("href")
      });
    });
  } catch {
    travelArticles = [];
  }

  const hotels = [
    { name: `Zostel ${normalizedPlace}`, price_per_night: "₹900 - ₹1200" },
    { name: `The Hosteller ${normalizedPlace}`, price_per_night: "₹1000 - ₹1500" },
    { name: `${normalizedPlace} Backpacker Hostel`, price_per_night: "₹700 - ₹1000" },
    { name: `${normalizedPlace} Grand Hotel`, price_per_night: "₹3000 - ₹4500" },
    { name: `${normalizedPlace} Residency`, price_per_night: "₹2000 - ₹3500" }
  ];

  return {
    destination: normalizedPlace,
    description,
    weather,
    top_places: topPlaces,
    hotels,
    travel_articles: travelArticles.slice(0, 5),
    travel_tips: fallbackTravelTips,
    budget_estimate: "₹1500 - ₹3500 per night"
  };
}

import axios from "axios";
import * as cheerio from "cheerio";

const headers = {
  "User-Agent":
    "Voyager-AI-Unlocked/1.0 (contact: local-dev)"
};

function toTitleCase(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function dedupeTitles(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const name = String(item || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

function estimatePriceBand(name, type) {
  const hay = `${name} ${type}`.toLowerCase();
  if (hay.includes("hostel") || hay.includes("dorm")) return "₹600 - ₹1800";
  if (hay.includes("resort") || hay.includes("spa") || hay.includes("luxury")) return "₹6000 - ₹15000";
  if (hay.includes("hotel") || hay.includes("inn")) return "₹2500 - ₹7000";
  return "₹1800 - ₹5000";
}

function buildWeatherAwareTips(weather) {
  const tips = [
    "Carry a reusable water bottle and stay hydrated.",
    "Start major attractions early to avoid crowds.",
    "Keep digital and offline copies of important bookings."
  ];

  const tempC = Number(weather?.temp_C);
  if (Number.isFinite(tempC)) {
    if (tempC >= 32) tips.push("Pack breathable clothes, sunscreen, and a cap for daytime heat.");
    if (tempC <= 12) tips.push("Carry warm layers for mornings and evenings.");
  }

  const rainMm = Number(weather?.precipMM);
  if (Number.isFinite(rainMm) && rainMm > 0) {
    tips.push("Keep a light rain jacket/umbrella due to expected precipitation.");
  }

  const wind = Number(weather?.windspeedKmph);
  if (Number.isFinite(wind) && wind >= 25) {
    tips.push("Plan buffer time for transit as stronger winds may affect travel.");
  }

  return dedupeTitles(tips).slice(0, 6);
}

async function fetchWikiContext(place) {
  const wikiSearch = await axios.get(
    "https://en.wikipedia.org/w/api.php",
    {
      headers,
      params: {
        action: "query",
        list: "search",
        srsearch: place,
        format: "json",
        origin: "*"
      }
    }
  );

  const first = wikiSearch.data?.query?.search?.[0] || {};
  const pageTitle = first.title || place;
  const pageId = first.pageid;

  const wikiSummary = await axios.get(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
    { headers }
  );

  const description = wikiSummary.data?.extract || `Travel information for ${place}`;

  return {
    pageTitle,
    pageId,
    description,
    coordinates: {
      lat: toNumber(wikiSummary.data?.coordinates?.lat),
      lon: toNumber(wikiSummary.data?.coordinates?.lon)
    },
    nearbyTitleHints: (wikiSearch.data?.query?.search || []).map((x) => x.title).slice(0, 10)
  };
}

async function fetchTopPlacesFromWiki({ lat, lon, pageTitle, nearbyTitleHints }) {
  let places = [...(nearbyTitleHints || [])];

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    try {
      const geo = await axios.get("https://en.wikipedia.org/w/api.php", {
        headers,
        params: {
          action: "query",
          list: "geosearch",
          gscoord: `${lat}|${lon}`,
          gsradius: 10000,
          gslimit: 30,
          format: "json",
          origin: "*"
        }
      });

      const geoTitles = (geo.data?.query?.geosearch || [])
        .map((x) => x.title)
        .filter(Boolean);

      places = [...geoTitles, ...places];
    } catch {
      // no-op fallback to search hints
    }
  }

  const cleaned = dedupeTitles(places)
    .filter((title) => title.toLowerCase() !== String(pageTitle || "").toLowerCase())
    .filter((title) => !/district|state|country|population|language/i.test(title))
    .slice(0, 8);

  return cleaned;
}

async function fetchHotelsFromOverpass({ lat, lon }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return [];
  }

  try {
    const overpassQuery = `
      [out:json][timeout:20];
      (
        node["tourism"~"hotel|hostel|guest_house"](around:12000,${lat},${lon});
        way["tourism"~"hotel|hostel|guest_house"](around:12000,${lat},${lon});
        relation["tourism"~"hotel|hostel|guest_house"](around:12000,${lat},${lon});
      );
      out tags center 25;
    `;

    const overpass = await axios.post(
      "https://overpass-api.de/api/interpreter",
      overpassQuery,
      {
        headers: {
          ...headers,
          "Content-Type": "text/plain"
        }
      }
    );

    const elements = overpass.data?.elements || [];
    const mapped = elements
      .map((el) => {
        const tags = el.tags || {};
        const name = tags.name || "";
        const type = tags.tourism || "stay";
        if (!name) return null;
        return {
          name,
          type,
          price_per_night: estimatePriceBand(name, type)
        };
      })
      .filter(Boolean);

    const unique = [];
    const seen = new Set();
    for (const item of mapped) {
      const key = item.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push({ name: item.name, price_per_night: item.price_per_night });
      if (unique.length >= 8) break;
    }

    return unique;
  } catch {
    return [];
  }
}

async function fetchTravelArticles(place) {
  try {
    const blogSearch = await axios.get(
      `https://www.bing.com/search?q=${encodeURIComponent(place + " travel guide")}`,
      { headers }
    );

    const $ = cheerio.load(blogSearch.data);
    const articles = [];

    $("li.b_algo h2 a").each((_, el) => {
      articles.push({
        title: $(el).text(),
        link: $(el).attr("href")
      });
    });

    return articles.slice(0, 5);
  } catch {
    return [];
  }
}

export async function retrieveDestinationData(place) {
  if (!place?.trim()) {
    throw new Error("place is required");
  }

  const normalizedPlace = toTitleCase(place);
  let wiki = {
    pageTitle: normalizedPlace,
    pageId: null,
    description: `Travel information for ${normalizedPlace}`,
    coordinates: { lat: null, lon: null },
    nearbyTitleHints: []
  };

  try {
    wiki = await fetchWikiContext(normalizedPlace);
  } catch {
    wiki = {
      pageTitle: normalizedPlace,
      pageId: null,
      description: `Travel information for ${normalizedPlace}`,
      coordinates: { lat: null, lon: null },
      nearbyTitleHints: []
    };
  }

  const weather = await axios
    .get(`https://wttr.in/${encodeURIComponent(normalizedPlace)}?format=j1`, { headers })
    .then((res) => res.data?.current_condition?.[0] || null)
    .catch(() => null);

  const [topPlaces, hotels, travelArticles] = await Promise.all([
    fetchTopPlacesFromWiki(wiki),
    fetchHotelsFromOverpass({
      lat: wiki.coordinates.lat,
      lon: wiki.coordinates.lon
    }),
    fetchTravelArticles(normalizedPlace)
  ]);

  const travelTips = buildWeatherAwareTips(weather);

  let budgetEstimate = "Not enough data";
  if (hotels.length > 0) {
    const hasHostel = hotels.some((h) => /hostel/i.test(h.name));
    budgetEstimate = hasHostel ? "₹1200 - ₹4000 per night" : "₹2500 - ₹8000 per night";
  }

  return {
    destination: normalizedPlace,
    description: wiki.description,
    weather,
    top_places: topPlaces,
    hotels,
    travel_articles: travelArticles,
    travel_tips: travelTips,
    budget_estimate: budgetEstimate
  };
}

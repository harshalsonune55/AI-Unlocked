import axios from "axios";

const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";

function normalizeImage(item, fallbackQuery) {
  return {
    title: item?.title || fallbackQuery,
    image_url: item?.imageinfo?.[0]?.url || null,
    thumbnail_url: item?.imageinfo?.[0]?.thumburl || null,
    source: "wikimedia",
    attribution: item?.imageinfo?.[0]?.extmetadata?.Artist?.value || "Wikimedia Commons"
  };
}

export async function getPlaceImages(query, limit = 5) {
  if (!query?.trim()) return [];

  const params = {
    action: "query",
    format: "json",
    prop: "imageinfo",
    generator: "search",
    gsrsearch: `${query} travel landscape`,
    gsrlimit: limit,
    iiprop: "url|extmetadata",
    iiurlwidth: 1200,
    origin: "*"
  };

  try {
    const res = await axios.get(WIKIPEDIA_API, { params });
    const pages = Object.values(res.data?.query?.pages || {});
    return pages
      .filter((p) => p?.imageinfo?.[0]?.url)
      .map((p) => normalizeImage(p, query))
      .slice(0, limit);
  } catch {
    return [];
  }
}

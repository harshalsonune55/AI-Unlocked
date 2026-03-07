import { createClient } from "pexels";


const client = createClient("kU9YmYHLVeQfW3PYVdtwOPGe6C5oCkRl4kcjHzWT5gnzEtiokbbzvB0L");

export async function getImages(query, limit = 5) {

  if (!query) return [];

  try {

    const res = await client.photos.search({
      query,
      per_page: limit
    });

    const photos = res.photos || [];

    return photos.map((p) => ({
      id: p.id,
      title: p.alt || query,
      image_url: p.src.large,
      thumbnail_url: p.src.medium,
      photographer: p.photographer,
      photographer_url: p.photographer_url,
      source: "pexels"
    }));

  } catch (err) {

    console.error("Pexels API error:", err.message);
    return [];

  }

}
import axios from "axios";

const HOTEL_API = "YOUR_HOTEL_API_ENDPOINT"; // replace with your API URL

export async function getHotels(city) {

  if (!city) return [];

  try {

    const response = await axios.get(HOTEL_API, {
      params: {
        city: city
      }
    });

    const hotels = response.data || [];

    const parsedHotels = hotels.map((item) => {

      const hotelInfo = item[0];
      const vendors = item[1] || [];

      let lowestPrice = null;
      let bestVendor = null;

      vendors.forEach((v) => {

        const prices = [
          { price: v.price1, tax: v.tax1, vendor: v.vendor1 },
          { price: v.price2, tax: v.tax2, vendor: v.vendor2 },
          { price: v.price3, tax: v.tax3, vendor: v.vendor3 },
          { price: v.price4, tax: v.tax4, vendor: v.vendor4 }
        ];

        prices.forEach((p) => {

          if (!p.price) return;

          const total = Number(p.price) + Number(p.tax || 0);

          if (lowestPrice === null || total < lowestPrice) {
            lowestPrice = total;
            bestVendor = p.vendor;
          }

        });

      });

      return {
        name: hotelInfo.hotelName,
        hotel_id: hotelInfo.hotelId,
        price_per_night: lowestPrice ? `$${lowestPrice}` : "N/A",
        best_vendor: bestVendor
      };

    });

    return parsedHotels;

  } catch (err) {

    console.error("Hotel API error:", err.message);
    return [];

  }

}
const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

// request body sample
// {
//   seller_id: '1WFwSVuXZdkRrSbyfB4weg==',
//   product_id: 'maqOthJ_-zxM5E2mgki3cw==',
//   product_name: 'goldplan',
//   permalink: 'ldcxm',
//   product_permalink: 'https://adminreviewreels.gumroad.com/l/ldcxm',
//   short_product_id: 'ldcxm',
//   email: 'hari@reviewreels.app',
//   price: '2400',
//   gumroad_fee: '246',
//   currency: 'usd',
//   quantity: '1',
//   discover_fee_charged: 'false',
//   can_contact: 'true',
//   referrer: 'http://localhost:3001/',
//   card: { bin: '', expiry_month: '', expiry_year: '', type: '', visual: '' },
//   order_number: '271259319',
//   sale_id: 'I5XMoCvaaKzLbU1RwEV7tw==',
//   sale_timestamp: '2022-08-03T13:14:17Z',
//   purchaser_id: '8832167340190',
//   subscription_id: 'qZfhyyWbi8o7X9-6146b0A==',
//   url_params: { source_url: 'http%3A%2F%2Flocalhost%3A3001%2Fpricing' },
//   variants: { Tier: 'Untitled' },
//   test: 'true',
//   ip_country: 'India',
//   recurrence: 'monthly',
//   is_gift_receiver_purchase: 'false',
//   refunded: 'false',
//   resource_name: 'sale',
//   disputed: 'false',
//   dispute_won: 'false'
// }

router.post("/subscribe", async (req, res) => {
  try {
    console.log(req.body, req.params, req.query);
    // const {
    //   seller_id,
    //   product_id,
    //   product_name,
    //   permalink,
    //   product_permalink,
    //   short_product_id,
    //   email,
    //   price,
    //   gumroad_fee,
    //   currency,
    //   quantity,
    //   discover_fee_charged,
    //   can_contact,
    //   referrer,
    //   card,
    //   order_number,
    //   sale_id,
    //   sale_timestamp,
    //   purchaser_id,
    //   subscription_id,
    //   url_params,
    //   variants,
    //   test,
    //   ip_country,
    //   recurrence,
    //   is_gift_receiver_purchase,
    //   refunded,
    //   resource_name,
    //   disputed,
    //   dispute_won,
    // } = req.body;

    const subscriptionData = req.body;
    await prisma.subscription.create({ data: subscriptionData });

    res.sendStatus(200);
  } catch (err) {
    console.log("subcription webhook error", err);
    res.status(400).json(err);
  }
});

module.exports = router;

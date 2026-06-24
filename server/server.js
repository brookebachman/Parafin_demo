import "dotenv/config";
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PARAFIN_API = "https://api.parafin.com/v1";
const CLIENT_ID = process.env.PARAFIN_CLIENT_ID;
const CLIENT_SECRET = process.env.PARAFIN_CLIENT_SECRET;

app.get("/api/parafin/token/:personId", async (req, res) => {
  try {
    const { personId } = req.params;
    const response = await axios.post(
      `${PARAFIN_API}/auth/redeem_token`,
      { person_id: personId },
      {
        auth: {
          username: CLIENT_ID,
          password: CLIENT_SECRET,
        },
      },
    );
    res.json({ token: response.data.bearer_token });
  } catch (err) {
    console.error("Token error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data || "Failed to redeem token",
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//State 1 - No offers: Creates a business and person, no offer generated.

app.post("/api/state/no-offers", async (req, res) => {
  try {
    const business = await parafin("post", "/businesses", {
      legal_name: "GrubDash No Offers Restaurant LLC",
    });

    const person = await parafin("post", "/persons", {
      first_name: "Maria",
      last_name: "NoOffers",
      contact_email: "maria@grubdash.com",
      linked_businesses: [
        {
          business_id: business.id,
          relationship: {
            is_beneficial_owner: true,
            is_representative: true,
          },
        },
      ],
    });

    res.json({
      state: "no-offers",
      personId: person.id,
      businessId: business.id,
    });
  } catch (err) {
    console.error("No offers error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

//State 2 - Pre-approved offer: Creates business, person, bank account, and a flex loan offer all in onecall.

app.post("/api/state/pre-approved", async (req, res) => {
  try {
    const data = await parafin(
      "post",
      "/sandbox/generate_event/capital_product_offer/created",
      {
        offer: {
          product_type: "flex_loan",
          max_offer_amount: 50000,
        },
        person: {
          first_name: "Tony",
          last_name: "Rigatoni",
          contact_email: "tony@grubdash.com",
          contact_phone: "4155551234",
        },
        business: {
          legal_name: "Tonys Trattoria LLC",
          dba_name: "Tonys Trattoria",
        },
        bank_account: {
          routing_number: "021000021",
          account_number: { last4: "6789" },
          currency: "USD",
        },
      },
    );

    res.json({
      state: "pre-approved",
      personId: data.person.id,
      businessId: data.business.id,
      offerId: data.capital_product_offer.id,
    });
  } catch (err) {
    console.error("Pre-approved error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// State 3 - Capital on its way: Funds the capital product after you accept the offer in the widget. Takes a businessId in the request body.

app.post("/api/state/fund", async (req, res) => {
  try {
    const { businessId } = req.body;
    const data = await parafin("post", "/sandbox/capital_product/fund", {
      business_id: businessId,
    });

    res.json({
      state: "capital-on-its-way",
      ...data,
    });
  } catch (err) {
    console.error("Fund error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

//State 4 - Outstanding balance: Looks up the capital product for the business, then creates a payment against it.

app.post("/api/state/payment", async (req, res) => {
  try {
    const { businessId } = req.body;

    const products = await parafin(
      "get",
      `/capital_products?business_id=${businessId}`,
    );

    if (!products.results || products.results.length === 0) {
      return res.status(400).json({ error: "No capital product found" });
    }

    const capitalProductId = products.results[0].id;

    const payment = await parafin("post", "/capital_product_payments", {
      capital_product_id: capitalProductId,
      amount: 500,
      type: "automatic",
    });

    res.json({
      state: "outstanding-balance",
      capitalProductId,
      payment,
    });
  } catch (err) {
    console.error("Payment error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

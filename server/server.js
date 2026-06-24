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

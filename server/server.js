import 'dotenv/config'
import express from 'express'
import axios from 'axios'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const PARAFIN_API = 'https://api.parafin.com/v1'
const CLIENT_ID = process.env.PARAFIN_CLIENT_ID
const CLIENT_SECRET = process.env.PARAFIN_CLIENT_SECRET

// Redeem a bearer token for the widget
app.get('/api/parafin/token/:personId', async (req, res) => {
  try {
    const { personId } = req.params
    const response = await axios.post(
      `${PARAFIN_API}/auth/redeem_token`,
      { person_id: personId },
      {
        auth: {
          username: CLIENT_ID,
          password: CLIENT_SECRET,
        },
      }
    )
    res.json({ token: response.data.bearer_token })
  } catch (err) {
    console.error('Token error:', err.response?.data || err.message)
    res.status(err.response?.status || 500).json({
      error: err.response?.data || 'Failed to redeem token',
    })
  }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

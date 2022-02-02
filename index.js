const express = require('express')
const companyRoutes = require('./routes/companyRoutes')

const app = express()
const PORT = 3001

app.use(companyRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
const express = require('express')
const companyRoutes = require('./routes/companyRoutes')
const middleware = require('./utils/middlewares')

const app = express()
const PORT = 3001

app.use(companyRoutes)

app.use(middleware.errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
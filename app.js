const express = require('express')
const app = express()
const companyRoutes = require('./routes/companyRoutes')
const middleware = require('./utils/middlewares')

app.use(companyRoutes)
app.use(middleware.errorHandler)

module.exports = app
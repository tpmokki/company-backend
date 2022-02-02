const express = require('express')
const router = express.Router()

const controller = require('../controllers/companyController')

router.route('/api/company/:businessId')
  .get(controller.getByBusinessId)

module.exports = router
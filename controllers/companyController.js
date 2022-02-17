const axios = require('axios')
const db = require('../db/companyDb')
const helper = require('../utils/helpers')
const baseUrl = 'http://avoindata.prh.fi/bis/v1' 

const getByBusinessId = async (req, res, next) => {
  let businessId = req.params.businessId
  let url = `${baseUrl}/${businessId}`
  
  if (!helper.validateBusinessId(businessId)) {
    return res.status(400).json({
      error: 'Invalid path parameter businessId'
    })
  }
    
  try {
    await db.initializeDatabase()
    const response = await axios.get(url)
    let rawData = response.data.results
    let sourceData = {}

    if (rawData.length > 0) {
      sourceData = helper.companyObjectFromRawData(rawData[0])
    } else {
      res.status(404).json({ error: 'Not Found' })
    }
    
    let { street, postCode, city } = sourceData.address
    let { business_id, name, phone, website } = sourceData.company
    let existsCompany = await db.existsCompany(businessId)
    
    if (!existsCompany) {
      let addressId = await db.addAddress(street, postCode, city)
      await db.addCompanyDetails(business_id, name, addressId, phone, website)
    }

    let companyFromDb = await db.fetchCompanyByBusinessId(businessId)
    let addressDiff = helper.getDifferenceObject(sourceData.address, companyFromDb.address)
    
    if (addressDiff) {
      await db.updateAddress(addressDiff, companyFromDb.address.id)
    }

    let companyDiff = helper.getDifferenceObject(sourceData.company, companyFromDb)

    if (companyDiff) {
      await db.updateCompany(companyDiff, businessId)
    }

    companyFromDb = await db.fetchCompanyByBusinessId(businessId)

    let responseData = {
      ...companyFromDb, 
      address: helper.addressStringFromObject(companyFromDb.address)
    }

    res.status(200).json(responseData)
  } catch (err) {
    next(err)
  }
}

module.exports = { getByBusinessId }
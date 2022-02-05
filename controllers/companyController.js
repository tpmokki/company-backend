const axios = require('axios')
const db = require('../db/companyDb')
const baseUrl = 'http://avoindata.prh.fi/bis/v1' 

const getByBusinessId = async (req, res) => {
  let businessId = req.params.businessId
  let url = `${baseUrl}/${businessId}`

  try {
    await db.initializeDatabase()
    const response = await axios.get(url)
    let rawData = response.data.results
    let companyData = {}

    if (rawData.length > 0) {
      companyData = companyObjectFromRawData(rawData[0])
    } else {
      res.status(404).json({ error: 'Not Found' })
    }
    
    let { street, postCode, city } = companyData.address
    let { business_id, name, phone, website } = companyData
    let existsCompany = await db.existsCompany(businessId)
    
    if (!existsCompany) {
      let addressId = await db.addAddress(street, postCode, city)
      await db.addCompanyDetails(business_id, name, addressId, phone, website)
    }

    let companyFromDb = await db.fetchCompanyByBusinessId(businessId)
    let responseData = {...companyFromDb, address: addressStringFromObject(companyFromDb.address)}

    res.status(200).json(responseData)
  } catch (err) {
    console.log("error", err)
    let errorStatus = err.response.status
    let errorText = err.response.statusText
    
    res.status(errorStatus).json({ error: errorText })
  }
}

const companyObjectFromRawData = (data) => {
  let business_id = data.businessId
  let name = data.name
  let address = data.addresses
    .filter(a => !a.endDate && a.type === 2) // type 2 is for postal address
    .map(a => {
      return {
        street: a.street,
        postCode: a.postCode,
        city: a.city.charAt(0) + a.city.slice(1).toLowerCase()
      }
    })[0]
  let phone = data.contactDetails.find(c => !c.endDate && c.type === 'Mobile phone').value
  let website = data.contactDetails.find(c => !c.endDate && c.type === 'Website address').value
  
  return {
    business_id,
    name,
    address,
    phone,
    website
  }
}

const addressStringFromObject = (addressObj) => {
  let street = addressObj.street
  let postCode = addressObj.postCode
  let city = addressObj.city
  city = addressObj.city.charAt(0) + addressObj.city.slice(1).toLowerCase()

  return `${street}, ${postCode} ${city}`
}

module.exports = { getByBusinessId }
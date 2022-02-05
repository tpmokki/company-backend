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
    let sourceData = {}

    if (rawData.length > 0) {
      sourceData = companyObjectFromRawData(rawData[0])
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
    let addressDiff = getDifferenceObject(sourceData.address, companyFromDb.address)
    
    if (addressDiff) {
      await db.updateAddress(addressDiff, companyFromDb.address.id)
    }

    let companyDiff = getDifferenceObject(sourceData.company, companyFromDb)

    if (companyDiff) {
      await db.updateCompany(companyDiff, businessId)
    }

    companyFromDb = await db.fetchCompanyByBusinessId(businessId)

    let responseData = {
      ...companyFromDb, 
      address: addressStringFromObject(companyFromDb.address)
    }

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
    company: {
      business_id,
      name,
      phone,
      website
    },
    address
  }
}

const addressStringFromObject = (addressObj) => {
  let street = addressObj.street
  let postCode = addressObj.postCode
  let city = addressObj.city
  city = addressObj.city.charAt(0) + addressObj.city.slice(1).toLowerCase()

  return `${street}, ${postCode} ${city}`
}

// Helper for updating local copy of information if source data has changed
// Returns new object having only fields whose value differs and that value of new
// Object will be from objA. Keys of the abjA and objB must be similar.
const getDifferenceObject = (objA, objB) => {
  let diff = {}

  for (const prop in objA) {
    if (objA[prop] !== objB[prop]) {
      diff[prop] = objA[prop]
    }
  }

  return diff
}

module.exports = { getByBusinessId }
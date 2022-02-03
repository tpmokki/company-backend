const axios = require('axios')
const baseUrl = 'http://avoindata.prh.fi/bis/v1' 

const getByBusinessId = async (req, res) => {
  let url = `${baseUrl}/${req.params.businessId}`

  try {
    const response = await axios.get(url)
    let rawData = response.data.results
    let companyData = {}

    if (rawData.length > 0) {
      companyData = companyObjectFromRawData(rawData[0])
    } else {
      res.status(404).json({ error: 'Not Found' })
    }
    
    res.status(200).json(companyData);
  } catch (err) {
    let errorStatus = err.response.status
    let errorText = err.response.statusText

    res.status(errorStatus).json({ error: errorText })
  }
}

const companyObjectFromRawData = (data) => {
  let business_id = data.businessId
  let name = data.name
  let addressObject = data.addresses.find(a => !a.endDate && a.type === 2)// 'type': '2' means postal address
  let address = addressStringFromObject(addressObject)
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
  let postCode = addressObj.postCode || ''
  let city = addressObj.city
  city = addressObj.city.charAt(0) + addressObj.city.slice(1).toLowerCase()

  return `${street}, ${postCode} ${city}`
}

module.exports = { getByBusinessId }
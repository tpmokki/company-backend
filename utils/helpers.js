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

// Helper used for updating local copy of information if source data has changed
// Returns new object having only fields whose value differs and that value of new
// object will be from objA. Keys of the objA and objB must be similar.
const getDifferenceObject = (objA, objB) => {
  let diff = {}

  for (const prop in objA) {
    if (objA[prop] !== objB[prop]) {
      diff[prop] = objA[prop]
    }
  }

  return diff
}

module.exports = {
  companyObjectFromRawData,
  addressStringFromObject,
  getDifferenceObject
}
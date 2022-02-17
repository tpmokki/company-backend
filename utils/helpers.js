const companyObjectFromRawData = (data) => {
  let business_id = data.businessId || ''
  let name = data.name || ''
  let address = data.addresses
    .filter(a => !a.endDate && a.type === 2) // type 2 is for postal address
    .map(a => {
      return {
        street: a.street || '',
        postCode: a.postCode || '',
        city: a.city ? a.city.charAt(0) + a.city.slice(1).toLowerCase() : ''
      }
    })[0] 
    
  let phoneArr = data.contactDetails.filter(c => {
    if (c.endDate) return false
    if (c.type === 'Mobile phone' && c.value) {
      return true
    } else if (c.type === 'Telephone' && c.value) {
      return true
    }
  })

  let phone = phoneArr.length ? phoneArr[0].value : ''
  let website = data.contactDetails
    .find(c => !c.endDate && c.type === 'Website address').value || ''

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

const validateBusinessId = (businessId) => {
  if (!businessId) return false
  if (businessId.length !== 9) return false 

  let numbers = [...businessId.substring(0,7)]
  if (!numbers.every(c => '0123456789'.includes(c))) return false
  if (businessId[7] !== '-') return false

  const multipliers = [7, 9, 10, 5, 8, 4, 2]
  let checkSum = 0
  let checkMark = ''

  for (i = 0; i < multipliers.length; i++) {
      checkSum += multipliers[i] * numbers[i]
  }

  let remainder = checkSum % 11

  if (remainder == 1) {
      return false // businessId not in use if remainder is 1
  } else if (remainder > 1 ) {
      checkMark = 11 - remainder
  } else {
      checkMark = remainder
  }

  return Number(businessId[8]) === checkMark
}

module.exports = {
  companyObjectFromRawData,
  addressStringFromObject,
  getDifferenceObject,
  validateBusinessId
}
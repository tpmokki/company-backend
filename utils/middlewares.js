const errorHandler = (error, request, response, next) => {
  console.log("error", error)  
  if (error.name === 'sql') {
    return response
      .status(500)
      .send({ error: error.message })
  } else if (error.response.status) {
    return response
      .status(error.response.status)
      .send({ 
        error: error.message, 
        statusText: error.response.statusText 
      })
  }
    
  next(error)
}

module.exports = { errorHandler }
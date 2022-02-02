const axios = require('axios')
const baseUrl = 'http://avoindata.prh.fi/bis/v1' 

const getByBusinessId = async (req, res) => {
  let url = `${baseUrl}/${req.params.businessId}`

  try {
    const response = await axios.get(url)
    let rawData = response.data.results

    res.status(200).json(rawData);
  } catch (err) {
    let errorStatus = err.response.status
    let errorText = err.response.statusText

    res.status(errorStatus).json({ error: errorText });
  }
}

module.exports = { getByBusinessId }
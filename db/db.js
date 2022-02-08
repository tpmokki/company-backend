const sqlite3 = require('sqlite3')
const config = require('../utils/config')

const db = new sqlite3.Database(config.dbFilePath, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the company database.')
})

module.exports = db
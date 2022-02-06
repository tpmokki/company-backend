const PORT = 8000
const dbFilePath = process.env.NODE_ENV === 'test'
  ? './companyTEST_DB.db'
  : './companyDB.db'

module.exports = {
  PORT, 
  dbFilePath
}
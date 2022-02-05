const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('./companyDB.db')

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    const first_sql = `CREATE TABLE IF NOT EXISTS address (
      address_id INTEGER PRIMARY KEY,
      street TEXT NOT NULL,
      postCode TEXT NOT NULL,
      city TEXT NOT NULL,
      lastModified INTEGER NOT NULL)`

    const second_sql = `CREATE TABLE IF NOT EXISTS company (
      business_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address_id TEXT NOT NULL,
      phone TEXT NOT NULL,
      website TEXT NOT NULL,
      lastModified INTEGER NOT NULL,
      FOREIGN KEY (address_id) 
      REFERENCES address (address_id) ON DELETE CASCADE)`

    db.serialize(() => {
      db.run(first_sql)
        .run(second_sql, err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
    })
  })
}

const fetchCompanyByBusinessId = (businessId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT c.business_id, c.name, c.phone, c.website, 
    c.lastModified, a.street, a.postCode, a.city FROM company c JOIN address a
    ON c.address_id = a.address_id WHERE c.business_id = ?`
    const params = [businessId]

    db.get(sql, params, (err, res) => {
      if (err) {
        reject(err)
      } else {
        const result = !res ? null : {
          business_id: res.business_id,
          name: res.name,
          address: { 
            street: res.street, 
            postCode: res.postCode, 
            city: res.city 
          },
          phone: res.phone,
          website: res.website,
        }
        resolve(result)
      }
    })
  })
}

const addAddress = (street, postCode, city) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO address 
    (street, postCode, city, lastModified) VALUES (?, ?, ?, ?)`)
    const lastModified = Date.now()
    const params = [street, postCode, city, lastModified]

    stmt.run(params, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(stmt.lastID)
      }
    })
  })
}

const addCompanyDetails = (business_id, name, address_id, phone, website) => {
  return new Promise((resolve, reject) => {
    let stmt = db.prepare(`INSERT INTO company VALUES (?, ?, ?, ?, ?, ?)`)
    const lastModified = Date.now()
    const params = [business_id, name, address_id, phone, website, lastModified]

    stmt.run(params, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(stmt.lastID)
      }
    })
  })
}

const existsCompany = (businessId) => {
  return fetchCompanyByBusinessId(businessId)
    .then(result => result !== null)
}

module.exports = { 
  initializeDatabase, fetchCompanyByBusinessId, 
  addCompanyDetails, addAddress, existsCompany 
}
const nock = require('nock')
const supertest = require('supertest')
const app = require('../app')
const db = require('../db/companyDb')

const dbConn = db.getDbConnection()
const api = supertest(app)
const softagramId = '2532004-3'
const baseUrl = `/api/company/${softagramId}`
const mockedSoftagramResponse = require('./mocks/mockedSoftagramResponse')

const clearDatabase = () => {
  return new Promise((resolve, reject) => {
    dbConn.serialize(() => {
      dbConn.run(`DELETE FROM address`)
        .run(`DELETE FROM company`, err => {
          if (err) {
            reject({ type: 'sql', error: err })
          } else {
            resolve()
          }
        })
    })
  })
}

beforeEach(() => {
  nock('http://avoindata.prh.fi/bis/v1')
    .get('/2532004-3')
    .reply(200, mockedSoftagramResponse)
})

afterAll(() => {
  nock.cleanAll()
})

describe('testing from perspective of api endpoint', () => {
  test('company details are returned as json', async () => {
    await api
      .get(baseUrl)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('fails with statuscode 400 with invalid businessId', async () => {
    await api
      .get('/api/company/2532004-5')
      .expect(400)

    await api
      .get('/api/company/2532gf4-5')
      .expect(400)

    await api
      .get('/api/company/254-3')
      .expect(400)
  })

  test('fails with statuscode 404 with wrong url', async () => {
    await api
      .get('/api/wrongurl')
      .expect(404)
  })

  test('returned object has correct property keys', async () => {
    const desiredKeys = ['business_id', 'name', 'address', 'phone', 'website']
    const response = await api.get(baseUrl)

    expect(Object.keys(response.body)).toEqual(desiredKeys)
  })

  test('right company details are returned as desired object', async () => {
    const desiredCompany = {
      business_id: softagramId,
      name: 'Softagram Oy',
      address: 'Uutelantie 14, 90450 Kempele',
      phone: '+358504836173',
      website: 'https://softagram.com'
    }

    const response = await api.get(baseUrl)

    expect(response.body).toEqual(desiredCompany)
  })
})

describe('testing from perspective of database operation', () => {
  const desiredAddress = {
    id: '1', // We can trust that SQLite adds row_id 1 (which is also PK of address) for first row
    street: 'Uutelantie 14',
    postCode: '90450',
    city: 'Kempele'
  }

  const desiredDetails = {
    business_id: softagramId,
    name: 'Softagram Oy',
    address: desiredAddress,
    phone: '+358504836173',
    website: 'https://softagram.com'
  }

  test('data is added to database if not exists', async () => {
    await clearDatabase()
    await api.get(baseUrl)
    const fromDb = await db.fetchCompanyByBusinessId(softagramId)

    expect(fromDb).toEqual(desiredDetails)
  })

  test('local copy is updated if requested source data differs', async () => {
    // first update the local data to make sure it is different from the source
    const newAddress = {
      street: 'Kettutie 2',
      postCode: '000972',
      city: 'Koiram??ki'
    }

    const newDetails = {
      name: 'SoftSoftSoft',
      phone: '555555555555',
      website: 'www'
    }

    await db.updateAddress(newAddress, 1)
    await db.updateCompany(newDetails, softagramId)
    const lastModifiedAtFirst = await db.getLastModified(softagramId)

    // for test that lastmodified property will be updated too
    await new Promise(resolve => setTimeout(resolve, 500))
    await api.get(baseUrl)
    
    const lastModifiedAfter = await db.getLastModified(softagramId)
    const fromDb = await db.fetchCompanyByBusinessId(softagramId)
    
    expect(lastModifiedAfter).toBeGreaterThan(lastModifiedAtFirst)
    expect(fromDb).toEqual(desiredDetails)
  })
})
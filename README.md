# company-backend

##  Running the app

### - npm install

#### - npm start -> runs app in production mode
#### - npm run dev -> runs app in development mode

App should now be running on localhost:8000

HTTP GET request to http://localhost:8000/api/company/2532004-3
will give you the response below.

```json
{
  "business_id":"2532004-3",
  "name":"Softagram Oy",
  "address":"Uutelantie 14, 90450 Kempele",
  "phone":"+358504836173",
  "website":"https://softagram.com"
}
```
#### - docker run tpmokki/company -> runs docker image
#### - docker run -p 8000:8000 tpmokki/company -> launch container to port 8000 on the host 
 -> so HTTP GET request to http://localhost:8000/api/company/2532004-3 should still work

## Running the tests

#### - npm run test -> runs unit tests located in tests directory

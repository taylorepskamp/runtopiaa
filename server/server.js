import bodyParser from 'body-parser'
import express from 'express'
import path from 'path'
const app = express()
const Datastore = require('nedb')

const db = new Datastore({filename:'./database.db', autoload: true});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))


const router = express.Router()

const staticFiles = express.static(path.join(__dirname, '../../client/build'))
app.use(staticFiles)

router.get('/chartData', (req, res) => {

  db.find({},(err,data) => {
    if (err){
        response.end();
        return
    }
    //console.log(cities)
    res.json(data)
    }) 
})

router.post('/fitData', (request, response) => {
  const fitData = request.body
  fitData.map(week => 
      {
      console.log("logging week",week.weekYear)
          db.update({'weekYear' : week.weekYear}, week, {upsert: true, multi: true}, function (){});
  })
  response.json({status: "this is the backend saying, got the lastest fitbit Data!"})
})

app.use(router)

// any routes not picked up by the server api will be handled by the react router
app.use('/*', staticFiles)

app.set('port', (process.env.PORT || 3001))
app.listen(app.get('port'), () => {
  console.log(`Listening on ${app.get('port')}`)
})

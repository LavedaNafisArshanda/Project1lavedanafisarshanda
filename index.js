const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')

const app = express()

const secretKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

const db = mysql.createConnection({
  host:'127.0.0.1',
  port:'3306',
  user:'root',
  password:'',
  database:"coronatimes"
})

db.connect((err) => {
  if (err){
    throw err
  }else{
    console.log("Database connected")
  }

})

const isAuthorized = (request, result, next)=> {
  if(typeof(request.headers['x-api-key']) == 'undefined'){
    return result.status(403).json({
      success: false,
      message: 'Unauthorized. Token is not provided'
    })
  }

  let token = request.headers['x-api-key']

  jwt.verify(token, secretKey, (err, decoded)=>{
    if (err) {
      return result.status(401),json({
        success: false,
        message:'Unauthorized. Alhamdulillah Token is invalid'
      })
    }
  })

  next()
}


app.get('/',(request,result) =>{
  result.json({
    success: true,
    message: 'Welcome'
  })
})

app.post('/login',(request,result)=>{
  let data = request.body

  if(data.username == 'admin' && data.password == 'admin'){
    let token = jwt.sign(data.username + '|' + data.password, secretKey)

    result.json({
      success: true,
      message:'Login succes, Welcome back!',
      token: token
    })
  }

  result.json({
    success: false,
    message: 'Kamu bukan orangnya yaa?!'
  })
})

app.get('/barang', isAuthorized, (req, res) => {
  let sql = `
  select * from barang
  `

  db.query(sql,(err, result) => {
    if(err) throw  err

    res.json({
      success: true,
      message: 'Success retrive data from database',
      data: result
    })
  })
})

app.post('/barang', isAuthorized, (request, result) => {
  let data = request.body

  let sql = `
      insert into barang(id_barang, nama_barang, merk, stok)
      values ('`+data.id_barang+`', '`+data.nama_barang+`', '`+data.merk+`', '`+data.stok+`');
  `

  db.query(sql, (err, result) => {
    if (err) throw err
  })

  result.json({
    success: true,
    message: 'Barang kamu sudah ready:)'
  })
})

app.put('/barang/:id', isAuthorized, (request, result) => {
  let data = request.body

  let sql = `
      update barang
      set id_barang = '`+data.id_barang+`', nama_barang = '`+data.nama_barang+`', merk = '`+data.merk+`', stok = '`+data.stok+`'
      where id_barang = `+request.params.id+`
      `

  db.query(sql, (err, result) => {
    if (err) throw err
  })

  result.json({
    success: true,
    message: 'Data has been updated'
  })
})

app.delete('/barang/:id', isAuthorized, (request, result) => {
  let sql = `
      delete from barang where id_barang = `+request.params.id+`
  `

  db.query(sql, (err, res) => {
    if(err) throw err
  })

  result.json({
    success: true,
    message: 'Data has been deleted'
  })
})

app.listen(3000, ()=>{
  console.log('App is running on port 3000')
})
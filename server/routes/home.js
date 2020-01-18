const express = require('express')

const homeRoutes = express.Router()

homeRoutes.post('/trending', (req, res, next) => {
  let quantity = req.body.quantity

  global.db.Document.find({ isEntry: true }, ['_id', 'title', 'subtitle', 'views', 'author', 'createdAt', 'updatedAt'], {
    limit: quantity,
    sort: {
      views: -1
    }
  }).then(documents => {
    return res.status(200).send(documents)
  }).catch(error => {
    console.log(error)
    return res.status(500).send({
      msg: 'An Error occured while loading trendings'
    })
  })
})

module.exports = homeRoutes

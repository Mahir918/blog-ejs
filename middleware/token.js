const jwt = require('jsonwebtoken');

function login(req,res,next){
  var token = localStorage.getItem('token')
    try {
        var decoded = jwt.verify(token, 'loginToken');
      } catch(err) {
        res.redirect('/sayem/admin/login')
      }
      next()
}

module.exports = login
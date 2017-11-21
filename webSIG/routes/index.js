var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WebSIG' });
});

module.exports = router;

/*On renvoit à index donc si index.html existe à la place de index.ejs, il sera lu également*/

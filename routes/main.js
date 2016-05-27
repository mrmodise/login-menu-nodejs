var router = require('express').Router();

router.get('/', function(req, res){
	res.render('main/home');
});

module.exports = router;
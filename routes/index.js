
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.loggedIn = function(req, res){
	res.render('loggedIn', { title: 'Express', user: req.user});
};
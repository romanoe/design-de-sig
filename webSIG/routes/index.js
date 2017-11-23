var express = require('express');
var router = express.Router();

var mongoose = require('mongoose'); //MongoDB object use to connect with the database

// Connection with the MongoDB database (error write on log if impossible to connect)
mongoose.connect('mongodb://localhost:27017/burkina', {useMongoClient: true})
.then(() => console.log('connection succesful')) // Sucess message if it manages to connect to the DB
.catch((err) => console.error(err)); // Error message if not


var Schema = mongoose.Schema; // Global variable for Mongoose schema


// Schema for the initial_layers collection
var initLayerSchema = new Schema({
	name : String,
	type : Schema.Types.Mixed //format mixte car geojson rangés en vrac dans la collection (contenu mixte)
});
// Model for the initial_layers collection (class with which the documents will be constructed, having the same properties and behavior defined in the Schema)
var initLayerModel = mongoose.model('initialLayers',initLayerSchema,'initial_layers');


// Ouvrages features
var ouvrageSchema = new Schema({
	name : String,
	type : String,
	date_construction : Date,
	urgence_interv : Number,
	plan_PDF : String,
	geometry : {
		type : {type : String},
		coordinates : []
	}
});
var ouvragesModel = mongoose.model('ouvragesLayer',ouvrageSchema,'ouvrages')



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WebSIG' });
});

// Get GeoJSON (initial layers) data
router.get('/mapjson/:name', function (req,res) {
	console.log(req.params.name);
	if(req.params.name) {
		initLayerModel.findOne({name: req.params.name }, {}, function (err,docs) {
			res.json(docs);
		})
	}
});


// Send Ouvrages layer to DB (vary the model variable with if to execute for any layer)
router.post('/form', function (req,res){
	console.log(req.body);
	var newOuvrage = new ouvragesModel(req.body);
	newOuvrage.save(function(err,newobj){
		if(err){
			res.send(err.message);
		}
		else{
			res.send(newobj);
			console.log('success');
		};
	});
});



module.exports = router;
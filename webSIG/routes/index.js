var express = require('express');
var router = express.Router();

var mongoose = require('mongoose'); //MongoDB object use to connect with the database
mongoose.Promise = global.Promise;


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
	type : String,
	properties : {
		nameO : String,
		typeO : String,
		date_constructionO : String,
		urgence_intervO : Number,
		plan_PDFO : String,
	},
	geometry : {
		type : {type : String},
		coordinates : []
	}
});
var ouvragesModel = mongoose.model('ouvragesLayer',ouvrageSchema,'ouvrages')


// Routes features (take features from provided geojson)
var routeSchema = new Schema({
	properties : {
		Route : String,
		Origine : String,
		Fin : String,
		Code : String,
		Longueur : Number,
		Classe : String,
		Type : String,
	},
	geometry : {
		type : {type : String},
		coordinates : []
	}
});
var routesModel = mongoose.model('routesLayer',routeSchema,'routes') // model named routesLayer and constructed from the schema routeSchema



// Pistes features
var pisteSchema = new Schema({
	properties : {
		Piste : String,
		Origine : String,
		Fin : String,
		Longueur : Number,
		Type: String,
		Etat: String,
		AnnéeCons: String,
		BureauEtud: String,
		Entreprise: String,
		Observation: String,
	},
	geometry : {
		type : {type : String},
		coordinates : []
	}
});
var pistesModel = mongoose.model('pistesLayer',pisteSchema,'pistes')



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WebSIG' });
});

// Get GeoJSON (initial layers) data
router.get('/mapjson/:name', function (req,res) {
	initLayerModel.findOne({name: req.params.name }, {}, function (err,docs) {
	res.json(docs); })	

});


router.post('/form', function (req,res){

	var newLayer = new ouvragesModel(req.body);

	newLayer.save(function(err,newobj) {
		if(err){
			res.send(err.message);
		}
		else{
			res.send(newobj);
		};
	});
});


router.get('/ouvragesfromDB', function (req,res){
	ouvragesModel.find({}, function(err,docs) {
		res.send(docs);
	});
});

router.get('/routesfromDB', function (req,res){
	routesModel.find({}, function(err,docs) {
		res.send(docs);
	});
});

router.get('/pistesfromDB', function (req,res){
	pistesModel.find({}, function(err,docs) {
		res.send(docs);
	});
});


router.put('/form/updateItem', function (req,res) {

	ouvragesModel.findByIdAndUpdate(req.body.properties.id, req.body, function (err,docs) {
		if(err) {
			res.send(err.message);
		}
		else {
			res.send('OK');
		};
	});
});


router.delete('/form/deleteItem', function (req,res) {

	ouvragesModel.findByIdAndRemove(req.body.properties.id, function (err,docs) {
		if(err) {
			res.send(err.message);
		}
		else {
			res.send('OK');
		};
	});
});


module.exports = router;

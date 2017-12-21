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


// Routes features (take features from provided geojson)
var routeSchema = new Schema({
	route : String,
	origine : String,
	fin : String,
	code : String,
	longueur : Number,
	classe : String,
	type : String,
	geometry : {
		type : {type : String},
		coordinates : []
	}
});
var routesModel = mongoose.model('routesLayer',routeSchema,'routes') // model named routesLayer and constructed from the schema routeSchema

// // Add routes geojson to mongodb
// var fs = require('fs');
// var mydocuments = fs.readFile('routesLL.geojson', 'utf8', function (err, data) {
// 	console.log(mydocuments);

// 	try {
// 	   routesModel.collection.insertMany(data);
// 	} catch (err) {
// 	   console.log(err);
// 	}

// });



// Pistes features
var pisteSchema = new Schema({
	name : String,
	longEst : Number,
	libelle : String,
	details : String,
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
	console.log(req.params.name);

	if(req.params.name == 'ouvrages') {
			ouvragesModel.findOne({name: req.params.name }, {}, function (err,docs) {
			res.json(docs); })	
	}

	else if(req.params.name == 'routes') {

			routesModel.findOne({name: req.params.name }, {}, function (err,docs) {
			res.json(docs); })	
	}
	else if(req.params.name == 'pistes') {
			pistesModel.findOne({name: req.params.name }, {}, function (err,docs) {
			res.json(docs); })	
	}

	else {
			initLayerModel.findOne({name: req.params.name }, {}, function (err,docs) {
			res.json(docs); })	
	}

});



// Send the layer (Ouvrages, Pistes or Routes) to DB 
// router.post('/form', function (req,res){
// 	console.log(req.body);

// 	if (returnActiveLayer()=='Ouvrage') {
// 		var newLayer= new ouvragesModel(req.body);
// 	};
// 	else if (returnActiveLayer()=='Route') {
// 		var newLayer= new routessModel(req.body);
// 	};
// 	else if (returnActiveLayer()=='Piste') {
// 		var newLayer= new pistesModel(req.body);
// 	};

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


router.get('/form', function (req,res){
	console.log(req.params.name);
	ouvragesModel.find({}, function(err,docs) {
		res.send(docs);
	});
});


router.put('/form/updateItem', function (req,res) {

	ouvragesModel.findByIdAndUpdate(req.body.id, req.body, function (err,docs) {
		if(err) {
			res.send(err.message);
		}
		else {
			res.send('OK');
		};
	});
});


router.delete('/form/deleteItem', function (req,res) {

	ouvragesModel.findByIdAndRemove(req.body.id, function (err,docs) {
		if(err) {
			res.send(err.message);
		}
		else {
			res.send('OK');
		};
	});
});


module.exports = router;

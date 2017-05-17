var express = require('express');
var app = express();
var axios = require('axios');
var Promise = require("bluebird");
var request = require('request-promise');
var forEach = require('async-foreach').forEach;


var newObj = {}

app.get("/api/findRiders",function(req,res){
  // fetch vehicles/starships
  var url = 'http://swapi.co/api/'+req.query.type+'/'+req.query.id;
  console.log(url);
  axios.get(url).then(function(response) {

    newObj['name'] = response.data.name;
    newObj['model'] = response.data.model;
    newObj['Riders'] = [];
    function allDone(notAborted, arr) {
      console.log("done", notAborted, arr);
      res.send(newObj);
    }
// by foreach
forEach(response.data.pilots, function(pilot, index, arr) {
  var done = this.async(); // call when you want to iterate
  axios.get(pilot).then(function(response) {
    var newPilot = {};
    newPilot['name'] = response.data.name;
    newPilot['gender'] = response.data.gender;
    newPilot['films'] = response.data.films;
    var newFilms = newPilot.films;
    newPilot.films = [];

    // fetch homeworld
    axios.get(response.data.homeworld).then(function(home){
      newPilot['HomeWorld'] = home.data.name;

      //fetch species
      axios.get(response.data.species[0]).then(function(species){
        newPilot['Species'] = species.data.name;
        // fetch films or each pilots
        Promise.map(newFilms, function(obj) {
          return request(obj).then(function(body) {
            return JSON.parse(body);
          });
        }).then(function(results) {
          for (var i = 0; i < results.length; i++) {
            // access the result's body via results[i]
            newPilot['films'].push(results[i].title);
          }
          newObj['Riders'].push(newPilot);
          done();
        }, function(err) {
          res.send(err);
        });


        // rejct of species api call
      },function(err){
        console.log("error in species");
        res.send(err);
      })


      // rejct of homeworld
    },function(err){
      console.log("error in homeworld");
      res.send(err);
    })

    // reject of pilots api call
  },function(error){
    console.log("reject of pilots map");
    res.send(error);
  })

}, allDone);

    // resolve of vehicles/starships api call
  },function(error){
    console.log("got error in first api call");
    res.send(error);
  })

});
app.listen(8080,function(){
  console.log("app is listening at 8080");
})

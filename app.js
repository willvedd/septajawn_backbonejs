var json_data;

$.getJSON('stations.json', function(data) {//importing JSON data
	json_data = data;
});

var Station = Backbone.Model.extend({
	defaults : {
	id : null,
	order : null,
	line : null,
	name : null,
	sat_nb : null,
	sat_sb : null,
	sun_nb : null,
	sun_sb : null,
	wk_nb : null,
	wk_sb : null,
	close_wk : null,
	close_end : null
 	},
});

var json_station = new Station(json_data);

Stations = Backbone.Collection.extend({
	model:Station,
	url: 'stations.json'
});

var stations = new Stations();

stations.fetch();

var fairmount = new Station({
	name: "fairmount",
	line: "bs"
});

var girard = new Station({
	name:"girard",
	line:"bs"
});



//-------------------------Model and Collection-----------------------------

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
 	}
});

var StationList = Backbone.Collection.extend({
	model: Station,
	url: 'stations.json',
});

var stations = new StationList();

//----------------------- Station View -------------------------------

var StationView = Backbone.View.extend({

	tagName: 'option',

	template: _.template( $('#stationTemplate').html()),

	className: "station",

	initialize: function(res){
		console.log("Station view initialized");
		this.render();
	},
	render: function(eventName) {
		this.$el.html( this.template(this.model.toJSON()));
        return this;
    },
    events: {
    	'click .delete': 'delete',
    	'click .edit': 'edit',
    },
    
    delete: function(){
    	console.log("Delete");
    	this.$el.remove();
    },

    edit: function(){
    	console.log("Edit");
    	var newName = prompt("New name:", this.model.get('name'));
    	this.model.set('name',newName);
    },

    //template: _.template( $('#scheduleDiv').html()),
});

//---------------------Stations View---------------------------------


var StationListView = Backbone.View.extend({
	
	el: '#start_dest',
	tagName: 'select',

	intialize: function(){
		console.log(this.collection);
	},
	render: function(){
		this.collection.each(function(station){
			var stationView = new StationView({model:station});
			this.$el.append(stationView.el);
		},this);//"This" loses reference inside loop, regains it with appended ",this"

		return this;
	},
	
	events: {
    	'click .reset': 'reset',
    },

	reset: function(){
    	console.log("RESET!");
    	this.$el.empty();
    	this.render();
    },

})

//---------------------Test Code---------------------------------

stations.fetch({
	success: function(){
		console.log("Successful fetch");
	}
});



$(function(){
   schedule = new StationListView({collection:stations})
 })




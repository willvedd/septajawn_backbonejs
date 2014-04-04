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

	tagName: 'li',

	template: _.template( $('#stationTemplate').html()),

	initialize: function(res){
		console.log("Station view initialized");
		this.render();
	},
	render: function(eventName) {
		this.$el.html( this.template(this.model.toJSON()));
        return this;
    },
    //template: _.template( $('#scheduleDiv').html()),
});

//---------------------Stations View---------------------------------


var StationListView = Backbone.View.extend({
	
	el: '#scheduleDiv',
	tagName: 'ul',

	intialize: function(){
		console.log(this.collection);
	},
	render: function(){
		console.log("StationListView Rendered");
		this.collection.each(function(station){
			var stationView = new StationView({model:station});
			this.$el.append(stationView.el);
		},this);//"This" loses reference inside loop, regains it with appended ",this"

		return this;
	}
})

//---------------------Test Code---------------------------------

stations.fetch({
	success: function(){
		for(i=0;i<stations.length;i++){
			console.log();	
		};
		/*stations.each( function(model){
			if(model.get('line')=="bs"){
				console.log(model.get('name'))
			}
			else{
				console.log("Not broad street");
			}
		});//won't execute, models not ready in time*/
	}
});



$(function(){
   schedule = new StationListView({collection:stations})
 })




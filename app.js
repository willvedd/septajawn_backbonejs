
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

var StationList = Backbone.Collection.extend({
	model:Station,
	url: 'stations.json',
});

var fairmount = new Station ({
	name: "Fairmount",
	line: "bs",
	order: 10,
	id: "faimount"
});







var ScheduleView = Backbone.View.extend({

	el: '#schedule_container',

	//template: _.template($('#scheduleTemplate').html()),

	initialize: function(){
		console.log("View initialized");
		this.render();
	},
	render: function(eventName) {
   /*     _.each(this.model.models, function(station){
            var scheduleTemplate = this.template(profile.toJSON());
            $(this.el).append(scheduleTemplate);
        }, this);

        return this;*/
        console.log("render")
    },
	events: {
		'click': "reset"
	},
	reset: function(){
		console.log("doReset");
	}
});

var stations = new StationList();
var schedule = new ScheduleView({model:stations});


stations.fetch();

stations.bind('reset', function(){
	console.log("schedule.render()");
	schedule.render();
});

stations.each( function(model){
	console.log(model.get('name'));
});//won't execute, models not ready in time







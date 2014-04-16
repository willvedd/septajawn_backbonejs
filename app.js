//-------------------------Model and Collection-----------------------------
console.time('load');
console.time('fetch end');
console.time('list_view_initialize');
console.time('list_view_render');
console.time('list_view_called');
console.time('list_view_last1');
console.time('list_view_last1');

var Station = Backbone.Model.extend({
    defaults: {
        id: null,
        order: null,
        line: null,
        name: null,
        sat_nb: null,
        sat_sb: null,
        sun_nb: null,
        sun_sb: null,
        wk_nb: null,
        wk_sb: null,
        close_wk: null,
        close_end: null
    }
});

var StationList = Backbone.Collection.extend({
    model: Station,
    url: 'stations.json',
});

var stations = new StationList();

console.time('fetch');
stations.fetch({
    success: function(){
        console.timeEnd('fetch');
        if( ($.cookie.read('line_fav')!=null) && ($.cookie.read('line_fav')=='mf') ){//is line cookie set?
            $('.line1').click();//click the line selector...kinda hacky but necessary because its almost pure CSS
        }
        start_list.render($.cookie.read('start_fav'),'#start_dest');//passing start cookie and jquery element as param
        end_list.render($.cookie.read('end_fav'),'#end_dest');//passing end cookie and jquery element as param
    },
    error: function(){
        console.log("Fetching error");
    },
})

//----------------------- Station View -------------------------------

var StationView = Backbone.View.extend({

    tagName: 'option',

    template: _.template($('#stationTemplate').html()),

    className: "station",

    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.el.value = this.model.cid;//Sets value for drop down selections, allows future binding
        return this;
    },
});

//---------------------Stations View---------------------------------

var StationListView = Backbone.View.extend({

    tagName: 'select',

    initialize: function() {},

    render: function(cookie,cookie_list) {
        console.timeEnd('list_view_render');
        this.$el.empty(); //clears existing elements

        if($('#myonoffswitch').is(":checked")){
        	var line = 'mf'
        }
        else{
        	var line = 'bs'
        };

        this.$el.append('<option disabled="disabled" selected="selected">Select station</option>');

        this.collection.each(function(station) { //generates models from stations collection that correlate to correct station selection
            if ( (station.get('line') == line) ) {
            	if(station.cid != $('#start_dest').val()){
            		var stationView = new StationView({
                    model: station
                });
                this.$el.append(stationView.el);
            	}
            };
        }, this); //"This" loses reference inside loop, regains it with appended ",this"

        if(cookie!=null){//if cookie value is valid
            $(cookie_list).val(cookie);//setting the drop down (cookie list) to the cookie value
        }
        else{
            console.log("Cooke not set");
        };

        return this;
    },

    reset: function() {
        this.render();
        return this;
    },

    getVal: function() {
        return ($(this.$el).val());
    },
});

start_list = new StationListView({
    collection: stations,
    el: '#start_dest',
});
console.timeEnd('list_view_called');

end_list = new StationListView({
    collection: stations,
    el: '#end_dest',
});



//---------------------Global View---------------------------------

var GlobalView = Backbone.View.extend({

    el: 'body',

    events: {
        'click .submit': 'submit',
        'click #wk' : 'setWeek',
        'click #sat' : 'setSat',
        'click #sun' : 'setSun',
        'click #rst': 'reset',
        'click .branding a': 'reset',
        'click #reverse': 'reverse',
        'click #fav': 'favorite',
        'change input[type=checkbox]': 'lineset',
        'change #start_dest': 'endlineset',
        'change #end_dest': 'startlineset',
    },

    initialize: function(){},

    submit: function() {
    	console.time('submit');
        var start = start_list.getVal();
        window.start_station = stations._byCid[start];

        var end = end_list.getVal();
        window.end_station = stations._byCid[end];

        console.time("hide");
        if((start_station!=undefined)&&(end_station!=undefined)){//validates the presence of data, or else the drop downs will disappear
            $('.platter').hide();
        };
        console.timeEnd("hide");

        this.schedule(start_station,end_station,day);//passing selected objects to scheduling logic
    },


    schedule: function(start,end,day){
    	console.time('schedule');
        if(start.get('order')<end.get('order')){
            var dir = 'sb';
        }
        else{
            var dir = 'nb';
        }

        var instruct = day+"_"+dir;

        var start_preschedule = start.get(instruct);
        var end_preschedule = end.get(instruct);

        window.start_schedule = [];
        window.end_schedule = [];

        var j = 0;
        window.pointer = 0;
        for(i=0; i<(start_preschedule.length);i++){
            if(start_preschedule[i]!=null){
                if(end_preschedule[i]!=null){
                    start_schedule[j] = timeformat(start_preschedule[i]);
                    end_schedule[j] = timeformat(end_preschedule[i]);

                    if (start_preschedule[i]<time()){
                        pointer++;//setting pointer so jumps to relevant time
                    };
                    j++;
                };
            };
        };
        schedule.render(start,end,day);
        console.timeEnd('schedule');
    },

    reset: function() {
    	console.time('reset');
        start_list.reset();
        end_list.reset();
        toolbar.reset();
        schedule.$el.empty();
        $('.platter').show();
        console.timeEnd('reset');
    },

    setWeek: function(){
        day = 'wk';
    	this.schedule(start_station,end_station,day);
    },

    setSat: function(){
        day = 'sat';
    	this.schedule(start_station,end_station,day);
    },

    setSun: function(){
    	console.time('setSun');
        day = 'sun';
    	this.schedule(start_station,end_station,day);
        console.timeEnd('setSun');
    },

    reverse: function(){
        console.time('reverse');
        temp_station = start_station;
        start_station = end_station;
        end_station = temp_station;
        this.schedule(start_station,end_station,day);
        console.timeEnd('reverse');
    },

    favorite: function(){
        console.time("favorite");
        $('#fav').addClass("fav_active");
        $.cookie.write('start_fav', start_station.cid, 24 * 60 * 60 *365);
        $.cookie.write('end_fav', end_station.cid, 24 * 60 * 60 *365);
        $.cookie.write('line_fav', start_station.attributes.line, 24*60*60*365);
        console.timeEnd("favorite");
    },

    lineset: function() {
    	console.time('lineset');
        start_list.reset();
        end_list.reset();
        $('.label2').toggleClass("mf");
        $('.label1').toggleClass("bs");
        console.timeEnd('lineset');
    },

    endlineset: function(){
    	if($('#start_dest').val()==$('#end_dest').val()){
    		end_list.reset();
    	};
    },

    startlineset: function(){
    	if($('#end_dest').val()==$('#start_dest').val()){
    		start_list.reset();
    	};
    },
});

console.time('make global view');
global = new GlobalView();
console.timeEnd('make global view');


//---------------------Schedule View---------------------------------

var ScheduleView = Backbone.View.extend({

    el: '#scheduleTable',

    template: _.template($('#scheduleTemplate').html()),

    initialize: function(){
        this.render;
    },

    render: function(start,end,day){
        console.time('render');
        this.$el.html(this.template(start.toJSON()));
        console.time("color set");
        if(start_station.get('line')=='mf'){//sets the color of the schedule's header
            $('td.station').toggleClass('bs');
        };
        toolbar.render();
        console.timeEnd('submit');
        console.timeEnd("color set");
        console.time("autoscroll_exec");
        console.time("autoscroll");
        $("'.table-wrap tr:nth-child("+(pointer+1)+")'").addClass("pointer");

        $('.table-wrap').animate({//automatically scrolls to next time,
            scrollTop: $("'.table-wrap tr:nth-child("+(pointer)+")'").position().top},400,'swing',function(){
                console.timeEnd("autoscroll");
        });
        console.timeEnd("autoscroll_exec");
        
        console.timeEnd('render');

    },
});

var ToolbarView = Backbone.View.extend({
	el: '#toolbar',

	template: _.template($('#toolbarTemplate').html()),

	render: function(){
		console.time('toolbar render');
		this.$el.empty();
		this.$el.append(this.template);
        $("#"+day).addClass("active");

		console.timeEnd('toolbar render');
	},

	reset: function(){
		this.$el.empty();
	}
})

//---------------------Other code---------------------------------

$(function() {

    day = function(){//returns "wk","sat","sun" depending on day of week
        var day = Date().split(" "); //Gets raw day of the week
        if (day[0] == "Sat") {
            //return "sat";
            return "sat";
        } else if (day[0] == "Sun") {
            //return "sun";
            return "sun";
        } else {
            return "wk";
        }
    };

    window.day = day();

    time = function(){
    	var now = new Date();
    	var hours = now.getHours();
    	if (hours == 0){
    		hours = 24;
    	};
    	var minutes = now.getMinutes();
        if(minutes<10){
            return hours+".0"+minutes;//setting time 
        }
        else{
            return hours+"."+minutes;//setting time 
        } 
   		
    }

    timeformat = function(time) { //formats time from a double into hh:mm for rendering purposes only
	    if ((time >= 12) && (time < 24)) {
	        var meridian = "PM";
	        if (time > 12.59) {
	            time = ((Math.round((time-12.00) * 100)) / 100) //Formatting time from 24hr to 12hr style
	        };
	    } else {
	        var meridian = "AM"
	    };
	    time = time.toString().split("."); //Converting time variable to a string and splitting to get minutes and hours
	    if (time[1] === undefined) { //If minutes are undefined,
	        time[1] = "00"; //Converts undefined minutes to hh:00;
	    };
	    if (time[0] == 24) { //If the hour is 24, set it to 12
	        time[0] = 12
	    };
	    if (time[1].length == 1) {
	        time[1] = time[1] * 10; //Adds trailing zero to hh:m0 numbers that otherwise display as hh:m;
	    };

	    return (time[0] + ":" + time[1] + " " + meridian); //returning a string of the time
	};

    console.time('make schedule view');
    schedule = new ScheduleView();
    console.timeEnd('make schedule view');

    console.time('make toolbar view');
    toolbar = new ToolbarView();
    console.timeEnd('make toolbar view');

    console.timeEnd('load');
});



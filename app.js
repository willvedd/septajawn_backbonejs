//-------------------------Model and Collection-----------------------------

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

stations.fetch({
    success: function() {
        console.log("Successful fetch");
    }
});

//----------------------- Station View -------------------------------

var StationView = Backbone.View.extend({

    tagName: 'option',

    template: _.template($('#stationTemplate').html()),

    className: "station",

    initialize: function(res) {
        console.log("Station view initialized");
        this.render();
    },
    render: function(eventName) {
        this.$el.html(this.template(this.model.toJSON()));
        this.el.value = this.model.cid;//Sets value for drop down selections, allows future binding
        return this;
    },

});

//---------------------Stations View---------------------------------


var StationListView = Backbone.View.extend({

    tagName: 'select',

    intialize: function() {
        this.render();
    },

    render: function(start) {
        this.$el.empty(); //clears existing elements

        var line = $('input.line:checked').val(); //checks to see what line is selected

        this.collection.each(function(station) { //generates models from stations collection that correlate to correct station selection
            if ( (station.get('line') == line)) {
                var stationView = new StationView({
                    model: station
                });
                this.$el.append(stationView.el);
            };
        }, this); //"This" loses reference inside loop, regains it with appended ",this"

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

//---------------------Global View---------------------------------

var GlobalView = Backbone.View.extend({

    el: 'body',


    intitialize: function() {
        console.log("Global init"),
        this.render();
    },

    render: function() {
        console.log("Global render");
    },

    events: {
        'click .submit': 'submit',
        'click .reset': 'reset',
        'click input[type=radio]': 'lineset',
        'change select': 'submit',
    },

    submit: function() {

        var start = start_list.getVal();
        window.start_station = stations._byCid[start];

        var end = end_list.getVal();
        window.end_station = stations._byCid[end];

        this.schedule(start_station,end_station);//passing selected objects to scheduling logic
    },


    schedule: function(start,end){

        if(start.get('order')<end.get('order')){
            var dir = 'sb';
        }
        else{
            var dir = 'nb';
        }

        var instruct = day()+"_"+dir;

        var start_preschedule = start.get(instruct);

        var end_preschedule = end.get(instruct);

        window.start_schedule = [];

        window.end_schedule = [];

        var j = 0;

        for(i=0; i<(start.get(instruct).length);i++){
            if(start_preschedule[i]!=null){
                if(end_preschedule[i]!=null){
                    start_schedule[j] = start_preschedule[i];
                    end_schedule[j] = end_preschedule[i];
                    j++
                };
            };
        };

        console.log(start_schedule);
        console.log(end_schedule);

        schedule.render(start,end,day());
    },

    reset: function() {
        start_list.reset();
        end_list.reset();
        schedule.$el.empty();
    },

    lineset: function() {
        start_list.reset();
        end_list.reset()
        schedule.$el.empty();
    },

});


//---------------------Schedule View---------------------------------

var ScheduleView = Backbone.View.extend({

    el: '#scheduleTable',

    template: _.template($('#scheduleTemplate').html()),

    initialize: function(){
        this.render;
    },

    render: function(start,end,day){
        this.$el.html(this.template(start.toJSON()));
    },
});

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

    start_list = new StationListView({
        collection: stations,
        el: '#start_dest',
    });

    end_list = new StationListView({
        collection: stations,
        el: '#end_dest'
    });

    global = new GlobalView();

    schedule = new ScheduleView();
});





var player;
var timestamps = [
    ["00:33", "00:41"],
    ["2:52", "3:01"],
    ["3:31", "3:43"],
    ["3:50", "4:17"],
    ["4:40", "4:47"],
    ["5:32", "5:51"],
    ["6:02", "6:20"],
    ["6:27", "6:37"],
    ["25:09", "25:30"],
    ["25:56", "26:01"],
    ["26:15", "26:31"],
    ["27:42", "28:18"],
    ["30:12", "31:18"],
    ["31:38", "31:50"],
    ["31:57", "32:19"],
    ["32:36", "32:44"],
    ["33:36", "34:23"],
    ["34:44", "35:00"],
    ["35:10", "35:15"],
    ["35:25", "35:42"],
    ["36:00", "36:30"],
    ["36:37", "36:38"],
    ["36:46", "37:20"],
    ["39:00", "39:43"],
    ["39:53", "40:01"],
    ["40:13", "40:32"],
    ["40:43", "41:14"],
    ["42:30", "42:53"],
    ["44:22", "45:56"]
];

function timesToSeconds(timestamps) {
    var times = [];
    timestamps.forEach(function(range) {
        times.push([
            timeToSeconds(range[0]),
            timeToSeconds(range[1])
        ])
    });
    
    function timeToSeconds(timeStr) {
        var times = timeStr.split(':');
        return parseInt(times[0]) * 60 + parseInt(times[1]);
    }
    return times;
}

var ranges = timesToSeconds(timestamps);


Vue.config.debug = true


var editor = new Vue({
    el: '.editor',
    data: {
        start: 0,
        end: 0,
        selected: null,
        current: 0,
        editing: null,
        ranges: timesToSeconds(timestamps)
    },
    methods: {
        timeFormat: function(val) {
            var seconds = Math.floor(val % 60);
            var minutes = Math.floor(val / 60);
            var hours = Math.floor(minutes / 60);
            minutes -= hours * 60;
            
            function zeroPad(num) {
                return ('00' + num).slice(-2);
            }
            
            return (hours ? hours + ':' : '') + 
                zeroPad(minutes) + ':' + zeroPad(seconds);
        },
        clickRange: function(index) {
            this.current = index;
            this.editing = null;
            this.start = null;
            this.end = null;
            var range = this.ranges[this.current];
            Vue.nextTick(function() {
                player.seekTo(range[0], true);
            });
        },
        editRange: function(index) {
            var range = this.ranges[index];
            this.editing = index;
            this.current = index;
            this.start = range[0];
            this.end = range[1];
            player.seekTo(range[0], true);
        },
        selectTime: function(what) {
            this.selected = what;
        },
        update: function(seconds) {
            // Update selected
            if (this.selected === 'start') {
                this.start = seconds;
            } else if (this.selected === 'end') {
                this.end = seconds;
            }
            
            var range = this.ranges[this.current];
            
            // Playing in current range
            if (seconds >= range[0] && seconds < range[1]) return;
            
            // Reached end of current range, skip to next
            if (seconds === range[1]) {
                var nextRange = this.ranges[this.current + 1];
                if (nextRange) {
                    player.seekTo(nextRange[0], true);
                    this.current++;
                    return;
                }
            }
            
            // Update current
            for (var i=0, range; range = this.ranges[i]; i++) {
                if (seconds < range[1]) {
                    this.current = i;
                    break;
                }
            }
        }
    }
});


function onYouTubeIframeAPIReady() {
    // Youtube player API
    // https://developers.google.com/youtube/iframe_api_reference
    player = new YT.Player(
        document.querySelector('.player'), {
            height: '390',
            width: '640',
            videoId: 'svymwO5Wuvw',
            events: {
                'onReady': onPlayerReady
            }
        });
        
    function onPlayerReady(event) {
        player.seekTo(ranges[0][0], true);
        //player.pauseVideo();
        
        setInterval(function() {
            var seconds = Math.floor(player.getCurrentTime());
            editor.update(seconds);
        }, 500);
    }
}

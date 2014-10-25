var axgame = function (container, config) {
    var _self, _container, _lib, _canvas, _config, _player, _globals;
    _self = this;

    _config  =  {
        gameID: "001",
        gameName: "eat'em'all",
        speed: 3000,
        playername: "player 1",
        windowSize: [640, 480],
        maxItems: 2,
        startLevel: 20,
        topLevel : 100,
        rotationEnabled: true,

        valueGood: 3,
        valueNormal: 1,
        valueBad: -5
        /* TODO probability of GOOD, BAD & NORMAL items */
    };

    _globals  = {
        eatmeter: 50
    };

    _lib = {
        /* storage */
        items_good : [
            {id:'1', img:"good/1.png"},
            {id:'1', img:"good/2.png"},
            {id:'1', img:"good/3.png"},
            {id:'1', img:"good/4.png"},
            {id:'1', img:"good/5.png"},
            {id:'1', img:"good/6.png"},
            {id:'1', img:"good/7.png"},
            {id:'1', img:"good/8.png"},
            {id:'1', img:"good/9.png"},
            {id:'1', img:"good/10.png"},
            {id:'1', img:"good/11.png"},
            {id:'1', img:"good/12.png"},
            {id:'1', img:"good/13.png"},
            {id:'1', img:"good/14.png"},
            {id:'1', img:"good/15.png"},
            {id:'1', img:"good/16.png"}

        ],
        items_normal: [
            {id:'1', img:"normal/1.png"},
            {id:'1', img:"normal/2.png"},
            {id:'1', img:"normal/3.png"},
            {id:'1', img:"normal/4.png"},
            {id:'1', img:"normal/5.png"},
            {id:'1', img:"normal/6.png"}
        ],
        items_bad: [
            {id:'1', img:"bad/1.png"},
            {id:'1', img:"bad/2.png"},
            {id:'1', img:"bad/3.png"},
            {id:'1', img:"bad/4.png"},
            {id:'1', img:"bad/5.png"},
            {id:'1', img:"bad/6.png"},
            {id:'1', img:"bad/7.png"},
            {id:'1', img:"bad/8.png"},
            {id:'1', img:"bad/9.png"},
            {id:'1', img:"bad/10.png"},
            {id:'1', img:"bad/11.png"}
        ],

        /* methods */
        getRandomItem : function(){
            // get random item from lib
            var src, val,tp;
            var prob = Math.floor(Math.random()*10);

            if(prob < 3){
                src = this.items_bad;
                val = _config.valueBad;
                tp = "bad";
            }else if(prob < 6){
                src = this.items_normal;
                val = _config.valueNormal;
                tp = "normal";
            }else{
                src = this.items_good;
                val = _config.valueGood;
                tp = "good";
            }
            prob = Math.abs(Math.floor(Math.random()*src.length -1));

            /* return an html object */
            return $("template#axitem").html().replace(/{IMG}/g, "img/"+src[prob].img).replace(/{VAL}/g, val).replace(/{TYPE}/g, tp);

        }
    };


    /* Public */
    this.init = function() {
        if ( _validate() ){
            _build();
            _self.navigate("home");
        }
    };

    this.startGame = function() {
        this.navigate("game");
        _reset();
        _initActions();
    };

    this.stopGame = function(){
    _reset();
    _killActions();
    };

    this.navigate = function(dest){
        switch(dest){
            case "home":
                break;
            case "game":
                break;
            case "win":
                break;
            case "lose":
                break;
        }
        _canvas.attr("data-screen", dest);
    };


    /* Private */
    _validate = function(){
        if(container && container['length'] ){
            _container = container;
            /* TODO: check for LIB & TPL */
            return $("template#axcontainer") && $("template#axui");
        }
        _error("Incorrect container selected!");
        return false;
    };

    _build = function() {
        _container.append($("template#axcontainer").html());
        _canvas = _container.find(".axgame").append($("template#axui").html());
        _player = _canvas.find(".player");
    };


    _initActions =  function(){
        /* player movement */
        $(document).unbind().mousemove(function(e){
            var dx = e.pageX - _canvas.offset().left;
            if( dx < 6) {dx=6;}
            if(dx >(_config.windowSize[0] - _player.width())) {dx=_config.windowSize[0]- _player.width();}
            $(".player").css({left:dx}); //, top:e.pageY});
        });

        /* check collisions */
       _globals.intervalTestCollision =  window.setInterval(_testCollision, 10);


        /* falling objects */
        var timer = Math.floor(Math.random()*1000 + _config.speed);

         _globals.intervalAnimation = window.setInterval(function(){
            if($(".snowflakes").length <= _config.maxItems)
             {
                _itemsFall();
             }
            else
             {
               return false;
             }
            }, timer);
    };

    _killActions = function() {

        window.clearInterval(_globals.intervalTestCollision);
        window.clearInterval(_globals.intervalAnimation);
        $(".item").unbind().stop().remove();
        $(document).unbind();
    };

    _itemsFall = function() {

        var snowflake = $(_lib.getRandomItem());
           if(_config.rotationEnabled){ _rotate(snowflake);}
            $('.axgame .playground').prepend(snowflake);
            snowX = Math.floor(Math.random() * $('.axgame .playground').width());
            snowSpd = Math.floor(Math.random()*1000 + _config.speed);

            snowflake.css({'left':snowX+'px'});
            snowflake.animate({
                top: _config.windowSize[1] + 20,
//                opacity : "0",
            }, snowSpd, function(){
                $(this).remove();
                _itemsFall();
            });

    };

    _testCollision = function() {
     var overlap = $(".player .hitarea").collision( ".item");
     var origin;
       if(overlap.length){
         overlap.each(function(i,e){
            _globals.eatmeter += parseInt($(e).attr("data-value"));
             $(e).remove()
             _updateUI($(e).attr("data-type"));
         });
       }
    };

    _rotate = function(obj, rotationSpeed){
        if(obj && typeof obj == "object"){
          var rNum = (Math.random()*360);
          obj.css( {
            '-webkit-transform': 'rotate('+rNum+'2deg)',
            '-moz-transform': 'rotate('+rNum+'2deg)'
          } );
        }
    };

    _updateUI = function(itemType) {
        _canvas.find(".eatmeter .bar div").height(100 - _globals.eatmeter);
         _canvas.find(".eatmeter").addClass("hit-"+itemType);
        setTimeout(function(){
             _canvas.find(".eatmeter").removeClass("hit-"+itemType);
        }, 200);

        if(_globals.eatmeter <0) {
            _lose();
        }

        if(_globals.eatmeter >_globals.topLevel) {
            _win();
        }
    };

    _lose = function(){
        _self.stopGame();
        _self.navigate("lose");
    };

    _win = function(){
        if(confirm("Eat just a little bit more?")){
            _globals.topLevel += 100;
        }else{
            _self.stopGame();
               this.navigate("win");
        }
    };

    _reset = function(){
        _globals.eatmeter = _config.startLevel;
        _globals.topLevel = _config.topLevel;
        _updateUI();
    },

    _error =  function(msg) {
        console.error(msg);
    };

    _config = $.extend(_config, config);
    _self.init();
    return this;
}

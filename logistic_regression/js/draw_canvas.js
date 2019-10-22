
// canvas_properties object.
var canprop = {
    draw : true,
    down : false,
    cluster_size : 5,
    ctx : undefined,
    delay : 40,
    stroke_style : "white", 
    fill_style : "orange"
};

// stroke style and strol width for train and test


$(document).ready(function(){

    // first get the context object from the canvas
    canprop.ctx = document.getElementById("canvas").getContext("2d");

    // draw some points on clicking on the canvas.
	$('#canvas').click(function (e) {
		getPosition(e);
    });
    
    // change the 'down' property on mouse down.
	$('#canvas').mousedown(function (e) {
        canprop.down = true;
    });
    // revert back the 'down' property on mouse up.
	$('#canvas').mouseup(function(e) {
		canprop.down = false;
    });
    
    // draw some points while dragging on canvas with some delay.
	$('#canvas').mousemove(function (e){
		if ( canprop.down && canprop.draw){
            canprop.draw = false;
            setTimeout(function(){
                getPosition(e);
                canprop.draw = true
            }, canprop.delay)
		}
	});

    // It will get the position of mouse click on canvas
    // and draw the co-ordinates.
	function getPosition(event){
	    let rect = canvas.getBoundingClientRect();
	    let width = getClusterWidth();
	    let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        let cluster_size = canprop.cluster_size
        
        // draw point in that cluster.
        drawCoordinates(x,y);
        // draw some more points in th
        for (let i = 1; i < cluster_size; i++) {
	     	var newX = x+getRandom(-width/2, width/2);
	     	var newY = y+getRandom(-width/2, width/2);
	     	drawCoordinates(newX, newY);
	     }
    }
    

    // it will draw the circle on the canvas 
    // on given co ordinates.
	function drawCoordinates(x,y){	
        let ctx = canprop.ctx
        ctx.beginPath();
        ctx.arc(x, y, 3, 0*Math.PI, 2*Math.PI, true);

        ctx.strokeStyle = canprop.stroke_style;
        ctx.lineWidth=3
        ctx.stroke();

        ctx.fillStyle = canprop.fill_style;
        ctx.fill();
	}
  
	function getClusterWidth(){
		//add event to read width here
		return 20;
	}

	//Generating random numbers
	function getRandom(min, max) {
	  return Math.random() * (max - min) + min;
    }
    



    // ****************************************************
    // ********** Functions to update the controls ********
    // ****************************************************
    
    // function to get the update the cluster size.
    $("#ppc").on("input", function(){
        canprop.cluster_size =  this.value
        $(".ppc_text").text(this.value)
    });

    // function to get the update the delay between
    $("#delay").on("input", function(){
        canprop.delay = this.value
        $(".delay_text").text(this.value)
    });



});
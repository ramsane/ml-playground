
// canvas_properties object.
var canprop = {
    draw : true,
    down : false,
    cluster_size : 4,      // #points per cluster
    cluster_radius : 20,  // radius around which we can generate random points
    ctx : undefined,
    delay : 50,  // delay to generate points while dragging mouse on canvas
    stroke_style : "#1f77b4",  //train_pos 
    fill_style : "#1f77b4",  // train_pos
    active_datatype_id: "train_pos"  // to store data into appropriate lists
};

// stroke style and strol width for train and test
var fill_styles={
    train_pos:'#1f77b4',
    train_neg:'#f59c36',
    test_pos:'#0068ad',
    test_neg:'#ff6100'
}

var stroke_styles={
    train_pos:'#1f77b4',
    train_neg:'#f59c36',
    test_pos:'#000',
    test_neg:'#000'
}


// data from the canvas
var canvas_data ={
    train_pos:[],
    train_neg:[],
    test_pos:[],
    test_neg:[]
}


$(document).ready(function(){


    // first get the context object from the canvas
    canprop.ctx = document.getElementById("canvas").getContext("2d");
    // move to center and filp Y 
    canprop.ctx.transform(1,0,0,-1,canvas.width/2, canvas.height/2);


    // draw some points on clicking on the canvas.
	$('#canvas').click(function (e) {
        let [x, y] = getPosition(e);
        generate_points(x,y)
    });
    

    // generate random points around the given point
    function generate_points(x, y){

        // draw a #cluster-size points around that point
        let cluster_size = canprop.cluster_size
        let cluster_radius = canprop.cluster_radius
        let rect = canvas.getBoundingClientRect()

        // draw only if it is valid
        if(isValidPoint(x, y, rect)){
            drawCoordinates(x, y);
        }

        // draw some #clustersize points around the selected point
        for (let i = 1; i < cluster_size; i++) {
            
            let newX = x+getRandom(-cluster_radius, cluster_radius);
            let newY = y+getRandom(-cluster_radius, cluster_radius);
            
            if(isValidPoint(newX, newY, rect)){
                drawCoordinates(newX, newY);
            }
        }
    }


    // Function to check whether the point generated is well with in the boudaries
    function isValidPoint(x, y, rect){  

        return(-canvas.width/2+15<x && x<canvas.width/2-15 && 
           -canvas.height/2+15<y && y<canvas.height/2-15)

    }


    // **********************************************************
    // ****** Functions to handle mouse movements over canvas ***
    // **********************************************************
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
                let [x, y] = getPosition(e);
                generate_points(x, y)
                canprop.draw = true
            }, canprop.delay)
		}
	});


    // It will get the position of mouse click on canvas and draw the co-ordinates.
	function getPosition(event){
        let rect = canvas.getBoundingClientRect()      
        let width = canprop.cluster_radius;
        
        // additional subtraction, cause we moved the axes to center
	    let x = event.clientX - rect.left - canvas.width/2;
        let y = event.clientY - rect.top - canvas.height/2;
        
        // Negative over y is cause we flipped y-axis
        return [x, -y]
    }
    

    // it will draw the circle on the canvas on given co ordinates.
	function drawCoordinates(x,y){	
        let ctx = canprop.ctx
        ctx.beginPath();
        ctx.arc(x, y, 2, 0*Math.PI, 2*Math.PI, true);

        ctx.strokeStyle = canprop.stroke_style;
        ctx.lineWidth=3
        ctx.stroke();

        ctx.fillStyle = canprop.fill_style;
        ctx.fill();

        // add them to the canvas data
        active_id = canprop.active_datatype_id
        label = active_id.endsWith("pos")?1:0

        canvas_data[canprop.active_datatype_id].push([x, y, label])
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

    // function to get the update the delay while cursor is moving
    $("#delay").on("input", function(){
        canprop.delay = this.value
        $(".delay_text").text(this.value)
    });

    // function to get the update the cluster radius
    $("#radius").on("input", function(){
        canprop.cluster_radius = this.value
        $(".radius_text").text(this.value)
    });

    $("input[type=radio][name=train_test_select]").change(function(){
        id = $(this).prop('id')
        canprop.fill_style = fill_styles[id]
        canprop.stroke_style = stroke_styles[id]   
        canprop.active_datatype_id=id 
    })


    // ****************************************************
    // ********** Functions to handle canvas data  ********
    // ****************************************************
    
    $("#canvas_clear").click(()=> {
        // clear canvas
        canprop.ctx.clearRect(-canvas.width/2,-canvas.height/2,canvas.width, canvas.height);
        
        // clear test and train data
        canvas_data.train_neg = []
        canvas_data.train_pos = []

        canvas_data.test_pos = []
        canvas_data.test_neg = []
    });

    $("#canvas_data_update").click(() => {
        
        // make sure there is atleast one sample on all types of data
        for(let list in canvas_data){
            if(canvas_data[list].length ==0){
                alert("Data should have atleast one point in each category")
                return
            }
        }
        // hide the overlay and update the image.
        $(".overlay").fadeOut("fast", function(e){
            let dataURL = canvas.toDataURL()
            $('.canvas_img_container').css({
                'background': 'url('+dataURL+') center center / 95% no-repeat',
            })    
        })
    });

    $(".canvas_img_container").click(function(e){
        $(".overlay").fadeIn("fast");
    });

    $(".overlay").click(function(e){
        if(e.target==this){
            $(".overlay").fadeOut("fast");
        }
    });

    $("#overlay_close").click(function(e){
        $(".overlay").fadeOut("fast");
    })
    
});
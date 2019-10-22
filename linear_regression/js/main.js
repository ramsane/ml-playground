 // function to print the statement to console
 function print(text){
    console.log(text)
}

// function to get the shape of the data
function get_shape(arr){
    let shape = [arr.length, arr[0].length]
    print(shape)
    return shape
}

var reg_data = {
    x : undefined,
    y : undefined,
    w_init  : undefined,
    weights : [],
    costs   : [],
    chart_container : undefined,
    loss_container : undefined
};

var lr_reg_status = {
    running : undefined,
    reqID : undefined
}

$(document).ready(function(){

    /* ********************************************************* 
    * function to load the data into x, y and chart_container.
    * ********************************************************** */
    $("#load_data").click(function(){
        // clear all the pending animaions if pending.
        if(lr_reg_status.reqID){
            cancelAnimationFrame(lr_reg_status.reqID)
        }
        // load the data into the data matrix..
        $.get("data_files/reg_data.csv", function(data){
            data_matrix = math.map($.csv.toArrays(data), parseFloat)
            // alert(data_matrix)
            // plot the data on the container...
            reg_data.chart_container = document.getElementById("chart_container");
            reg_data.loss_container = document.getElementById("loss_container");
            // it will set the x and y values of global scope to the
            //  actual data
            var [x ,y, w] = draw_plot(data, chart_container, loss_container);
            reg_data.x = x;
            reg_data.y = y;
            reg_data.w_init = w;

        });
    });


    /********************************************************* 
    *  function to print the data onto the console.
    ******************************************************** */
    $("#print_data").click(function(){
        print(reg_data.x)
        print(reg_data.y)
        print(reg_data.chart_container)
    });

    /********************************************************* 
    *  function to run the regression model with animations.
    ******************************************************** */
    $("#run_regression").click(function(){

        // Run Gradient_descent( Batch... not Stochastic )
        iterations = 4000;
        learning_rate = 15;
        is_stochastic = true;
        batch_size = 10;
        run_gradient_descent(reg_data.x, reg_data.y, reg_data.w_init,
            iterations, learning_rate, is_stochastic, batch_size);
    });


}); // end of document.ready() function.
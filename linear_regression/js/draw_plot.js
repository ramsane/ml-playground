/* function to draw the plots and return
 the container variable in which the plot 
 the data.
*/
function draw_plot(data, chart_container, loss_container){
        var data_matrix = math.map($.csv.toArrays(data), parseFloat)
        // get x and y from the data_matrix
        var x = math.flatten(math.evaluate('data_matrix[:,1]',{data_matrix}));
        var y = math.flatten(math.evaluate('data_matrix[:,2]',{data_matrix}));

        // random weights.(w_0 : intercept, w_1 : slope of line) 
        var w = [-20,  -38]
        // draw the line with this random weights(slope and intercept.)
        var extreme_points = [math.min(x), math.max(x)]
        var y_pred_line = hypothesis(extreme_points, w)

        /*********************************************************
        * plot the data for using plotly.js
        *********************************************************/
        var chart_container = document.getElementById('chart_container');

        // draw_plot(x, y, chart_container)
        // trace to plot the data points.
        var points = {
            x:math.flatten(x),
            y:math.flatten(y),
            mode:'markers',
            type: 'scatter',
            name : 'DataPoints',
            showlegend : false,
            opacity : 0.7,
            hoverinfo : "y"
        };

        // trace for the line in first subplot
        var reg_line = {
            x : extreme_points,
            y : y_pred_line,
            mode:"lines",
            name : 'Reg_Line',
            showlegend : false
        };

        // prepare the data with the avialable traces
        var data = [points, reg_line];

        // prepare the layout for the plot
        var layout = {
            xaxis : {fixedrange : true, visible:false},
            yaxis : {fixedrange : true, visible:false},
            margin: {l: 10,r: 10,b: 10,t: 10,pad: 0},
            showlegend: false
        }

        Plotly.newPlot(chart_container, data, layout);
        chart_container.on('plotly_afterplot', function(){
            status = true
        })

        /**
         * 
         * prepare the plot for the loss_function animation.
         * 
         */
        var cost_line = {
            y : [],
            mode : 'lines'
        }

        var cost_layout = {
            xaxis : {fixedrange : false, visible:false},
            yaxis : {fixedrange : false, visible:false},
            margin: {l: 10,r: 10,b: 30,t: 10,pad: 0},
            showlegend: false,
            hovermode:true
        }
        Plotly.newPlot(loss_container, [cost_line], cost_layout) 
          

    // now return the plot along with the data
    return [x, y, w]
}
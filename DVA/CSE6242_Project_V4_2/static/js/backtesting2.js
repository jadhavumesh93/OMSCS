var formatDecimal = d3.format(",.2f");
function createCharts(btnClick, divId, chartDivId, index, model){
    console.log("index = ", index, " model = ", model)
    d3.select(`#tooltip_${index}`).remove()
    d3.select(`#${chartDivId}`).selectAll("*").remove();
    var div_height = document.getElementById(divId).offsetHeight    //d3.select('#leftpane').attr('width')
    var div_width = document.getElementById(divId).offsetWidth    //d3.select('#leftpane').attr('width')
    console.log("div_width = ", div_width)
    var margin = {top: 10, right: 120, bottom: 30, left: 30}, width = div_width - margin.left - margin.right, height = div_height - margin.top - margin.bottom;
    var svg = d3.select(`#${chartDivId}`).append("svg").attr('width', div_width).attr('height', div_height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    dataset = ""
    var tooltip = d3.tip().attr("id", `tooltip_${index}`)
    svg.call(tooltip)
    if(model == "GBM"){
        //pane_a = "../static/bivariate_GBM.csv"
        pane_a = "../static/backtest_GBM.csv"
        getChartGBM(btnClick, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index, divId);
    }
    else if(model == "RF"){
        //pane_a = "../static/stockjson.json"d.
        pane_a = "../static/backtest_RF.csv"
        getChartRF(btnClick, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index, divId);
        //getChartJson(btnClick, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index);
    }
    else if(model == "RNN"){
        pane_a = "../static/backtest_RNN.csv"
        getChartRNN(btnClick, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index, divId);
        //getChartJson(btnClick, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index);
    }
}
function getChartGBM(reload, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index, divId){
    console.log("reload = ", reload)

    // Remove previous lines and x-axis ranges
    svg.select(`#linechart_${index}`).remove()
    //svg.select('#x-axis-a').remove()
    svg.select(`#x-axis-${index}`).remove()
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%e %b %Y")
    d3.csv(pane_a, function(d){
        //console.log(d)
        return {date : new Date(d.DATE), Actual : +d.Actual, Prediction : +d.Prediction}
    }).then(function(data){
        //console.log("data = ", data)
        con_data = []
        var json_keys = Object.keys(data[0])
        /*data.forEach(d => {
            d["DATE"] = parseTime(d["date"])
            con_data.push(d)
        })*/
        keys_wo_date = []
        json_keys.forEach(j => {
            if(j != "date"){
                keys_wo_date.push(j)
            }
        })
        d3.select('#select_rnn_a').selectAll('option').data(keys_wo_date).enter().append('option').attr('value', function(d){return d}).text(function(d){return d});
        d3.select('#select_rnn_b').selectAll('option').data(keys_wo_date).enter().append('option').attr('value', function(d){return d}).text(function(d){return d});
        // Normalized Data STARTS
        var NormalizedData = getNormalizedData(data, json_keys)
        //console.log("normalized data = ", NormalizedData)
        data = getNormalizedData(data, json_keys)
        // ENDS
        //data = con_data
        mindate = d3.min(data, function(d) { return d.date; })
        maxdate = d3.max(data, function(d) { return d.date; })
        /*if(reload == 1){
            document.getElementById(`fromdate_${index}`).value = parseTime(mindate)
            document.getElementById(`todate_${index}`).value = parseTime(maxdate)
        }
        // console.log("Date format = ", data)
        fromDate = new Date(document.getElementById(`fromdate_${index}`).value);
        console.log("From date = ", fromDate, "typeof = ", typeof(fromDate));
        toDate = new Date(document.getElementById(`todate_${index}`).value);
        console.log("To date = ", toDate, "typeof = ", typeof(fromDate));
        */
        

        console.log("Max date = ", maxdate, " min date = ", mindate, " typeof = ", typeof(mindate))

        //dmn = reload == 0 ? [fromDate, toDate] : [mindate, maxdate]
        var x = d3.scaleTime()
                    .domain([mindate, maxdate]) //d3.extent(data, function(d) { return d.date; })
                    .range([ margin.left, width ]);
        var x_axis = svg.append("g").attr('id', `x-axis-${index}`)
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));
        var xAxisLabel_a = x_axis.append("text").attr("id", `x_axis_label_${index}`).attr("x", (width/2)).attr("y",margin.bottom).text("Date").style("font-size", 14).attr("fill", "black")

        // Add Y axis
        /*minValA = d3.min(data, function(d) { return d[modelA]; })
        maxValA = d3.max(data, function(d) { return d[modelA]; })*/
        var minVal = 0;
        var maxVal = 0;
        var filter_keys = []
        /*if(reload == 1){  
            document.getElementById('select_rnn_b').value = "DTWEXBGS"  
            featA = "DPRIME"
            featB = "DTWEXBGS"
            filter_keys = [featA, featB, "SP500"]
        }
        else{
            console.log("rnnA = ", document.getElementById('select_rnn_a').value)
            featA = document.getElementById('select_rnn_a').value
            featB = document.getElementById('select_rnn_b').value
            filter_keys = [featA, featB, "SP500"]
        }*/
        json_keys.forEach(j => {
            if(j != "date"){
               minValA = d3.min(data, function(d) { return d[j] });
                maxValA = d3.max(data, function(d) { return d[j] });
                console.log("minValA = ", minValA, " maxValA = ", maxValA)
                if(minValA <= minVal){
                    minVal = minValA;
                }
                if(maxValA >= maxVal){
                    maxVal = maxValA;
                }
                console.log("min = ", minVal, " max = ", maxVal)
            }
        })
        /*minValA = d3.min(data, function(d) { return d.DPRIME });
        minValB = d3.min(data, function(d) { return d.DTWEXBGS });
        maxValA = d3.max(data, function(d) { return d.DPRIME });
        maxValB = d3.max(data, function(d) { return d.DTWEXBGS });
        minY = Math.min(minValA, minValB);
        maxY = Math.max(maxValA, maxValB)*/
        minY = minVal;
        maxY = maxVal;
        var y = d3.scaleLinear()
                    .domain([0, 1])
                    .range([ height, 0 ]);

        var y_axis = svg.append("g").attr("id", `y-axis-${index}`).attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y))  
    
        var yAxisLabel_a = y_axis.append("text").attr("id", `y_axis_label_${index}`).attr("transform", "rotate(-90)")
                  .attr("y", -margin.left-margin.top)
                  .attr("x",(-(height - 10*margin.top - margin.bottom )/2))
                  .attr("dy", "1em")
                  .style("text-anchor", "end").text("Actual vs Prediction")
                  .style("font-size", 14).attr("fill", "black")
        //
        //Right Y axis
        /*minValB = d3.min(data, function(d) { return d[modelB]; })
        maxValB = d3.max(data, function(d) { return d[modelB]; })
        var yB = d3.scaleLinear()
                    .domain([minValA, maxValA])
                    .range([ height, 0 ]);
        var y_axis = svg.append("g").attr("id", `y-axis-${index}_2`).attr("transform", `translate(${width}, ${0})`).call(d3.axisLeft(yB))  
    
        var yAxisLabel_a = y_axis.append("text").attr("id", `y_axis_label_${index}_2`).attr("transform", "rotate(-90)")
                  .attr("y", -margin.right/30)
                  .attr("x",-((height - margin.top - margin.bottom )/2))
                  .attr("dy", "1em")
                  .style("text-anchor", "end").text("Actual vs Prediction")
                  .style("font-size", 14).attr("fill", "black")
        */
        // Legend circle
        var circle_g = svg.append("g").attr("id", `legend_circle_${index}`)
        
        // Create linechart
        index_g = svg.append("g").attr("id", `linechart_${index}`)

        // Create linechart for each data
        var colorScheme = d3.scaleOrdinal(d3.schemeCategory10)
        
        console.log("json keys = ", json_keys, "====", data)
        //filteredData = data.filter(d => d.date >= fromDate && d.date <= toDate)
        //console.log("Filtered data = ", filteredData)
        i = 0
        if(divId == "leftpane"){
            document.getElementById('rmse_leftpane').innerHTML = "RMSE score = " + getRMSEScore(data);
        }
        else if(divId == "rightpane"){
            document.getElementById('rmse_rightpane').innerHTML = "RMSE score = " + getRMSEScore(data);
        }
        json_keys.forEach(js => {
            
            //console.log(js)
            if(js != "date"){
                index_g.append("path").attr('id', js+'_'+index)//.attr("class", function(d){return d3.select("#index").node().value})
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", function(d, j) { return colorScheme(i) })
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d[js]) })
                )
                
                // Create legend
                legend_circle = circle_g.selectAll(`circle_${index}_${js}`).data(data).enter().append('circle').attr('id', `circle_${index}_${js}`)
                                .attr('r', 5).attr('cx', div_width - margin.right).attr('cy', margin.top + (i + 1)*20)
                                .attr('fill', (d, j) => colorScheme(i))
                       
                legend_text = circle_g.selectAll(`legend_${index}_${js}`).data(data).enter().append('text').attr('id', `legend_${index}_${js}`)
                                        .attr('x', div_width - margin.right + 10).attr('y', margin.top + 3 + (i + 1)*20)
                                        .text((d, j) => js).attr('fill', (d, j) => colorScheme(i)).style('font-size', 12)
            }
            i += 1
        })
        //
        tooltip_circle = svg.append('g').attr('id', `tooltip-circle-${index}`)
        sd = svg.select(`#linechart_${index}`)//.selectAll('path')
        console.log("sd = ", sd)
        /*svg.select(`#linechart_${index}`).on('mouseover', function(d, i){
            di = sd.selectAll('path')
            console.log("di = ", index, "==", di)
            di.on('mouseover', function(e, j){
                console.log("e = ", j)
                if(index == "a"){
                    getTooltipA(json_keys[1 + j], e, x, y, formatTime, svg, index, tooltip_circle, div_height, div_width)
                }
                else if(index == "b"){
                    getTooltipB(json_keys[1 + j], e, x, y, formatTime, svg, index, tooltip_circle, div_height, div_width)
                }
            })
        })*/
        var circle = tooltip_circle.append('circle').attr('id', `circle_${index}`).attr('r', 0).attr('fill', 'red')
        console.log("Circle = ", circle)
        json_keys.forEach(js => {
            if(js.toUpperCase() != "DATE"){
                svg.select(`#${js}_${index}`).on('mousemove', function(event){
                    //console.log("mouseover = ", event)
                    const xCord = d3.mouse(this);
                    const bisectDate = d3.bisector(d => d.date).left;
                    const x0 = x.invert(xCord[0]);
                    const i = bisectDate(data, x0, 1);
                    const d0 = data[i-1];
                    const d1 = data[i];
                    //console.log(d0, "+++", d1)
                    const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    const xPos = x(d.date);
                    const yPos = y(d[js]);
                    //console.log(xPos, "===", yPos)
                    circle.attr('cx', xPos).attr('cy', yPos).attr('r', 5);
                    if(divId == "leftpane"){
                        d3.select(`#tooltip_${index}`).style('top', `${yPos + div_height + 100}px`).style('left', `${xPos}px`).style('background-color', "lightblue").html(`Date : ${formatTime(d.date)}<br>Price : ${formatDecimal(d[js])}<br>Sym: ${js}`).style('opacity', 0.9).style('padding', '10px')
                        }
                        else{
                            d3.select(`#tooltip_${index}`).style('top', `${yPos + div_height + 100}px`).style('left', `${xPos + div_width}px`).style('background-color', "lightblue").html(`Date : ${formatTime(d.date)}<br>Price : ${formatDecimal(d[js])}<br>Sym: ${js}`).style('opacity', 0.9).style('padding', '10px')
                        }
                })
            }
        })
        
        //
    });
}
function getChartRF(reload, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index, divId){
    console.log("reload = ", reload)

    // Remove previous lines and x-axis ranges
    svg.select(`#linechart_${index}`).remove()
    //svg.select('#x-axis-a').remove()
    svg.select(`#x-axis-${index}`).remove()
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%e %b %Y")
    d3.csv(pane_a, function(d){
        //console.log(d)
        return {date : new Date(d.DATE), Actual : +d.Actual, Prediction : +d.Prediction}
    }).then(function(data){
        //console.log("data = ", data)
        con_data = []
        var json_keys = Object.keys(data[0])
        /*data.forEach(d => {
            d["DATE"] = parseTime(d["date"])
            con_data.push(d)
        })*/
        keys_wo_date = []
        json_keys.forEach(j => {
            if(j != "date"){
                keys_wo_date.push(j)
            }
        })
        d3.select('#select_rnn_a').selectAll('option').data(keys_wo_date).enter().append('option').attr('value', function(d){return d}).text(function(d){return d});
        d3.select('#select_rnn_b').selectAll('option').data(keys_wo_date).enter().append('option').attr('value', function(d){return d}).text(function(d){return d});
        // Normalized Data STARTS
        var NormalizedData = getNormalizedData(data, json_keys)
        //console.log("normalized data = ", NormalizedData)
        data = getNormalizedData(data, json_keys)
        // ENDS
        //data = con_data
        mindate = d3.min(data, function(d) { return d.date; })
        maxdate = d3.max(data, function(d) { return d.date; })
        /*if(reload == 1){
            document.getElementById(`fromdate_${index}`).value = parseTime(mindate)
            document.getElementById(`todate_${index}`).value = parseTime(maxdate)
        }
        // console.log("Date format = ", data)
        fromDate = new Date(document.getElementById(`fromdate_${index}`).value);
        console.log("From date = ", fromDate, "typeof = ", typeof(fromDate));
        toDate = new Date(document.getElementById(`todate_${index}`).value);
        console.log("To date = ", toDate, "typeof = ", typeof(fromDate));
        */
        

        console.log("Max date = ", maxdate, " min date = ", mindate, " typeof = ", typeof(mindate))

        //dmn = reload == 0 ? [fromDate, toDate] : [mindate, maxdate]
        var x = d3.scaleTime()
                    .domain([mindate, maxdate]) //d3.extent(data, function(d) { return d.date; })
                    .range([ margin.left, width ]);
        var x_axis = svg.append("g").attr('id', `x-axis-${index}`)
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));
        var xAxisLabel_a = x_axis.append("text").attr("id", `x_axis_label_${index}`).attr("x", (width/2)).attr("y",margin.bottom).text("Date").style("font-size", 14).attr("fill", "black")

        // Add Y axis
        /*minValA = d3.min(data, function(d) { return d[modelA]; })
        maxValA = d3.max(data, function(d) { return d[modelA]; })*/
        var minVal = 0;
        var maxVal = 0;
        var filter_keys = []
        /*if(reload == 1){  
            document.getElementById('select_rnn_b').value = "DTWEXBGS"  
            featA = "DPRIME"
            featB = "DTWEXBGS"
            filter_keys = [featA, featB, "SP500"]
        }
        else{
            console.log("rnnA = ", document.getElementById('select_rnn_a').value)
            featA = document.getElementById('select_rnn_a').value
            featB = document.getElementById('select_rnn_b').value
            filter_keys = [featA, featB, "SP500"]
        }*/
        json_keys.forEach(j => {
            if(j != "date"){
               minValA = d3.min(data, function(d) { return d[j] });
                maxValA = d3.max(data, function(d) { return d[j] });
                console.log("minValA = ", minValA, " maxValA = ", maxValA)
                if(minValA <= minVal){
                    minVal = minValA;
                }
                if(maxValA >= maxVal){
                    maxVal = maxValA;
                }
                console.log("min = ", minVal, " max = ", maxVal)
            }
        })
        /*minValA = d3.min(data, function(d) { return d.DPRIME });
        minValB = d3.min(data, function(d) { return d.DTWEXBGS });
        maxValA = d3.max(data, function(d) { return d.DPRIME });
        maxValB = d3.max(data, function(d) { return d.DTWEXBGS });
        minY = Math.min(minValA, minValB);
        maxY = Math.max(maxValA, maxValB)*/
        minY = minVal;
        maxY = maxVal;
        var y = d3.scaleLinear()
                    .domain([0, 1])
                    .range([ height, 0 ]);

        var y_axis = svg.append("g").attr("id", `y-axis-${index}`).attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y))  
    
        var yAxisLabel_a = y_axis.append("text").attr("id", `y_axis_label_${index}`).attr("transform", "rotate(-90)")
                  .attr("y", -margin.left-margin.top)
                  .attr("x",(-(height - 10*margin.top - margin.bottom )/2))
                  .attr("dy", "1em")
                  .style("text-anchor", "end").text("Actual vs Prediction")
                  .style("font-size", 14).attr("fill", "black")
        //
        //Right Y axis
        /*minValB = d3.min(data, function(d) { return d[modelB]; })
        maxValB = d3.max(data, function(d) { return d[modelB]; })
        var yB = d3.scaleLinear()
                    .domain([minValA, maxValA])
                    .range([ height, 0 ]);
        var y_axis = svg.append("g").attr("id", `y-axis-${index}_2`).attr("transform", `translate(${width}, ${0})`).call(d3.axisLeft(yB))  
    
        var yAxisLabel_a = y_axis.append("text").attr("id", `y_axis_label_${index}_2`).attr("transform", "rotate(-90)")
                  .attr("y", -margin.right/30)
                  .attr("x",-((height - margin.top - margin.bottom )/2))
                  .attr("dy", "1em")
                  .style("text-anchor", "end").text("Actual vs Prediction")
                  .style("font-size", 14).attr("fill", "black")
        */
        // Legend circle
        var circle_g = svg.append("g").attr("id", `legend_circle_${index}`)
        
        // Create linechart
        index_g = svg.append("g").attr("id", `linechart_${index}`)

        // Create linechart for each data
        var colorScheme = d3.scaleOrdinal(d3.schemeCategory10)
        
        console.log("json keys = ", json_keys, "====", data)
        //filteredData = data.filter(d => d.date >= fromDate && d.date <= toDate)
        //console.log("Filtered data = ", filteredData)
        i = 0
        if(divId == "leftpane"){
            document.getElementById('rmse_leftpane').innerHTML = "RMSE score = " + getRMSEScore(data);
        }
        else if(divId == "rightpane"){
            document.getElementById('rmse_rightpane').innerHTML = "RMSE score = " + getRMSEScore(data);
        }
        json_keys.forEach(js => {
            
            //console.log(js)
            if(js != "date"){
                index_g.append("path").attr('id', js+'_'+index)//.attr("class", function(d){return d3.select("#index").node().value})
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", function(d, j) { return colorScheme(i) })
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d[js]) })
                )
                
                // Create legend
                legend_circle = circle_g.selectAll(`circle_${index}_${js}`).data(data).enter().append('circle').attr('id', `circle_${index}_${js}`)
                                .attr('r', 5).attr('cx', div_width - margin.right).attr('cy', margin.top + (i + 1)*20)
                                .attr('fill', (d, j) => colorScheme(i))
                       
                legend_text = circle_g.selectAll(`legend_${index}_${js}`).data(data).enter().append('text').attr('id', `legend_${index}_${js}`)
                                        .attr('x', div_width - margin.right + 10).attr('y', margin.top + 3 + (i + 1)*20)
                                        .text((d, j) => js).attr('fill', (d, j) => colorScheme(i)).style('font-size', 12)
            }
            i += 1
        })
        //
        tooltip_circle = svg.append('g').attr('id', `tooltip-circle-${index}`)
        sd = svg.select(`#linechart_${index}`)//.selectAll('path')
        console.log("sd = ", sd)
        /*svg.select(`#linechart_${index}`).on('mouseover', function(d, i){
            di = sd.selectAll('path')
            console.log("di = ", index, "==", di)
            di.on('mouseover', function(e, j){
                console.log("e = ", j)
                if(index == "a"){
                    getTooltipA(json_keys[1 + j], e, x, y, formatTime, svg, index, tooltip_circle, div_height, div_width)
                }
                else if(index == "b"){
                    getTooltipB(json_keys[1 + j], e, x, y, formatTime, svg, index, tooltip_circle, div_height, div_width)
                }
            })
        })*/
        var circle = tooltip_circle.append('circle').attr('id', `circle_${index}`).attr('r', 0).attr('fill', 'red')
        console.log("Circle = ", circle)
        json_keys.forEach(js => {
            if(js.toUpperCase() != "DATE"){
                svg.select(`#${js}_${index}`).on('mousemove', function(event){
                    //console.log("mouseover = ", event)
                    const xCord = d3.mouse(this);
                    const bisectDate = d3.bisector(d => d.date).left;
                    const x0 = x.invert(xCord[0]);
                    const i = bisectDate(data, x0, 1);
                    const d0 = data[i-1];
                    const d1 = data[i];
                    //console.log(d0, "+++", d1)
                    const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    const xPos = x(d.date);
                    const yPos = y(d[js]);
                    //console.log(xPos, "===", yPos)
                    circle.attr('cx', xPos).attr('cy', yPos).attr('r', 5);
                    if(divId == "leftpane"){
                    d3.select(`#tooltip_${index}`).style('top', `${yPos + div_height + 100}px`).style('left', `${xPos}px`).style('background-color', "lightblue").html(`Date : ${formatTime(d.date)}<br>Price : ${formatDecimal(d[js])}<br>Sym: ${js}`).style('opacity', 0.9).style('padding', '10px')
                    }
                    else{
                        d3.select(`#tooltip_${index}`).style('top', `${yPos + div_height + 100}px`).style('left', `${xPos + div_width}px`).style('background-color', "lightblue").html(`Date : ${formatTime(d.date)}<br>Price : ${formatDecimal(d[js])}<br>Sym: ${js}`).style('opacity', 0.9).style('padding', '10px')
                    }
                })
            }
        })
        
        //
    });
}

function getChartRNN(reload, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index, divId){
    console.log("reload = ", reload)

    // Remove previous lines and x-axis ranges
    svg.select(`#linechart_${index}`).remove()
    //svg.select('#x-axis-a').remove()
    svg.select(`#x-axis-${index}`).remove()
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%e %b %Y")
    d3.csv(pane_a, function(d){
        //console.log(d)
        return {date : new Date(d.DATE), Actual : +d.Actual, Prediction : +d.Prediction}
    }).then(function(data){
        //console.log("data = ", data)
        con_data = []
        var json_keys = Object.keys(data[0])
        /*data.forEach(d => {
            d["DATE"] = parseTime(d["date"])
            con_data.push(d)
        })*/
        keys_wo_date = []
        json_keys.forEach(j => {
            if(j != "date"){
                keys_wo_date.push(j)
            }
        })
        d3.select('#select_rnn_a').selectAll('option').data(keys_wo_date).enter().append('option').attr('value', function(d){return d}).text(function(d){return d});
        d3.select('#select_rnn_b').selectAll('option').data(keys_wo_date).enter().append('option').attr('value', function(d){return d}).text(function(d){return d});
        // Normalized Data STARTS
        var NormalizedData = getNormalizedData(data, json_keys)
        //console.log("normalized data = ", NormalizedData)
        data = getNormalizedData(data, json_keys)
        // ENDS
        //data = con_data
        mindate = d3.min(data, function(d) { return d.date; })
        maxdate = d3.max(data, function(d) { return d.date; })
        /*if(reload == 1){
            document.getElementById(`fromdate_${index}`).value = parseTime(mindate)
            document.getElementById(`todate_${index}`).value = parseTime(maxdate)
        }
        // console.log("Date format = ", data)
        fromDate = new Date(document.getElementById(`fromdate_${index}`).value);
        console.log("From date = ", fromDate, "typeof = ", typeof(fromDate));
        toDate = new Date(document.getElementById(`todate_${index}`).value);
        console.log("To date = ", toDate, "typeof = ", typeof(fromDate));
        */
        

        console.log("Max date = ", maxdate, " min date = ", mindate, " typeof = ", typeof(mindate))

        //dmn = reload == 0 ? [fromDate, toDate] : [mindate, maxdate]
        var x = d3.scaleTime()
                    .domain([mindate, maxdate]) //d3.extent(data, function(d) { return d.date; })
                    .range([ margin.left, width ]);
        var x_axis = svg.append("g").attr('id', `x-axis-${index}`)
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));
        var xAxisLabel_a = x_axis.append("text").attr("id", `x_axis_label_${index}`).attr("x", (width/2)).attr("y",margin.bottom).text("Date").style("font-size", 14).attr("fill", "black")

        // Add Y axis
        /*minValA = d3.min(data, function(d) { return d[modelA]; })
        maxValA = d3.max(data, function(d) { return d[modelA]; })*/
        var minVal = 0;
        var maxVal = 0;
        var filter_keys = []
        /*if(reload == 1){  
            document.getElementById('select_rnn_b').value = "DTWEXBGS"  
            featA = "DPRIME"
            featB = "DTWEXBGS"
            filter_keys = [featA, featB, "SP500"]
        }
        else{
            console.log("rnnA = ", document.getElementById('select_rnn_a').value)
            featA = document.getElementById('select_rnn_a').value
            featB = document.getElementById('select_rnn_b').value
            filter_keys = [featA, featB, "SP500"]
        }*/
        json_keys.forEach(j => {
            if(j != "date"){
               minValA = d3.min(data, function(d) { return d[j] });
                maxValA = d3.max(data, function(d) { return d[j] });
                console.log("minValA = ", minValA, " maxValA = ", maxValA)
                if(minValA <= minVal){
                    minVal = minValA;
                }
                if(maxValA >= maxVal){
                    maxVal = maxValA;
                }
                console.log("min = ", minVal, " max = ", maxVal)
            }
        })
        /*minValA = d3.min(data, function(d) { return d.DPRIME });
        minValB = d3.min(data, function(d) { return d.DTWEXBGS });
        maxValA = d3.max(data, function(d) { return d.DPRIME });
        maxValB = d3.max(data, function(d) { return d.DTWEXBGS });
        minY = Math.min(minValA, minValB);
        maxY = Math.max(maxValA, maxValB)*/
        minY = minVal;
        maxY = maxVal;
        var y = d3.scaleLinear()
                    .domain([0, 1])
                    .range([ height, 0 ]);

        var y_axis = svg.append("g").attr("id", `y-axis-${index}`).attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y))  
    
        var yAxisLabel_a = y_axis.append("text").attr("id", `y_axis_label_${index}`).attr("transform", "rotate(-90)")
                  .attr("y", -margin.left-margin.top)
                  .attr("x",(-(height - 10*margin.top - margin.bottom )/2))
                  .attr("dy", "1em")
                  .style("text-anchor", "end").text("Actual vs Prediction")
                  .style("font-size", 14).attr("fill", "black")
        //
        //Right Y axis
        /*minValB = d3.min(data, function(d) { return d[modelB]; })
        maxValB = d3.max(data, function(d) { return d[modelB]; })
        var yB = d3.scaleLinear()
                    .domain([minValA, maxValA])
                    .range([ height, 0 ]);
        var y_axis = svg.append("g").attr("id", `y-axis-${index}_2`).attr("transform", `translate(${width}, ${0})`).call(d3.axisLeft(yB))  
    
        var yAxisLabel_a = y_axis.append("text").attr("id", `y_axis_label_${index}_2`).attr("transform", "rotate(-90)")
                  .attr("y", -margin.right/30)
                  .attr("x",-((height - margin.top - margin.bottom )/2))
                  .attr("dy", "1em")
                  .style("text-anchor", "end").text("Actual vs Prediction")
                  .style("font-size", 14).attr("fill", "black")
        */
        // Legend circle
        var circle_g = svg.append("g").attr("id", `legend_circle_${index}`)
        
        // Create linechart
        index_g = svg.append("g").attr("id", `linechart_${index}`)

        // Create linechart for each data
        var colorScheme = d3.scaleOrdinal(d3.schemeCategory10)
        
        console.log("json keys = ", json_keys, "====", data)
        //filteredData = data.filter(d => d.date >= fromDate && d.date <= toDate)
        //console.log("Filtered data = ", filteredData)
        i = 0
        if(divId == "leftpane"){
            document.getElementById('rmse_leftpane').innerHTML = "RMSE score = " + getRMSEScore(data);
        }
        else if(divId == "rightpane"){
            document.getElementById('rmse_rightpane').innerHTML = "RMSE score = " + getRMSEScore(data);
        }
        json_keys.forEach(js => {
            
            //console.log(js)
            if(js != "date"){
                index_g.append("path").attr('id', js+'_'+index)//.attr("class", function(d){return d3.select("#index").node().value})
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", function(d, j) { return colorScheme(i) })
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d[js]) })
                )
                
                // Create legend
                legend_circle = circle_g.selectAll(`circle_${index}_${js}`).data(data).enter().append('circle').attr('id', `circle_${index}_${js}`)
                                .attr('r', 5).attr('cx', div_width - margin.right).attr('cy', margin.top + (i + 1)*20)
                                .attr('fill', (d, j) => colorScheme(i))
                       
                legend_text = circle_g.selectAll(`legend_${index}_${js}`).data(data).enter().append('text').attr('id', `legend_${index}_${js}`)
                                        .attr('x', div_width - margin.right + 10).attr('y', margin.top + 3 + (i + 1)*20)
                                        .text((d, j) => js).attr('fill', (d, j) => colorScheme(i)).style('font-size', 12)
            }
            i += 1
        })
        //
        tooltip_circle = svg.append('g').attr('id', `tooltip-circle-${index}`)
        sd = svg.select(`#linechart_${index}`)//.selectAll('path')
        console.log("sd = ", sd)
        /*svg.select(`#linechart_${index}`).on('mouseover', function(d, i){
            di = sd.selectAll('path')
            console.log("di = ", index, "==", di)
            di.on('mouseover', function(e, j){
                console.log("e = ", j)
                if(index == "a"){
                    getTooltipA(json_keys[1 + j], e, x, y, formatTime, svg, index, tooltip_circle, div_height, div_width)
                }
                else if(index == "b"){
                    getTooltipB(json_keys[1 + j], e, x, y, formatTime, svg, index, tooltip_circle, div_height, div_width)
                }
            })
        })*/
        var circle = tooltip_circle.append('circle').attr('id', `circle_${index}`).attr('r', 0).attr('fill', 'red')
        console.log("Circle = ", circle)
        json_keys.forEach(js => {
            if(js.toUpperCase() != "DATE"){
                svg.select(`#${js}_${index}`).on('mousemove', function(event){
                    //console.log("mouseover = ", event)
                    const xCord = d3.mouse(this);
                    const bisectDate = d3.bisector(d => d.date).left;
                    const x0 = x.invert(xCord[0]);
                    const i = bisectDate(data, x0, 1);
                    const d0 = data[i-1];
                    const d1 = data[i];
                    //console.log(d0, "+++", d1)
                    const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    const xPos = x(d.date);
                    const yPos = y(d[js]);
                    //console.log(xPos, "===", yPos)
                    circle.attr('cx', xPos).attr('cy', yPos).attr('r', 5);
                    if(divId == "leftpane"){
                        d3.select(`#tooltip_${index}`).style('top', `${yPos + div_height + 100}px`).style('left', `${xPos}px`).style('background-color', "lightblue").html(`Date : ${formatTime(d.date)}<br>Price : ${formatDecimal(d[js])}<br>Sym: ${js}`).style('opacity', 0.9).style('padding', '10px')
                    }
                    else{
                        d3.select(`#tooltip_${index}`).style('top', `${yPos + div_height + 100}px`).style('left', `${xPos + div_width}px`).style('background-color', "lightblue").html(`Date : ${formatTime(d.date)}<br>Price : ${formatDecimal(d[js])}<br>Sym: ${js}`).style('opacity', 0.9).style('padding', '10px')
                    }
                })
            }
        })
        
        //
    });
}
function getNormalizedData(dataset, keys){
    
    //keys.shift()
    console.log("norm = ", dataset, " keys = ", keys)
    keys.forEach(k => {
        if(k.toLowerCase() != "date"){
            minValA = d3.min(dataset, function(dd) { return dd[k] });
            maxValA = d3.max(dataset, function(dd) { return dd[k] });
            dataset.forEach(d => {
                //console.log("dd = ", d[k], " = ", k)
                d[k] = (d[k] - minValA) / (maxValA - minValA)
            })
        }
    })
    
    return dataset
}

function getRMSEScore(data){
    var sum = 0;
    data.forEach(d => {
        sum += d['Prediction'] - d['Actual']
    })
    console.log("Sum = ", sum);

    var mse = sum / data.length
    console.log("MSE = ", mse)

    var rmse = Math.sqrt(Math.abs(mse))
    console.log("RMSE = ", rmse);

    return rmse.toFixed(2);
}

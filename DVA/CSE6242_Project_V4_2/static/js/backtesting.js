function createCharts(btnClick, divId, chartDivId, index, data, url){
    console.log("index = ", index)
    d3.select(`#${chartDivId}`).selectAll("*").remove();
    var div_height = document.getElementById(divId).offsetHeight    //d3.select('#leftpane').attr('width')
    var div_width = document.getElementById(divId).offsetWidth    //d3.select('#leftpane').attr('width')
    console.log("div_width = ", div_width)
    var margin = {top: 10, right: 120, bottom: 30, left: 30}, width = div_width - margin.left - margin.right, height = div_height - margin.top - margin.bottom;
    var svg = d3.select(`#${chartDivId}`).append("svg").attr('width', div_width).attr('height', div_height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    pane_a = "../static/stockjson.json"
    var tooltip = d3.tip().attr("id", `tooltip_${index}`)
    svg.call(tooltip)
    /*if(divId == "leftpane"){
        //pane_a = "../static/bivariate_GBM.csv"
        pane_a = "../static/bivariate_GBM.csv"
        getChartGBM(btnClick, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index);
    }
    else if(divId == "rightpane"){
        //pane_a = "../static/stockjson.json"d.
        pane_a = "../static/sp500_with_features.csv"
        getChartSPX(btnClick, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index);
        //getChartJson(btnClick, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index);
    }*/
    getChartJson(btnClick, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index, url);
    //console.log(d3)
    //var tooltip = d3.tip().attr("id", "tooltip")
}
function getChartJson(reload, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index, url){
    console.log("reload = ", reload)

    // Remove previous lines and x-axis ranges
    /*svg.select(`#linechart_${index}`).remove()
    //svg.select('#x-axis-a').remove()
    svg.select(`#x-axis-${index}`).remove()
    */
    fetch(url, {
        method: "POST",
        headers : { "Content-Type": "application/json" },
        body : JSON.stringify(data)
    }).then(response => response.json())
    .then(function(data){
        var parseTime = d3.timeParse("%Y-%m-%d")
        var formatTime = d3.timeFormat("%e %b %Y")
        con_data = []
        dataA = data[0]
        dataB = data[1]
        dataA.forEach(d => {
            d["DATE"] = parseTime(d["DATE"])
            //con_data.push(d)
        })
        //data = con_data
        console.log("Condata = ", dataA)
        mindate = d3.min(dataA, function(d) { return d.DATE; })
        maxdate = d3.max(dataA, function(d) { return d.DATE; })
        console.log("mindate = ", mindate, " maxdate = ", maxdate)
        /*if(reload == 1){
            document.getElementById(`fromdate_${index}`).value = parseTime(mindate)
            document.getElementById(`todate_${index}`).value = parseTime(maxdate)
        }
        console.log("Date format = ", data)
        fromDate = new Date(document.getElementById(`fromdate_${index}`).value);
        console.log("From date = ", fromDate, "typeof = ", typeof(fromDate));
        toDate = new Date(document.getElementById(`todate_${index}`).value);
        console.log("To date = ", toDate, "typeof = ", typeof(fromDate));
        
        

        console.log("Max date = ", maxdate, " min date = ", mindate, " typeof = ", typeof(mindate))
        */
        //dmn = reload == 0 ? [fromDate, toDate] : [mindate, maxdate]
        var x = d3.scaleTime()
                    .domain([mindate, maxdate]) //d3.extent(data, function(d) { return d.date; })
                    .range([ margin.left, width ]);
        var x_axis = svg.append("g").attr('id', `x-axis-${index}`)
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));
        var xAxisLabel_a = x_axis.append("text").attr("id", `x_axis_label_${index}`).attr("x", (width/2)).attr("y",margin.bottom).text("Date").style("font-size", 14).attr("fill", "black")

        // Add Y axis
        var json_keys = Object.keys(dataA[0])
        console.log("data = ", json_keys)
        normalizedData = getNormalizedData(dataA, json_keys)
        var y = d3.scaleLinear()
                    .domain([0, 1])
                    .range([ height, 0 ]);

        var y_axis = svg.append("g").attr("id", `y-axis-${index}`).attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y))  
    
        var yAxisLabel_a = y_axis.append("text").attr("id", `y_axis_label_${index}`).attr("transform", "rotate(-90)")
                  .attr("y", -margin.left-margin.top)
                  .attr("x",(-(height - margin.top - margin.bottom )/2))
                  .attr("dy", "1em")
                  .style("text-anchor", "end").text("Index price")
                  .style("font-size", 14).attr("fill", "black")

        // Legend circle
        var circle_g = svg.append("g").attr("id", `legend_circle_${index}`)
        
        // Create linechart
        index_g = svg.append("g").attr("id", `linechart_${index}`)

        // Create linechart for each data
        var colorScheme = d3.scaleOrdinal(d3.schemeCategory10)
        
        //filteredData = data.filter(d => d.DATE >= fromDate && d.DATE <= toDate)
        //console.log("Filtered data = ", filteredData)
        i = 0
        json_keys.forEach(js => {
            
            //console.log(js)
            if(js != "DATE"){
                index_g.append("path").attr('id', js+'_'+index)//.attr("class", function(d){return d3.select("#index").node().value})
                .datum(dataA)
                .attr("fill", "none")
                .attr("stroke", function(d, j) { return colorScheme(i) })
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d.DATE) })
                .y(function(d) { return y(d[js]) })
                )
                
                // Create legend
                legend_circle = circle_g.selectAll('circle_'+js).data(dataA).enter().append('circle').attr('id', `circle_${index}_`+js)
                                .attr('r', 5).attr('cx', div_width - margin.right).attr('cy', margin.top + (i + 1)*20)
                                .attr('fill', (d, j) => colorScheme(i))
                       
                legend_text = circle_g.selectAll('legend_'+js).data(dataA).enter().append('text').attr('id', `legend_${index}`+js)
                                        .attr('x', div_width - margin.right + 10).attr('y', margin.top + 3 + (i + 1)*20)
                                        .text((d, j) => js).attr('fill', (d, j) => colorScheme(i)).style('font-size', 12)
            }
            i += 1
        })
        //
        tooltip_circle = svg.append('g').attr('id', `tooltip-circle-${index}`)
        sd = svg.select(`#linechart_${index}`)//.selectAll('path')
        console.log("sd = ", sd)
        sd.on('mouseover', function(d, i){
            di = sd.selectAll('path')
            di.on('mouseover', function(e, j){
                console.log("e = ", j)
                getTooltip(json_keys[1 + j], e, x, y, formatTime, svg, index, tooltip_circle)
            })
        })
        
        
    });

}
function getChartGBM(reload, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index){
    console.log("reload = ", reload)

    // Remove previous lines and x-axis ranges
    svg.select(`#linechart_${index}`).remove()
    //svg.select('#x-axis-a').remove()
    svg.select(`#x-axis-${index}`).remove()
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%e %b %Y")
    d3.csv(pane_a, function(d){
        return {date : parseTime(d.DATE), svd0 : +d.SVD_0, svd1 : +d.SVD_1}
    }).then(function(data){
        console.log("data = ", data)
        con_data = []
        /*data.forEach(d => {
            d["DATE"] = parseTime(d["date"])
            con_data.push(d)
        })*/
        
        //data = con_data
        mindate = d3.min(data, function(d) { return d.date; })
        maxdate = d3.max(data, function(d) { return d.date; })
        if(reload == 1){
            document.getElementById(`fromdate_${index}`).value = parseTime(mindate)
            document.getElementById(`todate_${index}`).value = parseTime(maxdate)
        }
        console.log("Date format = ", data)
        fromDate = new Date(document.getElementById(`fromdate_${index}`).value);
        console.log("From date = ", fromDate, "typeof = ", typeof(fromDate));
        toDate = new Date(document.getElementById(`todate_${index}`).value);
        console.log("To date = ", toDate, "typeof = ", typeof(fromDate));

        

        console.log("Max date = ", maxdate, " min date = ", mindate, " typeof = ", typeof(mindate))

        dmn = reload == 0 ? [fromDate, toDate] : [mindate, maxdate]
        var x = d3.scaleTime()
                    .domain(dmn) //d3.extent(data, function(d) { return d.date; })
                    .range([ margin.left, width ]);
        var x_axis = svg.append("g").attr('id', `x-axis-${index}`)
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));
        var xAxisLabel_a = x_axis.append("text").attr("id", `x_axis_label_${index}`).attr("x", (width/2)).attr("y",margin.bottom).text("Date").style("font-size", 14).attr("fill", "black")

        // Add Y axis
        /*minValA = d3.min(data, function(d) { return d[modelA]; })
        maxValA = d3.max(data, function(d) { return d[modelA]; })*/
        minValA = d3.min(data, function(d) { return d.svd0 });
        minValB = d3.min(data, function(d) { return d.svd1 });
        maxValA = d3.max(data, function(d) { return d.svd0 });
        maxValB = d3.max(data, function(d) { return d.svd1 });
        minY = Math.min(minValA, minValB);
        maxY = Math.max(maxValA, maxValB)
        var y = d3.scaleLinear()
                    .domain([minY, maxY])
                    .range([ height, 0 ]);

        var y_axis = svg.append("g").attr("id", `y-axis-${index}`).attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y))  
    
        var yAxisLabel_a = y_axis.append("text").attr("id", `y_axis_label_${index}`).attr("transform", "rotate(-90)")
                  .attr("y", -margin.left-margin.top)
                  .attr("x",(-(height - margin.top - margin.bottom )/2))
                  .attr("dy", "1em")
                  .style("text-anchor", "end").text("Feature value")
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
                  .style("text-anchor", "end").text("Index price")
                  .style("font-size", 14).attr("fill", "black")
        */
        // Legend circle
        var circle_g = svg.append("g").attr("id", `legend_circle_${index}`)
        
        // Create linechart
        index_g = svg.append("g").attr("id", `linechart_${index}`)

        // Create linechart for each data
        var colorScheme = d3.scaleOrdinal(d3.schemeCategory10)
        var json_keys = Object.keys(data[0])
        console.log("json keys = ", json_keys)
        filteredData = data.filter(d => d.date >= fromDate && d.date <= toDate)
        console.log("Filtered data = ", filteredData)
        i = 0
        json_keys.forEach(js => {
            
            //console.log(js)
            if(js != "date"){
                index_g.append("path").attr('id', js+'_'+index)//.attr("class", function(d){return d3.select("#index").node().value})
                .datum(reload == 1 ? data : filteredData)
                .attr("fill", "none")
                .attr("stroke", function(d, j) { return colorScheme(i) })
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d[js]) })
                )
                
                // Create legend
                legend_circle = circle_g.selectAll('circle_'+js).data(data).enter().append('circle').attr('id', `circle_${index}_`+js)
                                .attr('r', 5).attr('cx', div_width - margin.right).attr('cy', margin.top + (i + 1)*20)
                                .attr('fill', (d, j) => colorScheme(i))
                       
                legend_text = circle_g.selectAll('legend_'+js).data(data).enter().append('text').attr('id', `legend_${index}`+js)
                                        .attr('x', div_width - margin.right + 10).attr('y', margin.top + 3 + (i + 1)*20)
                                        .text((d, j) => js).attr('fill', (d, j) => colorScheme(i)).style('font-size', 12)
            }
            i += 1
        })
        //
        tooltip_circle = svg.append('g').attr('id', `tooltip-circle-${index}`)
        sd = svg.select(`#linechart_${index}`)//.selectAll('path')
        console.log("sd = ", sd)
        sd.on('mouseover', function(d, i){
            di = sd.selectAll('path')
            di.on('mouseover', function(e, j){
                console.log("e = ", j)
                getTooltip(json_keys[1 + j], e, x, y, formatTime, svg, index, tooltip_circle)
            })
        })
        
        //
    });
}
function getChartSPX(reload, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index){
    console.log("reload = ", reload)

    // Remove previous lines and x-axis ranges
    svg.select(`#linechart_${index}`).remove()
    //svg.select('#x-axis-a').remove()
    svg.select(`#x-axis-${index}`).remove()
    var parseTime = d3.timeParse("%Y-%m-%d")
    var formatTime = d3.timeFormat("%e %b %Y")
    d3.csv(pane_a, function(d){
        console.log(d)
        return {date : new Date(d.DATE), DPRIME : +d.DPRIME, DTWEXBGS : +d.DTWEXBGS, GVZCLS : +d.GVZCLS, HQMCB10YRP : +d.HQMCB10YRP, HQMCB10YR : +d.HQMCB10YR, OVXCLS : +d.OVXCLS, STLFSI4 : +d.STLFSI4, T5YIE : +d.T5YIE, T10Y2Y : +d.T10Y2Y, TB3MS : +d.TB3MS, AAA : +d.AAA, DEXUSEU : +d.DEXUSEU, SP500 : +d.SP500}
    }).then(function(data){
        console.log("data = ", data)
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
        console.log("normalized data = ", NormalizedData)
        data = getNormalizedData(data, json_keys)
        // ENDS
        //data = con_data
        mindate = d3.min(data, function(d) { return d.date; })
        maxdate = d3.max(data, function(d) { return d.date; })
        if(reload == 1){
            document.getElementById(`fromdate_${index}`).value = parseTime(mindate)
            document.getElementById(`todate_${index}`).value = parseTime(maxdate)
        }
        console.log("Date format = ", data)
        fromDate = new Date(document.getElementById(`fromdate_${index}`).value);
        console.log("From date = ", fromDate, "typeof = ", typeof(fromDate));
        toDate = new Date(document.getElementById(`todate_${index}`).value);
        console.log("To date = ", toDate, "typeof = ", typeof(fromDate));

        

        console.log("Max date = ", maxdate, " min date = ", mindate, " typeof = ", typeof(mindate))

        dmn = reload == 0 ? [fromDate, toDate] : [mindate, maxdate]
        var x = d3.scaleTime()
                    .domain(dmn) //d3.extent(data, function(d) { return d.date; })
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
        if(reload == 1){
            filter_keys = json_keys
        }
        else{
            console.log("rnnA = ", document.getElementById('select_rnn_a').value)
            featA = document.getElementById('select_rnn_a').value
            featB = document.getElementById('select_rnn_b').value
            filter_keys = [featA, featB]
        }
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
        normalizedData = getNormalizedData(dataA)
        
        var y = d3.scaleLinear()
                    .domain([minY, maxY])
                    .range([ height, 0 ]);

        var y_axis = svg.append("g").attr("id", `y-axis-${index}`).attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y))  
    
        var yAxisLabel_a = y_axis.append("text").attr("id", `y_axis_label_${index}`).attr("transform", "rotate(-90)")
                  .attr("y", -margin.left-margin.top)
                  .attr("x",(-(height - margin.top - margin.bottom )/2))
                  .attr("dy", "1em")
                  .style("text-anchor", "end").text("Index price")
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
                  .style("text-anchor", "end").text("Index price")
                  .style("font-size", 14).attr("fill", "black")
        */
        // Legend circle
        var circle_g = svg.append("g").attr("id", `legend_circle_${index}`)
        
        // Create linechart
        index_g = svg.append("g").attr("id", `linechart_${index}`)

        // Create linechart for each data
        var colorScheme = d3.scaleOrdinal(d3.schemeCategory10)
        
        console.log("json keys = ", json_keys)
        filteredData = data.filter(d => d.date >= fromDate && d.date <= toDate)
        console.log("Filtered data = ", filteredData)
        i = 0
        filter_keys.forEach(js => {
            
            //console.log(js)
            if(js != "date"){
                index_g.append("path").attr('id', js+'_'+index)//.attr("class", function(d){return d3.select("#index").node().value})
                .datum(reload == 1 ? data : filteredData)
                .attr("fill", "none")
                .attr("stroke", function(d, j) { return colorScheme(i) })
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d[js]) })
                )
                
                // Create legend
                legend_circle = circle_g.selectAll('circle_'+js).data(data).enter().append('circle').attr('id', `circle_${index}_`+js)
                                .attr('r', 5).attr('cx', div_width - margin.right).attr('cy', margin.top + (i + 1)*20)
                                .attr('fill', (d, j) => colorScheme(i))
                       
                legend_text = circle_g.selectAll('legend_'+js).data(data).enter().append('text').attr('id', `legend_${index}`+js)
                                        .attr('x', div_width - margin.right + 10).attr('y', margin.top + 3 + (i + 1)*20)
                                        .text((d, j) => js).attr('fill', (d, j) => colorScheme(i)).style('font-size', 12)
            }
            i += 1
        })
        //
        tooltip_circle = svg.append('g').attr('id', `tooltip-circle-${index}`)
        sd = svg.select(`#linechart_${index}`)//.selectAll('path')
        console.log("sd = ", sd)
        sd.on('mouseover', function(d, i){
            di = sd.selectAll('path')
            di.on('mouseover', function(e, j){
                console.log("e = ", j)
                getTooltip(json_keys[1 + j], e, x, y, formatTime, svg, index, tooltip_circle)
            })
        })
        
        //
    });
}
function getTooltip(js, data, x, y, formatTime, svg, index, tooltip_circle){
            console.log("tooltip circle = ", tooltip_circle)
            tooltip_circle.selectAll('circle').remove()
            circle = tooltip_circle.append('circle').attr('id', `#circle_${index}`).attr('r', 0).attr('fill', 'red').style('opacity', 0.7)
            
            //listeningRect = svg.append('rect').attr('width', width).attr('height', height).style('opacity', 0)
            listeningRect = svg.select(`#${js}_${index}`)
            svg.select(`#${js}_${index}`).on('mousemove', function(event){
                    //circle.remove();
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
                    d3.select(`#tooltip_${index}`).style('top', `${yPos}px`).style('left', `${xPos+10}px`).style('background-color', "lightblue").html(`Date : ${formatTime(d.date)}<br>Price : ${d[js]}<br>Sym: ${js}`).style('opacity', 0.9)
            })
            listeningRect.on('mouseout', function(event){
                console.log("mouseout")
            })
}
function getNormalizedData(dataset, keys){
    
    //keys.shift()
    console.log("norm = ", dataset, " keys = ", keys)
    keys.forEach(k => {
        if(k != "DATE"){
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

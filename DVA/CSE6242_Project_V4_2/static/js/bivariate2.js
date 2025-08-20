function createCharts(btnClick, divId, chartDivId, index){
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
    if(divId == "leftpane"){
        pane_a = "../static/stockjson.json"
    }
    else if(divId == "rightpane"){
        pane_a = "../static/stockjson.json"
    }
    console.log(d3)
    //var tooltip = d3.tip().attr("id", "tooltip")
    var tooltip = d3.tip().attr("id", `tooltip_${index}`)
    svg.call(tooltip)
    
    getCharts(btnClick, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index);
}
function getCharts(reload, div_height, div_width, margin, svg, pane_a, tooltip, width, height, index){
    console.log("reload = ", reload)

    // Remove previous lines and x-axis ranges
    svg.select(`#linechart_${index}`).remove()
    //svg.select('#x-axis-a').remove()
    svg.select(`#x-axis-${index}`).remove()

    d3.json(pane_a, function(d){

    }).then(function(data){
        var parseTime = d3.timeParse("%Y-%m-%d")
        var formatTime = d3.timeFormat("%e %b %Y")
        con_data = []
        data.forEach(d => {
            d["DATE"] = parseTime(d["DATE"])
            con_data.push(d)
        })
        data = con_data
        mindate = d3.min(data, function(d) { return d.DATE; })
        maxdate = d3.max(data, function(d) { return d.DATE; })
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
        var json_keys = Object.keys(data[0])
        console.log("data = ", data)
        filteredData = data.filter(d => d.DATE >= fromDate && d.DATE <= toDate)
        console.log("Filtered data = ", filteredData)
        i = 0
        json_keys.forEach(js => {
            
            //console.log(js)
            if(js != "DATE"){
                index_g.append("path").attr('id', js+'_'+index)//.attr("class", function(d){return d3.select("#index").node().value})
                .datum(reload == 1 ? data : filteredData)
                .attr("fill", "none")
                .attr("stroke", function(d, j) { return colorScheme(i) })
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d.DATE) })
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
                    const bisectDate = d3.bisector(d => d.DATE).left;
                    const x0 = x.invert(xCord[0]);
                    const i = bisectDate(data, x0, 1);
                    const d0 = data[i-1];
                    const d1 = data[i];
                    //console.log(d0, "+++", d1)
                    const d = x0 - d0.DATE > d1.DATE - x0 ? d1 : d0;
                    const xPos = x(d.DATE);
                    const yPos = y(d[js]);
                    //console.log(xPos, "===", yPos)
                    circle.attr('cx', xPos).attr('cy', yPos).attr('r', 5);
                    d3.select(`#tooltip_${index}`).style('top', `${yPos}px`).style('left', `${xPos+10}px`).style('background-color', "lightblue").html(`Date : ${formatTime(d.DATE)}<br>Price : ${d[js]}<br>Sym: ${js}`).style('opacity', 0.9)
            })
            listeningRect.on('mouseout', function(event){
                console.log("mouseout")
            })
}

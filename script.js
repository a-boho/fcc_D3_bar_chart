let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
let req = new XMLHttpRequest()

let data
let values

let heightScale
let xScale
let xAxisScale
let yAxisScale

// set the size of the canvas
let width = 800
let height = 600
// set padding for the edges of the canvas
let padding = 40

// set the svg variable to the canvas by selecting the first svg element
let svg = d3.select('svg')

let drawCanvas = () => {
    // call the attribute method of the canvas to set the size of the chart
    svg.attr('width', width)
    svg.attr('height', height)
}

let generateScales = () => {
    heightScale = d3.scaleLinear()
                    // To set the range of the scale from zero to the max GDP
                    .domain([0,d3.max(values, (item) => {
                        // item[1] is the index of the GDP value in the data array
                        return item[1]
                    })])
                    // Set the size of the bars from zero to max SVG size minus padding
                    .range([0, height - (2 * padding)])

    xScale = d3.scaleLinear()
               // Set the size of the X bars from zero to the length of the values(from data) - 1
               .domain([0, values.length - 1])
               // Set the range of the X bars from the left side (padding) to the right side (width - padding)
               .range([padding, width - padding])
    
    // Create a new array, select the date from data (item[0]), convert it to a numeric date, & put it (map) in the array (datesArray)
    let datesArray = values.map((item) => {
        return new Date(item[0])
    })

    // console.log(datesArray)

    xAxisScale = d3.scaleTime()
                   // Set the scale from the earliest date (.min(datesArray)) to the oldest date (.max(datesArray))
                   .domain([d3.min(datesArray), d3.max(datesArray)])
                   // Same as the xScale range
                   .range([padding, width - padding])

    yAxisScale = d3.scaleLinear()
                   // Set the domain of the scale from 0 to the highest GDP value (item[1])
                   .domain([0, d3.max(values, (item) => {
                        return item[1]
                   })])
                   // Range starts from the top of the chart, not the bottom, thus the inputs are reversed
                   .range([height - padding, padding])
}

let drawBars = () => {

    // create a tooltip outside of the chart
    let tooltip = d3.select('body')
                    // add a div to the bottom of the chart
                    .append('div')
                    // add the 'id' attribute of 'tooltip' to the div
                    .attr('id', 'tooltip')
                    // set the visibility to 'hidden' using a CSS property
                    .style('visibility', 'hidden')
                    // set the width and height to auto resizing using CSS (this is not using d3 because it is outside the svg chart area)
                    .style('width', 'auto')
                    .style('height', 'auto')

    // select all of the rectangles in the svg element
    svg.selectAll('rect')
       // call the data method and bind the values to the data array
       .data(values)
       // call the enter method to add the values that are not in the array
       .enter()
       // create a new rectangle for all of the array items
       .append('rect')
       // set the class of the rectangles to 'bar'
       .attr('class', 'bar')
       // set the attribute 'width' to an equal width 
       .attr('width', (width - (2 * padding)) / values.length)
       // set the attribute 'data-date' to the date (item[0])
       .attr('data-date', (item) => {
            return item[0]
       })
       // set the attribute 'data-gdp' to the GDP (item[1])
       .attr('data-gdp', (item) => {
            return item[1]
       })
       // set the attribute 'height' of the bars to the GDP value
       .attr('height', (item) => {
            // call the heightScale function and pass in the GDP value (item[1])
            return heightScale(item[1])
       })
       // set the bars in the correct X area
       .attr('x', (item, index) => {
            // call the xScale function and pass in the index value
            return xScale(index)
       })
       // set the attribute 'y' for the bars
       .attr('y', (item) => {
            // push the bars down by (height - padding) and then push the bars up by the GDP value (heightScale(item[1]))
            return (height - padding) - heightScale(item[1])
       })
       // use the .on method to assign event listener 'mouseover'
       .on('mouseover', (event, item) => {
            // call a transition on the tooltip item to change the style properties
            tooltip.transition()
                   // use the style method to change the visibility
                   .style('visibility', 'visible')
            // set the tooltip div text to the date corresponding to the bar that the cursor is on
            tooltip.text(item[0])

            // use plain JS to select the tooltip and set the attribute 'data-date' to the date (item[0])
            document.querySelector('#tooltip').setAttribute('data-date', item[0])
       })
       // clear the text when the mouse moves off of the bars
       .on('mouseout', (event, item) => {
            tooltip.transition()
                   .style('visibility', 'hidden')
       })
}

let generateAxes = () => {
    
    // create the xAxis and use the d3.axisBottom method to set it to the xAxisScale variable
    let xAxis = d3.axisBottom(xAxisScale)

    // create the yAxis and use the d3.axisLeft method to set it to the yAxisScale variable
    let yAxis = d3.axisLeft(yAxisScale)

    // generate the 'g' element to the svg element
    svg.append('g')
       // draw the xAxis within the 'g' element
       .call(xAxis)
       // set the attribute of the 'id' to 'x-axis'
       .attr('id', 'x-axis')
       // move the x-axis to the correct Y position by using the transform attribute to translate the axis
       .attr('transform', 'translate(0, ' + (height - padding) + ')')

    // repeat the above steps to display the yAxis
    svg.append('g')
       .call(yAxis)
       .attr('id', 'y-axis')
       // translate the axis by (padding, 0)
       .attr('transform', 'translate(' + padding + ', 0)')

}

// open the HTTP request
// 1st argument is the method 'GET' 
// 2nd argument is the URL of the resource 'url' 
// 3rd argument is asynchronous 'true'
req.open('GET', url, true)
// set the onload function to run once the data is obtained
req.onload = () => {
    // set the data variable, use JSON.parse to convert the data to an object
    data = JSON.parse(req.responseText)
    // set the values variable to the data from the object array (data.data)
    values = data.data
    // console.log(values)

    // run the functions to draw the chart in the order that they are intended
    drawCanvas()
    generateScales()
    drawBars()
    generateAxes()
}
// send the data off
req.send()
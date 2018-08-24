//array for all data
var masterData = [];
var statesData = [];
var mapData = [];
var plotlyData = [];


function buildMetadata(sample) {



  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  // Use d3 to select the panel with id of `#sample-metadata`

  // Use `.html("") to clear any existing metadata

  // Use `Object.entries` to add each key and value pair to the panel
  // Hint: Inside the loop, you will need to use d3 to append new
  // tags for each key-value in the metadata.

  // BONUS: Build the Gauge Chart
  // buildGauge(data.WFREQ);
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots

  // @TODO: Build a Bubble Chart using the sample data

  // @TODO: Build a Pie Chart
  // HINT: You will need to use slice() to grab the top 10 sample_values,
  // otu_ids, and labels (10 each).
}

function buildChloropleth(data) {
  //populate states lookup table
  d3.tsv('/states', function (error, states_tsv) {
    states_tsv.forEach(state => statesData.push(state))
  })

  //########################
  // forked from Mike Bostock ///
  //https://www2.census.gov/geo/docs/reference/codes/national_county.txt
  //https://gist.github.com/mbostock/4090846#file-us-state-names-tsv
  //https://gist.github.com/4090846#file-us-county-names-tsv

  var svg = d3.select("#cloropleth"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  var unemployment = d3.map();

  var path = d3.geoPath();

  var x = d3.scaleLinear()
    .domain([0, 1500])
    .rangeRound([600, 860]);

  var color = d3.scaleThreshold()
    .domain(d3.range(2, 10))//0, 1500
    //.domain(d3.range(0, 1500))//0, 1500
    .range(d3.schemeReds[9]);

  var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

  g.selectAll("rect")
    .data(color.range().map(function (d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function (d) { return x(d[0]); })
    .attr("width", function (d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function (d) { return color(d[0]); });

  g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Fire Size");

  g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function (x, i) { return i ? x : x + "%"; })
    .tickValues(color.domain()))
    .select(".domain")
    .remove();

  //var q = d3_queue.queue();

  //error, 

  // d3.queue()
  // .defer(d3.json, "https://d3js.org/us-10m.v1.json")
  // //.defer(d3.json,"/firedata")
  // .defer(d3.csv, "./static/js/unemployment.csv", function (d) { unemployment.set(d.id, +d.rate); })
  // //.defer(d3.csv, "unemployment.csv", function(d) { unemployment.set(d.id, +d.FIRE_SIZE); })
  // //.defer(d3.tsv, 'https://gist.github.com/mbostock/4090846#file-us-state-names-tsv')
  // .await(ready);

  //C:\Users\connelb\Documents\Bootcamp\Projects\Project 2\NU-Wildfires\templates\unemployment.csv

  //     d3.queue()
  //     //.defer(d3.json, "https://d3js.org/us-10m.v1.json")
  //     .defer(d3.json('/firedata' , function(error, data){}) 
  //     //TypeError: 'dict' object is not callable
  //     .defer(d3.csv, "./unemployment.csv", function(d) { unemployment.set(d.id, +d.rate); })
  //     .await(ready);

  // function ready(error, us) {
  //   if (error) throw error;
  d3.json('/us', function (error, us) {

    //console.log("new id is ", statesData, stateId("CA"))
    data.forEach(datum => {
      //mapData.set(stateId(datum.State)+datum.FIPS)//,+datum.FIRE_SIZE
      datum['FIPS'] = ('0' + stateId(datum.State)).slice(-2) + datum.FIPS;
    })

    //console.log('max',d3.max(data, function(d){return d.Size}), 'min',d3.min(data, function(d){return d.Size}));

    function mySize(value) {
      var temp = 0;

      data.find(datum => {
        if (datum.FIPS == value) {
          temp = +datum.Size;
        }
      })
      return temp | 0;
    }
    // tto slow!!!
    //   data.map(function (datum) {
    //     mapData.push({"id":stateId(datum.State)+datum.FIPS,"rate":+datum.Size} )
    // });

    // lookup statData, concat to country FIPS

    svg.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
      // .attr("fill", function(d) { console.log(mapData.filter(function(itm){
      //   return d.id = itm.id;
      // }));
      // return color(d.rate = getFIPS(d.id)) })
      .attr("fill", function (d) { return color(d.rate = (d['id']) ? mySize(d['id']) : 0) })
      //.attr("fill", function(d) { return color(d.rate = data.get(stateId(d.State)+d.FIPS)); })
      .attr("d", path)
      .append("title")
      .text(function (d) { return d.rate + "%"; });

    // function ready(error, us) {
    //   console.log('test', us);
    //   //FIRE_YEAR === '2015'
    //   if (error) throw error;

    //   svg.append("g")
    //   .selectAll('p')
    //   .data(us)
    //   .enter()
    //   .append('p')

    // svg.append("g")
    //     .attr("class", "counties")
    //   .selectAll("path")
    //   .data(topojson.feature(us, us.objects.counties).features)
    //   .enter().append("path")
    //     .attr("fill", function(d) { return color(d.rate = unemployment.get(d.id)); })
    //     .attr("d", path)
    //   .append("title")
    //     .text(function(d) { return d.rate + "%"; });

    svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);

  })
}



function init() {

  var selector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  //d3.json('/firedata').then(data=> {
  d3.json('/mapdata', function (error, data) {

    this.masterData = data;
    states = d3.map(data, function (d) { return d.State; }).keys().sort();

    //states.forEach(function (error, state) {
    states.forEach(state => {
      selector
        .append("option")
        .text(state)
        .property("value", state);
    });

    buildChloropleth(data);
    initPlotly();
  })
}

function optionChanged(value) {
  let temp = masterData.filter(row => row.State === value);
  if (temp) {
    updatePlotly(temp);
  }
}

function optionChanged2(value) {
var newData ={};
  var filteredState = [];
  var filteredX = [];
  var filteredY = [];
  var myStates = this.plotlyData[0].state;
  for (i = 0; i < myStates.length; i++) {
    if (myStates[i] === value){
      filteredState.push(this.plotlyData[0].state[i]);
      filteredX.push(this.plotlyData[0].x[i]);
      filteredY.push(this.plotlyData[0].y[i]);
    }
  }

  newData={
    'state':filteredState,
    'type': "bar",
    'x':filteredX,
    'y':filteredY
  }

  if (newData) {
    updatePlotly(newData);
  }
}


function initPlotly() {
  var selector = d3.select("#selDataset1");
  // Plot the default route once the page loads
  const defaultURL = "/fire_causes";
  //d3.json(defaultURL).then(function (data) {
  d3.json(defaultURL, function (error, data) {

//Set up dropdown using unique states
    var states = d3.map(data['state'], function (d) { return d; }).keys().sort();
    states.forEach(state => {
      selector
        .append("option")
        .text(state)
        .property("value", state);
    });

    this.plotlyData = [data];
    var layout = { margin: { t: 30, b: 100 } };
    Plotly.newPlot("bar", this.plotlyData, layout);
  });
}

// Update the plot with new data
function updatePlotly(newdata) {
  console.log('what is filtered data?', newdata)

  Plotly.restyle("bar", "x", [newdata.x]);
  Plotly.restyle("bar", "y", [newdata.y]);
  //var layout = { margin: { t: 30, b: 100 } };
  //Plotly.restyle("bar", this.plotlyData);
}

function stateId(value) {
  var temp = "";
  //console.log('va;lues',statesData, value)
  statesData.forEach(response => {
    for (key in response) {
      if (response[key] == value) {
        temp = response['id'];
        return
      }
    }
  })

  return temp
}


// function getFIPS(value) {
//   //var temp ="";
//   //value is the id
//   mapData.forEach(response => {
//     //for(key in response){
//       if(response['id']==value){
//         return response['rate'];
//         //return 
//       }
//     //}
//   })

// //return temp
// }

// Initialize the dashboard
init();

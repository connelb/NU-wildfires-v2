//array for all data
var masterData = [];
var statesData = [];
var mapData = [];
var plotlyData = [];




function init() {
  buildChloropleth();
  initPlotly();
}

function cloroplethChanged(value) {
  let temp = masterData.filter(row => row.Year === value);
  if (temp) {
    //to do change year and replot cloropleth
    // currently filtering only to 2013 'cos it is too big :(
    //buildChloropleth(temp);
  }
}

function plotlyStateChanged(value) {
  var newData = {};
  var filteredState = [];
  var filteredX = [];
  var filteredY = [];
  var myStates = this.plotlyData[0].state;
  for (i = 0; i < myStates.length; i++) {
    if (myStates[i] === value) {
      filteredState.push(this.plotlyData[0].state[i]);
      filteredX.push(this.plotlyData[0].x[i]);
      filteredY.push(this.plotlyData[0].y[i]);
    }
  }

  newData = {
    'state': filteredState,
    'type': "bar",
    'x': filteredX,
    'y': filteredY
  }

  if (newData) {
    updatePlotly(newData);
  }
}


function initPlotly() {
  var selector = d3.select("#plotly");
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

// used in cloropleth to concat state and county FIPS code
function stateId(value) {
  var temp = "";
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


function buildChloropleth() {
  var selector = d3.select("#selYear");


  d3.json('/mapdata', function (error, data) {

    this.masterData = data;
    // Use the list of years to populate the select options
    years = d3.map(data, function (d) { return d.Year; }).keys().sort();

    years.forEach(year => {
      selector
        .append("option")
        .text(year)
        .property("value", year);
    });

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

    var unemployment = d3.map();//get rid of?

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

    d3.json('/us', function (error, us) {

      data.forEach(datum => {
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


      svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("fill", function (d) { return color(d.rate = (d['id']) ? mySize(d['id']) : 0) })
        .attr("d", path)
        .append("title")
        .text(function (d) { return d.rate + "%"; });


      svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);

    })
  })
}


// Initialize the dashboard
init();

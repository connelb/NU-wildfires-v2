// selector
var selector = d3.select("#selDataset");


d3.json('/firedata', function (error, data) {


  // Use the list of years to populate the select options
  years = d3.map(data, function (d) { return d.Year; }).keys().sort();

  years.forEach(year => {
    selector
      .append("option")
      .text(year)
      .property("value", year);
  });




})

function optionChanged(value) {
    let temp = masterData.filter(row => row.Year === value);
    if (temp) {
      //replot leaflet map
      // redrawLeaflet(temp);
    }
  }


  function redrawLeaflet(temp){

  }
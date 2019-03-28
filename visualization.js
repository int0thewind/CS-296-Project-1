
// Using jQuery, read our data and call visualize(...) only once the page is ready:
$(function() {
  d3.csv("data.csv").then(function(data) {
    visualise(data);
  });
});

var visualise = function(data) {

  var majorVsDepartment_margin = { top: 50, right: 50, bottom: 50, left: 100 };
  var majorVsDepartment_width = 960 - margin.left - margin.right;
  var MajorVsDepartment_height = 2500 - margin.top - margin.bottom;

  var majorVsDepartment_svg = d3.select("#MajorVsDepartment")
    .append("svg")
    .attr("width", majorVsDepartment_width + majorVsDepartment_margin.left + majorVsDepartment_margin.right)
    .attr("height", MajorVsDepartment_height + majorVsDepartment_margin.top + majorVsDepartment_margin.bottom)
    .style("width", majorVsDepartment_width + majorVsDepartment_margin.left + majorVsDepartment_margin.right)
    .style("height", MajorVsDepartment_height + majorVsDepartment_margin.top + majorVsDepartment_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + majorVsDepartment_margin.left + "," + majorVsDepartment_margin.top + ")");
/*  // Boilerplate:
      
  var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("width", width + margin.left + margin.right)
    .style("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Visualization Code:

  var seasonData = [];
  var teamData = [];

  for (var i = 0; i < data.length; i++) {
    if (!seasonData.includes(data[i].Season)) {
      seasonData.push(data[i].Season)
    }
    if (!teamData.includes(data[i].Opponent)) {
      teamData.push(data[i].Opponent);
    }
  }

  var yearScale = d3.scaleLinear()
                    .domain([d3.min(seasonData),d3.max(seasonData)])
                    .range([0, width]);
  var yearAxis = d3.axisTop().scale(yearScale)
                    .tickValues([1892, 1900, 1960, 1980, 2000, 2010]);

  var teamScale = d3.scalePoint()
                    .domain(teamData)
                    .range([0, height]);
  var teamAxis = d3.axisLeft().scale(teamScale);
//append axis
  svg.append("g")
    .call(yearAxis)
    .append("g")
    .call(teamAxis);

  //Append IlliniScore
  svg.selectAll("IlliniScore")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", function(d) {
      return d.IlliniScore / 5;
    })      
    .attr("cx", function (d) {
      return yearScale( d["Season"]);
    })
    .attr("cy", function (d) {
      return teamScale( d["Opponent"]);
    })
    .attr("opacity", 0.5)
    .attr("stroke", "black")
    .attr("fill", function(d) {
      if (d.Result == "W") {
        return "red";
      } else return "blue";
    });

    /*
    //Append OpponentScore
    svg.selectAll("OpponentScore")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", function(d, i) {
      return d.OpponentScore / 5;
    })
    .attr("cx", function (d, i) {
      return yearScale(d["Season"])
    })
    .attr("cy", function (d, i) {
      return teamScale( d["Opponent"]);
    })
    .attr("opacity", 0.5)
    .attr("fill", "blue");*/

    //var tip = d3.tip()*/
};
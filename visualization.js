//-------------------------------------------------------
//              Global variables here
//-------------------------------------------------------
const startYear = 1991;
const endYear = 2018;
const maximum = 0.35;
const strokeWidth = 2;
const radius = 4;
const opacity = 0.6;

var margins = { top: 50, right: 50, bottom: 50, left: 50 };
var width = 2000 - margins.left - margins.right;
var height = 800 - margins.top - margins.bottom;
var subgraph_width = 200;
//to decide which department we want to visualise
var filterDepartment = function (element) {
  if (element === undefined) { return false; }
  return true;
}

//-------------------------------------------------------
//              Read CSV
//-------------------------------------------------------

// Using jQuery, read our data and call visualize(...) only once the page is ready:
$(function () {
  d3.csv("data_cleaned.csv").then(function (data) {
    console.time("visulisation time taken");
    visualise(data);
    console.timeEnd("visulisation time taken");
  });
});

//-------------------------------------------------------
//       Helper functions to process data
//-------------------------------------------------------

//helper function for merging the data with the same Year, College, and MajorName
function appendData(array, query) {
  query.Year = parseInt(query.Year);
  query.Total = parseInt(query.Total);
  query.Male = parseInt(query.Male);
  query.Female = parseInt(query.Female);
  query.Unknown = parseInt(query.Unknown);
  for (var i = 0; i < array.length; i++) {
    if (array[i].Year === query.Year
      && array[i].College === query.College
      && array[i].MajorName === query.MajorName) {
      array[i].Total += query.Total;
      array[i].Male += query.Male;
      array[i].Female += query.Female;
      array[i].Unknown += query.Unknown;
      return;
    }
  }
  array.push(query);
}
//merge the data
function mergeData(data) {
  var newData = [];
  data.forEach(element => {
    if (element.Year === startYear.toString() || element.Year === endYear.toString()) {
      appendData(newData, element);
    }
  });
  return newData;
}

//-------------------------------------------------------
//              Visualisation down here
//-------------------------------------------------------

//main function to visualise data
function visualise(data) {
  //console.time is to track the performance of the code
  //console.time("general data merging");
  data = mergeData(data);
  //console.timeEnd("general data merging");
  //initialise svg and margins
  var svg = d3.select("#svg")
    .append("svg")
    .attr("width", width + margins.left + margins.right)
    .attr("height", height + margins.top + margins.bottom)
    .style("width", width + margins.left + margins.right)
    .style("height", height + margins.top + margins.bottom)
    .append("g")
    .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

  var collegesData = departmentVsCampus(svg, data);
  var offset = subgraph_width + 50;
  major(svg, offset, data, collegesData[0]);
};

var major = function (svg, offset, data, collegeData) {

  var majorObject = function (element) {
    if (element.Year === startYear) {
      return { major: element.MajorName, startPopulation: element.Total, endPopulation: 0, startRatio: element.Male, endRatio: 0, majorTotalStart: element.Total, majorTotalEnd: 0 };
    } else if (element.Year === endYear) {
      return { major: element.MajorName, startPopulation: 0, endPopulation: element.Total, startRatio: 0, endRatio: element.Male, majorTotalStart: 0, majorTotalEnd: element.Total };
    }
    return null;
  }
  var majorArrayAppender = function (array, query) {
    //if (query === null) {return;}
    for (var i = 0; i < array.length; i++) {
      //if (array[i] === null) {continue;}
      if (collegeData.department === query.College && array[i].major == query.MajorName) {
        if (query.Year === startYear) {
          array[i].startPopulation += query.Total;
          array[i].startRatio += query.Male;
          array[i].majorTotalStart += query.Total - query.Unknown;
        }
        else if (query.Year === endYear) {
          array[i].endPopulation += query.Total;
          array[i].endRatio += query.Male;
          array[i].majorTotalEnd += query.Total - query.Unknown;
        }
        return;
      }
    }
    array.push(majorObject(query));
  }

  var totalStart = 0, totalEnd = 0, majorArray = [];

  data.forEach(element => {
    if (element.Year === startYear) { totalStart += element.Total; }
    else if (element.Year === endYear) { totalEnd += element.Total; }
    majorArrayAppender(majorArray, element);
  });

  majorArray.forEach(element => {
    element.startPopulation /= totalStart;
    element.endPopulation /= totalEnd;
    element.startRatio /= element.majorTotalStart;
    element.endRatio /= element.majorTotalEnd;
  });

  console.log(majorArray);

  //Scale
  var ratioScale = d3.scaleLinear()
    .domain([0, maximum])
    .range([height, 0]);
  var yearScale = d3.scalePoint()
    .domain([startYear, endYear])
    .range([offset, subgraph_width + offset]);

  // Axis:
  // var axisRightVariable = d3.axisRight()
  //   .scale(ratioScale);
  // var axisLeftVariable = d3.axisLeft()
  //   .scale(ratioScale);
  var axisBottomVariable = d3.axisBottom()
    .scale(yearScale);

  var axisGroup = svg.append("g");
  axisGroup
    .attr("transform", "translate(" + 0 + "," + height + ")")
    .call(axisBottomVariable);

  // Visual Encoding:
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var colorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["#ff0066", "#00ccff"])

  var defs = svg.append("defs");

  majorArray.forEach(element => {
    var linearGradient = defs.append(("linearGradient"))
      .attr("id", "linear-gradient" + element.majorTotalEnd.toString(10) + element.majorTotalStart.toString(10));
    //Diagonal gradient
    linearGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    //Set the color for the start (0%)
    linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(element.startRatio));
    //Set the color for the end (100%)
    linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(element.endRatio));
  });

  //Tip
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function (d, i) {
      return d.major;
    });
  svg.call(tip);

  svg.selectAll(".major_slopes")
    .data(majorArray)
    .enter()
    .append('line')
    .attr('id', "major_lines")
    .attr('x1', offset)
    .attr('x2', subgraph_width + offset)
    .attr('y1', function (d, i) {
      return ratioScale(d.startPopulation);
    })
    .attr('y2', function (d, i) {
      return ratioScale(d.endPopulation);
    })
    .attr("stroke-width", strokeWidth)
    .attr('stroke', function (d, i) {
      return "url(#" + "linear-gradient" + d.majorTotalEnd.toString(10) + d.majorTotalStart.toString(10) + ")"
    })
    .attr('opacity', opacity)
    .on('mouseover', function (d, i) {
      d3.selectAll("#major_lines").attr("opacity", opacity - 0.3);
      d3.select(this)
        .attr("stroke-width", strokeWidth + 2)
        .attr("opacity", opacity);
      tip.show(d, i);
    })
    .on('mouseout', function (d, i) {
      d3.selectAll("#major_lines").attr("opacity", opacity);
      d3.select(this)
        .attr("stroke-width", strokeWidth);
      tip.hide(d, i);
    });

  svg.selectAll(".points")
    .data(majorArray)
    .enter()
    .append('circle')
    .attr('cx', offset)
    .attr('cy', function (d, i) {
      return ratioScale(d.startPopulation);
    })
    .attr('r', radius)
    .attr('fill', function (d, i) { return colorScale(d.startRatio); })
    .attr('opacity', opacity);

  svg.selectAll(".points")
    .data(majorArray)
    .enter()
    .append('circle')
    .attr('cx', subgraph_width + offset)
    .attr('cy', function (d, i) {
      return ratioScale(d.endPopulation);
    })
    .attr('r', radius)
    .attr('fill', function (d, i) { return colorScale(d.endRatio); })
    .attr('opacity', opacity);
}

var departmentVsCampus = function (svg, data) {

  var departmentObject = function (element) {
    if (element.Year === startYear) {
      return { department: element.College, startPopulation: element.Total, endPopulation: 0, startRatio: element.Male, endRatio: 0, collegeTotalStart: element.Total, collegeTotalEnd: 0 };
    } else if (element.Year === endYear) {
      return { department: element.College, startPopulation: 0, endPopulation: element.Total, startRatio: 0, endRatio: element.Male, collegeTotalStart: 0, collegeTotalEnd: element.Total };
    }
    return null;
  }
  var departmentArrayAppender = function (array, query) {
    //if (query === null) {return;}
    for (var i = 0; i < array.length; i++) {
      //if (array[i] === null) {continue;}
      if (array[i].department === query.College) {
        if (query.Year === startYear) {
          array[i].startPopulation += query.Total;
          array[i].startRatio += query.Male;
          array[i].collegeTotalStart += query.Total - query.Unknown;
        }
        else if (query.Year === endYear) {
          array[i].endPopulation += query.Total;
          array[i].endRatio += query.Male;
          array[i].collegeTotalEnd += query.Total - query.Unknown;
        }
        return;
      }
    }
    array.push(departmentObject(query));
  }

  var totalStart = 0, totalEnd = 0, departmentArray = [];

  data.forEach(element => {
    if (element.Year === startYear) { totalStart += element.Total; }
    else if (element.Year === endYear) { totalEnd += element.Total; }
    if (filterDepartment(element)) {
      departmentArrayAppender(departmentArray, element);
    }
  });

  departmentArray.forEach(element => {
    element.startPopulation /= totalStart;
    element.endPopulation /= totalEnd;
    element.startRatio /= element.collegeTotalStart;
    element.endRatio /= element.collegeTotalEnd;
  });

  //console.log(departmentArray);

  //Scale
  var ratioScale = d3.scaleLinear()
    .domain([0, maximum])
    .range([height, 0]);
  var yearScale = d3.scalePoint()
    .domain([startYear, endYear])
    .range([0, subgraph_width]);

  // Axis:
  // var axisRightVariable = d3.axisRight()
  //   .scale(ratioScale);
  // var axisLeftVariable = d3.axisLeft()
  //   .scale(ratioScale);
  var axisBottomVariable = d3.axisBottom()
    .scale(yearScale);

  var axisGroup = svg.append("g");
  axisGroup
    .attr("transform", "translate(" + 0 + "," + height + ")")
    .call(axisBottomVariable);

  // Visual Encoding:
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var colorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["#ff0066", "#00ccff"])

  var defs = svg.append("defs");

  departmentArray.forEach(element => {
    var linearGradient = defs.append(("linearGradient"))
      .attr("id", "linear-gradient" + element.collegeTotalEnd.toString(10) + element.collegeTotalStart.toString(10));
    //Diagonal gradient
    linearGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    //Set the color for the start (0%)
    linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(element.startRatio));
    //Set the color for the end (100%)
    linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(element.endRatio));
  });

  //Tip
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function (d, i) {
      return d.department;
    });
  svg.call(tip);

  svg.selectAll(".department_slopes")
    .data(departmentArray)
    .enter()
    .append('line')
    .attr('id', "departmentVsCampus_lines")
    .attr('x1', 0)
    .attr('x2', subgraph_width)
    .attr('y1', function (d, i) {
      return ratioScale(d.startPopulation);
    })
    .attr('y2', function (d, i) {
      return ratioScale(d.endPopulation);
    })
    .attr("stroke-width", strokeWidth)
    .attr('stroke', function (d, i) {
      return "url(#" + "linear-gradient" + d.collegeTotalEnd.toString(10) + d.collegeTotalStart.toString(10) + ")"
    })
    .attr('opacity', opacity)
    .on('mouseover', function (d, i) {
      d3.selectAll("#departmentVsCampus_lines").attr("opacity", opacity - 0.3);
      d3.select(this)
        .attr("stroke-width", strokeWidth + 2)
        .attr("opacity", opacity);
      tip.show(d, i);
    })
    .on('mouseout', function (d, i) {
      d3.selectAll("#departmentVsCampus_lines").attr("opacity", opacity);
      d3.select(this)
        .attr("stroke-width", strokeWidth);
      tip.hide(d, i);
    });

  svg.selectAll(".department_points")
    .data(departmentArray)
    .enter()
    .append('circle')
    .attr('cx', 0)
    .attr('cy', function (d, i) {
      return ratioScale(d.startPopulation);
    })
    .attr('r', radius)
    .attr('fill', function (d, i) { return colorScale(d.startRatio); })
    .attr('opacity', opacity);

  svg.selectAll(".department_points")
    .data(departmentArray)
    .enter()
    .append('circle')
    .attr('cx', subgraph_width)
    .attr('cy', function (d, i) {
      return ratioScale(d.endPopulation);
    })
    .attr('r', radius)
    .attr('fill', function (d, i) { return colorScale(d.endRatio); })
    .attr('opacity', opacity);

  return departmentArray;
}

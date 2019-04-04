//-------------------------------------------------------
//              Global variables here
//-------------------------------------------------------
const startYear = 1981;
const endYear = 2018;
const strokeWidth = 3;
const radius = 4;
const opacity = 0.9;

var _data = null;
var majorVsCampus = 0;
var maximum = 0.5;
var margins = { top: 50, right: 50, bottom: 50, left: 50 };
var width = 1400 - margins.left - margins.right;
var height = 800 - margins.top - margins.bottom;
var subgraph_width = 100;
var colorScale = d3.scaleLinear()
  .domain([0, 0.5, 1])
  .range(["#ff0033", "#BBBBBB", "#10a7dd"])
//-------------------------------------------------------
//              Read CSV
//-------------------------------------------------------

// $(window).resize(function () {
//   if (_data != null) {
//     var new_width = $("#sizer").width();
//     if (width != new_width) {
//       //tip.hide();
//       //width = new_width;
//       visualise(_data);
//     }
//   }
// });



// Using jQuery, read our data and call visualize(...) only once the page is ready:
$(function () {
  d3.csv("data_cleaned.csv").then(function (data) {
    _data = data;
    console.time("visulisation time taken");
    visualise(data);
    console.timeEnd("visulisation time taken");
  });
});

/* resize */
function zoomIn() {
  maximum /= 2;
  d3.csv("data_cleaned.csv").then(function (data) {
    d3.select("svg").remove();
    visualise(data);
  });
}

function zoomOut() {
  maximum *= 2;
  d3.csv("data_cleaned.csv").then(function (data) {
    d3.select("svg").remove();
    visualise(data);
  });
}

function collegeOrCampus() {
  if (majorVsCampus) {
    maximum /= 2;
    majorVsCampus = 0;
    zoomOut();
  } else {
    maximum *= 2;
    majorVsCampus = 1;
    zoomIn();
  }
}

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
//to decide which department we want to visualise
var filterDepartment = function (element) {
  if (element === undefined) { return false; }
  return element != "Social Work" && element != "iSchool" && element != "VetMed" && element != "Labor and Industrial Relations" && element != "Law";
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
  var offset = 0;

  collegesData.forEach(element => {
    if (element.collegeTotalStart != 0 && element.collegeTotalEnd != 0) {
      console.log(element);
      offset = offset + subgraph_width + 50;
      major(svg, offset, data, element);
    }
  });


  var defs = svg.append("defs");
  var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");
  linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
  linearGradient.selectAll("stop")
    .data( colorScale.range() )
    .enter().append("stop")
    .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
    .attr("stop-color", function(d) { return d; });
  svg.append("rect")
    .attr("x", 1000)
    .attr("width", 300)
    .attr("height", 20)
    .style("fill", "url(#linear-gradient)");
  svg.append("text")
    .attr("x", 970)
    .text("100% Female");
  svg.append("text")
    .attr("x", 1270)
    .text("100% Male");
  svg.append("text")
    .attr("x", 1130)
    .text("50% Each");

  svg.append("text")
    .text("Zoom In")
    .on('click', zoomIn);
  svg.append("text")
    .attr("y", 20)
    .text("Zoom Out")
    .on('click', zoomOut);
  svg.append("text")
    .attr("x", 0)
    .attr("y",730)
    .text("Dep. VS Campus");
  svg.append("text")
    .attr("x", 175)
    .attr("y",730)
    .text("Business");
  svg.append("text")
    .attr("x", 330)
    .attr("y",730)
    .text("Media");
  svg.append("text")
    .attr("x", 465)
    .attr("y",730)
    .text("Engineering");
  svg.append("text")
    .attr("x", 635)
    .attr("y",730)
    .text("ACES");
  svg.append("text")
    .attr("x", 785)
    .attr("y",730)
    .text("LAS");
  svg.append("text")
    .attr("x", 890)
    .attr("y",730)
    .text("Fine and Applied Arts");
  svg.append("text")
    .attr("x", 1070)
    .attr("y",730)
    .text("Education");
  svg.append("text")
    .attr("x", 1180)
    .attr("y",730)
    .text("Applied Health Sciences");
  svg.append("text")
    .attr("y", 40)
    .text("Change")
    .on('click', collegeOrCampus);
};

var major = function (svg, offset, data, collegeData) {

  var majorObject = function (element) {
    if (element.Year === startYear) {
      return { major: element.MajorName, startPopulationPerCollege: element.Total, endPopulationPerCollege: 0, startRatio: element.Male, endRatio: 0, majorTotalStart: element.Total - element.Unknown, majorTotalEnd: 0, startPopulationPerCampus: element.Total, endPopulationPerCampus: 0 };
    } else if (element.Year === endYear) {
      return { major: element.MajorName, startPopulationPerCollege: 0, endPopulationPerCollege: element.Total, startRatio: 0, endRatio: element.Male, majorTotalStart: 0, majorTotalEnd: element.Total - element.Unknown, startPopulationPerCampus: 0, endPopulationPerCampus: element.Total };
    }
    return null;
  }
  var majorArrayAppender = function (array, query) {
    //if (query === null) {return;}
    if (collegeData.department === query.College) {
      for (var i = 0; i < array.length; i++) {
        //if (array[i] === null) {continue;}
        if (array[i].major == query.MajorName) {
          if (query.Year === startYear) {
            array[i].startPopulationPerCollege += query.Total;
            array[i].startPopulationPerCampus += query.Total;
            array[i].startRatio += query.Male;
            array[i].majorTotalStart += query.Total - query.Unknown;
          }
          else if (query.Year === endYear) {
            array[i].endPopulationPerCollege += query.Total;
            array[i].endPopulationPerCampus += query.Total;
            array[i].endRatio += query.Male;
            array[i].majorTotalEnd += query.Total - query.Unknown;
          }
          return;
        }
      }
      array.push(majorObject(query));
    }
  }

  var totalStart = 0, totalEnd = 0, majorArray = [];

  data.forEach(element => {
    if (element.Year === startYear) { totalStart += element.Total; }
    else if (element.Year === endYear) { totalEnd += element.Total; }
    majorArrayAppender(majorArray, element);
  });

  majorArray.forEach(element => {
    element.startPopulationPerCollege /= collegeData.collegeTotalStart;
    element.endPopulationPerCollege /= collegeData.collegeTotalEnd;
    element.startPopulationPerCampus /= totalStart;
    element.endPopulationPerCampus /= totalEnd;
    element.startRatio /= element.majorTotalStart;
    element.endRatio /= element.majorTotalEnd;
    if (isNaN(element.startRatio))
      element.startRatio = 0.5;
    if (isNaN(element.endRatio))
      element.endRatio = 0.5;
  });

  //console.log(majorArray);

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

  svg.append("g")
    .attr("transform", "translate(" + 0 + "," + height + ")")
    .call(axisBottomVariable);

  for (var i = maximum / 5; i <= maximum; i = i + maximum / 5) {
    svg.append('line')
      .attr('x1', offset)
      .attr('x2', subgraph_width + offset)
      .attr('y1', ratioScale(i))
      .attr('y2', ratioScale(i))
      .attr('opacity', opacity)
      .attr("stroke-width", 1)
      .attr("stroke", "#BBBBBB");
  }

  // Visual Encoding:
  //var color = d3.scaleOrdinal(d3.schemeCategory10);

  var defs = svg.append("defs");

  majorArray.forEach(element => {
    var linearGradient = defs.append(("linearGradient"))
      .attr("id", "linear-gradient" + element.major.replace(/[^a-zA-Z]/g, ""));

    //Set the color for the start (0%)
    linearGradient.append("stop")
      .attr('class', 'stop-left')
      .attr('offset', '0')
      .attr("stop-color", colorScale(element.startRatio));
    //Set the color for the end (100%)
    linearGradient.append("stop")
      .attr('class', 'stop-right')
      .attr("offset", "1")
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
    .attr('id', "majorVsCollege_lines")
    .attr('x1', offset)
    .attr('x2', subgraph_width + offset)
    .attr('y1', function (d, i) {
      return ratioScale(d.startPopulationPerCollege);
    })
    .attr('y2', function (d, i) {
      return ratioScale(d.endPopulationPerCollege);
    })
    .attr("stroke-width", strokeWidth)
    .attr('stroke', function (d, i) {
      return "url(#" + "linear-gradient" + d.major.replace(/[^a-zA-Z]/g, "") + ")"
    })
    .attr('opacity', opacity)
    .attr('visibility', majorVsCampus ? "hidden" : "visible")
    .on('mouseover', function (d, i) {
      d3.selectAll("#majorVsCollege_lines").attr("opacity", opacity - 0.3);
      d3.select(this)
        .attr("stroke-width", strokeWidth + 2)
        .attr("opacity", opacity);
      tip.show(d, i);
    })
    .on('mouseout', function (d, i) {
      d3.selectAll("#majorVsCollege_lines").attr("opacity", opacity);
      d3.select(this)
        .attr("stroke-width", strokeWidth);
      tip.hide(d, i);
    });

  svg.selectAll(".majorPoints")
    .data(majorArray)
    .enter()
    .append('circle')
    .attr('id', "majorVsCollege_points")
    .attr('cx', offset)
    .attr('cy', function (d, i) {
      return ratioScale(d.startPopulationPerCollege);
    })
    .attr('r', radius)
    .attr('fill', function (d, i) { return colorScale(d.startRatio); })
    .attr('opacity', opacity)
    .attr('visibility', majorVsCampus ? "hidden" : "visible");

  svg.selectAll(".majorPoints")
    .data(majorArray)
    .enter()
    .append('circle')
    .attr('id', "majorVsCollege_points")
    .attr('cx', subgraph_width + offset)
    .attr('cy', function (d, i) {
      return ratioScale(d.endPopulationPerCollege);
    })
    .attr('r', radius)
    .attr('fill', function (d, i) { return colorScale(d.endRatio); })
    .attr('opacity', opacity)
    .attr('visibility', majorVsCampus ? "hidden" : "visible");

  svg.selectAll(".major_slopes")
    .data(majorArray)
    .enter()
    .append('line')
    .attr('id', "majorVsCampus_lines")
    .attr('x1', offset)
    .attr('x2', subgraph_width + offset)
    .attr('y1', function (d, i) {
      return ratioScale(d.startPopulationPerCampus);
    })
    .attr('y2', function (d, i) {
      return ratioScale(d.endPopulationPerCampus);
    })
    .attr("stroke-width", strokeWidth)
    .attr('stroke', function (d, i) {
      return "url(#" + "linear-gradient" + d.major.replace(/[^a-zA-Z]/g, "") + ")"
    })
    .attr('opacity', opacity)
    .attr('visibility', majorVsCampus == 0 ? "hidden" : "visible")
    .on('mouseover', function (d, i) {
      d3.selectAll("#majorVsCampus_lines").attr("opacity", opacity - 0.3);
      d3.select(this)
        .attr("stroke-width", strokeWidth + 2)
        .attr("opacity", opacity);
      tip.show(d, i);
    })
    .on('mouseout', function (d, i) {
      d3.selectAll("#majorVsCampus_lines").attr("opacity", opacity);
      d3.select(this)
        .attr("stroke-width", strokeWidth);
      tip.hide(d, i);
    });

  svg.selectAll(".majorPoints")
    .data(majorArray)
    .enter()
    .append('circle')
    .attr('id', "majorVsCampus_points")
    .attr('cx', offset)
    .attr('cy', function (d, i) {
      return ratioScale(d.startPopulationPerCampus);
    })
    .attr('r', radius)
    .attr('fill', function (d, i) { return colorScale(d.startRatio); })
    .attr('opacity', opacity)
    .attr('visibility', majorVsCampus == 0 ? "hidden" : "visible");

  svg.selectAll(".majorPoints")
    .data(majorArray)
    .enter()
    .append('circle')
    .attr('id', "majorVsCampus_points")
    .attr('cx', subgraph_width + offset)
    .attr('cy', function (d, i) {
      return ratioScale(d.endPopulationPerCampus);
    })
    .attr('r', radius)
    .attr('fill', function (d, i) { return colorScale(d.endRatio); })
    .attr('opacity', opacity)
    .attr('visibility', majorVsCampus == 0 ? "hidden" : "visible");
}

var departmentVsCampus = function (svg, data) {

  var departmentObject = function (element) {
    if (element.Year === startYear) {
      return { department: element.College, startPopulation: element.Total, endPopulation: 0, startRatio: element.Male, endRatio: 0, collegeTotalStart: element.Total - element.Unknown, collegeTotalEnd: 0 };
    } else if (element.Year === endYear) {
      return { department: element.College, startPopulation: 0, endPopulation: element.Total, startRatio: 0, endRatio: element.Male, collegeTotalStart: 0, collegeTotalEnd: element.Total - element.Unknown };
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
    if (filterDepartment(query.College)) {
      array.push(departmentObject(query));
    }
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
    if (isNaN(element.startRatio))
      element.startRatio = 0.5;
    if (isNaN(element.endRatio))
      element.endRatio = 0.5;
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
  var ticks = [];
  for (var i = maximum / 5; i <= maximum; i = i + maximum / 5) {
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', subgraph_width)
      .attr('y1', ratioScale(i))
      .attr('y2', ratioScale(i))
      .attr('opacity', opacity)
      .attr("stroke-width", 1)
      .attr("stroke", "#BBBBBB");

    ticks.push(i);
  }

  var axisLeftVariable = d3.axisLeft()
    .scale(ratioScale)
    .tickValues(ticks)
    .tickFormat(d3.format(".0%"));;

  var axisBottomVariable = d3.axisBottom()
    .scale(yearScale);

  svg.append("g")
    .attr("transform", "translate(" + 0 + "," + height + ")")
    .call(axisBottomVariable);

  svg.append("g")
    .attr("transform", "translate(" + 0 + "," + 0 + ")")
    .call(axisLeftVariable);

  // Visual Encoding:
  //var color = d3.scaleOrdinal(d3.schemeCategory10);

  var defs = svg.append("defs");

  departmentArray.forEach(element => {
    var linearGradient = defs.append(("linearGradient"))
      .attr("id", "linear-gradient" + element.department.replace(/[^a-zA-Z]/g, ""));

    //Set the color for the start (0%)
    linearGradient.append("stop")
      .attr('class', 'stop-left')
      .attr("offset", "0%")
      .attr("stop-color", colorScale(element.startRatio));
    //Set the color for the end (100%)
    linearGradient.append("stop")
      .attr('class', 'stop-right')
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
      return "url(#" + "linear-gradient" + d.department.replace(/[^a-zA-Z]/g, "") + ")"
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

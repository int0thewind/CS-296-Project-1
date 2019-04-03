//-------------------------------------------------------
//              Global variables here
//-------------------------------------------------------
var startYear = 1980;
var endYear = 2018;
//to decide which department we want to visualise
var filterDepartment = function (element) {
  if (element === undefined) {return false;}
  return element.College === "LAS"
        || element.College === "Engineering"
        || element.College === "Fine and Applied Arts"
        || element.College === "Business";
}

//-------------------------------------------------------
//              Read CSV
//-------------------------------------------------------

// Using jQuery, read our data and call visualize(...) only once the page is ready:
$(function() {
  d3.csv("data.csv").then(function(data) {
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
    if (element.Year === startYear.toString()|| element.Year === endYear.toString()) {
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
  console.time("general data merging");
  data = mergeData(data);
  console.timeEnd("general data merging");
  majorVsDepartment(data);
  departmentVsCampus(data);
};

var majorVsDepartment = function (data) {
  var majorVsDepartment_margin = { top: 50, right: 50, bottom: 50, left: 100 };
  var majorVsDepartment_width = 960 - majorVsDepartment_margin.left - majorVsDepartment_margin.right;
  var MajorVsDepartment_height = 500 - majorVsDepartment_margin.top - majorVsDepartment_margin.bottom;

  var majorVsDepartment_svg = d3.select("#majorVsDepartment")
    .append("svg")
    .attr("width", majorVsDepartment_width + majorVsDepartment_margin.left + majorVsDepartment_margin.right)
    .attr("height", MajorVsDepartment_height + majorVsDepartment_margin.top + majorVsDepartment_margin.bottom)
    .style("width", majorVsDepartment_width + majorVsDepartment_margin.left + majorVsDepartment_margin.right)
    .style("height", MajorVsDepartment_height + majorVsDepartment_margin.top + majorVsDepartment_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + majorVsDepartment_margin.left + "," + majorVsDepartment_margin.top + ")");
}

var departmentVsCampus = function (data) {
  //initialise svg and margins
  var departmentVsCampus_margin = { top: 50, right: 50, bottom: 50, left: 100 };
  var departmentVsCampus_width = 960 - departmentVsCampus_margin.left - departmentVsCampus_margin.right;
  var departmentVsCampus_height = 500 - departmentVsCampus_margin.top - departmentVsCampus_margin.bottom;

  var departmentVsCampus_svg = d3.select("#departmentVsCampus")
    .append("svg")
    .attr("width", departmentVsCampus_width + departmentVsCampus_margin.left + departmentVsCampus_margin.right)
    .attr("height", departmentVsCampus_height + departmentVsCampus_margin.top + departmentVsCampus_margin.bottom)
    .style("width", departmentVsCampus_width + departmentVsCampus_margin.left + departmentVsCampus_margin.right)
    .style("height", departmentVsCampus_height + departmentVsCampus_margin.top + departmentVsCampus_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + departmentVsCampus_margin.left + "," + departmentVsCampus_margin.top + ")");

  var departmentObject = function (element) {
    if (element.Year === startYear) {
      return {department: element.College, startPopulation: element.Total, endPopulation: 0} ;
    } else if (element.Year === endYear) {
      return {department: element.College, startPopulation: 0, endPopulation: element.Total} ;
    }
    return null;
  }
  var departmentArrayAppender = function (array, query) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].department === query.College) {
        if (query.Year === startYear) { array[i].startPopulation += query.Total}
        else if (query.Year === endYear) { array[i].endPopulation += query.Total}
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
  })

  departmentArray.forEach(element => {
    element.startPopulation /= totalStart;
    element.endPopulation /= totalEnd;
  })

  console.log(departmentArray);

}

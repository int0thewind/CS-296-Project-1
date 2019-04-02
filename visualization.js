
// Using jQuery, read our data and call visualize(...) only once the page is ready:
$(function() {
  d3.csv("data.csv").then(function(data) {
    visualise(data);
  });
});
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
    if (element.Year === "1980" || element.Year === "2018") {
      appendData(newData, element);
    }
  });
  return newData;
}
//helper function to find the unique value in an array
function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

//main function to visualise data
function visualise(data) {
  data = mergeData(data);
  console.log(data);
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
}

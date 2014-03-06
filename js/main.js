// Example based on http://bl.ocks.org/mbostock/3887118
// Tooltip example from http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

var margin = {top: 20, right: 20, bottom: 60, left: 60},
    width = 970 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/*
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x
var xValue = function(d) { return d.n;}, // data -> value
    xScale = d3.scale.log().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(bbwNumberFormatLog);

// setup y
var yValue = function(d) { return d.dimension;}, // data -> value
    yScale = d3.scale.log().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(bbwNumberFormatLog);

// setup fill color
var cValue = function(d) { return d.year;},
    color = d3.scale.log()
      .domain([1582,1980,2014])
      .range(["#eee","#999","#111"]);

// add the graph canvas to the body of the webpage
var svg = d3.select("#svg-canvas")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var tooltipFields = ["name", "year", "description", "n", "dimension", "url"];
var tooltipFieldsDOM = tooltipFields.map(function(d) { return tooltip.append("div").attr("id",d)});

// load data
d3.csv("datadata.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.dimension = +d.dimension;
    d.n = +d.n;
    d.year = +d.year;
    d.year2 = +d.year2;
    d.featured = +d.featured;
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue), d3.max(data, xValue)]);
  yScale.domain([d3.min(data, yValue), d3.max(data, yValue)]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Sample size");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Dimension");

  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", function(d) {return d.featured ? 7 : 2; })
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return d.featured ? "#f0f" : "#666";})
      .style("stroke", function(d) { return d.featured ? "none" : "none"})
      .on("mouseover", function(d) {
          tooltip.style("opacity", 1)
                 .style("left", (d3.event.pageX + 5) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
          tooltipFieldsDOM.map(function(dField) { dField.text(d[dField.attr("id")]); })
      })
      .on("mouseout", function(d) {
          tooltip.style("opacity", 0);
      })
      .on("click", function(d) {
        window.open(d.url, '_blank');
      });

/*
  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})
*/
});

//////////////////////////////////////////////////////////////////////////////////////////
// DEMO CODE // (remove at will) /////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

// draw sample arrow from page element to cursor
/*
var mouseArrow = drawArrow(d3.select("#svg-canvas"), d3.select("circle"), [300,300], 120, true);
$(document).on("mousemove", function(e) {
  mouseArrow.remove();
  mouseArrow = drawArrow(d3.select("#svg-canvas"), d3.select("circle"), [e.pageX,e.pageY], 120, true);
});*/

//////////////////////////////////////////////////////////////////////////////////////////
// TEMPLATE FUNCTIONS ////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

// from http://stackoverflow.com/a/326076/120290
function inIframe() {
    try {
        return window.self !== window.top;
    } catch(err) {
        return true;
    }
}

$( document ).ready(function() {
  if(inIframe()) $("body").addClass("iframed");
});

// store query string in urlParams
// from http://stackoverflow.com/a/2880929/120290
var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

//////////////////////////////////////////////////////////////////////////////////////////
// DRAWING FUNCTIONS /////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

function drawArrow(parent, from, to, degrees, clockwise) {
  /*
  PARAMETERS:
    parent:     the svg container or element to which to append the arrow
    from, to:   where to draw the arrow from and to, in any of four forms (in any mix):
                  a DOM element:            document.getElementById("hed")
                  a jQuery element:         $("#hed")
                  a D3 element:             d3.select("#hed")
                  a coordinate array [x,y]: [100,200]
    degrees:    the angle which the arc of the arrow will subtend.
                  90 for a gentle arc, 180 for a bigger swoop.
                  beyond 180, it gets gentler again, because of the way SVG computes arc.
                  pass 0 or 360 for a straight arrow.
    clockwise:  boolean determining whether arrow will swoop clockwise (true) or counterclockwise (false)
  */

  // ZEROTH, figure out which points to draw between, for when from and to are spatially-extended elements

  // "corners" are coordinates of points that are eligible to be connected
  function getCorners(element) {
    if(element instanceof Array && !element.data) {
      //an array hopefully containing [x,y] was passed in
      return [{"x":element[0],"y":element[1]}];
    } else if(element.jquery) {
      //a jquery element was passed in; convert to DOM element
      return edgesToCorners(element[0]);
    } else if(element.nodeType) {
      //a DOM element was directly passed in
      return edgesToCorners(element);
    } else {
      //assume it's a D3 element (sloppy, yes)
      return edgesToCorners(element[0][0]);
    }
  }

  // gets from the sides of a bounding rect (left, right, top, bottom)
  //      to its corners (topleft, topright, bottomleft, bottomright)
  function edgesToCorners(element) {
    var corners = [];
    ["left","right"].forEach(function(i) { ["top","bottom"].forEach(function(j) { corners.push({"x":i,"y":j}); }); });
    return corners.map(function(corner) {
      return {"x":element.getBoundingClientRect()[corner.x],
              "y":element.getBoundingClientRect()[corner.y]};
    });
  }

  var fromCorners = getCorners(from),
      toCorners = getCorners(to),
      fromClosest, toClosest, d;

  // check all possible combinations of eligible endpoints for the shortest distance
  fromCorners.forEach(function(fromVal) {
    toCorners.forEach(function(toVal) {
      if(d==null || distance(fromVal,toVal)<d) {
        d = distance(fromVal,toVal);
        fromClosest = fromVal;
        toClosest = toVal;
      }
    });
  });

  from = fromClosest;
  to = toClosest;

  /*
  FIRST, compute radius of circle from desired degrees for arc to subtend.
    read up:  http://mathworld.wolfram.com/Chord.html
          http://www.wolframalpha.com/input/?i=angle+subtended
    n.b.:  bizweek only uses circular arcs, but SVG allows for any ellipse, so r1 == r2 in SVG path below
        bizweek arrows typically subtend 90 or 180 degrees
  */

  // bound acceptable {degrees}, between 1 and 359
  degrees = Math.max(degrees, 1);
  degrees = Math.min(degrees, 359);

  // get the chord length ("height" {h}) between points, by pythagorus
  var h = Math.sqrt(Math.pow((to.x-from.x),2)+Math.pow((to.y-from.y),2));

  // get the distance at which chord of height h subtends {angle} degrees
  var radians = degrees * Math.PI/180;
  var d = h / ( 2 * Math.tan(radians/2) );

  // get the radius {r} of the circumscribed circle
  var r = Math.sqrt(Math.pow(d,2)+Math.pow((h/2),2));

  /*
  SECOND, compose the corresponding SVG arc.
    read up: http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
    example: <path d = "M 200 50 a 90 90 0 0 1 100 0"/>
  */
  var path = "M " + from.x + " " + from.y + " a " + r + " " + r + " 0 0 "+(clockwise ? "1" : "0")+" " + (to.x-from.x) + " " + (to.y-from.y);

  // append path to given {parent} (with class .arrow)
  var arrow = parent.append("path")
    .attr("d", path)
    .attr("marker-end", "url(#arrowhead)")
    .attr("class", "arrow");

  // return a reference to the appended arrow
  return arrow;
}

function distance(from, to) {
  return Math.sqrt(Math.pow(to.x-from.x,2)+Math.pow(to.y-from.y,2));
}

//////////////////////////////////////////////////////////////////////////////////////////
// NUMBER FORMATTING /////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

// only return powers of 10; return blanks for anything else. (for log axis tikcs.)
function bbwNumberFormatLog(dolla) {
    return (Math.round((Math.log(dolla) / Math.LN10) * 100) / 100) % 1 == 0 ? bbwNumberFormat(dolla) : "";
}

// adapted from d3.formatPrefix
function bbwNumberFormat(dolla) {
  var base = Math.max(1, Math.min(1e12, dolla));
  var scaler = bbwFormatPrefix(base);
  return parseFloat(scaler.scale(dolla).toPrecision(3))+scaler.symbol;
}
var bbw_formatPrefixes = [ "p", "n", "µ", "m", "", "k", "m", "b", "t" ].map(bbw_formatPrefix);
function bbwFormatPrefix(value, precision) {
	var i = 0;
	if (value) {
		if (value < 0) value *= -1;
		if (precision) value = d3.round(value, d3_format_precision(value, precision));
		i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
		i = Math.max(-24, Math.min(24, Math.floor((i <= 0 ? i + 1 : i - 1) / 3) * 3));
	}
	return bbw_formatPrefixes[4 + i / 3];
};
function bbw_formatPrefix(d, i) {
	var k = Math.pow(10, Math.abs(4 - i) * 3);
	return {
		scale: i > 4 ? function(d) {
			return d / k;
		} : function(d) {
			return d * k;
		},
		symbol: d
	};
}

// Convert Excel dates into JS date objects
// @author https://gist.github.com/christopherscott/2782634
// @param excelDate {Number}
// @return {Date}
function getDateFromExcel(excelDate) {
  // 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")
  // 2. Convert to milliseconds.
	return new Date((excelDate - (25567 + 1))*86400*1000);
}

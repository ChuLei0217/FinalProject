var scplot;
var rawData = {};
var coordinates = [];
var features = ["Vehicle Name", "Small/Sporty/", "Compact/Large Sedan", "Sports Car", "SUV", "Wagon", "Minivan", "AWD", "RWD", "Retail Price",
                "Dealer Cost", "Engine Size (l)", "Cyl", "HP", "City MPG", "Hwy MPG", "Weight", "Wheel Base", "Len", "Width"];
var featLength = features.length;
var totalNumber = 0;
var currentXAxis = 13; // 1 - 19
var currentYAxis = 9;

var dropSize = 80;
var dropRad = 15;
var canvasWidth = 1230;
var canvasHeight = 780;

var xWeights = [];
var yWeights = [];

function loadData() {
    for(var i = 0; i < featLength; i++) {
        rawData[features[i]] = [];
    }

    //initialize selections
    var selectX = document.getElementById("x-select");
    for(var i = 1; i < featLength; i++) {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(features[i]));
        opt.value = features[i];
        selectX.appendChild(opt);
    }
    selectX.selectedIndex = currentXAxis-1;
    var selectY = document.getElementById("y-select");
    for(var i = 1; i < featLength; i++) {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(features[i]));
        opt.value = features[i];
        selectY.appendChild(opt);
    }
    selectY.selectedIndex = currentYAxis-1;

    //load data
    d3.csv("dataset/04cars data_clean.csv", function(data) {
        totalNumber = data.length;
        for(var i = 0; i < data.length; i++) {
            coordinates.push(new Array());
            for(var j = 0; j < featLength; j++) {
                var feat = features[j];
                rawData[feat].push(data[i][feat])
            }
        }

        for(var i = 1; i < featLength; i++) {
            var featMax = Math.max.apply(null, rawData[features[i]]);
            var featMin = Math.min.apply(null, rawData[features[i]]);
            //console.log(features[i], featMin, featMax);
            for(var j = 0; j < data.length; j++) {
                //var vname = data[j]["Vehicle Name"];
                var cood;
                if(i === 6) cood = 0;
                else cood = (rawData[features[i]][j] - featMin)/(featMax - featMin);
                if(cood < 0 || cood > 1) console.log(cood);
                coordinates[j].push(cood);
            }
        }

        draw();
    })

    //init table
    buildTable(-1);
}

function draw() {
    var cdx = [], cdy = [];
    for(var i = 0; i < totalNumber; i++) {
        cdx.push(coordinates[i][currentXAxis-1]);//加了个-1，因为这个没有第一列的车名，所以要往前数一个
        cdy.push(coordinates[i][currentYAxis-1]);
    }
    var dataToDraw = {featureX: features[currentXAxis], coordsX: cdx,
                      featureY: features[currentYAxis], coordsY: cdy,};
    var conf = {};

    d3.selectAll("svg").remove();
    scplot = ScatterPlot(dataToDraw, conf);
}

updateSelction = function(axis, value) {
    if(axis === 0) {
        currentXAxis = features.indexOf(value);
    } else {
        currentYAxis = features.indexOf(value);
    }
    draw();
}

ScatterPlot = function (dataToDraw, conf) {
    var self = this;

    this.margin = {top: 20, bottom: 240, left: 400, right: 30};
    this.width = canvasWidth - this.margin.left - this.margin.right;
    this.height = canvasHeight - this.margin.top - this.margin.bottom;

    this.svg = d3.select("#controlPanel")
        .append("svg")
        .attr("id", "canvas")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom);

    //scatterplot
    this.scplotView = this.svg.append("g")
        .attr("id", "scatterplot")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    var xMin = Math.min.apply(null, dataToDraw.coordsX);
    var xMax = Math.max.apply(null, dataToDraw.coordsX);
    var yMin = Math.min.apply(null, dataToDraw.coordsY);
    var yMax = Math.max.apply(null, dataToDraw.coordsY);
    this.x = d3.scaleLinear()
        .domain([xMax, xMin])
        .range([this.width, 0]);
    this.scplotView.append("g")
        .attr("transform", "translate("+0+","+(canvasHeight-this.margin.bottom-dropSize*0.25)+")")
        .call(d3.axisBottom(this.x));

    this.y = d3.scaleLinear()
        .domain([yMax, yMin])
        .range([0, this.height]);
    this.scplotView.append("g")
        .attr("transform", "translate("+0+","+0+")")
        .call(d3.axisLeft(this.y));


    this.plot = this.scplotView.append("rect")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("fill", "#EEEEEE")
        .attr("pointer-events", "all");


    var data = [];
    for(var i = 0; i < dataToDraw.coordsX.length; i++) {
        var obj = {dx: dataToDraw.coordsX[i], dy: dataToDraw.coordsY[i], dposition:i};
        data.push(obj);
    }

    this.scplotView.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return self.x(d.dx); } )
        .attr("cy", function (d) { return self.y(d.dy); } )
        .attr("r", 5.0)
        .style("cursor", "resize")
        .on("mouseover", function (d) {
            Tableupdate(d)
        })

    //dropzones
    this.dropzoneView = this.svg.append("g")
        .attr("id", "dropzones");
    this.dropzoneView.append("g")
        .attr("id", "highendY")
        .append("rect")
        .attr("x", this.margin.left-dropSize*1.5)
        .attr("y", this.margin.top)
        .style("fill", "#85cc85");
    this.dropzoneView.append("g")
        .attr("id", "lowendY")
        .append("rect")
        .attr("x", this.margin.left-dropSize*1.5)
        .attr("y", canvasHeight-this.margin.bottom-dropSize)
        .style("fill", "#85cc85");
    this.dropzoneView.append("g")
        .attr("id", "lowendX")
        .append("rect")
        .attr("x", this.margin.left)
        .attr("y", canvasHeight-this.margin.bottom+dropSize*0.25)
        .style("fill", "#85cc85");
    this.dropzoneView.append("g")
        .attr("id", "highendX")
        .append("rect")
        .attr("x", canvasWidth-this.margin.right-dropSize)
        .attr("y", canvasHeight-this.margin.bottom+dropSize*0.25)
        .style("fill", "#85cc85");
    this.dropzoneView.selectAll("rect")
        .attr("width", dropSize)
        .attr("height", dropSize)
        .attr("rx", dropRad)
        .attr("ry", dropRad);

    //y axis
    this.yAxisView = this.svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(30,"+110+")");

    const yScale_y = d3.scaleLinear()
        .range([this.margin.left - 120, 0])
        .domain([1, 0]);
    this.yAxisView.append("g")
        .attr("transform", "translate(45,20)")
        .call(d3.axisTop(yScale_y));

    const xScale_y = d3.scaleBand()
        .range([0, this.height-dropSize*2-20])
        .domain(features.slice(5))
        .padding(0.04)
    this.yAxisView.append("g")
        .attr("transform", "translate(45,20)")
        .call(d3.axisLeft(xScale_y));

    //x axis
    var xavLeft = this.margin.left+dropSize+10,
        xavTop = canvasHeight-this.margin.bottom+dropSize*0.25;
    this.xAxisView = this.svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(490,"+560+")");

    const xScale_x = d3.scaleLinear()
        .range([this.width-dropSize*2-120, 0])
        .domain([1, 0]);
    this.xAxisView.append("g")
        .attr("transform", "translate(60,20)")
        .call(d3.axisTop(xScale_x));

    const yScale_x = d3.scaleBand()
        .range([0, this.margin.bottom-40])
        .domain(features.slice(6))
        .padding(0.015)
    this.xAxisView.append("g")
        .attr("transform", "translate(60,20)")
        .call(d3.axisLeft(yScale_x));

}

ScatterPlot.prototype.redraw = function () {

}


// function buildTable(index) {
//     d3.select("#dataPanel").selectAll("table").remove();
//     var vname = (index === -1) ? "Vehicle Name" : rawData[features[0]][index];
//
//     var table = d3.select("#dataPanel").append("table")
//         .attr("style", "margin-left: 5px; margin-top: 20px;");
//     var thead = table.append("thead");
//     var tbody = table.append("tbody");
//
//     var data = [];
//     var item0 = ["key", "value"];
//     for(var i = 1; i < featLength; i++) {
//         var feat = {key: features[i], value: (index === -1) ? "" : rawData[features[i]][index]};
//         data.push(feat);
//     }
//
//     var item1 = [vname, ""];
//     thead.append("tr")
//         .selectAll("th")
//         .data(item1)
//         .enter()
//         .append("th")
//         .text(function(column) { return column; });
//
//     var rows = tbody.selectAll("tr")
//         .data(data)
//         .enter()
//         .append("tr");
//
//     var cells = rows.selectAll("td")
//         .data(function(row) {
//             return item0.map(function(column) {
//                 return {column: column, value: row[column]};
//             });
//         })
//         .enter()
//         .append("td")
//         .html(function(d) { return d.value; });
// }

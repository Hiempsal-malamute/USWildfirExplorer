dc.treemapChart = function (parent, chartGroup) {
    
    var _chart = dc.baseMixin({});
    var _treemap;

    _chart._doRedraw = function () {
      var _cellData = {
        name: 'tree',
        children: _chart.data()
      };
      _chart.root()
        .selectAll('.node')
        .data(_treemap.nodes)
        .transition().duration(1000)
        .call(_updateCell);
  
      _highlightFilters();
      return _chart;
    };
  
    _chart._doRender = function () {
        var color = d3.scaleOrdinal(d3.schemeCategory10);
    
        _treemap = d3.treemap()
            .size([_chart.width(), _chart.height()])
            .paddingTop(15)
            .paddingInner(1)
            .round(true)
            (d3.hierarchy(_chart.data())
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value));
            // .sticky(true)
            // .value(function (d) { return d.value; });
    
        var _cellData = {
            name: 'tree',
            children: _chart.data()
        };
    
        _chart.root()
            .classed('treemap', true)
            .attr('position', 'relative')
            .attr('height', _chart.height() + 'px')
            .attr('width', _chart.width() + 'px');


        var _node = _chart.root()
            .datum(_cellData)
            .selectAll(".node")
            .data(_treemap.descendants())
            .enter()
            .append('div')
            .attr('class', 'node')
            // .call(_updateCell)
            .style('background', function (d) { return color(d.key); })
            .style('position', 'absolute')
            .text(function (d) { return d.key; })
            .attr('title', _chart.title())
            .on('click', onClick);
    
    
        return _chart;
    };
  
    function _updateCell() {
      this.style('left', function (d) { return d.x + 'px'; })
        .style('top', function (d) { return d.y + 'px'; })
        .style('width', function (d) { return (d.dx - 1) + 'px'; })
        .style('height', function (d) { return (d.dy - 1) + 'px'; })
        .style('font-size', function (d) { return d.value > 0 ? 0.1 * Math.sqrt(d.dx * d.dy) + 'px' : 0; });
    }
  
    function onClick(d, i) {
        _chart.onClick(d, i);
    }
  
    function _highlightFilters() {
      if (_chart.hasFilter()) {
        _chart.root().selectAll('.node').each(function (d) {
          if (_chart.hasFilter(d.key)) {
            _chart.highlightSelected(this);
          }
          else {
            _chart.fadeDeselected(this);
          }
        });
      }
      else {
        _chart.root().selectAll('.node').each(function (d) {
          _chart.resetHighlight(this);
        });
      }
    }
  
    return _chart.anchor(parent, chartGroup);
 };
  
  
var chartExample = {
    initChart: function (data) {
        var ndx = crossfilter(data),
            teamMemberDimension = ndx.dimension(function (d) {
                return d['STAT_CAUSE_DESCR'];
            }),
            teamMemberChart = dc.treemapChart("#teammateChart"),
            teamMemberGroup = teamMemberDimension.group();

        teamMemberChart
            .width(250)
            .height(250)
            .dimension(teamMemberDimension)
            .group(teamMemberGroup)
            .title(function (d) {
                return d.key + ': ' + d.value;
            })
            .valueAccessor(function (d) {
                return d.value;
            });

    //   genderChartDimension = ndx.dimension(function (d) {
    //       return d.Sexo;
    //   }),
    //       genderChart = dc.pieChart("#genderChart"),
    //       genderChartGroup = genderChartDimension.group();

    //   genderChart
    //       .width(100)
    //       .height(100)
    //       .slicesCap(10)
    //       .dimension(genderChartDimension)
    //       .group(genderChartGroup)
    //       .legend(dc.legend())
    //       // workaround for #703: not enough data is accessible through .label() to display percentages
    //       .on('pretransition', function (chart) {
    //           chart.selectAll('text.pie-slice').text(function (d) {
    //               return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%';
    //           })
    //       });

        dc.renderAll(); 
    },
    initData: function () {
        var f = "data/feuxUSA.csv";

        d3.csv(f).then(function (data) {
            chartExample.initChart(data);
        });
    }
};

// chartExample.initData();

// let loadingScreen = document.getElementById("loading-scren");


var map = L.map('map').setView([40.90296, 1.90925], 2);
let bubbleMap = L.map('bubble-map').setView([40.90296, 1.90925], 2);
redrawMap(map);
redrawMap(bubbleMap);

let heatmapLayer = new L.layerGroup({}).addTo(map);
let propSymbolLayer = new L.layerGroup({}).addTo(bubbleMap);

let wTime = 800;
let hTime = 240;

// tiles.addTo(bubbleMap);
L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(bubbleMap);

let nbFires = new dc.NumberDisplay("#nb-fires")
let sizeFires = new dc.NumberDisplay("#size-fires")
var piechart = new dc.PieChart("#test");
var timeChart = new dc.BarChart("#time-chart");
var monthChart = new dc.BarChart("#month-chart");
var heatMapChart = new dc.HeatMap("#heatmap-table");
// var chart = new dc.BubbleChart('#bubble');

var dateFormat = d3.timeFormat("%Y");
var monthFormat = d3.timeFormat("%B");

let dataFiresPath = d3.csv("data/feuxUSA.csv");
let geomUsPath = d3.json('./data/geom_ctr_us.geojson');

promises = [dataFiresPath, geomUsPath];

Promise.all(promises).then(res => {
    fires = res[0];
    geomUs = res[1];

    fires.forEach(d => {
        var tempDate = new Date(d["DISCOVERY_DATE"]);
        d["YEAR"] = new Date(tempDate.toDateString());
        d.month = tempDate.getMonth();
        // d['FIRE_SIZE'] = d['FIRE_SIZE']/2.4711;
    });

    // crossfilter
    let ndx = crossfilter(fires);

    // dimensions
    let allDimension = ndx.dimension(d => {return d}),
        causeDimension  = ndx.dimension(function(d) {return d["STAT_CAUSE_DESCR"];}),
        yearDimension  = ndx.dimension(function(d) {return dateFormat(d["YEAR"]);}),
        monthDimension  = ndx.dimension(function(d) {return monthFormat(d["YEAR"]);}),
        yearMonthDimension  = ndx.dimension(function(d) {return [dateFormat(d["YEAR"]), +d.month];}),
        stateDimension  = ndx.dimension(function(d) {return d["STATE"];});
        sizeDimension  = ndx.dimension(function(d) {return d["FIRE_SIZE"];});
    
    // groups
    let causeGroup = causeDimension.group();
        yearGroup = yearDimension.group();
        monthGroup = monthDimension.group();
        yearMonthGroup = yearMonthDimension.group();
        stateGroup = stateDimension.group(),
        sizeGroup = allDimension.group().reduceSum(d => { return +d["FIRE_SIZE"]});
        all = ndx.groupAll();


    // charts
    nbFires
        .formatNumber(d3.format(","))
        .valueAccessor(function(d){return d; })
        .group(all);

    sizeFires
        .formatNumber(d3.format(",.0f"))
        .valueAccessor(function(d){return d.value; })
        .group(sizeGroup);

    piechart
        .width(350)
        .height(350)
        .slicesCap(6)
        .innerRadius(75)
        .dimension(causeDimension)
        .group(causeGroup)
        // .legend(dc.legend().x(270).highlightSelected(true))
        // workaround for #703: not enough data is accessible through .label() to display percentages
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(function(d) {
                return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
            })
        });


    let minYear = yearDimension.bottom(1)[0]["YEAR"],
        maxYear = yearDimension.top(1)[0]["YEAR"];

    timeChart
        .width(wTime)
        .height(hTime/1.8)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        // .x(d3.scaleTime().domain([minYear,maxYear]))
        // .y(d3.scaleLinear().domain([0,35000]))
        // .xUnits(d3.timeYear)
        .elasticY(true)
        .yAxisLabel("Number of fires")
        // .renderArea(true)
        .dimension(yearDimension)
        .group(yearGroup)
        .brushOn(true);

    monthChart
        .width(wTime)
        .height(hTime/1.8)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxisLabel("Number of fires")
        .dimension(monthDimension)
        .group(monthGroup)
        .brushOn(true);

    heatMapChart
        .width(wTime)
        .height(hTime)
        .dimension(yearMonthDimension)
        .group(yearMonthGroup)
        .keyAccessor(function(d) { return +d.key[0]; })
        .valueAccessor(function(d) { return +d.key[1]; })
        .colorAccessor(d => { return +d.value})
        .colors(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
        .calculateColorDomain();

    let charts = [timeChart,monthChart,piechart,heatMapChart];
    
    drawHeatLayer();
    drawBubbleMapLayer(stateGroup,fires);

    charts.forEach(function (dcChart) {
        dcChart.on("filtered", (chart,filter) => {
            console.log(chart);
            console.log("filtré avec l'argurment " + filter);
            heatmapLayer.clearLayers();
            propSymbolLayer.clearLayers();
            drawHeatLayer();
            drawBubbleMapLayer(stateGroup,fires);
        })
    })


    dc.renderAll();


    function drawBubbleMapLayer(stateNbFires,fires) {
        stateNbFires = stateGroup.all();
        geomUs.features.forEach(feature => {
            stateNbFires.forEach(state => {
                if(state.key == feature.properties["STATE"]) {
                    feature.properties.nb_fires = state.value
                }
            })
        });
        let bubbleLayer = new L.GeoJSON(geomUs, {
            pointToLayer: function(feature, latlng) {	            
                return L.circleMarker(latlng, {
                        fillColor: "red",
                        color: "red",
                        weight: 1, 
                        fillOpacity: 0.6,
                        radius:getRadius(feature.properties.nb_fires)
                    }).on("click", e => {
                        stateFilter = e.sourceTarget.feature.properties["STATE"];
                        fires = fires.filter(d => {
                            return d["STATE"] = stateFilter;
                        });
                        // dc.renderAll();
                    })
            }
        });
        propSymbolLayer.addLayer(bubbleLayer);

        bubbleMap.flyToBounds(bubbleLayer);

        function getRadius(attributeValue) {
            var scaleFactor = 0.01;
            var area = attributeValue * scaleFactor;
            return Math.sqrt(area/Math.PI)*2;			
        }
    };

    function drawHeatLayer() {
        let latlngData = [];
        allDimension.top(Infinity).forEach(d => {
            latlngData.push([d["LATITUDE"],d["LONGITUDE"]])
        });
        map.flyToBounds(latlngData);
        let heat = L.heatLayer(latlngData,{radius: 15, blur: 15, minOpacity:0.2 })
        heatmapLayer.addLayer(heat);
    }

});

function redrawMap(map) {
    L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map)
};
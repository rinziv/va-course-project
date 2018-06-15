import {radialLine, scaleLinear, select, timeParse, range, scaleOrdinal, max, scaleBand, on, selectAll} from "d3";
import MultiChartData from "./data";
import {ORANGE, RED, BLUE, GREEN} from './../constants'
import {APP, CHL, MET, AGO} from './../constants'

/**
 * @see https://spin.atomicobject.com/2015/06/12/objects-around-svg-circle-d3-js/
 */
export default class QuickMultiChart {
    constructor(d3n, selector, data, winddata, chemical = null, month = null) {

        this.d3n = d3n;

        this.chemical = chemical;
        this.month    = month;

        const colorMap = {};

        colorMap[AGO] = ORANGE;
        colorMap[APP] = RED;
        colorMap[CHL] = BLUE;
        colorMap[MET] = GREEN;

        this.colorMap =  colorMap;

        this.data     = data;
        this.winddata = winddata;

        this.factories = [
            [89, 27, 'Roadrunner'],
            [90, 21, 'Kasios'],
            [109, 26, 'Radiance'],
            [120, 22, 'Indigo']
        ];

        this.centers = [
            [62, 21],
            [66, 35],
            [76, 41],
            [88, 45],
            [103, 43],
            [102, 22],
            [89, 3],
            [74, 7],
            [119, 42]
        ];

        this.width  = 500 * 97/62;
        this.height = 500;

        // this.svg = this.d3n.d3.select(selector)
        //     .append("svg")
        //     .attr('class', 'multi_chart')
        //     .attr("width", this.width)
        //     .attr("height",this.height);


        this.svg = d3n.createSVG(this.width, this.height);

        this.createScales()
            .pointFactories()
            .drawCircles()
            .drawPoints();

        this.connectFactory(this.factories[0]);
    }

    createScales() {
        const w = 80;
        const h = 100;

        this.xScale = this.d3n.d3.scaleLinear()
            .domain([42, 139]) //97
            .range([0, this.width]);

        this.yScale = this.d3n.d3.scaleLinear()
            .domain([-7, 55]) //62
            .range([this.height, 0]);

        this.drawCircles().drawPoints();

        return this;
    }

    connectFactory(fentry) {

        let [x, y] = fentry;

        let chart = this;

        this.centers.forEach(function(entry) {

            let [centerX, centerY] = entry;

            chart.svg.append("line")
                .style("stroke", "black")
                .attr("x1", chart.xScale(parseFloat(x)))
                .attr("y1", chart.yScale(parseFloat(y)))
                .attr("x2", chart.xScale(parseFloat(centerX)))
                .attr("y2", chart.yScale(parseFloat(centerY)));
        });

    }

    pointFactories() {
        let chart = this;

        this.svg.selectAll(".circle")
            .data(this.factories)
            .enter().append("circle")
            .attr("cx", function(d){return chart.xScale(d[0])})
            .attr("cy", function(d){return chart.yScale(d[1])})
            .attr("r", 4)
            .attr("fill", "black")
            .attr("fill-opacity", "0.8")
            .on("click", function(d) {

                this.d3n.d3.selectAll("line").remove();
                chart.connectFactory(d);
            });

        this.svg.selectAll(".factory-labels")
            .data(this.factories)
            .enter()
            .append("text")
            .attr('color', 'grey')
            .attr('x', function(d){return chart.xScale(d[0]) + 8})
            .attr('y', function(d){return chart.yScale(d[1]) + 4})
            .text((d, i)=> d[2]);

        return this;
    }

    drawCircles(){

        let chart = this;

        this.svg.selectAll(".circle")
            .data(this.centers)
            .enter().append("circle")
            .attr("cx", function(d){return chart.xScale(d[0])})
            .attr("cy", function(d){return chart.yScale(d[1])})
            .attr("r", 45)
            .attr("fill", "white")
            .attr("fill-opacity", "0.9");

        this.svg.selectAll(".circle")
            .data(this.centers)
            .enter().append("circle")
            .attr("cx", function(d){return chart.xScale(d[0])})
            .attr("cy", function(d){return chart.yScale(d[1])})
            .attr("r", 10)
            // .style("stroke", 'grey')
            .style("fill", "none");
            // .style("stroke-width", '2px');

        this.svg.selectAll(".sensor-labels")
            .data(this.centers)
            .enter()
            .append("text")
            .attr('color', 'grey')
            .attr('x', function(d){return chart.xScale(d[0]) - 4})
            .attr('y', function(d){return chart.yScale(d[1]) + 4})
            .text((d, i)=> i + 1);

        return this;
    }

    drawPoints() {

        let data = MultiChartData.getData(this.data, this.winddata);

        const r = this.d3n.d3.scaleLinear()
            .domain([0, 1])
            .range([10, 43]); //ToDo remove magic constant

        const line = this.d3n.d3.radialLine()
            .radius(function(d) { return r(d[1]); })
            .angle(function(d) { return Math.PI - d[0]; });

        let chart = this;

        this.centers.forEach(function(entry, i) {

            let sel = chart.svg.selectAll("point")
                .data(data[i + 1])
                .enter()
                .append("circle");

                if(chart.chemical !== null) {
                    sel.filter(function(d) {
                        return d[2] === chart.chemical;
                    });
                }

                sel.attr("class", "point")
                .attr("transform", function (d) {

                    const coors = line([d]).slice(1).slice(0, -1);

                    let [centerX, centerY] = entry;
                    let [x, y] = coors.split(',');

                    x = parseFloat(x) + chart.xScale(parseFloat(centerX));
                    y = parseFloat(y) + chart.yScale(parseFloat(centerY));

                    return "translate(" + x + ',' + y + ")"
                })
                .attr("r", 1) // ToDo sqrt scale?
                .attr("fill", function (d, i) {
                    return chart.colorMap[d[2]];
                })

        });

        return this;
    }
}
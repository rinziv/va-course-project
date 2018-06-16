import {radialLine, range, scaleLinear, select} from "d3";
import {MET, ORANGE, AGO, APP, RED, CHL, BLUE, GREEN} from "../constants";

export default class Chart {
    constructor(selector, data, chemical = null, month = null) {

        this.data     = data;
        this.chemical = chemical;
        this.month    = month;

        this.width  = 240; // ToDo -> constants
        this.height = 200;

        // ToDo put in reusable function
        const colorMap = {};

        colorMap[AGO] = ORANGE;
        colorMap[APP] = RED;
        colorMap[CHL] = BLUE;
        colorMap[MET] = GREEN;

        this.colorMap =  colorMap;

        this.svg = select(selector)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

        this.createRadialScale()
            .addPoints()
            .addRadialAxis()
            .addCircularDots()
            .addRadialLabels()
            .addAngleAxis()
            .addRadialDots()
            .addAngleLabels();
    }

    addPoints() {

        let chart = this;

        let line = radialLine()
            .radius(function (d) {
                return chart.r(d[1]);
            })
            .angle(function (d) {
                return -d[0] + Math.PI / 2;
            });

        let selection = this.svg.selectAll("point")
            .data(this.data)
            .enter()
            .append("circle");

        if (chart.chemical !== null) {
            selection.filter(function (d) {
                return d[2] === chart.chemical
            });
        }

        if (chart.month !== null) {
            selection.filter(function (d) {
                return d[3] === chart.month
            });
        }

        selection.attr("class", "point")
            .attr("transform", function (d) {
                let coors = line([d]).slice(1).slice(0, -1);
                return "translate(" + coors + ")"
            })
            .attr("r", 2)
            .attr("fill", function (d, i) {
                return chart.colorMap[d[2]];
            });

        return this;
    }

    createRadialScale() {

        this.radius = Math.min(this.width, this.height) / 2 - 30;

        this.r = scaleLinear()
            .domain([0, 1.0])
            .range([0, this.radius]);

        return this;
    }

    addAngleAxis() {
        this.ga = this.svg.append("g")
            .attr("class", "a axis")
            .selectAll("g")
            .data(range(0, 360, 60))
            .enter().append("g")
            .attr("transform", function(d) { return "rotate(" - d + ")"; })
        ;

        return this;
    }

    addRadialDots() {
        this.ga.append("line")
            .attr("x2", this.radius);

        return this;
    }

    addAngleLabels() {

        let chart = this;

        this.ga.append("text")
            .attr("x", this.radius + 6)
            .attr("dy", ".35em")
            .style("text-anchor", function(d) { return d < 270 && d > 90 ? "end" : null; })
            .attr("transform", function(d) { return d < 270 && d > 90 ? "rotate(180 " + (chart.radius + 6) + ",0)" : null; })
            .text(function(d) { return d + "°"; });

        return this;
    }

    addRadialAxis() {
        this.gr = this.svg.append("g")
            .attr("class", "r axis")
            .selectAll("g")
            .data(this.r.ticks(5).slice(1))
            .enter().append("g");

        return this;
    }

    addCircularDots() {
        this.gr.append("circle")
            .attr("r", this.r);

        return this;
    }

    addRadialLabels() {
        let chart = this;

        this.gr.append("text")
            .attr("y", function(d) { return - chart.r(d) - 4; })
            .attr("transform", "rotate(15)")
            .style("text-anchor", "middle")
            .text(function(d) { return d; });

        return this;
    }
}
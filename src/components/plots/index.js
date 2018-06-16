import React, { Component } from 'react'
import {csvParseRows, select, selectAll} from 'd3';
import {request} from 'd3-request';
import sensorCsv from '../../data/SensorData.csv';
import meteoCsv from '../../data/MeteorologicalData.csv';

import {VECTORIAL, TEMPORAL, DECEMBER, APRIL, AUGUST} from '../../constants'
import {LOG, LINEAR} from '../../constants';

import {connect} from 'react-redux'
import SensorControl from './../buttons/sensor'
import Data from "../../scatter-chart/data";
import {loadData, loadWindData, saveStats} from "../../actions";
import ChartSenMon from "../../scatter-chart/chart-sen-mon";
import ChartSen from "../../scatter-chart/chart-sen";
import MultiChart from "../../multi-group/chart";
import WindChartData from "../../wind-chart/data";
import CircularHeatChart from "../../wind-chart/circular";
import Statistics from "../../statistics";

import D3Node from 'd3-node'
import QuickMultiChart from "../../multi-group/quick-chart";
import MultiChartData from "../../multi-group/data";

import {ORANGE, RED, BLUE, GREEN} from './../../constants'
import {APP, CHL, MET, AGO} from './../../constants'

class Plots extends Component {

    constructor()
    {
        super();
        this.state = {
            chartHtml: null
        }
    }

    static getContainer() {
        return '<div><div class="markdown-body"><table><tbody><tr><td><div class="plot-map"/></td><td><div class="plot-wind"/><div class="plot-sensor"/></td></tr></tbody></table></div></div>';
    }

    static quickMultiChart (rows, winds, selector = '.plot-map') {

        let chart = this;

        let container = this.getContainer();

        let d3n = new D3Node({
            selector,
            container
        });

        let factories = [
            [89, 27, 'Roadrunner'],
            [90, 21, 'Kasios'],
            [109, 26, 'Radiance'],
            [120, 22, 'Indigo']
        ];

        let centers = [
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

        let width = 500 * 97/62;
        let height = 500;

        let svg = d3n.createSVG(width, height);

        const w = 80;
        const h = 100;

        const colorMap = {};

        colorMap[AGO] = ORANGE;
        colorMap[APP] = RED;
        colorMap[CHL] = BLUE;
        colorMap[MET] = GREEN;

        let xScale = d3n.d3.scaleLinear()
            .domain([42, 139]) //97
            .range([0, width]);

        let yScale = d3n.d3.scaleLinear()
            .domain([-7, 55]) //62
            .range([height, 0]);

        svg.selectAll(".circle")
            .data(centers)
            .enter().append("circle")
            .attr("cx", function(d){return xScale(d[0])})
            .attr("cy", function(d){return yScale(d[1])})
            .attr("r", 45)
            .attr("fill", "white")
            .attr("fill-opacity", "0.9");

        svg.selectAll(".circle")
            .data(centers)
            .enter().append("circle")
            .attr("cx", function(d){return xScale(d[0])})
            .attr("cy", function(d){return yScale(d[1])})
            .attr("r", 10)
            // .style("stroke", 'grey')
            .style("fill", "none");
        // .style("stroke-width", '2px');

        svg.selectAll(".sensor-labels")
            .data(centers)
            .enter()
            .append("text")
            .attr('color', 'grey')
            .attr('x', function(d){return xScale(d[0]) - 4})
            .attr('y', function(d){return yScale(d[1]) + 4})
            .text((d, i)=> i + 1);

        svg.selectAll(".circle")
            .data(factories)
            .enter().append("circle")
            .attr("cx", function(d){return xScale(d[0])})
            .attr("cy", function(d){return yScale(d[1])})
            .attr("r", 4)
            .attr("fill", "black")
            .attr("fill-opacity", "0.8")
            .on("click", function(d) {

                d3n.d3.selectAll("line").remove();

                let [x, y] = d;

                centers.forEach(function(entry) {

                    let [centerX, centerY] = entry;

                    svg.append("line")
                        .style("stroke", "black")
                        .attr("x1", xScale(parseFloat(x)))
                        .attr("y1", yScale(parseFloat(y)))
                        .attr("x2", xScale(parseFloat(centerX)))
                        .attr("y2", yScale(parseFloat(centerY)));
                });

            });

        svg.selectAll(".factory-labels")
            .data(factories)
            .enter()
            .append("text")
            .attr('color', 'grey')
            .attr('x', function(d){return xScale(d[0]) + 8})
            .attr('y', function(d){return yScale(d[1]) + 4})
            .text((d, i)=> d[2]);

        let data = MultiChartData.getData(rows, winds);

        const r = d3n.d3.scaleLinear()
            .domain([0, 1])
            .range([10, 43]); //ToDo remove magic constant

        const line = d3n.d3.radialLine()
            .radius(function(d) { return r(d[1]); })
            .angle(function(d) { return Math.PI - d[0]; });

        centers.forEach(function(entry, i) {

            let sel = svg.selectAll("point")
                .data(data[i + 1])
                .enter()
                .append("circle");

            // if(chart.chemical !== null) {
            //     sel.filter(function(d) {
            //         return d[2] === chart.chemical;
            //     });
            // }

            sel.attr("class", "point")
                .attr("transform", function (d) {

                    const coors = line([d]).slice(1).slice(0, -1);

                    let [centerX, centerY] = entry;
                    let [x, y] = coors.split(',');

                    x = parseFloat(x) + xScale(parseFloat(centerX));
                    y = parseFloat(y) + yScale(parseFloat(centerY));

                    return "translate(" + x + ',' + y + ")"
                })
                .attr("r", 1) // ToDo sqrt scale?
                .attr("fill", function (d, i) {
                    return colorMap[d[2]];
                })

        });


        return d3n.chartHTML();
    }

    vectorialViewDraw(rows, winds) {


        this.chartHtml = Plots.quickMultiChart (rows, winds, '.plot-map')

        console.log('chartHtml', this.chartHtml);
        this.setState({chartHtml: this.chartHtml});

        // new MultiChart('.plot-map', rows, winds);
        //
        // let wcd = (new WindChartData());
        //
        // winds.slice(1).forEach(function (row) {
        //     wcd.collectDataItem(row, DECEMBER)
        // });
        //
        // for (let i = 0; i < wcd.cells; i++) wcd.data[i] = wcd.data[i] / wcd.mMax;
        //
        // let data = Object.values(wcd.data);
        //
        // new CircularHeatChart('.plot-wind', [data])
        //     .setInnerRadius(20)
        //     .setRange(["white", "steelblue"])
        //     .setRadialLabels(wcd.getRadialLabels())
        //     .setSegmentLabels(wcd.getSegmentLabels())
        //     .draw();
        //
        // // ToDo substitute with sensor plot legend
        // new CircularHeatChart('.plot-sensor', [data])
        //     .setInnerRadius(20)
        //     .setRange(["white", "steelblue"])
        //     .setRadialLabels(wcd.getRadialLabels())
        //     .setSegmentLabels(wcd.getSegmentLabels())
        //     .draw();
    }

    temporalViewDraw(rows) {

        this.setState({chartHtml:null});

        selectAll("svg").remove();

        let tr = select(".nine");

        for (let i = 0; i < 9; i++) {
            tr.append('td').attr('class', 'plot' + (i + 1));
        }

        let me = this;

        const obj = (new Data(rows));
        const data = obj.getData('SenMon');
        const stats = obj.getStats();

        console.log('stats', stats);

        this.props.saveStats(stats); //ToDo Do I need it?

        const scale = this.props.linearly ? LINEAR : LOG;

        [APRIL, AUGUST, DECEMBER].forEach(function (mon) {
            new ChartSenMon('.plot-mon-' + (mon + 1), data[me.props.sensor][mon], scale);
        });

        for (let i = 0; i < 9; i++) {
            new ChartSen('.plot' + (i + 1), data[i + 1], scale);
        }

        new Statistics('.plot-stat', stats)
    }

    temporalViewUpdate(prevProps) {
        if (this.props.chemical !== prevProps.chemical
            || this.props.sensor !== prevProps.sensor
            || this.props.linearly !== prevProps.linearly
        ) {

            if(this.props.chemical !== prevProps.chemical || this.props.linearly !== prevProps.linearly)
                selectAll("svg").remove();

            if(this.props.sensor !== prevProps.sensor)
                selectAll("svg.sensor").remove();

            let me = this;

            const scale = this.props.linearly ? LINEAR : LOG;

            if (this.props.chemical === null) {

                const data = (new Data(this.props.data)).getData('SenMon');

                [APRIL, AUGUST, DECEMBER].forEach(function (mon) {
                    new ChartSenMon('.plot-mon-' + (mon + 1), data[me.props.sensor][mon], scale);
                });

                new ChartSenMon('.plot-stat', data[this.props.sensor][DECEMBER], scale);// ToDo

                if (this.props.chemical !== prevProps.chemical || this.props.linearly !== prevProps.linearly) {

                    for (let i = 0; i < 9; i++) {
                        new ChartSen('.plot' + (i + 1), data[i + 1], scale);
                    }
                }

            } else {

                let data = (new Data(this.props.data)).getData('SenCheMon');

                [APRIL, AUGUST, DECEMBER].forEach(function (mon) {
                    new ChartSenMon('.plot-mon-' + (mon + 1), data[me.props.sensor][me.props.chemical][mon], scale);
                });

                new ChartSenMon('.plot-stat', data[this.props.sensor][this.props.chemical][DECEMBER], scale);// ToDo

                if (this.props.chemical !== prevProps.chemical || this.props.linearly !== prevProps.linearly) {

                    for (let i = 0; i < 9; i++) {
                        new ChartSen('.plot' + (i + 1), data[i + 1][this.props.chemical], scale);
                    }
                }
            }
        }
    }

    componentDidMount(state) {

        let me = this;

        request(sensorCsv)
            .mimeType("text/csv")
            .get(function (response) {
                let rows = csvParseRows(response.responseText);

                if (me.props.view === TEMPORAL) {
                    me.temporalViewDraw(rows)
                }

                me.props.loadData(rows);
                // ToDo rewrite with d3 v5 with promises
                request(meteoCsv)
                    .mimeType("text/csv")
                    .get(function (r) {
                        let winds = csvParseRows(r.responseText);
                        me.props.loadWindData(winds);

                        if (me.props.view === VECTORIAL) {
                            me.vectorialViewDraw(rows, winds);
                        }

                    });
            });
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if(this.props.view === prevProps.view && this.props.view === TEMPORAL) {
            this.temporalViewUpdate(prevProps)
        }

        if(this.props.view !== prevProps.view && this.props.view === TEMPORAL) {
            this.temporalViewDraw(this.props.data)
        }

        if(this.props.view !== prevProps.view && this.props.view === VECTORIAL) {
            selectAll("svg.multi_chart").remove();
            this.vectorialViewDraw(this.props.data, this.props.winddata)
        }

        if(this.props.chemical !== prevProps.chemical && this.props.view === VECTORIAL) {
            selectAll("svg.multi_chart").remove();
            new MultiChart('.plot-map', this.props.data, this.props.winddata, this.props.chemical);
        }

        if(this.props.month !== prevProps.month && this.props.view === VECTORIAL) {
            selectAll("svg.multi_chart").remove();
            new MultiChart('.plot-map', this.props.data, this.props.winddata, this.props.chemical, this.props.month);
        }
    }

    render = () => {
        let text = JSON.stringify(
            {
                view: this.props.view,
                chemical: this.props.chemical,
                month: this.props.month,
                daily: this.props.daily,
                linearly: this.props.linearly,
                sensor: this.props.sensor
            }, true, 2);


        if (this.props.view === TEMPORAL) {

            let titles = [];
            for(let i = 0; i < 9; i++) {
                titles.push(<SensorControl value={i + 1}/>)
            }

            return (
                <div>
                    {/*<div>state: {text}</div>*/}
                    <div className="markdown-body">
                        <table className="wrapper">
                            <tbody>
                            <tr>
                                <td>
                                    <table className="sensors">
                                        <tr>
                                            <th>April</th>
                                        </tr>
                                        <tr>
                                            <td className={'plot-mon-' + (APRIL + 1)}/>
                                        </tr>
                                    </table>
                                </td>
                                <td>
                                    <table className="sensors">
                                        <tr>
                                            <th>August</th>
                                        </tr>
                                        <tr>
                                            <td className={'plot-mon-' + (AUGUST + 1)}/>
                                        </tr>
                                    </table>
                                </td>
                                <td>
                                    <table className="sensors">
                                        <tr>
                                            <th>Decembre</th>
                                        </tr>
                                        <tr>
                                            <td className={'plot-mon-' + (DECEMBER + 1)}/>
                                        </tr>
                                    </table>
                                </td>
                                <td>
                                    <table>
                                        <tr>
                                            <th/>
                                        </tr>
                                        <tr>
                                            <td/>
                                        </tr>
                                    </table>
                                </td>
                                <td>
                                    <table className="sensors">
                                        <tr>
                                            <th>Statistics</th>
                                        </tr>
                                        <tr>
                                            <td className="plot-stat"/>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <div className="wrapper">
                            <table className="sensors">
                                <tbody>
                                <tr>{titles}</tr>
                                <tr className="nine"/>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )
        }


        // const options = { selector: '#chart', container: '<div id="container"><div id="chart"></div></div>' }
        // const d3n = new D3Node(options) // initializes D3 with container element
        // const d3 = d3n.d3
        // d3.select(d3n.document.querySelector('#chart')).append('span') // insert span tag into #chart
        // //return d3n.html()   // output: <html><body><div id="container"><div id="chart"><span></span></div></div></body></html>
        // let html = d3n.chartHTML()  // output: <div id="chart"><span></span></div>
        //
        // console.log(d3n.chartHTML());


// console.log('chartHtml', this.chartHtml);


        // return (<div className="content" dangerouslySetInnerHTML={{__html: this.chartHtml}}></div>)

        return (
            <div>
                {/*<div>state: {text}</div>*/}
                <div className="markdown-body">
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <div dangerouslySetInnerHTML={{__html: this.chartHtml}} />
                                </td>
                                <td>
                                    <div className="plot-wind"/>
                                    <div className="plot-sensor"/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        view: state.view,
        chemical: state.chemical,
        month: state.month,
        sensor: state.sensor,
        daily: state.daily,
        linearly: state.linearly,
        data: state.data,
        winddata:state.winddata,
        stats: state.stats
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadData: data => dispatch(loadData(data)),
        loadWindData: data => dispatch(loadWindData(data)),
        saveStats: stats => dispatch(saveStats(stats))
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(Plots);
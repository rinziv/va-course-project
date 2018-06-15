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

class Plots extends Component {

    static getContainer() {
        return (
            <div>
                {/*<div>state: {text}</div>*/}
                <div className="markdown-body">
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                <div className="plot-map"/>
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

    static quickMultiChart (rows, winds, selector = '.plot-map') {

        let container = this.getContainer();

        let d3n = new D3Node({
            selector,
            container
        });

        let ch = new QuickMultiChart(d3n, selector, rows, winds);

        return ch.d3n;
    }

    vectorialViewDraw(rows, winds) {

        new MultiChart('.plot-map', rows, winds);
        //Plots.quickMultiChart(rows, winds, '.plot-map');

        let wcd = (new WindChartData());

        winds.slice(1).forEach(function (row) {
            wcd.collectDataItem(row, DECEMBER)
        });

        for (let i = 0; i < wcd.cells; i++) wcd.data[i] = wcd.data[i] / wcd.mMax;

        let data = Object.values(wcd.data);

        new CircularHeatChart('.plot-wind', [data])
            .setInnerRadius(20)
            .setRange(["white", "steelblue"])
            .setRadialLabels(wcd.getRadialLabels())
            .setSegmentLabels(wcd.getSegmentLabels())
            .draw();

        // ToDo substitute with sensor plot legend
        new CircularHeatChart('.plot-sensor', [data])
            .setInnerRadius(20)
            .setRange(["white", "steelblue"])
            .setRadialLabels(wcd.getRadialLabels())
            .setSegmentLabels(wcd.getSegmentLabels())
            .draw();
    }

    temporalViewDraw(rows) {

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
                            //me.vectorialViewDraw(rows, winds)

                            me.html = Plots.quickMultiChart(rows, winds, '.plot-map');
                            console.log(me.html);

                        }

                    });
            });
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if(this.props.view !== prevProps.view && this.props.view === VECTORIAL) {
            this.vectorialViewDraw(this.props.data, this.props.winddata)
        }

        if(this.props.view === prevProps.view && this.props.view === TEMPORAL) {
            this.temporalViewUpdate(prevProps)
        }

        if(this.props.view !== prevProps.view && this.props.view === TEMPORAL) {
            this.temporalViewDraw(this.props.data)
        }

        if(this.props.view !== prevProps.view && this.props.view === VECTORIAL) {
            selectAll("svg.multi_chart").remove();
            new MultiChart('.plot-map', this.props.data, this.props.winddata);
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

    render_ = () => {
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

        return Plots.getContainer();
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
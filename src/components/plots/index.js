import React, { Component } from 'react'
import {request} from 'd3-request';
import sensorCsv from '../../data/ch2/SensorData.csv';
import meteoCsv from '../../data/ch2/MeteorologicalData.csv';
import polarChart from '../../polar-chart'
import scatterChart from '../../scatter-chart'
import multiChart from '../../multi-chart'
import multiGroup from '../../multi-group'

export default class Plots extends Component {
    state = {
        data: []
    };

    componentDidMount_(state) {
        request(meteoCsv)
            .mimeType("text/csv")
            .get(polarChart);
    }

    componentDidMount_(state) {
        request(sensorCsv)
            .mimeType("text/csv")
            .get(scatterChart);
    }

    componentDidMount_(state) {
        request(meteoCsv)
            .mimeType("text/csv")
            .get(multiChart);
    }

    componentDidMount(state) {
        request(meteoCsv)
            .mimeType("text/csv")
            .get(multiGroup);
    }

    render = () => (
        <table>
            <tbody>
            <tr valign="top">
                <td className="plot1" width="85%"/>
                <td width="5%">Plot</td>
                <td width="5%">Plot</td>
                <td width="5%">Plot</td>
            </tr>
            </tbody>
        </table>
    )
}
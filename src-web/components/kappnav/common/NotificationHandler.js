/*****************************************************************
*
* Copyright 2019 IBM Corporation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
* http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*****************************************************************/

// This handler will keep polling for new events and keep track of what should be shown
// to the user

import React from 'react'
import moment from 'moment'
import Notification from './Notification'

const api_polling_intervals_milliseconds = 30000 // ms
const localStorage_key = 'timestamp-of-last-api-poll'

export default class NotificationHandler extends React.PureComponent {
    
    constructor(props) {
        super(props)
        this.state = {
            completed_commands: []
        }
    }

    render() {
        const { completed_commands } = this.state
        let renderResult = <div id="notification-handler"></div>
        if(!completed_commands || completed_commands.length === 0) {
            // return zero notifications, only return the handler
            return renderResult
        } else {
            let commands = completed_commands.commands
            renderResult =
                <div id="notification-handler">
                    {commands.map((command) => <Notification type='completed' result={command} />)}
                </div>
            return renderResult
        }
    }
    
    componentDidMount() {
        // Do initial fetch of completed jobs
        this.getCompletedJobs()

        // Setup the continuous API polling
        this.timer = setInterval(
                () => this.getCompletedJobs(), 
                api_polling_intervals_milliseconds);
    }
    
    componentWillUnmount() {
        // Need to make sure interval is stopped when component
        // is not being used
        clearInterval(this.timer)
    }

    /**
     * Record the last timestamp the API was polled
     */
    setLastAPICheckTime() {
        const store = window.localStorage
        const currentTime = moment()
        store.setItem(localStorage_key, currentTime)
    }

    /**
     * Return the last timestamp the API was polled
     */
    getLastAPICheckTime() {
        return window.localStorage.getItem(localStorage_key)
    }

    /**
     * Poll for completed jobs only if the last time polled has reached or exceeded 
     * a set amount of time passed relative to current time.
     */
    getCompletedJobs() {
        if(! this.isItTimeToPollAPI()) {
            // Too early to poll API, already polled recently
            return
        }

        // API mandates `?time=` format to be:
        // yyyy-MM-dd'T'HH:mm:sss (without the ' around the T)
        const timeStampFromThirtySecondsAgo = 
            this.getPastTimeStampFrom(api_polling_intervals_milliseconds).format('YYYY-MM-DDTHH:mm:ss')

        fetch('/kappnav/resource/commands?time=' + timeStampFromThirtySecondsAgo)
            .then(result => result.json())
            .then(result => this.processCompletedJobs(result))
    }

    /**
     * Do what is needed to be done right after calling getting a successful response from
     * polling the API for completed jobs
     * @param {*} result - json response from API call
     */
    processCompletedJobs(result) {
        this.setState({ completed_commands: result })
        this.setLastAPICheckTime()
    }

    /**
     * Helper method to do date calculation on whether the last timestamp
     * the API was polled exceeds a certain threshold.  Essentially, the method
     * enforces "We polled 30 seconds ago, don't poll" and "It's been 30 seconds or more
     * seconds since we last polled".
     */
    isItTimeToPollAPI() {
        let last_time_polled = this.getLastAPICheckTime()
        if(! last_time_polled) {
            // No history of past polling, assume we need to poll immedately
            return true
        }
        last_time_polled = moment(last_time_polled) // convert to a moment object to do time malipulation
        const next_polling_timestamp = last_time_polled.add('milliseconds', api_polling_intervals_milliseconds)
        const current_timpstamp = moment()

        // current time is past next scheduled polling, POLL API!
        return current_timpstamp.isAfter(next_polling_timestamp) 
    }

    /**
     * Method that calculates the timestamp from (current time - numMillisecondsAgo)
     * @param {*} numMillisecondsAgo - How far back from current time in milliseconds
     */
    getPastTimeStampFrom(numMillisecondsAgo) {
        return moment().subtract('milliseconds', numMillisecondsAgo);
    }
}

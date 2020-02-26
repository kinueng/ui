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

/** 
 * This handler will keep polling for new events and keep track of what should be shown
 * to the user.
 */


import React from 'react'
import moment from 'moment'
import Notification from './Notification'
import { connect } from 'react-redux'

const default_api_polling_intervals_milliseconds = 30000 // ms

// Browser local storage keys - start
const localStorage_key_polling_time = 'timestamp-of-last-api-poll'
const localStorage_key_last_seen_completed_job_timestamp = 'timestamp-of-last-seen-completed-job'
// Browser local storage keys - end

class NotificationHandler extends React.PureComponent {

    intervalID = 0
    
    constructor(props) {
        super(props)
        this.state = {
            completed_commands: []
        }
    }

    /**
     * Get the polling interval from the Kappav configuration
     */
    getPollingIntervalFromConfig() {
        const interval = this.props.baseInfo.appNavConfigMap.completedJobsPollingInterval
        if(! interval) {
            // return the default
            return default_api_polling_intervals_milliseconds 
        } else {
            return parseInt(interval)
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
                    {commands.map((command) => <Notification type='completed' result={command} key={Math.random()} />)}
                </div>
            return renderResult
        }
    }
    
    componentDidMount() {
        // Do initial fetch of completed jobs
        this.getCompletedJobs()

        const pollingInterval = this.getPollingIntervalFromConfig()

        // Setup the continuous API polling
        this.intervalID = setInterval(
                () => this.getCompletedJobs(), 
                pollingInterval);
    }
    
    componentWillUnmount() {
        // Need to make sure interval is stopped when component
        // is not being used
        clearInterval(this.intervalID)
    }

    /**
     * Record the last timestamp the API was polled
     */
    setLastAPICheckTime() {
        const store = window.localStorage
        const currentTime = moment()
        store.setItem(localStorage_key_polling_time, currentTime)
    }

    /**
     * Return the last timestamp the API was polled
     */
    getLastAPICheckTime() {
        return window.localStorage.getItem(localStorage_key_polling_time)
    }

    /**
     * Record the most recent completed job's completion timestamp
     * 
     * @param {*} jobs - array containing jsons that represent each job
     */
    setMostRecentJobCompletionTime(jobs) {
        if(!jobs || !jobs.commands || jobs.commands.length === 0) {
            // No recently completed jobs, do nothing
            return undefined
        }

        let timestamps = []
        jobs.commands.forEach(job => {
            // Extract all the completion timestamps into an array
            timestamps.push(job.status.completionTime)
        })
        // sort should place the most recent timestamp at the last index of the array
        // We cannot assume the timestamps will be sorted
        timestamps.sort()
        let mostRecentTimestamp = timestamps[timestamps.length - 1]

        const store = window.localStorage
        store.setItem(localStorage_key_last_seen_completed_job_timestamp, mostRecentTimestamp)
    }

    /**
     * Get the current time from the Kubernetes platform where
     * the jobs are running.
     */
    getPlatformCurrentTime() {
        return fetch('/kappnav/resource/command-time')
            .then(result => result.json())
            .then(json => {
                return json.time
            })
    }

    /**
     * Poll for completed jobs only that happened after a particular time
     */
    getCompletedJobs() {
        this.getTimeStampOfLastSeenCompletedJob().then(timestamp => {
            fetch('/kappnav/resource/commands?time=' + timestamp)
                .then(result => result.json())
                .then(result => this.processCompletedJobs(result))
        })
    }

    /**
     * Do what is needed to be done right after calling getting a successful response from
     * polling the API for completed jobs
     * @param {*} result - json response from API call
     */
    processCompletedJobs(result) {
        // The reason we are recording the most recent job completion time
        // is to have the polling always ask for any jobs that completed after the
        // last seen completed job.
        this.setMostRecentJobCompletionTime(result)
        this.setLastAPICheckTime()
        this.setState({ completed_commands: result })
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
        const next_polling_timestamp = last_time_polled.add(api_polling_intervals_milliseconds, 'milliseconds')
        const current_timestamp = moment()

        // current time is past next scheduled polling, POLL API!
        return current_timestamp.isAfter(next_polling_timestamp) 
    }

    /**
     * Method that calculates the timestamp from (current time - numMillisecondsAgo)
     * @param {*} numMillisecondsAgo - How far back from current time in milliseconds
     */
    getPastTimeStampFrom(numMillisecondsAgo) {
        return moment().subtract(numMillisecondsAgo, 'milliseconds');
    }

    getTimeStampOfLastSeenCompletedJob() {
        let timestamp = window.localStorage.getItem(localStorage_key_last_seen_completed_job_timestamp)
        if(! timestamp) {
            // fetch the current time of the platform.  We will assume this is the
            // users first time using the UI.  The current time of the platform will
            // be the starting timestamp we use to get the completd jobs last seen by
            // the user
            return this.getPlatformCurrentTime().then(timestamp => {
                const store = window.localStorage
                store.setItem(localStorage_key_last_seen_completed_job_timestamp, timestamp)
                return timestamp
            })
        } else {
            return Promise.resolve(timestamp)
        }
    }
}

export default connect(
    (state) => ({baseInfo: state.baseInfo})
)(NotificationHandler)

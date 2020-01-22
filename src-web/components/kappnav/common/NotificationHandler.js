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

const api_polling_intervals_milliseconds = 30000
const localStore_key = 'timestamp-of-last-api-poll'

export default class Notification extends React.PureComponent {
    
    constructor(props) {
        super(props)
    }
    
    render() {
        return(<div id="notification-handler"></div>)
    }
    
    componentDidMount() {
        this.setLastAPICheckTime()

        // Get last time we checked API and calculate
        // when to check again
        this.timer = setInterval(
                () => this.getCompletedJobs(), 
                api_polling_intervals_milliseconds);
    }
    
    componentWillUnmount() {
        // Save last time we checked the API
        this.setLastAPICheckTime()

        // Need to make sure interval is stopped when component
        // is not being used
        clearInterval(this.timer)
    }

    setLastAPICheckTime() {
        const store = window.localStorage
        const currentTime = moment()
        store.setItem(localStore_key, currentTime)
    }

    getLastAPICheckTime() {
        return windows.localStore.getItem(localStore_key)
    }

    getUnreadNotifications() {

    }

    getCompletedJobs() {
        this.setLastAPICheckTime()

        // API mandates `?time=` format to be yyyy-MM-dd'T'HH:mm:sss
        const timeStampFromThirtySecondsAgo = 
            this.getTimeStampFrom(30000).format('YYYY-MM-DDTHH:mm:sss')

        fetch('/kappnav/resource/commands?time=' + timeStampFromThirtySecondsAgo)
            .then(result => result.json())
            .then(result => this.setState({ completed_commands: result }));
    }

    getTimeStampFrom(numMillisecondsAgo) {
        return moment().subtract('milliseconds', numMillisecondsAgo);
    }
}
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

 // This component handles displaying and managing notifications

import React from 'react'
import { ToastNotification, Icon } from 'carbon-components-react'
import moment from 'moment'
import msgs from '../../../../nls/kappnav.properties'
import {CONTEXT_PATH} from '../../../actions/constants'

const notificationTimeout = 5000 // ms, how long before auto hiding the notification

const _caption = 
    <div>
        {new moment().format('HH:mm:ss   LL')}
        <a href={location.protocol + '//' + location.host + CONTEXT_PATH + '/jobs'}>
            <Icon className="launch-icon"
                name='launch'
                description={msgs.get('toaster.action.caption')} 
            />
        </a>
    </div>

export default class Notification extends React.PureComponent {

    constructor(props) {
        super(props)
        const { type, result } = this.props

        let _title = this._determineTitleBasedOnType(type)
        
        const _subtitle =
            <div>
            <h3> {msgs.get('toaster.action.subtitle', [result.metadata.annotations['kappnav-job-action-text'], result.metadata.labels['kappnav-job-component-name']])}</h3>
            <br />
            </div>

        this.state = {
            title: _title,
            subtitle : _subtitle,
            handleClose: this.props.handleClose
        }
    }

    _determineTitleBasedOnType(notification_type) {
        if(notification_type === 'initiated') {
            return msgs.get('toaster.action.success')
        } else if(notification_type === 'completed') {
            return msgs.get('toaster.action.completed.title')
        } else {
            return ''
        }
    }

    render() {
        const { title, subtitle, handleClose } = this.state
        return ( 
            <ToastNotification
                // Using key attribute as a workaround for problem: https://github.com/carbon-design-system/carbon/issues/4211
                key={'toast-notification-' + new Date().getTime()}
                caption={_caption}
                hideCloseButton={false}
                iconDescription={msgs.get('modal.button.close.the.modal')}
                onCloseButtonClick={handleClose}
                kind="info"
                notificationType="toast"
                role="alert"
                className='kv--toaster-notification'
                subtitle={subtitle}
                timeout={notificationTimeout}
                title={title}
            />
        )
    }
}
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

'use strict'

import React from 'react'
import { Modal, Loading } from 'carbon-components-react'
import msgs from '../../../../nls/kappnav.properties'
import { withRouter } from 'react-router-dom'
import { REQUEST_STATUS, RESOURCE_TYPES } from '../../../actions/constants'
import { translateKind, getToken } from '../../../actions/common'

class RemoveResourceModal extends React.PureComponent {

  constructor (props){
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit() {
    var deleteCallback = function(response){
      if(response.ok) {
        this.props.handleClose(true)
      } else {
        this.setState({reqErrorMsg: [response.status + ' ' + response.statusText]})
      }
    }.bind(this);

    fetch(this.props.submitUrl, {
      method: 'DELETE',
      headers: {
        "CSRF-Token": getToken()
      }
    })
      .then(response => deleteCallback(response))
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.reqStatus === REQUEST_STATUS.IN_PROGRESS && nextProps.reqStatus === REQUEST_STATUS.DONE)
      this.props.handleClose()
  }

  render() {
    const { reqStatus, reqErrorMsg, open, label, data } = this.props

    var name = (data.metadata && data.metadata.name) ? data.metadata.name : ''

    let modalLabel, modalHeading
    let upperCaseKind = this.props.data.kind
    upperCaseKind = upperCaseKind ? upperCaseKind.toUpperCase() : upperCaseKind

    if(RESOURCE_TYPES.APPLICATION.name === upperCaseKind) {
      modalLabel = translateKind(this.props.data.kind)
      modalHeading = msgs.get('modal.remove.application')
    } else if(RESOURCE_TYPES.JOB.name === upperCaseKind) {
      modalLabel = translateKind(this.props.data.kind)
      modalHeading = msgs.get('modal.remove.job')
    } else {
      modalLabel = translateKind(this.props.data.kind)
      modalHeading = msgs.get(label.heading, [modalLabel])
    }

    return (
      <div>
        {reqStatus === REQUEST_STATUS.IN_PROGRESS && <Loading />}
        <Modal
          danger
          id='remove-resource-modal'
          iconDescription={msgs.get('modal.button.close.the.modal')}
          open={open}
          primaryButtonText={msgs.get(label.primaryBtn)}
          secondaryButtonText={msgs.get('modal.button.cancel')}
          modalLabel={modalLabel}
          modalHeading={modalHeading}
          onRequestClose={this.props.handleClose}
          onRequestSubmit={this.handleSubmit}
          role='region'
          modalAriaLabel={modalHeading}
          aria-label={modalHeading}>
          <p>
            {msgs.get('modal.remove.confirm', [name])}
          </p>
        </Modal>
      </div>
    )
  }
}

export default withRouter(RemoveResourceModal)

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
import { ComposedModal, ModalHeader, ModalBody, ToastNotification, Icon } from 'carbon-components-react'
import {CONTEXT_PATH} from '../../../actions/constants'
import { withRouter } from 'react-router-dom'
import msgs from '../../../../nls/kappnav.properties'
import moment from 'moment';

require('../../../../scss/modal.scss')
class ActionMessageModal extends React.PureComponent {

  constructor (props){
    super(props)

    this.handleClose = this.handleClose.bind(this)
  }

  handleClose(clearForm){
    //reset the form
    clearForm()
    this.props.handleClose()
  }

  shouldComponentUpdate(nextProps) {
    if(this.props.open === nextProps.open) {
      //We only need to change our disply if the open state changes
      return false
    }
    return true
  }

  render() {
    const { open, label, handleClose, result, error } = this.props
    
    if(error) {
      //Failed to submit action without inputs (ie, we didn't pop up a dialog, we just submitted right away).
      //In this case there is no dialog to display errors on, so we will show the error here.
      return (
        <ComposedModal
          // https://github.com/carbon-design-system/carbon/issues/4036
          // Carbon Modal a11y focus workaround
          focusTrap={false}
          className='bx--modal--danger'
          id='submit-action-message-dialog'
          role='region'
          selectorPrimaryFocus='.bx--modal-close'
          aria-label={'Label'}
          open={open}>
           <ModalHeader buttonOnClick={handleClose}>
            <h4 className="bx--modal-header__label"></h4>
            <h2 className="bx--modal-header__heading">{label.label}</h2>
          </ModalHeader>
          <ModalBody>

            {msgs.get('job.failure', [error])}

  
          </ModalBody>
        </ComposedModal>
      )
    } else if (result) {
      //  We are keeping the toaster code here as of now but in the future interation, we will be moving the 
      //  Toaster component to a different React class Component.
      if (open) {
        return (
          <ToastNotification
            caption={
              <div>
                {new moment().format('HH:mm:ss   LL')}
                <a href={location.protocol + '//' + location.host + CONTEXT_PATH + '/jobs'}>
                  <Icon
                    className="launch-icon"
                    name='launch'
                    description={msgs.get('toaster.action.caption')} />
                </a>
              </div>
            }
            hideCloseButton={false}
            iconDescription={msgs.get('modal.button.close.the.modal')}
            onCloseButtonClick={handleClose}
            kind="info"
            notificationType="toast"
            role="alert"
            className='toaster-style'
            subtitle={
              <div>
                <h3> {msgs.get('toaster.action.subtitle', [result.metadata.annotations['kappnav-job-action-text'], result.metadata.labels['kappnav-job-component-name']])}</h3>
                <br />
              </div>
            }
            timeout={5000}
            title={msgs.get('toaster.action.success')}
          />
        )
      }
      else {
        return (<div />)
      }
    } else {
      return (<div/>)
    }
    
  }
}

export default withRouter(ActionMessageModal)

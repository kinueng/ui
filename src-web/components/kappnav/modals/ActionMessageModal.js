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
import { ComposedModal, ModalHeader, ModalBody } from 'carbon-components-react'
import { withRouter } from 'react-router-dom'
import msgs from '../../../../nls/kappnav.properties'
import Notification from '../common/Notification'

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
          <Notification result={result} handleClose={handleClose}/>
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

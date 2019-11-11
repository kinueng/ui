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
import { Form, Modal, InlineNotification, TextInput, Select, SelectItem } from 'carbon-components-react'
import msgs from '../../../../nls/kappnav.properties'
import { FieldWrapper } from '../common/FormField'
import { getToken } from '../../../actions/common'
import lodash from 'lodash'

const withForm = (Component, initialForm) => {

  return class extends React.PureComponent {

    constructor(props) {
      super(props)
      this.onChange = this.onChange.bind(this)
      this.onSubmit = this.onSubmit.bind(this)
      this.clearForm = this.clearForm.bind(this)
      this.state = lodash.cloneDeep(initialForm)
    }

    render() {
      const {form, reqErrorMsg} = this.state
      return <Component {...this.props} onChange={this.onChange} clearForm={this.clearForm} submitForm={this.onSubmit} form={form} reqErrorMsg={reqErrorMsg}/>
    }

    clearForm(){
      //reset the form
      this.setState(lodash.cloneDeep(initialForm))
      this.setState({reqErrorMsg: []})
    }

    onChange(field, optional, value) {
      if (arguments.length == 0) {
        this.setState(lodash.cloneDeep(initialForm))
      } else {
        let form = Object.assign({}, this.state.form)
        lodash.set(form, field, value)
        if(optional!=undefined && !optional && !value){
          lodash.set(form, ['error', field], true)
        } else {
          lodash.set(form, ['error', field], false)
        }
        this.setState({form, reqErrorMsg: []})
      }
    }

    onSubmit() {
        var submitCallback = function(result){
  
          if(result == null && !this.props.submitNoInput) {
            //The request failed.  If there are inputs, then the error message is on the modal, so we don't want to close it.
            return
          } else if(result!=null && result.error){
            //Validation error
            this.setState({reqErrorMsg: [result.error]})

            if(!this.props.submitNoInput) {
              //result is on the modal, don't close it
              return
            }
          }

          this.props.handleClose()

          //Open modal to display response
          window.secondaryHeader.showActionMessageModal(true, result, this.state.reqErrorMsg && this.state.reqErrorMsg[0])
          
          //Clear everything out for next action
          this.clearForm()    
        }.bind(this);
    
        var data = {}
        var input = this.props.input
        if(input && input.fields) {
          for(var fieldName in input.fields) {
            if(this.state.form[fieldName] != undefined){
              data[fieldName] = this.state.form[fieldName]
            } else {
              //The value isn't in the form because it wasn't changed.  I could not find a good way to 
              //populate the form with the default values because the form initialization happens before we know what data belongs on the form
              data[fieldName] = document.getElementById(fieldName).value
            }
          }
        }
          
        document.getElementById("app").style.cursor = "wait"; 
        fetch(this.props.submitUrl, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "x-user": document.documentElement.getAttribute("user"),
            "CSRF-Token": getToken()
          },
          body: JSON.stringify(data)
        })
        .then(response => {
          document.getElementById("app").style.cursor = "pointer"; 
          if (response.ok) {
            if(response.status === 207) {
              var that= this;
              response.json()
              .then(function(data) {
                //Api Exception. printing the exception.
                that.setState({reqErrorMsg: [msgs.get('job.failure.207',[data.status + ": "+ data.message])]})
                return null
              })
            } else{
              return response.clone().json();
            }
          } else {
            if(response.status === 400 || response.status === 504) {
              this.setState({reqErrorMsg: [msgs.get('job.failure.400')]})
            } else if(response.status === 422 || response.status === 500) {
              //Error validating the inputs
              return response.clone().json();
            } else {
              this.setState({reqErrorMsg: [response.status + ' ' + response.statusText]})
            }
            
            return null
          }
        })
        .then(result => submitCallback(result))
      }
  }
}

const initialForm = { 
  //This is basically empty because at creation time we don't know yet what fields belong to this form
  form: {
    error: {}
  }
}

export const transform = (field, optional, handleChange, event) => {
  handleChange(field, optional, event.target.value)
}

class ActionModal extends React.PureComponent {

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
    if(!this.props.open && nextProps.open && nextProps.submitNoInput) {
      //On the first time we open with submitNoInput, just sumit the form and return false
      this.props.submitForm()
      return false
    }
    return true
  }

  render() {
    const { open, label, data, onChange, clearForm, submitForm, form, input, reqErrorMsg, submitNoInput } = this.props

    var fields = []
    if(input && input.fields) {
      for(var fieldName in input.fields) {
        var tempField = input.fields[fieldName]
        tempField.name = fieldName
        fields.push(tempField)
      }
    }

    if(submitNoInput) {
      return ( <div/> )
    } else {
      return (
        <div> 
          <Modal
            // https://github.com/carbon-design-system/carbon/issues/4036
            // Carbon Modal a11y focus workaround
            focusTrap={false}
            id='submit-action-resource-modal'
            open={open}
            iconDescription={msgs.get('modal.button.close.the.modal')}
            primaryButtonText={msgs.get(label.primaryBtn)}
            secondaryButtonText={msgs.get('modal.button.cancel')}
            modalLabel={data && data.metadata && data.metadata.name ? data.metadata.name : ''}
            modalHeading={label.label}
            onRequestClose={this.handleClose.bind(this, clearForm)}
            onRequestSubmit={submitForm}
            role='region'
            modalAriaLabel={msgs.get(label.heading)}
            selectorPrimaryFocus='.bx--modal-close'
            aria-label={msgs.get(label.heading)}>
            {reqErrorMsg && reqErrorMsg.length > 0 &&
              reqErrorMsg.map((err,key) => <InlineNotification key={key} kind='error' title='' subtitle={err} iconDescription={msgs.get('svg.description.error')} />)
            }
            <div>
            <Form>
            {fields && fields.map((field, key) =>
              {
                if(field.type == "string") {
                  return (
                    <FieldWrapper key={'fw'+key} labelText={field.label} content={field.description} required={field.optional==false}>
                      <TextInput
                        id={field.name}
                        hideLabel
                        className='bx--text-input-override'
                        labelText={field.label}
                        value={form[field.name] != undefined ? form[field.name] : field.default}
                        onChange={transform.bind(null, field.name, field.optional, onChange)}
                        invalid={form.error && form.error[field.name]}
                        invalidText={` ${msgs.get('formerror.required')}`} />
                    </FieldWrapper>
                  )
                } else {
                  return (
                    <FieldWrapper key={'fw'+key} labelText={field.label} content={field.description} required={field.optional==false}>
                      <Select
                        id={field.name}
                        value={form[field.name] != undefined ? form[field.name] : field.default ? field.default : field.values[0]}
                        hideLabel
                        onChange={transform.bind(null, field.name, field.optional, onChange)}
                      >
                        {field.values.map((value, index) => <SelectItem key={index} text={value} value={value} />)}
                      </Select>
                    </FieldWrapper>
                  )
                }
              }
            )}

            </Form>
            </div>
          </Modal>
        </div>
      )
    }
  }
}

export default withForm(ActionModal, initialForm)

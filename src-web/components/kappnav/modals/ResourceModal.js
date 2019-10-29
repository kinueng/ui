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
import lodash from 'lodash'
import { Modal, Loading, InlineNotification } from 'carbon-components-react'
import msgs from '../../../../nls/kappnav.properties'
import { REQUEST_STATUS, RESOURCE_TYPES } from '../../../actions/constants'
import jsYaml from 'js-yaml'
import { translateKind, getToken } from '../../../actions/common'

require('../../../../scss/modal.scss')

const AceEditor = (props) => {
  if (typeof window !== 'undefined') {
    const Ace = require('react-ace').default
    require('brace/mode/yaml')
    require('brace/mode/json')
    require('brace/theme/monokai')
    return <Ace {...props} />
  }
  return null
}

class IsomorphicEditor extends React.Component {
  constructor (props){
    super(props)
    this.state = { mounted: false }
  }
  componentDidMount() {
    this.setState({ mounted: true })
  }
  addAriaLabelToAceCursor() {
    let element = document.querySelector('.ace_editor > textarea[class="ace_text-input"]')
    element.setAttribute('aria-label', 'code editor cursor')
  }
  render() {
    if(this.state.mounted){
      return (
        <AceEditor {...this.props} onLoad={this.addAriaLabelToAceCursor} setOptions={{showLineNumbers: false}} />
      )
    }
    return ( <div />)
  }
}

class ResourceModal extends React.PureComponent {

  constructor (props){
    super(props)
    this.state = { reqErrorMsg: [] }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.escapeEditor = this.escapeEditor.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  handleSubmit() {
    this.setState({ reqErrorMsg: [] }, () => {
      const resourceType = this.props.resourceType
      let resources
      try {
        resources = lodash.compact(jsYaml.safeLoadAll(this.state.data))
        resources.forEach(resource => {

          var editCallback = function(response, newResource){
            if(response.ok) {
              this.handleClose(true, this.props.data, newResource)
            } else {
              this.setState({reqErrorMsg: [response.status + ' ' + response.statusText]})
            }
          }.bind(this)

          // edit the application
          fetch(this.props.submitUrl, {
            method: 'PUT',
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              "CSRF-Token": getToken()
            },
            body: JSON.stringify(resource),
          })
            .then(response => editCallback(response, resource))
        })
      } catch(e) {
        console.error(e) //eslint-disable-line no-console
        this.props.receivePostError(resourceType, {error: {message: e.message}})
        this.setState({reqErrorMsg: [...this.state.reqErrorMsg, e.message]})
      }
    })
  }

  handleClose(refresh, originalResource, newResource) {
    this.setState({reqErrorMsg: []})
    this.props.handleClose(refresh, originalResource, newResource)
  }

  escapeEditor(e) {
    e.persist()
    const button = document.querySelector('.bx--btn--secondary')
    e.shiftKey && (e.ctrlKey || e.altKey) && e.which === 81 && button.focus()
  }

  onChange(value) {
    this.setState({data: value})
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && this.props.data != nextProps.data) {
      if (nextProps.editorMode === 'json') {
        this.setState({data:JSON.stringify(nextProps.data, null, 2)})
      }
      else {
        this.setState({data:jsYaml.dump(nextProps.data)})
      }
    }
    if (nextProps.reqStatus && nextProps.reqStatus === REQUEST_STATUS.ERROR) {
      this.setState({ reqErrorMsg: [...this.state.reqErrorMsg, nextProps.reqErrorMsg]})
    }
    if (nextProps.reqCount === 0 && !nextProps.reqErrCount) {
      this.handleClose()
    }
  }

  componentDidMount() {

    if (this.props.editorMode === 'json') {
      this.setState({data: JSON.stringify(this.props.data, null, 2)})
    } else {
      this.setState({data: jsYaml.dump(this.props.data)})
    }
  }

  render() {
    const { reqCount, open, label, editorMode } = this.props
    let kindTranslated = translateKind(this.props.data.kind)


    let modalLabel, modalHeading
    let upperCaseKind = this.props.data.kind
    upperCaseKind = upperCaseKind ? upperCaseKind.toUpperCase() : upperCaseKind

    if(RESOURCE_TYPES.APPLICATION.name === upperCaseKind) {
      modalLabel = translateKind(this.props.data.kind)
      modalHeading = msgs.get('modal.edit.application')
    } else if(RESOURCE_TYPES.JOB.name === upperCaseKind) {
      modalLabel = translateKind(this.props.data.kind)
      modalHeading = msgs.get('modal.remove.job')
    } else {
      modalLabel = translateKind(this.props.data.kind)
      modalHeading = msgs.get(label.heading, [modalLabel])
    }

    let ariaLabelForEscapingEditor = msgs.get('a11y.editor.escape')
    if(navigator.platform.toUpperCase().indexOf('WIN')>=0) {
      ariaLabelForEscapingEditor = msgs.get('a11y.editor.escape.win')
    }

    return (
      <div id='resource-modal-container' ref={div => this.resourceModal = div} tabIndex='-1' role='region' onKeyDown={this.escapeEditor} aria-label={ariaLabelForEscapingEditor}> {/* eslint-disable-line jsx-a11y/no-noninteractive-element-interactions */}
        {reqCount && reqCount > 0 && <Loading />}
        <Modal
          // https://github.com/carbon-design-system/carbon/issues/4036
          // Carbon Modal a11y focus workaround
          focusTrap={false}
          id='resource-modal'
          iconDescription={msgs.get('modal.button.close.the.modal')}
          className='modal'
          open={open}
          selectorPrimaryFocus='.bx--modal-close'
          primaryButtonText={msgs.get(label.primaryBtn)}
          secondaryButtonText={msgs.get('modal.button.cancel')}
          modalLabel={modalLabel}
          modalHeading={modalHeading}
          onRequestClose={this.handleClose}
          onRequestSubmit={this.handleSubmit}
          role='region'
          modalAriaLabel={modalHeading}
          aria-label={modalHeading}>
          <div>
            {this.state.reqErrorMsg && this.state.reqErrorMsg.length > 0 &&
              this.state.reqErrorMsg.map((err,key) => <InlineNotification key={key} kind='error' title='' subtitle={err} iconDescription={msgs.get('svg.description.error')} />)
            }
            <IsomorphicEditor
              theme='monokai'
              mode={editorMode}
              width='50vw'
              height='40vh'
              onChange={this.onChange}
              fontSize={12}
              showPrintMargin={false}
              showGutter={true}
              highlightActiveLine={true}
              value={this.state && this.state.data}
              setOptions={{
                showLineNumbers: true,
                tabSize: 2,
              }}
              editorProps={{
                $blockScrolling: Infinity
              }}
            />
          </div>
        </Modal>
      </div>
    )
  }
}

export default ResourceModal

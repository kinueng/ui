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
import {
  ComposedModal,
  Icon,
  InlineNotification,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Toggle
} from 'carbon-components-react'
import msgs from '../../../../nls/kappnav.properties'
import {REQUEST_STATUS} from '../../../actions/constants'
import lodash from 'lodash'
import handleKeyboardEvent from '../../../util/accessibility'

require('../../../../scss/modal.scss')

const KEY_VALUE_PAIRS = ['labels', 'matchLabels', 'selectors']

const withForm = (Component, initialForm) => {

  return class extends React.PureComponent {

    constructor(props) {
      super(props)
      this.onChange = this.onChange.bind(this)
      this.onJsonChange = this.onJsonChange.bind(this)
      this.onToggle = this.onToggle.bind(this)
      this.state = lodash.cloneDeep(initialForm)
    }

    render() {
      const {form, json} = this.state

      //These are hacks because I could not find a good way to initialize a Select input box's form value from a dynamic list. Only
      //can hard code it as a static string.
      if(!form.namespace && this.props.namespace) form.namespace = this.props.namespace
      if(!form.selectedSecret && this.props.existingSecrets && this.props.existingSecrets[0]) {
        form.selectedSecret = this.props.existingSecrets[0].Name
      }

      return <Component {...this.props} onChange={this.onChange} form={form} onJsonChange={this.onJsonChange} onToggle={this.onToggle} json={json}/>
    }

    onChange(fields, values) {
      if (arguments.length == 0) {
        this.setState(lodash.cloneDeep(initialForm))
      } else {
        let form = Object.assign({}, this.state.form)

        if(Array.isArray(fields)) {
          for(var i=0; i<fields.length; i++)
            lodash.set(form, fields[i], values[i])
        } else {
          lodash.set(form, fields, values)
        }
        

        this.setState({form})
      }
    }

    onJsonChange(json) {
      this.setState({json})
    }

    onToggle(form) {
      this.setState({form})
    }
  }
}

class NavModal extends React.PureComponent {

  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.onMenuClick = this.onMenuClick.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.validateRequiredFields = lodash.throttle(this.validateRequiredFields.bind(this), 1000, {trailing: false})
    this.state = {
      open: false,
      selectedMenuItem: this.props.menuItems[0],
      jsonMode: false,
      parsingError: undefined,
      postStatus: undefined,
      postErrorMsg: undefined,
      validationErrors: {}
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {form, json, formMapping} = this.props
    const {validationErrors, jsonMode} = this.state
    if (validationErrors.form) {
      prevState.jsonMode !== jsonMode && this.validateRequiredFields(this.formatJson(json), formMapping) // revalidate on json toggle
      prevProps.form !== form && this.validateRequiredFields(this.formatJson(json), formMapping) // revalidate on form entry
    }
  }

  render() {
    const {
      json,
      onJsonChange,
      onChange,
      children,
      menuItems,
      hideJsonEditor
    } = this.props
    const {open, jsonMode, selectedMenuItem, parsingError, validationErrors} = this.state

    return (<div>
      <Button small icon={'add--glyph'} onClick={this.handleOpen.bind(this, true)} disabled={this.props.disabled} iconDescription={msgs.get('svg.description.plus')} id={`create-application`}>
        {this.props.buttonName}
      </Button>
      {
        open && 
          <ComposedModal 
            // https://github.com/carbon-design-system/carbon/issues/4036
            // Carbon Modal a11y focus workaround
            focusTrap={false}
            id='nav-modal' 
            selectorPrimaryFocus='.bx--modal-close' 
            className='modal nav-modal' 
            role='region' 
            aria-label={this.props.modalHeading} 
            open={open} 
            onClose={() => this.toggleModal(false)}>

            <ModalHeader buttonOnClick={this.handleOpen.bind(this, false)} iconDescription={this.props.closeButtonLabel}>
              <div>
                <p className='bx--modal-header__label'>
                  {this.props.modalLabel}
                </p>
                <p className='bx--modal-header__heading'>
                  {this.props.modalHeading}
                </p>
              </div>
              {
                !hideJsonEditor && <div className='toggle'>
                    <p>
                      {msgs.get('mode.json')}
                    </p>
                    <Toggle id='json-toggle' onToggle={this.handleToggle} labelA={msgs.get('off')} labelB={msgs.get('on')}/>
                  </div>
              }
            </ModalHeader>
            <ModalBody>
              {
                jsonMode
                  ? <NavModalJsonEditor postStatus={this.state.postStatus} postErrorMsg={this.state.postErrorMsg} parsingError={parsingError} json={json} onJsonChange={onJsonChange}/>
                  : <NavModalForm postStatus={this.state.postStatus} postErrorMsg={this.state.postErrorMsg} parsingError={parsingError} menuItems={menuItems} selectedMenuItem={selectedMenuItem} onMenuClick={this.onMenuClick} childComponents={children} validationErrors={validationErrors} onChange={onChange}/>
              }
            </ModalBody>
            <ModalFooter primaryButtonDisabled={this.props.primaryButtonDisabled} primaryButtonText={msgs.get(
                this.props.modalButtonName
                ? this.props.modalButtonName
                : 'modal.button.create')} secondaryButtonText={msgs.get('modal.button.cancel')} onRequestClose={this.handleOpen.bind(this, false)} onRequestSubmit={this.handleSubmit.bind(this)}/>
          </ComposedModal>
      }
    </div>)
  }

  handleToggle(checked) {
    try {
      checked
        ? this.convertToJson()
        : this.convertToForm()
    } catch (error) {
      this.setState({parsingError: true})
    }
    this.setState({jsonMode: checked})
  }

  convertToJson() {
    const formattedJson = this.formatJson()
    this.props.onJsonChange(JSON.stringify(formattedJson, null, 2)) // pretty print json
  }

  convertToForm() {
    const {json, formMapping, onToggle, resourceType} = this.props
    const jsonData = Object.assign({}, JSON.parse(json))
    let formData = lodash.mapValues(formMapping, field => lodash.get(jsonData, field))
    // Empty array values should contain empty string for form
    const arrayVals = Object.keys(this.props.initialForm.form).filter(key => lodash.isArray(this.props.initialForm.form[key]) && KEY_VALUE_PAIRS.indexOf(key) === -1)
    arrayVals.forEach((key) => {
      if (!formData[key] || formData[key].length === 0) {
        formData[key] = this.props.initialForm.form[key]
      }
    })

    // Key-value pairs from json view need to be converted back to arrays for form
    // For example: labels: { labelKey: value } ==> labels: [{ name: 'labelKey', value: 'value'}]
    const keyValuePairs = KEY_VALUE_PAIRS.filter(pair => lodash.has(formData, pair))
    keyValuePairs && keyValuePairs.forEach(pair => {
      const currentVal = formData[pair]

        formData[pair] = lodash.isEmpty(currentVal)
          ? [
            {
              name: '',
              value: ''
            }
          ]
          : Object.keys(currentVal).map(key => ({name: key, value: currentVal[key]}))
    })

    // Reformat componentKinds array
    if (lodash.has(formData, 'componentKinds')) {
      const componentKinds = formData.componentKinds
      formData.componentKinds = componentKinds && componentKinds.map((kind, index) => {
        return {
          group: kind.group,
          kind: kind.kind
        }
      })
    }

    //Add in any missing form data
    Object.keys(this.props.form).forEach((key) => {
      if (!formData[key] ) {
        formData[key] = this.props.form[key]
      }
    })

    onToggle(formData)
  }

  toggleModal(open) {
    this.setState({ open })
    this.handleReset()
  }

  handleOpen(opened) {
    const {menuItems, selectedNamespace, onChange} = this.props

    opened && onChange('namespace', selectedNamespace) // set namespace using selected value in namespace dropdown by default when modal opens
    opened
      ? this.setState({open: true})
      : this.setState({open: false, selectedMenuItem: menuItems[0]})

    if (!opened) {
      this.handleReset()
    }
  }

  onMenuClick(item, event) {
    event.preventDefault()
    this.setState({selectedMenuItem: item})
  }

  handleSubmit() {
    var errorCallback = function(error) {
      this.setState({postStatus: REQUEST_STATUS.ERROR, postErrorMsg: error})
    }.bind(this);

    const {createAction, json, formMapping, hideJsonEditor} = this.props
    try {
      const jsonEditorData = json && JSON.parse(json)
      if (this.state.jsonMode) {
        createAction(jsonEditorData, errorCallback, this.props.form)
      } else {
        if (hideJsonEditor) {
          const prunedData = this.pruneFormData()
          createAction(prunedData, errorCallback, this.props.form)
        } else {
          const data = this.formatJson()
          if (this.validateRequiredFields(data, formMapping, true)) {
            createAction(data, errorCallback, this.props.form)
          }
        }
      }
    } catch (error) {
      this.setState({parsingError: true})
    }
  }

  formatJson() {
    let mergedData
    const {formMapping, json, form, resourceType} = this.props
    const templateName = form && form.kind && form.kind.toLowerCase()
    const jsonFormData = JSON.parse(this.parseTemplate(templateName, this.pruneFormData()))

    if (json) {
      mergedData = lodash.merge(JSON.parse(json), jsonFormData)
      const formMappingVals = Object.values(formMapping)
      formMappingVals.forEach(val => {
        if (lodash.get(mergedData, val)) {
          lodash.set(mergedData, val, lodash.get(jsonFormData, val))
        }
      })
    }

    return json
      ? mergedData
      : jsonFormData
  }

  parseTemplate(templateName, templateData) {
    const template = require(`../../../../templates/${templateName}.handlebars`)
    const regex = new RegExp('\\,(?!\\s*?[{[\\"\'\\w])', 'g') // Regex to strip out trailing commas from json string
    const data = template(Object.assign({}, templateData))
    return data.replace(regex, '')
  }

  handleReset() {
    this.setState({jsonMode: false, parsingError: false, validationErrors: {}})
    this.props.onChange() // reset to initial state
  }

  pruneFormData() {
    const {form, resourceType} = this.props
    let formData = {}
    lodash.forIn(form, (value, formKey) => {
      if (lodash.isArray(value))
        if (formKey === 'matchExpressions') {
          formData[formKey] = lodash.compact(value).filter(item => lodash.every(item, value => value !== '')).map(item => {
            if (lodash.isString(item.values))
              item.valuesArray = item.values.split(',')
            return item
          })
        } else
          formData[formKey] = lodash.compact(value).filter(item => lodash.every(item, value => value !== ''))
    else
        formData[formKey] = value
    })
    return formData
  }

  validateRequiredFields(data, formMapping, onSubmit) {
    let errors = {}

    errors.name = !lodash.get(data, formMapping.name)

    if(this.props.validate !== undefined) {
      errors = this.props.validate && this.props.validate(data, formMapping, this.props.form, errors)
    }

    // resource modal tabs that have required fields
    errors.general = errors.name

    const hasErrors = lodash.values(errors).indexOf(true) > -1
    var errorClone = Object.assign({}, errors)
    errorClone.form = hasErrors
    if (hasErrors && onSubmit && this.props.menuItems) {
      for (let i = 0; i < this.props.menuItems.length; i++) {
        if (errors[this.props.menuItems[i]]) {
          this.setState({validationErrors: errorClone, selectedMenuItem: this.props.menuItems[i]})
          break
        }
      }
    } else {
      this.setState({validationErrors: errorClone})
    }
    return !hasErrors
  }
}

const AceEditor = (props) => {
  if (typeof window !== 'undefined') {
    const Ace = require('react-ace').default
    require('brace/mode/json')
    require('brace/theme/monokai')
    return <Ace {...props} />
  }
  return null
}

class IsomorphicEditor extends React.Component {
  constructor (props){
    super(props);
    this.state = { mounted: false }
  }
  componentDidMount() {
    this.setState({ mounted: true })
  }
  render() {
    if(this.state.mounted){
          return (
            <AceEditor {...this.props} onLoad={this.addAriaLabelToAceCursor} setOptions={{showLineNumbers: false}}/>
          )
    }
    return ( <div/>)
  }
}

class NavModalForm extends React.PureComponent {
  render() {
    const { postStatus, postErrorMsg, menuItems, childComponents, onChange, selectedMenuItem, parsingError, validationErrors } = this.props
    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div className='modal-form' ref={div => this.modalForm = div} role='presentation' onKeyDown={this.handleKeyDown.bind(this)}>
        {menuItems.length > 1 &&
          <div className='modal-navigation-bar' role='navigation'>
            <ul role='menu'>
              {this.getMenuItems()}
            </ul>
          </div>}
        <div className='modal-inner-content'>
          {validationErrors.form && <InlineNotification kind='error' title='' iconDescription={msgs.get('modal.button.close')} subtitle={msgs.get('formerror.missing')} />}
          {(postStatus === REQUEST_STATUS.ERROR || parsingError) &&
            <InlineNotification
              kind='error'
              title=''
              iconDescription={msgs.get('svg.description.error')}
              subtitle={postStatus === REQUEST_STATUS.ERROR ? postErrorMsg : msgs.get('error.parse.description')} />}
          {(() => {
            const index = menuItems.indexOf(selectedMenuItem)
            if (index >= 0) {
              return React.cloneElement(
                React.Children.toArray(childComponents)[index], {
                  onChange: onChange,
                  error: validationErrors
                })
            }
            return null
          })()}
        </div>
      </div>
    )
  }

  getMenuItems() {
    const { menuItems, onMenuClick, validationErrors } = this.props
    return menuItems.map((item, index) =>
      <li key={index} className={this.isActive(item)} id={item}>
        <a href="#" onClick={onMenuClick.bind(null, item)} className='menu-item' role='menuitem'>{msgs.get(`modal.nav.${item}`)}</a>
        {validationErrors.form && validationErrors[item] && !this.isActive(item) && <Icon className='modal-tab-error' name='icon--error--glyph' description={msgs.get('svg.description.error')} />}
      </li>
    )
  }

  isActive(item) {
    return item === this.props.selectedMenuItem ? 'active' : ''
  }

  handleKeyDown(e) {
    const menuItems = Array.from(this.modalForm.querySelectorAll('.menu-item')),
          fields = Array.from(this.modalForm.querySelectorAll('input, select, button')),
          active = this.modalForm.querySelector('.active a'),
          data = { menuItems, fields, active }

    handleKeyboardEvent(e, data, 'nav-modal')
  }
}

const NavModalJsonEditor = ({
  postStatus,
  postErrorMsg,
  onJsonChange,
  parsingError,
  json
}) =>
  <div>
    {(postStatus === REQUEST_STATUS.ERROR || parsingError) &&
    <InlineNotification
      kind='error'
      title=''
      iconDescription={msgs.get('svg.description.error')}
      subtitle={postStatus === REQUEST_STATUS.ERROR ? postErrorMsg : msgs.get('error.parse.description')} />}
    <IsomorphicEditor
      theme='monokai'
      mode={'json'}
      width='50vw'
      height='40vh'
      onChange={onJsonChange}
      fontSize={12}
      showPrintMargin={false}
      showGutter={true}
      highlightActiveLine={true}
      value={json}
      setOptions={{
        showLineNumbers: true,
        tabSize: 2,
      }}
      editorProps={{
        $blockScrolling: Infinity
      }}
    />
  </div>

export default NavModal
export {
  withForm
}

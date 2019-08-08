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
import msgs from '../../../../nls/kappnav.properties'
import { TextInput, Icon, Select, SelectItem, NumberInput } from 'carbon-components-react'
import withMultiple from './ModalListItem'
import { FieldWrapper } from './FormField'

const transform = (field, handleChange, event) => {
  handleChange(field, event.target.value)
}

const handleNumberFieldChange = (field, handleChange, event) => {
  handleChange(field, parseInt(event.imaginaryTarget.value))
}

const NumberField = ({ onChange, labelText, content, field, id, value, invalid, required }, { locale }) =>
  <FieldWrapper className='number-input-wrapper' labelText={labelText} content={content} required={required}>
    <NumberInput
      id={id}
      value={Number.isInteger(value) ? value : null}
      min={0}
      label={labelText}
      invalid={invalid}
      hideLabel
      invalidText={` ${msgs.get('formerror.required', locale)}`}
      onChange={handleNumberFieldChange.bind(this, field, onChange)} />
  </FieldWrapper>

const General = ({ form, onChange, children, error, labelName, labelContent }, context) => {
  const addOns = React.Children.map(children, child => {
    return React.cloneElement(child, { form, onChange, error })
  })
  return <div>
    <FieldWrapper labelText={labelName || msgs.get('formfield.name')} content={labelContent || msgs.get('formtip.common.name', ['<br>'])} required={true}>
      <TextInput
        id='name'
        hideLabel
        className='bx--text-input-override'
        labelText={labelName || msgs.get('formfield.name')}
        value={form.name}
        onChange={transform.bind(null, 'name', onChange)}
        invalid={error && error.name}
        invalidText={` ${msgs.get('formerror.required')}`} />
    </FieldWrapper>
    {addOns}
  </div>
}

const Label = ({ id, item, onModify, onRemove }, context) =>
  <div className='field-row'>
    <FieldWrapper labelText={msgs.get('formfield.label')} content={msgs.get('formtip.common.label.label')}>
      <TextInput
        id={`labels-name-${id}`}
        value={item.name}
        hideLabel
        className='bx--text-input-override'
        labelText={msgs.get('formfield.label')}
        onChange={onModify.bind(null, 'name')} />
    </FieldWrapper>
    <FieldWrapper labelText={msgs.get('formfield.value')} content={msgs.get('formtip.common.label.value')}>
      <TextInput
        id={`labels-value-${id}`}
        value={item.value}
        hideLabel
        className='bx--text-input-override'
        labelText={msgs.get('formfield.value')}
        onChange={onModify.bind(null, 'value')} />
    </FieldWrapper>
    <RemoveIcon id={`labels-remove-${id}`} onRemove={onRemove} />
  </div>

const MatchLabel = ({ id, item, onModify, onRemove }, context) =>
  <div className='field-row'>
    <FieldWrapper labelText={msgs.get('formfield.label')} content={msgs.get('formtip.common.matchLabel')}>
      <TextInput
        id={`labels-name-${id}`}
        value={item.name}
        hideLabel
        className='bx--text-input-override'
        labelText={msgs.get('formfield.label')}
        onChange={onModify.bind(null, 'name')} />
    </FieldWrapper>
    <FieldWrapper labelText={msgs.get('formfield.value')} content={msgs.get('formtip.common.matchLabel')}>
      <TextInput
        id={`labels-value-${id}`}
        value={item.value}
        hideLabel
        className='bx--text-input-override'
        labelText={msgs.get('formfield.value')}
        onChange={onModify.bind(null, 'value')} />
    </FieldWrapper>
    <RemoveIcon id={`labels-remove-${id}`} onRemove={onRemove} />
  </div>

const RemoveIcon = ({ id, onRemove }, context) =>
  <Icon
    id={id}
    tabIndex='0'
    onClick={onRemove}
    onKeyDown={e => e.persist && (e.which === 13 || e.which === 32) && onRemove(id)}
    name='subtract--glyph'
    description={msgs.get('svg.description.remove')}
    style={{ 'margin': 'auto', 'minWidth': '4.25rem' }}
    fill='#8c9ba5' />

const NamespaceSelect = ({ form, namespaces, onChange, labelName, labelContent }, context) =>
  <FieldWrapper labelText={labelName || msgs.get('formfield.namespace')} content={labelContent || msgs.get('formtip.common.namespace')} required={true}>
    <Select
      id='namespace-select'
      value={form.namespace}
      hideLabel
      onChange={transform.bind(null, 'namespace', onChange)}>
      {namespaces.map((namespace, index) => <SelectItem key={index} text={namespace.Name} value={namespace.Name} />)}
    </Select>
  </FieldWrapper>

  const MatchExpression = ({ id, item, onModify, onRemove }, context) =>
  <div className='field-row'>
    <FieldWrapper labelText={msgs.get('formfield.key')} content={msgs.get('formtip.selectors.matchExpression.key')}>
      <TextInput
        id={`match-expression-key-${id}`}
        value={item.key}
        hideLabel
        className='bx--text-input-override'
        labelText={msgs.get('formfield.key')}
        onChange={onModify.bind(null, 'key')} />
    </FieldWrapper>
    <FieldWrapper labelText={msgs.get('formfield.operator')} content={msgs.get('formtip.selectors.matchExpression.operator', ['<br/>'])}>
      <TextInput
        id={`match-expression-operator-${id}`}
        value={item.operator}
        hideLabel
        className='bx--text-input-override'
        labelText={msgs.get('formfield.operator')}
        onChange={onModify.bind(null, 'operator')} />
    </FieldWrapper>
    <FieldWrapper labelText={msgs.get('formfield.values')} content={msgs.get('formtip.selectors.matchExpression.value')}>
      <TextInput
        id={`match-expression-values-${id}`}
        value={item.values}
        hideLabel
        className='bx--text-input-override'
        labelText={msgs.get('formfield.values')}
        onChange={onModify.bind(null, 'values')} />
    </FieldWrapper>
    <RemoveIcon id={`match-expression-remove-${id}`} onRemove={onRemove} />
  </div>

  const Kind = ({ id, item, onModify, onRemove }, context) =>
    <div className='field-row'>
      <FieldWrapper labelText={msgs.get('formfield.group')} content={msgs.get('formtip.common.group')}>
        <TextInput
          id={`labels-group-${id}`}
          value={item.group}
          hideLabel
          className='bx--text-input-override'
          labelText={msgs.get('formfield.group')}
          onChange={onModify.bind(null, 'group')} />
      </FieldWrapper>
      <FieldWrapper labelText={msgs.get('formfield.kind')} content={msgs.get('formtip.common.kind')}>
        <TextInput
          id={`labels-kind-${id}`}
          value={item.kind}
          hideLabel
          className='bx--text-input-override'
          labelText={msgs.get('formfield.kind')}
          onChange={onModify.bind(null, 'kind')} />
      </FieldWrapper>
      <RemoveIcon id={`labels-remove-${id}`} onRemove={onRemove} />
    </div>

const MatchExpressions = withMultiple(MatchExpression, { key: '', operator: '', values: ''})


const Namespace = NamespaceSelect
const Labels = withMultiple(Label, { name: '', value: '' })
const MatchLabels = withMultiple(MatchLabel, { name: '', value: '' })
const ComponentKinds = withMultiple(Kind, { group: '', kind: '' })

export { General, Labels, MatchLabels, transform, RemoveIcon, Namespace, NumberField, MatchExpressions, ComponentKinds }

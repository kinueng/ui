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
import { FormItem, FormLabel, Tooltip } from 'carbon-components-react'
import msgs from '../../../../nls/kappnav.properties'
import PropTypes from 'prop-types'

require('../../../../scss/create-resource.scss')

const FieldWrapper = (props) =>
  <FormItem className={props.className ? `bx--form-item-override ${props.className}` : ''}>
    <FormLabel>
      <LabelTooltip {...props} />
    </FormLabel>
    {props.children}
  </FormItem>

const LabelTooltip = ({ labelText, content, required }) =>
  <Tooltip
    iconDescription={msgs.get('formtip.tooltip')}
    triggerText={labelText + (required ? ' *' : '')}
    direction='bottom'
    showIcon={true}>
    <p dangerouslySetInnerHTML={{ __html: content}} />
  </Tooltip>

FieldWrapper.propTypes = {
  children: PropTypes.object.isRequired,
  className: PropTypes.string,
  content: PropTypes.string,
  labelText: PropTypes.string,
  required: PropTypes.bool
}

LabelTooltip.propTypes = {
  content: PropTypes.string,
  labelText: PropTypes.string.isRequired,
  required: PropTypes.bool
}

export { FieldWrapper, LabelTooltip }

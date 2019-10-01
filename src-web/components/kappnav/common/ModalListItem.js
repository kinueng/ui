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
import { Button } from 'carbon-components-react'
import lodash from 'lodash'
import msgs from '../../../../nls/kappnav.properties'

const withMultiple = (Component, newInstance) => {

  // eslint-disable-next-line react/display-name
  return class extends React.PureComponent {

    constructor(props) {
      super(props)
      this.onAdd = this.onAdd.bind(this)
      this.onRemove = this.onRemove.bind(this)
      this.onModify = this.onModify.bind(this)
      this.getItems = this.getItems.bind(this)
    }

    render() {
      return (
        <div>
          {this.getItems()}
          <Button
            kind="ghost"
            icon="add--glyph"
            iconDescription={msgs.get('svg.description.plus')}
            onClick={this.onAdd} >
            {/* eslint-disable-next-line react/prop-types */}
            {this.props.addLabel}
          </Button>
        </div>
      )
    }

    getItems() {
      // eslint-disable-next-line react/prop-types
      const { items, type, error } = this.props
      // eslint-disable-next-line react/prop-types
      return items.map((item, i) => {
        return <Component
          // eslint-disable-next-line react/no-array-index-key
          key={`${type}-${i}`}
          item={item}
          id={i}
          error={error}
          onModify={this.onModify.bind(null, i)}
          onRemove={this.onRemove.bind(null, i)} />
      })
    }

    onAdd() {
      // eslint-disable-next-line react/prop-types
      const { items, type } = this.props
      const newItem = newInstance ? Object.assign({}, newInstance) : ''
      // eslint-disable-next-line react/prop-types
      const newItems = items.concat(newItem)
      // eslint-disable-next-line react/prop-types
      this.props.onChange(type, newItems)
    }

    onModify(index, field, event) {
      // eslint-disable-next-line react/prop-types
      const { items, type } = this.props
      let replacement = items[index]
      field ? lodash.set(replacement, field, event.target.value) : replacement = event.target.value
      const newItems = [...items]
      newItems.splice(index, 1, replacement)
      // eslint-disable-next-line react/prop-types
      this.props.onChange(type, newItems)
    }

    onRemove(index) {
      // eslint-disable-next-line react/prop-types
      const { items, type } = this.props
      // eslint-disable-next-line react/prop-types
      const newItems = items.filter((_, i) => i !== parseInt(index))
      // eslint-disable-next-line react/prop-types
      this.props.onChange(type, newItems)
    }
  }
}

export default withMultiple

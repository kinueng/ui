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
            {this.props.addLabel}
          </Button>
        </div>
      )
    }

    getItems() {
      const { items, type, error } = this.props
      return items.map((item, i) => {
        return <Component
          key={`${type}-${i}`}
          item={item}
          id={i}
          error={error}
          onModify={this.onModify.bind(null, i)}
          onRemove={this.onRemove.bind(null, i)} />
      })
    }

    onAdd() {
      const { items, type } = this.props
      const newItem = newInstance ? Object.assign({}, newInstance) : ''
      const newItems = items.concat(newItem)
      this.props.onChange(type, newItems)
    }

    onModify(index, field, event) {
      const { items, type } = this.props
      let replacement = items[index]
      field ? lodash.set(replacement, field, event.target.value) : replacement = event.target.value
      let newItems = [...items]
      newItems.splice(index, 1, replacement)
      this.props.onChange(type, newItems)
    }

    onRemove(index) {
      const { items, type } = this.props
      const newItems = items.filter((_, i) => i !== parseInt(index))
      this.props.onChange(type, newItems)
    }
  }
}

export default withMultiple

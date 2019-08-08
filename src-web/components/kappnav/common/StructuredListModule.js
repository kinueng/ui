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

require('../../../../scss/structured-list.scss')
import React from 'react'
import { Module, ModuleBody } from 'carbon-addons-cloud-react'
import { StructuredListWrapper, StructuredListHead, StructuredListRow, StructuredListCell, StructuredListBody, OverflowMenu } from 'carbon-components-react'
import msgs from '../../../../nls/kappnav.properties'
import { transform } from '../../../actions/common'
import { Link } from 'react-router-dom'

class StructuredListModule extends React.PureComponent {

  constructor (props){
    super(props)
    this.state = { expanded: props.expanded!=undefined ? props.expanded : true }

    this.toggleExpandCollapse = this.toggleExpandCollapse.bind(this)
  }

  render() {
    const {
      title,
      headerRows,
      rows,
      data,
      url,
      id,
      actions,
      getResourceAction,
      navRoutes
    } = this.props

    const ariaLabel = msgs.get(title, [data.kind])

    return (<Module className={this.state.expanded ? 'structured-list-module' : 'structured-list-module collapsedModule' } id={id}>
      <div className='bx--module__header' style={{justifyContent: 'space-between'}} onClick={()=>{this.toggleExpandCollapse()}}>
        <ul data-accordion className="bx--accordion">
          <li data-accordion-item className="bx--accordion__item" className={this.state.expanded ? 'bx--accordion__item--active' : '' }>
            <button className="bx--accordion__heading" aria-expanded={this.state.expanded} aria-controls={id+'modulePane'} title={this.state.expanded ? msgs.get('collapse') : msgs.get('expand') }>
              <svg className="bx--accordion__arrow" width="7" height="12" viewBox="0 0 7 12">
                <path fillRule="nonzero" d="M5.569 5.994L0 .726.687 0l6.336 5.994-6.335 6.002L0 11.27z" />
              </svg>
              <div className="bx--accordion__title">{msgs.get(title, [data.kind])}</div>
            </button>
          </li>
        </ul>
      </div>
      <ModuleBody id={id+'modulePane'} className={this.state.expanded ? '' : 'collapsed' }>
        <StructuredListWrapper className='bx--structured-list--condensed' ariaLabel={msgs.get(title, [data.kind])}>
          <StructuredListHead>
            <StructuredListRow head>
              {headerRows.map((row, index) =>
                <StructuredListCell head key={index}>
                  {msgs.get(row)}
                </StructuredListCell>
              )}
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {rows.map((row, index) =>
              <StructuredListRow key={index}>
                {row.cells.map((cell, index) =>
                  <StructuredListCell key={index}>
                    <p title={transform(data, cell)}>{cell.link && url ? <Link to={url} className='bx--link'>{transform(data, cell)}</Link> : transform(data, cell)}</p>
                  </StructuredListCell>
                )}
              </StructuredListRow>
            )}
          </StructuredListBody>
        </StructuredListWrapper>
      </ModuleBody>
    </Module>)
  }

  toggleExpandCollapse(){
    this.setState({expanded: !this.state.expanded})
  }
}

export default StructuredListModule

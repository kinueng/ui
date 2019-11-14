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

import React, { Component } from 'react'
import { connect } from 'react-redux'
import lodash from 'lodash'
import { DropdownV2 } from 'carbon-components-react'
import msgs from '../../../../nls/kappnav.properties'
import { fetchLoadingSelectedNamespace } from '../../../reducers/BaseServiceReducer'

require('../../../../scss/namespace-dropdown.scss')

const translateWithId = (locale, id) => msgs.get(id)

class NamespaceDropdown extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isScrollingDownward: false,
      lastPosition: 0
    }
  }

  componentDidMount() {
    this._debouncedScroll = lodash.debounce(() => {
      const { lastPosition } = this.state

      const currentPosition = window.pageYOffset || 0

      if (currentPosition > 86) {
        if (currentPosition > lastPosition) {
          this.setState({
            isScrollingDownward: true,
            lastPosition: currentPosition,
          })
        } else {
          this.setState({
            isScrollingDownward: false,
            lastPosition: currentPosition,
          })
        }
      } else {
        this.setState({
          isScrollingDownward: false,
          lastPosition: currentPosition,
        })
      }
    }, 25)
    window.addEventListener('scroll', this._debouncedScroll)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isScrollingDownward !== this.props.isScrollingDownward) {
      this.setState({ isScrollingDownward: nextProps.isScrollingDownward })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this._debouncedScroll)
  }

  updateSelectedNamespace = (event) => {
    let namespace = event.selectedItem.value
    if(namespace === 'all') {
      namespace = ''
    }
    this.props.fetchLoadingSelectedNamespace(namespace)
  }

  /**
   * Determine what the label should be for the dropdown menu based on
   * whether the user has selected a namespace.  Factor in the number of
   * namespaces avaliable to choose from when returning a default selected
   * namespace.
   * @return {string} - i18n value when possible of the selected namespace
   */
  _getSelectedNamespaceLabel(selected_namespaces, hasMultipleNamespaces, dropdownItems) {
    if(selected_namespaces) {
      // No way to provide an i18n version of the namespace
      // because the namespace is user defined text.
      return selected_namespaces
    } else {
      // Return the default namespace
      if(hasMultipleNamespaces) {
        // When there are multiple namespaces to choose from,
        // the default is to show all the namespaces
        return msgs.get('namespaces.all', this.context.locale)
      } else {
        // When only one namespace to choose from,
        // return the only namespace choice
        return dropdownItems[0].label
      }
    }
  } // end of _getSelectedNamespaceLabel(...)

  render() {
    const namespaces = this.props.baseInfo.namespaces
    const selected_namespaces = this.props.baseInfo.selectedNamespace
    const { isScrollingDownward } = this.state
    const hasMultipleNamespaces = namespaces && namespaces.length > 1
    let dropdownItems = Object.assign({}, namespaces)
    dropdownItems = namespaces.map((namespace, index) => ({id: `${namespace.Name}-${index}`, label: namespace.Name, value: namespace.Name }))

    if (hasMultipleNamespaces) {
      dropdownItems.unshift(
        { id: 'all', 
          label: msgs.get('namespaces.all', this.context.locale), 
          value: namespaces.map(namespace => namespace.Name).toString() 
        }
      )
    }

    let ariaLabelForDropdownMenu = hasMultipleNamespaces ? msgs.get('namespaces.all', this.context.locale) : dropdownItems[0].label
    if(selected_namespaces) {
      ariaLabelForDropdownMenu = selected_namespaces.toString()
    }

    const selected_namespaces_label = this._getSelectedNamespaceLabel(selected_namespaces, hasMultipleNamespaces, dropdownItems)

    return <DropdownV2
      label={selected_namespaces_label}
      ariaLabel={ariaLabelForDropdownMenu}
      className={`namespaces`}
      data-header-active={isScrollingDownward}
      onChange={(event) => this.updateSelectedNamespace(event)}
      translateWithId={translateWithId.bind(null, document.documentElement.lang)}
      items={dropdownItems} />
  } // end of render()
}

export default connect(
    (state) => ({
        baseInfo: state.baseInfo,
    }),
    {
        fetchLoadingSelectedNamespace
    }
)(NamespaceDropdown)

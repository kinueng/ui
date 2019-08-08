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
import msgs from '../../nls/kappnav.properties'
import PropTypes from 'prop-types'
import { CSSTransition } from 'react-transition-group'

require('../../scss/left-nav.scss')

class LeftNav extends React.Component {

  render() {
    return (
      <CSSTransition classNames='transition' in={this.props.open} timeout={300} 
          mountOnEnter={true} unmountOnExit={true} 
          onEntered={() => this.leftNav.focus()}>

        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <nav ref={nav => this.leftNav = nav} id='left-nav' tabIndex='-1'
            className='left-nav' aria-label={msgs.get('header.menu.bar.label')}>

          { this.renderRoutes() }

        </nav>
      </CSSTransition>
    )
  } // end of render(...)

  renderRoutes() {
    return (
      <ul role='menubar'>
        <li className="left-nav-item primary-nav-item">
          {/* Tried using the below, but was having some issues */}
          {/* <Link role='menuitem' to='/kappnav-ui/applications'>Applications</Link> */}
          <a role='menuitem' href="/kappnav-ui/applications" title={msgs.get('page.applicationView.title')}>{msgs.get('page.applicationView.title')}</a>
        </li>
        <li className="left-nav-item primary-nav-item">
        <a role='menuitem' href="/kappnav-ui/jobs" title={msgs.get('page.jobsView.title')}>{msgs.get('page.jobsView.title')}</a>
        </li>
      </ul>
    )
  } // end of renderRoutes(...)



}

LeftNav.contextTypes = {
  locale: PropTypes.string
}

export default LeftNav

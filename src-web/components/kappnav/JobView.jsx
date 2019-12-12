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

import 'carbon-components/scss/globals/scss/styles.scss'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import {Loading} from 'carbon-components-react'
import {CONTEXT_PATH, PAGE_SIZES, SORT_DIRECTION_ASCENDING, RESOURCE_TYPES, STATUS_COLORS, CONFIG_CONSTANTS} from '../../actions/constants'
import {getRowSlice, sort, sortColumn, getOverflowMenu, buildStatusHtml, getAge, getAgeDifference, getCreationTime, performUrlAction} from '../../actions/common'
import msgs from '../../../nls/kappnav.properties'
import SecondaryHeader from './common/SecondaryHeader.jsx'
import ResourceTable from './common/ResourceTable.js'
import getResourceData from '../../definitions/index'
import PropTypes from 'prop-types'
import {getSearchableCellList, SEARCH_HEADER_TYPES} from './common/ResourceTable.js'


const jobResourceData = getResourceData(RESOURCE_TYPES.JOB)

// This is the view that shows a collection of Command Actions jobs
class JobView extends Component {
  

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      totalRows: [],
      filteredRows: [],
      rows: [],
      sortColumn: 'age', // default sort
      sortDirection: SORT_DIRECTION_ASCENDING,
      pageSize: PAGE_SIZES.DEFAULT,
      pageNumber: 1,
      search: undefined,
      headers: [ // Columns in the grid
        {key: 'status', header: msgs.get('table.header.status'), type: SEARCH_HEADER_TYPES.STATUS},
        {key: 'actionName', header: msgs.get('table.header.actionName'), type: SEARCH_HEADER_TYPES.STRING},
        {key: 'appName', header: msgs.get('table.header.applicationName'), type: SEARCH_HEADER_TYPES.URL},
        {key: 'component', header: msgs.get('table.header.component'), type: SEARCH_HEADER_TYPES.STRING},
        {key: 'age', header: msgs.get('table.header.age'), type: SEARCH_HEADER_TYPES.STRING},
        {key: 'menuAction', header: msgs.get('table.header.action'), type: SEARCH_HEADER_TYPES.NOT_SEARCHABLE}
      ]
    }

    // make 'this' visible to class methods
    this.fetchData = this.fetchData.bind(this)
  }
  render() {
    let viewTitle = msgs.get('page.jobsView.title')
    if (this.state.loading)
      return <Loading withOverlay={false} className='content-spinner'/>
    else
      return (
        <div>
          <SecondaryHeader title={viewTitle} location={location}/>
          <div className="page-content-container" role="main">

        
        <ResourceTable
          rows={this.state.rows}
          headers={this.state.headers} title={''}
          onInputChange={(e) => {
            this.searchInputChange(e)
          }}
          totalNumberOfRows={this.state.filteredRows.length}
          changeTablePage={(e) => {
            this.handlePaginationClick(e)
          }}
          sortColumn={this.state.sortColumn}
          sortDirection={this.state.sortDirection}
          handleSort={(e) => {
            this.handleSort(e)
          }}
          pageNumber={this.state.pageNumber}
          namespace={this.props.baseInfo.selectedNamespace}
          namespaces={this.props.baseInfo.namespaces}
        />
        </div>
        </div>
      )
  }

  componentDidMount() {
    this.fetchData(this.props.baseInfo.selectedNamespace, this.state.search, this.props.baseInfo.appNavConfigMap)

    var self = this
    window.setInterval(() => {
      self.refreshData(self.props.baseInfo.selectedNamespace, self.state.search, self.props.baseInfo.appNavConfigMap)
    }, 10000)
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.baseInfo.selectedNamespace == nextProps.baseInfo.selectedNamespace) {
      return true
    } else {
      this.fetchData(nextProps.baseInfo.selectedNamespace, undefined, this.props.baseInfo.appNavConfigMap)
    }
    return false
  }

  handlePaginationClick(e) {
    this.filterTable(this.state.search, e.page, e.pageSize, this.state.totalRows)
  }

  searchInputChange(e) {
    this.filterTable(e.target.value, 1, this.state.pageSize, this.state.totalRows)
  }

  filterTable(searchValue, pageNumber, pageSize, totalRows){
    let filteredRows = []
    if (searchValue) {
      const searchValueLowerCase = searchValue.toLowerCase()
      //filter the rows
      totalRows.forEach((row) => {
        var searchFields = getSearchableCellList(row, this.state.headers);
        searchFields = searchFields.map(function(value) {
          // Lowercase everything to make string maching accurate
          return ('' + value).toLowerCase();
        })

        if(searchFields.some(field => field.includes(searchValueLowerCase))) {
          // If one of the fields contains the search string, add the row 
          // to what will be showed in filtered view
          filteredRows.push(row)
          return
        }
      })
    } else {
      //needed in case we are not searching
      filteredRows = totalRows
    }

    //sort the newList
    const sortedList = sort(filteredRows, this.state.sortDirection, this.state.sortColumn)

    this.setState({
      loading: false,
      totalRows: totalRows,
      rows: getRowSlice(sortedList, pageNumber, pageSize),
      pageNumber: pageNumber,
      pageSize: pageSize,
      filteredRows: filteredRows,
      search: searchValue
    })
  }

  handleSort(e) {
    const target = e.currentTarget
    if (target) {
      const newSortColumn = target && target.getAttribute('data-key')
      // eslint-disable-next-line react/no-access-state-in-setstate
      const result = sortColumn(this.state.filteredRows, this.state.sortColumn, this.state.sortDirection, newSortColumn)
      // eslint-disable-next-line react/no-access-state-in-setstate
      const rowSlice = getRowSlice(result.sortedList, this.state.pageNumber, this.state.pageSize)
      this.setState({
        rows: rowSlice,
        sortColumn: newSortColumn,
        sortDirection: result.direction
      })
    }
  }

  fetchData(namespace, search, appNavConfigData) {
    this.setState({loading: true})
    this.refreshData(namespace, search, appNavConfigData)
  }

  getStatus(job, appNavConfigData) {
    var statusColorMapping = appNavConfigData && appNavConfigData.statuColorMapping
    var statusPrecedence = appNavConfigData && appNavConfigData.statusPrecedence ? appNavConfigData && appNavConfigData.statusPrecedence : []

    var statusColor = STATUS_COLORS.DEFAULT_COLOR
    var statusText = ''
    var sortTitle = ''

    var appName = job && job.metadata.labels['kappnav-job-application-name']

    // Default the status to Normal until the job returns a done state (eg FAILED, COMPLETED)
    var doneState = 'Normal'
    if(job.status.conditions && job.status.conditions[0]) {
      var type = job.status.conditions[0].type // Assuming ever only have 1 condition
      // Based status choices on https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.13/#jobcondition-v1-batch
      if(type.toUpperCase() === 'FAILED') {
        doneState = 'Problem'
      } else if(type.toUpperCase() === 'COMPLETE') {
        doneState = 'Normal'
      }
    }

    statusText = msgs.get(doneState.toLowerCase())

    var sortIndex = statusPrecedence.findIndex(val => val === doneState)

    if(statusColorMapping && doneState) {
      var colorKey = statusColorMapping.values && statusColorMapping.values[doneState]
      if(colorKey) {
        var color = statusColorMapping.colors && statusColorMapping.colors[colorKey]
        if(color) {
          statusColor = color
        }
      }
      sortTitle = sortIndex + statusColor + appName
    }

    return {
      statusMessage: statusText,
      statusColor: statusColor,
      borderColor: STATUS_COLORS.BORDER_COLOR,
      statusText: statusText,
      sortTitle: sortTitle
    }
  }

  refreshData(namespace, search, appNavConfigData) {
    fetch('/kappnav/resource/commands').then(result => result.json()).then(result => {
      const rowArray = []
      const actionMap = result[CONFIG_CONSTANTS.ACTION_MAP]
      result.commands.forEach((job) => {

        const metadata = job.metadata
        const metadataLabel = metadata.labels
        const appUuid = metadata.name
        const jobName = metadataLabel['kappnav-job-action-name']

        var itemObj = {}
        itemObj.id = metadata.uid+'-job'
        itemObj.status = buildStatusHtml(this.getStatus(job, appNavConfigData))

        const urlActions = actionMap ? actionMap[CONFIG_CONSTANTS.URL_ACTIONS] : ''
        if(urlActions && urlActions[0]) {
          const detailAction = urlActions[0]
          const kind = 'Job'
          const linkId = kind+'_'+metadata.name+'link'
          itemObj.actionName = <a rel="noreferrer" id={linkId} href='#' onClick={performUrlAction.bind(this, detailAction['url-pattern'], detailAction['open-window'], kind, appUuid, metadata.namespace, undefined, true)}>{jobName}</a>
          performUrlAction(detailAction['url-pattern'], detailAction['open-window'], kind, appUuid, metadata.namespace, linkId, false)  //update the link in place
        } else {
          // Not every K8 platform has a URL for displaying K8 Job kind details
          itemObj.actionName = jobName
        }
        
        var applicationName = metadataLabel['kappnav-job-application-name']
        if (applicationName && applicationName === 'kappnav.not.assigned') {
          itemObj.appName = msgs.get('not.assigned')
        } else {
          //since component and application namespace can be different, hence we will be using the application namespace
          itemObj.appName = <a href={location.protocol + '//' + location.host + CONTEXT_PATH + '/applications/' + encodeURIComponent(applicationName) + '?namespace=' + metadataLabel['kappnav-job-application-namespace']}>
            {metadataLabel['kappnav-job-application-namespace'] + '/' + applicationName}
          </a>
        }

        const createdTime = getCreationTime(job)
        const howOldInMilliseconds = getAgeDifference(createdTime).diffDuration + ''
        itemObj.age = <div data-sorttitle={howOldInMilliseconds}>{getAge(job)}</div>
        itemObj.component = metadataLabel['kappnav-job-component-namespace'] + '/' + metadataLabel['kappnav-job-component-name']
        itemObj.menuAction = getOverflowMenu(job, actionMap, jobResourceData)
        rowArray.push(itemObj)
      })
      this.filterTable(search, this.state.pageNumber, this.state.pageSize, rowArray)
    })
  }
} // end of JobView component

export default connect(
  (state) => ({
      baseInfo: state.baseInfo,
  }),
  {
  }
)(JobView)

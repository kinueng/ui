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
import {Loading, DataTable} from 'carbon-components-react'
import {CONTEXT_PATH, PAGE_SIZES, SORT_DIRECTION_ASCENDING, RESOURCE_TYPES} from '../../actions/constants'
import {getRowSlice, sort, sortColumn, getOverflowMenu, getStatus, buildStatusHtml, getToken} from '../../actions/common'
import msgs from '../../../nls/kappnav.properties'
import ResourceTable from './common/ResourceTable.js'
import SecondaryHeader from './common/SecondaryHeader.jsx'
// eslint-disable-next-line import/no-named-as-default
import getResourceData from '../../definitions/index'
import ApplicationModal from './modals/ApplicationModal.js'
import NamespaceDropdown from './common/NamespaceDropdown'
import PropTypes from 'prop-types'

const applicationResourceData = getResourceData(RESOURCE_TYPES.APPLICATION)

class AppView extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      totalRows: [],
      filteredRows: [],
      rows: [],
      sortColumn: 'status',
      sortDirection: SORT_DIRECTION_ASCENDING,
      pageSize: PAGE_SIZES.DEFAULT,
      pageNumber: 1,
      search: undefined,
      headers: [
        {key: 'status', header: msgs.get('table.header.status')},
        {key: 'appName', header: msgs.get('table.header.applicationName')},
        {key: 'namespace', header: msgs.get('table.header.namespace')},
        {key: 'menuAction', header: msgs.get('table.header.action')}
      ]
    }

    // make 'this' visible to class methods
    this.fetchData = this.fetchData.bind(this)
  }
  render() {
    const viewTitle = msgs.get('page.applicationView.title')

    if (this.state.loading)
      return <Loading withOverlay={false} className='content-spinner' />
    else
      return (
        <div>
          <SecondaryHeader title={viewTitle} location={location} />
          <div className="page-content-container" role="main">

            <NamespaceDropdown />
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
              //filterItems={{
              //                itemArray: [ { text:'Application', value:'application' }, { text:'Assembly', value:'assembly' } ],
              //                filterLabel: "Type",
              //                filterAction: (args) => {debugger;}
              //              }}
              handleSort={(e) => {
                this.handleSort(e)
              }}
              pageNumber={this.state.pageNumber}
              namespace={this.props.baseInfo.selectedNamespace}
              namespaces={this.props.baseInfo.namespaces}
              resourceType={applicationResourceData.resourceType}
              createNewModal={(namespace, namespaces) => {
                return (
                  <DataTable.TableToolbarContent>
                    <ApplicationModal
                      createAction={(data, errorCallback) => {
                        this.createApplication(data, errorCallback)
                      }}
                      namespace={namespace}
                      namespaces={namespaces}
                    >
                    </ApplicationModal>
                  </DataTable.TableToolbarContent>
                )
              }}
            />
          </div>
        </div>
      )
  }

  componentDidMount() {
    this.fetchData(this.props.baseInfo.selectedNamespace, this.state.search, this.props.baseInfo.appNavConfigMap)

    if(window.secondaryHeader !== undefined){
      if (!window.secondaryHeader.refreshCallback) {
        window.secondaryHeader.refreshCallback = function() {
          //Update Table
          this.fetchData(this.props.baseInfo.selectedNamespace, undefined, this.props.baseInfo.appNavConfigMap)
        }.bind(this)
      }
    }

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
      //filter the rows
      totalRows.forEach((row) => {
        if (row.appName.props) { //account for the possiblity of the name being a link
          if (('' + row.appName.props.children).toLowerCase().includes(searchValue.toLowerCase())) {
            filteredRows.push(row)
            return
          }
        } else if (('' + row.appName.appName).toLowerCase().includes(searchValue.toLowerCase())) {
          filteredRows.push(row)
          return
        }

        // There has to be a better way of getting the searchable text for status
        const rowStatus = row.status.props.children[1].props.children

        if (('' + rowStatus).toLowerCase().includes(searchValue.toLowerCase())) {
          filteredRows.push(row)
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
      this.setState({
        // eslint-disable-next-line react/no-access-state-in-setstate
        rows: getRowSlice(result.sortedList, this.state.pageNumber, this.state.pageSize),
        sortColumn: newSortColumn,
        sortDirection: result.direction
      })
    }
  }

  displayComponents(name) {
    const url = location.protocol + '//' + location.host + CONTEXT_PATH + '/applications/' + encodeURIComponent(name) + '?namespace=' + encodeURIComponent(this.props.baseInfo.selectedNamespace)
    window.location.href = url
  }

  createApplication(data, errorCallback) {
    var refreshViewCallback = function(response) {
      if (response.status === 200) {
        this.fetchData(this.props.baseInfo.selectedNamespace, undefined, this.props.baseInfo.appNavConfigMap)

      } else if(response.status && response.message) {
        //kube api exception
        errorCallback(msgs.get('error.parse.description') + ' '+response.status + ' '+response.message)
      } else {
        //catch all
        errorCallback(msgs.get('error.parse.description'))
      }
    }.bind(this)

    fetch('/kappnav/application?namespace=' + encodeURIComponent(data.metadata.namespace), {
      method: 'POST',
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'CSRF-Token': getToken()
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        if(response.status === 207) {
          return response.clone().json()
        } else {
          return response
        }
      }
    })
      .then(response => refreshViewCallback(response))
  }

  fetchData(namespace, search, appNavConfigData) {
    this.setState({loading: true})
    this.refreshData(namespace, search, appNavConfigData)
  }

  refreshData(namespace, search, appNavConfigData) {
    fetch('/kappnav/applications?namespace=' + encodeURIComponent(namespace)).then(result => result.json()).then(result => {
      var rowArray = []
      result.applications.forEach((application) => {
        var item = application.application
        var itemObj = {}
        itemObj.id = item.metadata.uid+'-application'
        itemObj.status = buildStatusHtml(getStatus(item.metadata, appNavConfigData))
        itemObj.appName = <a href={location.protocol + '//' + location.host + CONTEXT_PATH + '/applications/' + encodeURIComponent(item.metadata.name) + '?namespace=' + item.metadata.namespace}>{item.metadata.name}</a>
        itemObj.namespace = item.metadata.namespace
        itemObj.menuAction = getOverflowMenu(item, application['action-map'], applicationResourceData, undefined, undefined)
        rowArray.push(itemObj)
      })
      this.filterTable(search, this.state.pageNumber, this.state.pageSize, rowArray)
    })
  }
} // end of AppView component

AppView.propTypes = {
  baseInfo: PropTypes.object
}

export default connect(
  (state) => ({
    baseInfo: state.baseInfo,
  }),
  {
  }
)(AppView)

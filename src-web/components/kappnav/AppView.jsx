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
import {Loading, DataTable} from 'carbon-components-react'
import ReactDOM from 'react-dom'
import {CONTEXT_PATH, PAGE_SIZES, SORT_DIRECTION_ASCENDING, SORT_DIRECTION_DESCENDING, RESOURCE_TYPES} from '../../actions/constants'
import {getRowSlice, sort, sortColumn, getOverflowMenu, getStatus, buildStatusHtml} from '../../actions/common'
import msgs from '../../../nls/kappnav.properties'
import ResourceTable from './common/ResourceTable.js'
import getResourceData from '../../definitions/index'
import ApplicationModal from './modals/ApplicationModal.js'


const applicationResourceData = getResourceData(RESOURCE_TYPES.APPLICATION)

class AppView extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      totalRows: [],
      filteredRows: [],
      rows: [],
      sortColumn: "status",
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
    };

    // make 'this' visible to class methods
    this.fetchData = this.fetchData.bind(this);
  }
  render() {
    if (this.state.loading)
      return <Loading withOverlay={false} className='content-spinner'/>
    else
      return (
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
          namespace={this.props.namespace}
          namespaces={this.props.namespaces}
          resourceType={applicationResourceData.resourceType}
          createNewModal={(namespace, namespaces, existingSecrets) => {
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
      );
    }

  componentDidMount() {
    this.fetchData(this.props.namespace, this.state.search, this.props.appNavConfigData)

    if (!window.secondaryHeader.refreshCallback) {
      window.secondaryHeader.refreshCallback = function(result) {
        //Update Table
        this.fetchData(this.props.namespace, undefined, this.props.appNavConfigData)
      }.bind(this);
    }

    var self = this;
    window.setInterval(function(){
      self.refreshData(self.props.namespace, self.state.search, self.props.appNavConfigData)
    }, 10000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.namespace == nextProps.namespace) {
      return true;
    } else {
      this.fetchData(nextProps.namespace, undefined, this.props.appNavConfigData)
    }
    return false;
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
        } else if (('' + appName.appName).toLowerCase().includes(searchValue.toLowerCase())) {
          filteredRows.push(row)
          return
        }

        // There has to be a better way of getting the searchable text for status
        let rowStatus = row.status.props.children[1].props.children

        if (('' + rowStatus).toLowerCase().includes(searchValue.toLowerCase())) {
          filteredRows.push(row)
        }
      });
    } else {
      //needed in case we are not searching
      filteredRows = totalRows
    }

    //sort the newList
    let sortedList = sort(filteredRows, this.state.sortDirection, this.state.sortColumn)

    this.setState({
      loading: false,
      totalRows: totalRows,
      rows: getRowSlice(sortedList, pageNumber, pageSize),
      pageNumber: pageNumber,
      pageSize: pageSize,
      filteredRows: filteredRows,
      search: searchValue
    });
  }

  handleSort(e) {
    const target = e.currentTarget
    if (target) {
      const newSortColumn = target && target.getAttribute('data-key')
      let result = sortColumn(this.state.filteredRows, this.state.sortColumn, this.state.sortDirection, newSortColumn)
      this.setState({
        rows: getRowSlice(result.sortedList, this.state.pageNumber, this.state.pageSize),
        sortColumn: newSortColumn,
        sortDirection: result.direction
      });
    }
  }

  displayComponents(name) {
    let url = location.protocol + '//' + location.host + CONTEXT_PATH + '/applications/' + encodeURIComponent(name) + "?namespace=" + encodeURIComponent(props.namespace)
    window.location.href = url
  }

  createApplication(data, errorCallback) {
    var refreshViewCallback = function(response) {
      if (response.status === 200) {
        this.fetchData(this.props.namespace, undefined, this.props.appNavConfigData)

      } else if(response.status && response.message) {
        //kube api exception
        errorCallback(msgs.get('error.parse.description') + ' '+response.status + ' '+response.message)
      } else {
        //catch all
        errorCallback(msgs.get('error.parse.description'))
      }
    }.bind(this);

    fetch('/kappnav/application?namespace=' + encodeURIComponent(data.metadata.namespace), {
      method: "POST",
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json; charset=utf-8"
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
    this.setState({loading: true});
    this.refreshData(namespace, search, appNavConfigData)
  }

  refreshData(namespace, search, appNavConfigData) {
    fetch('/kappnav/applications?namespace=' + encodeURIComponent(namespace)).then(result => result.json()).then(result => {
      var rowArray = [];
      result.applications.forEach((application) => {
        var item = application.application;
        var annotations = item.metadata.annotations;

        var itemObj = {};
        itemObj.id = item.metadata.uid+"-application"
        itemObj.status = buildStatusHtml(getStatus(item.metadata, appNavConfigData))
        itemObj.appName = <a href={location.protocol + '//' + location.host + CONTEXT_PATH + '/applications/' + encodeURIComponent(item.metadata.name) + '?namespace=' + item.metadata.namespace}>{item.metadata.name}</a>
        itemObj.namespace = item.metadata.namespace
        itemObj.menuAction = getOverflowMenu(item, application["action-map"], applicationResourceData, undefined, undefined)
        rowArray.push(itemObj)
      });

      this.filterTable(search, this.state.pageNumber, this.state.pageSize, rowArray)
    });
  }
} // end of AppView component

export default AppView;

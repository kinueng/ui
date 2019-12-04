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
import React, {Component} from 'react';
import { connect } from 'react-redux'
import {Loading, DataTable} from 'carbon-components-react'
import ReactDOM from 'react-dom'
import {CONTEXT_PATH, PAGE_SIZES, SORT_DIRECTION_ASCENDING, SORT_DIRECTION_DESCENDING, RESOURCE_TYPES} from '../../actions/constants'
import {getRowSlice, sort, sortColumn, getOverflowMenu, getStatus, buildStatusHtml, getToken} from '../../actions/common'
import msgs from '../../../nls/kappnav.properties'
import ResourceTable from './common/ResourceTable.js'
import SecondaryHeader from './common/SecondaryHeader.jsx'
import getResourceData from '../../definitions/index'
import ApplicationModal from './modals/ApplicationModal.js'
import NamespaceDropdown from './common/NamespaceDropdown'
import {getSearchableCellList} from './common/ResourceTable.js'


const applicationResourceData = getResourceData(RESOURCE_TYPES.APPLICATION)

class AppView extends Component {

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
        {key: 'status', header: msgs.get('table.header.status'), type: 'STATUS'},
        {key: 'appName', header: msgs.get('table.header.applicationName'), type: 'URL'},
        {key: 'namespace', header: msgs.get('table.header.namespace'), type: 'STRING'},
        {key: 'menuAction', header: msgs.get('table.header.action'), type: 'NOT_SEARCHABLE'},
        {key: 'title', header: 'Title', type: 'NOT_SEARCHABLE'},
        {key: 'description', header: 'Description', type: 'NOT_SEARCHABLE'},
        {key: 'section_data', header: 'section_data', type: 'NOT_SEARCHABLE'},
        {key: 'section_map', header: 'section_map', type: 'NOT_SEARCHABLE'}
      ]
    };

    // make 'this' visible to class methods
    this.fetchData = this.fetchData.bind(this);
  }
  render() {
    let viewTitle = msgs.get('page.applicationView.title');
    
    if (this.state.loading)
      return <Loading withOverlay={false} className='content-spinner'/>
    else
      return (
        <div>
          <SecondaryHeader title={viewTitle} location={location}/>
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
        </div>
        </div>
      );
    }

  componentDidMount() {
    this.fetchData(this.props.baseInfo.selectedNamespace, this.state.search, this.props.baseInfo.appNavConfigMap)

    if(window.secondaryHeader !== undefined){
      if (!window.secondaryHeader.refreshCallback) {
        window.secondaryHeader.refreshCallback = function(result) {
          //Update Table
          this.fetchData(this.props.baseInfo.selectedNamespace, undefined, this.props.baseInfo.appNavConfigMap)
        }.bind(this);
      }
    }

    var self = this;
    window.setInterval(function(){
      self.refreshData(self.props.baseInfo.selectedNamespace, self.state.search, self.props.baseInfo.appNavConfigMap)
    }, 10000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.baseInfo.selectedNamespace == nextProps.baseInfo.selectedNamespace) {
      return true;
    } else {
      this.fetchData(nextProps.baseInfo.selectedNamespace, undefined, this.props.baseInfo.appNavConfigMap)
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
      let searchValueLowerCase = searchValue.toLowerCase();
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
    let url = location.protocol + '//' + location.host + CONTEXT_PATH + '/applications/' + encodeURIComponent(name) + "?namespace=" + encodeURIComponent(props.baseInfo.selectedNamespace)
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
    }.bind(this);

    fetch('/kappnav/application?namespace=' + encodeURIComponent(data.metadata.namespace), {
      method: "POST",
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "CSRF-Token": getToken()
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
        if(application.hasOwnProperty("section-map")){
          itemObj.section_map = application["section-map"]
          if(itemObj.section_map.hasOwnProperty('sections')){
            if (application["section-map"].sections.length !== 0) {
              itemObj.title = application["section-map"].sections[0].title;
              itemObj.description = application["section-map"].sections[0].description;
            }
            if (application["section-map"]["section-data"].length !== 0) {
              itemObj.section_data = application["section-map"]["section-data"][0].data;
            }
          }
        }
        rowArray.push(itemObj)
      });
      this.filterTable(search, this.state.pageNumber, this.state.pageSize, rowArray)
    });
  }
} // end of AppView component

export default connect(
  (state) => ({
      baseInfo: state.baseInfo,
  }),
  {
  }
)(AppView);

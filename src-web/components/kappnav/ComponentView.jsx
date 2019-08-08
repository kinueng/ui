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

import 'carbon-components/scss/globals/scss/styles.scss';
import React from 'react'
import lodash from 'lodash'
import { Module, ModuleBody } from 'carbon-addons-cloud-react'
import { Loading } from 'carbon-components-react'
import ResourceTable from './common/ResourceTable.js'
import StructuredListModule from './common/StructuredListModule'
import { CONTEXT_PATH, PAGE_SIZES, SORT_DIRECTION_ASCENDING } from '../../actions/constants'
import { getRowSlice, sort, sortColumn } from '../../actions/common'
import getResourceData, { refreshResource, refreshResourceComponent } from '../../definitions/index'
import msgs from '../../../nls/kappnav.properties'

class ComponentView extends React.Component {
  constructor (props){
    super(props);

    this.state = {
      expanded: true,
      loading: true,
      loadingComponents: true,
      actions: [],
      totalRows: [],
      filteredRows: [],
      rows: [],
      sortColumn: "status",
      sortDirection: SORT_DIRECTION_ASCENDING,
      pageSize: PAGE_SIZES.DEFAULT,
      pageNumber: 1,
      search: undefined
    };

    this.fetchData = this.fetchData.bind(this);
    this.toggleExpandCollapse = this.toggleExpandCollapse.bind(this)
  }

  render() {
    const resourceType = this.props.resourceType
    const resourceData = getResourceData(resourceType)

    let basicDetailPane = <StructuredListModule
      title={resourceData.detailKeys.title}
      expanded={resourceData.detailKeys.expanded}
      headerRows={resourceData.detailKeys.headerRows}
      rows={resourceData.detailKeys.rows}
      id={this.props.name+'-overview-module'}
      data={this.state.data} />

    let additionalDetailPane;
    if(resourceData.additionalDetailKeys) {
      // Only create an additional details pane if the resource's
      // definition calls for it
      additionalDetailPane = <StructuredListModule
        title={resourceData.additionalDetailKeys.title}
        expanded={resourceData.additionalDetailKeys.expanded}
        headerRows={resourceData.additionalDetailKeys.headerRows}
        rows={resourceData.additionalDetailKeys.rows}
        id={this.props.name+'additional-details-overview-module'}
        data={this.state.data} />
    }

    let moduleTitle = msgs.get(resourceData.moduleKeys.title)
    let moduleHeader = 
      <div className='bx--module__header' style={{justifyContent: 'space-between'}} onClick={(e)=>{this.toggleExpandCollapse()}}>
        <ul data-accordion className="bx--accordion">
          <li data-accordion-item className="bx--accordion__item" className={this.state.expanded ? 'bx--accordion__item--active' : '' }>
            <button className="bx--accordion__heading" aria-expanded={this.state.expanded} aria-controls={this.props.name+"modulePane"} title={this.state.expanded ? msgs.get('collapse') : msgs.get('expand') }>
              <svg className="bx--accordion__arrow" width="7" height="12" viewBox="0 0 7 12">
                <path fillRule="nonzero" d="M5.569 5.994L0 .726.687 0l6.336 5.994-6.335 6.002L0 11.27z" />
              </svg>
              <div className="bx--accordion__title">{moduleTitle}</div>
            </button>
          </li>
        </ul>
      </div>

    let moduleBody = 
      <ModuleBody id={this.props.name+"modulePane"} className={this.state.expanded ? '' : 'collapsed'}>
        {(() => {
          if(this.state.loadingComponents) {
            return <Loading withOverlay={false} className='module-spinner' />
          } else {
            return (
              <ResourceTable
                rows={this.state.rows}
                headers={resourceData.moduleKeys.headers}
                pageSize={this.state.pageSize}
                pageNumber={this.state.pageNumber}
                title={''}
                onInputChange={(e)=>{this.searchInputChange(e)}}
                totalNumberOfRows={this.state.filteredRows.length}
                changeTablePage={(e)=>{this.handlePaginationClick(e)}}
                sortColumn={this.state.sortColumn}
                sortDirection={this.state.sortDirection}
                handleSort={(e)=>{this.handleSort(e)}}
                namespaces={this.props.namespaces}
              />
            )
          }
        })()}
      </ModuleBody>


    return (
      <div className='overview-content'>

        {(() => {
          if (!this.state.loading) {
            return (
              <div className="stackedDetails">
                { basicDetailPane }
                { additionalDetailPane }
              </div>
            )
          }
        })()}

        <Module className={this.state.expanded ? '' : 'collapsedModule' } id={this.props.name+'-component-module'}>
          { moduleHeader }
          { moduleBody }
        </Module>

      </div>
    );
  }

  getResourcePageUrl(resourceType) {
    return resourceType.name.toLowerCase() + 's'
  }

  componentDidMount(){
    this.fetchData(this.props.name);

    if (!window.secondaryHeader.refreshCallback) {
      window.secondaryHeader.refreshCallback = function(result) {
        if(result && result.operation == "delete" && result.name == this.props.name) {
          //we just deleted the RESOURCE_TYPE that we are currently displaying. Go back to the RESOURCE_TYPE list.
          let url= location.protocol+'//'+location.host + CONTEXT_PATH + '/' + this.getResourcePageUrl(this.props.resourceType);
          window.location.href = url;
        } else {
          var skipComponentReload = true;
          var originalResourceSpec = result && result.originalResource && result.originalResource.spec;
          var newResourceSpec = result && result.newResource && result.newResource.spec;
          if(originalResourceSpec && newResourceSpec &&
            ( (originalResourceSpec.selector && newResourceSpec.selector && !lodash.isEqual(originalResourceSpec.selector.matchLabels, newResourceSpec.selector.matchLabels)) ||
              (originalResourceSpec.selector && newResourceSpec.selector && !lodash.isEqual(originalResourceSpec.selector.matchExpressions, newResourceSpec.selector.matchExpressions)) ||
              !lodash.isEqual(originalResourceSpec.componentKinds,newResourceSpec.componentKinds) )
           ){
            //Update Table only if the component list could be effected by the application edit
            skipComponentReload = false;
          }
          this.fetchData(this.props.name, skipComponentReload);
        }
      }.bind(this);
    }

    var self = this;
    window.setInterval(function(){
      refreshResource(self.props.name, self.props.namespace, self.props.resourceType, self.props.appNavConfigData).then(result => {
        self.setState({loading: false, data: result});
      });
    }, 10000);

    window.setInterval(function(){
      refreshResourceComponent(self.props.name, self.props.namespace, self.props.resourceType, self.props.appNavConfigData).then(result => {
        if(result === null) {
          this.setState({loadingComponents: false});
        }
        self.filterTable(self.state.search, self.state.pageNumber, self.state.pageSize, result)
      });
    }, 30000);

  }

  toggleExpandCollapse(){
    this.setState({expanded: !this.state.expanded});
  }

  handlePaginationClick(e){
	  this.setState({rows:getRowSlice(this.state.filteredRows, e.page, e.pageSize), pageNumber:e.page, pageSize:e.pageSize});
  }

  searchInputChange(e) {
    this.filterTable(e.target.value, 1, this.state.pageSize, this.state.totalRows)
  }

  filterTable(searchValue, pageNumber, pageSize, totalRows){
    let filteredRows = [];
    //filter the rows
    if(searchValue) {
      totalRows.forEach((row) => {
        if(row.name.props) { //account for the possiblity of the name being a link
          if((''+row.name.props.children).toLowerCase().includes(searchValue.toLowerCase())){
            filteredRows.push(row);
            return;
          }
        } else if((''+row.name).toLowerCase().includes(searchValue.toLowerCase())){
          filteredRows.push(row);
          return;
        }

        // There has to be a better way of getting the searchable text for status
        let rowStatus = row.status.props.children[1].props.children

        if((''+row.compositeKind).toLowerCase().includes(searchValue.toLowerCase())){
          filteredRows.push(row);
        } else if((''+row.namespace).toLowerCase().includes(searchValue.toLowerCase())){
          filteredRows.push(row);
        } else if((''+row.platform).toLowerCase().includes(searchValue.toLowerCase())){
          filteredRows.push(row);
        } else if((''+rowStatus).toLowerCase().includes(searchValue.toLowerCase())){
          filteredRows.push(row);
        } else if((''+row.labels).toLowerCase().includes(searchValue.toLowerCase())){
          filteredRows.push(row);
        }
      });
    } else {
      filteredRows = totalRows;
    }

    //sort the newList
    var sortedList = sortedList = sort(filteredRows, this.state.sortDirection, this.state.sortColumn);

    this.setState({
      loadingComponents: false,
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
     var result = sortColumn(this.state.filteredRows, this.state.sortColumn, this.state.sortDirection, newSortColumn);
     this.setState({rows:getRowSlice(result.sortedList, this.state.pageNumber, this.state.pageSize), sortColumn:newSortColumn, sortDirection:result.direction});
   }
 }

fetchData(name, skipComponentReload) {
  this.setState({loading: true, loadingComponents: !skipComponentReload});

  refreshResource(name, this.props.namespace, this.props.resourceType, this.props.appNavConfigData).then(result => {
    this.setState({loading: false, data: result})
  });

  var self = this;
  if(!skipComponentReload) {
    refreshResourceComponent(name, this.props.namespace, this.props.resourceType, this.props.appNavConfigData).then(result => {
      self.setState({loadingComponents: false});
      self.filterTable(self.state.search, this.state.pageNumber, this.state.pageSize, result)
    });
  }
}

} // end of ComponentView component

export default ComponentView;

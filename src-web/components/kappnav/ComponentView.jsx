/*****************************************************************
 *
 * Copyright 2019, 2020 IBM Corporation
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
import React, {Component} from 'react';
import { connect } from 'react-redux';
import lodash from 'lodash'
import { Module, ModuleBody } from 'carbon-addons-cloud-react'
import { Loading, Button } from 'carbon-components-react'
import ResourceTable from './common/ResourceTable.js'
import StructuredListModule from './common/StructuredListModule'
import { CONTEXT_PATH, PAGE_SIZES, SORT_DIRECTION_ASCENDING, RESOURCE_TYPES } from '../../actions/constants'
import { getRowSlice, sort, sortColumn } from '../../actions/common'
import SecondaryHeader from './common/SecondaryHeader.jsx'
import getResourceData, { refreshResource, refreshResourceComponent } from '../../definitions/index'
import msgs from '../../../nls/kappnav.properties'
import {getSearchableCellList} from '../kappnav/common/ResourceTable.js'
import {fetchApplicationComponents} from '../../reducers/ComponentViewReducer'

class ComponentView extends Component {

  /**
   * Removes starting '/', if it exists
   * @param {string} url_path 
   */
  removeAnyStartingSlashes(url_path) {
    if(url_path && url_path.length > 0 && url_path.indexOf('/') === 0) {
      return url_path.substring(1)
    } else {
      return url_path
    }   
  }

  /**
   * Return a tokenized array of the URL path.  This method will try
   * to avoid having any array elements that are empty strings.  The idea
   * is to return an array that maps like the example below.
   * 
   * '/applications/my_applications' -> ['applications', 'my_applications']
   * 
   * @return {array} of strings from the URL path
   */
  getTokenizedURLPath() {
    // Remove the starting '/' so the split() does not
    // have indexes with empty strings
    let tokenized_url = this.removeAnyStartingSlashes(location.pathname)
    tokenized_url = tokenized_url.split('/')
    return tokenized_url
  }

  /** Intreval IDs to clear later */
  refreshResourceInt = 0
  refreshResourceComponentsInt = 0

  constructor (props) {
    super(props);

    // match comes from react-router-dom
    const { match: { params } } = this.props;

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
      search: undefined,
      name : params.resourceName
    };

    this.fetchData = this.fetchData.bind(this);
    this.toggleExpandCollapse = this.toggleExpandCollapse.bind(this)
  }

  render() {
    const {title, resourceType, customComponentButtons} = this.props
    const {name} = this.state

    // Remove the last directory in the URL path
    var paths = this.getTokenizedURLPath()
    paths.pop()
    let titleUrl = '/' + paths.join('/') 

    let breadcrumbItems = [
      {label : title, url : titleUrl},
      {label : name}
    ]

    let resourceData = getResourceData(resourceType)

    let basicDetailPane = <StructuredListModule
      title={resourceData.detailKeys.title}
      expanded={resourceData.detailKeys.expanded}
      headerRows={resourceData.detailKeys.headerRows}
      rows={resourceData.detailKeys.rows}
      id={name+'-overview-module'}
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
        id={name+'additional-details-overview-module'}
        data={this.state.data} />
    }

    let moduleTitle = msgs.get(resourceData.moduleKeys.title)
    let moduleHeader = 
      <div className='bx--module__header' style={{justifyContent: 'space-between'}}>
        <ul data-accordion className="bx--accordion">
          <li data-accordion-item className="bx--accordion__item" className={this.state.expanded ? 'bx--accordion__item--active' : '' }>
            <button className="bx--accordion__heading" aria-expanded={this.state.expanded} aria-controls={name+"modulePane"} title={this.state.expanded ? msgs.get('collapse') : msgs.get('expand')} onClick={(e)=>{this.toggleExpandCollapse()}}>
              <svg className="bx--accordion__arrow" width="7" height="12" viewBox="0 0 7 12">
                <path fillRule="nonzero" d="M5.569 5.994L0 .726.687 0l6.336 5.994-6.335 6.002L0 11.27z" />
              </svg>
              <div className="bx--accordion__title">{moduleTitle}</div>
            </button>
          </li>
        </ul>
        {(() => {
          return (
            <div>
              {customComponentButtons && customComponentButtons.map((button, index) => (
                <Button small icon={button.icon}
                  onClick={button.action.bind(this, this.props.history, name, this.props.baseInfo.selectedNamespace)}
                  title={msgs.get(button.buttonDescription)}
                  iconDescription={msgs.get(button.iconDescription)}
                  id={'customComponentButtons' + index}>
                  {msgs.get(button.label)}
                </Button>
              ))}
            </div>
          )
        })()}
      </div>

    let moduleBody = 
      <ModuleBody id={name+"modulePane"} className={this.state.expanded ? '' : 'collapsed'}>
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
                namespaces={this.props.baseInfo.namespaces}
              />
            )
          }
        })()}
      </ModuleBody>

    return (
      <div>
        <SecondaryHeader title={name} breadcrumbItems={breadcrumbItems} location={location}/>
      
      
      <div className="page-content-container overview-content" role="main">

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

        <Module className={this.state.expanded ? '' : 'collapsedModule' } id={name+'-component-module'}>
          { moduleHeader }
          { moduleBody }
        </Module>

      </div>
      </div>
    );
  }

  getResourcePageUrl(resourceType) {
    return resourceType.name.toLowerCase() + 's'
  }

  componentWillReceiveProps(nextProps) {
    var self = this;
    if (this.props.resourceTableReducer.resourceTableError !== nextProps.resourceTableReducer.resourceTableError && nextProps.resourceTableReducer.resourceTableError !== '') {
      this.setState({loadingComponents: true});
      refreshResourceComponent(self.state.name, self.props.baseInfo.selectedNamespace, self.props.resourceType, self.props.baseInfo.appNavConfigMap).then(result => {
        if(result === null) {
          this.setState({loadingComponents: false});
        }
        self.filterTable(self.state.search, self.state.pageNumber, self.state.pageSize, result)
      });
    }
  }

  componentDidMount(){
    this.fetchData(this.state.name);
    if(window.secondaryHeader !== undefined){
    if (!window.secondaryHeader.refreshCallback) {
      window.secondaryHeader.refreshCallback = function(result) {
        if(result && result.operation === "delete" && result.name === this.state.name) {
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
          this.fetchData(this.state.name, skipComponentReload);
        }
      }.bind(this);
    }
  }

    var self = this;
    this.refreshResourceInt = window.setInterval(function(){
      refreshResource(self.state.name, self.props.baseInfo.selectedNamespace, self.props.resourceType, self.props.baseInfo.appNavConfigMap).then(result => {
        self.setState({loading: false, data: result});
      });
    }, 10000);

    this.refreshResourceComponentsInt = window.setInterval(function(){
      refreshResourceComponent(self.state.name, self.props.baseInfo.selectedNamespace, self.props.resourceType, self.props.baseInfo.appNavConfigMap).then(result => {
        if(result === null) {
          this.setState({loadingComponents: false});
        }
        self.filterTable(self.state.search, self.state.pageNumber, self.state.pageSize, result)
        self.loadingReduxStore(result, self.state.name)
      });
    }, 30000);

  }

  componentWillUnmount() {
    clearInterval(this.refreshResourceInt)
    clearInterval(this.refreshResourceComponentsInt)
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

  loadingReduxStore(result, applicationName) {
    var components = []
    var componentViewReduxData = {
      "applicationName": applicationName,
      "applicationNamespace": this.props.baseInfo.selectedNamespace
    }
    result.forEach((component) => {
      var eachComponent
      if(component.name.props !== undefined){
        eachComponent = {
          "componentName": component.name.props.children,
          "componentNamespace": component.namespace
        }
      } else if(component.name !== undefined) {
        eachComponent = {
          "componentName": component.name,
          "componentNamespace": component.namespace
        }
      }
      components.push(eachComponent)
    })
    componentViewReduxData["components"] = components
    //calling the dispatcher function to load the redux store
    this.props.fetchApplicationComponents(componentViewReduxData)
  }

  filterTable(searchValue, pageNumber, pageSize, totalRows){
    let filteredRows = [];
    let resourceData = getResourceData(this.props.resourceType)
    //filter the rows
    if(searchValue) {
      let searchValueLowerCase = searchValue.toLowerCase();
      totalRows.forEach((row) => {
        var searchFields = getSearchableCellList(row, resourceData.moduleKeys.headers);
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

  refreshResource(name, this.props.baseInfo.selectedNamespace, this.props.resourceType, this.props.baseInfo.appNavConfigMap).then(result => {
    this.setState({loading: false, data: result})
  });

  var self = this;
  if(!skipComponentReload) {
    refreshResourceComponent(name, this.props.baseInfo.selectedNamespace, this.props.resourceType, this.props.baseInfo.appNavConfigMap).then(result => {
      self.setState({loadingComponents: false});
      self.filterTable(self.state.search, this.state.pageNumber, this.state.pageSize, result)
      this.loadingReduxStore(result, name)
    });
  }
}

} // end of ComponentView component

export default connect(
  (state) => ({
      baseInfo: state.baseInfo,
      resourceTableReducer : state.resourceTableReducer
  }),
  {
    fetchApplicationComponents
  }
)(ComponentView);

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

import React, { Component } from 'react';
import AppView from './kappnav/AppView.jsx';
import ComponentView from './kappnav/ComponentView.jsx';
import DetailView from './kappnav/DetailView.jsx';
import JobView from './kappnav/JobView.jsx';
import SecondaryHeader from './kappnav/common/SecondaryHeader.jsx';
import NamespaceDropdown from './kappnav/common/NamespaceDropdown';
import { RESOURCE_TYPES } from '../actions/constants';
import getResourceData from '../definitions/index';

class ViewContainer extends React.Component {

  constructor (props){
    super(props)
        
    // make 'this' visible to class methods
    this.fetchNamespaces = this.fetchNamespaces.bind(this)
    this.fetchAppNavConfigMap = this.fetchAppNavConfigMap.bind(this)

		document.title = 'Application Navigator'

    var loadingNamespace = false
    var loadingExsitingSecrets = false
    if(props.view === 'AppView') {
      loadingNamespace = true
      this.fetchNamespaces();
    }

    var loadingAppNavConfigData = true;
    this.fetchAppNavConfigMap();

    this.state = {
      namespaces: [{Name:'default'}],
      namespace: props.namespace ? props.namespace : '',
      loadingNamespace: loadingNamespace,
      loadingExsitingSecrets: loadingExsitingSecrets,
      loadingAppNavConfigData: loadingAppNavConfigData,
      appNavConfigData: {}
    }
  }

  fetchNamespaces() {
    fetch('/kappnav/namespaces')
		.then(result=>result.json())
		.then(result=>{
      var namespacesArray = []
      result.namespaces.forEach((ns) => {
        var itemObj = {}
        itemObj.Name = ns.metadata.name
        namespacesArray.push(itemObj)
      });
      this.setState({namespaces:namespacesArray, loadingNamespace:false})
    });
  }

  fetchExistingSecrets() {
    fetch('/kappnav/secrets/credential-type/app-navigator')
		.then(result=>result.json())
		.then(result=>{
      var existingSecretsArray = []
      result.secrets.forEach((ns) => {
        var itemObj = {}
        itemObj.Name = ns.metadata.name
        existingSecretsArray.push(itemObj)
      });
      this.setState({existingSecrets:existingSecretsArray, loadingExsitingSecrets:false})
    });
  }

  fetchAppNavConfigMap() {
    fetch('/kappnav/configmap/kappnav-config?namespace='+document.documentElement.getAttribute('appnavConfigmapNamespace'))
		.then(result=>result.json())
		.then(result=>{
      var data = result.data
      var appNavConfigData = {}
      appNavConfigData.statuColorMapping = JSON.parse(data['status-color-mapping'])
      appNavConfigData.statusPrecedence = JSON.parse(data['app-status-precedence'])
      appNavConfigData.statusUnknown = data['status-unknown']
      this.setState({appNavConfigData:appNavConfigData, loadingAppNavConfigData:false})
    });
  }

  render() {

    if(this.state.loadingNamespace || this.state.loadingAppNavConfigData || this.state.loadingExsitingSecrets) { //dont render yet
      return (<div></div>)
    }

    const {
      name,
      breadcrumbItems,
      location,
      tabs,
			viewTitle,
      view,
      resourceType
		} = this.props

    return (
      <div>
        <SecondaryHeader title={viewTitle} breadcrumbItems={breadcrumbItems} tabs={tabs} location={location}/>
      <div className="page-content-container" role="main">
          {(() => {
            if(view === 'AppView') {
              return (
            <div>
                <NamespaceDropdown namespaces={this.state.namespaces}
                                   selected_namespaces={this.state.namespace}
                                   switchNamespace={(e)=>{this.switchNamespace(e)}}/>
                <AppView namespace={this.state.namespace} namespaces={this.state.namespaces} appNavConfigData={this.state.appNavConfigData}/>
            </div>
              )
            } else if(view === 'ComponentView') {
              return (
                <ComponentView name={name} 
                  resourceType={resourceType} 
                  namespace={this.state.namespace} 
                  namespaces={this.state.namespaces} 
                  appNavConfigData={this.state.appNavConfigData}/>
              )
            } else if(view === 'DetailView') {
              return (
                <DetailView name={name} namespace={this.state.namespace} appNavConfigData={this.state.appNavConfigData}/>
              )
            } else if(view === 'JobView') {
              return (
                <JobView namespace={this.state.namespace} namespaces={this.state.namespaces} appNavConfigData={this.state.appNavConfigData}/>
              )
            }
          })()}
        </div>
      </div>
    );
  }

  switchNamespace(e){
     if(e.selectedItem.id == 'all'){
       this.setState({namespace: ''})
     } else {
       this.setState({namespace: e.selectedItem.value})
     }
  }

} // end of ViewContainer component

export default ViewContainer

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

import React from 'react'
import ReactDOM from 'react-dom'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import msgs from '../nls/kappnav.properties'
import ViewContainer from './components/ViewContainer.jsx'
import { CONTEXT_PATH , RESOURCE_TYPES} from './actions/constants'

var paths = location.pathname.split('/')
paths = paths.filter(function(e){return e})

if(paths.length==1 || (paths.length==2 && paths[1] == 'applications') ) { //Application View

  ReactDOM.render(
    <Router>
      <div>
        <Route exact render={(props) => <ViewContainer {...props} view='AppView' viewTitle={msgs.get('page.applicationView.title')}
            location={location}
        />} />
      </div>
    </Router>,
    document.getElementById('app')
  );

} else if(paths.length === 3 && (paths[1] === 'applications') ) { // Component View

  let title = msgs.get('page.applicationView.title') // default = application
  let titleUrl = CONTEXT_PATH + '/applications' // default = application
  let resourceType = RESOURCE_TYPES.APPLICATION

  let resourceName = decodeURIComponent(paths[2])
  let url = new URL(location.href)
  let ns = decodeURIComponent(url.searchParams.get("namespace"))
  ReactDOM.render(
    <Router>
      <div>
        <Route exact path={location.pathname}
                    render={(props) => <ViewContainer {...props}
                                         view = 'ComponentView'
                                         viewTitle = {resourceName}
                                         name = {resourceName}
                                         resourceType = {resourceType}
                                         namespace = {ns}
                                         breadcrumbItems = {[
                                                             {label : title, url : titleUrl},
                                                             {label : resourceName}  
                                                            ]} 
                                        />
                            }
        />
      </div>
    </Router>,
    document.getElementById('app')
  );

} else if(paths.length === 5 && (paths[1] === 'applications') ) { //Detail View

  let name = decodeURIComponent(paths[2])
  let resourceType = paths[3]
  let itemName = decodeURIComponent(paths[4])
  let url = new URL(location.href);
  let ns = decodeURIComponent(url.searchParams.get("namespace"))
  let parent_ns = decodeURIComponent(url.searchParams.get("parentnamespace"))
  let title = msgs.get('page.applicationView.title')
  
  ReactDOM.render(
    <Router>
      <div>
        <Route exact path={location.pathname}
                    render={(props) => <ViewContainer {...props}
                                         view='DetailView'
                                         viewTitle={itemName}
                                         name= {itemName}
                                         namespace = {ns}
                                         resourceType = {resourceType}
                                         breadcrumbItems={[{label:title, url:CONTEXT_PATH+'/' + paths[1]},
                                                           {label:name, url:CONTEXT_PATH+'/'+paths[1]+'/'+encodeURIComponent(name)+'?namespace='+encodeURIComponent(parent_ns)},
                                                           {label:itemName, url:CONTEXT_PATH+'/'+paths[1]+'/'+encodeURIComponent(name)+'/'+resourceType+'/'+encodeURIComponent(itemName)+'?namespace='+encodeURIComponent(ns)+'&parentnamespace='+encodeURIComponent(parent_ns)} ]} />} />
      </div>
    </Router>,
    document.getElementById('app')
  );

} else if(paths.length === 2 && paths[1] === 'jobs')  { // Command action jobs view

  ReactDOM.render(
    <Router>
      <div>
        <Route exact render={(props) => 
          <ViewContainer {...props} view='JobView' viewTitle={msgs.get('page.jobsView.title')} location={location}/>}/>
      </div>
    </Router>,
    document.getElementById('app')
  );
}

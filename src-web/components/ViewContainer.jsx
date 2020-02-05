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
import { connect } from 'react-redux';
import msgs from '../../nls/kappnav.properties';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { fetchLoadingNamespaces, fetchLoadingSecrets, fetchLoadingAppNavConfigMaps } from '../reducers/BaseServiceReducer';
import AppView from './kappnav/AppView.jsx';
import ComponentView from './kappnav/ComponentView.jsx';
import JobView from './kappnav/JobView.jsx';
import { RESOURCE_TYPES } from '../actions/constants';
import {getExtendedRoutes} from './extensions/RouteExtensions'

class ViewContainer extends Component {

    componentWillMount = () => {
        if (this.props.baseInfo.namespaces.length === 0) {
            this.props.fetchLoadingNamespaces();
        }

        if (this.props.baseInfo.secrets === undefined) {
            this.props.fetchLoadingSecrets();
        }

        if (Object.keys(this.props.baseInfo.appNavConfigMap).length === 0) {
            this.props.fetchLoadingAppNavConfigMaps();
        }
    }

    render() {
        if (Object.keys(this.props.baseInfo.appNavConfigMap).length === 0 || this.props.baseInfo.secrets === undefined || this.props.baseInfo.namespaces.length === 0){
            return (<div></div>)
        }
        else{
        return (
            <div >
                <main >
                    <Router>
                        <Switch >
                            <Route exact path="/kappnav-ui/" component={AppView} />

                            <Route exact path="/kappnav-ui/applications" component={AppView} />

                            <Route exact path="/kappnav-ui/jobs" component={JobView} />

                            <Route exact path="/kappnav-ui/applications/:resourceName" 
                                component={(props) => 
                                    <ComponentView {...props}
                                                   title={msgs.get('page.applicationView.title')}
                                                   resourceType={RESOURCE_TYPES.APPLICATION}/>}/>

                            {/* getting all extended routes if any */}
                            {getExtendedRoutes().length > 0 ? getExtendedRoutes().map((route) => {
                                return <Route exact path={route.path} component={route.component}/>
                            }): null}
                        </Switch>
                    </Router>
                </main>
            </div>
        );
        }
    }
}

export default connect(
    (state) => ({
        baseInfo: state.baseInfo,
    }),
    {
        fetchLoadingNamespaces,
        fetchLoadingSecrets,
        fetchLoadingAppNavConfigMaps
    }
)(ViewContainer);

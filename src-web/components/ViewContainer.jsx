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
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { fetchLoadingNamespaces, fetchLoadingSecrets, fetchLoadingAppNavConfigMaps } from '../reducers/BaseServiceReducer';
import AppView from './kappnav/AppView.jsx';
import ComponentView from './kappnav/ComponentView.jsx';
import DetailView from './kappnav/DetailView.jsx';
import JobView from './kappnav/JobView.jsx';

class ViewContainer extends Component {

    componentWillMount = () => {
        if (this.props.baseInfo.namespaces.length === 0) {
            this.props.fetchLoadingNamespaces();
        }

        if (this.props.baseInfo.secrets.length === 0) {
            this.props.fetchLoadingSecrets();
        }

        if (Object.keys(this.props.baseInfo.appNavConfigMap).length === 0) {
            this.props.fetchLoadingAppNavConfigMaps();
        }
    }

    render() {
        if (Object.keys(this.props.baseInfo.appNavConfigMap).length === 0){
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

                            <Route exact path="/kappnav-ui/applications/:applicationName" component={ComponentView} />

                            <Route exact path="/kappnav-ui/was-nd-cells/:cellName/was-traditional-app/:applicationName" component={DetailView} />
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

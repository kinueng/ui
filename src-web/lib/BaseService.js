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
export const fetchNamespaces = () => {
    return fetch('/kappnav/namespaces')
        .then(res => res.json())
        .then(result => {
            var namespacesArray = []
            result.namespaces.forEach((ns) => {
                var itemObj = {}
                itemObj.Name = ns.metadata.name
                namespacesArray.push(itemObj)
            });
            return namespacesArray
        });
}


export const fetchExistingSecrets = () => {
    return fetch('/kappnav/secrets/credential-type/app-navigator')
        .then(res => res.json())
        .then(result => {
            var existingSecretsArray = []
            result.secrets.forEach((ns) => {
                var itemObj = {}
                itemObj.Name = ns.metadata.name
                existingSecretsArray.push(itemObj)
            });
            return existingSecretsArray
        });
}

export const fetchAppNavConfigMap = () => {
    return fetch('/kappnav/configmap/kappnav-config?namespace=' + document.documentElement.getAttribute('appnavConfigmapNamespace'))
        .then(res => res.json())
        .then(result => {
            var data = result.data
            var appNavConfigData = {}
            appNavConfigData.statuColorMapping = JSON.parse(data['status-color-mapping'])
            appNavConfigData.statusPrecedence = JSON.parse(data['app-status-precedence'])
            appNavConfigData.statusUnknown = data['status-unknown']
            appNavConfigData.completedJobsPollingInterval = data['ui-completed-jobs-polling-interval-in-ms']
            return appNavConfigData
        });
}

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
import { fetchNamespaces, fetchExistingSecrets, fetchAppNavConfigMap } from "../lib/BaseService";

/**
 * @return {string} The namespace query parameter, else empty string
 */
function getSelectedNamespace() {
    let currentURL = new URL(location.href)
    let namespace = currentURL.searchParams.get('namespace')
    if(namespace === null) {
        // namespace parameter did not exist
        return ''
    }
    return namespace
}

const _selectedNamespace = getSelectedNamespace()

const initState = {
    namespaces: [],
    secrets: undefined,
    appNavConfigMap: {},
    selectedNamespace: _selectedNamespace
}

const BASESERVICE_LOADING_NAMESPACES = 'BASESERVICE_LOADING_NAMESPACES';
const BASESERVICE_LOADING_SECRETS = 'BASESERVICE_LOADING_SECRETS';
const BASESERVICE_LOADING_APPNAVCONFIGMAP = 'BASESERVICE_LOADING_APPNAVCONFIGMAP';
const BASESERVICE_LOADING_SELECTEDNAMESPACES = 'BASESERVICE_LOADING_SELECTEDNAMESPACES';

export const loadingNamespaces = (namespaces) => ({
    type: BASESERVICE_LOADING_NAMESPACES,
    payload: namespaces
});

export const loadingSecrets = (secrets) => ({
    type: BASESERVICE_LOADING_SECRETS,
    payload: secrets
});

export const loadingAppNavConfigMap = (appNavConfigMaps) => ({
    type: BASESERVICE_LOADING_APPNAVCONFIGMAP,
    payload: appNavConfigMaps
});

export const loadingSelectedNamespace = (selectedNamespace) => ({
    type: BASESERVICE_LOADING_SELECTEDNAMESPACES,
    payload: selectedNamespace
});

export const fetchLoadingNamespaces = () => {
    return (dispatch) => {
        fetchNamespaces()
            .then(namespaces => {
                dispatch(loadingNamespaces(namespaces));
            })
    }
}

export const fetchLoadingSecrets = () => {
    return (dispatch) => {
        fetchExistingSecrets()
            .then(secrets => {
                dispatch(loadingSecrets(secrets));
            })
    }
}

export const fetchLoadingAppNavConfigMaps = () => {
    return (dispatch) => {
        fetchAppNavConfigMap()
            .then(appNavConfigMaps => {
                dispatch(loadingAppNavConfigMap(appNavConfigMaps));
            })
    }
}

export const fetchLoadingSelectedNamespace = (selectedNamespace) => {
    return (dispatch) => {
        dispatch(loadingSelectedNamespace(selectedNamespace));
    }
}


export default (state = initState, action) => {
    switch (action.type) {
        case BASESERVICE_LOADING_NAMESPACES:
            return {
                ...state,
                namespaces: action.payload
            };

        case BASESERVICE_LOADING_SECRETS:
            return {
                ...state,
                secrets: action.payload
            };

        case BASESERVICE_LOADING_APPNAVCONFIGMAP:
            return {
                ...state,
                appNavConfigMap: action.payload
            };
        
        case BASESERVICE_LOADING_SELECTEDNAMESPACES:
            return {
                ...state,
                selectedNamespace: action.payload
            };
        default:
            return state;
    }
}

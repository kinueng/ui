import { fetchNamespaces, fetchExistingSecrets, fetchAppNavConfigMap } from "../lib/BaseService";

const initState = {
    namespaces: [],
    secrets: [],
    appNavConfigMap: {},
    selectedNamespace: (decodeURIComponent(new URL(location.href).searchParams.get("namespace")) === "null") ? '' : decodeURIComponent(new URL(location.href).searchParams.get("namespace"))
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
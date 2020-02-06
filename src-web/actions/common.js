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

'use strict'

import React from 'react'
import moment from 'moment'
import lodash from 'lodash'
import { Tag, OverflowMenu, OverflowMenuItem } from 'carbon-components-react'
import msgs from '../../nls/kappnav.properties'
import { CONFIG_CONSTANTS, STATUS_COLORS } from './constants'

/*
 * action types
 *
 * action name: <NOUN>_<VERB>
 */
import { SORT_DIRECTION_ASCENDING, SORT_DIRECTION_DESCENDING } from '../actions/constants'

export const getToken = () => {
  var token = null
  try{
    token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
  } catch (e){
    //catch all. do nothing, token will be null
  }
  return token
}

export const translateKind = (kind) => {
  if(! kind) {
    // For whatever reason, during the ReactJS component lifecycle,
    // this method gets called before the kind is set.  Let's have
    // defensive code and just return nothing if the parameter is fasley
    return kind
  }

  kind = kind.toLowerCase()
  kind = kind.replace(/-/g, '') //remove the dashes (-)
  const translatedKind = msgs.get(kind)

  return translatedKind === '!'+kind+'!' ? kind : translatedKind //don't return a non translated kind
}

export const getRowSlice = (rowArray, pageNumber, pageSize) => {
  const totalPages = rowArray.length/pageSize
  const firstRowIndex = (pageNumber-1)*pageSize
  let newRows = []

  if(rowArray.length < pageSize){ //only 1 page to show
    newRows = rowArray.slice(0)
  } else if(pageNumber >= totalPages){ // last page
    newRows = rowArray.slice(firstRowIndex)
  } else { //somewhere in between
    newRows = rowArray.slice(firstRowIndex, pageNumber*pageSize)
  }
  return newRows
}

export const sortColumn = (rowArray, previousSortColumn, previousSortDirection, column) => {
  const direction = previousSortColumn != column ? SORT_DIRECTION_ASCENDING : previousSortDirection==SORT_DIRECTION_DESCENDING ? SORT_DIRECTION_ASCENDING : SORT_DIRECTION_DESCENDING
  return {'sortedList': sort(rowArray,direction,column), 'direction':direction}
}

export const sort = (rowArray, direction, column) => {
  rowArray = direction == SORT_DIRECTION_ASCENDING ?
    rowArray.sort((a, b) => {
      const aValue = a[column].props ?
        a[column].props['data-sorttitle'] ? a[column].props['data-sorttitle']
          : a[column].props.children
        : a[column]
      const bValue = b[column].props ?
        b[column].props['data-sorttitle'] ? b[column].props['data-sorttitle']
          : b[column].props.children
        : b[column]
      return aValue.localeCompare(bValue, undefined, {numeric: true})
    }) :
    rowArray.sort((a, b) => {
      const aValue = a[column].props ?
        a[column].props['data-sorttitle'] ? a[column].props['data-sorttitle']
          : a[column].props.children
        : a[column]
      const bValue = b[column].props ?
        b[column].props['data-sorttitle'] ? b[column].props['data-sorttitle']
          : b[column].props.children
        : b[column]
      return bValue.localeCompare(aValue, undefined, {numeric: true})
    })

  return rowArray
}

export const transform = (resource, key) => {
  let value = lodash.get(resource, key.resourceKey)
  if (key.type === 'timestamp') {
    return moment(value).format('MMM Do YYYY \\at h:mm A')
  } else if (key.type === 'i18n') {
    return msgs.get(key.resourceKey)
  } else if (key.type === 'boolean') {
    value = (new Boolean(value)).toString()
    return msgs.get(value)
  } else if (key.transformFunction && typeof key.transformFunction === 'function') {
    return key.transformFunction(resource)
  } else if (key.type === 'tag') {
    var data = key.getData(resource)
    return data ? data.map((tagText, index) => <Tag key={`tag-${index}`} style={{display: 'inline-block'}} type={'beta'} title={tagText.title}>{tagText.value ? `${tagText.name}:${tagText.value}` : tagText.name}</Tag>) : '-'
  } else if (key.type === 'expression') {
    var data = key.getData(resource)
    return data ? data.map((tagText, index) =><span className="bx--tag bx--tag--beta" title={tagText.title} style={{display: 'inline-block'}}>{tagText.name}<div className="expression">{tagText.operator}</div>{tagText.value}</span>) : '-'
  } else if (key.type === 'links') {
    var data = key.getData(resource)
    return data ? data.map((linkInfo, index) => <a style={{display: 'block'}} key={`link-${index}`} href={linkInfo.url} target="_blank" rel="noopener noreferrer" title={linkInfo.description}>{linkInfo.description}</a>) : '-'
  } else {
    return (value || value === 0) ? value : '-'
  }
}

export const getLabelsToString = labels => {
  const labelKeys = labels && Object.keys(labels)
  if (labelKeys && labelKeys.length > 0) {
    let str = ''
    for (var key of labelKeys) {
      str += key + '=' + labels[key] + ','
    }
    return str.substring(0, str.length - 1)
  } else {
    return '-'
  }
}

var defaultTimestampKey = 'metadata.creationTimestamp'

export const getAgeDifference = (createdTime) => {
  const difference = moment().diff(createdTime),
    diffDuration = moment.duration(difference),
    days = diffDuration.days(),
    hours = diffDuration.hours(),
    minutes = diffDuration.minutes()
  return {'difference': difference, 'diffDuration': diffDuration, 'days': days, 'hours': hours, 'minutes' : minutes}
}

export const getCreationTime = (item, timestampKey) => {
  const key = timestampKey ? timestampKey : defaultTimestampKey
  const createdTime = lodash.get(item, key)
  return createdTime;
}

export const getAge = (item, timestampKey) => {
  const createdTime = getCreationTime(item, timestampKey);
  if (createdTime) {
    const diff = getAgeDifference(createdTime),
          days = diff.days,
          hours = diff.hours,
          minutes = diff.minutes

    if (days > 0) {
      return days === 1 ? msgs.get('dayAgo') : msgs.get('daysAgo', [days])
    }
    if (hours > 0) {
      return hours === 1 ? msgs.get('hourAgo') : msgs.get('hoursAgo', [hours])
    }
    return minutes === 1 ? msgs.get('minuteAgo') : msgs.get('minutesAgo', [minutes])
  }
  return '-'
}

export const openModal = (...args) => {
  // https://github.com/carbon-design-system/carbon/issues/4036
  // Carbon Modal a11y focus workaround
  setTimeout(
    () => openModal_internal(...args), 
    25 // milliseconds
  )
}

const openModal_internal = (operation, resource, application, applicationNamespace, cmd, cmdInput) => {
  const resourceType = resource.kind.toLowerCase()
  if(resourceType === 'job' && operation === 'remove') {
    // The delete job logic is very different from the other 
    window.secondaryHeader.showRemoveResourceModal(
      true, 
      { primaryBtn: 'modal.button.' + operation, heading: 'modal.' + operation + '.heading' }, 
      resource,
      '/kappnav/resource/command/' + encodeURIComponent(resource.metadata.name)
    )
  } else if(operation === 'edit') {
    window.secondaryHeader.showResourceModal(true, {
      primaryBtn: 'modal.button.save',
      heading: 'modal.'+operation+'.heading'
    }, resource,  '/kappnav/'+resourceType+'/'+encodeURIComponent(resource.metadata.name)+'?namespace='+encodeURIComponent(resource.metadata.namespace))
  } else if(operation === 'action') {
    var url = '/kappnav/resource/' + encodeURIComponent(resource.metadata.name)+'/'+resource.kind+'/execute/command/'+encodeURIComponent(cmd.name)+'?namespace='+encodeURIComponent(resource.metadata.namespace)
    if(application) {
      url = '/kappnav/resource/' + encodeURIComponent(application)+'/' + encodeURIComponent(resource.metadata.name)+'/'+resource.kind+'/execute/command/'+encodeURIComponent(cmd.name)+'?namespace='+encodeURIComponent(resource.metadata.namespace)+'&application-namespace='+applicationNamespace
    }
      
    var input = undefined
    if(cmdInput && cmd[CONFIG_CONSTANTS.REQUIRES_INPUT]) {
      input = cmdInput[cmd[CONFIG_CONSTANTS.REQUIRES_INPUT]]
    }

    window.secondaryHeader.showActionResourceModal(true, {
      primaryBtn: 'modal.button.submit',
      heading: cmd.description
    }, resource, url, input, cmd)  
  } else {
    window.secondaryHeader.showRemoveResourceModal(true, {
      primaryBtn: 'modal.button.'+operation,
      heading: 'modal.'+operation+'.heading'
    }, resource,  '/kappnav/'+resourceType+'/'+encodeURIComponent(resource.metadata.name)+'?namespace='+encodeURIComponent(resource.metadata.namespace))
  }
}

export const performUrlAction = (urlPattern, openWindow, kind, name, namespace, linkId, followLink) => {
  if(urlPattern) {
    //expand the url
    fetch('/kappnav/resource/' + encodeURIComponent(name)+'/'+kind+'?action-pattern='+encodeURIComponent(urlPattern)+'&namespace='+encodeURIComponent(namespace))
      .then(response => {
        if (!response.ok) {
        //Failed to get a link back
        //Todo: Decide how to display this error to the user
        } else {
          return response.json()
        }
      }).then(result => {
        let url = result.action

        try {
          let parsedURL = new URL(result.action)
          if(parsedURL && parsedURL.searchParams){
            let searchParams = parsedURL.searchParams.entries()
            let newURL = parsedURL.origin+parsedURL.pathname+parsedURL.hash
            //URL encode search params
            let first = true
            for (let [key, value] of searchParams) {
              if (first === true) {
                newURL = newURL + '?'
              } else {
                newURL = newURL + '&'
              }
              newURL = newURL + key + '=' + encodeURIComponent(value)
              first = false
            }
            url = newURL
          }
        } catch (e) {
          //This might happen if the URL is not valid.  That's ok, we will still set it to the wrong thing so the user can
          //remedy the problem
        }

        if(linkId){
          if(document.getElementById(linkId)) {  //We are updating a link in place, it has not been clicked on, so don't open it
            document.getElementById(linkId).href = url
            document.getElementById(linkId).removeEventListener('onclick', (e) => { e.preventDefault() })
          }
        } else if (followLink) {
          if(openWindow === 'current') {
            window.location.href = url
          } else {
            var newWindow = window.open()
            newWindow.opener = null
            newWindow.location = url
            if(openWindow === 'new'){
              newWindow.toolbar = 0
              newWindow.location = 0
              newWindow.menubar = 0
            }
          }
        }
      })
  }
}

export const updateSecondaryHeader = (statusColor, statusText, actions) => {
  window.secondaryHeader.update(statusColor, statusText, actions)
}

export const getHoverOverTextForStatus = (annotations) => {
  if(! annotations) {
    return ''
  }
  let hoverOverNLS = annotations['kappnav.status.flyover.nls']
  if(hoverOverNLS) {
    let flyover = JSON.parse(hoverOverNLS)
    if(! Array.isArray(flyover)) {
      // Expect this to be a string like "unknown"
      return msgs.get(flyover.toLowerCase())
    }

    // splice will return index 0 and delete the element from the array
    // details array should be left with only arguments for the PII message e.g. {0} {1} ...
    let indexToRemove = 0;
    let howManyToRemoveFromArray = 1;
    let msgKey = flyover.splice(indexToRemove, howManyToRemoveFromArray)
    return msgs.get(msgKey, flyover)
  }
  let hoverOver_notNLS = annotations['kappnav.status.flyover']
  if(hoverOver_notNLS) {
    return hoverOver_notNLS
  }
  return ''
}

export const getStatus = (metadata, appNavConfigData) => { 
  const statusColorMapping = appNavConfigData && appNavConfigData.statuColorMapping
  const statusPrecedence = appNavConfigData && appNavConfigData.statusPrecedence ? appNavConfigData && appNavConfigData.statusPrecedence : []
  const statusUnknown = appNavConfigData && appNavConfigData.statusUnknown

  const annotations = metadata && metadata.annotations

  let statusMessage = statusUnknown ? statusUnknown : ''
  statusMessage = getHoverOverTextForStatus(annotations)

  let statusColor = STATUS_COLORS.DEFAULT_COLOR
  let statusText = ''
  let sortTitle = ''

  const name = metadata && metadata.name;
  const value = annotations && annotations['kappnav.status.value'] ? annotations['kappnav.status.value'] : statusUnknown
  const sortIndex = statusPrecedence.findIndex(val => val === value)
  
  if(statusColorMapping && value) {
    statusText = msgs.get(value.toLowerCase())
    const colorKey = statusColorMapping.values && statusColorMapping.values[value]
    if(colorKey) {
      const color = statusColorMapping.colors && statusColorMapping.colors[colorKey]
      if(color) {
        statusColor = color
      }
    }
    sortTitle = sortIndex+statusColor+name
  }

  return {
    statusColor: statusColor, 
    borderColor: STATUS_COLORS.BORDER_COLOR, 
    statusMessage: statusMessage, 
    statusText: statusText, 
    sortTitle: sortTitle}
}

export const buildStatusHtml = (statusObj) => {
  return (
    <div className='statusCell' data-sorttitle={statusObj.sortTitle}>
      <span className="bx--detail-page-header-status-icon" 
            title={statusObj.statusMessage} 
            style={{backgroundColor: statusObj.statusColor, borderColor: statusObj.borderColor}}>
      </span>
      <span className="bx--detail-page-header-status-text">{statusObj.statusText}</span>
    </div>
  )
}

export const validateUrl = (url) => {
  // Parse the user provided URL.  This is crude way to prevent XSS by 
  // sanity checking the user's input is actually a URL

  var result = {href: "", text: ""}
  try {
    if(url && url.trim()) { // check for empty or non-existing string
      let temp = new URL(url)
      result.href = temp.href
      result.text = temp.href
    }
  } catch(err) {
    // If URL cannot parse the string, that must mean the user input 
    // is not in a URL format.  Let's be on the safeside and not display 
    // the user's input (XSS) and display a reason why the URL is not shown
    result.text = msgs.get('description.title.urlError')
  }
  return result
}

/**
 * Determine if an action is enabled for a resource
 * @param {*} resourceLabels - a resource's labels
 * @param {*} resourceAnnotations - a resource's annotations
 * @param {*} action - an action's data
 * 
 * Rule:  if action specifies enablement-label or enablement-annotation AND resource specifies matching
 *        label or annotation, then action is enabled else action is enabled 
 */
function isActionEnabled(resourceLabels, resourceAnnotations, action) {
  let enablementLabel = action[CONFIG_CONSTANTS.ENABLEMENT_LABEL]
  let enablementAnnotation = action[CONFIG_CONSTANTS.ENABLEMENT_ANNOTATION]
  
  if (!enablementLabel && !enablementAnnotation) {
    // If both enablement-label and enablement-annotation are missing, assume the action is enabled for the resource
    return true;
  }

  let isEnabled = resourceLabels[enablementLabel];
  if (isEnabled) {
    // The action's enablement-label has value X and 
    // the resource has a label of X.  This means the
    // action is enabled for this particular resource
    return true;
  }
 
  isEnabled = resourceAnnotations[enablementAnnotation];
  if (isEnabled) {
    // The action's enablement-annotation has value X and 
    // the resource has a annotation of X.  This means the
    // action is enabled for this particular resource
    return true;
  }

  return false;
}

/**
 * Return a list containing only enabled actions for a resource
 * @param {*} resourceLabels - an object of a resource's labels
 * @param {*} actions - list of actions for the resource
 */
function removeDisabledActions(resourceLabels, resourceAnnotations, actions) {
  // Loop from end to beginning to ensure each element is processed
  // even if elements are being removed in the loop
  for(let index = actions.length - 1; index >= 0; index--) {
    // Remove any disabled command actions
    const one_action = actions[index]
    const isDisabled = ! isActionEnabled(resourceLabels, resourceAnnotations, one_action)
    if(isDisabled) {
      actions.splice(index, 1)
    }
  }
  return actions
}

export const getOverflowMenu = (componentData, actionMap, staticResourceData, applicationName, applicationNamespace) => {
  const cloneData = lodash.cloneDeep(componentData)
  var itemId = cloneData.metadata.uid
  const resourceLabels = cloneData.metadata.labels
  const resourceAnnotations = cloneData.metadata.annotations

  //remove fields that should not show up on an editor
  delete cloneData.metadata.creationTimestamp
  delete cloneData.metadata.selfLink
  delete cloneData.metadata.uid

  // ***************
  // Static Actions

  var hasStaticActions = staticResourceData && staticResourceData.actions && staticResourceData.actions.length>0
  let staticActions = []
  if(hasStaticActions) {
    staticActions = 
      staticResourceData.actions.map((action, staticindex) => (
        <OverflowMenuItem key={itemId + action}
          primaryFocus={staticindex === 0}
          itemText={msgs.get('table.actions.'+action)}
          onClick={openModal.bind(this, action, cloneData)}
          onFocus={(e) => {e.target.title = msgs.get('table.actions.'+action)}}
          onMouseEnter={(e) => {e.target.title = msgs.get('table.actions.'+action)}} />
      ))
  }

  // ***************
  // Custom Actions

  var kind = componentData && componentData.kind
  var namespace = componentData && componentData.metadata && componentData.metadata.namespace
  var name = componentData && componentData.metadata && componentData.metadata.name
  var componentBodyToRemove =[{
    "app":name,
    "namespace": namespace,
    "kind":kind
  }]
  

  var hasCustomActions = staticResourceData && staticResourceData.customActions && staticResourceData.customActions.length>0
  let customActions = []
  if(hasCustomActions) {
    customActions = 
      staticResourceData.customActions.map((customAction, staticindex) => {
        if(customAction.show(applicationNamespace) === true){
          return <OverflowMenuItem key={itemId + customAction.label}
          primaryFocus={staticindex === 0}
          itemText={msgs.get('table.customActions.'+customAction.label)}
          onClick={customAction.action.bind(this, applicationName, applicationNamespace, componentBodyToRemove)}
          onFocus={(e) => {e.target.title = msgs.get('table.customActions.'+customAction.label)}}
          onMouseEnter={(e) => {e.target.title = msgs.get('table.customActions.'+customAction.label)}} />
        }
      })
  }

  // ***************
  // URL Actions

  var urlActions = actionMap && actionMap[CONFIG_CONSTANTS.URL_ACTIONS]
  urlActions = urlActions && urlActions.filter((action) => {
    return !action[CONFIG_CONSTANTS.MENU_ITEM] || action[CONFIG_CONSTANTS.MENU_ITEM]!='false'
  })
  var hasUrlActions = urlActions && urlActions.length && urlActions.length>0
  if(hasUrlActions) {
    urlActions = removeDisabledActions(resourceLabels, resourceAnnotations, urlActions)

    urlActions.forEach((action) => { //try to cache the links ahead of time
      var kind = componentData && componentData.kind
      var namespace = componentData && componentData.metadata && componentData.metadata.namespace
      var name = componentData && componentData.metadata && componentData.metadata.name
      performUrlAction(action['url-pattern'], action['open-window'], kind, name, namespace, undefined, false)
    })

    urlActions = urlActions.map((action, urlindex) => {
      let actionLabel = action['text.nls'] ? msgs.get(action['text.nls']) : action.text
      let actionDesc = action['description.nls'] ? msgs.get(action['description.nls']) : action.description
      return <OverflowMenuItem key={action.name}
        primaryFocus={urlindex === 0 && !hasStaticActions}
        itemText={actionLabel}
        onClick={performUrlAction.bind(this, action['url-pattern'], action['open-window'], componentData && componentData.kind, componentData && componentData.metadata && componentData.metadata.name, componentData && componentData.metadata && componentData.metadata.namespace, undefined, true)}
        onFocus={(e) => {
          if(actionDesc){ e.target.title = actionDesc }
        }}
        onMouseEnter={(e) => {
          if(actionDesc){ e.target.title = actionDesc }
        }} />
    })
  }

  // ***************
  // Command Actions

  var cmdActions = actionMap && actionMap[CONFIG_CONSTANTS.CMD_ACTIONS]
  var cmdInputs = actionMap && actionMap[CONFIG_CONSTANTS.INPUTS]
  var hasCmdActions = cmdActions && cmdActions.length && cmdActions.length>0
  if(hasCmdActions) {
    cmdActions = removeDisabledActions(resourceLabels, resourceAnnotations, cmdActions)

    cmdActions = cmdActions.map((action, cmdindex) => {
      let actionLabel = action['text.nls'] ? msgs.get(action['text.nls']) : action.text
      let actionDesc = action['description.nls'] ? msgs.get(action['description.nls']) : action.description
      return <OverflowMenuItem key={action.name}
        primaryFocus={cmdindex === 0 && !hasUrlActions && !hasStaticActions}
        itemText={actionLabel}
        onClick={openModal.bind(this, "action", cloneData, applicationName, applicationNamespace, action, cmdInputs)}
        onFocus={(e) => {
          if(actionDesc){ e.target.title = actionDesc }
        }}
        onMouseEnter={(e) => {
          if(actionDesc){ e.target.title = actionDesc }
        }} 
      />
    })
  }

  // The arrays need to be .concat() in a specific order: static, url, cmd
  let allEnabledActions = staticActions.concat(customActions).concat(urlActions).concat(cmdActions)
  // Use filter to remove undefined/null lists that were added by .concat()
  allEnabledActions = allEnabledActions.filter(n => n)
  if(allEnabledActions.length > 0) {
    var menu =
      <OverflowMenu floatingMenu flipped iconDescription={msgs.get('svg.description.overflowMenu')}>
        {allEnabledActions}
      </OverflowMenu>
    return menu
  }
}

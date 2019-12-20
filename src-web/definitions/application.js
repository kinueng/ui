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
import msgs from '../../nls/kappnav.properties'
import { getLabelsToString, getAge } from '../actions/common'
import { updateSecondaryHeader, getOverflowMenu, performUrlAction, buildStatusHtml, getStatus} from '../actions/common'
import { CONTEXT_PATH, SUBKIND, PLATFORM_KIND, PLATFORM_NAME } from '../actions/constants'
import {SEARCH_HEADER_TYPES} from '../components/kappnav/common/ResourceTable.js'
import {getLink, getExtendedResourceTypes} from '../components/extensions/ApplicationExtension'

export default {
  resourceType: 'application',
  detailKeys: {
    title: 'application.details',
    expanded: false,
    headerRows: ['type', 'detail'],
    rows: [
      {
        cells: [
          {
            resourceKey: 'description.title.name',
            type: 'i18n',
            resourceLocation: 'metadata.name'
          },
          {
            resourceKey: 'metadata.name'
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.namespace',
            type: 'i18n',
            resourceLocation: 'metadata.namespace'
          },
          {
            resourceKey: 'metadata.namespace'
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.creation',
            type: 'i18n',
            resourceLocation: 'metadata.creationTimestamp'
          },
          {
            transformFunction: getAge
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.labels',
            type: 'i18n',
            resourceLocation: 'metadata.labels'
          },
          {
            transformFunction: getLabels
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.clustername',
            type: 'i18n',
            resourceLocation: 'metadata.clusterName'
          },
          {
            resourceKey: 'metadata.clusterName'
          }
        ]
      }
    ]
  },
  additionalDetailKeys: {
    title: 'application.additional.details',
    expanded: true,
    headerRows: ['type', 'detail'],
    rows: [
      {
        cells: [
          {
            resourceKey: 'description.title.description',
            type: 'i18n',
            resourceLocation: 'spec.descriptor.description'
          },
          {
            resourceKey: 'spec.descriptor.description'
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.matchLabels',
            type: 'i18n',
            resourceLocation: 'spec.selector.matchLabels'
          },
          {
            transformFunction: getMatchLabels
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.matchExpressions',
            type: 'i18n',
            resourceLocation: 'spec.selector.matchExpressions'
          },
          {
            type: 'expression',
            getData: getMatchExpressions
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.componentKinds',
            type: 'i18n',
            resourceLocation: 'spec.componentKinds'
          },
          {
            transformFunction: getComponentKinds
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.keywords',
            type: 'i18n',
            resourceLocation: 'spec.descriptor.keywords'
          },
          {
            transformFunction: getKeyWords
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.links',
            type: 'i18n',
            resourceLocation: 'spec.descriptor.links'
          },
          {
            type: 'links',
            getData: getLinks
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.icons',
            type: 'i18n',
            resourceLocation: 'spec.descriptor.icons'
          },
          {
            type: 'links',
            getData: getIcons
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.maintainers',
            type: 'i18n',
            resourceLocation: 'spec.descriptor.maintainers'
          },
          {
            transformFunction: getMaintainersEmailList
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.owners',
            type: 'i18n',
            resourceLocation: 'spec.descriptor.owners'
          },
          {
            transformFunction: getOwnersEmailList
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.type',
            type: 'i18n',
            resourceLocation: 'spec.descriptor.type'
          },
          {
            resourceKey: 'spec.descriptor.type'
          }
        ]
      },
      {
        cells: [
          {
            resourceKey: 'description.title.version',
            type: 'i18n',
            resourceLocation: 'spec.descriptor.version'
          },
          {
            resourceKey: 'spec.descriptor.version'
          }
        ]
      }
    ]
  },
  moduleKeys: {
    title: 'page.componentView.title',
    headers: [
      {key: 'status', header: msgs.get('table.header.status'), type: SEARCH_HEADER_TYPES.STATUS},
      {key: 'name', header: msgs.get('table.header.name'), type: SEARCH_HEADER_TYPES.URL},
      {key: 'compositeKind', header: msgs.get('table.header.kind'), type: SEARCH_HEADER_TYPES.STRING},
      {key: 'namespace', header: msgs.get('table.header.namespace'), type: SEARCH_HEADER_TYPES.STRING},
      {key: 'platform', header: msgs.get('table.header.platform'), type: SEARCH_HEADER_TYPES.STRING},
      {key: 'menuAction', header: msgs.get('table.header.action'), type: SEARCH_HEADER_TYPES.NOT_SEARCHABLE},
      {key: 'title', header: 'Title', type: SEARCH_HEADER_TYPES.NOT_SEARCHABLE},
      {key: 'description', header: 'Description', type: SEARCH_HEADER_TYPES.NOT_SEARCHABLE},
      {key: 'section_data', header: 'section_data', type: SEARCH_HEADER_TYPES.NOT_SEARCHABLE},
      {key: 'section_map', header: 'section_map', type: SEARCH_HEADER_TYPES.NOT_SEARCHABLE}
    ]
  },
  link: getLink,
  actions: [
    'edit',
    'remove'
  ]
}

export function getLabels(item) {
  return getLabelsToString(item.metadata && item.metadata.labels)
}

export function getLinks(item) {
  return item.spec && item.spec.descriptor && item.spec.descriptor.links
}

export function getIcons(item) {
  var icons = item.spec && item.spec.descriptor && item.spec.descriptor.icons
  var iconArray = []
  if(icons) {
    for(var icon in icons){
      iconArray.push({'url':icons[icon].src, 'description':icons[icon].src})
    }
  }
  return iconArray
}

export function getKeyWords(item) {
  var keywords = item.spec && item.spec.descriptor && item.spec.descriptor.keywords

  if(keywords) {
    let str = ''
    for(var word in keywords){
      str = str + keywords[word] + ', '
    }
    return str.substring(0, str.length - 2)
  } else {
    return '-'
  }
}

export function getComponentKinds(item) {
  const kinds = item.spec && item.spec.componentKinds

  if(kinds && kinds.length && kinds.length>0) {
    let str = ''
    for (var i=0; i<kinds.length; i++) {
      var kind = kinds[i]
      str = str + kind['group'] + '/' + kind['kind'] + ', '
    }
    return str.substring(0, str.length - 2)
  } else {
    return '-'
  }
}

export function getMaintainersEmailList(item) {
  return getUserToEmailList(item.spec && item.spec.descriptor && item.spec.descriptor.maintainers)
}

export function getOwnersEmailList(item) {
  return getUserToEmailList(item.spec && item.spec.descriptor && item.spec.descriptor.owners)
}

export function getUserToEmailList(users) {
  if(users && users.length && users.length>0) {
    let str = ''
    for (var i=0; i<users.length; i++) {
      var user = users[i]
      str = str + user['name'] + '/' + user['email'] + ', '
    }
    return str.substring(0, str.length - 2)
  } else {
    return '-'
  }
}

export function getMatchLabels(item) {
  return getLabelsToString(item.spec && item.spec.selector && item.spec.selector.matchLabels)
}

export function getMatchExpressions(item) {
  const expressions = item.spec && item.spec.selector && item.spec.selector.matchExpressions

  return expressions && expressions.map(expression => {
    return {
      name: expression['key'],
      operator: expression['operator'],
      value: expression['values']+'', //force string representation which separates items with a comma
      title: msgs.get('description.title.matchExpressions')
    }
  })
}

export function refreshApplication(appname, namespace, appNavConfigData, applicationResourceData) {
  return fetch('/kappnav/application/' + encodeURIComponent(appname)+'?namespace='+encodeURIComponent(namespace))
    .then(response => {
      if (!response.ok) {
        // TODO: How do return a failure in a promise?
        return null;
      } else {
        return response.json();
      }
    }).then(result => {
      var metadata = result.metadata;
      updateSecondaryHeader(getStatus(metadata, appNavConfigData).statusColor, getStatus(metadata, appNavConfigData).statusText, getOverflowMenu(result, undefined, applicationResourceData, undefined, undefined));
      return result
    });
}

export function refreshApplicationComponents(appname, namespace, appNavConfigData, applicationResourceData) {
  return fetch('/kappnav/components/' + encodeURIComponent(appname)+'?namespace='+encodeURIComponent(namespace))
  .then(response => {
    if (!response.ok) {
      return null;
    } else {
      return response.json();
    }
  }).then(result => {

    if (result) {
      var rowArray = [];
      result.components.forEach((item, index) => {
        var component = item.component;

        var metadata = component.metadata;
        var annotations = metadata.annotations
          ? metadata.annotations
          : {};
        var kind = component.kind;
        var compositeKind = kind
          ? kind
          : '';
        compositeKind = annotations && annotations[SUBKIND]
          ? compositeKind + '.' + annotations[SUBKIND]
          : compositeKind;
        var platform = annotations[PLATFORM_KIND]
          ? annotations[PLATFORM_KIND]
          : 'Kube';
        platform = platform && annotations[PLATFORM_NAME]
          ? platform + '.' + annotations[PLATFORM_NAME]
          : platform;

        var itemObj = {};
        var itemId = component.metadata.name + "_" + index;
        itemObj.id = itemId;
        itemObj.status = buildStatusHtml(getStatus(metadata, appNavConfigData));

        var resourceType = kind.toLocaleLowerCase();

        itemObj.compositeKind = compositeKind;
        itemObj.kind = kind;
        itemObj.namespace = component.metadata.namespace;
        itemObj.platform = platform;
        if(item.hasOwnProperty("section-map")){
          itemObj.section_map = item["section-map"];
          if(itemObj.section_map.hasOwnProperty('sections')){
            if (item["section-map"].sections.length !== 0) {
              itemObj.title = item["section-map"].sections[0].title;
              itemObj.description = item["section-map"].sections[0].description;
            }
            if (item["section-map"]["section-data"].length !== 0) {
              itemObj.section_data = item["section-map"]["section-data"][0].data;
            }
          }
        }

        var actionMap = item["action-map"]
        const applicationNamespace = decodeURIComponent(new URL(window.location.href).searchParams.get("namespace"))
        if(getExtendedResourceTypes().length > 0 && getExtendedResourceTypes().includes(resourceType)){
          itemObj.name = <a href="#" onClick={() => resourceType == "application" ? displayApp(metadata.name, metadata.namespace) : displayDetail(appname, resourceType, metadata.name, metadata.namespace, applicationNamespace)}>
            {metadata.name}
          </a>;
          itemObj.menuAction = getOverflowMenu(component, actionMap, applicationResourceData, appname, namespace);
        } else {
          var urlActions = actionMap && actionMap["url-actions"];
          var urlActions = urlActions && urlActions.filter(function (action) {
            return action["name"]=="detail";
          });

          itemObj.menuAction = getOverflowMenu(component, actionMap, undefined, appname, namespace);  //custom actions

          var link = urlActions && urlActions[0] && urlActions[0]["url-pattern"];
          if(link) {
            //Expand the link and modify the URL on the fly to match the expanded link
            var linkId = kind+"_"+metadata.name+"link";
            itemObj.name=<a id={linkId} href="#" onClick={performUrlAction.bind(this, link, urlActions[0]["open-window"], kind, metadata.name, metadata.namespace, undefined, true)}>
              {metadata.name}
            </a>;
            performUrlAction(link, urlActions[0]["open-window"], kind, metadata.name, metadata.namespace, linkId, false);  //update the link in place
          } else {
              itemObj.name = metadata.name;
          }
        }
        rowArray.push(itemObj);
      });
      return rowArray
    }
  });
} // end of refreshApplicationComponents(...)

// display nested application
function displayApp(appname, namespace) {
  let url= location.protocol+'//'+location.host+ CONTEXT_PATH + '/applications/'+encodeURIComponent(appname)+'?namespace='+namespace
  window.location.href = url;
}

// display details
function displayDetail(appname, resourceType, name, namespace, applicationNamespace) {
  //applications and components can be under different namespaces
  let url= location.protocol+'//'+location.host+ CONTEXT_PATH + '/applications/'+encodeURIComponent(appname)+'/'+resourceType+'/'+encodeURIComponent(name)+'?namespace='+encodeURIComponent(namespace)+'&parentnamespace='+encodeURIComponent(applicationNamespace)
  window.location.href = url;
}

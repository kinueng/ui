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

import { RESOURCE_TYPES } from '../actions/constants'

import application, { refreshApplication, refreshApplicationComponents } from './application'
import job from './job'

const resourceData = {
  [RESOURCE_TYPES.APPLICATION.name]: application,
  [RESOURCE_TYPES.JOB.name]: job
}

export function getResourceData(resourceType) {
  var def = resourceData[resourceType.name]
  if (!def) {
    //eslint-disable-next-line no-console
    console.error(`No resource data found for '${resourceType.name}'`)
  }
  return def
}

export function refreshResourceComponent(name, namespace, resourceType, appNavConfigData) {

  if(resourceType === RESOURCE_TYPES.APPLICATION) {
    return refreshApplicationComponents(name, namespace, appNavConfigData, resourceData[RESOURCE_TYPES.APPLICATION.name])
  }
}

export function refreshResource(name, namespace, resourceType, appNavConfigData) {
  if(resourceType === RESOURCE_TYPES.APPLICATION) {
    return refreshApplication(name, namespace, appNavConfigData, resourceData[RESOURCE_TYPES.APPLICATION.name])
  }
}

export default getResourceData
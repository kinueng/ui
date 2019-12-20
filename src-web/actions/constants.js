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

/*
 * action types
 *
 * action name: <NOUN>_<VERB>
 */

import { EXTENDED_RESOURCE_TYPES, EXTENDED_CONFIG_CONSTANTS } from '../components/extensions/ConstantsExtension';

export const CONTEXT_PATH = '/kappnav-ui'

export const SUBKIND = 'kappnav.subkind'
export const PLATFORM_KIND = 'kappnav.platform.kind'
export const PLATFORM_NAME = 'kappnav.platform.name'
export const STATUS = 'kappnav.status'

export const PAGE_SIZES = {
  DEFAULT: 20,
  VALUES: [5, 10, 20, 50, 75, 100]
}

export const SORT_DIRECTION_ASCENDING = 'asc'
export const SORT_DIRECTION_DESCENDING = 'desc'

export const REQUEST_STATUS = {
  INCEPTION: 'INCEPTION',
  DONE: 'DONE',
  IN_PROGRESS: 'IN_PROGRESS',
  ERROR: 'ERROR'
}

export const STATUS_COLORS = {
  BORDER_COLOR: '#464646',
  DEFAULT_COLOR: 'GREY'
}

//Constants below are different between icp4a and kabanero
// loading extended RESOURCE_TYPES and CONFIG_CONSTANTS
export const RESOURCE_TYPES = EXTENDED_RESOURCE_TYPES;
export const CONFIG_CONSTANTS = EXTENDED_CONFIG_CONSTANTS;

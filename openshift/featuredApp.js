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
(function() {
    window.OPENSHIFT_CONSTANTS.SAAS_OFFERINGS = [{
        title: "kAppNav",                           // The text label
        icon: "icon-kappnav-feature",               // The icon you want to appear
        url: "${url}",      //  Where to go when this item is clicked
        description: "Kubernetes Application Navigator"      // Short description
    }]
}())
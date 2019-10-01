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
import msgs from '../../../../nls/kappnav.properties'
import NavModal, { withForm } from './NavModal'
import { General, Labels, Namespace, MatchLabels, MatchExpressions, ComponentKinds } from '../common/ModalFormItems'
import PropTypes from 'prop-types'

const MENU_ITEMS = [
  'general',
  'labels',
  'selectors',
  'componentKinds'
]

const initialState = {
  form: {
    name: '',
    namespace: 'default',
    kind: 'Application',
    apiVersion: 'app.k8s.io/v1beta1',
    labels: [{ name: '', value: '' }],
    matchLabels: [{ name: '', value: '' }],
    matchExpressions: [{key: '', operator: '', values: ''}],
    componentKinds: [{group:'', kind:''}]
  }
}

const applicationMapping = {
  kind: 'kind',
  apiVersion: 'apiVersion',
  name: 'metadata.name',
  namespace: 'metadata.namespace',
  labels: 'metadata.labels',
  matchLabels: 'spec.selector.matchLabels',
  matchExpressions: 'spec.selector.matchExpressions',
  componentKinds: 'spec.componentKinds'
}

const formMapping = Object.assign(applicationMapping)

const Selector = ({form, onChange}) =>
  <div>
    <MatchLabels
      type='matchLabels'
      items={form.matchLabels}
      onChange={onChange}
      addLabel={msgs.get('formaction.addMatchLabel')} />
    <MatchExpressions
      type='matchExpressions'
      items={form.matchExpressions}
      onChange={onChange}
      addLabel={msgs.get('formaction.addMatchExpression')} />
  </div>

Selector.propTypes = {
  form: PropTypes.object,
  onChange: PropTypes.func
}

const KindSection = ({form, onChange}) =>
  <div>
    <ComponentKinds
      type='componentKinds'
      items={form.componentKinds}
      onChange={onChange}
      addLabel={msgs.get('formaction.addKind')} />
  </div>

KindSection.propTypes = {
  form: PropTypes.object,
  onChange: PropTypes.func
}

const ApplicationModal = ({ createAction, namespaces, form, onChange, onJsonChange, json, onToggle }) =>
  <NavModal
    form={form}
    buttonName={msgs.get('button.application.create')}
    modalHeading={msgs.get('button.application.create')}
    modalLabel={msgs.get('application')}
    closeButtonLabel={msgs.get('modal.button.close.createApplication')}
    menuItems={MENU_ITEMS}
    onChange={onChange}
    json={json}
    onJsonChange={onJsonChange}
    onToggle={onToggle}
    initialForm={initialState}
    createAction={createAction}
    formMapping={formMapping}>
    <General form={form}>
      <Namespace form={form} onChange={onChange} namespaces={namespaces} />
    </General>
    <Labels
      type='labels'
      items={form.labels}
      addLabel={msgs.get('formaction.addLabel')} />
    <Selector form={form} />
    <KindSection form={form} />
  </NavModal>

ApplicationModal.propTypes = {
  createAction: PropTypes.func,
  form: PropTypes.object,
  json: PropTypes.string,
  namespaces: PropTypes.array,
  onChange: PropTypes.func,
  onJsonChange: PropTypes.func,
  onToggle: PropTypes.func
}

export default withForm(ApplicationModal, initialState)

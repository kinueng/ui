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

import 'carbon-components/scss/globals/scss/styles.scss';
import React from 'react';
import { PaginationV2, DataTable, Icon, MultiSelect } from 'carbon-components-react';
import { PAGE_SIZES } from '../../../actions/constants';
import msgs from '../../../../nls/kappnav.properties';

require('../../../../scss/table.scss')

const translateWithId = (locale, id) => msgs.get(id)

class ResourceTable extends React.Component {

	render() {
		const {
			title,
			headers,
			rows,
			sortColumn,
			sortDirection,
			totalNumberOfRows,
			changeTablePage,
			onInputChange,
			handleSort,
			pageSize,
			pageNumber,
			filterItems,
			namespace,
			namespaces, //this is a list of namespaces that we use to populate the create new modals
			existingSecrets,
			createNewModal
		} = this.props

    return (
			<div>
				<DataTable
				  rows={rows}
				  headers={headers}
				  translateWithId={translateWithId.bind(null, document.documentElement.lang)}
				  render={({ rows, headers, getHeaderProps }) => (
						<div>
					<DataTable.TableContainer title={title}>
					  <DataTable.TableToolbar>
						  <DataTable.TableToolbarSearch onChange={onInputChange} closeButtonLabelText={msgs.get('modal.button.close')} translateWithId={translateWithId.bind(null, document.documentElement.lang)}/>
							{(() => {
			          if(filterItems !== undefined) {
			            return (
										<MultiSelect
											label={filterItems.filterLabel}
											items={filterItems.itemArray}
											itemToString={item=>(item ? item.text : '')}
											onChange={filterItems.filter}
										/>
									)
								}
 		          })()}
						  {(() => {
			          if(createNewModal !== undefined) {
						return (createNewModal(namespace==''?'default':namespace, namespaces, existingSecrets))
			          }
		          })()}
					  </DataTable.TableToolbar>

					  <DataTable.Table>
						<DataTable.TableHead>
						  <DataTable.TableRow>
						    {(() => {
							  return headers.map(header => {
									if(header.key === 'action') {
									  return (
									    <DataTable.TableHeader key={header.key}>
										    <span className='bx--table-header-label'>{header.header}</span>
									  	</DataTable.TableHeader>
									  )
									} else {
								      return (
	                        <th scope={'col'} key={header.key}>
	                          <button
															title={msgs.get(`svg.description.${!sortColumn || sortDirection === 'desc' ? 'asc' : 'desc'}`)}
	                            onClick={handleSort}
	                            className={`bx--table-sort-v2${sortDirection === 'asc' ? ' bx--table-sort-v2--ascending' : ''}${sortColumn === header.key ? ' bx--table-sort-v2--active' : ''}`}
	                            data-key={header.key}
	                          >
	                            <span className='bx--table-header-label'>{header.header}</span>
	                            <Icon
	                              className='bx--table-sort-v2__icon'
	                              name='caret--down'
	                              description={msgs.get(`svg.description.${!sortColumn || sortDirection === 'desc' ? 'asc' : 'desc'}`)} />
	                          </button>
	                        </th>
	                      )
									}
							  })
							})()}
						  </DataTable.TableRow>
						</DataTable.TableHead>
						<DataTable.TableBody>
						  {rows.map(row => (
							<DataTable.TableRow key={row.id}>
							   {(() => {
							     return row.cells.map(cell => (
										<DataTable.TableCell key={cell.id}>{cell.value}</DataTable.TableCell>
								 ))
							   })()}
							</DataTable.TableRow>
						  ))}
						</DataTable.TableBody>
					  </DataTable.Table>
					</DataTable.TableContainer>
					<PaginationV2
						key='pagination'
						id='resource-table-pagination'
						onChange={changeTablePage}
						pageSize={pageSize || PAGE_SIZES.DEFAULT}
						page={pageNumber}
						pageSizes={PAGE_SIZES.VALUES}
						totalItems={totalNumberOfRows}
						isLastPage={false}
						itemsPerPageText={msgs.get('pagination.itemsPerPage')}
						pageRangeText={(current, total) => msgs.get('pagination.pageRange', [current, total])}
						itemRangeText={(min, max, total) => `${msgs.get('pagination.itemRange', [min, max])} ${msgs.get('pagination.itemRangeDescription', [total])}`}
					/>
			</div>
				  )}
				/>
			</div>
    );
  }
} // end of AppResourceTable component



export default ResourceTable;

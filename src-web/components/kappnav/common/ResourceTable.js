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
import { PaginationV2, DataTable, Icon, MultiSelect, Tooltip } from 'carbon-components-react';
import { PAGE_SIZES } from '../../../actions/constants';
import msgs from '../../../../nls/kappnav.properties';

require('../../../../scss/table.scss')

const {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableBody,
	TableCell,
	TableHeader,
	TableExpandHeader,
	TableExpandRow,
	TableExpandedRow,
	TableToolbar
} = DataTable;

const translateWithId = (locale, id) => msgs.get(id)

class ResourceTable extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
		};
		this.toggleExpandCollapse = this.toggleExpandCollapse.bind(this)
		this.hiddingOrVisibleElement = this.hiddingOrVisibleElement.bind(this)
		this.renderingLablesOrAnnotations = this.renderingLablesOrAnnotations.bind(this)
	}

	toggleExpandCollapse(row) {
		var element = document.querySelector("[aria-label=" + CSS.escape(row) + "]");
		if(typeof (element) !== 'undefined' && element.childNodes.length !== 0){
			var child = element.childNodes[0];
			if(child.childNodes.length !==0){
				if (child.childNodes[0].textContent === msgs.get('collapse')) {
					child.childNodes[0].textContent = msgs.get('expand')
				} else {
					child.childNodes[0].textContent = msgs.get('collapse')
				}
			}
		}
	}

	// This function is to hide/expose the expandable icon from the DataTable Carbon Components
	hiddingOrVisibleElement(element, hideorVisible){
		if(typeof(element) !== 'undefined' && element !== null){
			element.style.visibility = hideorVisible;
		}
	}

	/* This function is hidding the expandable icon from the DataTable Carbon Components only for
	   those resources which doesn't have the "section-map" attribute or if the "section-map" 
	   attribute is empty*/
	componentDidMount() {
		if (this.props.rows.length !== 0) {
			for (var i = 0; i < this.props.rows.length; i++) {
				var row = this.props.rows[i]
				if(row.hasOwnProperty('section_map')){
					if (!row["section_map"].hasOwnProperty('sections') || row["section_map"]["section-data"].length === 0 || row["section_map"]["sections"].length === 0) {
						var element = document.querySelector("[aria-label=" + CSS.escape(row.id) + "]");
						this.hiddingOrVisibleElement(element, 'hidden')
					}
				} else{
					var element = document.querySelector("[aria-label=" + CSS.escape(row.id) + "]");
					this.hiddingOrVisibleElement(element, 'hidden')
				}
			}
		}
	}

	/* This function is hidding the expandable icon from the DataTable Carbon Components only for
	   those resources which doesn't have the "section-map" attribute or if the "section-map" 
	   attribute is empty by first making expandable icon visible on every rows of the DataTable*/
	componentDidUpdate() {
		if (this.props.rows.length !== 0) {
			for (var i = 0; i < this.props.rows.length; i++) {
				var row = this.props.rows[i]
				var element = document.querySelector("[aria-label=" + CSS.escape(row.id) + "]");
				this.hiddingOrVisibleElement(element, 'visible')
			}
		}

		if (this.props.rows.length !== 0) {
			for (var i = 0; i < this.props.rows.length; i++) {
				var row = this.props.rows[i]
				if(row.hasOwnProperty('section_map')){
					if (!row["section_map"].hasOwnProperty('sections') || row["section_map"]["section-data"].length === 0 || row["section_map"]["sections"].length === 0) {
						var element = document.querySelector("[aria-label=" + CSS.escape(row.id) + "]");
						this.hiddingOrVisibleElement(element, 'hidden')
					}
				} else{
					var element = document.querySelector("[aria-label=" + CSS.escape(row.id) + "]");
					this.hiddingOrVisibleElement(element, 'hidden')
				}
			}
		}
	}

	renderingLablesOrAnnotations(array, labelOrAnnotation) {
		var translatedMessage;
		if (labelOrAnnotation === 'labels') {
			translatedMessage = msgs.get('description.title.labels')
		} else {
			translatedMessage = msgs.get('description.title.annotations')
		}

		return (
			<div >
				<div>
					<div className="annotationsOrLabels">
						{translatedMessage}
					</div>
				</div>
				<div className="marginBetweenAnnotationsOrLabelsAndSectionData">
					{array.map(arrayKeyValue =>
						<div>
							{(() => {
								if (labelOrAnnotation === 'labels') {
									if (!arrayKeyValue || !arrayKeyValue.label || arrayKeyValue.label.length === 0) {
										return (
											<div className="sectionDataKey">
												&nbsp;
											</div>
										)
									} else {
										return (
											<div className="sectionDataKey">
												{arrayKeyValue.label} &nbsp;&nbsp;
											</div>
										)
									}
								} else {
									if (!arrayKeyValue || !arrayKeyValue.annotation || arrayKeyValue.annotation.length === 0) {
										return (
											<div className="sectionDataKey">
												&nbsp;
											</div>
										)
									} else {
										return (
											<div className="sectionDataKey">
												{arrayKeyValue.annotation} &nbsp;&nbsp;
											</div>
										)
									}
								}
							})()}
							<div className="sectionDataKeyValueGap">
								:&nbsp;&nbsp;
							</div>
							<div className="sectionDataKeyValue">
								{(() => {
									if (arrayKeyValue && arrayKeyValue.value && (arrayKeyValue.value.startsWith('https') || arrayKeyValue.value.startsWith('http'))) {
										return (
											<a href={arrayKeyValue.value}>{arrayKeyValue.value}</a>
										)
									} else {
										{
											if (!arrayKeyValue || !arrayKeyValue.value || arrayKeyValue.value.length === 0) {
												return (
													<div>
														&nbsp;
													</div>
												)
											} else {
												return (
													<div>
														{arrayKeyValue.value}
													</div>
												)
											}
										}
									}
								})()}
							</div>
						</div>
					)}
				</div>
			</div>
		)
	}

	renderingSectionData(sectionDataCell) {
		let lablesArray = []
		let annotationsArray = []

		sectionDataCell.value.map(sectionDataKeyValue => {
			if (sectionDataKeyValue.hasOwnProperty('label')) {
				lablesArray.push(sectionDataKeyValue);
			} else if(sectionDataKeyValue.hasOwnProperty('annotation')) {
				annotationsArray.push(sectionDataKeyValue)
			}
		})

		if (lablesArray.length !== 0 && annotationsArray.length === 0) {
			return (
				<div className="widthOfSectionDataKeyAndValue">
					{this.renderingLablesOrAnnotations(lablesArray, 'labels')}
				</div>
			)
		}

		if (annotationsArray.length !== 0 && lablesArray.length === 0) {
			return (
				<div className="widthOfSectionDataKeyAndValue">
					{this.renderingLablesOrAnnotations(annotationsArray, 'annotations')}
				</div>
			)
		}

		if (lablesArray.length !== 0 && annotationsArray.length !== 0) {
			return (
				<div className="widthOfSectionDataKeyAndValue">
					{this.renderingLablesOrAnnotations(lablesArray, 'labels')}
					<div className="gapBetweenLabelandAnnotation">
						{this.renderingLablesOrAnnotations(annotationsArray, 'annotations')}
					</div>
				</div>
			)
		}
	}

	renderCellExpanded(row, cell) {
		let titleCell = row.cells.find(c => c.id === row.id + ':title');
		let descriptionCell = row.cells.find(c => c.id === row.id + ':description');
		let sectionDataCell;
		let sectionmapCell;

		row.cells.forEach((cell) => {
			if (cell.id === row.id + ':section_data') {
				sectionDataCell = cell
			}
			else if (cell.id === row.id + ':section_map') {
				sectionmapCell = cell.value
			}
		});

		let c;
		if (typeof(sectionmapCell) !== 'undefined' && typeof(titleCell) !== 'undefined'&& typeof(descriptionCell) !== 'undefined' && typeof(sectionDataCell) !== 'undefined' && Object.keys(sectionmapCell).length !== 0 &&  typeof(titleCell.value) !== 'undefined' && typeof(descriptionCell.value) !== 'undefined' &&  typeof(sectionDataCell.value) !== 'undefined') {
			c =
				<div className ="scrollingSection">
					<div className="bx--row">
						<div className="bx--col-xs-8 bx--col-md-8 bx--col-lg-8">
							<div className="title">{titleCell.value}
								<Tooltip
									iconDescription={msgs.get('formtip.tooltip')}
									triggerText=''
									direction='bottom'
									showIcon={true}>
									<p dangerouslySetInnerHTML={{ __html: descriptionCell.value }} />
								</Tooltip>
							</div>
						</div>
					</div>
					<div className="bx--row">
						<div className="bx--col-xs-8 bx--col-md-8 bx--col-lg-8 marginBetweenTitleAndSectionData" >
							{
								this.renderingSectionData(sectionDataCell)
							}
						</div>
					</div>
				</div>
		}
		return c;
	}

	renderCell(row, cell) {
		let c;
		if (cell.id.includes('title') || cell.id.includes('description') || cell.id.includes('section_data') || cell.id.includes('enablement_label') || cell.id.includes('section_map')) {
			return c;
		} else {
			c = <TableCell key={cell.id}>{cell.value} </TableCell>;
		}
		return c;
	}

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

		let c;
		return (
			<div>
				<DataTable
					rows={rows}
					headers={headers}
					translateWithId={translateWithId.bind(null, document.documentElement.lang)}
					render={({ rows, headers, getHeaderProps, getRowProps }) => (
						<div>
							<TableContainer title={title}>
								<TableToolbar>
									<DataTable.TableToolbarSearch onChange={onInputChange} closeButtonLabelText={msgs.get('modal.button.close')} translateWithId={translateWithId.bind(null, document.documentElement.lang)} />
									{(() => {
										if (filterItems !== undefined) {
											return (
												<MultiSelect
													label={filterItems.filterLabel}
													items={filterItems.itemArray}
													itemToString={item => (item ? item.text : '')}
													onChange={filterItems.filter}
												/>
											)
										}
									})()}
									{(() => {
										if (createNewModal !== undefined) {
											return (createNewModal(namespace == '' ? 'default' : namespace, namespaces, existingSecrets))
										}
									})()}
								</TableToolbar>
								<Table>
									<TableHead>
										<TableRow>
											<TableExpandHeader />
											{(() => {
												return headers.map(header => {
													if (header.key === 'menuAction') {
														return (
															<DataTable.TableHeader key={header.key}>
																<span className='bx--table-header-label'>{header.header}</span>
															</DataTable.TableHeader>
														)
													} else if (header.key === 'title' || header.key === 'description' || header.key === 'section_data' || header.key === 'enablement_label' || header.key === 'section_map') {
														return c;
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

										</TableRow>
									</TableHead>
									<TableBody>
										{rows.map(row => (
											<React.Fragment key={row.id}>
												<TableExpandRow {...getRowProps({ row })} ariaLabel={row.id} expandIconDescription={msgs.get('expand')} onClick={() => { this.toggleExpandCollapse(row.id) }}>
													{row.cells.map(cell => (
														this.renderCell(row, cell)
													))}
												</TableExpandRow>
												{row.isExpanded && (
													<TableExpandedRow>
														<TableCell className="expandedRow" colSpan={headers.length + 1}>
															<div> {
																this.renderCellExpanded(row)
															}</div>
														</TableCell>

													</TableExpandedRow>
												)}
											</React.Fragment>
										))}
									</TableBody>
								</Table>
							</TableContainer>
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

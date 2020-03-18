/*****************************************************************
 *
 * Copyright 2020 IBM Corporation
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
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { PaginationV2, DataTable, Icon, MultiSelect, Tooltip, Button, InlineNotification } from 'carbon-components-react';
import { PAGE_SIZES } from '../../../actions/constants';
import msgs from '../../../../nls/kappnav.properties';
import {updateResourceTableError}  from '../../../reducers/ResourceTableReducer'

require('../../../../scss/table.scss')

const {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableBody,
	TableCell,
	TableExpandHeader,
	TableExpandRow,
	TableExpandedRow,
	TableSelectAll,
	TableSelectRow,
	TableToolbar
} = DataTable;

const translateWithId = (locale, id) => msgs.get(id)

var displayedHeaders; //used to calculate how many columns the message for an empty table(w/ non-selectable rows) should span

export const SEARCH_HEADER_TYPES= {
	NOT_SEARCHABLE : 'NOT_SEARCHABLE',
	STATUS : 'STATUS',
	URL: 'URL',
	STRING :'STRING'
}

// returing the field if its of "string" type
export const ifTheFieldIsNotLink = (row, field) => {
	if (row && field && typeof field === 'string') {
		return field
	}
}

// function to get all the cell values of the DataTable
export const getSearchableCellList = (row, headers) => {
	var cellValues = []
	headers.forEach(header => {
		if (header.type === SEARCH_HEADER_TYPES.NOT_SEARCHABLE) {
			//not doing anything as the field is NOT_SEARCHABLE
		} else if (header.type === SEARCH_HEADER_TYPES.STATUS) {
			// for the field  of type "STATUS"
			if (row && row[header.key] && row[header.key].props) {
				// Since "status" can't be a string or a Link, hence finding its value under the "props" key
				cellValues.push(row[header.key].props.children[1].props.children)
			}
		} else {
			// for feilds other than "NOT_SEARCHABLE" and  "STATUS"
			if (row && row[header.key] && row[header.key].props) {
				// Account for the possiblity of the field being a link
				cellValues.push(row[header.key].props.children)
			} else if (row && row[header.key]) {
				// Account for the possiblity of the field not being a link
				cellValues.push(ifTheFieldIsNotLink(row, row[header.key]))
			}
		}
	});
	return cellValues
}

class ResourceTable extends Component {

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

	/* This function is to add the onlcick to the 'Add [resource_name]' link in the message row of an empty resource table.
	When the resource table is empty, a row with text should have a link to the 'Add [resoure_name]' navmodal.
	Clicking this link should trigger a click on the 'Add [resource_name]' button above the table */
	connectAddLinkOnClick() {
		var addResourceButton = document.getElementById('page-action');
		var navModalLink = document.getElementById('navModalLink');
		if (navModalLink && addResourceButton) {
			navModalLink.onclick = function() {addResourceButton.click()};
			navModalLink.onkeyup = function(event) {
				if (event.keyCode === 13) { //enter key
					addResourceButton.click()}
			}
		}
	}

	/* This function is hidding the expandable icon from the DataTable Carbon Components only for
	   those resources which doesn't have the "section-map" attribute or if the "section-map"
	   attribute is empty*/
	componentDidMount() {
		this.connectAddLinkOnClick()

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
		this.connectAddLinkOnClick()

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
			c = <TableCell key={cell.id}>{cell.value}</TableCell>;
		}
		return c;
	}

	//Renders action buttons that will go under a table with selectable rows
	//button object contains key:value pairs specifying button properties(ex: kind, text, etc)
	renderButton(button, selectedRows) {
		let b;
		if (button.href) {
			b = <Button small kind={button.kind} id={button.buttonText} href={button.href} aria-label={button.buttonText}>{button.buttonText}</Button>
		}
		if (button.action) { //onClick method call passes selectedRows to perform 'action' on/with those values
			b = <Button small kind={button.kind} id={button.buttonText} aria-label={button.buttonText} onClick={() => {button.action(selectedRows)}}>{button.buttonText}</Button>
		}
		return b;
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
			createNewModal,
			viewType,
			modalType,
			selectableRows, //when set to 'true' the table rows are selectable
			tableButtons //array of "button" objects containing key:value pairs of button properties
		} = this.props

		let c;
		return (
			<div>
				<DataTable
					rows={rows}
					headers={headers}
					translateWithId={translateWithId.bind(null, document.documentElement.lang)}
					render={({ rows, headers, getRowProps, getSelectionProps, selectedRows }) => (
						<div>
							<TableContainer title={title}>
								<TableToolbar className={(createNewModal !== undefined) ? 'toolbarItems justifyToolbarContent' : 'toolbarItems'}>
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
										if (this.props.resourceTableReducer.resourceTableError && this.props.resourceTableReducer.resourceTableError !== '') {
											return <InlineNotification
												className='tableInlineNotification'
												hideCloseButton={false}
												iconDescription={msgs.get('modal.button.close')}
												kind="error"
												notificationType="inline"
												onCloseButtonClick={() => this.props.updateResourceTableError('')}
												role="alert"
												subtitle=""
												title={this.props.resourceTableReducer.resourceTableError}
											/>
										}
									})()}
									{(() => {
										if (createNewModal !== undefined) {
											return (createNewModal(namespace == '' ? 'default' : namespace, namespaces, existingSecrets))
										}
									})()}
								</TableToolbar>
								{(() => {
									if (selectableRows) { //table rows will have a checkbox to allow multi-selection
										return (
											<Table zebra={false}>
												<TableHead>
													<TableRow>
														{(rows.length > 0) && <TableSelectAll {...getSelectionProps()}/>}
														{headers.map(header => (
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
														))}
													</TableRow>
												</TableHead>
												<TableBody>
												{(() => {
													if (rows.length === 0) {
														return (this.props.getCustomTableMsg(headers))
													} else {
														return (
															rows.map(row => (
															<TableRow key={row.id}>
															{row.disabled ? <TableSelectRow {...getSelectionProps({ row })} ariaLabel={msgs.get('table.checkbox.label', [row.cells[0].value, row.cells[3].value])} checked={row.disabled} disabled={row.disabled}/> : <TableSelectRow {...getSelectionProps({ row })} ariaLabel={msgs.get('table.checkbox.label', [row.cells[0].value, row.cells[3].value])}/>}
																{row.cells.map(cell => (
																	this.renderCell(row, cell)
																))}
															</TableRow>
															))
														)
													}
												})()}
												</TableBody>
										</Table>
										)
									} else {
										return (
											<Table>
											<TableHead>
												<TableRow>
													<TableExpandHeader />
													{(() => {
														displayedHeaders = headers.length
														return headers.map(header => {
															if (header.key === 'menuAction') {
																return (
																	<DataTable.TableHeader key={header.key}>
																		<span className='bx--table-header-label'>{header.header}</span>
																	</DataTable.TableHeader>
																)
															} else if (header.key === 'title' || header.key === 'description' || header.key === 'section_data' || header.key === 'enablement_label' || header.key === 'section_map') {
																displayedHeaders-- //subtract 1 for each time a header has these keys since these will not be displayed
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
											{(() => {
												//When the resource table is empty, add a new row with a message that encourages users to add a new resource
												//modalType is undefined when in the Command Actions view
												//viewType is the message key for the view: applications, WAS ND cells, Liberty collectives, command actions
												//modal is the message key for the title of the add modal that should pop up (ex: "Add Application")
													if (rows.length === 0 && viewType) {
														if(viewType === 'table.empty.command.actions') { //need a custom message for empty table in Command Actions view
															return (this.props.getCustomTableMsg(headers))
														} else {
															var modal = msgs.get(modalType);
															var resource = msgs.get(viewType);
															var msg = msgs.get('table.empty', [resource]);
															return (
																<TableRow><TableCell colSpan={displayedHeaders + 1}>{msg} <span className='emptyTableResourceLink' id='navModalLink' tabIndex='0' role='button' aria-label={msg+' '+modal}>{modal}</span>.</TableCell></TableRow>
															)
														}
													} else {
													return(
														rows.map(row => (
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
														))
													)
												}
											})()}
											</TableBody>
										</Table>
										)
									}

								})()}
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
							{(() => {
								if ((tableButtons !== undefined) && (selectableRows === true)) { //only display table buttons below a table with selectable rows
									return (
										<div className="buttonContainer">
											{tableButtons.map(button => (
												this.renderButton(button, selectedRows)
											))}
										</div>
									)
								}
							})()}
						</div>
					)}
				/>
			</div>
		);
	}
} // end of AppResourceTable component

export default connect(
    (state) => ({
		baseInfo: state.baseInfo,
		resourceTableReducer : state.resourceTableReducer
    }),
    {
		updateResourceTableError
    }
)(ResourceTable);

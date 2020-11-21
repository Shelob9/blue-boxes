import { useEffect, useState, useMemo } from 'react';
import { IBox, IGraph, makeGraph } from './Graph';
import userbase, { DatabaseOperation } from 'userbase-js';

export interface ISaveGraph {
	graphId: string;
	rows: string[];
}

export interface ISavedGraphList {
	databaseId: string;
	databaseName: string;
	graphId: string;
}
[];
/**
 * One hook that knows about all of the graphs
 */
export const useGraphsDb = () => {
	let [graphs, setGraphs] = useState<IGraph[]>([]);
	useEffect(() => {
		userbase
			.getDatabases()
			.then(({ databases }) => {
				let _graphs = [];
				databases.forEach((db) => {
					if (db.databaseName.startsWith('graph-graph')) {
						_graphs.push({
							databaseId: db.databaseId,
							databaseName: db.databaseName,
							graphId: db.databaseName.replace(
								'graph-graph',
								'graph'
							),
						});
					}
				});
				setGraphs(_graphs);
			})
			.catch((e) => console.error(e));
	}, []);
	return { graphs };
};

/**
 * @see https://stackoverflow.com/a/13255738/1469799
 * @param array
 * @param size
 */
var chunks = function (array, size) {
	var results = [];
	while (array.length) {
		results.push(array.splice(0, size));
	}
	return results;
};
/**
 * @see https://stackoverflow.com/a/39914235/1469799
 * @param ms
 */
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Hook for loading and saving one box
 *
 * @todo put in a provider -- only one database can be open at once anyway.
 */
const useGraphDb = (props: { graphId: string }) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [graph, setGraph] = useState<IGraph>();
	let [graphId, setGraphId] = useState<string>(props.graphId);

	//Name of database.
	//will change when graphId changes
	let databaseName = useMemo(() => `graph-${graphId}`, [graphId]);
	const insertBox = async (box: IBox) => {
		const { boxId } = box;
		return await userbase
			.insertItem({
				databaseName,
				item: box,
				itemId: boxId,
			})
			.then(() => {
				return { boxId };
			})
			.catch((e) => console.error(e));
	};
	const saveBox = async (box: IBox) => {
		const { boxId } = box;
		return await userbase
			.updateItem({
				databaseName,
				item: box,
				itemId: boxId,
			})
			.then(() => {
				return { boxId };
			})
			.catch((e) => console.error(e));
	};

	//Open graph database and load the saved graph
	useEffect(() => {
		setIsLoaded(false);
		async function openDatabase() {
			let isNew: undefined | true | false;
			try {
				await userbase.openDatabase({
					databaseName,
					changeHandler(items) {
						if (undefined === isNew) {
							//If no items, this is a new graph.
							if (!items || !items.length) {
								//Can't create right away.
								//Db may not be open yet.
								isNew = true;
							} else {
								//Got items!
								isNew = false;
								let savedGraph: IGraph = {
									graphId,
									rows: {},
								};
								//Each item has one box in it.
								items.forEach(({ item }) => {
									//Create row if not yet in graph.
									if (
										!savedGraph.rows.hasOwnProperty(
											item.rowId
										)
									) {
										savedGraph.rows[item.rowId] = {
											rowId: item.rowId,
											boxes: {},
										};
									}
									//put box in the right row
									savedGraph.rows[item.rowId].boxes[
										item.boxId
									] = item;
								});
								setGraph(savedGraph);
							}
						}
					},
				});

				//The awaited db opening!
				//@todo emit event
				if (isNew) {
					//Create graph
					let newGraph = makeGraph(graphId, 25, 25);
					Object.keys(newGraph.rows).forEach(async (rowId) => {
						let row = newGraph.rows[rowId];
						//Save each box in graph database
						//Create operations for bulk inserts

						let allOperations = Object.keys(
							newGraph.rows[rowId].boxes
						).map(
							(boxId): DatabaseOperation => {
								return {
									command: 'Insert',
									item: row.boxes[boxId],
									itemId: boxId,
								};
							}
						);
						//Break into chunks of ten records or less
						chunks(allOperations, 10).forEach(
							async (operations) => {
								try {
									//Bulk insert
									//https://userbase.com/docs/sdk/put-transaction/
									await userbase.putTransaction({
										databaseName,
										operations,
									});
									await sleep(100);
								} catch (error) {
									await sleep(200);
								}
							}
						);
					});

					setGraph(newGraph);
				}
			} catch (e) {
				console.error(e.message);
			}
		}
		openDatabase();
		setIsLoaded(true);
	}, [graphId]);

	return {
		graph,
		isLoaded,
		saveBox,
		graphId,
		setGraphId,
	};
};

export default useGraphDb;

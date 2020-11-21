import { useEffect, useState, useMemo } from 'react';
import { IBox, IGraph, makeGraph } from './Graph';
import userbase from 'userbase-js';

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
							//IF no items, this is a new graph.
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
					let promises = Object.keys(newGraph.rows).map(
						async (rowId) => {
							let row = newGraph.rows[rowId];
							//Save each box in graph database
							return Object.keys(newGraph.rows[rowId].boxes).map(
								async (boxId) => {
									return insertBox(row.boxes[boxId]);
								}
							);
						}
					);
					await Promise.all(promises);
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

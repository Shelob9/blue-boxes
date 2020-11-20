import { useEffect, useState } from 'react';
import userbase, { UserProfile } from 'userbase-js';
import Graph, { createId, IGraph, makeGraph } from '../components/Graph';
import { useRouter } from 'next/router';

export async function getServerSideProps({ query }) {
	//const graph = makeGraph();
	const graphId = query.graphId ? query.graphId : createId('graph');
	return {
		props: { graphId },
	};
}

export interface ISaveGraph {
	graphId: string;
	rows: string[];
}

const mapRows = (saveGraph: ISaveGraph): IGraph => {
	const { graphId } = saveGraph;
	let rows = {};
	saveGraph.rows.forEach((rowId) => {
		rows[rowId] = {
			rowId,
			boxes: {},
		};
	});
	return {
		graphId,
		rows,
	};
};
const useGraphDb = ({ graphId }) => {
	const [isLoaded, setIsLoaded] = useState(false);

	const [graph, setGraph] = useState<IGraph>();
	//Open graph database and load the saved graph
	useEffect(() => {
		async function openDatabase() {
			let isNew: undefined | true | false;

			let databaseName = `graph-${graphId}`;
			try {
				await userbase.openDatabase({
					databaseName,
					changeHandler(items) {
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
									!savedGraph.rows.hasOwnProperty(item.rowId)
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
					},
				});
				//The awaited db opening!
				//@todo emit event
				if (isNew) {
					//Create graph
					let newGraph = makeGraph(graphId);
					Object.keys(newGraph.rows).forEach((rowId) => {
						let row = newGraph.rows[rowId];
						//Save each box in graph database
						Object.keys(newGraph.rows[rowId].boxes).forEach(
							async (boxId) => {
								await userbase
									.insertItem({
										databaseName,
										item: row.boxes[boxId],
										itemId: boxId,
									})
									.then(() => {
										// item inserted
									})
									.catch((e) => console.error(e));
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
	}, []);

	return {
		graph,
		isLoaded
	};
};
const Graphs = (props: { graphId?: string; user?: UserProfile }) => {
	let { graph,isLoaded } = useGraphDb({ graphId: props.graphId });
	const router = useRouter();
	useEffect(() => {
		if (props.graphId) {
			router.push(`${router.pathname}?graphId=${props.graphId}`);
		}
	}, [router.pathname]);
	if (!graph||!isLoaded) {
		return <div>Loading Graph</div>;
	}
	
	return (
		<div>
			<h1>Graph {`${graph.graphId.replace('graph_', '')}`}</h1>
			<Graph graph={graph} />
		</div>
	);
};

export default Graphs;

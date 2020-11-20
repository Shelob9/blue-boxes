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
	const [loadingState, setLoadingState] = useState({
		graph: false,
		rows: false,
		boxes: false,
	});
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
						if (!items || !items.length) {
							isNew = true;
							console.log(0);
						} else {
							isNew = false;
							console.log(1);
							let savedGraph: IGraph = {
								graphId,
								rows: {},
							};
							items.forEach(({ item }) => {
								if (
									!savedGraph.rows.hasOwnProperty(item.rowId)
								) {
									savedGraph.rows[item.rowId] = {
										rowId: item.rowId,
										boxes: {},
									};
								}
								savedGraph.rows[item.rowId].boxes[
									item.boxId
								] = item;
							});
							setGraph(savedGraph);
						}
					},
				});
				if (isNew) {
					let newGraph = makeGraph(graphId);
					Object.keys(newGraph.rows).forEach((rowId) => {
						let row = newGraph.rows[rowId];

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
	}, []);

	return {
		graph,
	};
};
const Graphs = (props: { graphId?: string; user?: UserProfile }) => {
	let { graph } = useGraphDb({ graphId: props.graphId });
	const router = useRouter();
	useEffect(() => {
		if (props.graphId) {
			router.push(`${router.pathname}?graphId=${props.graphId}`);
		}
	}, [router.pathname]);
	if (!graph) {
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

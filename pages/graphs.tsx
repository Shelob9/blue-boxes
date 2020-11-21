import { useEffect, useMemo, useState } from 'react';
import userbase, { UserProfile } from 'userbase-js';
import Graph, { createId, IBox, IGraph, makeGraph } from '../components/Graph';
import { useRouter } from 'next/router';
import useGraphDb,{ useGraphsDb } from '../components/useGraphDb';
export async function getServerSideProps({ query }) {
	//const graph = makeGraph();
	const graphId = query.graphId ? query.graphId : createId('graph');
	return {
		props: { graphId },
	};
}


const Graphs = (props: { graphId?: string; user?: UserProfile }) => {
	const { graphs } = useGraphsDb();

	let { graph, isLoaded, saveBox,setGraphId,graphId } = useGraphDb({ graphId:props.graphId });
	const router = useRouter();
	useEffect(() => {
		if (graphId) {
			router.push(`${router.pathname}?graphId=${graphId}`);
		}
	}, [graphId]);

	
	const changeGraph = (graphId) => {	
		if (window) {
			//@ts-ignore
			window.location = `${router.pathname}?graphId=${graphId}`
		}
	}

	const newGraph = () => {
		if (window) {
			//@ts-ignore
			window.location = `${router.pathname}`

		}
	}

	if (!graph||!isLoaded) {
		return <div>Loading Graph</div>;
	}
	return (
		<div>
			<section>
				<h1 className={'inline mr-4 text-2xl'}>
					Graph: {`${graph.graphId.replace('graph_', '')}`}
				</h1>
				<div className={'inline'}>
				<select value={graphId} onChange={(e) => changeGraph(e.target.value)}>
					{graphs ? graphs.map(g => <option key={g.graphId} value={g.graphId}>
						{g.graphId}
					</option>): <option />}
					</select>
					</div>
				<button onClick={newGraph}  className={'inline border-2 border-black p-4'}>New Graph</button>
			</section>
			<Graph graph={graph} saveBox={saveBox} />
		</div>
	);
};

export default Graphs;

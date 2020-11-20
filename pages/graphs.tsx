import { useEffect, useState } from "react";
import userbase,{ UserProfile } from "userbase-js";
import Graph, { IGraph, makeGraph } from "../components/Graph";
import { useRouter } from 'next/router'

export async function getServerSideProps({query}) {
    //const graph = makeGraph();
    const { graphId } = query;
    return {
        props: { graphId },
    };
};

export interface ISaveGraph {
    graphId: string;
    rows: string[]
}

const mapRows = (saveGraph:ISaveGraph): IGraph => {
    const { graphId } = saveGraph;
    let rows = {};
    saveGraph.rows.forEach(rowId => {
        rows[rowId] = {
            rowId,
            boxes:{}
        }
    })
    return {
        graphId,
        rows
    }
}
const useGraphDb = ({ graphId }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadingState, setLoadingState] = useState({
        graph: false,
        rows: false,
        boxes: false,
    })
    const [graph, setGraph] = useState<IGraph>();

    //Open graph database and load the saved graph
    useEffect(() => {
        async function openDatabase() {
            try {
                await userbase.openDatabase({
                    databaseName: `graph-${graphId}`,
                    changeHandler: function (items) {
                        console.log(items);
                    }
                });
            
            } catch (e) {
                console.error(e.message)
            }
        }
        openDatabase();
    }, []);
    
    return {
        graph
    }
}
const Graphs = (props: { graphId?: string; user?: UserProfile }) => {
    let { graph } = useGraphDb({ graphId: props.graphId });
    const router = useRouter()
    useEffect(() => {
        if (graph && graph.graphId) {
           router.push(`${router.pathname}?graphId=${graph.graphId}`)
        }
    }, [router.pathname]);
    return <div>1</div>
    return (
        <div>
            <h1>
            Graph {`${graph.graphId.replace('graph_', '')}`}</h1>
            <Graph graph={graph} />
        </div>
    );
};

export default Graphs;

import { useEffect, useState } from "react";
import userbase,{ UserProfile } from "userbase-js";
import Graph, { IGraph, makeGraph } from "../components/Graph";
import { useRouter } from 'next/router'

export async function getServerSideProps() {
    const graph = makeGraph();
    return {
        props: { graph },
    };
};

const useGraphDb = ({ _graph }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [graph, setGraph] = useState<IGraph>(_graph);
    useEffect(() => {
        async function openDatabase() {
            try {
                await userbase.openDatabase({
                    databaseName: `graphs`,
                    changeHandler: function (items) {
                        console.log(items);
                    },
                });
                setIsLoaded(true);
            
            } catch (e) {
                console.error(e.message)
            }
        }
        openDatabase()
    }, []);
    useEffect(() => {
        if (isLoaded) {
            userbase.insertItem({
                databaseName: `graphs`,
                item: { graphId: graph.graphId },
                itemId: graph.graphId
            }).then((r) => {
                 
            }).catch((e) => console.log(e));
        }
    }, [isLoaded]);
    return {
        graph
    }
}
const Graphs = (props: { graph: IGraph; user?: UserProfile }) => {
    let { graph } = useGraphDb({ _graph: props.graph });
    const router = useRouter()
    
    useEffect(() => {
        if (graph.graphId) {
           router.push(`${router.pathname}?graphId=${graph.graphId}`)
        }
    },[router.pathname]);
    return (
        <div>
            <h1>
            Graph {`${graph.graphId.replace('graph_', '')}`}</h1>
            <Graph graph={graph} />
        </div>
    );
};

export default Graphs;

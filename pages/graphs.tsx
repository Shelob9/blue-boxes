import { useEffect, useState } from "react";
import userbase,{ UserProfile } from "userbase-js";
import Graph, { IGraph, makeGraph } from "../components/Graph";

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
}
const Graphs = (props: { graph: IGraph; user?: UserProfile }) => {
    useGraphDb({ _graph: props.graph });
    return (
        <div>
            <h1>New Graph</h1>
            <Graph graph={props.graph} />
        </div>
    );
};

export default Graphs;

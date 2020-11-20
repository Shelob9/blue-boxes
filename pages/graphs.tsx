import { UserProfile } from "userbase-js";
import Graph, { IGraph, makeGraph } from "../components/Graph";

export async function getServerSideProps() {
    const graph = makeGraph();
    return {
        props: { graph },
    };
};

const Graphs = (props: { graph: IGraph; user?: UserProfile }) => {
    return (
        <div>
            <Graph graph={props.graph} />
        </div>
    );
};

export default Graphs;

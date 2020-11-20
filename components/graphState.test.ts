import { makeGraph } from "./Graph";
import graphReducer from "./graphReducer";
test("opens and closes box", () => {
	let graph = makeGraph();
	let rowId = Object.keys(graph.rows)[0];
	let row1 = graph.rows[rowId];
	let boxId = Object.keys(row1.boxes)[0];
	let r1box1 = row1.boxes[boxId];
	expect(r1box1.open).toBe(false);
	graph = graphReducer(graph, { type: "openBox", rowId, boxId });
	r1box1 = graph.rows[rowId].boxes[boxId];
	expect(r1box1.open).toBe(true);
	graph = graphReducer(graph, { type: "closeBox", rowId, boxId });
	r1box1 = graph.rows[rowId].boxes[boxId];
	expect(r1box1.open).toBe(false);
});

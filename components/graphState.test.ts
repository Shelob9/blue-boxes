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

test("sets row", () => {
	let graph = makeGraph();
	let rowId = Object.keys(graph.rows)[2];
	let boxId = "b1";
	graph = graphReducer(graph, {
		type: "setRow",
		rowId,
		boxes: {
			[boxId]: { rowId, boxId, open: true },
		},
	});
	expect(graph.rows[rowId].boxes[boxId].open).toBe(true);
	expect(Object.keys(graph.rows[rowId].boxes).length).toBe(1);
});

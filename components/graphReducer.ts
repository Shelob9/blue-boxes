import { IGraph, IBox, IBoxes } from "./Graph";
export type IGraphActions =
	| { type: "openBox"; boxId: string; rowId: string }
	| { type: "closeBox"; boxId: string; rowId: string }
	| { type: "editBox"; box: IBox }
	| { type: "setRow"; rowId: string; boxes: IBoxes };
const graphReducer = (graph: IGraph, action: IGraphActions): IGraph => {
	switch (action.type) {
		case "openBox":
			return {
				...graph,
				rows: {
					...graph.rows,
					[action.rowId]: {
						...graph.rows[action.rowId],
						boxes: {
							...graph.rows[action.rowId].boxes,
							[action.boxId]: {
								...graph.rows[action.rowId].boxes[action.boxId],
								open: true,
							},
						},
					},
				},
			};
		case "closeBox":
			return {
				...graph,
				rows: {
					...graph.rows,
					[action.rowId]: {
						...graph.rows[action.rowId],
						boxes: {
							...graph.rows[action.rowId].boxes,
							[action.boxId]: {
								...graph.rows[action.rowId].boxes[action.boxId],
								open: false,
							},
						},
					},
				},
			};
		case "editBox":
			return {
				...graph,
				rows: {
					...graph.rows,
					[action.box.rowId]: {
						...graph.rows[action.box.rowId],
						boxes: {
							...graph.rows[action.box.rowId].boxes,
							[action.box.boxId]: action.box,
						},
					},
				},
			};
		case "setRow":
			return {
				...graph,
				rows: {
					...graph.rows,
					[action.rowId]: {
						rowId: action.rowId,
						boxes: action.boxes,
					},
				},
			};
		default:
			return graph;
	}
};
export default graphReducer;

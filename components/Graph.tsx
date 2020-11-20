import { FC, useEffect, useReducer, useRef, useState } from 'react';
import graphReducer from './graphReducer';

export const createId = (prefix: string): string => {
	return `${prefix}_${Math.random().toString(36).substring(7)}`;
};

export interface IBox {
	boxId: string;
	rowId: string;
	content?: string;
	link?: string;
	open: boolean;
}

export interface IBoxes {
	[key: string]: IBox;
}
export interface IRow {
	boxes: IBoxes;
	rowId: string;
}

export interface IRows {
	[key: string]: IRow;
}
export interface IGraph {
	graphId: string;
	rows: IRows;
}

const BoxEdit: FC<{ box: IBox }> = ({ box }) => {
	return (
		<td
			className={`graph graph-box ${!box.open ? 'bg-white' : 'bg-black'}`}
		/>
	);
};

const Row: FC<{
	row: IRow;
	onBoxClick: (boxId: string, rowId: string) => void;
}> = ({ row, onBoxClick }) => {
	return (
		<tr className={'graph graph-row'}>
			{Object.values(row.boxes).map((box) => (
				<td
					key={box.boxId}
					onClick={() => onBoxClick(box.boxId, box.rowId)}
					className={`graph graph-box ${
						box.open || box.content ? 'bg-black' : 'bg-white'
					}`}
				/>
			))}
		</tr>
	);
};

const Graph: FC<{
	graph: IGraph;
}> = (props) => {
	const [graph, dispatch] = useReducer(graphReducer, props.graph);
	const getBox = (boxId: string, rowId: string) => {
		return graph.rows[rowId].boxes[boxId];
	};

	const linkRef = useRef<HTMLInputElement>();
	const contentRef = useRef<HTMLTextAreaElement>();

	const [openBox, setOpenBox] = useState<IBox | undefined>(undefined);

	const onBoxClick = (boxId: string, rowId: string) => {
		const box = getBox(boxId, rowId);
		if (undefined !== openBox) {
			dispatch({
				type: 'editBox',
				box:{
					...openBox,
					open: false,
					content: contentRef.current.value,
					link:linkRef.current.value
				}
			});
			setOpenBox(undefined)
		}
		if (!box.open) {
			setOpenBox({
				...box,
				open: true,
			});
			dispatch({
				type: 'openBox',
				boxId,
				rowId,
			});
			
		} else {
			setOpenBox(undefined)
			dispatch({
				type: 'closeBox',
				boxId,
				rowId,
			});
			contentRef.current.value = '';
			linkRef.current.value = '';
		}
	};

	//when open box change set or empty inputs in editor
	useEffect(() => {
		if (contentRef.current && linkRef.current) {
			contentRef.current.value = openBox ? openBox.content : '';
			linkRef.current.value = openBox ? openBox.link : '';
		}
		
	},[openBox])
	

	return (
		<div className="flex mb-4">
			<table className={'graph md:md:3/4'}>
				<tbody>
					{Object.values(graph.rows).map((row) => (
						<Row
							key={row.rowId}
							row={row}
							onBoxClick={onBoxClick}
						/>
					))}
				</tbody>
			</table>
			<div className={'md:1/4 ml-4'}>
				{openBox && (
					<form>
						{openBox.boxId}
						<div className="w-full px-3 mb-6 md:mb-0">
							<label
								className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
								htmlFor="content"
							>
								Content
							</label>
							<textarea
								className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
								id="content"
								ref={ref => contentRef.current = ref}
							/>
						</div>

						<div className="w-full px-3 mb-6 md:mb-0">
							<label
								className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
								htmlFor="link"
							>
								Link
							</label>
							<input
								type={'url'}
								className="appearance-none block w-full bg-gray-400 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
								id="url"
								ref={ref => linkRef.current = ref}
							/>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export const makeGraph = (graphId?: string, width?: number, height?:number) => {
	const rows: IRows = {};
	width = width ?? 10;
	height = height ?? 5;
	// create two hundred rows
	for (let ri = 0; ri <= width; ri++) {
		const rowId = `r${ri}`;
		const boxes: IBoxes = {};
		// add two hundred boxes
		for (let bi = 0; bi <= height; bi++) {
			const boxId = `b${bi}_r${ri}`;
			boxes[boxId] = {
				boxId,
				rowId,
				open: false,
				content: '',
				link: '',
			};
		}
		rows[rowId] = {
			rowId,
			boxes,
		};
	}

	const graph: IGraph = {
		graphId: graphId ? graphId : createId('graph'),
		rows,
	};
	return graph;
};

export default Graph;

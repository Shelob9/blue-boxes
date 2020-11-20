import Link from 'next/link'
function Index({ user }) {
	if (user) {
		return (
			<div className="w-4/5 md:w-1/2 mx-auto">
				<h3 className="font-bold text-4xl">
					Welcome,{' '}
					<span className="bg-yellow-400">{user.username}</span>!
				</h3>
				<Link href={'/graphs'}>
					<a className={'bg-blue-500 text-2xl text-white pl-4 pr-4 pb-2 m-8'}>Graphs</a>
				</Link>
				<Link href={'/settings'}>
					<a className={'bg-yellow-400 text-2xl text-black pl-4 pr-4 pb-2 m-8'}>Settings</a>
				</Link>
			</div>
		);
	} else {
		return null;
	}
}

export default Index;

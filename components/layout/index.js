import Nav from '../nav';
function Layout({ user, setUser, children }) {
	console.log(user);
	return (
		<div className="container mx-auto">
			<Nav user={user} setUser={setUser} />
			{user ?  (
				<>
					{children}
					<footer className={'mt-8'}>
						<p>
							Something <a href="https://joshpress.net">Josh</a> might be
							making. Got the idea from{' '}
							<a href="https://twitter.com/visakanv/status/1329093575649370113">
								this Visa tweet.
							</a>
						</p>
						<p>
							<a href="https://github.com/Shelob9/blue-boxes/">Source</a>
						</p>
					</footer>
				</>
			):<div>Not Logged In</div>}
			
		</div>
	);
}

export default Layout;

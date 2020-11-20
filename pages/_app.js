import { useState, useEffect } from 'react';
import userbase from 'userbase-js';
import Layout from '../components/layout';

import '../styles/index.css';

function MyApp({ Component, pageProps }) {
	const [user, setUser] = useState();
	const [loaded, setLoaded] = useState(false);
	useEffect(() => {
		userbase
			.init({
				appId: process.env.NEXT_PUBLIC_USERBASE_APP_ID,
				sessionLength: 3600,
			})
			.then((session) => {
				if (session.user) {
					setUser(session.user);
				}
				setLoaded(true);
			});
	}, []);

	return (
		<Layout user={user} setUser={setUser}>
			{loaded ? (
				<Component user={user} {...pageProps} />
			) : (
				<div>I am a loading spinner.</div>
			)}
		</Layout>
	);
}

export default MyApp;

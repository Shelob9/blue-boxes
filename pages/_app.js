import { useState, useEffect } from 'react'
import userbase from 'userbase-js'
import Layout from '../components/layout'

import '../styles/index.css'

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState()

  useEffect(() => {

    userbase.init({ appId: process.env.NEXT_PUBLIC_USERBASE_APP_ID })
      .then((session) => {
        console.log(session.user);
      });
 
  }, [])

  return (
    <Layout user={user} setUser={setUser}>
      <Component user={user} {...pageProps} />
    </Layout>
  )
}

export default MyApp

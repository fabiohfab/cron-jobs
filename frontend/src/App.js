import React, { useEffect, useState } from 'react';
import Home from './pages/Home'
import Cron from './pages/Cron'
import Sidebar from './components/Sidebar'
import { Layout } from 'antd';
import { getCrons } from './services/helpers'
import cronstrue from 'cronstrue';
import { useSelector } from 'react-redux'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


const { Header } = Layout;


function App() {
  const crons = useSelector(
		state =>  state.crons
	)
  const [data, setData] = useState([])

  useEffect(() => {
    let temp_data = []
    if(crons) {
      Object.keys(crons).map((cron, index) => {
        return temp_data.push({
          key: index,
          uri: crons[cron]['uri'],
          method: crons[cron]['httpMethod'],
          timezone: crons[cron]['timeZone'],
          message: crons[cron]['body'],
          id: cron,
          last_execution: crons[cron]['lastExecution'],
          schedule: cronstrue.toString(crons[cron]['schedule']),
          running: [crons[cron]['running']]
        })
      })
    }
    setData(temp_data)
  }, [crons])


  return (
    <Router>
      <Layout style={{minHeight: '100vh'}}>
        <Sidebar crons={crons} />
        <Layout>
          <Header className="site-layout-sub-header-background" style={{ padding: 0 }} />
          
            <div>
              <Switch>
                <Route path="/cron/:id">
                  <Cron />
                </Route>
                <Route path="/">
                  <Home data={data} getCrons={getCrons} />
                </Route>
              </Switch>
            </div>
          
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;

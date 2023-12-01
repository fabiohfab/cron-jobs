import React, { useEffect, useState } from 'react';
import Home from './pages/Home'
import Cron from './pages/Cron'
import Sidebar from './components/Sidebar'
import { Layout } from 'antd';
import { getCrons } from './services/helpers'
import cronstrue from 'cronstrue';
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { Typography } from 'antd';
import moment from 'moment';

const { Title } = Typography;
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
          id: crons[cron]['id'],
          last_execution: moment(crons[cron]['last_execution']).format('D/MM/YYYY H:m'),
          executions: crons[cron]['executions'],
          errors: crons[cron]['errors'],
          schedule: cronstrue.toString(crons[cron]['schedule']),
          running: crons[cron]['running']
        })
      })
    }
    setData(temp_data)
  }, [crons])


  return (
    <Router>
      <Layout style={{minHeight: '100vh'}}>
        {/* <Sidebar crons={crons} /> */}
        <Layout>
          <Header className="site-layout-sub-header-background" style={{ padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link to={{pathname: '/'}}>
              <Title level={3} style={{color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0}}>
                Cron Jobs
              </Title>
            </Link>
          </Header>
       
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

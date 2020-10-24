import React from 'react';
import { Layout, Menu } from 'antd';
import { ClusterOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'
import { Typography } from 'antd';

const { Sider } = Layout;
const { Title } = Typography;

function Sidebar(props) {

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      onBreakpoint={broken => {
        console.log(broken);
      }}
      onCollapse={(collapsed, type) => {
        console.log(collapsed, type);
      }}
    >
      <Link to={{pathname: '/'}}>
        <Title level={3} style={{color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 50}}>
          Cron Jobs
        </Title>
      </Link>
      <Menu theme="dark" mode="inline" selectable={false}>
        {props.crons && Object.keys(props.crons).map((cron, index) => {
          return (
            <Menu.Item key={index} icon={<ClusterOutlined />}>
              <Link to={{pathname: '/cron/'+cron}}>
                {cron}
              </Link>
            </Menu.Item>
          )
        })}
      </Menu>
    </Sider>
  )
}

export default Sidebar
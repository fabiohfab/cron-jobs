import React from 'react'
import store from '../store'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { Tag } from 'antd'

function getCrons() {
  api.get("/cron").then(response => {
    store.dispatch({ type: 'SET_CRONS', crons: response.data})
  }).catch(error => {
    return false
  })
}

const columns = [
  {
    title: '#',
    dataIndex: 'id',
    key: 'id',
    render: text => (
      <Link to={{pathname: '/cron/'+text}}>
        {text}
      </Link>
    ),
  },
  {
    title: 'URI',
    dataIndex: 'uri',
    key: 'uri',
    render: text => <div>{text}</div>,
  },
  {
    title: 'Method',
    dataIndex: 'method',
    key: 'method',
    render: text => <div>{text}</div>,
  },
  {
    title: 'Message',
    dataIndex: 'message',
    key: 'message',
    render: text => <div>{text}</div>,
  },
  {
    title: 'Timezone',
    dataIndex: 'timezone',
    key: 'timezone',
    render: text => <div>{text}</div>,
  },
  {
    title: 'Last execution',
    dataIndex: 'last_execution',
    key: 'last_execution',
    render: text => <div>{text}</div>,
  },
  {
    title: 'Executions',
    dataIndex: 'executions',
    key: 'executions',
    render: text => <div>{text}</div>,
  },
  {
    title: 'Errors',
    dataIndex: 'errors',
    key: 'errors',
    render: text => <div>{text}</div>,
  },
  {
    title: 'Schedule',
    dataIndex: 'schedule',
    key: 'schedule',
    render: text => <div>{text}</div>,
  },
  {
    title: 'Running',
    key: 'running',
    dataIndex: 'running',
    render: running => {
      let color = 'red';
      if (running) {
        color = 'green';
      }
      return (
        <Tag color={color}>
          {running ? 'Running' : 'Paused'}
        </Tag>
      )
    },
  },
]

export { getCrons, columns }
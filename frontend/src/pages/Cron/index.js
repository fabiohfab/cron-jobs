import React, { useEffect, useState } from 'react';
import { Layout, Form, Input, Button, Select, Space, Table, Alert } from 'antd';
import api from '../../services/api'
import { useParams  , useHistory } from 'react-router-dom'
import cronstrue from 'cronstrue';
import { getCrons, columns } from '../../services/helpers'
import { ImportOutlined, PauseOutlined, CaretRightOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';

const { Content } = Layout;

function Cron() {
  const [cron, setCron] = useState([])
  const [fields, setFields] = useState([])
  const [data, setData] = useState([])
  const [error, setError] = useState(null)

  let { id } = useParams();
  let history = useHistory();
  
  function getCron() {
    api.get("/cron/"+id).then(response => {
      setError(null)
      setFields([
        {
          "name": [
            "uri"
          ],
          "value": response.data[0][id].uri
        },
        {
          "name": [
            "httpMethod"
          ],
          "value": response.data[0][id].httpMethod
        },
        {
          "name": [
            "body"
          ],
          "value": response.data[0][id].body
        },
        {
          "name": [
            "schedule"
          ],
          "value": response.data[0][id].schedule
        },
        {
          "name": [
            "timeZone"
          ],
          "value": response.data[0][id].timeZone
        }
      ])
      setCron(response.data[0])
    }).catch(error => {
      setError(error.response.data.error)
    })
  }

  useEffect(() => {
    getCron()
  }, [])

  useEffect(() => {
    let temp_data = []
    if(cron) {
      Object.keys(cron).map((c, i) => {
        temp_data.push({
          key: 0,
          uri: cron[c]['uri'],
          method: cron[c]['httpMethod'],
          message: cron[c]['body'],
          timezone: cron[c]['timeZone'],
          id: c,
          last_execution: cron[c]['lastExecution'],
          schedule: cronstrue.toString(cron[c]['schedule']),
          running: [cron[c]['running']]
        })
      })
      
      setData(temp_data)
    }
  }, [cron])

  const onFinish = values => {
    api.put("/cron/"+id, values).then(response => {
      setError(null)
      getCron()
      getCrons()
    }).catch(error => {
      setError(error.response.data.error)
    })
  };

  const onDownload = () => {
    api({
      url:"/file/"+id,
      method: 'GET',
      responseType: 'blob'
    }).then(response => {
      setError(null)
      console.log(response)
      let blob = new Blob([response.data], {type: 'text/plain'})
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'logs.txt'
      link.click()
    }).catch(error => {
      setError(error.response.data.error)
    })
  }

  const onDelete = () => {
    api.delete("/cron/"+id).then(response => {
      setError(null)
      history.push('/')
    }).catch(error => {
      setError(error.response.data.error)
    })
  }

  const onChangeStatus = () => {
    api.post("/cron/"+id).then(response => {
      setError(null)
      getCron()
      getCrons()
    }).catch(error => {
      setError(error.response.data.error)
    })
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  

  return (
    <Content style={{ margin: '24px 16px 0' }}>
      <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
        <Table columns={columns} dataSource={data} style={{marginBottom: 20}}/>
        {error && <Alert message={error} type="error" showIcon style={{marginBottom: 20}} />}
        <Form
          {...layout}
          name="basic"
          initialValues={{ remember: true }}
          fields={fields}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="URI"
            name="uri"
            rules={[{ required: true, message: 'Please input the uri!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Method"
            name="httpMethod"
            rules={[{ required: true, message: 'Please select one method!' }]}
          >
            <Select>
              <Select.Option value="get">GET</Select.Option>
              <Select.Option value="post">POST</Select.Option>
              <Select.Option value="put">PUT</Select.Option>
              <Select.Option value="delete">DELETE</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Message"
            name="body"
            rules={[{ required: true, message: 'Please input the message!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Timezone"
            name="timeZone"
            rules={[{ required: true, message: 'Please input the timezone!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Schecule expression"
            name="schedule"
            rules={[{ required: true, message: 'Please input the schedule!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Space>
              <Button type="primary" htmlType="submit">
              <ImportOutlined /> Update cron
              </Button>
              {cron && cron[id] && <Button type="primary" onClick={onChangeStatus}>{cron[id]?.running ? (<><PauseOutlined /> Pause</>) : <><CaretRightOutlined /> Resume</>}</Button>}
              <Button type="primary" onClick={onDownload}><DownloadOutlined /> Download logs file</Button>
              <Button type="primary" danger onClick={onDelete}><DeleteOutlined /> Delete cron</Button>
            </Space>
          </Form.Item>
        </Form>          
      </div>
    </Content>
  )
}

export default Cron
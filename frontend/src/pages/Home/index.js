import React, { useEffect, useState } from 'react';
import { Layout, Form, Input, Button, Select, Alert } from 'antd';
import { Table } from 'antd';
import api from '../../services/api'
import { getCrons, columns } from '../../services/helpers'
import { PlusOutlined } from '@ant-design/icons';

const { Content } = Layout;

function Home(props) {

  const [error, setError] = useState(null)

  useEffect(() => {
    getCrons()
  }, [])

  const onFinish = values => {
    api.post("/cron", values).then(response => {
      setError(null)
      getCrons();
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
        <Table columns={columns} dataSource={props.data} style={{marginBottom: 20}}/>
        {error && <Alert message={error} type="error" showIcon style={{marginBottom: 20}} />}
        <Form
          {...layout}
          name="basic"
          initialValues={{ remember: true }}
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
            <Button type="primary" htmlType="submit">
              <PlusOutlined /> Create new cron
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Content>
  )
}

export default Home
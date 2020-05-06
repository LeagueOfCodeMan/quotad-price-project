import React from 'react';
import {Form, Input, Modal} from 'antd';
import FormItem from "antd/es/form/FormItem";
import {formatMessage} from 'umi-plugin-react/locale';
import {SizeType} from "antd/es/config-provider/SizeContext";

export interface UpdatePasswordValues {
  password: string;
  password1: string;
  password2: string;
}

interface UpdatePasswordPasswordFormProps {
  visible: boolean;
  onCreate: (values: UpdatePasswordValues) => void;
  onCancel: () => void;
}


const UpdatePassword: React.FC<UpdatePasswordPasswordFormProps> =
  ({visible, onCreate, onCancel,}) => {
    const [form] = Form.useForm();

    const checkPassword = (rule: any, value: string, callback: (error?: string) => void): Promise<void> | void => {
      if (!value) {
        callback(formatMessage({id: 'validation.password.required'}));
      } else {
        if (value.length < 8) {
          callback(formatMessage({id: 'validation.password.sosimple'}));
        } else {
          const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/;
          if (!re.test(value)) {
            callback(formatMessage({id: 'validation.password.includeType'}));
          }
          form.validateFields(['password2']);
          callback();
        }
      }
    };

    const handleSubmit = () => {
      form
        .validateFields()
        .then(values => {
          form.resetFields();
          onCreate(values as UpdatePasswordValues);
        })
        .catch(info => {
        });
    };
    const commonProps = {
      style: {width: '200px'}, size: 'middle' as SizeType,
    };
    const layout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };
    return (
      <Modal
        visible={visible}
        title="修改密码"
        okText="确认"
        cancelText="取消"
        onCancel={onCancel}
        destroyOnClose
        maskClosable={false}
        onOk={handleSubmit}
        width={350}
      >
        <Form
          form={form}
          {...layout}
          initialValues={{password: '', password1: '', password2: ''}}
        >
          <FormItem
            label="原密码"
            name="password"
            rules={[{required: true, message: 'Please input your password!'},]}
          >
            <Input.Password {...commonProps}/>
          </FormItem>
          <FormItem
            label="新密码"
            name="password1"
            rules={[{required: true, message: 'Please input your password!'},
              {
                validator: checkPassword,
              },
            ]}
          >
            <Input.Password {...commonProps}/>
          </FormItem>
          <FormItem
            label="确认密码"
            name="password2"
            rules={[{required: true, message: 'Please input your password!'},
              ({getFieldValue}) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('password1') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('The two passwords that you entered do not match!');
                },
              }),]}
          >
            <Input.Password {...commonProps}/>
          </FormItem>
        </Form>
      </Modal>
    );
  };

export default UpdatePassword;

import React, {KeyboardEventHandler} from 'react';
import {Form, Input, Modal} from 'antd';
import FormItem from "antd/es/form/FormItem";

interface Values {
  password: string;
}

interface ValidatePasswordFormProps {
  visible: boolean;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}


const ValidatePassword: React.FC<ValidatePasswordFormProps> =
  ({visible, onCreate, onCancel,}) => {
    const [form] = Form.useForm();

    const onKeyup: KeyboardEventHandler<Element> = e => {
      if (e.keyCode === 13) {
        handleSubmit();
      }
    };

    const handleSubmit = () => {
      form
        .validateFields()
        .then(values => {
          form.resetFields();
          onCreate(values as Values);
        })
        .catch(info => {
          console.log('Validate Failed:', info);
        });
    };
    return (
      <Modal
        visible={visible}
        title="登录密码验证"
        okText="确认"
        cancelText="取消"
        onCancel={onCancel}
        destroyOnClose
        maskClosable={false}
        onOk={handleSubmit}
        width={320}
      >
        <Form
          form={form}
          initialValues={{password: ''}}
          style={{display: 'flex', justifyContent: 'center'}}
        >
          <FormItem label="用户密码" name="password" style={{display: 'flex', alignItems: 'center'}}>
            <Input.Password
              placeholder="请输入用户密码"
              style={{width: '200px'}}
              autoComplete="off"
              onKeyUp={onKeyup}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  };

export default ValidatePassword;

import React from 'react';
import {Form, Input, Modal} from 'antd';
import {CurrentUser} from "@/models/user";
import {SizeType} from "antd/es/config-provider/SizeContext";
import styles from '@/pages/yuntai.less';
import { UpdateUser} from "@/pages/usermanager/userlist/data";

const FormItem = Form.Item;

interface EditUserProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: UpdateUser, callback: Function) => void;
  onCancel: () => void;
  values?: CurrentUser;
}

const EditUser: React.FC<EditUserProps> = props => {
  const [form] = Form.useForm();

  const {updateModalVisible, onSubmit: handleAdd, onCancel, values = {}} = props;
  const {email, tel} = values;

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();

    handleAdd(fieldsValue as UpdateUser, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };

  const commonProps = {
    style: {width: '200px'}, size: 'middle' as SizeType,
  };
  return (
    <Modal
      destroyOnClose
      title="编辑用户信息"
      visible={updateModalVisible}
      onOk={okHandle}
      onCancel={() => onCancel()}
    >

      <Form form={form}
            initialValues={{
              email, tel
            }}
            layout="vertical"
            className={styles.formStyleCommon}
      >
        <div className={styles.flexSpaceBetween}>
          <FormItem
            label="邮箱"
            name="email"
            rules={[{required: false}]}
          >
            <Input placeholder="请输入" {...commonProps}/>
          </FormItem>
          <FormItem
            label="手机号"
            name="tel"
            rules={[{required: false}]}
          >
            <Input placeholder="请输入" {...commonProps}/>
          </FormItem>
        </div>
      </Form>
    </Modal>
  );
};

export default EditUser;

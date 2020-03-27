import React, {useEffect, useState} from 'react';
import {Form, Input, Modal,Select} from 'antd';
import styles from '@/pages/yuntai.less';
import {LabelListItem} from "@/pages/dfdk/label/data";

const FormItem = Form.Item;
const {Option} = Select;

interface CreateFormProps {
  modalVisible: boolean;
  onSubmit: (fieldsValue: LabelListItem, callback: Function) => void;
  onCancel: () => void;
  current?: NotRequired<LabelListItem>;
}

const CreateEditModal: React.FC<CreateFormProps> = props => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();

  const {modalVisible: visible, onSubmit: handleAdd, onCancel, current} = props;

  useEffect(() => {
    if (form && !visible && formRef) {
      setTimeout(() => form.resetFields(), 0)

    }
  }, [visible]);

  useEffect(() => {
    if (current) {
      setTimeout(() => {
        form.setFieldsValue({
          ...current
        });
      }, 0);
    }
  }, [current]);

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();

    handleAdd(fieldsValue as LabelListItem, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };

  return (
    <Modal
      title={`产品${current?.id ? '编辑' : '添加'}`}
      visible={visible}
      onOk={okHandle}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      width={320}
    >
      <Form form={form}
            ref={(ref) => setFormRef(ref)}
            layout="vertical"
            className={styles.formStyleCommon}
      >
        <FormItem
          name="label_type"
          label="标签类型"
          rules={[{required: true, message: '请选择'}]}
        >
          <Select placeholder="请选择标签类型">
            <Option value="1">产品</Option>
            <Option value="2">配件</Option>
          </Select>
        </FormItem>
        <FormItem
          name="name"
          label="标签名"
          rules={[{required: true, message: '请输入名，如服务器'}]}
        >
          <Input placeholder="请输入"/>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default CreateEditModal;

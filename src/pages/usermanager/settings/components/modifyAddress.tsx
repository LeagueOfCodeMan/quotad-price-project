import React, {useEffect, useState} from 'react';
import {Form, Input, Modal} from 'antd';
import {AddressListItem} from "@/pages/usermanager/settings/data";

const FormItem = Form.Item;

interface PublishModalProps {
  visible: boolean;
  onSubmit: (fieldsValue: AddressListItem, callback: Function) => void;
  onCancel: () => void;
  current?: NotRequired<AddressListItem>;
}

const AddressUpdateModal: React.FC<PublishModalProps> = props => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {visible, onSubmit: handleAdd, onCancel, current} = props;


  useEffect(() => {
    if (form && !visible && formRef) {
      setTimeout(() => form.resetFields(), 0)

    }
  }, [visible]);


  useEffect(() => {
    if (current && formRef) {
      setTimeout(() => {
        form.setFieldsValue({
          ...current
        });
      }, 0)
    }
  }, [current]);


  const okHandle = async () => {
    const fieldsValue = await form.validateFields();

    handleAdd(fieldsValue as AddressListItem, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };

  return (
    <Modal
      title={`${current?.id ? '编辑' : '新增'}收货地址`}
      visible={visible}
      onOk={okHandle}
      onCancel={() => onCancel()}
      width={420}
      maskClosable={false}
    >

      <Form
        {...layout}
        form={form}
        ref={(ref) => setFormRef(ref)}
        hideRequiredMark={true}
      >
          <FormItem
            label="收件人"
            name="recipients"
            rules={[{required: true, message: '收件人'},]}
          >
            <Input/>
          </FormItem>
          <FormItem
            label="手机号"
            name="tel"
            rules={[{required: true, message: '手机号'},]}
          >
            <Input/>
          </FormItem>
          <FormItem
            label="收货地址"
            name="addr"
            rules={[{required: true, message: '收货地址'},]}
          >
            <Input.TextArea />
          </FormItem>
      </Form>
    </Modal>
  );
};

export default AddressUpdateModal;

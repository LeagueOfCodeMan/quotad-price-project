import React from 'react';
import {Form, Input, Modal} from 'antd';
import {SizeType} from "antd/es/config-provider/SizeContext";
import {AreaListItem} from "@/models/data";

const FormItem = Form.Item;

interface CreateFormProps {
  modalVisible: boolean;
  onSubmit: (fieldsValue: AreaListItem, callback: Function) => void;
  onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const [form] = Form.useForm();

  const {modalVisible, onSubmit: handleAdd, onCancel} = props;
  // console.log(currentUser, areaList);
  const okHandle = async () => {
    const fieldsValue = await form.validateFields();

    handleAdd(fieldsValue as AreaListItem, (callback: boolean) => {
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
      title="新建地区"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      width={320}
    >
      <Form form={form}
      >
        <FormItem
          label="地区名称"
          name="area_name"
          rules={[{required: false}]}
        >
          <Input placeholder="请输入" {...commonProps}/>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default CreateForm;

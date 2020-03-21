import React from 'react';
import {Form, Input, Modal} from 'antd';
import {SizeType} from "antd/es/config-provider/SizeContext";
import {AreaListItem} from "@/models/data";

const FormItem = Form.Item;

interface EditFormProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: AreaListItem, callback: Function) => void;
  onCancel: () => void;
  values?: NotRequired<AreaListItem>;
}

const EditForm: React.FC<EditFormProps> = props => {
  const [form] = Form.useForm();

  const {updateModalVisible, onSubmit: handleAdd, onCancel, values = {}} = props;
  const {area_name} = values as AreaListItem;

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
      title="编辑地区名称"
      visible={updateModalVisible}
      onOk={okHandle}
      onCancel={() => onCancel()}
      width={320}
    >

      <Form form={form}
            initialValues={{
              area_name
            }}
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

export default EditForm;

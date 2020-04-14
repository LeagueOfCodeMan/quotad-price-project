import React, {useEffect, useState} from 'react';
import {Form, InputNumber, Modal} from 'antd';
import {SizeType} from "antd/es/config-provider/SizeContext";
import styles from '@/pages/yuntai.less';
import {ProductBaseListItem} from "@/pages/dfdk/product/product-config/data";

const FormItem = Form.Item;

interface PublishModalProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: ProductBaseListItem, callback: Function) => void;
  onCancel: () => void;
  current?: NotRequired<ProductBaseListItem>;
}

const PublishModal: React.FC<PublishModalProps> = props => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {updateModalVisible: visible, onSubmit: handleAdd, onCancel, current} = props;


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

    handleAdd(fieldsValue as ProductBaseListItem, (callback: boolean) => {
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
      title="编辑组员价格"
      visible={visible}
      onOk={okHandle}
      onCancel={() => onCancel()}
      width={320}
      maskClosable={false}
    >

      <Form
        form={form}
        ref={(ref) => setFormRef(ref)}
        layout="vertical"
        className={styles.formStyleCommon}
      >
        <div className={styles.flexSpaceBetween}>
          <FormItem
            label="组员价格"
            name="member_price"
            rules={[{required: true, message: '请输入组员价格'},
              {
                validator: (rule, value) => {
                  if (value < (parseFloat(current?.leader_price as string || '') || 0)) {
                    return Promise.reject('组员价格不能低于组长价格')
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => (value as string).replace(/¥\s?|(,*)/g, '')}
              {...commonProps}
              min={parseFloat(current?.leader_price as string || '') || 0}
            />
          </FormItem>
        </div>
      </Form>
    </Modal>
  );
};

export default PublishModal;

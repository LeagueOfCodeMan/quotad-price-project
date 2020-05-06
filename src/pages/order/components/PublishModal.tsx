import React, {useEffect, useState} from 'react';
import {Form, InputNumber, Modal} from 'antd';
import {SizeType} from "antd/es/config-provider/SizeContext";
import styles from '../../yuntai.less';
import {OrderListItem} from "@/pages/order/data";

const FormItem = Form.Item;

interface PublishModalProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: { order_leader_price: number }, callback: Function) => void;
  onCancel: () => void;
  current?: NotRequired<OrderListItem>;
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

    handleAdd(fieldsValue as { order_leader_price: number }, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };

  const commonProps = {
    style: {width: '200px'}, size: 'middle' as SizeType,
  };
  console.log(current);
  return (
    <Modal
      title="编辑成交总价"
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
            label="成交总价"
            name="order_leader_price"
            rules={[{required: true, message: '请输入组员价格'}
            ]}
          >
            <InputNumber
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => (value as string).replace(/¥\s?|(,*)/g, '')}
              {...commonProps}
            />
          </FormItem>
        </div>
      </Form>
    </Modal>
  );
};

export default PublishModal;

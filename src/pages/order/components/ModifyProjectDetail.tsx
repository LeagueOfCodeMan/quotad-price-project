import React, {useEffect, useState} from 'react';
import {Alert, Col, Form, Input, Modal, Row} from 'antd';
import styles from '../../yuntai.less';
import {OrderListItem} from "@/pages/order/data";

interface PublishModalProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: OrderListItem, callback: Function) => void;
  onCancel: () => void;
  current?: NotRequired<OrderListItem>;
}

const ModifyProjectDetail: React.FC<PublishModalProps> = props => {
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

    handleAdd(fieldsValue as OrderListItem, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };

  return (
    <Modal
      title="编辑订单信息"
      visible={visible}
      onOk={okHandle}
      onCancel={() => onCancel()}
      width={640}
      maskClosable={false}
      bodyStyle={{padding: '32px 40px 48px'}}
      className={styles.createOrderStyle}
    >

      <Form
        form={form}
        ref={(ref) => setFormRef(ref)}
        className={styles.formStyleCommon}
      >
        <div>
          <Alert
            message="收货信息"
            type="info"
          />
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Form.Item
                label="交货地址"
                name="addr"
                rules={[{required: false, message: '交货地址'}]}
              >
                <Input placeholder="交货地址" style={{width: 455}}/>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Form.Item
                label="联系人"
                name="contact"
                rules={[{required: false, message: '联系人'}]}
              >
                <Input placeholder="联系人" style={{width: 200}}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="电话"
                name="phone"
                rules={[{required: false, message: '电话'}]}
              >
                <Input placeholder="电话" style={{width: 200}}/>
              </Form.Item>
            </Col>
          </Row>
          <Alert
            message="开票信息"
            type="info"
          />
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Form.Item
                label="税号"
                name="bill_id"
                rules={[{required: false, message: '税号'}]}
              >
                <Input placeholder="税号" style={{width: 484}} disabled={current?.label === 1}/>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Form.Item
                label="地址"
                name="bill_addr"
                rules={[{required: false, message: '地址'}]}
              >
                <Input placeholder="地址" style={{width: 200}} disabled={current?.label === 1}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="电话"
                name="bill_phone"
                rules={[{required: false, message: '电话'}]}
              >
                <Input placeholder="电话" style={{width: 200}} disabled={current?.label === 1}/>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Form.Item
                label="开户行"
                name="bill_bank"
                rules={[{required: false, message: '开户行'}]}
              >
                <Input placeholder="开户行" style={{width: 200}} disabled={current?.label === 1}/>
              </Form.Item>
            </Col>
            <Col span={12}>

              <Form.Item
                label="账号"
                name="bill_account"
                rules={[{required: false, message: '账号'}]}
              >
                <Input placeholder="账号" style={{width: 200}} disabled={current?.label === 1}/>
              </Form.Item>
            </Col>
          </Row>
          <Alert
            message="开票、合同收货信息"
            type="info"
          />
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Form.Item
                label="地址"
                name="contract_addr"
                rules={[{required: false, message: '地址'}]}
              >
                <Input placeholder="地址" style={{width: 484}}/>
              </Form.Item>
            </Col>

          </Row>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Form.Item
                label="联系人"
                name="contract_contact"
                rules={[{required: false, message: '联系人'}]}
              >
                <Input placeholder="联系人" style={{width: 200}}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="电话"
                name="contract_phone"
                rules={[{required: false, message: '电话'}]}
              >
                <Input placeholder="电话" style={{width: 200}}/>
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default ModifyProjectDetail;

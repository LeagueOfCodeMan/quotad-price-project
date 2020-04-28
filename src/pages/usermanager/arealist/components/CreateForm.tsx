import React, {useEffect, useRef} from 'react';
import {Alert, Col, Form, Input, Modal, Row} from 'antd';
import {SizeType} from "antd/es/config-provider/SizeContext";
import {AreaListItem} from "@/models/data";

const FormItem = Form.Item;

interface CreateFormProps {
  modalVisible: boolean;
  onSubmit: (fieldsValue: AreaListItem, callback: Function) => void;
  onCancel: () => void;
  current?: NotRequired<AreaListItem>;
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const [form] = Form.useForm();
  const formRef = useRef<any>(null);

  const {modalVisible: visible, onSubmit: handleAdd, onCancel, current} = props;
  // console.log(currentUser, areaList);
  const okHandle = async () => {
    const fieldsValue = await form.validateFields();

    handleAdd(fieldsValue as AreaListItem, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };

  useEffect(() => {
    if (form && formRef) {
      if (current?.id) {
        setTimeout(()=>{
          form.setFieldsValue({
            ...current
          });
        })
      } else {
        setTimeout(()=>{
          form.resetFields();
        })

      }
    }
  }, [current?.id, form]);

  const commonProps = {
    style: {width: '200px'}, size: 'middle' as SizeType,
  };
  const formLayout = {
    labelCol: {span: 7},
    wrapperCol: {span: 13},
  };
  return (
    <Modal
      title={`${current?.id ? '编辑' : '新建'}区域`}
      visible={visible}
      onOk={okHandle}
      onCancel={() => {
        onCancel();
      }}
      maskClosable={false}
      width={640}
      forceRender
    >
      <Form form={form}
            {...formLayout}
            ref={formRef}
      >
        <Alert
          style={{marginBottom: '10px'}}
          message="地区信息"
          type="info"
        />
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <FormItem
              label="编码"
              name="code"
              rules={[{required: true, message: '编码'}]}
            >
              <Input placeholder="如：GD0001" {...commonProps} disabled={!!current?.id}/>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="地区名称"
              name="area_name"
              rules={[{required: true, message: '地区名称'}]}
            >
              <Input placeholder="如：广东" {...commonProps} disabled={!!current?.id}/>
            </FormItem>
          </Col>
        </Row>

        <Alert
          style={{marginBottom: '10px'}}
          message="开票信息"
          type="info"
        />
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Form.Item
              label="公司名"
              name="company"
              rules={[{required: true, message: '公司名'}]}
            >
              <Input placeholder="一级组员同组长" style={{width: 200}}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="税号"
              name="bill_id"
              rules={[{required: false, message: '税号'}]}
            >
              <Input placeholder="税号" style={{width: 200}}/>
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
              <Input placeholder="地址" style={{width: 200}}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="电话"
              name="bill_phone"
              rules={[{required: false, message: '电话'}]}
            >
              <Input placeholder="电话" style={{width: 200}}/>
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
              <Input placeholder="开户行" style={{width: 200}}/>
            </Form.Item>
          </Col>
          <Col span={12}>

            <Form.Item
              label="账号"
              name="bill_account"
              rules={[{required: false, message: '账号'}]}
            >
              <Input placeholder="账号" style={{width: 200}}/>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateForm;

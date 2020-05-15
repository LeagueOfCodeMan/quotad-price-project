import React, {useEffect, useState} from 'react';
import {Button, Col, Drawer, Form, Input, InputNumber, Row, Typography} from 'antd';
import {calculateOtherList} from '@/utils/utils';
import {StatisticWrapper} from '@/components/StatisticWrapper';
import _ from 'lodash';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons/lib';

const {Text} = Typography;

interface PublishModalProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue:{ name: string; price: string; count: number; }[]) => void;
  onCancel: () => void;
  current?: { name: string; price: string; count: number; }[];
}

const EditOtherList: React.FC<PublishModalProps> = props => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const [totalPrice, setPrice] = useState<number>(0);

  const {updateModalVisible: visible, onSubmit: handleAdd, onCancel, current} = props;

  useEffect(() => {
    if (form && visible && formRef) {
      setTimeout(() => form.resetFields(), 0);
    }
  }, [visible]);


  useEffect(() => {
    if (current && formRef) {
      setTimeout(() => {
        form.setFieldsValue({
          ...current
        });
        // 编辑时设置初始化
        setPrice(calculateOtherList(current));
      }, 0);
    }
  }, [current]);

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    console.log(fieldsValue);
    handleAdd(fieldsValue as { name: string; price: string; count: number; }[]);
  };

  return (
    <Drawer
      title={_.head(current) ? '编辑' : '添加' + '产品'}
      visible={visible}
      onClose={() => onCancel()}
      width={640}
      maskClosable={false}
      footer={
        <div
          style={{
            display: 'flex', justifyContent: 'space-between'
          }}
        >
          <div style={{display: 'flex', marginLeft: '80px'}}>
            <div style={{marginLeft: '30px', display: 'flex', marginTop: '5px'}}>
              <Text style={{fontSize: '16px', color: 'grey'}}>总价：</Text>
              <Text style={{color: '#FF6A00', fontSize: '20px', marginTop: '-5px'}}>
                {!_.isNaN(totalPrice) ?
                  <StatisticWrapper value={totalPrice} style={{fontSize: '20px'}}/>
                  : '部分尚未定价'}
              </Text>
            </div>
          </div>
          <div>
            <Button onClick={onCancel} style={{marginRight: 8}}>
              取消
            </Button>
            <Button onClick={okHandle} type="primary">
              添加至附加产品清单
            </Button>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        ref={(ref) => setFormRef(ref)}
      >
        <Form.List name="other_list">
          {(fields, {add, remove}) => {
            /**
             * `fields` internal fill with `name`, `key`, `fieldKey` props.
             * You can extends this into sub field to support multiple dynamic fields.
             */
            return (
              <div>
                {fields.map((field, index) => (
                  <Row key={field.key}>
                    <Col span={9}>
                      <Form.Item
                        label="产品名"
                        name={[field.name, 'name']}
                        // @ts-ignore
                        fieldKey={[field.fieldKey, 'name']}
                        rules={[{required: true, message: '产品名'}]}
                      >
                        <Input placeholder="产品名" style={{width: 100}}/>
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item
                        label="单价"
                        name={[field.name, 'price']}
                        // @ts-ignore
                        fieldKey={[field.fieldKey, 'price']}
                        rules={[{required: true, message: '单价'}]}
                      >
                        <InputNumber
                          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => (value as string).replace(/¥\s?|(,*)/g, '')}
                          min={0}
                          style={{width: 100}}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item
                        label="数量"
                        style={{marginRight: '10px'}}
                        name={[field.name, 'count']}
                        // @ts-ignore
                        fieldKey={[field.fieldKey, 'count']}
                        rules={[{required: true, message: '数量'}]}
                      >
                        <InputNumber
                          onChange={() => {
                            const {other_list} = form.getFieldsValue();
                            setPrice(calculateOtherList(other_list));
                          }}
                          placeholder="数量" style={{width: 100}}
                        />
                      </Form.Item>
                    </Col>
                    <Col flex="none" span={1}>
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                    }}
                    style={{width: '560px'}}
                  >
                    <PlusOutlined/> 添加其他产品
                  </Button>
                </Form.Item>
              </div>
            );
          }}
        </Form.List>

      </Form>
    </Drawer>
  );
};

export default EditOtherList;

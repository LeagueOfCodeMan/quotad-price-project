import React, { useState } from 'react';
import {Form, Button, DatePicker, Input, Modal, Radio, Select, Steps, Alert, Divider} from 'antd';

import {AddressInfo, AddressListItem} from "@/pages/usermanager/settings/data";
import moment from "moment";
import {ProjectListItem} from "@/pages/project/data";

export interface FormValueType extends Partial<ProjectListItem> {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
}

export interface UpdateFormProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => void;
  updateModalVisible: boolean;
  values: Partial<ProjectListItem>;
  addressList: AddressInfo;
}
const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;

export interface UpdateFormState {
  formVals: FormValueType;
  currentStep: number;
}

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const CreateForm: React.FC<UpdateFormProps> = props => {
  const [formVals, setFormVals] = useState<FormValueType>({
    name: props.values.name,
    desc: props.values.desc,
    key: props.values.key,
    target: '0',
    template: '0',
    type: '1',
    time: '',
    frequency: 'month',
  });

  const [currentStep, setCurrentStep] = useState<number>(0);

  const [form] = Form.useForm();

  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
    values,addressList,
  } = props;

  const forward = () => setCurrentStep(currentStep + 1);

  const backward = () => setCurrentStep(currentStep - 1);

  const handleNext = async () => {
    const fieldsValue = await form.validateFields();

    setFormVals({ ...formVals, ...fieldsValue });

    if (currentStep < 2) {
      forward();
    } else {
      handleUpdate(formVals);
    }
  };

  const renderContent = () => {
    if (currentStep === 1) {
      return (
        <>
          <FormItem name="target" label="监控对象">
            <Select style={{ width: '100%' }}>
              <Option value="0">表一</Option>
              <Option value="1">表二</Option>
            </Select>
          </FormItem>
          <FormItem name="template" label="规则模板">
            <Select style={{ width: '100%' }}>
              <Option value="0">规则模板一</Option>
              <Option value="1">规则模板二</Option>
            </Select>
          </FormItem>
          <FormItem name="type" label="规则类型">
            <RadioGroup>
              <Radio value="0">强</Radio>
              <Radio value="1">弱</Radio>
            </RadioGroup>
          </FormItem>
        </>
      );
    }
    if (currentStep === 2) {
      return (
        <>
          <FormItem
            name="time"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间！' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择开始时间"
            />
          </FormItem>
          <FormItem name="frequency" label="调度周期">
            <Select style={{ width: '100%' }}>
              <Option value="month">月</Option>
              <Option value="week">周</Option>
            </Select>
          </FormItem>
        </>
      );
    }
    return (
      <>
          <Alert
            message="购买须知"
            description="生成项目后，可在项目管理查看项目跟进状态"
            type="error"
            closable
          />
          <Form.Item
            name="project_name"
            rules={[{required: true, message: '项目名称'}]}
            style={{marginTop: '20px'}}
          >
            <Input placeholder="项目名称"/>
          </Form.Item>
          <Form.Item
            name="project_company"
            rules={[{required: true, message: '项目单位'}]}
          >
            <Input placeholder="项目单位"/>
          </Form.Item>
          <Form.Item
            name="project_addr"
            rules={[{required: true, message: '交货地址'}]}
          >
            <Select
              showSearch
              placeholder={!addressList?.results?.[0] ? '请前往个人设置填写地址' : '请选择地址'}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {addressList?.results?.map((d: AddressListItem, ii: number) => (
                <Option key={d.id + '-' + ii} value={d.id}
                        label={d.recipients + '-' + d.tel + '-' + d.addr}>
                  <div>
                    <span>{d.recipients}</span>
                    <Divider type="vertical"/>
                    <span>{d.tel}</span>
                    <Divider type="vertical"/>
                    <span>{d.addr}</span>
                  </div>
                </Option>))
              }
            </Select>
          </Form.Item>
          <Form.Item
            name="delivery_time"
            rules={[{required: true, message: '交货日期'}]}
          >
            <DatePicker
              disabledDate={current => {
                return current && current < moment().subtract(1, "days");
              }}
              style={{width: '100%'}}
            />
          </Form.Item>
      </>
    );
  };

  const renderFooter = () => {
    if (currentStep === 1) {
      return (
        <>
          <Button style={{ float: 'left' }} onClick={backward}>
            上一步
          </Button>
          <Button onClick={() => handleUpdateModalVisible(false, values)}>取消</Button>
          <Button type="primary" onClick={() => handleNext()}>
            下一步
          </Button>
        </>
      );
    }
    if (currentStep === 2) {
      return (
        <>
          <Button style={{ float: 'left' }} onClick={backward}>
            上一步
          </Button>
          <Button onClick={() => handleUpdateModalVisible(false, values)}>取消</Button>
          <Button type="primary" onClick={() => handleNext()}>
            完成
          </Button>
        </>
      );
    }
    return (
      <>
        <Button onClick={() => handleUpdateModalVisible(false, values)}>取消</Button>
        <Button type="primary" onClick={() => handleNext()}>
          下一步
        </Button>
      </>
    );
  };

  return (
    <Modal
      width={640}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title="创建项目"
      visible={updateModalVisible}
      footer={renderFooter()}
      onCancel={() => handleUpdateModalVisible(false, values)}
      afterClose={() => handleUpdateModalVisible()}
    >
      <Steps style={{ marginBottom: 28 }} size="small" current={currentStep}>
        <Step title="填写项目信息" />
        <Step title="配置规则属性" />
        <Step title="设定调度周期" />
      </Steps>
      <Form
        {...formLayout}
        form={form}
        initialValues={{
          target: formVals.target,
          template: formVals.template,
          type: formVals.type,
          frequency: formVals.frequency,
          name: formVals.name,
          desc: formVals.desc,
        }}
      >
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default CreateForm;

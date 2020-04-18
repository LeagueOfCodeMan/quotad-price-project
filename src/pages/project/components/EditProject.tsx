import React, {useEffect, useState} from 'react';
import {Alert, Col, DatePicker, Divider, Form, Input, Modal, Row, Select} from 'antd';
import styles from '../../yuntai.less';
import {AddressInfo, AddressListItem} from "../../usermanager/settings/data";
import moment from "moment";
import {ProjectListItem} from "../data";
import {CreateProjectParams} from "@/pages/project/service";

const {Option} = Select;

interface EditProjectProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: CreateProjectParams, callback: Function) => void;
  onCancel: () => void;
  current?: NotRequired<ProjectListItem>;
  addressList: AddressInfo;
}

const EditProject: React.FC<EditProjectProps> = props => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {updateModalVisible: visible, onSubmit: handleAdd, onCancel, current, addressList} = props;


  useEffect(() => {
    if (form && !visible && formRef) {
      setTimeout(() => form.resetFields(), 0)

    }
  }, [visible]);

  const okHandle = async () => {
    const {delivery_time, project_addr, project_name, project_company} = await form.validateFields();
    const payload = {
      delivery_time: delivery_time.format('YYYY-MM-DD'),
      project_addr: project_addr?.key,
      project_name, project_company
    }
    handleAdd(payload as CreateProjectParams, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };

  console.log(current);
  const address = current?.project_addr;
  return (
    <Modal
      title="编辑项目信息"
      visible={visible}
      onOk={okHandle}
      onCancel={() => onCancel()}
      width={640}
      maskClosable={false}
    >
      <Form
        form={form}
        ref={(ref) => setFormRef(ref)}
        layout="vertical"
        className={styles.formStyleCommon}
        initialValues={
          {
            project_name: current?.project_name,
            project_company: current?.project_company,
            project_addr: {
              key: address?.id,
              value: address?.id,
              label: (
                <div>
                  <span>{address?.recipients}</span>
                  <Divider type="vertical"/>
                  <span>{address?.tel}</span>
                  <Divider type="vertical"/>
                  <span>{address?.addr}</span>
                </div>
              ),
            },
            delivery_time: moment(new Date(current?.delivery_time || ''))
          }
        }
      >
        <div>
          <Alert
            message="修改项目基础信息"
            type="info"
            closable
          />
          <Row gutter={[16, 8]} style={{marginTop: '10px'}}>
            <Col span={12}>
              <Form.Item
                name="project_name"
                rules={[{required: true, message: '项目名称'}]}
              >
                <Input placeholder="项目名称" style={{width: 270}}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="project_company" rules={[{required: true, message: '项目单位'}]}>
                <Input placeholder="项目单位" style={{width: 270}}/>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item name="project_addr" rules={[{required: true, message: '交货地址'}]}>
                <Select
                  showSearch
                  placeholder={!addressList?.results?.[0] ? '请前往个人设置填写地址' : '请选择地址'}
                  filterOption={false}
                  labelInValue
                  style={{width: 270}}
                >
                  {addressList?.results?.map((d: AddressListItem, ii: number) => (
                    <Option
                      key={d.id}
                      value={d.id}
                    >
                      <div>
                        <span>{d.recipients}</span>
                        <Divider type="vertical"/>
                        <span>{d.tel}</span>
                        <Divider type="vertical"/>
                        <span>{d.addr}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="delivery_time" rules={[{required: true, message: '交货日期'}]}>
                <DatePicker
                  style={{width: 270}}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProject;

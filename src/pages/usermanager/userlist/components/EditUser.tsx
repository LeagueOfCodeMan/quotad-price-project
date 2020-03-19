import React, {ReactText} from 'react';
import {Form, Input, Modal, Select} from 'antd';
import {CurrentUser, NotRequired} from "@/models/user";
import {SizeType} from "antd/es/config-provider/SizeContext";
import styles from '@/pages/yuntai.less';
import {AreasInfo, CreateUser} from "@/pages/usermanager/userlist/data";

const {Option} = Select;

const FormItem = Form.Item;

interface EditUserProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: CreateUser, callback: Function) => void;
  onCancel: () => void;
  currentUser?: CurrentUser;
  areaList?: NotRequired<AreasInfo>;
  values?: CurrentUser;
}

type IdentityOptionsType = { label: string; value: number; };

const EditUser: React.FC<EditUserProps> = props => {
  const [form] = Form.useForm();

  const {updateModalVisible, onSubmit: handleAdd, onCancel, currentUser, areaList, values = {}} = props;
  const {identity, company, real_name, area, email, tel} = values;
  // 初始化可分配权限
  const identityOptions: IdentityOptionsType[] = currentUser?.identity === 1 ? [{label: '组长', value: 2}, {
    label: '二级组员',
    value: 4
  }] : [{label: '一级组员', value: 3}];

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();

    handleAdd(fieldsValue as CreateUser, (callback: boolean) => {
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
      title="编辑用户信息"
      visible={updateModalVisible}
      onOk={okHandle}
      onCancel={() => onCancel()}
    >

      <Form form={form}
            initialValues={{
              identity: identity ? identityOptions.filter(i => i.value !== identity)?.[0]?.label : null,
              real_name, area, email, tel, company
            }}
            layout="vertical"
            className={styles.formStyleCommon}
      >
        <div className={styles.flexSpaceBetween}>
          <FormItem
            label="地区"
            name="area"
            rules={[{required: true}]}
          >
            <Select {...commonProps}>
              {areaList?.results?.map(item => (
                <Option key={item?.id} value={item?.id as ReactText}>{item?.area_name}</Option>
              ))}

            </Select>
          </FormItem>
          <FormItem
            label="权限级别"
            name="identity"
            rules={[{required: true, message: 'Please input your password!'}]}
          >
            <Select {...commonProps}>
              {identityOptions.map(item => (
                <Option key={item.value} value={item.value}>{item.label}</Option>
              ))}
            </Select>
          </FormItem>
        </div>
        <div className={styles.flexSpaceBetween}>
          <FormItem
            label="真实姓名"
            name="real_name"
            rules={[{required: false}]}
          >
            <Input placeholder="请输入" {...commonProps}/>
          </FormItem>
          <FormItem
            label="公司名"
            name="company"
            rules={[{required: false}]}
          >
            <Input placeholder="请输入" {...commonProps}/>
          </FormItem>

        </div>
        <div className={styles.flexSpaceBetween}>
          <FormItem
            label="邮箱"
            name="email"
            rules={[{required: false}]}
          >
            <Input placeholder="请输入" {...commonProps}/>
          </FormItem>
          <FormItem
            label="手机号"
            name="tel"
            rules={[{required: false}]}
          >
            <Input placeholder="请输入" {...commonProps}/>
          </FormItem>
        </div>
      </Form>
    </Modal>
  );
};

export default EditUser;

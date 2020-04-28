import React, {ReactText, useEffect, useRef} from 'react';
import {Form, Input, Modal, Select} from 'antd';
import {CurrentUser} from "@/models/user";
import {SizeType} from "antd/es/config-provider/SizeContext";
import styles from '@/pages/yuntai.less';
import {CreateUser} from "@/pages/usermanager/userlist/data";
import {formatMessage} from 'umi-plugin-react/locale';
import {AreasInfo, UserListItem} from "@/models/data";

const {Option} = Select;

const FormItem = Form.Item;

interface CreateFormProps {
  modalVisible: boolean;
  onSubmit: (fieldsValue: CreateUser, callback: Function) => void;
  onCancel: () => void;
  currentUser?: CurrentUser;
  areaList?: NotRequired<AreasInfo>;
  editFormValues?: NotRequired<UserListItem>;
}

type IdentityOptionsType = { label: string; value: number; };

const CreateForm: React.FC<CreateFormProps> = props => {
  const [form] = Form.useForm();
  const formRef = useRef<any>(null);

  const {modalVisible, editFormValues: current, onSubmit: handleAdd, onCancel, areaList} = props;
  // console.log(currentUser, areaList);
  // 初始化可分配权限
  const identityOptions: IdentityOptionsType[] = [{label: '组长', value: 2}, {
    label: '二级组员',
    value: 4
  }, {label: '一级组员', value: 3}];

  useEffect(() => {
    if (form && formRef) {
      if (current?.id) {
        setTimeout(() => {
          form.setFieldsValue({
            ...current
          });
        })
      } else {
        setTimeout(() => {
          form.resetFields();
        })

      }
    }
  }, [current?.id, form]);

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();

    handleAdd(fieldsValue as CreateUser, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };

  const checkPassword = (rule: any, value: string, callback: (error?: string) => void): Promise<void> | void => {
    if (!value) {
      callback(formatMessage({id: 'validation.password.required'}));
    } else {
      if (value.length < 8) {
        callback(formatMessage({id: 'validation.password.sosimple'}));
      } else {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/;
        if (!re.test(value)) {
          callback(formatMessage({id: 'validation.password.includeType'}));
        }
        form.validateFields(['password2']);
        callback();
      }
    }
  };

  const commonProps = {
    style: {width: '200px'}, size: 'middle' as SizeType,
  };
  return (
    <Modal
      title={`${current?.id ? '编辑' : '新建'}用户`}
      visible={modalVisible}
      maskClosable={false}
      onOk={okHandle}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      forceRender
      okText="确认"
      cancelText="取消"
    >

      <Form form={form}
            ref={formRef}
            layout="vertical"
            className={styles.formStyleCommon}
      >
        {current?.id ?
          <>
            <div className={styles.flexSpaceBetween}>

              <FormItem
                label="公司名"
                name="company"
                rules={[{required: false}]}
              >
                <Input placeholder="请输入" {...commonProps} disabled/>
              </FormItem>
              <FormItem
                label="真实姓名"
                name="real_name"
                rules={[{required: false}]}
              >
                <Input placeholder="请输入" {...commonProps}/>
              </FormItem>
            </div>


            <div className={styles.flexSpaceBetween}>
              <FormItem
                label="手机号"
                name="tel"
                rules={[{required: false}]}
              >
                <Input placeholder="请输入" {...commonProps}/>
              </FormItem>
              <FormItem
                label="邮箱"
                name="email"
                rules={[{required: false,}, {type: 'email'}]}
              >
                <Input placeholder="请输入" {...commonProps}/>
              </FormItem>
            </div>
          </> :
          <>
            <div className={styles.flexSpaceBetween}>
              <FormItem
                label="用户所属"
                name="area"
                rules={[{required: true, message: '地区编码!'}]}
              >
                <Select
                  {...commonProps}
                  style={{width: '437px'}}
                >
                  {areaList?.results?.map((item: { id: number; area_name: string; code: string; company: string }) => (
                    <Option key={item?.id}
                            value={item?.id as ReactText}>{item?.area_name + '-' + item?.code + '-' + item?.company}</Option>
                  ))}

                </Select>
              </FormItem>
            </div>

            <div className={styles.flexSpaceBetween}>
              <FormItem
                label="权限级别"
                name="identity"
                rules={[{required: true, message: '权限级别!'}]}
              >
                <Select {...commonProps}>
                  {identityOptions.map(item => (
                    <Option key={item.value} value={item.value.toString()}>{item.label}</Option>
                  ))}

                </Select>
              </FormItem>
              <FormItem
                label="真实姓名"
                name="real_name"
                rules={[{required: true, message: '真实姓名!'}]}
              >
                <Input placeholder="请输入" {...commonProps}/>
              </FormItem>

            </div>

            <div className={styles.flexSpaceBetween}>
              <FormItem
                label="手机号"
                name="tel"
                rules={[{required: true, message: '手机号!'}]}
              >
                <Input placeholder="请输入" {...commonProps}/>
              </FormItem>
              <FormItem
                label="邮箱"
                name="email"
                rules={[{required: true, message: '邮箱!'}, {type: 'email', message: '邮箱!'}]}
              >
                <Input placeholder="请输入" {...commonProps}/>
              </FormItem>
            </div>

            <div className={styles.flexSpaceBetween}>
              <FormItem
                label="地址"
                name="addr"
                rules={[{required: true, message: '地址!'}]}
              >
                <Input placeholder="请输入" {...commonProps}/>
              </FormItem>
              <FormItem
                label="用户名"
                name="username"
                rules={[{required: true, message: '请输入最少5位用户名', min: 5},
                  {pattern: /^[A-Za-z0-9/.+-_]+$/, message: formatMessage({id: 'validation.username.format'})}
                ]}
              >
                <Input placeholder="请输入用户名"  {...commonProps} />
              </FormItem>
            </div>

            <div className={styles.flexSpaceBetween}>
              <FormItem
                label="密码"
                name="password"
                rules={[{required: true, message: 'Please input your password!'},
                  {
                    validator: checkPassword,
                  },
                ]}
              >
                <Input.Password {...commonProps}/>
              </FormItem>
              <FormItem
                label="确认密码"
                name="re_password"
                rules={[{required: true, message: 'Please input your password!'},
                  ({getFieldValue}) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject('The two passwords that you entered do not match!');
                    },
                  }),]}
              >
                <Input.Password {...commonProps}/>
              </FormItem>

            </div>
          </>

        }


      </Form>
    </Modal>
  );
};

export default CreateForm;

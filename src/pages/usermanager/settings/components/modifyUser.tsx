import React from 'react';
import {Form, Input, Modal} from 'antd';
import FormItem from "antd/es/form/FormItem";
import {CreateUser} from "@/pages/usermanager/userlist/data";
import {getModifyUserComponentProps, ModifyType} from "@/utils/utils";

interface ModifyUserInfoValuesProps {
  visible: boolean;
  onCreate: (values: CreateUser) => void;
  onCancel: () => void;
  modifyType: ModifyType;
}


const ModifyUserInfo: React.FC<ModifyUserInfoValuesProps> =
  ({visible, onCreate, onCancel, modifyType}) => {
    const [form] = Form.useForm();

    const initProps = getModifyUserComponentProps(modifyType);
    const handleSubmit = () => {
      form
        .validateFields()
        .then(values => {
          form.resetFields();
          onCreate(values as CreateUser);
        })
        .catch(info => {
        });
    };
    return (
      <Modal
        visible={visible}
        title={initProps?.title}
        okText="确认"
        cancelText="取消"
        onCancel={onCancel}
        destroyOnClose
        maskClosable={false}
        onOk={handleSubmit}
        width={320}
      >
        <Form
          form={form}
          style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
        >
          {initProps?.formData?.map(item => {
            return (
              <FormItem
                key={item.label}
                label={item.label} name={item.name}
                rules={[{required: true, message: '请输入' + item.label},
                  {...item.rule}
                ]}
              >
                <Input
                  placeholder={item.placeholder}
                  style={{width: '200px'}}
                  autoComplete="off"
                />
              </FormItem>
            )
          })}
        </Form>
      </Modal>
    );
  };

export default ModifyUserInfo;

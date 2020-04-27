import React, {useEffect, useState} from 'react';
import {Form, Input, Modal} from 'antd';
import styles from '../../yuntai.less';
import {CreateProjectParams} from "@/pages/project/service";
import {ProjectListItem} from "@/pages/project/data";

const {TextArea} = Input;

interface EditProjectProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: CreateProjectParams, callback: Function) => void;
  onCancel: () => void;
  current?: NotRequired<ProjectListItem>;
}

const EditProject: React.FC<EditProjectProps> = props => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {updateModalVisible: visible, onSubmit: handleAdd, onCancel, current} = props;


  useEffect(() => {
    if (form && !visible && formRef) {
      setTimeout(() => form.resetFields(), 0)

    }
  }, [visible]);

  const okHandle = async () => {
    const values = await form.validateFields();

    handleAdd(values as CreateProjectParams, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

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
        className={styles.formStyleCommon}
        initialValues={
          {...current}
        }
        {...layout}
      >
        <>
          <div>
            <Form.Item
              label="项目名称"
              name="project_name"
              rules={[{required: true, message: '项目名称'}]}
            >
              <Input placeholder="项目名称" style={{width: 270}}/>
            </Form.Item>
            <Form.Item label="项目描述" name="project_desc" rules={[{required: false, message: '项目描述'}]}>
              <TextArea rows={2} placeholder="请输入至少五个字符" style={{width: 270}}/>
            </Form.Item>
          </div>
          <div style={{border: '1px dashed #dddddd'}}>
            <div style={{textAlign: "center", color: '#1890FF', fontWeight: 'bold', margin: '10px 0'}}>用户信息选填</div>
            <div>
              <Form.Item
                label="用户名称"
                name="user_name"
              >
                <Input placeholder="用户名称" style={{width: 270}}/>
              </Form.Item>
              <Form.Item
                label="地址"
                name="user_addr"
              >
                <Input placeholder="地址" style={{width: 270}}/>
              </Form.Item>
              <Form.Item
                label="电话"
                name="user_iphone"
              >
                <Input placeholder="电话" style={{width: 270}}/>
              </Form.Item>
              <Form.Item
                label="联系人"
                name="user_contact"
              >
                <Input placeholder="联系人" style={{width: 270}}/>
              </Form.Item>
            </div>
          </div>
        </>
      </Form>
    </Modal>
  );
};

export default EditProject;

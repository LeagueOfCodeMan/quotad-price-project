import React, {FC, useEffect, useState} from 'react';
import {Store} from 'rc-field-form/lib/interface';
import {Button, Form, Input, InputNumber, Modal, Result, Tooltip, Upload} from 'antd';
import styles from '../style.less';
import {ProductConfigListItem} from "@/pages/dfdk/product/product-config/data";
import {EyeOutlined, InboxOutlined} from "@ant-design/icons/lib";
import {UploadListType} from "antd/lib/upload/interface";
import _ from 'lodash';

interface OperationModalProps {
  done: boolean;
  visible: boolean;
  current: Partial<ProductConfigListItem> | undefined;
  onDone: () => void;
  onSubmit: (values: ProductConfigListItem, callback: Function) => void;
  onCancel: () => void;
}

const {TextArea} = Input;
const formLayout = {
  labelCol: {span: 7},
  wrapperCol: {span: 13},
};

const OperationModal: FC<OperationModalProps> = props => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {done, visible, current, onDone, onCancel, onSubmit} = props;
  const [previewVisible, setPeviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [result, setResult] = useState<ProductConfigListItem>();

  useEffect(() => {
    if (form && !visible && formRef) {
      setTimeout(() => form.resetFields(), 0)

    }
  }, [props.visible]);

  useEffect(() => {
    if (current) {
      setPreviewImage(current?.avatar || '')
      setTimeout(() => {
        form.setFieldsValue({
          ..._.omit(current, ['avatar'])
          // createdAt: current.createdAt ? moment(current.createdAt) : null,
        });
      }, 0);
    }
  }, [props.current]);

  const handleSubmit = () => {
    if (!form) return;
    form.submit();
  };

  const modalFooter = done
    ? {footer: null, onCancel: onDone}
    : {okText: '保存', onOk: handleSubmit, onCancel};

  const getModalContent = () => {
    if (done) {
      return (
        <Result
          status="success"
          title="操作成功"
          subTitle={(
            <div className={styles.resultImageContainer}>
              <img src={result?.avatar || ''} style={result?.avatar ? {backgroundColor: '#4f4f4f'} : {}}/>
              <div>
                <span>配件名：{result?.conf_name}</span>
                <span>备注：{result?.conf_mark}</span>
                <span>描述：{result?.con_desc}</span>
                <span>组长价格：{result?.leader_price}</span>
                <span>二级组员价格 ：{result?.second_price}</span>
              </div>
            </div>
          )}
          extra={
            <Button type="primary" onClick={onDone}>
              知道了
            </Button>
          }
          className={styles.formResult}
        />
      );
    }

    // TODO 对上传的处理
    const getBase64 = (img: File, callback: Function) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => callback(reader.result));
      reader.readAsDataURL(img);
    }

    const normFile = (e: { fileList: { url: string, preview: any, originFileObj: any }[], }) => {
      if (Array.isArray(e)) {
        return e;
      }
      const fileList = _.slice(e?.fileList, -1);
      const file = fileList?.[0];
      if (!file.url && !file.preview) {
        file.preview = getBase64(file.originFileObj, (imageUrl: string) => {
          setPreviewImage(imageUrl);
        });
      }
      return fileList;
    };

    const handleUploadChange = (info: any) => {
      // console.log(info);
    };

    const upLoadProp = () => ({
      action: '',
      listType: 'picture-card' as UploadListType,
      onChange: handleUploadChange,
      onPreview: () => setPeviewVisible(true),
      beforeUpload: () => false,
      showUploadList: false,
    });

    const validateImage = (rule: any, value: { type: string; size: number; }[]): Promise<any> => {
      if (current?.avatar) {
        return Promise.resolve();
      }
      const file = value?.[0] || {};
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        return Promise.reject('仅支持上传 JPG/PNG 文件!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        return Promise.reject('文件不能大于 2MB!');
      }
      return Promise.resolve();
    }

    //  拦截生成FormData进行请求，请求完成回调返回结果并显示结果页
    const onFinish = (values: Store) => {
      const formData = new FormData();
      Object.keys(values).map((item) => {
        if (item === 'avatar') {
          formData.append(item, values?.[item]?.[0]?.originFileObj || current?.avatar);
        } else {
          formData.append(item, values?.[item]);
        }
      });
      if (onSubmit) {
        onSubmit(formData as any, (response: ProductConfigListItem) => {
          setResult(response);
        });
      }
    };
    return (
      <Form form={form} ref={(ref) => setFormRef(ref)} {...formLayout} onFinish={onFinish}>
        <Form.Item
          name="conf_name"
          label="配件名称"
          rules={[{required: true, message: '请选择配件名称'}]}
        >
          <Input/>
        </Form.Item>
        <Form.Item label="请上传图片">
          <>
            <Modal
              visible={previewVisible} footer={null} onCancel={() => setPeviewVisible(false)}>
              <img alt="example" style={{width: '100%'}} src={previewImage}/>
            </Modal>

          </>
          <div className={previewImage ? styles.previewImageContainer : ''}>
            {previewImage ?
              <div className={styles.imageWrapper}>
                <img src={previewImage} alt="avatar"/>
                <div className={styles.itemActions}>
                  <Tooltip placement="top" title={<span>点击预览</span>}>
                    <EyeOutlined style={{fontSize: '32px', color: '#fff'}} onClick={() => setPeviewVisible(true)}/>
                  </Tooltip>
                </div>
              </div> : null
            }
            <Form.Item
              name="avatar"
              rules={[{validator: validateImage}]}
              valuePropName="fileList" getValueFromEvent={normFile} noStyle>
              <Upload.Dragger name="files" {...upLoadProp()}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined/>
                </p>
                <p className="ant-upload-text">点击或拖拽图片到此区域</p>
              </Upload.Dragger>
            </Form.Item>
          </div>
        </Form.Item>
        <Form.Item
          name="conf_mark"
          label="备注"
          rules={[{required: true, message: '请输入至少五个字符的备注！', min: 5}]}
        >
          <TextArea rows={2} placeholder="请输入至少五个字符"/>
        </Form.Item>

        <Form.Item
          name="con_desc"
          label="配件描述"
          rules={[{required: true, message: '请输入至少五个字符的产品描述！', min: 5}]}
        >
          <TextArea rows={4} placeholder="请输入至少五个字符"/>
        </Form.Item>
        <Form.Item
          name="leader_price"
          label="组长价格"
          rules={[{required: true, message: '请选择'}]}
        >
          <InputNumber
            formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => (value as string).replace(/¥\s?|(,*)/g, '')}
            style={{width: '350px'}}
          />
        </Form.Item>
        <Form.Item
          name="second_price"
          label="二级组员价格"
          rules={[{required: true, message: '请选择'}]}
        >
          <InputNumber
            formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => (value as string).replace(/¥\s?|(,*)/g, '')}
            style={{width: '350px'}}
          />
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title={done ? null : `配件${current ? '编辑' : '添加'}`}
      className={styles.standardListForm}
      width={640}
      bodyStyle={done ? {padding: '72px 0'} : {padding: '28px 0 0'}}
      visible={visible}
      {...modalFooter}
      maskClosable={false}
      forceRender={true}
    >
      {getModalContent()}
    </Modal>
  );
};

export default OperationModal;

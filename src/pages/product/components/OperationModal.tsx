import React, {FC, useEffect, useState} from 'react';
import {Store} from 'rc-field-form/lib/interface';
import {Button, Form, Input, InputNumber, Modal, Result, Select, Tooltip, Upload} from 'antd';
import styles from '../style.less';
import {EyeOutlined, InboxOutlined} from "@ant-design/icons/lib";
import {UploadListType} from "antd/lib/upload/interface";
import _ from 'lodash';
import {ProductBaseListItem} from "../data";
import {queryProduct} from "../service";
import {useToggle} from "react-use";
import {isNormalResponseBody, ProductType, productType} from "@/utils/utils";

const {Option, OptGroup} = Select;

interface OperationModalProps {
  done: boolean;
  visible: boolean;
  current: Partial<ProductBaseListItem> | undefined;
  onDone: () => void;
  onSubmit: (values: ProductBaseListItem, callback: Function) => void;
  onCancel: () => void;
}

const {TextArea} = Input;
const formLayout = {
  labelCol: {span: 7},
  wrapperCol: {span: 13},
};

const OperationModal: FC<OperationModalProps> = props => {
  const [form] = Form.useForm();
  const [data, setData] = useState<ProductBaseListItem[]>([]);
  const {done, visible, current, onDone, onCancel, onSubmit} = props;
  const [previewVisible, setPeviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [result, setResult] = useState<ProductBaseListItem>();
  const [isShow, toggleShow] = useToggle(false);

  useEffect(() => {
    if (form && !visible) {
      setTimeout(() => form.resetFields(), 0)
    }
  }, [props.visible]);

  useEffect(() => {
    if (current) {
      const {conf_list, genre} = current;
      const belong: { label: string; value: number; }[] = [];
      const belong2: { label: string; value: number; }[] = [];
      if (genre === 6 || genre === 7 || genre === 8) {
        fetchProduct(genre);
        toggleShow(true);
        if (_.head(conf_list)) {
          conf_list?.forEach(d => {
            if (d?.is_required) {
              belong.push({
                value: d?.id,
                label: d?.pro_type
              });
            } else {
              belong2.push({
                value: d?.id,
                label: d?.pro_type
              });
            }
          })
        }
      } else {
        toggleShow(false);
      }

      setPreviewImage(current?.avatar || '')
      setTimeout(() => {
        form.setFieldsValue({
          ..._.omit(current, ['avatar']), belong, belong2
        });
      }, 0);
    }
  }, [current]);

  const handleSubmit = () => {
    if (!form) return;
    form.submit();
  };

  const modalFooter = done
    ? {footer: null, onCancel: onDone}
    : {okText: '保存', onOk: handleSubmit, onCancel};

  // todo 获取产品列表
  const fetchProduct = _.debounce(async (index: number) => {
    const payload = {pageSize: 9999,};
    if (index === 6) {
      payload['genre__iexact'] = 1;
    } else {
      payload['genre__lte'] = 5;
      payload['genre__gte'] = 1;
    }
    const response = await queryProduct(payload);
    if (isNormalResponseBody(response)) {
      setData(response?.results || []);
    }
  }, 800);

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
                <span>产品名：{result?.pro_type}</span>
                <span>备注：{result?.mark}</span>
                <span>描述：</span>
                <ul style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                  {result?.desc?.split("\n")?.map((o, i) => {
                    return (
                      <li key={i}>{o}<br/></li>
                    )
                  })}
                </ul>
                <span>组长价格：{result?.leader_price}</span>
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
    };

    const upLoadProp = () => ({
      action: '',
      listType: 'picture-card' as UploadListType,
      onChange: handleUploadChange,
      onPreview: () => setPeviewVisible(true),
      beforeUpload: () => false,
      showUploadList: false,
    });

    // const validateImage = (rule: any, value: { type: string; size: number; }[]): Promise<any> => {
    //   if (current?.avatar) {
    //     return Promise.resolve();
    //   }
    //   const file = value?.[0] || {};
    //   const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    //   if (!isJpgOrPng) {
    //     return Promise.reject('仅支持上传 JPG/PNG 文件!');
    //   }
    //   const isLt2M = file.size / 1024 / 1024 < 2;
    //   if (!isLt2M) {
    //     return Promise.reject('文件不能大于 2MB!');
    //   }
    //   return Promise.resolve();
    // }

    //  拦截生成FormData进行请求，请求完成回调返回结果并显示结果页
    const onFinish = (values: Store) => {
      const formData = new FormData();
      const {avatar, belong, belong2, desc, leader_price, mark, pro_type, genre} = values;
      const conf_list: { conf: number; is_required: boolean; }[] = [];
      belong?.forEach((d: { value: number; }) => {
        conf_list.push({conf: d?.value, is_required: true});
      });
      belong2?.forEach((d: { value: number; }) => {
        conf_list.push({conf: d?.value, is_required: false});
      });
      const payload = {avatar, desc, leader_price, mark, pro_type, genre, conf_list}
      Object.keys(_.pickBy(payload, d => !_.isUndefined(d))).map((item) => {
        if (item === 'avatar') {
          if (payload?.[item]?.[0]?.originFileObj) {
            formData.append(item, payload?.[item]?.[0]?.originFileObj || current?.avatar);
          }
        } else if (item === 'conf_list') {
          formData.append(`conf_list`, JSON.stringify(payload?.[item]));

        }
        else {
          formData.append(item, payload?.[item]);
        }
      });
      if (onSubmit) {
        toggleShow(false);
        onSubmit(formData as any, (response: ProductBaseListItem) => {
          setResult(response);
        });
      }
    };

    const handleChangeBelong = (value: any, index: number) => {
      const belong = form.getFieldValue('belong');
      const belong2 = form.getFieldValue('belong2');
      if (index === 1) {
        changeFieldWhenBelongChange(value, belong2, 'belong2');
      } else {
        changeFieldWhenBelongChange(value, belong, 'belong');
      }
    };

    const changeFieldWhenBelongChange = (
      field: { value: number; label: string; key: number; }[],
      field2: { value: number; label: string; key: number; }[], update: string) => {
      const updateVal = field2;
      const notUpdateVal = field;
      if (_.head(field) && _.head(field2)) {
        _.remove(updateVal, (o) => {
          return !!_.find(notUpdateVal, (oo) => oo?.value === o?.value);
        });
        const finalBelong = _.map(_.filter(data, o => !!_.find(updateVal, (oo) => oo?.value === o?.id)), o => ({
          value: o?.id,
          label: o?.pro_type
        }));

        console.log(finalBelong);
        if (update === 'belong') {
          form.setFieldsValue({belong: finalBelong});
        } else {
          form.setFieldsValue({belong2: finalBelong});
        }
      }
    }

    return (
      <Form form={form} {...formLayout} onFinish={onFinish}>
        <Form.Item
          name="pro_type"
          label="产品型号"
          rules={[{required: true, message: '请输入产品型号'}]}
        >
          <Input/>
        </Form.Item>
        <Form.Item
          name="genre"
          label="分类"
          rules={[{required: true, message: '请选择类别'}]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }}
            onChange={(value) => {
              if (value === 6 || value === 7 || value === 8) {
                toggleShow(true);
                fetchProduct(value)
              } else {
                toggleShow(false);
              }
            }}
          >
            {(productType(0) as ProductType[]).map(v => {
              return <Option key={v.key} value={v.key} label={v.label}>{v.label}</Option>
            })}
          </Select>
        </Form.Item>
        {
          isShow ?
            <>
              <Form.Item
                name="belong"
                label="归属(绑定对象必选)"
                rules={[{required: false, message: '请选择归属'}]}
                hasFeedback
              >
                <Select
                  mode="multiple"
                  placeholder="可多选"
                  notFoundContent="请先选择类别"
                  style={{width: '100%'}}
                  labelInValue
                  onChange={(value) => handleChangeBelong(value, 1)}
                >
                  {
                    (productType(form.getFieldValue('genre') === 6 ? -5 : -1) as { label: string; key: number; }[])?.map(d => {
                      return (
                        <OptGroup label={d?.label} key={d?.key}>
                          {
                            _.filter(data, o => o?.genre === d?.key)?.map(d2 => {
                              return (
                                <Option key={d2?.id} value={d2?.id}>{d2?.pro_type}</Option>
                              )
                            })
                          }
                        </OptGroup>
                      )
                    })
                  })
                  }
                </Select>
              </Form.Item>
              <Form.Item
                name="belong2"
                label="归属(绑定对象可选)"
                rules={[{required: false, message: '请选择归属'}]}
                hasFeedback
              >
                <Select
                  mode="multiple"
                  placeholder="可多选"
                  notFoundContent="请先选择类别"
                  style={{width: '100%'}}
                  labelInValue
                  onChange={(value) => handleChangeBelong(value, 2)}
                >
                  {
                    (productType(form.getFieldValue('genre') === 6 ? -5 : -1) as { label: string; key: number; }[])?.map(d => {
                      return (
                        <OptGroup label={d?.label} key={d?.key}>
                          {
                            _.filter(data, o => o?.genre === d?.key)?.map(d2 => {
                              return (
                                <Option key={d2?.id} value={d2?.id}>{d2?.pro_type}</Option>
                              )
                            })
                          }
                        </OptGroup>
                      )
                    })
                  }
                </Select>
              </Form.Item>
            </>
            : null
        }
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
              rules={[{required: false}
                // , {validator: validateImage}
              ]}
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
          name="mark"
          label="备注"
          rules={[{required: false, message: '请输入至少五个字符的备注！', min: 5}]}
        >
          <TextArea rows={2} placeholder="请输入至少五个字符"/>
        </Form.Item>

        <Form.Item
          name="desc"
          label="描述"
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
      </Form>
    );
  };

  return (
    <Modal
      title={done ? null : `产品${current?.id ? '编辑' : '添加'}`}
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

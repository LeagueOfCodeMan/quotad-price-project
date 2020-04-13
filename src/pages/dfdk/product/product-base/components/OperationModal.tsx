import React, { FC, useEffect, useState } from 'react';
import { Store } from 'rc-field-form/lib/interface';
import { Button, Divider, Form, Modal, Result, Select } from 'antd';
import styles from '@/pages/dfdk/product/style.less';
import _ from 'lodash';
import { isNormalResponseBody, ProductType, productType } from '@/utils/utils';
import { ProductBaseListItem } from '@/pages/dfdk/product/data';
import { queryProduct } from '@/pages/dfdk/product/service';

const { Option } = Select;

interface OperationModalProps {
  done: boolean;
  visible: boolean;
  current: Partial<ProductBaseListItem> | undefined;
  onDone: () => void;
  onSubmit: (values: OperationModalSubmitType, callback: Function) => void;
  onCancel: () => void;
}

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

export type OperationModalSubmitType = {
  id: number;
  conf_list: { conf: number; is_required: boolean }[];
};

const OperationModal: FC<OperationModalProps> = props => {
  const [form] = Form.useForm();
  const { done, visible, current, onDone, onCancel, onSubmit } = props;
  const [result, setResult] = useState<ProductBaseListItem>();
  // 基础
  const [data, setData] = useState<ProductBaseListItem[]>([]);
  // 必选
  const [data2, setData2] = useState<ProductBaseListItem[]>([]);
  // 可选
  const [data3, setData3] = useState<ProductBaseListItem[]>([]);

  useEffect(() => {
    if (form && !visible) {
      setTimeout(() => form.resetFields(), 0);
    }
  }, [props.visible]);

  useEffect(() => {
    if (current?.id) {
      setTimeout(() => {
        const requiredList = current?.conf_list?.filter(i => i.is_required);
        const requiredKeys = _.map(requiredList, i => ({
          key: i?.id,
          value: i?.id,
          label: (
            <div>
              <span>{i.pro_type}</span>
              <Divider type="vertical" />
              <span>{productType(i.genre)}</span>
              <Divider type="vertical" />
              <span style={{ color: '#FF6A00' }}>组长价格：¥{i.leader_price}</span>
            </div>
          ),
        }));
        const notRequiredList = current?.conf_list?.filter(i => !i.is_required);
        const notRequiredKeys = _.map(notRequiredList, i => ({
          key: i?.id,
          value: i?.id,
          label: (
            <div>
              <span>{i.pro_type}</span>
              <Divider type="vertical" />
              <span>{productType(i.genre)}</span>
              <Divider type="vertical" />
              <span style={{ color: '#FF6A00' }}>组长价格：¥{i.leader_price}</span>
            </div>
          ),
        }));
        setData2(requiredList || []);
        setData3(notRequiredList || []);
        form.setFieldsValue({
          id2: requiredKeys,
          id3: notRequiredKeys,
        });
      }, 0);
    }
  }, [current]);

  const handleSubmit = () => {
    if (!form) return;
    form.submit();
  };

  const modalFooter = done
    ? { footer: null, onCancel: onDone }
    : { okText: '保存', onOk: handleSubmit, onCancel };

  const getModalContent = () => {
    if (done) {
      return (
        <Result
          status="success"
          title="操作成功"
          subTitle={
            <div className={styles.resultImageContainer}>
              <img
                src={result?.avatar || ''}
                style={result?.avatar ? { backgroundColor: '#4f4f4f' } : {}}
              />
              <div>
                <span>产品名：{result?.pro_type}</span>
                <span>备注：{result?.mark}</span>
                <span>描述：{result?.desc}</span>
                <span>组长价格：{result?.leader_price}</span>
              </div>
            </div>
          }
          extra={
            <Button type="primary" onClick={onDone}>
              知道了
            </Button>
          }
          className={styles.formResult}
        />
      );
    }

    const fetchProduct = _.debounce(async (index: number) => {
      const response = await queryProduct({
        genre: form.getFieldValue('genre' + index),
        pageSize: 9999,
      });
      if (isNormalResponseBody(response)) {
        if (index === 1) {
          setData(response?.results || []);
        } else if (index === 2) {
          setData2(response?.results || []);
        } else {
          setData3(response?.results || []);
        }
      }
    }, 800);

    //  拦截生成FormData进行请求，请求完成回调返回结果并显示结果页
    const onFinish = (values: Store) => {
      console.log(values);
      const id = values?.id1;
      const necessary: { conf: number; is_required: boolean }[] = [];
      const unnecessary: { conf: number; is_required: boolean }[] = [];
      _.forEach(values, (value, key) => {
        if (key === 'id2') {
          value?.forEach((d: { key: number }) =>
            necessary.push({ conf: d?.key, is_required: true }),
          );
        } else if (key === 'id3') {
          value?.forEach((d: { key: number }) =>
            unnecessary.push({ conf: d?.key, is_required: false }),
          );
        }
      });
      const payload = { id: id || current?.id, conf_list: necessary.concat(unnecessary) };
      if (onSubmit) {
        onSubmit(payload as any, (response: ProductBaseListItem) => {
          setResult(response);
        });
      }
    };

    return (
      <Form form={form} {...formLayout} onFinish={onFinish}>
        {current?.id ? (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px' }}>
            <span>
              基础产品：
              <span style={{ color: 'blue', marginRight: '20px' }}>{current?.pro_type}</span>
            </span>
            <span>类型：{productType(current?.genre || 1)}</span>
          </div>
        ) : (
          <>
            <Form.Item
              name="genre1"
              label="基础分类"
              rules={[{ required: false, message: '请选择类别' }]}
            >
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
                onChange={() => {
                  fetchProduct(1);
                }}
              >
                {(productType(0) as ProductType[]).map(v => {
                  return (
                    <Option key={v.key} value={v.key} label={v.label}>
                      {v.label}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item
              name="id1"
              label="基础选择"
              rules={[{ required: true, message: '请选择类别' }]}
              hasFeedback
            >
              <Select
                showSearch
                placeholder="基础选配"
                notFoundContent="请先选择类别"
                optionFilterProp="children"
                filterOption={(input, option) => {
                  return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
                style={{ width: '100%' }}
              >
                {data?.map(d => (
                  <Option
                    key={d.id}
                    value={d.id}
                    label={d.pro_type + '-' + productType(d.genre) + '-' + d.leader_price}
                  >
                    <div>
                      <span>{d.pro_type}</span>
                      <Divider type="vertical" />
                      <span>{productType(d.genre)}</span>
                      <Divider type="vertical" />
                      <span style={{ color: '#FF6A00' }}>组长价格：¥{d.leader_price}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
        <Form.Item
          name="genre2"
          label="必选分类"
          rules={[{ required: false, message: '请选择类别' }]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }}
            onChange={() => {
              fetchProduct(2);
            }}
          >
            {(productType(0) as ProductType[]).map(v => {
              return (
                <Option key={v.key} value={v.key} label={v.label}>
                  {v.label}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          name="id2"
          label="必选(可多选)"
          rules={[{ required: false, message: '请选择类别' }]}
          hasFeedback
        >
          <Select
            mode="multiple"
            showSearch
            labelInValue
            placeholder="必选配置"
            notFoundContent="请先选择类别"
            filterOption={false}
            style={{ width: '100%' }}
          >
            {data2?.map(d => (
              <Option key={d.id} value={d.id}>
                <div>
                  <span>{d.pro_type}</span>
                  <Divider type="vertical" />
                  <span>{productType(d.genre)}</span>
                  <Divider type="vertical" />
                  <span style={{ color: '#FF6A00' }}>组长价格：¥{d.leader_price}</span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="genre3"
          label="可选分类"
          rules={[{ required: false, message: '请选择类别' }]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }}
            onChange={() => {
              fetchProduct(3);
            }}
          >
            {(productType(0) as ProductType[]).map(v => {
              return (
                <Option key={v.key} value={v.key} label={v.label}>
                  {v.label}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          name="id3"
          label="可选(可多选)"
          rules={[{ required: false, message: '请选择类别' }]}
          hasFeedback
        >
          <Select
            showSearch
            labelInValue
            mode="multiple"
            placeholder="可选配置"
            notFoundContent="请先选择类别"
            optionFilterProp="children"
            filterOption={false}
            style={{ width: '100%' }}
          >
            {data3?.map(d => (
              <Option key={d.id} value={d.id}>
                <div>
                  <span>{d.pro_type}</span>
                  <Divider type="vertical" />
                  <span>{productType(d.genre)}</span>
                  <Divider type="vertical" />
                  <span style={{ color: '#FF6A00' }}>组长价格：¥{d.leader_price}</span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title={done ? null : `标准库${current?.id ? '编辑' : '添加'}`}
      className={styles.standardListForm}
      width={640}
      bodyStyle={done ? { padding: '72px 0' } : { padding: '28px 0 0' }}
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

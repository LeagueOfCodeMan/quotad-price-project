import React, {FC, useEffect, useRef, useState} from 'react';
import {Store} from 'rc-field-form/lib/interface';
import {Button, Col, Divider, Form, Modal, Result, Row, Select} from 'antd';
import styles from '../style.less';
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons/lib";
import {ProductBaseListItem} from "@/pages/dfdk/product/product-base/data";
import {ProductConfigList, ProductConfigListItem} from "@/pages/dfdk/product/product-config/data";
import {LabelListItem} from "@/pages/dfdk/label/data";
import _ from "lodash";
import {queryConfInfo} from "@/pages/dfdk/product/product-config/service";

const {Option} = Select;

interface OperationModalProps {
  done: boolean;
  visible: boolean;
  confList: ProductConfigList;
  labelArr: LabelListItem[];
  onDone: () => void;
  onSubmit: (values: number[], callback: Function) => void;
  onCancel: () => void;
}

interface FormListType {
  label_name: string;
  conf_id: number;
}

type FormStore = { fields: FormListType[] }

const ProductCustomConfig: FC<OperationModalProps> = props => {
  const [form] = Form.useForm();
  const {done, visible, confList: current, onDone, onCancel, onSubmit, labelArr} = props;
  const [result, setResult] = useState<ProductBaseListItem>();
  const [formList, setFormList] = useState<FormListType[]>([]);
  const [configList, setConfigList] = useState<NotRequired<ProductConfigListItem[]>>([]);
  const formRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (form && !visible) {
        form.resetFields()
      }
    })
  }, [visible]);

  useEffect(() => {
    // if (current) {
    //   setTimeout(() => {
    //     form.setFieldsValue({
    //       ..._.omit(current, ['avatar'])
    //     });
    //   }, 0);
    // }
    if (current?.results) {
      const initFormList: FormListType[] = [];
      current.results.forEach((d) => {
        const {label_name, id} = d;
        initFormList.push({label_name, conf_id: id});
      })
      console.log(initFormList)
      setFormList(initFormList);
    }
  }, [current]);


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
                <span>产品名：{result?.pro_type}</span>
                <span>备注：{result?.mark}</span>
                <span>描述：{result?.desc}</span>
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
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 4},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 20},
      },
    };


    /**
     * 当切换Label时，获取对应的配置数据
     **/
    const handleLabelChange = async (parameters: { value: string, index: number }) => {
      const {value, index} = parameters;
      const result = await queryConfInfo({label_name: value, pageSize: 99999});
      if (_.head(result.results)) {
        const lastArr: FormListType[] = [...formList] || [];
        const lastConf: NotRequired<ProductConfigListItem[]> = [...configList] || [];
        const confList = result.results;
        const {label_name, id} = confList?.[0];
        lastArr[index] = {label_name, conf_id: id};
        lastConf[index] = confList;
        setFormList(lastArr);
        setConfigList(lastConf);
      }
    }
    /**
     *  当切换配置时，改变formList
     * */
    const handleConfigChange = async (parameters: { value: number, index: number }) => {
      const {value, index} = parameters;
      const values = form.getFieldsValue();
      const lastArr: FormListType[] = [...formList] || [];
      lastArr[index] = {label_name: values?.[index]?.label_name, conf_id: value};
      setFormList(lastArr);
    }

    //  拦截生成FormData进行请求，请求完成回调返回结果并显示结果页
    const onFinish = (values:Store) => {
      console.log('Received values of form:', values);
      // if (onSubmit) {
      //   onSubmit(formData as any, (response: ProductBaseListItem) => {
      //     setResult(response);
      //   });
      // }
      const result = _.zipWith((values as FormStore)?.fields, a => a?.conf_id);
      console.log(result);
    };

    const labelOptions = labelArr?.map(d => <Option key={d.name} value={d.name}>{d.name}</Option>);

    return (
      <Form form={form} ref={formRef} className={styles.productCustomConfigForm}
            initialValues={...formList}
            onFinish={onFinish}>
        <Form.List name="fields">
          {(fields, {add, remove}) => {
            return (
              <div className={styles.rowWrapper}>
                {fields.map((field, index) => (
                  <Row key={field.key}>
                    <Col style={{width: '30%'}}>
                      <Form.Item
                        name={[field.name, "label_name"]}
                        fieldKey={field.fieldKey}
                        rules={[{required: true, message: '请选择配置类别'}]}
                      >
                        <Select
                          showSearch
                          placeholder="选择配置类别"
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          onChange={val => handleLabelChange({value: val, index: index})}
                        >
                          {labelOptions}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col style={{width: '60%'}}>
                      <Form.Item
                        shouldUpdate={true}
                        name={[field.name, "conf_id"]}
                        fieldKey={field.fieldKey}
                        rules={[{required: true, message: '清选择配置'}]}
                      >
                        <Select
                          showSearch
                          dropdownMatchSelectWidth={undefined}
                          placeholder="选择配置"
                          optionFilterProp="children"
                          filterOption={(input, option) => {
                            console.log(input, option)
                            return option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                          }}
                          onChange={val => handleConfigChange({value: val, index: index})}
                        >
                          {(configList[index])?.map((d: ProductConfigListItem) => <Option key={d.id} value={d.id}>
                            <div>
                              <span>{d.conf_name}</span>
                              <Divider type="vertical"/>
                              <span>{d.conf_mark}</span>
                              <Divider type="vertical"/>
                              <span>{d.con_desc}</span>
                            </div>
                          </Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col flex="none">
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
                    style={{width: "100%"}}
                  >
                    <PlusOutlined/> 添加配置项
                  </Button>
                </Form.Item>
              </div>
            );
          }}
        </Form.List>
      </Form>
    );
  };

  return (
    <Modal
      title={done ? null : '自定义配件'}
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

export default ProductCustomConfig;

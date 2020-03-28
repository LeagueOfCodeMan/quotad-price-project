import React, {useEffect, useState} from 'react';
import {
  Avatar,
  Button,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  InputNumber,
  Radio,
  Row,
  Select,
  Tooltip,
  Typography
} from 'antd';
import styles from '../style.less';
import {ProductDetailListItem} from "@/pages/dfdk/product-purchased/data";
import {ProductConfigListItem} from "@/pages/dfdk/product/product-config/data";
import {CheckOutlined} from "@ant-design/icons/lib";
import _ from "lodash";
import {CurrentUser} from "@/models/user";
import {RadioChangeEvent} from "antd/es/radio";
import {ShoppingCartItem} from "@/models/data";
import { v4 as uuidv4 } from 'uuid';

const {Option} = Select;
const {Paragraph, Text} = Typography;

interface CustomConfigFormProps {
  visible: boolean;
  onSubmit: (fieldsValue: ShoppingCartItem) => void;
  onCancel: () => void;
  current?: NotRequired<ProductDetailListItem>;
  currentUser: CurrentUser;
  checkValue?: string;
}

type ConfPar = { id: number; count: number }[];

interface FormListType {
  production: number;
  conf_par: ConfPar;
}


const CustomConfigForm: React.FC<CustomConfigFormProps> = props => {
  const [form] = Form.useForm();
  const [checkMode, setCheckMode] = useState<string>('standard');
  const [calculate, handleCalculate] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<string>('0.00');

  const {visible, onSubmit: handleAdd, onCancel, current, currentUser, checkValue} = props;

  const groupItems = _.groupBy(_.result(current, ['conf_list']), 'label_name');

  useEffect(() => {
    setTimeout(() => {
      if (form && !visible) {
        form.resetFields()
      }
      if (visible && checkValue) {
        setCheckMode(checkValue);
      }
      if (visible) {
        setTotalPrice(actPrice(current));
      }
    })
  }, [visible]);


  useEffect(() => {
    if (current?.id) {
      setTimeout(() => {
        const conf_par: ConfPar = [];
        _.forEach(groupItems, (v, k) => {
          conf_par.push({id: (_.head(sortConfListByActPrice(v as any[])) as ProductConfigListItem)?.id, count: 0})
        });
        form.setFieldsValue({production: 1, conf_par});
      }, 0)

    }
  }, [current]);

  /**
   * 当选项改变时，重新计算价格
   */

  const change = () => {
    handleCalculate(calculate + 1);
  };

  useEffect(() => {
    calculatePrice();
  }, [calculate]);

  /**
   * 获取Form中值并计算总价
   *
   */
  const calculatePrice = () => {
    const {production, conf_par} = form.getFieldsValue();
    const basePrice = parseFloat(actPrice(current));
    const checkHadCountConf = _.filter(conf_par, o => o.count);
    if (production) {
      if (_.head(checkHadCountConf)) {
        const confPrice: number = _.reduce(checkHadCountConf as ConfPar, (sum, {id, count}) => {
          const findAtChecked = _.find(_.result(current, ['conf_list']) as ProductConfigListItem[], o => o.id === id);
          if (parseFloat(actPrice(findAtChecked))) {
            return sum + parseFloat(actPrice(findAtChecked)) * count;
          }
          return sum;
        }, 0);
        const totalPrice = (basePrice + confPrice) * production;
        const handlePrice = totalPrice % 1 !== 0 ? totalPrice?.toString() : totalPrice?.toString() + '.00';
        setTotalPrice(handlePrice);
      } else {
        const totalPrice = basePrice * production;
        setTotalPrice(totalPrice % 1 !== 0 ? totalPrice?.toString() : totalPrice?.toString() + '.00');
      }
    }
  }

  /**
   * 根据权限对输入item，进行价格string
   * @param item
   */
  const actPrice = (item: any): string => {
    const {identity} = currentUser;
    const val = item as ProductDetailListItem | ProductConfigListItem;
    let result = '0.00';
    switch (identity) {
      case 1:
      case 2:
        result = (val?.leader_price || '0.00').toString();
        break;
      case 3:
        result = (val?.member_price || '0.00').toString();
        break;
      case 4:
        result = (val?.second_price || '0.00').toString();
        break;
      default:
        result = '0.00';
        break;
    }
    return result;
  }

  /**
   * 切换标准与选配，选配时，处理数据
   */
  const sortConfListByActPrice = (item: ProductConfigListItem[] | ProductDetailListItem[]) => {
    return _.sortBy(item, o => parseFloat(actPrice(o)));
  };


  /**
   * 提交加入购物车，数据结构ShoppingCartItem
   */
  const onFinish = () => {
    const {production, conf_par} = form.getFieldsValue() as FormListType;
    const checkedProductConfigList: number[] = _.map(_.filter(conf_par, o => o.count) as ConfPar, 'id');
    const findAtChecked = _.map(_.result(current, ['conf_list']) as ProductConfigListItem[], (d) => {
      if (_.indexOf(checkedProductConfigList, d.id) > -1) {
        return {
          ...d,
          count: _.find(conf_par, dd => dd.id === d.id)?.count
        };
      }
      return undefined;
    });
    const result = {
      uuid:uuidv4(),
      ..._.omit(current, ['conf_list']), count: production,
      conf_list: _.filter(findAtChecked, o => o) as ProductConfigListItem[] | [], total_price: totalPrice
    };
    if (handleAdd) {
      handleAdd(result as ShoppingCartItem);
    }
  };

  /**
   * 标准和扩展切换时处理
   */
  const handleModeChange = (e: RadioChangeEvent) => {
    setCheckMode(e.target.value);
    change();
  }

  const labelKeys = _.keys(groupItems);

  return (
    <Drawer
      title={current?.pro_type || ''}
      width={720}
      onClose={onCancel}
      visible={visible}
      getContainer={false}
      bodyStyle={{paddingBottom: 80}}
      footer={
        <div
          style={{
            display: 'flex', justifyContent: 'flex-end', fontSize: '12px'
          }}
        >
          <div style={{marginRight: '20px'}}>
            <span>配置费用：</span>
            <span style={{color: '#FF8A00'}}> ¥</span>
            <span style={{fontSize: '24px', color: '#FF8A00'}}>{totalPrice}</span>
          </div>
          <Button onClick={onFinish} style={{backgroundColor: '#FF6A00', color: '#fff', borderColor: '#fff'}}>
            加入购物车
          </Button>
        </div>
      }
    >
      <div className={styles.drawerContent}>

        <div className={styles.drawerContentTop}>
          <Radio.Group defaultValue={checkValue} onChange={handleModeChange} value={checkMode}>
            <Radio.Button value="standard">标准版</Radio.Button>
            {!!_.head(current?.conf_list) ? <Radio.Button value="custom">定制版</Radio.Button> : null}
          </Radio.Group>
          <div className={styles.drawerContentTopInner}>
            <Descriptions bordered column={{xl: 2, lg: 2, md: 2, sm: 1, xs: 1}}>
              <Descriptions.Item label="产品图">
                <Avatar src={current?.avatar} shape="square" size="large"/>
              </Descriptions.Item>
              <Descriptions.Item label="备注">
                <Paragraph>
                  <ul>
                    {current?.mark?.split(/[\s\n]/).map((d, index) => {
                      return (
                        <li key={index + '-' + d}>
                          <Text style={{color: '#181818'}}>{d}</Text>
                        </li>
                      )
                    })}
                  </ul>
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="参数">
                <Paragraph>
                  <Tooltip placement="top" title={current?.desc}>
                    <ul>
                      {current?.desc?.split(/[\s\n]/).map((d, index) => {
                        return (
                          <li key={index + '-' + d}>
                            <CheckOutlined style={{color: 'rgb(255, 20, 80)', marginRight: '5px'}}/>
                            <Text ellipsis style={{color: '#181818', width: '90px'}}>{d}</Text>
                          </li>
                        )
                      })}
                    </ul>
                  </Tooltip>
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="价格">
                <Text strong style={{color: '#181818'}}>¥ {actPrice(current)}</Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>

        <Form form={form} className={styles.productCustomConfigForm}
        >
          {checkMode === 'custom' ?
            <Form.List name="conf_par">
              {(fields) => {
                return (
                  <div>
                    {fields.map((field, index) => (
                      <Row key={field.key + '-' + index}>
                        <Col style={{width: '20%', textAlign: 'center', marginTop: '5px'}}>
                          <Text strong>{labelKeys?.[index]}</Text>
                        </Col>
                        <Col style={{width: '40%'}}>
                          <Form.Item
                            shouldUpdate={true}
                            name={[field.name, "id"]}
                            fieldKey={field.fieldKey}
                            rules={[{required: true, message: '清选择配置'}]}
                          >
                            <Select
                              showSearch
                              placeholder="选择配置"
                              optionFilterProp="children"
                              filterOption={(input, option) => {
                                return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                              }}
                              onChange={change}
                            >
                              {(_.result(groupItems, labelKeys?.[index]) as ProductConfigListItem[])?.map((d: ProductConfigListItem, ii) =>
                                <Option key={d.id + '-' + ii} value={d.id} label={d.conf_name + '-' + d.conf_mark}>
                                  <div>
                                    <span>{d.conf_name}</span>
                                    <Divider type="vertical"/>
                                    <span>{d.conf_mark}</span>
                                    <Divider type="vertical"/>
                                    <span>{d.con_desc}</span>
                                    <Divider type="vertical"/>
                                    <span style={{color: '#FF6A00'}}>¥{actPrice(d)}</span>
                                  </div>
                                </Option>)}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col style={{width: '30%', marginLeft: '2%', display: 'flex'}}>
                          <span style={{marginTop: '5px'}}>购买数量：</span>
                          <Form.Item
                            shouldUpdate={true}
                            name={[field.name, "count"]}
                            fieldKey={field.fieldKey}
                            rules={[{required: true, message: '清选择数量'}]}
                          >
                            <InputNumber min={0} onChange={change} style={{margin: '0 5px'}}/>
                          </Form.Item>
                          <span style={{marginTop: '5px'}}>个</span>
                        </Col>

                      </Row>
                    ))}
                  </div>
                );
              }}
            </Form.List> : null
          }
          <div style={{display: 'flex', marginLeft: '60px'}}>
            <span style={{marginTop: '5px'}}>购买产品数量：</span>
            <Form.Item name="production">
              <InputNumber onChange={change} min={1} style={{margin: '0 5px'}}/>
            </Form.Item>
            <span style={{marginTop: '5px'}}>个</span>
          </div>
        </Form>

      </div>
    </Drawer>
  );
};

export default CustomConfigForm;

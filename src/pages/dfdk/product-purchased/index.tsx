import {BackTop, Button, Card, Divider, List, Radio, Select, Skeleton, Typography} from 'antd';
import React, {FC, useEffect, useState} from 'react';

import {Dispatch} from 'redux';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import {connect} from 'dva';
import {ProductDetailInfo, ProductDetailListItem} from './data.d';
import styles from './style.less';
import {CurrentUser, UserModelState} from "@/models/user";
import {LabelList} from "@/pages/dfdk/label/data";
import {CheckOutlined} from "@ant-design/icons/lib";
import {ProductStateType} from "@/pages/dfdk/product-purchased/model";
import {ProductConfigListItem} from "@/pages/dfdk/product/product-config/data";
import yuntong from '@/assets/yuntong.png';
import _ from "lodash";
import CustomConfigForm from "@/pages/dfdk/product-purchased/components/CustomConfigForm";
import {RadioChangeEvent} from "antd/es/radio";
import {LocalStorageShopType, ShoppingCartItem} from "@/models/data";
import {isNormalResponseBody} from "@/utils/utils";
import {useLocalStorage} from "react-use";

const {Paragraph, Text} = Typography;
const {Option} = Select;

interface CardListProps {
  product: ProductStateType;
  dispatch: Dispatch<any>;
  loading: boolean;
  fetch: boolean;
  currentUser: CurrentUser;
  labelList: LabelList;
}

type ProductInfo = ProductDetailListItem[];

const size = 3;

const CardList: FC<CardListProps> = props => {
  const {
    fetch,
    dispatch,
    currentUser,
    labelList
  } = props;

  const [list, setList] = useState<ProductDetailListItem[]>([]);
  const [data, setData] = useState<ProductInfo>([]);
  const [current, setCurrent] = useState<number>(0);
  const [isLoadMore, setIsLoadMore] = useState<boolean>(true);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [drawerMessage, setDrawerMessage] = useState<NotRequired<ProductDetailListItem>>({});
  const [checkValue, setCheckValue] = useState<string>('standard');
  const [customVisibleList, setCustomVisibleList] =
    useState<{ visible: boolean, names: { label_name: string; conf_names: string[]; }[], min_price: string }[]>([]);
  const [labelId, setLabelId] = useState<number>(0);
  const productLabel = _.head(labelList.results) && labelList.results.filter(i => i.label_type === 1);

  const [cartList, setCartList] = useLocalStorage<LocalStorageShopType>('shopping-cart', []);

  useEffect(() => {
    dispatch({
      type: 'user/fetchLabels',
      payload: {pageSize: 99999}
    })
  }, []);

  const initUseState = () => {
    setData([]);
    setList([]);
    setCurrent(0);
    setCustomVisibleList([]);
    setIsLoadMore(false);
  }


  useEffect(() => {
    getProductData();
  }, [labelId])

  /**
   * 加载产品信息
   */
  const getProductData = () => {
    console.log('===========', current)
    dispatch({
      type: 'product/fetch',
      payload: labelId ?
        {pageSize: size, current: current + 1, label_id: labelId} : {pageSize: size, current: current + 1,},
      callback: (response: ProductDetailInfo) => {
        if (isNormalResponseBody(response)) {
          setData([...data, ...response?.results]);
          setList([...data, ...response?.results]);
          window.dispatchEvent(new Event('resize'));
        }
        if (!response.next) {
          setIsLoadMore(false);
        } else {
          setIsLoadMore(true);
        }
      }
    });
    setCurrent(current + 1);
  };

  /**
   * 根据权限对输入item，进行价格string[]输出 如 ['1','00']
   * @param item
   */
  const actPrice = (item: any): string[] => {
    const {identity} = currentUser;
    const val = item as ProductDetailListItem | ProductConfigListItem;
    let result = '0.00';
    switch (identity) {
      case 1 || 2:
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
    let final = result.split('.');
    if (_.nth(final, 1)) {
      return final;
    } else {
      final[1] = '00';
      return final
    }
  }

  /**
   * pageWrapper定义
   */
  const handleProductLabelChange = (e: RadioChangeEvent) => {
    initUseState();
    setLabelId(e.target.value);
  }

  const content = (
    <div className={styles.pageHeaderContent}>
      <p>
        <span style={{fontSize: '16px', fontWeight: 'bold'}}>产品购买须知：</span>产品分为标配和选配，进行批量一键加购后，生成项目。
        一级组员生成项目由组长进行下单，二级组员自行下单。
      </p>
      <div style={{fontSize: '16px', fontWeight: 'bold'}}>产品系列</div>
      <div className={styles.contentLink}>
        <Radio.Group value={labelId} onChange={handleProductLabelChange}>
          <Radio.Button className={styles.radioButtonStyle} value={0} key='first'>全部产品</Radio.Button>
          {productLabel?.map((d, i) => {
            return (
              <Radio.Button className={styles.radioButtonStyle} value={d.id} key={i + '' + d.id}>{d.name}</Radio.Button>
            )
          })}
        </Radio.Group>
      </div>
    </div>
  );
  const extraContent = (
    <div className={styles.extraImg}>
      <img
        alt="这是一个标题"
        src={yuntong}
      />
    </div>
  );
  const pageProps = {
    title: false,
    content,
    extraContent,
    breadcrumb: undefined,
    className: styles.pageHeaderWrapperStyle
  }

  /**
   * card操作项
   */
  const actions = (item: Partial<ProductDetailListItem>, index: number) => {
    return [
      <span
        key="option1" style={{color: '#fff'}} className={styles.actionButton}
        onClick={() => {
          setShowDrawer(true);
          setDrawerMessage(item);
        }}
      >
        一键加购
      </span>
    ]
  }
  /**
   * 切换标准与选配，选配时，处理数据
   */
  const sortConfListByActPrice = (item: ProductConfigListItem[] | ProductDetailListItem[]) => {
    return _.sortBy(item, o => parseFloat(_.join(actPrice(o), '.')));
  };

  /**
   * 切换选项时处理增加配置列表展示及重新计算最低价格
   * @param value
   * @param item
   * @param index
   */
  const handleConfigSettings = (value: string, item: Partial<ProductDetailListItem>, index: number) => {
    const visibleList = [...customVisibleList];
    if (value === 'custom') {
      const minConf = _.head(sortConfListByActPrice(_.result(item, ['conf_list'])));
      const min_price = _.join(actPrice(minConf), '.');

      const groupItems = _.groupBy(_.result(item, ['conf_list']), 'label_name');
      const values: { label_name: string; conf_names: string[]; }[] = [];
      _.forEach(groupItems, (v, k) => {
        values.push({label_name: k, conf_names: _.map(sortConfListByActPrice(v as any[]), 'conf_name')})
      });
      visibleList[index] = {visible: true, min_price, names: values};
      setCustomVisibleList(visibleList);
    } else {
      visibleList[index]['visible'] = false;
      setCustomVisibleList(visibleList);
    }
    setCheckValue(value);
  };

  /**
   * 自定义loadMore
   */
  const onLoadMore = () => {
    // @ts-ignore
    setList(data.concat([...new Array(size)].map((index) => ({
      loading: true, id: index + '-' + Math.random()
    }))))
    getProductData();
  };

  const loadMore =
    !fetch ? (
      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          height: 32,
          lineHeight: '32px',
        }}
      >
        {isLoadMore ?
          <Button onClick={onLoadMore} className={styles.loadMoreButton}>
            展开更多商品
          </Button> :
          <span>
                <BackTop>
            </BackTop>
            已加载全部
          </span>}
      </div>
    ) : null;

  /**
   * 切换tab后的信息
   * @param index
   */
  const customMoreMessage = (index: number) => {
    const customItem = customVisibleList?.[index];
    return (
      customItem?.visible ?
        <>
          {customItem?.names?.map((d, index) => {
            return (
              <li key={index + '' + d?.label_name}>
                <CheckOutlined style={{color: 'rgb(255, 20, 80)', marginRight: '5px'}}/>
                <Text style={{color: '#181818'}}>可扩展{d?.label_name}：
                  {d?.conf_names?.map((dd, ii) => {
                    if (ii === d?.conf_names.length - 1) {
                      return <span key={dd + '-' + 'ii'}>{dd}</span>;
                    } else {
                      return (
                        <span key={dd + '-' + 'ii'}>{dd}
                          <Divider type="vertical"/>
                        </span>
                      )
                    }
                  })}
                </Text><br/>
              </li>
            )
          })}
        </> : null
    )
  };
  /**
   * item 价格信息
   * @param item
   * @param index
   */
  const priceDetail = (item: Partial<ProductDetailListItem>, index: number) => {
    const customItem = customVisibleList?.[index];
    let finalPrice = actPrice(item);
    const basePrice = parseFloat(_.join(finalPrice || '', '.'));
    const min_price: number = parseFloat(customItem?.min_price || '0')
    if (customItem?.visible) {
      finalPrice = _.floor(basePrice + min_price, 2).toString().split('.');
    }
    return (
      <>
        <span style={{fontSize: '30px'}}>{finalPrice[0]}</span>
        <span>.{finalPrice?.[1] || '00'}</span>
      </>
    )
  }

  /**
   * 提交到购物车
   * @param values
   */
  const dispatchToShopModel = (values: ShoppingCartItem) => {
    const {username} = currentUser;
    const copyCartList = [...cartList];
    const target = _.remove(copyCartList, d => d.user === username) || [];
    const result: LocalStorageShopType = [...copyCartList, {
      user: username as string,
      shop: _.concat(_.head(target)?.shop || [], values)
    }];
    setCartList(result);
    setShowDrawer(false);
    setDrawerMessage({});
  }

  return (
    <PageHeaderWrapper {...pageProps}>
      <CustomConfigForm
        onSubmit={dispatchToShopModel}
        onCancel={() => {
          setShowDrawer(false);
          setDrawerMessage({});
        }}
        visible={showDrawer}
        current={drawerMessage}
        currentUser={currentUser}
        checkValue={checkValue}
      />
      <div className={styles.cardList}>
        <List<Partial<ProductDetailListItem>>
          rowKey="id"
          loadMore={loadMore}
          loading={fetch}
          grid={{gutter: 24, xl: 3, lg: 3, md: 2, sm: 1, xs: 1}}
          dataSource={list || []}
          renderItem={(item, index) => {
            return (
              <List.Item key={item.id + '=' + index}>
                <Skeleton loading={item.loading} active>
                  <Card
                    hoverable
                    className={styles.card}
                    actions={actions(item, index)}
                    cover={
                      <div>
                        <div style={{backgroundImage: `url(${item.avatar})`}} className={styles.coverWrapper}>
                          <div className={styles.tipWrapper}>
                            <div className={styles.tipContent}>{item.label_name}</div>
                          </div>
                          <div className={styles.headerWrapper}>
                            <div className={styles.header}>
                              <div>{<a>{item.pro_type}</a>}</div>
                              <div>{item.mark}</div>
                            </div>
                          </div>
                        </div>
                        <Select
                          defaultValue="standard" size="large" style={{width: '100%'}}
                          bordered={false} className={styles.cardSelect}
                          onChange={(value) => handleConfigSettings(value, item, index)}
                          showArrow={!!_.head(item?.conf_list)}
                        >
                          <Option value="standard">标准版</Option>
                          <Option value="custom">定制版</Option>
                        </Select>
                      </div>
                    }
                  >
                    <div className={styles.cardContent}>
                      <Paragraph>
                        <ul>
                          {item.desc?.split(/[\s\n]/).map((d, index) => {
                            return (
                              <li key={index + '-' + d + item?.id}>
                                <CheckOutlined style={{color: 'rgb(255, 20, 80)', marginRight: '5px'}}/>
                                <Text style={{color: '#181818'}}>{d}</Text><br/>
                              </li>
                            )
                          })}
                          {customMoreMessage(index)}
                        </ul>
                      </Paragraph>
                      <Divider/>
                      <div style={{fontSize: '16px', color: '#FF6A00'}}>
                        <span>¥</span>
                        {priceDetail(item, index)}
                        <span style={{color: '#181818', marginLeft: '5px'}}>/件起</span>
                      </div>
                    </div>
                  </Card>
                </Skeleton>
              </List.Item>
            );
          }}
        />
      </div>
    </PageHeaderWrapper>
  );
}

export default connect(
  ({
     product,
     loading, user,
   }: {
    product: ProductStateType;
    loading: {
      models: { [key: string]: boolean };
      effects: {
        [key: string]: boolean;
      };
    };
    user: UserModelState;
  }) => ({
    product,
    currentUser: user.currentUser,
    labelList: user.labelList,
    loading: loading.models.product,
    fetch: loading.effects["product/fetch"],
  }),
)(CardList);

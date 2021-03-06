import {parse} from 'querystring';
import pathRegexp from 'path-to-regexp';
import {Route} from '@/models/connect';
import {message} from 'antd';
import _ from 'lodash';
import {ProductBaseListItem} from '@/pages/product/data';
import {CurrentUser} from '@/models/user';
import {ProjectProductionInfoItem} from '@/pages/project/data';
import {UserListItem} from '@/models/data';
import {v4 as uuidv4} from 'uuid';
import {ProductList} from '@/pages/project/service';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const {NODE_ENV} = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */
export const getAuthorityFromRouter = <T extends Route>(
  router: T[] = [],
  pathname: string,
): T | undefined => {
  const authority = router.find(
    ({routes, path = '/'}) =>
      (path && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};

export const getRouteAuthority = (path: string, routeData: Route[]) => {
  let authorities: string[] | string | undefined;
  routeData.forEach(route => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      }
      // exact match
      if (route.path === path) {
        authorities = route.authority || authorities;
      }
      // get children authority recursively
      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

/*
  TODO 校验请求返回
 */
type SuccessResult = {
  msg?: string;
  id?: number;
  [propName: string]: any;
};
type FailResult = string | undefined;

type DetailResult = {
  detail?: string;
  [propName: string]: any;
};

export type ResultType = SuccessResult | FailResult | DetailResult;

abstract class Result {
  _data: ResultType;
  msg: string;
  id: number;
  isSuccess: boolean;

  protected constructor(data: ResultType) {
    const tempMsg: string = (data as SuccessResult)?.msg || '';
    const tempId: number = (data as SuccessResult)?.id || 0;
    const tempDetail: string = (data as DetailResult)?.detail || '';
    if (tempMsg || tempId) {
      this.msg = tempMsg;
      this.id = tempId;
      this.isSuccess = true;
    } else if (tempDetail) {
      this.msg = tempDetail;
      this.id = 0;
      this.isSuccess = false;
    } else {
      this.msg = data as string;
      this.id = 0;
      this.isSuccess = false;
    }
    this._data = data;
  }

  abstract validate(ok: string | null, fail: string | null, fn: Function): boolean;

  get data(): ResultType {
    return this._data;
  }
}

export class ValidatePwdResult extends Result {
  get data(): ResultType {
    return super.data;
  }

  constructor(data: ResultType) {
    super(data);
  }

  validate(ok: string | null, fail: string | null, fn: Function | undefined): boolean {
    fn && fn();
    if (this.isSuccess) {
      if (this.id > 0) {
        message.success(ok || '创建成功');
      } else {
        message.success(ok || this.msg);
      }
    } else {
      message.error(fail || this.msg);
    }
    return this.isSuccess;
  }
}

type SearchParamsType = {
  pageSize?: number;
  current?: number;
  [key: string]: any;
};

// ProTable向python查询添加
export function addIcontains(params?: SearchParamsType): SearchParamsType {
  let returnParams = {pageSize: params?.pageSize, current: params?.current};
  _.forIn(_.omit(params, ['pageSize', 'current', '_timestamp']), (v, k) => {
    returnParams[k + '__icontains'] = v;
  });
  return returnParams;
}

// 鉴别权限
export type IdentityType = 1 | 2 | 3 | 4;

export function identifyUser(type: IdentityType): string {
  if (type === 1) {
    return '管理员';
  } else if (type === 2) {
    return '一级组长';
  } else if (type === 3) {
    return '一级组员';
  } else {
    return '二级组员';
  }
}

// 用户修改项
export type ModifyType = null | 'tel' | 'email';

type ModifyUserInfoType =
  | {
  title: string;
  formData: {
    label: string;
    name: string;
    placeholder: string;
    rule: any;
  }[];
}
  | undefined;

export function getModifyUserComponentProps(type: ModifyType): ModifyUserInfoType {
  switch (type) {
    case 'tel':
      return {
        title: '修改手机号',
        formData: [
          {
            label: '手机号',
            name: type,
            placeholder: '请输入手机号',
            rule: {pattern: /^[1]([3-9])[0-9]{9}$/, message: '格式错误'},
          },
        ],
      };
    case 'email':
      return {
        title: '修改邮箱',
        formData: [
          {
            label: '邮箱',
            name: type,
            placeholder: '请输入邮箱',
            rule: {type: 'email', message: '格式错误'},
          },
        ],
      };
    default:
      return undefined;
  }
}

type CommonResponseBody = {
  count: number;
  results: any[];
  next?: null | string;
  previous?: null | string;
  [propName: string]: any;
};

export function isNormalResponseBody(response: CommonResponseBody): boolean {
  if (Array.isArray(response?.results)) {
    return true;
  } else {
    message.error('请求失败，网络异常！');
    return false;
  }
}

export type ProductType = {
  label: string;
  key: number;
};

export function productType(genre: number) {
  const product = [
    {label: '一体机', key: 1},
    {label: '一体机配件', key: 6},
    {label: '云桶', key: 2},
    {label: '软件', key: 3},
    {label: '服务', key: 7},
    {label: '其他', key: 8},
  ];
  const valueEnumGenre = {};
  switch (genre) {
    case -4:
      return product.slice(2, 5);
    case -3:
      return product.slice(0, 2);
    case -2:
      product.slice(0, 5)?.forEach((i: { key: number; label: any; }) => {
        valueEnumGenre[i.key] = {text: i.label};
      });
      return valueEnumGenre;
    case -1:
      return product.slice(0, 5);
    case 0:
      return product;
    case -5:
      return product.slice(0, 1);
    default:
      return _.head(product.filter(d => d.key === genre))?.label || '';
  }
}

export function addKeyToArray(array: any[], i: number) {
  let j = i;
  const a: any[] = [];
  // array {a:string;b:any[];}[]
  _.forEach(array, (d: { [propName: string]: any }) => {
    const obj = {};
    _.forIn(d, (v, k) => {
      if (Array.isArray(v)) {
        const c = addKeyToArray(v, j + 1);
        obj[k] = c;
      } else {
        obj[k] = v;
      }
      obj['key'] = j;
      j++;
    });
    a.push(obj);
  });
  return a;
}

export function addKeyToEachArray(array: any[]) {
  let i = 0;
  return addKeyToArray(array, i);
}

/**
 * 根据权限对输入item，进行价格string
 * @param item
 */
export const actPrice = (item: any, identity: CurrentUser['identity']): string => {
  const val = item as ProductBaseListItem;
  let result = '';
  switch (identity) {
    case 1:
    case 2:
      result = (val?.leader_price || '').toString();
      break;
    case 3:
      result = (val?.member_price || '').toString();
      break;
    case 4:
      result = (val?.second_price || '').toString();
      break;
    default:
      result = '';
      break;
  }
  return result;
};

export const currentPrice = (item: ProductBaseListItem, identity: CurrentUser['identity']): string => {
  let price = '尚未定价';
  if ((identity === 2 || identity === 1) && item?.leader_price) {
    price = '¥ ' + item?.leader_price;
  } else if (identity === 3 && item?.member_price) {
    price = '¥ ' + item?.member_price;
  } else if (identity === 4 && item?.second_price) {
    price = '¥ ' + item?.second_price;
  }
  return price;
};

export const currentPriceNumber = (item: ProductBaseListItem, identity: CurrentUser['identity']): number => {
  let price = 0;
  if ((identity === 2 || identity === 1) && item?.leader_price) {
    price = parseFloat(item?.leader_price);
  } else if (identity === 3 && item?.member_price) {
    price = parseFloat(item?.member_price);
  } else if (identity === 4 && item?.second_price) {
    price = parseFloat(item?.second_price);
  }
  return price;
};

export const projectType = (pro_status: number) => {
  switch (pro_status) {
    case 1:
      return '进行中';
    case 2:
      return '已下单';
    case 3:
      return '已终止';
    case 4:
      return '审核中';
    case 5:
      return '交付中';
    case 6:
      return '已完成';
    default:
      return '未知状态';
  }
};

export const partitionsData = (data: UserListItem[], identity: IdentityType) => {
  if (identity === 1) {
    const leaderData = data?.filter(d => !d?.pid && d?.identity !== 1);
    const group: UserListItem[] = [];
    _.forEach(leaderData, d => {
      const children = data?.filter(dd => dd?.pid === d?.id);
      group.push({...d, children});
    });
    return group;
  } else {
    return data;
  }

};

// 项目详细列表产品的展示
export const handleProjectListItemData = (product_list: ProjectProductionInfoItem[]) => {
  const list = _.map(product_list, d => {
    const identity = d?.identity;
    const child = _.map(d?.conf_par, dd => ({
      ...dd, identity
    }));
    return (
      {
        uuid: uuidv4(), data: [{
          ...d?.production,
          production: d?.id,
          ..._.omit(d, ['production']),
        }, ...child]
      }
    );
  });

  return list;
};

// 对项目详细列表产品的列表请求数据处理
export const handleProductListInProjectFormData = (
  data: { uuid: string; data: ProductBaseListItem[] }[]): ProductList => {
  const product_list = _.map(data, o => {
    const group = _.head(_.filter(o?.data, d => d?.production > 0));
    const child = _.filter(o?.data, d => !d?.production);
    return (
      {
        production: group?.id, count: group?.count,
        conf_par: _.map(child, d => ({id: d?.id, count: d?.count}))
      }
    );
  }) as ProductList;
  return product_list;
};

/**
 * 前端计算并列的产品
 */
export const calculateProductList = (data: ProductBaseListItem[], identity: IdentityType): number => {
  const group = _.head(_.filter(data, d => d?.production > 0));
  const children = _.filter(data, d => !d?.production);
  const price = parseFloat(actPrice(group, identity));
  const tPrice = _.reduce(children, (sum, n) => {
    const priceItem = parseFloat(actPrice(n, identity)) * (n?.count || 0);
    return sum + priceItem;
  }, 0);
  const hPrice = (price + tPrice) * (group?.count || 1);
  return hPrice;
};

export const calculateAllProductList = (data: { uuid: string; data: ProductBaseListItem[] }[], identity: IdentityType): number => {
  const tPrice = _.reduce(data, (sum, n) => {
    const priceItem = calculateProductList(n?.data, identity);
    return sum + priceItem;
  }, 0);
  return tPrice;
};

/**
 * 其他产品列表的处理
 */

export const calculateOtherList = (data: { name: string; price: string; count: number; }[]) => {
  const tPrice = _.reduce(data, (sum, n) => {
    const priceItem = parseFloat(n?.price || '0') * n?.count;
    return sum + priceItem;
  }, 0);
  return tPrice;
};

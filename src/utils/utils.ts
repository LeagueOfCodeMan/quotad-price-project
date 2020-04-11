import {parse} from 'querystring';
import pathRegexp from 'path-to-regexp';
import {Route} from '@/models/connect';
import {message} from "antd";
import _ from 'lodash';

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
  })
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

type ModifyUserInfoType = {
  title: string;
  formData: {
    label: string;
    name: string;
    placeholder: string;
    rule: any;
  }[];
} | undefined;

export function getModifyUserComponentProps(type: ModifyType): ModifyUserInfoType {
  switch (type) {
    case 'tel':
      return {
        title: '修改手机号',
        formData: [{
          label: '手机号', name: type, placeholder: '请输入手机号',
          rule: {pattern: /^[1]([3-9])[0-9]{9}$/, message: '格式错误'}
        }],

      };
    case 'email':
      return {
        title: '修改邮箱', formData: [{
          label: '邮箱', name: type, placeholder: '请输入邮箱',
          rule: {type: 'email', message: '格式错误'}
        }]
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
}

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
}

export function productType(genre: number) {
  const product = [
    {label: '一体机', key: 1},
    {label: '云桶', key: 2},
    {label: '公有云部署', key: 3},
    {label: '私有云部署', key: 4},
    {label: '传统环境部署', key: 5},
    {label: '一体机配件', key: 6},
    {label: '服务', key: 7},
    {label: '其他', key: 8},
  ];
  switch (genre) {
    case -1:
      return product.slice(0, 5);
    case 0:
      return product;
    default:
      return _.head(product.filter(d => d.key === genre))?.label || '';
  }
}

export function addKeyToArray(array: any[], i: number) {
  let j = i;
  const a: any[] = [];
  // array {a:string;b:any[];}[]
  _.forEach(array, (d: { [propName: string]: any; }) => {
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
    a.push(obj)
  });
  return a;
}

export function addKeyToEachArray(array: any[]) {
  let i = 0;
  return addKeyToArray(array, i);
}

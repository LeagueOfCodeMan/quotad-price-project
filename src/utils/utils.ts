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

type SuccessResult = {
  msg?: string;
  id?: number;
  [propName: string]: any;
};
type FailResult = string | undefined;

export type ResultType = SuccessResult | FailResult;

abstract class Result {
  _data: ResultType;
  msg: string;
  id: number;
  isSuccess: boolean;

  protected constructor(data: ResultType) {
    const tempMsg: string = (data as SuccessResult)?.msg || '';
    const tempId: number = (data as SuccessResult)?.id || 0;
    if (tempMsg || tempId) {
      this.msg = tempMsg;
      this.id = tempId;
      this.isSuccess = true;
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

  validate(ok: string | null, fail: string | null, fn: Function): boolean {
    fn();
    if (this.isSuccess) {
      if (this.id > 0) {
        message.success(ok || '创建成功');
      }else {
        message.success(ok || this.msg);
      }
    } else {
      message.error(fail || this.msg);
    }
    return this.isSuccess;
  }


  public static simplyFailure(fn: Function): false {
    fn();
    message.error('校验失败，请重试');
    return false;
  }

}




/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import {extend} from 'umi-request';
import {notification} from 'antd';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response, data: any }): Response => {
  const {response,data} = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const {status, url} = response;
    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  return data;
};

/**
 * 配置request请求时的默认参数
 */
const requestWithExtend = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  mode: 'cors',
  requestType: 'json',
  headers: {
    Accept: 'application/json',
    //'Content-Type': 'application/json;charset=utf-8',
    // 'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Type': 'application/json;charset=utf-8',
  },
});

/**
 * 封装一次request，使response可以统一校验后使用
 * 不要对undefined进行过滤
 */
const request = async (url: string, options: any = {}, otherOptions: any = {}) => {

  const optionsFinal = stringifyDataBasedOtherOptions(options, otherOptions);
  const result = await requestWithExtend(url, {
    getResponse: true,
    ...optionsFinal,
  }).then(res => {
    if (res?.data) {
      return res?.data;
    } else {
      return res;
    }
  }).catch(e => {
    return e
  });
  console.log(result);
  return result;
};

function stringifyDataBasedOtherOptions(options: any = {}, otherOptions: any = {}) {
  const noticeUndefined: boolean = otherOptions?.noticeUndefined;
  let body;
  if (noticeUndefined && options?.data) {
    body = JSON.stringify(options?.data, (key, value) => {
      switch (true) {
        case typeof value === "undefined":
          return null;
        case typeof value === "symbol":
          return value.toString();
        case typeof value === "function":
          return value.toString();
        default:
          break;
      }
      return value;
    })
  }
  return Object.assign({}, options, body ? {data: body} : {})
}

export default request;

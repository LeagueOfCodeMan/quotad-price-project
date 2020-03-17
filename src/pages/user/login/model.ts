import {AnyAction, Reducer} from 'redux';
import {message} from 'antd';
import {EffectsCommandMap} from 'dva';
import {routerRedux} from 'dva/router';
import {fakeAccountLogin, getFakeCaptcha} from './service';
import {getPageQuery, setAuthority} from './utils/utils';
import {LoginPayload, LoginResultType} from './login';

type statusType = 'ok' | 'error';
type currentAuthorityType = 'guest' | 'user_lv1' | 'user_lv2' | 'user_lv3' | 'user_lv4' | string;

export interface StateType {
  status?: statusType;
  type?: string;
  currentAuthority?: currentAuthorityType;
  errorMessage?: string;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    getCaptcha: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

// 鉴别登录用户权限
const identityUser = (result: LoginResultType, payload: LoginPayload): StateType => {
  let currentAuthority: currentAuthorityType = 'guest';
  let status: statusType = 'error';
  let errorMessage: string = '';
  const type = payload?.type;
  if (result?.id > 0) {
    status = 'ok'
    currentAuthority = `user_lv${result.identity}`
  } else {
    errorMessage = result;
  }

  return {type, status, currentAuthority, errorMessage};
};

const Model: ModelType = {
  namespace: 'userAndlogin',

  state: {
    status: undefined,
  },

  effects: {
    * login({payload}, {call, put}) {
      const response = yield call(fakeAccountLogin, payload);
      const authority = identityUser(response, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: authority,
      });
      console.log(authority);
      // Login successfully
      if (response.id > 0) {
        message.success('登录成功！');
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let {redirect} = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      }
    },

    * getCaptcha({payload}, {call}) {
      yield call(getFakeCaptcha, payload);
    },
  },

  reducers: {
    changeLoginStatus(state, {payload}) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
        errorMessage: payload.errorMessage,
      };
    },
  },
};

export default Model;

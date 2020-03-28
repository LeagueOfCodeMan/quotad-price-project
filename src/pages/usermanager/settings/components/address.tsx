import React, {FC, useState} from 'react';

import {Button, Divider, List, message, Modal} from 'antd';
import {connect} from "react-redux";
import {CurrentUser} from "@/models/user";
import {AddressInfo, AddressListItem} from "@/pages/usermanager/settings/data";
import {ResultType, ValidatePwdResult} from "@/utils/utils";
import AddressModal from "@/pages/usermanager/settings/components/modifyAddress";
import {createAddress, deleteAddress, updateAddress} from "@/pages/usermanager/settings/service";
import ValidatePassword from "@/components/ValidatePassword";
import {testPassword} from "@/services/user";
import {ExclamationCircleOutlined} from "@ant-design/icons/lib";

const {confirm} = Modal;

interface AddressViewProps {
  currentUser?: CurrentUser;
  handleAddressUpdate: () => void;
  addressList?: AddressInfo;

}

const AddressInfo: FC<AddressViewProps> = props => {
  const {addressList, handleAddressUpdate} = props;
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<NotRequired<AddressListItem>>({});
  const [validateVisible, setValidateVisible] = useState(false);

  /**
   * 对地址进行增改
   * @param values
   * @param callback
   */
  const handleAddressDispatch = async (values: AddressListItem, callback: Function) => {
    let response;
    if (current?.id) {
      response = await updateAddress({id: current?.id, data: values});
    } else {
      response = await createAddress(values);
    }
    const success = new ValidatePwdResult(response).validate('操作成功', null, undefined);
    if (success) {
      callback();
      setVisible(false);
      setCurrent({});
      handleAddressUpdate();
    }
  };

  //  =========== 密码校验 ======================
  const onCreate = async (values: { password: string; }) => {
    const hide = message.loading('正在校验密码');
    const result: ResultType | string = await testPassword(values);
    return new ValidatePwdResult(result).validate('校验成功', '校验失败，请重新输入', hide);
  };

  const validatePasswordSuccessToDo = () => {
    const {id, recipients, tel, addr} = current as AddressListItem;
    const hide = () => {
      message.loading('正在删除')
    };
    confirm({
      title: '删除地址',
      icon: <ExclamationCircleOutlined/>,
      content: (<div style={{display: 'flex', flexDirection: 'column'}}>
        <span>收件人：<span>{recipients}</span></span>
        <span>手机号码：<span>{tel}</span></span>
        <span>收货地址：<span>{addr}</span></span>
      </div>),
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const result: ResultType | string = await deleteAddress({id});
        const success: boolean = new ValidatePwdResult(result).validate('删除成功', null, hide);
        // 刷新数据
        if (success) {
          setCurrent({});
        }
      },
      onCancel() {
        setCurrent({});
      },
    });
  }

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        <Button
          type="primary" size="small"
          onClick={() => {
            setVisible(true);
            setCurrent({});
          }}
        >
          添加新地址
        </Button>
      </div>
      <List<Partial<AddressListItem>>
        itemLayout="horizontal"
        dataSource={addressList?.results || []}
        renderItem={item => (
          <List.Item
            actions={
              [<span onClick={() => {
                setVisible(true);
                setCurrent(item);
              }}>编辑</span>,
                <span onClick={() => {
                  setValidateVisible(true);
                  setCurrent(item);
                }}>删除</span>
              ]}
          >
            <List.Item.Meta title={<div>{item.recipients}<Divider type="vertical"/>{item.tel}</div>}
                            description={item.addr}/>
          </List.Item>
        )}>
      </List>
      <ValidatePassword
        visible={validateVisible}
        onCreate={async (values) => {
          const success = await onCreate(values)
          console.log(success);
          if (success) {
            setValidateVisible(false);
            // TODO something
            validatePasswordSuccessToDo();
          }
        }}

        onCancel={() => {
          setValidateVisible(false);
        }}
      />
      <AddressModal
        onSubmit={handleAddressDispatch}
        onCancel={() => {
          setVisible(false);
          setCurrent({});
        }}
        visible={visible}
        current={current}
      />
    </>
  );
}

export default connect(
  ({user}: { user: { currentUser: CurrentUser, addressList: AddressInfo } }) => ({
    currentUser: user.currentUser,
    addressList: user.addressList,
  }),
)(AddressInfo);

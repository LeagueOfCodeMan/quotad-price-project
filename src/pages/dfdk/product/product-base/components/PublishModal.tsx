import React, {useEffect, useState} from 'react';
import {Form, Modal, Typography} from 'antd';
import styles from '@/pages/yuntai.less';
import {ProductBaseListItem} from "@/pages/dfdk/product/data";
import {productType} from "@/utils/utils";
import _ from "lodash";
import {CurrentChildren} from "@/models/data";
import EditableTable from "@/pages/dfdk/product/product-base/components/EditableTable";

const {Text} = Typography;

interface PublishModalProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: ProductBaseListItem, callback: Function) => void;
  onCancel: () => void;
  current?: NotRequired<ProductBaseListItem>;
  users?: NotRequired<CurrentChildren>;
  reload: () => void;
}

const PublishModal: React.FC<PublishModalProps> = props => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const {
    updateModalVisible: visible, users,
    onSubmit: handleAdd, onCancel, current, reload,
  } = props;

  useEffect(() => {
    if (form && !visible && formRef) {
      setTimeout(() => form.resetFields(), 0)

    }
  }, [visible]);


  useEffect(() => {
    if (current && formRef) {
      setTimeout(() => {
        // form.setFieldsValue({
        //   ...current
        // });
      }, 0)
    }
  }, [current]);


  const okHandle = async () => {
    const fieldsValue = await form.validateFields();

    handleAdd(fieldsValue as ProductBaseListItem, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };

  const columns = [

    {
      title: '类型',
      dataIndex: 'genre',
      key: 'genre',
      align: 'center',
      width: 70,
      render: (text: number) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{productType(text)}</Text>
          </div>
        )
      },
    },
    {
      title: '型号',
      dataIndex: 'pro_type',
      key: 'pro_type',
      align: 'center',
      width: 70,
      render: (text: string) => {
        return (
          <div>
            <Text style={{color: '#181818'}}>{text}</Text>
          </div>
        )
      },
    },
    {
      title: '配置类型',
      dataIndex: 'is_required',
      key: 'is_required',
      align: 'center',
      width: 60,
      render: (text: boolean | 0) => {
        return (
          <div style={{textAlign: 'center'}}>
            {text === 0 ? <Text type="warning">标准</Text> : text ?
              <Text style={{color: '#181818'}}>附加</Text> :
              <Text type="danger">选配</Text>
            }
          </div>
        )
      },
    },
    {
      title: '采购价格',
      dataIndex: 'leader_price',
      key: 'leader_price',
      align: 'center',
      width: 100,
      render: (text: string) => (
        <div>
          <Text style={{color: '#1890FF'}}>组长：</Text>
          <Text style={{color: '#FF6A00'}}>¥ {text}</Text>
        </div>
      ),
    },
    {
      title: '一级组员定价',
      dataIndex: 'member_price',
      key: 'member_price',
      width: 100,
      align: 'center',
      editable: true,
      render: (text: string) => {
        return text ? '¥ ' + text : '尚未定价';
      },
    },
  ];

  const dataSource = _.sortBy(current?.conf_list, o => !o.is_required) || [];
  const data = _.concat({..._.omit(current, 'conf_list'), is_required: 0} as ProductBaseListItem, dataSource);
  return (
    <Modal
      title="编辑组员价格"
      visible={visible}
      onOk={okHandle}
      onCancel={() => onCancel()}
      width={720}
      maskClosable={false}
    >
      <div className={styles.formStyleCommon}>
        <EditableTable
          columns={columns}
          dataSource={data || []}
          reload={() => reload()}
        />
      </div>
    </Modal>
  );
};

export default PublishModal;

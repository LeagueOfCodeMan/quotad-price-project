import React, {ReactText, useEffect, useState} from 'react';
import {Alert, Button, Form, Input, InputNumber, Modal, Table, Typography} from 'antd';
import styles from '../../yuntai.less';
import _ from 'lodash';
import Highlighter from 'react-highlight-words';
import {SearchOutlined} from '@ant-design/icons';
import {UsersByProductType} from '@/pages/product';
import {ProductBaseListItem} from '@/pages/product/data';

const {Text} = Typography;

interface PublishModalProps {
  updateModalVisible: boolean;
  onSubmit: (fieldsValue: PublishType, callback: Function) => void;
  onCancel: () => void;
  list?: UsersByProductType[];
  current?: NotRequired<ProductBaseListItem>;
}

export type PublishType = { member_price: string | number; second_price: string | number, user_list?: number[]; };

const formLayout = {
  labelCol: {span: 7},
  wrapperCol: {span: 13},
};

const PublishModal: React.FC<PublishModalProps> = props => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState<any>();
  const [searchInput, setSearchInput] = useState<any>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<ReactText[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');

  const {
    updateModalVisible: visible,
    onSubmit: handleAdd, onCancel, list, current,
  } = props;
  const leader_price = current?.leader_price;

  useEffect(() => {
    if (form && !visible && formRef) {
      setTimeout(() => form.resetFields(), 0);
      setSelectedRowKeys([]);
      setSearchText('');
      setSearchedColumn('');
    }
  }, [visible]);

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    const payload = {
      second_price: fieldsValue?.second_price,
      user_list: selectedRowKeys,
      member_price: fieldsValue?.member_price,
    };
    handleAdd(payload as PublishType, (callback: boolean) => {
      if (callback) {
        form.resetFields();
      }
    });
  };


  const onSelectChange = (selectedRowKeys: ReactText[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const getColumnSearchProps = (dataIndex: string) => ({
    // @ts-ignore
    filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
      <div style={{padding: 8}}>
        <Input
          ref={(ref) => setSearchInput(ref)}
          placeholder={`搜索`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{width: 150, marginBottom: 8, display: 'block'}}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined/>}
          size="small"
          style={{width: 90, marginRight: 8}}
        >
          搜索
        </Button>
        <Button onClick={() => handleReset(clearFilters)} size="small" style={{width: 90}}>
          重置
        </Button>
      </div>
    ),
    filterIcon: (filtered: any) => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
    onFilter: (value: string, record: UsersByProductType) =>
      // @ts-ignore
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        // @ts-ignore
        setTimeout(() => searchInput?.select());
      }
    },
    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{backgroundColor: '#ffc069', padding: 0}}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  const columnsUser: any = [
    {
      title: '二级组员',
      dataIndex: 'username',
      width: 120,
      ...getColumnSearchProps('username'),
    },
    {
      title: '组长采购价',
      dataIndex: 'leader_price',
      width: 120,
      render: (text: string) => (
        <div>
          <Text style={{color: '#FF6A00'}}>¥ {text}</Text>
        </div>
      ),
    },
    {
      title: '二级组员定价',
      dataIndex: 'second_price',
      editable: true,
      width: 120,
      render: (text: string) => {
        return text ? '¥ ' + text : '尚未定价';
      },
    },
  ];


  const handleSearch = (selectedKeys: React.SetStateAction<string>[], confirm: () => void, dataIndex: React.SetStateAction<string>) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };
  console.log(list);
  return (
    <Modal
      title="编辑组员价格"
      visible={visible}
      onOk={okHandle}
      onCancel={() => onCancel()}
      width={480}
      maskClosable={false}
      destroyOnClose={true}
    >
      <div className={styles.formStyleCommon}>
        <Form
          ref={(ref) => setFormRef(ref)} form={form} {...formLayout} style={{marginTop: '10px'}}
          initialValues={{member_price: current?.member_price}}
        >
          <div style={{margin: '0 0 10px 0'}}>
            <Alert
              message="一级组员统一价格"
              type="success"
              closable
            />
          </div>
          <Form.Item
            name="member_price"
            label="一级组员价格"
            rules={[{required: true, message: '请输入二级组员价格'},
              {
                validator: (rule, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (value < (parseFloat(leader_price as string || '') || 0)) {
                    return Promise.reject('组员价格不能低于组长价格');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => (value as string).replace(/¥\s?|(,*)/g, '')}
              min={parseFloat(leader_price as string || '') || 0}
              style={{width: '100%'}}
            />
          </Form.Item>
          <div style={{margin: '0 0 10px 0'}}>
            <Alert
              message="可以多选统一编辑"
              type="success"
              closable
            />
          </div>
          <Table
            rowSelection={rowSelection}
            rowKey={record => record?.id}
            dataSource={list}
            columns={columnsUser}
            pagination={false}
            scroll={{y: 300}}
          />
          <Form.Item
            name="second_price"
            style={{marginTop: '10px'}}
            label="二级组员价格"
            rules={[{required: !!_.head(selectedRowKeys), message: '请输入二级组员价格'},
              {
                validator: (rule, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (value < (parseFloat(leader_price as string || '') || 0)) {
                    return Promise.reject('组员价格不能低于组长价格');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => (value as string).replace(/¥\s?|(,*)/g, '')}
              min={parseFloat(leader_price as string || '') || 0}
              style={{width: '100%'}}
              disabled={!_.head(selectedRowKeys)}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default PublishModal;

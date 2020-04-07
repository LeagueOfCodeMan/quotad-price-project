// import React, {FC, useEffect, useRef, useState} from 'react';
// import {Store} from 'rc-field-form/lib/interface';
// import {Button, Col, Divider, Form, Modal, Row, Select} from 'antd';
// import styles from '../style.less';
// import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons/lib";
// import _ from "lodash";
// import {ProductBaseListItem} from "@/pages/dfdk/product/data";
//
// const {Option} = Select;
//
// interface OperationModalProps {
//   visible: boolean;
//   confList: NotRequired<ProductBaseListItem>;
//   onSubmit: (values: number[], callback: Function) => void;
//   onCancel: () => void;
// }
//
// interface FormListType {
//   label_name: string;
//   conf_id: number;
// }
//
// type FormStore = { fields: FormListType[] }
//
// const ProductCustomConfig: FC<OperationModalProps> = props => {
//   const [form] = Form.useForm();
//   const {visible, confList: current, onCancel, onSubmit} = props;
//   const [formList, setFormList] = useState<FormListType[]>([]);
//   const [configList, setConfigList] = useState<NotRequired<ProductBaseListItem[]>>([]);
//   const formRef = useRef(null);
//
//   useEffect(() => {
//     setTimeout(() => {
//       if (form && !visible) {
//         form.resetFields()
//       }
//     })
//   }, [visible]);
//
//   useEffect(() => {
//     if (current?.results) {
//       const initFormList: FormListType[] = [];
//       current.results.forEach((d) => {
//         const {label_name, id} = d;
//         initFormList.push({label_name, conf_id: id});
//       })
//       setFormList(initFormList);
//     }
//   }, [current]);
//
//   const getModalContent = () => {
//     /**
//      * 当切换Label时，获取对应的配置数据
//      **/
//     const handleLabelChange = async ({value, index}: { value: any, index: number }) => {
//       const result = await queryConfInfo({label_name: value as string, pageSize: 99999});
//       if (_.head(result.results)) {
//         const lastArr: FormListType[] = [...formList] || [];
//         const lastConf: NotRequired<ProductBaseListItem[]> = [...configList] || [];
//         const confList = result.results;
//         const {label_name, id} = confList?.[0];
//         lastArr[index] = {label_name, conf_id: id};
//         lastConf[index] = confList;
//         setFormList(lastArr);
//         setConfigList(lastConf);
//       }
//     };
//
//     /**
//      *  当切换配置时，改变formList
//      * */
//     const handleConfigChange = async (parameters: { value: any, index: number }) => {
//       const {value, index} = parameters;
//       const values = form.getFieldsValue();
//       const lastArr: FormListType[] = [...formList] || [];
//       lastArr[index] = {label_name: values?.[index]?.label_name, conf_id: value as number};
//       setFormList(lastArr);
//     }
//
//     //  拦截生成FormData进行请求，请求完成回调返回结果并显示结果页
//     const onFinish = (values: Store) => {
//       const result = _.zipWith((values as FormStore)?.fields, a => a?.conf_id);
//       if (onSubmit) {
//         onSubmit(result, (success: boolean) => {
//           if (success) {
//             onCancel();
//           }
//         });
//       }
//     };
//
//
//     const labelOptions = labelArr?.map(d => <Option key={d.name} value={d.name} label={d.name}>{d.name}</Option>);
//
//     return (
//       <Form form={form} ref={formRef} className={styles.productCustomConfigForm}
//             initialValues={...formList}
//             onFinish={onFinish}>
//         <Form.List name="fields">
//           {(fields, {add, remove}) => {
//             return (
//               <div className={styles.rowWrapper}>
//                 {fields.map((field, index) => (
//                   <Row key={field.key}>
//                     <Col style={{width: '30%'}}>
//                       <Form.Item
//                         name={[field.name, "label_name"]}
//                         fieldKey={field.fieldKey}
//                         rules={[{required: true, message: '请选择配置类别'}]}
//                       >
//                         <Select
//                           showSearch
//                           placeholder="选择配置类别"
//                           optionFilterProp="children"
//                           filterOption={(input, option) => {
//                             return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
//                           }}
//                           onChange={value => handleLabelChange({value, index})}
//                         >
//                           {labelOptions}
//                         </Select>
//                       </Form.Item>
//                     </Col>
//                     <Col style={{width: '60%'}}>
//                       <Form.Item
//                         shouldUpdate={true}
//                         name={[field.name, "conf_id"]}
//                         fieldKey={field.fieldKey}
//                         rules={[{required: true, message: '清选择配置'}]}
//                       >
//                         <Select
//                           showSearch
//                           dropdownMatchSelectWidth={undefined}
//                           placeholder="选择配置"
//                           optionFilterProp="children"
//                           filterOption={(input, option) => {
//                             return (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
//                           }}
//                           onChange={val => handleConfigChange({value: val, index: index})}
//                         >
//                           {(configList[index])?.map((d: ProductBaseListItem) => <Option key={d.id} value={d.id} label={d.conf_name +'-' + d.conf_mark}>
//                             <div>
//                               <span>{d.conf_name}</span>
//                               <Divider type="vertical"/>
//                               <span>{d.conf_mark}</span>
//                               <Divider type="vertical"/>
//                               <span>{d.con_desc}</span>
//                             </div>
//                           </Option>)}
//                         </Select>
//                       </Form.Item>
//                     </Col>
//                     <Col flex="none">
//                       <MinusCircleOutlined
//                         className="dynamic-delete-button"
//                         onClick={() => {
//                           remove(field.name);
//                         }}
//                       />
//                     </Col>
//                   </Row>
//                 ))}
//                 <Form.Item>
//                   <Button
//                     type="dashed"
//                     onClick={() => {
//                       add();
//                     }}
//                     style={{width: "100%"}}
//                   >
//                     <PlusOutlined/> 添加配置项
//                   </Button>
//                 </Form.Item>
//               </div>
//             );
//           }}
//         </Form.List>
//       </Form>
//     );
//   };
//
//   const handleSubmit = () => {
//     if (!form) return;
//     form.submit();
//   };
//
//   return (
//     <Modal
//       title={'自定义配件'}
//       className={styles.standardListForm}
//       width={640}
//       bodyStyle={{padding: '28px 0 0'}}
//       visible={visible}
//       onOk={handleSubmit}
//       onCancel={onCancel}
//       okText={'保存'}
//       maskClosable={false}
//       forceRender={true}
//     >
//       {getModalContent()}
//     </Modal>
//   );
// };
//
// export default ProductCustomConfig;

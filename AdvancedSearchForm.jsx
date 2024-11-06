import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Row, Col, Select, DatePicker, InputNumber, Checkbox, Radio, theme} from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { useMount } from 'ahooks';
import PropTypes from 'prop-types';
const CheckboxGroup = Checkbox.Group;
const { useToken } = theme
const { Search } = Input;
const { RangePicker } = DatePicker;

const AdvancedSearchForm = ({ searchItems = [], onSearch, selectSearchItems = [], initParams = {}}) => {
    const [form] = Form.useForm();
    const { token } = useToken()

    let initValues = {}
    let initIndeterminate = {}
    let initCheckAll = {}
    searchItems.map(item => {
        initValues[item.name] = []
        initIndeterminate[item.name] = false
        initCheckAll[item.name] = false
    })

    selectSearchItems.map(item => {
        initValues[item.name] = []
    })

    useEffect(() => {
        form.setFieldsValue(initParams);
        if (initParams && Object.keys(initParams).length) {
            handleSearch(initParams);
        }
        
    }, [initParams])
    const [values, setValues] = useState(initValues);
    const [indeterminate, setIndeterminate] = useState(initIndeterminate)
    const [checkAll, setCheckAll] = useState(initCheckAll)



    const handleSearch = (values) => {
        const formattedValues = { ...values };
        console.log(formattedValues);
        searchItems.forEach(item => {
            if (item.type === 'numberRange') {
                if (item.name) {
                    formattedValues[item.name] = {
                        [item.minName]: values[item.name]?.[0] !== undefined ? Number(values[item.name][0]) : undefined,
                        [item.maxName]: values[item.name]?.[1] !== undefined ? Number(values[item.name][1]) : undefined,
                    };
                } else {
                    formattedValues[item.minName] = values[item.minName] !== undefined ? Number(values[item.minName]) : undefined;
                    formattedValues[item.maxName] = values[item.maxName] !== undefined ? Number(values[item.maxName]) : undefined;
                }
            } else if (item.type === 'rangePicker') {
                if (item.name && values[item.name]) {
                    formattedValues[item.name] = [values[item.name][0].format('YYYY-MM-DD'),values[item.name][1].format('YYYY-MM-DD'),]
                } else {
                    formattedValues[item.name] = [];
                }                
            }
        });
        console.log(formattedValues)
        onSearch(formattedValues);
    };

    const handleReset = () => {
        form.resetFields();
        onSearch({});
    };

    const onChange = (name,list) => {
        let searchItem = selectSearchItems.find(item => item.name === name)
        values[name] = list
        indeterminate[name] = !!list.length && list.length < searchItem.options.length
        checkAll[name] = list.length === searchItem.options.length
        setValues({...values});
        setIndeterminate({...indeterminate});
        setCheckAll({...checkAll});
    };
    const onCheckAllChange = (name, e) => {
        console.log(name, e)
        let searchItem = selectSearchItems.find(item => item.name === name)
        let list = e.target.checked ? searchItem.options.map(item => item.value) : []
        console.log(list)
        values[name] = list
        indeterminate[name] = false
        checkAll[name] = e.target.checked
        form.setFieldValue(name, list)
        setIndeterminate({...indeterminate});
        setCheckAll({...checkAll});
    };

    const renderFormItem = (item) => {
        const { type, label, name, options, multiple, minName, maxName } = item;
        switch (type) {
            case 'input':
                return <Input placeholder={`请输入${label}`} allowClear />;
            case 'select':
                return (
                    <Select
                        placeholder={`请选择${label}`}
                        allowClear
                        mode={multiple ? 'multiple' : undefined}
                        showSearch
                        maxTagCount={'responsive'}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }>
                        {options.map((option) => (
                            <Select.Option key={option.value} value={option.value}>
                                {option.label}
                            </Select.Option>
                        ))}
                    </Select>
                );
            case 'datePicker':
                return <DatePicker placeholder={`请选择${label}`} style={{ width: '100%' }} />;
            case 'rangePicker':
                return <RangePicker placeholder={[`开始${label}`, `结束${label}`]} style={{ width: '100%' }} />;
            case 'search':
                return <Search placeholder={`请输入${label}`} allowClear />;
            case 'numberRange':
                return (
                    <Space>
                        <Form.Item name={name ? [name, minName] : minName} noStyle>
                            <InputNumber placeholder='' style={{ width: '100%' }} />
                        </Form.Item>
                        <span>-</span>
                        <Form.Item name={name ? [name, maxName] : maxName} noStyle>
                            <InputNumber placeholder='' style={{ width: '100%' }} />
                        </Form.Item>
                    </Space>
                );
            default:
                return null;
        }
    };

    return (
    <Form form={form} onFinish={handleSearch} layout="horizontal" style={{padding: '10px 10px', background: '#FFF', position: 'relative'
    }}>
        {
            selectSearchItems.map((item) => {
                if (item.type === 'multiselect') {
                    return <div style={{display: 'flex'}} key={item.label}>
                        <div style={{width: '110px', textAlign: 'right', paddingRight: '20px'}}>
                            <div style={{width: '90px', height: '32px', color: "#FFF", backgroundColor: token.colorPrimary,
                                textAlign: "center", lineHeight: '32px'}}>
                            {item.label}
                            </div>
                        </div>
                        <div style={{width: '90px',marginRight: '6px'}}>
                            <Checkbox indeterminate={indeterminate[item.name]} onChange={(e) => onCheckAllChange(item.name, e)}
                                checked={checkAll[item.name]} className='myCheckItem'>
                                全部
                            </Checkbox>
                        </div>
                        <div style={{flexGrow: 1}}>
                            <Form.Item
                                name={item.name}
                                label={null}
                                style={{marginBottom: '10px'}}
                            >
                                <CheckboxGroup className='myCheckGroup' options={item.options} value={values[item.name]} onChange={(list) => onChange(item.name, list)}/>
                            </Form.Item>
                        </div>
                    </div>
                }else if (item.type === 'radioselect') {
                    return <div style={{display: 'flex'}} key={item.label}>
                        <div style={{width: '100px', textAlign: 'right', paddingRight: '20px'}}>
                            {item.label}
                        </div>
                        <div style={{flexGrow: 1}}>
                            <Form.Item name={item.name} label={null}
                                style={{marginBottom: '10px', marginTop: '-4px'}}>
                                <Radio.Group>
                                {
                                    item.options.map(option => <Radio value={option.value} key={option.value}>{option.label}</Radio>)
                                }
                                </Radio.Group>
                            </Form.Item>
                        </div>
                    </div>                    
                }
            })
        }
        {
            searchItems.length?
            <Row gutter={24} align="middle" style={{height: '36px', position: 'relative'}}>
                <Col span={20}>
                    <Space size='large'>
                    {searchItems.map((item) => (
                        <div style={{width:`${item.width||200}px`}} key={item.name || item.minName}>
                            <Form.Item
                                name={item.name || item.minName}
                                label={item.showLabel?item.label:null}
                            >
                                {renderFormItem(item)}
                            </Form.Item>
                        </div>
                    ))}
                    </Space>
                </Col>
            </Row> : null
        }

        <Form.Item style={{position: 'absolute', right: '10px', bottom: '-10px'}}>
            <Space>
                <Button type="primary" htmlType="submit">
                    查询
                </Button>
                <Button onClick={handleReset}>重置</Button>
            </Space>
        </Form.Item>
    </Form>
    );
};

AdvancedSearchForm.propTypes = {
    selectSearchItems: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.oneOf(['multiselect', 'radioselect']).isRequired,
            label: PropTypes.string.isRequired,
            name: PropTypes.string,
            options: PropTypes.arrayOf(
                PropTypes.shape({
                    label: PropTypes.string.isRequired,
                    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                }),
            ),
        }),
    ),    
    searchItems: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.oneOf(['input', 'select', 'datePicker', 'rangePicker', 'search', 'numberRange']).isRequired,
            label: PropTypes.string.isRequired,
            name: PropTypes.string,
            width: PropTypes.number,
            options: PropTypes.arrayOf(
                PropTypes.shape({
                    label: PropTypes.string.isRequired,
                    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                }),
            ),
        }),
    ),
    onSearch: PropTypes.func.isRequired,
};

export default AdvancedSearchForm;
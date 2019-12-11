import React, { Component } from 'react';
import { connect } from 'dva';
import { Menu, Dropdown, Icon, Tooltip } from 'antd';
import styles from './tasktime.less';
import { getCurrentTime,getYearsOfTimeRange,getDayCountOfTimeRange,getMonthsOfTimeRange,getDaysOfTimeRange,getWorkHourCountOfTimeRange } from '@/utils/time'

const viewTypes = [
    {
        viewType: 'day',
        viewTypeName: '按日查看',
    },
    {
        viewType: 'month',
        viewTypeName: '按月查看',
    },
    {
        viewType: 'year',
        viewTypeName: '按年查看',
    },
]
const dayToPxYear = 1 //按年计算时一天对应多少像素
const dayToPxMonth = 8 //按月计算时一天对应多少像素
const hourToPxDay = 12 //按天计算时一小时对应多少像素
const dayToPxDay = 12*9 //按天计算时一天对应多少像素

class TaskTime extends Component{
    constructor(props){
        super(props)
        this.state = {
            viewTypes: viewTypes,
            currentViewType: viewTypes[0],
            taskTimes: [],
            minTime: '',
            maxTime: '',
            scrollTop: 0,
            scrollLeft: 0,
            totalHeight: 0,
            timeData: {
                totalWidth: 0,
                yearData: [], //按年的时候右边头部需要的数据
                monthData: [], //按月的时候右边头部需要的数据
                dayData: [], //按日的时候右边头部需要的数据
            },
            hoverId:'',//鼠标hover的任务ID
            todayOffset: 0, //高亮显示今天
        }
    }
    componentDidMount() {
        this.queryList();
    }
    queryList(){
        this.props.dispatch({
            type: 'time/fetch',
            payload: {},
            callback: (res) => {
                if(res.length > 0){
                    let minTime = res[0].startTime,//最小时间
                        maxTime = res[0].endTime//最大时间
                    res.map(item=>{
                        item.show = true //是否展开
                        item.dayCount = getDayCountOfTimeRange(item.startTime,item.endTime,true)
                        item.hourCount = getWorkHourCountOfTimeRange(item.startTime,item.endTime,true)
                        item.offset = 0
                        if(item.startTime<minTime){
                            minTime = item.startTime
                        }
                        if(item.endTime>maxTime){
                            maxTime = item.endTime
                        }
                        if(item.children){
                            item.children.map(subItem=>{
                                subItem.dayCount = getDayCountOfTimeRange(subItem.startTime,subItem.endTime,true)
                                subItem.hourCount = getWorkHourCountOfTimeRange(subItem.startTime,subItem.endTime,true)
                                subItem.offset = 0
                            })
                        }
                    })
                    this.setState({
                        taskTimes: res,
                        minTime,
                        maxTime,
                        totalHeight: this.getHeight(res),
                    },this.getTimeBarData)
                }

            }
        })
    }
    getHeight(taskTimes){
        let showTaskCount = taskTimes.length
        taskTimes.map(item=>{
            if(item.children && item.show){
                showTaskCount += item.children.length
            }
        })
        return showTaskCount * 30
    }
    getTimeBarData(){
        let taskTimes = this.state.taskTimes
        let timeData = this.state.timeData
        let totalDay = 0
        let currentTime = getCurrentTime()
        let todayOffset = 0
        switch (this.state.currentViewType.viewType) {
            case 'day':
                // 右边头部时间信息                
                let startTime = this.state.minTime.substr(0,7) + '-01 00:00:00'
                let dayData = getDaysOfTimeRange(this.state.minTime,this.state.maxTime)
                dayData.map(item=>{
                    totalDay += item.dayCount
                })
                // 计算右边下面时间条offset信息
                taskTimes.map(item=>{
                    item.offset = getWorkHourCountOfTimeRange(startTime,item.startTime,false)
                    if(item.children){
                        item.children.map(subItem=>{
                            subItem.offset = getWorkHourCountOfTimeRange(startTime,subItem.startTime,false)
                        })
                    }
                })
                // 今天时间条的距离
                todayOffset = getDayCountOfTimeRange(startTime,currentTime.substr(0,10))
                timeData.dayData = dayData
                timeData.totalWidth = totalDay*dayToPxDay
                this.setState({
                    taskTimes,
                    timeData,
                    todayOffset,
                })
                break;
            case 'month':
                let startMonth = this.state.minTime.substr(0,7)
                // 右边头部时间信息
                let monthData = getMonthsOfTimeRange(this.state.minTime,this.state.maxTime)
                monthData.map(item=>{
                    totalDay += item.dayCount
                })
                // 计算右边下面时间条offset信息
                taskTimes.map(item=>{
                    item.offset = getDayCountOfTimeRange(startMonth,item.startTime,false)
                    if(item.children){
                        item.children.map(subItem=>{
                            subItem.offset = getDayCountOfTimeRange(startMonth,subItem.startTime,false)
                        })
                    }
                })
                // 今天时间条的距离
                todayOffset = getDayCountOfTimeRange(startMonth,currentTime.substr(0,10),false)
                timeData.monthData = monthData
                timeData.totalWidth = totalDay*dayToPxMonth
                this.setState({
                    taskTimes,
                    timeData,
                    todayOffset,
                })              
                break;
            case 'year':
                let startYear = this.state.minTime.substr(0,4),
                    yearData = getYearsOfTimeRange(this.state.minTime,this.state.maxTime)
                // 右边头部时间信息
                yearData.map(item=>{
                    totalDay += item.dayCount
                })
                // 计算右边下面时间条offset信息
                taskTimes.map(item=>{
                    item.offset = getDayCountOfTimeRange(startYear,item.startTime,false)*dayToPxYear
                    if(item.children){
                        item.children.map(subItem=>{
                            subItem.offset = getDayCountOfTimeRange(startYear,subItem.startTime,false)*dayToPxYear
                        })
                    }
                })
                // 今天时间条的距离
                todayOffset = getDayCountOfTimeRange(startYear,currentTime.substr(0,10),false)
                timeData.yearData = yearData
                timeData.totalWidth = totalDay
                this.setState({
                    taskTimes,
                    timeData,
                    todayOffset,
                })
                break;
            default:
                break;
        }
    }
    onMenuChange(key){
        if(key.key !== this.state.currentViewType.viewType){
            for (const menuItem of viewTypes) {
                if(menuItem.viewType === key.key){
                    this.setState({
                        currentViewType: menuItem
                    },this.getTimeBarData)
                    break;
                }
            }
        }  
    }
    onTimeBarScroll(){
        let { scrollLeft,scrollTop } = event.target        
        this.refs.topScroll.scrollTo(scrollLeft,0)
        this.refs.leftScroll.scrollTo(0,scrollTop)
    }
    onMenuScroll(){
        let { scrollTop } = event.target
        let { scrollLeft } = this.refs.bodyScroll
        this.refs.bodyScroll.scrollTo(scrollLeft,scrollTop)
    }
    toggleMenu(id){
        let taskTimes = this.state.taskTimes
        for (const task of taskTimes) {
            if (task.id === id) {
                task.show = !task.show
                break             
            }
        }
        this.setState({
            taskTimes,
            totalHeight: this.getHeight(taskTimes)
        })
    }
    setHoverTask(id){
        this.setState({
            hoverId: id,
        })
    }
    render(){
        // 左侧切换按钮
        const menu = (
            <Menu style={{ width: 150 }} onClick={(key)=>this.onMenuChange(key)}>
                {
                    this.state.viewTypes.map((item)=>{
                        let iconCheck = item.viewType === this.state.currentViewType.viewType ? 
                            (<Icon type="check" style={{ float:'right',marginTop:3 }}></Icon>):''
                        return (
                            <Menu.Item key={item.viewType}>{item.viewTypeName} {iconCheck} </Menu.Item>
                        )
                    })
                }
            </Menu>
          )
        // 右侧头部时间
        let top = ''
        if(this.state.currentViewType.viewType === 'day'){  
            top = (
                <div className={styles.timeWrapper} style={{width:this.state.timeData.totalWidth}}>
                    <div className={styles.monthWrapper}>                    
                        {
                            this.state.timeData.dayData.map(item=>{
                                return (
                                    <div className={styles.timeItem} style={{width:item.dayCount*dayToPxDay}} key={`${item.year}${item.month}`}>
                                        <div className={styles.monthBox}>{item.year}年 {item.month}月</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className={styles.dayWrapper}>
                        {
                            this.state.timeData.dayData.map(item=>{
                                return (
                                    item.days.map(subItem=>{
                                        return (
                                            <div className={styles.timeItem} style={{width:dayToPxDay}} key={`${item.year}${item.month}${subItem.date}`}>
                                                <div className={styles.dateBox}>{subItem.date} {subItem.day}</div>
                                            </div>
                                        )
                                    })
                                )
                            })
                        }                        
                    </div>
                </div>
            );
        }else if(this.state.currentViewType.viewType === 'month'){
            top = (
                <div className={styles.timeWrapper} style={{width:this.state.timeData.totalWidth}}>
                    <div className={styles.monthWrapper}>                    
                        {
                            this.state.timeData.monthData.map(item=>{
                                return (
                                    <div className={styles.timeItem} style={{width:item.dayCount*dayToPxMonth}} key={`${item.year}${item.quarter}`}>
                                        <div className={styles.monthBox}>{item.year}年 {item.quarter}季度</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className={styles.dayWrapper}>
                        {
                            this.state.timeData.monthData.map(item=>{
                                return (
                                    item.months.map(subItem=>{
                                        return (
                                            <div className={styles.timeItem} style={{width:subItem.dayCount*dayToPxMonth}} key={`${item.year}${subItem.month}`}>
                                                <div className={styles.dateBox}>{subItem.month}月</div>
                                            </div>
                                        )
                                    })
                                )
                            })
                        }                        
                    </div>
                </div>
            );
        }else if(this.state.currentViewType.viewType === 'year'){
            top =  (
                <div className={styles.timeWrapper} style={{width:this.state.timeData.totalWidth}}>
                    <div className={styles.yearWrapper}>
                        {
                            this.state.timeData.yearData.map(item=>{
                                return (
                                    <div className={styles.timeItem} style={{width:item.dayCount}} key={item.year}>
                                        <div className={styles.yearBox}>{item.year}年</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            )
        }

        // 右侧下面分割线背景
        let bgBar = ''
        if (this.state.currentViewType.viewType === 'day') {
            bgBar = (
                <div className={styles.bgTimeBar} style={{width:this.state.timeData.totalWidth,minHeight:'100%',height:this.state.totalHeight+20}}>
                    {
                        this.state.timeData.dayData.map(item=>{
                            return (
                                item.days.map(subItem=>{
                                    return (
                                        <div className={styles.bgItem} style={{width:dayToPxDay,height:'100%'}} key={`${item.year}${item.month}${subItem.date}`}></div>
                                    )
                                })
                            )
                        })
                    }
                </div>
            )
        }else if(this.state.currentViewType.viewType === 'month'){
            bgBar = (
                <div className={styles.bgTimeBar} style={{width:this.state.timeData.totalWidth,minHeight:'100%',height:this.state.totalHeight+20}}>
                    {
                        this.state.timeData.monthData.map(item=>{
                            return (
                                item.months.map(subItem=>{
                                    return (
                                        <div className={styles.bgItem} style={{width:subItem.dayCount*dayToPxMonth,height:'100%'}} key={`${item.year}${subItem.month}`}></div>
                                    )
                                })
                            )
                        })
                    }
                </div>
            )
        }else if(this.state.currentViewType.viewType == 'year'){
            bgBar = (
                <div className={styles.bgTimeBar} style={{width:this.state.timeData.totalWidth,minHeight:'100%',height:this.state.totalHeight+20}}>
                    {
                        this.state.timeData.yearData.map(item=>{
                            return (
                                <div className={styles.bgItem} style={{width:item.dayCount,height:'100%'}} key={item.year}></div>
                            )
                        })
                    }
                </div>
            )
        }
        let todayBar = ''
        if(this.state.currentViewType.viewType === 'day'){
            todayBar = (
                <div className={styles.todayBar} style={{width:dayToPxDay,left: this.state.todayOffset*dayToPxDay,minHeight:'100%',height:this.state.totalHeight+20}}></div>
            )
        }else if(this.state.currentViewType.viewType === 'month'){
            todayBar = (
                <div className={styles.todayBar} style={{width:dayToPxMonth,left: this.state.todayOffset*dayToPxMonth,minHeight:'100%',height:this.state.totalHeight+20}}></div>
            )
        }else if(this.state.currentViewType.viewType === 'year'){
            todayBar = (
                <div className={styles.todayBar} style={{width:4,left: this.state.todayOffset*dayToPxYear,minHeight:'100%',height:this.state.totalHeight+20}}></div>
            )
        }
        // 右侧下面时间轴
        let bodyBar = ''
        const toolTipOverlayStyle = {
            fontSize: 12,
        }
        if (this.state.currentViewType.viewType === 'day') {
            bodyBar = (
                <div className={styles.timeBar} style={{width:this.state.timeData.totalWidth,minHeight:'100%',height:this.state.totalHeight+20}}>
                    {
                        this.state.taskTimes.map(item=>{
                            let itemWidth = item.hourCount*hourToPxDay
                            const subTimeBars = item.children.map(subItem=>{
                                let subItemWidth = subItem.hourCount*hourToPxDay
                                let toolTip = (
                                    <div>
                                      <div>{subItem.name}</div>
                                      <div>开始：{subItem.startTime.substr(5,11)}</div>
                                      <div>截止：{subItem.endTime.substr(5,11)}</div>
                                    </div>
                                )
                                return (
                                    <div className={subItem.id===this.state.hoverId?`${styles.onHover} ${styles.timeBarItem}`:`${styles.timeBarItem}`} key={subItem.id} onMouseOver={this.setHoverTask.bind(this,subItem.id)} onMouseOut={this.setHoverTask.bind(this,'')}>
                                        <Tooltip title={toolTip} overlayStyle={toolTipOverlayStyle}>
                                            <div className={styles.subTimeInner} style={{width:subItemWidth,marginLeft:subItem.offset*hourToPxDay}}></div>
                                        </Tooltip>                                        
                                    </div>
                                )
                            })
                            let styleObj = item.show ? {} : {display : 'none'}
                            let toolTip = (
                                <div>
                                  <div>{item.name}</div>
                                  <div>开始：{item.startTime.substr(5,11)}</div>
                                  <div>截止：{item.endTime.substr(5,11)}</div>
                                </div>
                            )
                            return (
                                <div key={item.id}>
                                    <div className={styles.timeBarItem}>
                                        <Tooltip title={toolTip} overlayStyle={toolTipOverlayStyle}>
                                            <div className={styles.timeInner} style={{width:itemWidth,marginLeft:item.offset*hourToPxDay}}></div>
                                        </Tooltip>
                                    </div>
                                    <div style={styleObj}>
                                        {subTimeBars}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            )            
        }else if (this.state.currentViewType.viewType === 'month') {
            bodyBar = (
                <div className={styles.timeBar} style={{width:this.state.timeData.totalWidth,minHeight:'100%',height:this.state.totalHeight+20}}>
                    {
                        this.state.taskTimes.map(item=>{
                            let itemWidth = item.dayCount*dayToPxMonth
                            const subTimeBars = item.children.map(subItem=>{
                                let subItemWidth = subItem.dayCount*dayToPxMonth
                                let toolTip = (
                                    <div>
                                      <div>{subItem.name}</div>
                                      <div>开始：{subItem.startTime.substr(5,11)}</div>
                                      <div>截止：{subItem.endTime.substr(5,11)}</div>
                                    </div>
                                )
                                return (
                                    <div className={subItem.id===this.state.hoverId?`${styles.onHover} ${styles.timeBarItem}`:`${styles.timeBarItem}`} key={subItem.id}  onMouseOver={this.setHoverTask.bind(this,subItem.id)} onMouseOut={this.setHoverTask.bind(this,'')}>
                                        <Tooltip title={toolTip} overlayStyle={toolTipOverlayStyle}>
                                        <div className={styles.subTimeInner} style={{width:subItemWidth,marginLeft:subItem.offset*dayToPxMonth}}></div>
                                        </Tooltip>
                                    </div>
                                )
                            })
                            let toolTip = (
                                <div>
                                  <div>{item.name}</div>
                                  <div>开始：{item.startTime.substr(5,11)}</div>
                                  <div>截止：{item.endTime.substr(5,11)}</div>
                                </div>
                            )
                            return (
                                <div key={item.id}>
                                    <div className={styles.timeBarItem}>
                                        <Tooltip title={toolTip} overlayStyle={toolTipOverlayStyle}>
                                            <div className={styles.timeInner} style={{width:itemWidth,marginLeft:item.offset*dayToPxMonth}}></div>
                                        </Tooltip>
                                    </div>
                                    {subTimeBars}
                                </div>
                            )
                        })
                    }
                </div>
            )            
        }else if (this.state.currentViewType.viewType === 'year'){
            bodyBar = (
                <div className={styles.timeBar} style={{width:this.state.timeData.totalWidth,minHeight:'100%',height:this.state.totalHeight+20}}>
                    {
                        this.state.taskTimes.map(item=>{
                            let itemWidth = item.dayCount>4 ? item.dayCount : 4
                            const subTimeBars = item.children.map(subItem=>{
                                let subItemWidth = subItem.dayCount>4 ? subItem.dayCount : 4
                                let toolTip = (
                                    <div>
                                      <div>{subItem.name}</div>
                                      <div>开始：{subItem.startTime.substr(5,11)}</div>
                                      <div>截止：{subItem.endTime.substr(5,11)}</div>
                                    </div>
                                )
                                return (
                                    <div className={subItem.id===this.state.hoverId?`${styles.onHover} ${styles.timeBarItem}`:`${styles.timeBarItem}`} key={subItem.id} onMouseOver={this.setHoverTask.bind(this,subItem.id)} onMouseOut={this.setHoverTask.bind(this,'')}>
                                        <Tooltip title={toolTip} overlayStyle={toolTipOverlayStyle}>
                                            <div className={styles.subTimeInner} style={{width:subItemWidth,marginLeft:subItem.offset}}></div>
                                        </Tooltip>
                                    </div>
                                )
                            })
                            let toolTip = (
                                <div>
                                  <div>{item.name}</div>
                                  <div>开始：{item.startTime.substr(5,11)}</div>
                                  <div>截止：{item.endTime.substr(5,11)}</div>
                                </div>
                            )
                            return (
                                <div key={item.id}>
                                    <div className={styles.timeBarItem}>
                                        <Tooltip title={toolTip} overlayStyle={toolTipOverlayStyle}>
                                            <div className={styles.timeInner} style={{width:itemWidth,marginLeft:item.offset}}></div>
                                        </Tooltip>
                                    </div>
                                    {subTimeBars}
                                </div>
                            )
                        })
                    }
                </div>
            )
        }
        return (
            <div className={styles.timeContainer}>
                <div className={styles.leftAside}>
                    {/* 按什么时间显示 */}
                    <div className={`${styles.top} ${styles.selectBox}`}>
                        <Dropdown overlay={menu} trigger={['click']}>
                            <a className={styles.dropdownLink} href="#">
                            { this.state.currentViewType.viewTypeName } <Icon type="down" />
                            </a>
                        </Dropdown>
                    </div>
                    {/* 左边菜单项 */}
                    <div className={ `${styles.menuBox} ${styles.scrollBarHidden}` } ref='leftScroll' onScroll={()=>this.onMenuScroll()}>
                        <div className={ styles.menuWrapper}>
                            {
                                this.state.taskTimes.map((item)=>{
                                    const subItems = item.children.map(subItem=>{
                                        return (
                                            <li key={subItem.id}  className={subItem.id===this.state.hoverId?styles.onHover:''} onMouseOver={this.setHoverTask.bind(this,subItem.id)} onMouseOut={this.setHoverTask.bind(this,'')}>
                                                <span>{subItem.name}</span>
                                            </li>
                                        )
                                    })
                                    let icon = '',
                                        styleObj = {}
                                    if(item.show){
                                        icon = <Icon type="down-circle" className={styles.menuIcon}></Icon>
                                    }else{
                                        icon = <Icon type="up-circle"></Icon>
                                        styleObj = {display:'none'}                                     
                                    }
                                    return (
                                        <ul className={styles.navMenu} key={item.id}>
                                            <li>
                                                <div className={styles.menuTitle} onClick={this.toggleMenu.bind(this,item.id)}>
                                                    {icon}
                                                    <span>{item.name}</span>
                                                </div>
                                                <ul className={styles.subNavMenu} style={styleObj}>
                                                    {subItems}
                                                </ul>
                                            </li>
                                        </ul>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className={styles.rightMain}>
                    {/* 顶部时间显示 */}
                    <div className={`${styles.top} ${styles.timeBox} ${styles.scrollBarHidden}`} ref='topScroll'>
                        {top}
                    </div>
                    <div className={`${styles.timeBarBox} ${styles.scrollBar}`} ref='bodyScroll' onScroll={()=>this.onTimeBarScroll()}>
                        {/* 分割线背景 */}
                        {bgBar}
                        {/* 当天 */}
                        {todayBar}
                        {/* 时间轴 */}
                        {bodyBar}
                    </div>
                </div>
            </div>
        )
    }
}

function setDatas(state) {
    return {

    }
}
export default connect(setDatas)(TaskTime);
function getDayCountOfMonth(year,month){
    let d = new Date(year, month, 0);
    return d.getDate();
}

function getMonthsOfQuarter(year,quarter){
    let months = [],
        totalDayCount = 0
    for(let j=quarter*3-2;j<=quarter*3;j++){
        let dayCount = getDayCountOfMonth(year,j)
        totalDayCount += dayCount
        months.push({
            month:j,
            dayCount,
        })
    }
    return {
        months,
        dayCount:totalDayCount,
    }  
}

function getDay(year,month,date){
    let mydate = new Date([year,month,date])
    let day = mydate.getDay()
    let weekdays = ["周日","周一","周二","周三","周四","周五","周六"]
    return weekdays[day]
}

function getDaysOfMonth(year,month){
    let maxDay = getDayCountOfMonth(year,month)
    let days = []
    for(let i=1;i<=maxDay;i++){
        days.push({
            date: i,
            day: getDay(year,month,i)
        })
    }
    return {
        days,
        dayCount: maxDay,
    }
}

function  getDayCountOfYear(year) {
    let isLeap = (0===year%4) && (0===year%100) || (0===year%400)
    return isLeap ? 366 : 365
}

export function getCurrentTime(){
    let now = new Date(),
        year = now.getFullYear(),  //年
        month = now.getMonth() + 1, //月
        day = now.getDate(),        //日    
        hh = now.getHours(),        //时
        mm = now.getMinutes()      //分
    
    if(month < 10){
        month = '0' + month
    }
    if(day < 10){
        day = '0' + day
    }
    if(hh < 10){
        hh = '0' + hh
    }  
    if(mm < 0){
        mm = '0' + mm
    }   
    return `${year}-${month}-${day} ${hh}:${mm}` 
}

export function getDayCountOfTimeRange(startTime,endTime,isCountEnd) {
    let start = new Date(startTime.substr(0,10)).valueOf(),
        end = new Date(endTime.substr(0,10)).valueOf(), 
        dayCount = (end-start)/86400/1000
    // offset计算不需要尾巴 时间条长度计算要尾巴为1天
    if( isCountEnd && endTime.substr(11) !== '00:00:00'){
        dayCount += 1
    }
    return dayCount
}

export function getYearsOfTimeRange(startTime,endTime){
    let minYear = startTime.substr(0,4),
        maxYear = endTime.substr(0,4),
        intMinYear = minYear-0,
        intMaxYear = maxYear-0,
        yearData = []
    for(let i=intMinYear; i<=intMaxYear; i++){
        let dateCount = getDayCountOfYear(i)
        yearData.push({
            year: i,
            dayCount: dateCount,
        })
    }
    return yearData
}

export function getMonthsOfTimeRange(startTime,endTime){
    let minYear = startTime.substr(0,4)-0,
        maxYear = endTime.substr(0,4)-0,
        startMonth = startTime.substr(5,2)-0,
        endMonth = endTime.substr(5,2)-0,
        quarters = []
            
    let startQuarter = Math.ceil(startMonth/3)
    let endQuarter = Math.ceil(endMonth/3)

    if(minYear === maxYear){
        for(let i=startQuarter;i<=endQuarter;i++){
            let monthsData = getMonthsOfQuarter(minYear,i)
            quarters.push({
                year: minYear,
                quarter: i,
                ...monthsData
            })

        }
    }else{
        for(let i=startQuarter;i<=4;i++){
            let monthsData = getMonthsOfQuarter(minYear,i)
            quarters.push({
                year: minYear,
                quarter: i,
                ...monthsData,
            })
        }
        for(let j=minYear+1;j<maxYear;j++){
            for(let i=1;i<=4;i++){
                let monthsData = getMonthsOfQuarter(j,i)
                quarters.push({
                    year: maxYear,
                    quarter: i,
                    ...monthsData,
                })
            }
        }
        for(let i=1;i<=endQuarter;i++){
            let monthsData = getMonthsOfQuarter(maxYear,i)
            quarters.push({
                year: maxYear,
                quarter: i,
                ...monthsData,
            })
        }
    }
    return quarters
}

export function getDaysOfTimeRange(startTime,endTime){
    let minYear = startTime.substr(0,4)-0,
        maxYear = endTime.substr(0,4)-0,
        minMonth = startTime.substr(0,7),
        maxMonth = endTime.substr(0,7),
        intMinMonth = minMonth.substr(5,2)-0,
        intMaxMonth = maxMonth.substr(5,2)-0,
        months = []
    if(minYear === maxYear){
        for (let i = intMinMonth; i <= intMaxMonth; i++) {
            let dayData = getDaysOfMonth(minYear,i)
            months.push({
                year: minYear,
                month: i,
                ...dayData,
            })            
        }
    }else{
        for (let i = intMinMonth; i <= 12; i++) {
            let dayData = getDaysOfMonth(minYear,i)
            months.push({
                year: minYear,
                month: i,
                ...dayData,
            })            
        }
        for (let j = minYear+1; j < maxYear; j++) {
            for (let i = 1; i <= 12; i++) {
                let dayData = getDaysOfMonth(j,i)
                months.push({
                    year: j,
                    month: i,
                    ...dayData,
                })            
            }
        }
        for (let i = 1; i <= intMaxMonth; i++) {
            let dayData = getDaysOfMonth(maxYear,i)
            months.push({
                year: maxYear,
                month: i,
                ...dayData,
            })            
        }        
    }
    return months
}
// 朝九晚六
export function getWorkHourCountOfTimeRange(startTime,endTime,isCountEnd){
    let hourCount = 0,
        startDate = startTime.substr(0,10),
        endDate = endTime.substr(0,10),
        intStartHour = startTime.substr(11,2)-0,
        intEndHour = endTime.substr(11,2)-0,
        intEndMinute = endTime.substr(14,2)-0
    // debugger
    // 9点以前开始算9点
    if(intStartHour < 9){
        intStartHour = 9
    }
    // 18点以后开始算一个小时
    if (intStartHour >= 18) {
        intStartHour = 17
    }
    // offset计算不需要尾巴 时间条长度计算要尾巴为1小时
    if(intEndMinute > 0 && isCountEnd){
        intEndHour += 1
    }
    // 早上9点之前结束算一个小时
    if(intEndHour < 9){
        intEndHour = 10
    }
    // 晚上18点之后结束算18点
    if(intEndHour > 18){
        intEndHour = 18
    }
    if(startDate === endDate){
        hourCount += intEndHour - intStartHour
    }else{
        hourCount += 18 - intStartHour
        let dayCount = getDayCountOfTimeRange(startTime,endTime,true)
        hourCount += (dayCount - 2) * (18 - 9)
        hourCount += intEndHour - 9
    }
    return hourCount
}
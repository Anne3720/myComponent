const taskTimes = (req, res) => {
    res.json([
      {
        id: '000000001',
        name: '父任务',
        startTime: '2019-07-01 09:08:00',
        endTime: '2019-10-31 18:08:00',
        children:[
            {
                id: '000000005',
                name: '子任务5',
                startTime: '2019-07-01 09:08:00',
                endTime: '2019-07-02 09:08:00',
            }, 
            {
                id: '000000008',
                name: '子任务8',
                startTime: '2019-07-01 09:08:00',
                endTime: '2019-07-03 09:08:00',
            },         
        ]
      },
      {
        id: '000000002',
        name: '父任务2-你收到了一条新任务，点击查看任务详情',
        startTime: '2019-08-08 09:00:00',
        endTime: '2019-10-05 09:00:00',
        children:[
            {
                id: '000000003',
                name: '子任务3-你收到了一条新任务，点击查看任务详情',
                startTime: '2019-08-08 09:00:00',
                endTime: '2019-09-09 09:00:00',
            }, 
            {
                id: '000000004',
                name: '子任务4',
                startTime: '2019-09-07 12:00:00',
                endTime: '2019-10-05 09:00:00',
            },         
        ]
      },
    ]);
  };
  
  export default {
    'GET /api/taskTimes': taskTimes,
  };
  
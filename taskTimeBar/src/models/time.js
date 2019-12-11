import { getTaskTimes } from '@/services/time';
const TimeModel = {
  namespace: 'time',
  state: {
  },
  effects: {
    *fetch({ callback }, { call, put }) {
      const res = yield call(getTaskTimes);
      if(res){
        callback(res);
      }
    },
  },
  reducers: {
  },
};
export default TimeModel;

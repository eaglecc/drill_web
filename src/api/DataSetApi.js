import request from '@/utils/request'

export function addNewDataSet(data) {
    return request({
      url: 'dataset/addNewDataSet',
      method: 'POST',
      data
    })
}

export function getDataSetLists() {
  return request({
    url: 'dataset/getDataSetList',
    method: 'GET'
  })
}

export function getDataSetByName(data) {
  return request({
    url: 'dataset/getDataSetByName',
    method: 'POST',
    data
  })
}

export function addNewTask(data) {
  return request({
    url: 'task/addNewTask',
    method: 'POST',
    data
  })
}
export function getTaskLists() {
  return request({
    url: 'task/getTaskLists',
    method: 'GET'
  })
}

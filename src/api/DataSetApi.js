import request from '@/utils/request'

export function addNewDataSet(data) {
    return request({
      url: 'dataset/addNewDataSet',
      method: 'POST',
      data
    })
}
<template>
  <div class="dataset-container">
    <el-container class="container-wrapper">
      <el-aside class="aside-wrapper">
        <div class="upload-container">
          <el-upload class="upload-demo" action="" :show-file-list="false" accept=".xls,.xlsx,.csv"
            :before-upload="handleFileUpload">
            <el-button type="primary">上传 Excel 数据文件</el-button>
          </el-upload>
        </div>

        <el-scrollbar class="file-list-scrollbar">
          <ul class="file-list">
            <li v-for="(file, index) in fileList" :key="index" @click="handleFileClick(file)">
              {{ file.name }}
            </li>
          </ul>
        </el-scrollbar>
      </el-aside>

      <el-main class="main-wrapper">
        <el-table v-if="excelData.length" :data="excelData" border stripe :scrollbar-always-on="true">
          <el-table-column v-for="(header, index) in headers" :key="index" :prop="header" :label="header" />
        </el-table>
      </el-main>

    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { addNewDataSet } from '@/api/DataSetApi'

const excelData = ref([]) // 存储解析后的数据
const headers = ref([]) // 存储表头信息
const fileList = ref([]) // 存储上传的文件列表


const handleFileUpload = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)

    reader.onload = async (e) => {
      const binaryStr = new Uint8Array(e.target.result)
      const workbook = XLSX.read(binaryStr, { type: 'array' })

      const sheetName = workbook.SheetNames[0] // 获取第一个工作表
      const sheet = workbook.Sheets[sheetName]
      const dataJson = XLSX.utils.sheet_to_json(sheet, { header: 1 }) // 解析 Excel 数据

      if (dataJson.length > 0) {
        headers.value = dataJson[0] // 第一行是表头
        excelData.value = dataJson.slice(1).map((row) => {
          const rowData = {}
          headers.value.forEach((key, i) => {
            rowData[key] = row[i] || '' // 确保每个字段都有值
          })
          return rowData
        })
        // 将上传的文件添加到文件列表
        fileList.value.push({
          name: file.name,
          data: excelData.value
        })
      }

      // 发送上传Excel文件请求
      try {
        await addNewDataSet(dataJson);
      } catch (error) {
        console.error('上传数据集失败:', error);
      }
      resolve(false) // 让 Element Plus 取消默认上传行为
    }
  })
}

// 新增：处理文件点击事件
const handleFileClick = (file) => {
  excelData.value = file.data
  headers.value = Object.keys(file.data[0] || {})
}

</script>

<style scoped>
.dataset-container {
  height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
}

.container-wrapper {
  height: 100%;
  width: 100%;
}

.aside-wrapper {
  height: 100%;
  width: 20%;
  border-right: 1px solid #e6e6e6;
  background-color: #fff;
}

.upload-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.main-wrapper {
  height: 100%;
  padding: 10px;
  background-color: #fff;
}

.excel-uploader {
  padding: 20px;
}

.file-list-scrollbar {
  height: calc(100% - 100px);
  /* 减去上传按钮区域的高度 */
  margin-top: 10px;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}


.file-list li {
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-list li:hover {
  background-color: #f5f7fa;
}
</style>

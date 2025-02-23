<template>
  <div class="dataset-container">
    <el-container class="container-wrapper" v-loading.fullscreen.lock="tableLoading" element-loading-text="加载中...">
      <el-aside class="aside-wrapper">
        <div class="upload-container">
          <el-upload class="upload-demo" action="" :show-file-list="false" accept=".xls,.xlsx,.csv"
            :before-upload="handleFileUpload">
            <el-button type="primary" class="custom-button">上传Excel数据集文件</el-button>
          </el-upload>
        </div>
        <el-scrollbar class="file-list-scrollbar">
          <p v-for="(file, index) in fileList" :key="index" @click="handleFileClick(file)"
            :class="['scrollbar-item', { 'scrollbar-item-selected': selectedFile === file }]">
            {{ file.name.replace(/^t_dataset_/, '') }}</p>
        </el-scrollbar>
      </el-aside>

      <el-main class="main-wrapper">
        <el-table v-if="excelData.length" :data="excelData" height=100% stripe :scrollbar-always-on="true"
          class="transparent-table">
          <el-table-column v-for="(header, index) in headers" :key="index" :prop="header" :label="header" />
        </el-table>
      </el-main>

    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { addNewDataSet, getDataSetLists, getDataSetByName } from '@/api/DataSetApi'
import { ElMessage, ElMessageBox } from 'element-plus'

const excelData = ref([]) // 存储解析后的数据
const headers = ref([]) // 存储表头信息
const fileList = ref([]) // 存储上传的文件列表
const tableLoading = ref(false) // 表格 loading 状态控制
const selectedFile = ref(null) // 跟踪选中的文件


onMounted(async () => {
  try {
    const res = await getDataSetLists();
    if (res.status === "success") {
      res.data.forEach(tableName => {
        fileList.value.push({ name: tableName })
      })

    } else {
      ElMessage({
        type: 'warning',
        message: '数据集信息获取失败！'
      });
    }
  } catch (error) {
    console.error('获取数据集列表失败:', error);
    ElMessage({
      type: 'error',
      message: '获取数据集列表失败'
    });
  }
})

const handleFileUpload = async (file) => {
  return new Promise((resolve) => {
    tableLoading.value = true  // 开始加载
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
      }

      // 发送上传Excel文件请求
      try {
        const dataSetInfo = {
          tablename: file.name,           // Excel文件名
          sheetName: sheetName,      // 工作表名
          headers: headers.value,     // 表头信息
          data: excelData.value      // 表格数据
        }
        var res = await addNewDataSet(dataSetInfo);
        tableLoading.value = false  // 结束表格加载

        if (res.status === "table already exists") {
          ElMessageBox({
            type: 'warning',
            message: '数据表已存在，请更改文件名后重试'
          })
        } else if (res.status === "success") {
          ElMessage({
            type: 'success',
            message: '数据集上传成功'
          })
        } else {
          ElMessage({
            type: 'error',
            message: '数据集上传失败'
          })
        }
      } catch (error) {
        console.error('上传数据集失败:', error);
      }
      // 将上传的文件添加到文件列表
      const resv = await getDataSetLists();
      if (resv.status === "success") {
        fileList.value = [];
        resv.data.forEach(tableName => {
          fileList.value.push({ name: tableName })
        })
      }
      resolve(false) // 让 Element Plus 取消默认上传行为
    }
  })
}

// 处理文件点击事件
const handleFileClick = async (file) => {
  selectedFile.value = file // 设置选中的文件
  tableLoading.value = true  // 开始加载
  try {
    const dataSetInfo = {
      tableName: file.name,
    }
    var res = await getDataSetByName(dataSetInfo)
    if (res.status === "failed") {
      ElMessageBox({
        type: 'warning',
        message: '获取该数据集失败！'
      })
    } else {
      headers.value = res.data.headers;
      excelData.value = res.data.data;
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取数据失败'
    })
  } finally {
    tableLoading.value = false  // 结束加载
  }
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
  background-image: url('../assets/framebackground.png');
}

.container-wrapper {
  height: 100%;
  width: 100%;

}

.aside-wrapper {
  height: 100%;
  width: 20%;
  border-right: 1px solid #e6e6e6;
  /* background-color: #fff; */
}

.upload-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 新增样式以设置按钮的背景色 */
.custom-button {
  background-color: #4CAF50;
  /* 设置按钮背景色 */
  border-color: #4CAF50;
  /* 设置按钮边框颜色 */
  color: white;
  /* 设置按钮文字颜色 */
}

/* 可选：设置按钮悬停时的背景色 */
.custom-button:hover {
  background-color: #45a049;
  /* 悬停时的背景色 */
  border-color: #45a049;
  /* 悬停时的边框颜色 */
}

.excel-uploader {
  padding: 20px;
}

.file-list-scrollbar {
  height: 80vh;
  margin-top: 10px;
}

.scrollbar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: rgba(255,255,255,0.1);
  color: #E0E0E0;
  user-select: none;
}

.scrollbar-item-selected {
  background-color: rgba(255,255,255,0.5);
  /* 设置选中时的背景色 */
}

.main-wrapper {
  height: 100%;
  padding: 10px;
  /* background-color: #fff; */
}

/* .transparent-table {

} */

/* 让表格背景透明 */

:deep(.el-table) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
}

:deep(.el-table tr) {
  background: transparent !important;
}

:deep(.el-table thead th) {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 700;
}

:deep(.el-table td) {
  background: transparent !important;
  color: white;
}

/* 设置网格线颜色 */
:deep(.el-table .el-table__body tr td) {
  border-right: 1px solid #444444;
  /* 设置单元格右侧边框颜色 */
  border-bottom: 1px solid #444444;
}

:deep(.el-table .el-table__header th) {
  border-right: 1px solid #444444;
  /* 设置表头右侧边框颜色 */
}

:deep(.el-table--striped tr.el-table__row--striped td) {
  background-color: rgba(255, 255, 255, 0.03);
}

:deep(.el-table__body tr:hover > td) {
  background-color: rgba(255, 255, 255, 0.06);
}
</style>

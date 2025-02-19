<template>
  <div class="common-layout">
    <el-container>
      <el-aside style="width: 20%; height: 100%;">
        <el-scrollbar class="file-list-scrollbar">
          <p v-for="(file, index) in fileList" :key="index" @click="handleFileClick(file)"
            :class="['scrollbar-item', { 'scrollbar-item-selected': selectedFile === file }]">
            {{ file.name }}</p>
        </el-scrollbar>
      </el-aside>
      <el-main style="width: 80%; height: 100%;">
        <div ref="chartRef" class="chart-container"></div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getDataSetLists, getDataSetByName } from '@/api/DataSetApi'
import * as echarts from 'echarts';

const fileList = ref([]) // 存储数据集文件列表
const selectedFile = ref(null); // 存储选中的文件
const chartRef = ref(null);
let chartInstance = null;
const tableDataset = ref([
  // ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
  // ['Milk Tea', 56.5, 82.1, 88.7, 70.1, 53.4, 85.1],
  // ['Matcha Latte', 51.1, 51.4, 55.1, 53.3, 73.8, 68.7],
  // ['Cheese Cocoa', 40.1, 62.2, 69.5, 36.4, 45.2, 32.5],
  // ['Walnut Brownie', 25.2, 37.1, 41.2, 18, 33.9, 49.1]
]);

const handleFileClick = async (file) => {
  selectedFile.value = file; // 设置选中的文件
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
      // 处理数据以适应折线图
      const headers = res.data.headers;
      const data = res.data.data;


      // const seriesData = headers.slice(1).map(header => {
      //   return data.map(item => parseFloat(item[header])); // 转换为浮点数
      // });
      const seriesData = headers.slice(1).map(header => {
        const columnData = data.map(item => item[header]); // 提取当前列的数据
        // 将无效数据转换为 0
        return columnData.map(value => {
          const num = parseFloat(value);
          return !isNaN(num) ? num : 0; // 如果有效则返回数字，否则返回 0
        });
      });

      console.log("headers...", headers)
      console.log("seriesData...", seriesData)

      // 找到 "Depth" 的索引并提取数据
      const depthIndex = headers.slice(1).indexOf('Depth'); // 找到 "Depth" 的索引
      console.log("depthIndex..", depthIndex)
      const depthData = seriesData[depthIndex]; // 提取 "Depth" 数据

      // 更新 tableDataset，将 "Depth" 放在第一列
      tableDataset.value = [
        ['Depth', ...depthData], // 将 "Depth" 列放在第一列
        ...seriesData.map((series, index) => {
          if (index !== depthIndex) { // 排除 "Depth" 列
            return [headers[index + 1], ...series];
          }
        }).filter(Boolean) // 过滤掉 undefined
      ];
      console.log("tableDataset...", tableDataset.value)
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取数据失败'
    })
  }
}

const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  updateChart();
};

const updateChart = () => {
  if (!chartInstance) return;

  // 动态生成 series 数组
  const seriesCount = tableDataset.value.length - 1; // 减去第一行（标题行）
  const series = Array.from({ length: seriesCount }, (_, index) => ({
    type: 'line',
    smooth: true,
    seriesLayoutBy: 'row',
    emphasis: { focus: 'series' }
  }));

  const option = {
    legend: { bottom: 0 }, // 图例放置在底部
    tooltip: { trigger: 'axis' },
    dataset: { source: tableDataset.value },
    xAxis: { type: "category" },
    yAxis: { type: "value" },
    grid: { top: '20%', bottom: '15%' },
    series: series
  };
  chartInstance.setOption(option);
};

watch(tableDataset, updateChart, { deep: true });

onMounted(async () => {
  try {
    const res = await getDataSetLists();
    if (res.status === "success") {
      res.data.forEach(tableName => {
        fileList.value.push({ name: tableName })
      })
      // 初始化图表
      initChart();
      window.addEventListener("resize", () => chartInstance?.resize());
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

onBeforeUnmount(() => {
  // 卸载图表
  window.removeEventListener("resize", () => chartInstance?.resize());
  chartInstance?.dispose();
});

</script>

<style scoped>
.common-layout {
  height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
}

.file-list-scrollbar {
  height: 90%;
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
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  user-select: none;
}

.scrollbar-item-selected {
  background-color: var(--el-color-primary-light-5);
  /* 设置选中时的背景色 */
}

.chart-container {
  width: 100%;
  height: 500px;
}
</style>
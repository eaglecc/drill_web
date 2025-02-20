<template>
  <div class="common-layout">
    <el-container>
      <el-aside style="width: 19%; height: 100%;">
        <h3 style="text-align: center; margin: 10px 0; color: #333;">测井数据集列表</h3> 
        <el-scrollbar class="file-list-scrollbar">
          <p v-for="(file, index) in fileList" :key="index" @click="handleFileClick(file)"
            :class="['scrollbar-item', { 'scrollbar-item-selected': selectedFile === file }]">
            {{ file.name.replace(/^t_dataset_/, '') }}</p>
        </el-scrollbar>
      </el-aside>
      <el-main style="width: 80%; height: 100%;">
        <h2 v-if="selectedFile" class="dataset-name"style="text-align: center;">测井数据集{{ selectedFile.name.replace(/^t_dataset_/, '') }}可视化面板</h2>
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
const tableDataset = ref([]);

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
        message: '获取数据集失败！'
      })
    } else {
      // 处理数据以适应折线图
      const headers = res.data.headers;
      const data = res.data.data;
      const seriesData = headers.slice(1).map(header => {
        const columnData = data.map(item => item[header]); // 提取当前列的数据
        // 将无效数据转换为 0
        return columnData.map(value => {
          const num = parseFloat(value);
          return !isNaN(num) ? num : 0; // 如果有效则返回数字，否则返回 0
        });
      });
      // 找到 "Depth" 的索引并提取数据
      const depthIndex = headers.slice(1).findIndex(header =>
        ['Depth', 'TopDepth', 'BotDepth', 'Dep'].includes(header)
      );  // 找到 "Depth" 的索引
      const depthData = seriesData[depthIndex]; // 提取 "Depth" 数据

      // 更新 tableDataset，将 "Depth" 放在第一列
      tableDataset.value = [
        ['DepthXSeries', ...depthData], // 将 "Depth" 列放在第一列
        ...seriesData.map((series, index) => {
          if (index !== depthIndex) { // 排除 "Depth" 列
            return [headers[index + 1], ...series];
          }
        }).filter(Boolean) // 过滤掉 undefined
      ].filter(row => !['Depth', 'TopDepth', 'BotDepth', 'Dep'].includes(row[0])); // 过滤掉指定列
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '图标展示失败！'
    })
  }
}

const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  // updateChart();
};

const updateChart = () => {
  if (!chartInstance) return;

  // 动态生成 series 数组
  const seriesCount = tableDataset.value.length - 1; // 减去第一行
  const series = Array.from({ length: seriesCount }, (_, index) => ({
    name: tableDataset.value[index + 1][0], // 确保名称与 legendData 一致
    type: 'line',
    smooth: true,
    seriesLayoutBy: 'row',
    emphasis: { focus: 'series' }
  }));

  // 动态生成 legend 的数据
  const legendData = tableDataset.value.slice(1).map(row => row[0]); // 获取第一列作为 legend

  const option = {
    legend: {
      bottom: 0,
      data: legendData // 使用动态生成的 legend 数据
    },
    tooltip: { trigger: 'axis' },
    dataset: { source: tableDataset.value },
    xAxis: {
      type: "category",
      name: "深度",
      min: 0,
      axisLine: { // 添加轴线设置
        show: false, // 显示轴线
        lineStyle: {
          type: 'dashed',
          color: '#000', // 轴线颜色
          width: 2 // 轴线宽度
        }
      }
    },
    yAxis: {
      type: "value"
    },
    grid: { top: '10%', bottom: '20%' },
    series: series
  };
  chartInstance.setOption(option, true);
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
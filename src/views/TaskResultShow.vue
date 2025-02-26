<template>
    <div class="common-layout">
        <el-container>
            <el-aside style="width: 19%; height: 100%;">
                <p style="text-align: center; margin: 10px 0; color: #fff; font-size: 20px;">任务列表</p>
                <el-scrollbar class="file-list-scrollbar">
                    <p v-for="(task, index) in taskList" :key="index" @click="handleTaskClick(task)"
                        :class="['scrollbar-item', { 'scrollbar-item-selected': selectedTask === task }]">
                        {{ task.createdAt }} --- {{ task.type }} </p>
                </el-scrollbar>
            </el-aside>
            <el-main style="width: 80%; height: 100%;">
                <div v-if="selectedTask.type === '未钻地层预测'">
                    <h1 style="text-align: center; color: #fff;"> 未钻地层预测 </h1>
                </div>
                <div v-if="selectedTask.type === '缺失补全'">
                    <h1 style="text-align: center; color: #fff;"> 缺失补全 </h1>
                </div>
                <div v-if="selectedTask.type === '井径矫正'">
                    <h1 style="text-align: center; color: #fff;"> 井径矫正 </h1>
                </div>

                <div v-if="selectedTask.type === '岩性识别'">
                    <h1 style="text-align: center; color: #fff;"> 岩性识别结果 </h1>

                    <!-- 1. 显示输入的测井曲线数据 -->
                    <el-row :gutter="20" style="margin-top: 20px;">
                        <el-col :span="12">
                            <el-card :body-style="{ padding: '20px' }">
                                <h3>测井曲线数据</h3>
                                <el-table :data="wellLogData" style="width: 100%; max-height: 400px; overflow-y: auto;">
                                    <el-table-column v-for="(key, index) in Object.keys(wellLogData[0])" :key="index"
                                        :prop="key" :label="key" :width="key === 'Depth' ? '150' : ''" />
                                </el-table>
                            </el-card>
                        </el-col>
                        <el-col :span="12">
                            <el-card :body-style="{ padding: '20px' }">
                                <h3>岩性识别结果</h3>
                                <el-table :data="lithologyResults"
                                    style="width: 100%; max-height: 400px; overflow-y: auto;">
                                    <el-table-column v-for="(key, index) in Object.keys(lithologyResults[0])"
                                        :key="index" :prop="key" :label="key" :width="key === 'depth' ? '100' : ''" />
                                    <!-- 新增图片列 -->
                                    <!-- <el-table-column label="图片" width="150">
                                        <template slot-scope="scope">
                                            <el-image style="width: 100px; height: 100px" :src="imgUrl" :zoom-rate="1.2"
                                                :max-scale="7" :min-scale="0.2" :preview-src-list="srcList"
                                                show-progress :initial-index="4" fit="cover" />
                                        </template>
                                    </el-table-column> -->
                                </el-table>
                            </el-card>
                        </el-col>
                    </el-row>

                    <!-- 2. 显示岩性识别的图表 -->
                    <!-- <div ref="predChartRef" class="chart-container" style="height: 300px;"></div> -->

                </div>

                <!-- 任务信息展示 -->
                <div class="task-info"
                    v-if="selectedTask.type === '未钻地层预测' || selectedTask.type === '缺失补全' || selectedTask.type === '井径矫正' || selectedTask.type === '岩性识别'">
                    <el-row :gutter="20"> <!-- 设置列间距 -->
                        <el-col :span="12" class="task-info-col">
                            <p><strong>任务类型：</strong> {{ selectedTask.type }}</p>
                        </el-col>
                        <el-col :span="12" class="task-info-col">
                            <p><strong>创建时间：</strong> {{ selectedTask.createdAt }}</p>
                        </el-col>
                        <el-col :span="12" class="task-info-col">
                            <p><strong>任务状态：</strong> {{ selectedTask.status }}</p>
                        </el-col>
                        <el-col :span="12" class="task-info-col">
                            <p><strong>数据集：</strong> {{ selectedTask.datasets }}</p>
                        </el-col>
                        <el-col :span="12" class="task-info-col">
                            <p><strong>输入曲线种类：</strong> {{ selectedTask.inputWellLogKinds }}</p>
                        </el-col>
                        <el-col :span="12" class="task-info-col">
                            <p><strong>输出曲线种类：</strong> {{ selectedTask.outputWellLogKinds }}</p>
                        </el-col>
                        <el-col :span="12" class="task-info-col">
                            <p><strong>使用模型：</strong> {{ selectedTask.model }}</p>
                        </el-col>
                    </el-row>
                </div>

                <!-- 预测任务的图表 -->
                <div ref="predChartRef" class="chart-container"></div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getTaskLists, getTaskResByID } from '@/api/DataSetApi'
import * as echarts from 'echarts';

const taskList = ref([])
const selectedTask = ref([{ type: '' }]);
const predChartRef = ref(null);
let chartInstance = null;
const xAxisData = ref([])
let minXValue = 0
let maxXValue = 0
let randomArea1Start = 0
let randomArea1End = 0
let randomArea2Start = 0
let randomArea2End = 0

const seriesData = ref([])

const wellLogData = ref([
    { depth: 100, curve1: 2.3, curve2: 4.5 },
    { depth: 200, curve1: 2.7, curve2: 4.1 },
    // 其他测井数据
])
const lithologyResults = ref([
    { depth: 100, lithology: '砂岩' },
    { depth: 200, lithology: '页岩' },
    // 其他岩性识别结果
])


const handleTaskClick = async (task) => {
    console.log("task...", task)
    selectedTask.value = task;
    const dataInfo = {
        taskId: selectedTask.value.id
    }
    const res = await getTaskResByID(dataInfo);
    console.log("查询结果。。。", res)
    if (res.status === "success") {
        ElMessage({
            type: 'success',
            message: '获取任务结果成功！'
        })
        if (selectedTask.value.type === '未钻地层预测' || selectedTask.value.type === '缺失补全' || selectedTask.value.type === '井径矫正') {
            xAxisData.value = []
            seriesData.value = []
            res.data.forEach(item => {
                xAxisData.value.push(item.Depth)
                seriesData.value.push(item.trueData)
            })
            minXValue = Math.min(...xAxisData.value);  // 获取 xAxisData 中的最小值
            maxXValue = Math.max(...xAxisData.value);  // 获取 xAxisData 中的最大值
            randomArea1Start = minXValue + 50
            randomArea1End = randomArea1Start + 100
            randomArea2Start = randomArea1End + 400
            randomArea2End = randomArea2Start + 80
            initChart();

        } else if (selectedTask.value.type === '岩性识别') {
            if (chartInstance) {
                chartInstance.dispose();
            }
            wellLogData.value = []
            lithologyResults.value = []
            const allKeys = Object.keys(res.data[0])
            // 删除等于 'Facies、Formation' 和 'PredFacies' 的项
            const filteredKeys = allKeys.filter(key => key !== 'Facies' && key !== 'PredFacies' && key !== 'Formation' && key !== 'taskID' && key !== 'trueFacies');
            res.data.forEach(item => {
                let newData = {}
                filteredKeys.forEach(key => {
                    newData[key] = item[key];
                })
                wellLogData.value.push(newData)

                const faciesValue = parseInt(item.Facies, 10); // 10 表示十进制
                let FaciesC = ""
                if (faciesValue === 1) {
                    FaciesC = "砂岩：由砂粒（0.0625–2mm）胶结而成的沉积岩，常见于河流、湖泊和海洋环境"
                } else if (faciesValue === 2) {
                    FaciesC = "砂页岩：介于砂岩和页岩之间，含砂粒较多但具有页岩的层理特征"
                } else if (faciesValue === 3) {
                    FaciesC = "泥岩：由极细的泥质颗粒沉积形成，颗粒大小小于0.0625mm，质地致密"
                } else if (faciesValue === 4) {
                    FaciesC = "碳酸岩：主要由碳酸盐矿物（如方解石、白云石）组成，多见于海洋或湖泊沉积环境"
                }
                console.log("Facies...", FaciesC)
                lithologyResults.value.push({ depth: item.Depth, lithology: FaciesC })
            })
            console.log("welllogData..", wellLogData.value)
            console.log("lith..", lithologyResults.value)
        }
        return
    } else {
        ElMessage({
            type: 'error',
            message: '获取任务结果失败！'
        })
    }

}

const initChart = () => {
    if (!predChartRef.value) return;
    chartInstance = echarts.init(predChartRef.value);
    // ECharts 配置项
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        toolbox: {
            show: true,
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'value',  // 深度是连续的数值，所以改为 'value'
            name: 'Depth (m)',  // x 轴名称
            nameLocation: 'middle',  // 轴标题位置
            nameGap: 25,  // 轴标题与轴的间距
            min: 'dataMin',  // 设置最小值为数据中的最小值
            max: 'dataMax',   // 设置最大值为数据中的最大值
            axisLabel: {  // 添加坐标轴标签样式
                color: '#fff',  // 设置坐标轴标签颜色为白色
            },
            nameTextStyle: {  // 设置轴名称样式
                color: '#fff'  // 设置轴名称颜色为白色
            }
        },
        yAxis: {
            type: "value",
            axisLabel: {  // 添加坐标轴标签样式
                color: '#fff',  // 设置坐标轴标签颜色为白色
            },
        },
        series: [
            {
                name: selectedTask.value.outputWellLogKinds,
                type: 'line',
                smooth: true,
                data: xAxisData.value.map((depth, index) => [depth, seriesData.value[index]]),
                itemStyle: {  // 添加 itemStyle 属性
                    color: '#3cdc0f'  // 设置线条颜色为红色（可以根据需要更改颜色）
                },
                markArea: {
                    itemStyle: {
                        color: 'rgba(255, 173, 177, 0.4)'
                    },
                    label: {
                        show: true,  // 显示标签
                        color: '#fff',  // 标签字体颜色
                        fontSize: 14,  // 标签字体大小
                    },
                    data: [
                        [
                            { name: selectedTask.value.type + "区域", xAxis: randomArea1Start },  // 第一个区域的左端
                            { xAxis: randomArea1End }  // 第一个区域的右端
                        ],
                        [
                            { name: selectedTask.value.type + "区域", xAxis: randomArea2Start },  // 第二个区域的左端
                            { xAxis: randomArea2End }  // 第二个区域的右端
                        ]
                    ]
                }
            }
        ]
    }
    chartInstance.setOption(option);
};

onMounted(async () => {
    try {
        const res = await getTaskLists();
        if (res.status === "success") {
            console.log("res...", res)
            taskList.value = []
            res.data.forEach(data => {
                if (data.status === 'completed') { // 仅展示完成的任务
                    let dataTime = data.CreatedAt.substring(0, 10).replace('T', ' ');

                    let dataType = ''
                    if (data.taskkinds === 'prediction') {
                        dataType = "未钻地层预测"
                    } else if (data.taskkinds === 'completion') {
                        dataType = "缺失补全"
                    } else if (data.taskkinds === 'correction') {
                        dataType = "井径矫正"
                    } else if (data.taskkinds === 'recognize') {
                        dataType = "岩性识别"
                    }

                    let dataStatus = ''
                    if (data.status === 'nostart') {
                        dataStatus = "未开始"
                    } else if (data.status === 'completed') {
                        dataStatus = "已完成"
                    } if (data.status === 'inprogress') {
                        dataStatus = "进行中"
                    }
                    taskList.value.push({
                        id: data.ID,
                        createdAt: dataTime,
                        type: dataType,
                        status: dataStatus,
                        outputWellLogKinds: data.outputwelllogkinds,
                        inputWellLogKinds: data.inputwelllogkinds,
                        datasets: data.datasets,
                        model: data.selectedmodel
                    },)
                }
            })

        } else {
            ElMessage({
                type: 'warning',
                message: '任务信息为空，请先新建任务！'
            });
        }
    } catch (error) {
        console.error('获取任务列表失败:', error);
        ElMessage({
            type: 'error',
            message: '获取任务列表失败'
        });
    }
})
// 监听数据变化，局部更新图表
//   watch(
//     () => [chartData.xAxisData, chartData.seriesData],
//     () => {
//       myChart.setOption({
//         series: [{
//           data: chartData.xAxisData.map((depth, index) => [depth, chartData.seriesData[index]])
//         }]
//       })
//     }
//   )

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
    background-image: url('../assets/framebackground.png');
}

.file-list-scrollbar {
    height: 80vh;
    margin-top: 10px;
}

.scrollbar-item {
    display: flex;
    align-items: center;
    /* justify-content: center; */
    padding-left: 30px;
    height: 50px;
    margin: 10px;
    text-align: center;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: #E0E0E0;
    user-select: none;
}

.scrollbar-item-selected {
    background-color: rgba(255, 255, 255, 0.5);
    /* 设置选中时的背景色 */
}

.chart-container {
    width: 100%;
    height: 500px;
}

.task-info {
    margin-top: 20px;
    /* 与图表的间距 */
    padding: 10px;
    /* 内边距 */
    background-color: rgba(255, 255, 255, 0.1);
    /* 背景色 */
    color: #fff;
    /* 字体颜色 */
    border-radius: 5px;
    /* 圆角边框 */
}

.task-info-col {
    margin-bottom: 15px;
    /* 设置每行的间距 */
}

.task-info p {
    margin: 0;
    /* 去掉段落的默认外边距 */
}
</style>
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
                    <div v-if="selectedTask.type === '岩性识别'">
                        <h1 style="text-align: center; color: #333;">岩性识别结果</h1>

                        <!-- 1. 显示输入的测井曲线数据 -->
                        <el-row :gutter="20" style="margin-bottom: 20px;">
                            <el-col :span="12">
                                <el-card :body-style="{ padding: '20px' }">
                                    <h3>测井曲线数据</h3>
                                    <el-table :data="wellLogData" style="width: 100%">
                                        <el-table-column prop="depth" label="深度" width="150" />
                                        <el-table-column prop="curve1" label="曲线1" />
                                        <el-table-column prop="curve2" label="曲线2" />
                                        <!-- 添加更多的列来展示其他测井曲线数据 -->
                                    </el-table>
                                </el-card>
                            </el-col>
                            <el-col :span="12">
                                <el-card :body-style="{ padding: '20px' }">
                                    <h3>岩性识别结果</h3>
                                    <el-table :data="lithologyResults" style="width: 100%">
                                        <el-table-column prop="depth" label="深度" width="150" />
                                        <el-table-column prop="lithology" label="识别岩性" />
                                        <!-- 展示识别出的岩性类型 -->
                                    </el-table>
                                </el-card>
                            </el-col>
                        </el-row>

                        <!-- 2. 显示岩性识别的图表 -->
                        <!-- <div ref="predChartRef" class="chart-container" style="height: 300px;"></div> -->

                    </div>
                </div>
                <div ref="predChartRef" class="chart-container"></div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getTaskLists } from '@/api/DataSetApi'
import * as echarts from 'echarts';

const taskList = ref([])
const selectedTask = ref([{ type: '' }]);
const predChartRef = ref(null);
let chartInstance = null;
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


const handleTaskClick = (task) => {
    console.log("task...", task)
    selectedTask.value = task;
    if (selectedTask.type === '未钻地层预测' || selectedTask.type === '缺失补全' || selectedTask.type === '井径矫正') {
        initChart();
    } else if (selectedTask.type === '岩性识别') {

    }
}

const initChart = () => {
    console.log("predChartRef.value...", predChartRef.value)
    if (!predChartRef.value) return;
    chartInstance = echarts.init(predChartRef.value);

    chartInstance.setOption({
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [150, 230, 224, 218, 135, 147, 260],
                type: 'line'
            }
        ]
    });
};

onMounted(async () => {
    try {
        const res = await getTaskLists();
        if (res.status === "success") {
            console.log("res...", res)
            taskList.value = []
            res.data.forEach(data => {
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
                taskList.value.push({ id: data.ID, createdAt: dataTime, type: dataType, status: dataStatus },)
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
</style>
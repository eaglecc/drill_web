<template>
    <div class="container">
        <!-- 主界面Step组件 -->
        <div class="steps-wrapper">
            <div class="steps-container">
                <el-steps :active="activeStep" align-center>
                    <el-step title="Step 1" description="选择任务"></el-step>
                    <el-step title="Step 2" description="选择测井曲线数据集"></el-step>
                    <el-step title="Step 3" description="选择模型"></el-step>
                    <el-step title="Step 4" description="选择输入测井曲线"></el-step>
                    <el-step
                        v-if="selectedTask === 'prediction' || selectedTask === 'completion' || selectedTask === 'correction'"
                        title="Step 5" :description="getDescription()"></el-step>
                    <el-step :title="getTitle()" description="确认提交"></el-step>
                </el-steps>

                <div class="step-content">

                    <div v-if="activeStep === 0" class="taskdiv">
                        <el-radio-group v-model="selectedTask" class="task-selection">
                            <el-radio-button v-for="task in tasks" :key="task.value" :label="task.value">
                                <div class="task-card" :class="{ 'is-selected': selectedTask === task.value }">
                                    <!-- 添加条件类 -->
                                    <el-icon size="24px" class="task-icon"
                                        :class="{ 'is-selected-icon': selectedTask === task.value }">
                                        <component :is="task.icon"></component>
                                    </el-icon>
                                    <h3>{{ task.label }}</h3>
                                    <p class="task-description"
                                        :class="{ 'is-selected-description': selectedTask === task.value }">{{
                                            task.description }}</p>
                                </div>
                            </el-radio-button>
                        </el-radio-group>
                    </div>
                    <div v-if="activeStep === 1">
                        <p style="text-align: center;font-size: 20px; color: #fff; margin-bottom: 30px;">请选择测井数据集</p>
                        <el-select v-model="selectedDatasets" placeholder="请选择数据集" size="large">
                            <el-option v-for="item in datasets" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </div>
                    <div v-if="activeStep === 2">
                        <div v-if="selectedTask === 'prediction'">
                            <PredModelSelect @update-message="updatePredictModel" />
                        </div>
                        <div v-else-if="selectedTask === 'completion'">
                            <PredModelSelect @update-message="updatePredictModel" />
                        </div>
                        <div v-else-if="selectedTask === 'correction'">
                            <PredModelSelect @update-message="updatePredictModel" />
                        </div>
                        <div v-else-if="selectedTask === 'recognize'">
                            <RecognitionModelSelectComponent @update-message="updatePredictModel" />
                        </div>

                    </div>
                    <div v-if="activeStep === 3">
                        <el-transfer v-model="inputWellLogKinds" :data="wellLogKinds" filterable
                            :titles="['可选测井曲线种类', '已选测井曲线种类']" :button-texts="['移除', '选择']" />
                    </div>
                    <div
                        v-if="activeStep === 4 && (selectedTask === 'prediction' || selectedTask === 'completion' || selectedTask === 'correction')">
                        <el-transfer v-model="outputWellLogKinds" :data="wellLogKinds" filterable
                            :titles="['可选测井曲线种类', '已选测井曲线种类']" :button-texts="['移除', '选择']" />
                    </div>

                    <div v-if="((activeStep === 5 && (selectedTask === 'prediction' || selectedTask === 'completion' || selectedTask === 'correction'))
                        || (activeStep === 4 && selectedTask === 'recognize'))"
                        style="display: flex; align-items: center; justify-content: center; width: 100%;">
                        <el-form label-width="auto" label-position="left" style="width: 60%; ">
                            <el-form-item label="选择的任务:" label-position="left">
                                <el-input :value="getTaskLabel(selectedTask)" readonly />
                            </el-form-item>
                            <el-form-item label="已选择的数据集:" label-position="left">
                                <el-input :value="getDatasetLabels(selectedDatasets)" readonly />
                            </el-form-item>
                            <el-form-item label="选择的模型:" label-position="left">
                                <el-input :value="selectedModel" readonly />
                            </el-form-item>
                            <el-form-item label="输入测井曲线:" label-position="left">
                                <el-input :value="getWellLogLabel(inputWellLogKinds)" readonly />
                            </el-form-item>
                            <el-form-item
                                v-if="selectedTask === 'prediction' || selectedTask === 'completion' || selectedTask === 'correction'"
                                label="输出测井曲线:" label-position="left">
                                <el-input :value="getWellLogLabel(outputWellLogKinds)" readonly />
                            </el-form-item>

                        </el-form>
                    </div>
                </div>

                <div class="step-actions">
                    <el-button @click="prevStep" :disabled="activeStep === 0">上一步</el-button>
                    <el-button type="primary" @click="nextStep"
                        v-if="(activeStep != 4 || (activeStep === 4 && selectedTask != 'recognize'))">下一步</el-button>
                    <el-button type="primary" @click="confirm"
                        v-if="(activeStep === 5 || (activeStep === 4 && selectedTask === 'recognize'))">提交</el-button>
                </div>
            </div>
        </div>

        <!-- 抽屉按钮组件 -->
        <el-button class="open-drawer-button" type="success" @click="openDrawer()">打开任务列表</el-button>

        <!-- el-drawer 组件 -->
        <el-drawer title="任务列表" v-model="drawerVisible" size="30%" @close="drawerVisible = false">
            <el-scrollbar style="height: 100%;">
                <ul class="task-list">
                    <li v-for="task in tasksLists" :key="task.id" class="task-item">
                        <div class="task-details">
                            <span class="task-time">{{ task.createdAt }}</span>
                            <span class="task-type">{{ task.type }}</span>
                            <span class="task-status"
                                :class="{ 'completed': task.status === '已完成', 'no-start': task.status === '未开始' }">
                                <template v-if="task.status === '已完成'">
                                    {{ task.status }}
                                </template>
                                <template v-if="task.status === '未开始'">
                                    {{ task.status }}
                                </template>
                                <template v-if="task.status === '进行中'">
                                    <el-progress type="circle" :percentage="percentage" :color="colors"
                                        :stroke-width="5" :width="60" />
                                </template>
                            </span>
                        </div>
                    </li>
                </ul>
            </el-scrollbar>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from 'element-plus'
import { DataLine, TrendCharts, DataAnalysis, HelpFilled } from '@element-plus/icons-vue'  // 添加这行导入语句
import { addNewTask, getDataSetLists, getTaskLists } from '@/api/DataSetApi'
import PredModelSelect from '@/components/PredModelSelectComponent.vue'
import RecognitionModelSelectComponent from "@/components/RecognitionModelSelectComponent.vue";

const activeStep = ref(0);
// 数据集选择穿梭框所需的数据j
const datasets = ref([]);
const selectedDatasets = ref('');

// 测井曲线种类穿梭框数据
const wellLogKinds = ref([
    { key: 1, label: 'CAL' },
    { key: 2, label: 'GR' },
    { key: 3, label: 'SP' },
    { key: 4, label: 'LLD' },
    { key: 5, label: 'LLS' },
    { key: 6, label: 'AC' },
    { key: 7, label: 'DEN' },
    { key: 8, label: 'PEF' },
    { key: 9, label: 'Lith_Section' },
    { key: 10, label: 'ILD_log10' },
    { key: 11, label: 'DeltaPHI' },
    { key: 12, label: 'PHIND' },
    { key: 13, label: 'PE' },
    { key: 14, label: 'NM_M' },
    { key: 15, label: 'RELPOS' },
]);

const inputWellLogKinds = ref([]);
const outputWellLogKinds = ref([]);

// 任务选择
const selectedTask = ref('');
// 模型选择
const selectedModel = ref('');
const tasks = ref([
    {
        value: 'prediction',
        label: '未钻地层预测',
        icon: DataLine,
        description: '利用已有测井数据预测未钻地层的测井曲线'
    },
    {
        value: 'completion',
        label: '缺失补全',
        icon: TrendCharts,
        description: '对测井曲线中的缺失数据进行智能补全'
    },
    {
        value: 'correction',
        label: '井径矫正',
        icon: DataAnalysis,
        description: '对测井曲线进行井径校正优化'
    },
    {
        value: 'recognize',
        label: '岩性识别',
        icon: HelpFilled,
        description: '利用测井曲线及智能算法进行岩性识别'
    }
]);
const drawerVisible = ref(false); // 控制抽屉的显示与隐藏
const tasksLists = ref([]);
// 进度条进度
const percentage = ref(0)
// 进度条颜色
const colors = [
    { color: '#f56c6c', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#5cb87a', percentage: 60 },
    { color: '#1989fa', percentage: 80 },
    { color: '#6f7ad3', percentage: 100 },
]

onMounted(async () => {
    try {
        const res = await getDataSetLists();
        if (res.status === "success") {
            res.data.forEach(tableName => {
                datasets.value.push({ value: tableName, label: tableName.replace(/^t_dataset_/, '') })
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

// 打开抽屉
const openDrawer = async () => {
    drawerVisible.value = true
    try {
        const res = await getTaskLists();
        if (res.status === "success") {
            tasksLists.value = []
            res.data.forEach(data => {
                let dataTime = data.CreatedAt.substring(0, 19).replace('T', ' ');

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
                tasksLists.value.push({ id: data.ID, createdAt: dataTime, type: dataType, status: dataStatus },)
            })
            // 进度条
            // setInterval(() => {
            //     percentage.value = (percentage.value % 100) + 10
            // }, 500)
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
}

// 根据 selectedTask 返回不同的描述
const getDescription = () => {
    if (selectedTask.value === 'prediction' || selectedTask.value === 'completion' || selectedTask.value === 'correction') {
        return '选择输出测井曲线';
    } else if (selectedTask.value === 'recognize') {
        return '输出岩性'; // 替换为其他情况的描述
    }
}

const getTitle = () => {
    if (selectedTask.value === 'prediction' || selectedTask.value === 'completion' || selectedTask.value === 'correction') {
        return 'Step 6';
    } else {
        return 'Step 5';
    }
}
const prevStep = () => {
    if (activeStep.value > 0) {
        activeStep.value--;
    }
};

const nextStep = () => {
    if (activeStep.value < 5) {
        if ((activeStep.value === 0 && selectedTask.value === '') ||
            (activeStep.value === 1 && selectedDatasets.value === '') ||
            (activeStep.value === 2 && selectedModel.value === '') ||
            (activeStep.value === 3 && inputWellLogKinds.value.length === 0)
        ) {
            ElMessage({
                message: '数据不能为空，请重新选择！',
                type: 'error',
            })
            return
        }
        if (outputWellLogKinds.value.length > 1) {
            ElMessage({
                message: '模型目前仅支持输出单条测井曲线，请重新选择！',
                type: 'error',
            })
            return
        }

        activeStep.value++
    }
};

const getDatasetLabels = (selectedKeys) => {
    const task = datasets.value.find(data => data.value === selectedKeys);
    return task ? task.label : '';
};

const getWellLogLabel = (selectedKeys) => {
    return wellLogKinds.value
        .filter(kind => selectedKeys.includes(kind.key))
        .map(kind => kind.label)
        .join(', ');
};

const getTaskLabel = (selectedKey) => {
    const task = tasks.value.find(task => task.value === selectedKey);
    return task ? task.label : '';
};

const confirm = async () => {
    const dataSetInfo = {
        taskkinds: selectedTask.value,
        datasets: selectedDatasets.value,
        selectedmodel: selectedModel.value,
        inputwelllogkinds: getWellLogLabel(inputWellLogKinds.value),
        outputwelllogkinds: getWellLogLabel(outputWellLogKinds.value),
    }
    var res = await addNewTask(dataSetInfo);

    if (res.status === "success") {
        ElMessage({
            type: 'success',
            message: '任务新建成功！'
        })
        selectedTask.value = ''
        selectedDatasets.value = ''
        selectedModel.value = ''
        inputWellLogKinds.value = []
        outputWellLogKinds.value = []
        activeStep.value = 0
    } else {
        ElMessage({
            type: 'error',
            message: '任务新建失败！'
        })
    }
}

const updatePredictModel = (newMsg) => {
    selectedModel.value = newMsg
}

</script>

<style scoped>
.container {
    /* 使按钮可以绝对定位 */
    position: relative;
}

.open-drawer-button {
    position: absolute;
    width: 110px;
    height: 40px;
    right: -25px;
    top: 50%;
    transform: translateY(-50%) rotate(90deg);
}

/* 悬浮样式 */
.open-drawer-button:hover {
    /* 悬浮时的背景色 */
    background-color: #4CAF50;
    /* 悬浮时放大按钮 */
    transform: translateY(-50%) scale(1.2) rotate(90deg);
    /* 添加阴影效果 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.task-list {
    list-style-type: none;
    /* 去掉列表项的默认样式 */
    padding: 0;
    /* 去掉内边距 */
    margin: 0;
    /* 去掉外边距 */
}

.task-item {
    padding: 10px;
    /* 列表项的内边距 */
    border-bottom: 1px solid #e4e7ed;
    /* 列表项的底部边框 */
    display: flex;
    /* 使用 flexbox 布局 */
    justify-content: space-between;
    /* 在行内分配空间 */
}

.task-details {
    display: flex;
    /* 使用 flexbox 布局 */
    justify-content: space-between;
    /* 在行内分配空间 */
    width: 100%;
    /* 使任务详情占满整个宽度 */
}

.task-time,
.task-type {
    flex: 1;
    /* 每个字段占据相同的空间 */
    text-align: left;
    /* 文字居中对齐 */
    display: flex;
    justify-content: center;
    align-items: center;
}

.task-status {
    flex: 1;
    /* 占据相同的空间 */
    text-align: center;
    /* 文字居中对齐 */
    padding: 5px;
    /* 添加内边距 */
}

/* 已完成 */
.completed {
    background-color: rgb(131, 218, 87);
    color: rgb(255, 255, 255);
    border-radius: 5px;
}

/* 未开始 */
.no-start {
    background-color: rgb(177, 179, 184);
    border-radius: 5px;
}

/* 进度条 */

.steps-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    /* 改为flex-start，避免内容过度居中 */
    min-height: 100%;
    min-width: 100vw;
    padding: 2rem;
    box-sizing: border-box;

    background-image: url('../assets/framebackground.png');
}

:deep(.el-transfer) {
    /* 调整整个穿梭框组件的宽度 */
    width: 100%;
}

:deep(.el-transfer-panel) {
    /* 调整每个面板的宽度 */
    width: 40%;
}

:deep(.el-transfer__buttons) {
    /* 调整中间按钮区域的宽度 */
    width: 20%;
}

.steps-container {
    width: 100%;
    max-width: 1200px;
    text-align: center;
}

/* 设置标题文字为白色 */
:deep(.el-step__title) {
    color: white;
}

/* 设置标题描述文字为白色 */
:deep(.el-step__description) {
    color: white;
}

.step-content {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 5px;
}

/* 穿梭框背景色为透明 */
:deep(.el-transfer-panel) {
    background-color: #ebeef5;
}

/* 最后一步文字颜色 */
:deep(.el-form-item__label) {
    color: white;
}

.step-actions {
    margin-top: 20px;
}

.taskdiv {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.task-selection {
    display: flex;
    justify-content: center;
    width: 80%;
}

:deep(.el-radio-button) {
    margin: 10px;
}

.task-card {
    /* margin: 10px; */
    padding: 20px;
    text-align: center;
    width: 300px;
    /* transition: background-color 0.3s; */
}

.task-card.is-selected {
    /* 新增选中状态样式 */
    background-color: rgb(64, 158, 255);
    /* 选中时的背景色 */
}

.task-icon {
    margin-bottom: 12px;
    color: var(--el-color-primary);
}

.is-selected-icon {
    color: rgb(255, 215, 0);
    /* 选中时的图标颜色 */
}


.task-description {
    font-size: 14px;
    color: #666;
    margin-top: 8px;
}

.is-selected-description {
    font-size: 14px;
    color: #fff;
    margin-top: 8px;
}

:deep(.el-radio-button__inner) {
    padding: 0;
    height: auto;
    border: 1px solid #ccc;
    border-radius: 8px !important;
}
</style>
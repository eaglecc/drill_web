<template>
    <div class="steps-wrapper">
        <div class="steps-container">
            <el-steps :active="activeStep" align-center>
                <el-step title="Step 1" description="选择测井曲线数据集"></el-step>
                <el-step title="Step 2" description="选择输入测井曲线"></el-step>
                <el-step title="Step 3" description="选择输出测井曲线（单条）"></el-step>
                <el-step title="Step 4" description="选择任务"></el-step>
                <el-step title="Step 5" description="确认提交"></el-step>
            </el-steps>

            <div class="step-content">
                <div v-if="activeStep === 0">
                    <el-transfer v-model="selectedDatasets" :data="datasets" filterable :titles="['可选测井数据集', '已选测井数据集']"
                        :button-texts="['移除', '选择']" />
                </div>
                <div v-if="activeStep === 1">
                    <el-transfer v-model="inputWellLogKinds" :data="wellLogKinds" filterable
                        :titles="['可选测井曲线种类', '已选测井曲线种类']" :button-texts="['移除', '选择']" />
                </div>
                <div v-if="activeStep === 2">
                    <el-transfer v-model="outputWellLogKinds" :data="wellLogKinds" filterable
                        :titles="['可选测井曲线种类', '已选测井曲线种类']" :button-texts="['移除', '选择']" />
                </div>
                <div v-if="activeStep === 3">
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
                <div v-if="activeStep === 4"
                    style="display: flex; align-items: center; justify-content: center; width: 100%;">
                    <el-form label-width="auto" label-position="left" style="width: 60%;">
                        <el-form-item label="已选择的数据集:" label-position="left">
                            <el-input :value="getDatasetLabels(selectedDatasets)" readonly />
                        </el-form-item>

                        <el-form-item label="输入测井曲线:" label-position="left">
                            <el-input :value="getWellLogLabel(inputWellLogKinds)" readonly />
                        </el-form-item>

                        <el-form-item label="输出测井曲线:" label-position="left">
                            <el-input :value="getWellLogLabel(outputWellLogKinds)" readonly />
                        </el-form-item>

                        <el-form-item label="选择的任务:" label-position="left">
                            <el-input :value="getTaskLabel(selectedTask)" readonly />
                        </el-form-item>

                    </el-form>
                </div>
            </div>

            <div class="step-actions">
                <el-button @click="prevStep" :disabled="activeStep === 0">上一步</el-button>
                <el-button type="primary" @click="nextStep" v-if="activeStep != 4">下一步</el-button>
                <el-button type="primary" @click="confirm" v-if="activeStep === 4">提交</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from 'element-plus'
import { DataLine, TrendCharts, DataAnalysis } from '@element-plus/icons-vue'  // 添加这行导入语句

const activeStep = ref(0);
// 数据集选择穿梭框所需的数据
const datasets = ref([
    { key: 1, label: '数据集1' },
    { key: 2, label: '数据集2' },
    { key: 3, label: '数据集3' },
    { key: 4, label: '数据集4' }
]);
const selectedDatasets = ref([]);

// 测井曲线种类穿梭框数据
const wellLogKinds = ref([
    { key: 1, label: 'GR' },
    { key: 2, label: 'DEN' },
    { key: 3, label: 'CAL' },
    { key: 4, label: 'HAC' }
]);
const inputWellLogKinds = ref([]);
const outputWellLogKinds = ref([]);

// 任务选择
const selectedTask = ref('');
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
    }
]);

const nextStep = () => {
    if (activeStep.value < 4) {
        if ((activeStep.value === 0 && selectedDatasets.value.length <= 0) ||
            (activeStep.value === 1 && inputWellLogKinds.value.length <= 0) ||
            (activeStep.value === 2 && outputWellLogKinds.value.length <= 0) ||
            (activeStep.value === 3 && selectedTask.value === '')) {
            ElMessage({
                message: '数据不能为空，请重新选择！',
                type: 'error',
            })
            return
        }
        if (selectedDatasets.value.length > 1) {
            ElMessage({
                message: '仅支持选择一个数据集，请重新选择！',
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
    return datasets.value
        .filter(dataset => selectedKeys.includes(dataset.key))
        .map(dataset => dataset.label)
        .join(', ');
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

const confirm = () => {
    console.log("ss")
}

const prevStep = () => {
    if (activeStep.value > 0) {
        activeStep.value--;
    }
};
</script>

<style scoped>
.steps-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    /* 改为flex-start，避免内容过度居中 */
    min-height: 100%;
    min-width: 100vw;
    padding: 2rem;
    box-sizing: border-box;
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

.step-content {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 5px;
}

.step-actions {
    margin-top: 20px;
}

.task-selection {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}

.task-card {
    padding: 20px;
    text-align: center;
    width: 300px;
    transition: background-color 0.3s;
    /* 添加过渡效果 */
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
    border-radius: 8px !important;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-radius: 8px !important;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 8px !important;
}
</style>
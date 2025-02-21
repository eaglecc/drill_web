<template>
    <div class="common-layout">
        <el-container>
            <el-aside style="width: 20%; height: 100%;">
                <p
                    style="text-align: left; font-size: 18px; margin-top: 40px;margin-bottom: 10px; margin-left: 20px;color: white;">
                    监测地点选择：</p>
                <el-select v-model="formData.dataLocationsValue" placeholder="选择监测地点" size="large"
                    style="width: 90%;  margin-left: 20px;margin-bottom: 10px;">
                    <el-option v-for="item in dataLocationsOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>

                <p
                    style="text-align: left; font-size: 18px; margin-top: 20px;margin-bottom: 10px; margin-left: 20px;color: white;">
                    井孔选择：</p>
                <el-select v-model="formData.wellName" placeholder="选择井孔" size="large"
                    style="width: 90%;  margin-left: 20px;margin-bottom: 10px;">
                    <el-option v-for="item in wellList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>

                <p
                    style="text-align: left; font-size: 18px; margin-top: 20px;margin-bottom: 10px; margin-left: 20px;color: white;">
                    测井类型/测井工具：</p>
                <el-cascader v-model="formData.dataUtilValue" :options="cascaderOptions" placeholder="选择测井类型和工具"
                    :props="props" size="large" style="width: 90%; margin-left: 20px; margin-bottom: 10px;" clearable
                    collapse-tags collapse-tags-tooltip>
                </el-cascader>

                <p
                    style="text-align: left; font-size: 18px; margin-top: 20px;margin-bottom: 10px; margin-left: 20px;color: white;">
                    刷新频率：</p>
                <el-select v-model="formData.refreshInterval" placeholder="选择刷新频率" size="large"
                    style="width: 90%;  margin-left: 20px;margin-bottom: 10px;">
                    <el-option v-for="item in refreshIntervalOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>

                <div style="text-align: center; margin-top: 20px;">
                    <el-button type="primary" size="large" @click="startMonitoring">开始监测</el-button>
                    <el-button type="primary" size="large" @click="stopMonitoring">停止监测</el-button>

                </div>

            </el-aside>
            <el-main style="width: 80%; height: 100%;">
                <div ref="chartRef" class="chart-container"></div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getDataSetLists, getDataSetByName } from '@/api/DataSetApi'
import * as echarts from 'echarts';


// 图表相关
const chartRef = ref(null);
let chartInstance = null;
const wellLogData = ref([]);
let intervalId = null;

const props = {
    multiple: true,  // 允许多选
    // checkStrictly: true, // 只允许选择叶子节点，不选父级
};

const formData = reactive({
    dataLocationsValue: '',
    wellName: '',
    refreshInterval: '',
    dataUtilValue: []
})

const dataLocationsOptions = [
    { label: '大庆油田区块A', value: 'LocationA' },
    { label: '大庆油田区块B', value: 'LocationB' }
]

const wellList = ref([
    { label: '井001', value: 'Well001' },
    { label: '井002', value: 'Well002' },
    { label: '井003', value: 'Well003' }
])

const refreshIntervalOptions = ref([
    { label: '3秒', value: '3' },
    { label: '5秒', value: '5' },
    { label: '10秒', value: '10' },
    { label: '30秒', value: '30' },
    { label: '1分钟', value: '60' },
    { label: '10分钟', value: '600' }
])

const cascaderOptions = ref([
    {
        value: 'RES',
        label: '电阻率 (RES)',
        children: [
            { label: 'GOLD DUK-2A Groundwater Survey Equipment', value: 'DUK_2A' },
            { label: '斯伦贝谢第三代 MicroScope &MicroScope HD', value: 'MicroScope', disabled: true },
            { label: '哈里伯顿 AFR', value: 'MicroScope', disabled: true },
            { label: '贝克休斯 StarTrak ', value: 'MicroScope', disabled: true },
        ],
    },
    {
        value: 'GR',
        label: '自然伽马 (GR)',
        children: [
            { label: 'Gold Geophysical logging tool', value: 'gold_GR', disabled: true },
            { label: '斯伦贝谢 伽马成像测井仪 IPZIG', value: 'IPZIG' },
            { label: '贝克休斯 ZoneTrak G', value: 'ZoneTrak', disabled: true },
            { label: '哈里伯顿 AGR', value: 'AGR', disabled: true },
        ],
    },
    {
        value: 'AC',
        label: '声波时差 (AC)',
        children: [
            { label: '补偿测井仪(BHC)', value: 'BHC' },
            { label: '长源距声波测井仪(LSS)', value: 'LSS', disabled: true },
        ],
    },
    {
        value: 'CAL',
        label: '井径 (CAL)',
        children: [
            { label: '过油管2臂井径仪', value: 'g2' },
            { label: '8臂井径仪', value: '8B', disabled: true },
            { label: 'X－Y井径仪', value: 'XYB', disabled: true },
            { label: '10臂井径仪', value: '10B', disabled: true },
            { label: '12臂井径仪', value: '12B', disabled: true },
            { label: '16臂井径仪', value: '16B', disabled: true },
            { label: '2传感器40臂井径仪', value: '2C40B', disabled: true },
            { label: '6传感器36(60)臂井径仪', value: '6C36B', disabled: true },
            { label: '40传感器40独立臂井径仪', value: '40C40B', disabled: true },
        ],
    },
    {
        value: 'SP',
        label: '自然电位 (SP)',
        children: [
            { label: 'Gold Geophysical logging tool', value: 'gold_sp' },
            { label: 'Gold Borehole Logging', value: 'gold_sp2', disabled: true },
        ],
    },
    {
        value: 'BHC',
        label: '补偿声波 (BHC)',
        children: [
            { label: 'BHC-900', value: 'BHC_900' },
        ],
    },
    {
        value: 'HAC',
        label: '声波时差 (HAC)',
        children: [
            { label: 'Acoustic Transit Time Tool HAC-600', value: 'HAC-600' },
        ],
    },
    {
        value: 'DEN',
        label: '密度 (DEN)',
        children: [
            { label: 'Schlumberger Digital Density Log Tool DD-700', value: 'DD-700' },
        ],
    },
])

// 启动按钮
const startMonitoring = () => {
    if (formData.dataLocationsValue === "" || formData.dataUtilValue.length === 0 || formData.refreshInterval === "" || formData.wellName === "") {
        ElMessage.warning('请填写完整的监测信息')
        return
    }
    updateChart()
}

// 停止按钮
const stopMonitoring = () => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
        wellLogData.value = [];
        clearInterval(intervalId);
    }
}

function randomData(logName) {
    let value;
    if (logName === "RES") {
        value = Math.random() * 100;
    } else if (logName === "GR") {
        value = Math.random() * (170 - 50) + 50;
    } else if (logName === "AC") {
        value = Math.random() * (130 - 50) + 50;
    } else if (logName === "CAL") {
        value = Math.random() * (20 - 8) + 8;
    } else if (logName === "SP") {
        value = Math.random() * (1000 - (-1000)) + (-1000);
    } else if (logName === "BHC") {
        value = Math.random() * (200 - 50) + 50;
    } else if (logName === "HAC") {
        value = Math.random() * (200 - 50) + 50;
    } else if (logName === "DEN") {
        value = Math.random() * (2.8 - 1.5) + 1.5;
    }

    let now = new Date(Date.now());
    return {
        name: now.toString(),
        value: [
            [
                now.getFullYear(),
                now.getMonth() + 1,
                now.getDate()
            ].join("/") + " " + // 日期部分
            [
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            ].join(":"), // 时间部分
            Math.round(value),
        ],
    };
}

// 更新 ECharts 图表
const updateChart = () => {
    if (!chartRef.value) return;
    chartInstance = echarts.init(chartRef.value);

    // 动态生成 series 数组
    const seriesCount = formData.dataUtilValue.length;
    const series = Array.from({ length: seriesCount }, (_, index) => ({
        name: formData.dataUtilValue[index][0],
        seriesLayoutBy: 'row',
        emphasis: { focus: 'series' },
        type: 'line',
        showSymbol: false,
        data: [],
    }));

    const option = {
        title: {
            text: "测井曲线数据实时监测",
            left: 'center', // 将标题居中
            textStyle: {
                fontSize: 20, // 设置字体大小，例如 20px
                fontWeight: 'bold', // 可选：设置字体加粗
                color: '#fff', // 可选：设置字体颜色
            },
        },
        tooltip: { trigger: 'axis' },
        legend: {
            data: series.map(s => s.name),
            orient: 'horizontal',
            left: 'center',
            top: 'bottom',
            textStyle: {  // 添加文字样式
                color: '#fff',  // 设置图例文字颜色为白色
            },
        },
        xAxis: {
            type: "time",
            splitLine: { show: false },
            axisLabel: {  // 添加坐标轴标签样式
                color: '#fff',  // 设置坐标轴标签颜色为白色
            },
        },
        yAxis: {
            type: "value",
            boundaryGap: [0, "100%"],
            splitLine: { show: false },
            axisLabel: {  // 添加坐标轴标签样式
                color: '#fff',  // 设置坐标轴标签颜色为白色
            },
        },
        series: series,
    };

    chartInstance.setOption(option);

    intervalId = setInterval(() => {
        if (wellLogData.value.length > 5000) {
            wellLogData.value.shift();
        }
        series.forEach((s, index) => {
            if (s.name === "RES") {
                s.data.push(randomData("RES"));
            } else if (s.name === "GR") {
                s.data.push(randomData("GR"));
            } else if (s.name === "AC") {
                s.data.push(randomData("AC"));
            } else if (s.name === "CAL") {
                s.data.push(randomData("CAL"));
            } else if (s.name === "SP") {
                s.data.push(randomData("SP"));
            } else if (s.name === "BHC") {
                s.data.push(randomData("BHC"));
            } else if (s.name === "HAC") {
                s.data.push(randomData("HAC"));
            } else if (s.name === "DEN") {
                s.data.push(randomData("DEN"));
            }
        })
        chartInstance.setOption({
            series: series,
        });
    }, formData.refreshInterval * 1000);
}

// 在组件挂载时初始化图表
onMounted(() => {
    // initChart();
});

// 组件卸载时销毁 ECharts 实例，防止内存泄漏
onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
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
    background-color: rgb(16, 40, 126);
}



.chart-container {
    width: 100%;
    height: 500px;
}
</style>
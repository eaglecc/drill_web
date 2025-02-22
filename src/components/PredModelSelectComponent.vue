<template>
    <div class="card-list">
        <!-- 遍历 list 数组，每个元素渲染一个 el-card -->
        <el-card v-for="item in list" :key="item.id" class="card-item"
            :class="{ 'is-selected': selectedCardTitle === item.title }"
            style="margin-bottom: 20px;"
            shadow="hover"
            @click="selectCard(item.title)"
            >
            <div class="card-content">
                <div class="text-content">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.content }}</p>
                </div>
                <el-image :src="getImageSrc(item.imgName)" :preview-src-list="getImageSrcList(item.imgName)"
                    class="card-image" />
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedCardTitle = ref(''); // 选中的卡片 ID

// 数据列表
const list = ref([
    { id: 1, title: 'WLP-T', content: 'WLP-T：一种基于改进Transformer神经网络的测井曲线生成方法，主要由由输入模块、编码器模块、解码器模块和输出模块四部分组成，旨在充分捕获测井数据间的特征、提升测井曲线生成的精度并减少训练时间。', imgName: 'WLP_T.png' },
    { id: 2, title: 'SimpleRNN', content: 'SimpleRNN：一种基本的循环神经网络，由循环单元构成，能够有效捕捉数据中的时间依赖性和动态信息。', imgName: 'SimpleRNN.png' },
    { id: 3, title: 'LSTM', content: 'LSTM：长短时记忆网络。是RNN的一种改进变体，相较于传统RNN的主要优点在于其能够有效解决梯度消失和梯度爆炸问题，使网络更适合处理长序列数据', imgName: 'LSTM.png' },
    { id: 4, title: 'GRU', content: 'GRU：门控循环单元，利用重置门和更新门简化LSTM结构，在捕捉序列长期依赖的同时计算效率更高。', imgName: 'GRU.png' },
    { id: 5, title: 'Bi-LSTM', content: 'Bi-LSTM：双向LSTM，通过同时处理正向和反向序列信息来增强上下文理解能力。', imgName: 'BiLSTM.png' },
    { id: 6, title: 'Bi-GRU', content: 'Bi-GRU：双向GRU，结合两个方向的GRU网络，有助于在序列任务中更全面地捕捉信息。', imgName: 'BiGRU.png' },
])

// 根据 id 获取图片路径的函数
const getImageSrc = (imgName) => {
    return `src/assets/${imgName}`; // 替换为实际的图片路径
}

const getImageSrcList = (imgName) => {
    // const prefix = 'src/assets/'
    // const imgNamesArray = list.value.map(item => prefix + item.imgName);
    // return imgNamesArray
    return [getImageSrc(imgName)];
}


// 选择卡片的函数
const selectCard = (title) => {
    console.log("选中id。。。",title)
    selectedCardTitle.value = selectedCardTitle.value === title ? null : title;  // 切换选中状态
}

</script>

<style scoped>
.card-list {
    max-height: 500px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.card-item {
    transition: background-color 0.3s;
}

.card-item.is-selected {
    background-color: #b5b7b9;
    color: white;
}

.card-content {
    display: flex;
    align-items: center;
}

.text-content {
    /* 使文本内容占据剩余空间 */
    flex: 1;
}

.card-image {
    width: 100px;
    height: auto;
    margin-left: 10px;
}
</style>
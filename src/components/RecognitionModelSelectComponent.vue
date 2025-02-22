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
    { id: 1, title: 'MSFR-Net', content: 'MSFR-Net模型旨在解决岩性识别任务中关键特征提取能力弱、泛化能力差、识别精度低等问题。由数据输入模块、特征生成模块、Rocket模块、分类器模块以及输出模块组成。', imgName: 'MSFR_Net.png' },
    { id: 2, title: 'SVM', content: 'SVM：支持向量机是一种基于最大间隔原理的监督学习模型，主要由支持向量和超平面构成，用于分类和回归任务。', imgName: 'SVM.png' },
    { id: 3, title: 'KNN', content: 'KNN：K最近邻算法是一种基于实例的非参数方法，通过计算样本间的距离进行分类或回归，具有简单直观的原理。', imgName: 'KNN.png' },
    { id: 4, title: 'CNN', content: 'CNN：卷积神经网络由卷积层、池化层和全连接层构成，利用局部感受野和权值共享机制高效提取图像及序列数据的特征。', imgName: 'CNN.png' },
    { id: 5, title: 'LSTM', content: 'LSTM：长短时记忆网络。是RNN的一种改进变体，相较于传统RNN的主要优点在于其能够有效解决梯度消失和梯度爆炸问题，使网络更适合处理长序列数据', imgName: 'LSTM.png' },
    { id: 6, title: 'GRU', content: 'GRU：门控循环单元，利用重置门和更新门简化LSTM结构，在捕捉序列长期依赖的同时计算效率更高。', imgName: 'GRU.png' },
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
# drill_web

基于测井曲线的岩性识别系统Vue端
工具：Vue3、ElementPlus、ECharts、axios

接口信息：
BASEURL：http://localhost:5173/
| 接口 | 描述 | 备注 |
| ---- | ---- | ---- |
| api/v1/dataset | 数据集管理界面   |  |
| api/v1/showWellLog | 数据集可视化界面   |  |
| api/v1/watchWellLog | 数据实时监测界面   | todo：待接入后端，需配合传感器实时推送数据 |
| api/v1/newTask | 新建任务界面   |  |
| api/v1/showTasks | 任务结果展示界面   |  |

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Project Result

![新建任务步骤](./public/图5.9-1：新建任务步骤.jpg)

<script setup>
import {
  getStayResponse,
  updateStayResponse,
  createStayResponse,
  deleteStayResponse
} from "@/api/DORM/stay"
import { useExportExcel } from "@/utils/exportExcel"
import { useRules } from "@/rules/dormRules"
import { resetForm, submitForm } from "@/utils/rules"
import { Notification } from "@/utils/notification"
import { floorsName, dormNumber } from "@/rules/dormRules"
//表格实例
const refTable = ref(null)
const searchRef = ref(null)
const Form = ref(null)
//导出对话框
const expDialog = ref(false)
//搜索参数
let staySearchParams = reactive({
  floorsName: "",
  dormNumber: "",
  studentName: ""
})
//编辑参数
let stayEditParams = ref({
  id: "",
  stayTime: "",
  studentName: "",
  floorsName: "",
  dormNumber: "",
  stayCause: "",
  opinions: "",
  instructor: ""
})
let isOperate = ref(true)
const searchRules = {
  floorsName: [
    {
      validator: floorsName,
      trigger: "blur"
    }
  ],
  dormNumber: [
    {
      validator: dormNumber,
      trigger: "blur"
    }
  ]
}
const formRules = useRules(stayEditParams.value)
//参数编辑对话框
let stayVisible = ref(false)
function selectDatePicker() {
  console.log(staySearchParams.date)
}
//导出表格
const fields = {
  stayDate: "留宿时间",
  studentName: "学生姓名",
  floorsName: "宿舍楼",
  dormNumber: "宿舍",
  stayCause: "留宿原因",
  instructor: "辅导员",
  auditProgress: "审核意见"
}
function exportTable({ filename, allSelect }) {
  const data = allSelect
    ? refTable.value.data
    : refTable.value.getSelectionRows()
  useExportExcel(data, fields, filename)
}
//标签颜色
function stateTag(text) {
  console.log("text", text)
  switch (text) {
    case "同意":
      return "success"
    case "不同意":
      return "danger"
    default:
      return "info"
  }
}

/* 接口 */
let stayTableData = ref([])
const total = ref(0)
let Pages = reactive({
  PageSize: 10,
  Page: 1
})
async function getStays(PageAndSize) {
  if (PageAndSize !== undefined) {
    Pages = PageAndSize
  }
  console.log("发起请求")
  const { code, data } = await getStayResponse(staySearchParams, Pages)
  if (code == 200) {
    stayTableData.value = data.list
    total.value = data.total
  }
}
// 更新
async function updateStays() {
  const valid = await submitForm(Form.value)
  if (valid) {
    const { code, msg } = await updateStayResponse(stayEditParams.value)
    stayVisible.value = false
    const status = Notification(code, msg)
    status ? getStays() : ""
  }
}
// 删除
async function deleteStays(list) {
  if (list === undefined) {
    list = refTable.value.getSelectionRows().map((item) => toRaw(item))
    // list=toRaw(refTable.value.getSelectionRows())
  }
  console.log("LIST", list)
  const { code, msg } = await deleteStayResponse(list)
  const status = Notification(code, msg)
  status ? getStays() : ""
}
// 添加
async function createStays() {
  const valid = await submitForm(Form.value)
  if (valid) {
    const list = toRaw(stayEditParams.value)
    list.stayTime = {
      startTime: list.stayTime[0],
      endTime: list.stayTime[0]
    }
    console.log("list", list)
    const { code, msg } = await createStayResponse([list])
    stayVisible.value = false
    const status = Notification(code, msg)
    status ? getStays() : ""
  }
}
//搜索栏
async function SearchStays() {
  const query = staySearchParams
  let params = Object.fromEntries(
    Object.entries(query).filter(([key]) => query[key])
  )
  // console.log("对象",params,Object.keys(params).length);
  if (!Object.keys(params).length) {
    console.log("控制")
    ElMessage({
      message: "搜索输入不能为空",
      type: "error"
    })
    return
  }
  const valid = await submitForm(searchRef.value)
  if (valid) {
    getStays()
  }
}

async function updateStayData() {}
async function deleteStayData() {}
async function increaseStayData() {}
onMounted(() => {
  getStays()
})
</script>
<template>
  <div>
    <el-form
      ref="searchRef"
      :rules="searchRules"
      :model="staySearchParams"
      inline>
      <el-form-item
        style="width: 180px"
        prop="floorsName">
        <el-input
          placeholder="请输入宿舍楼名称"
          v-model="staySearchParams.floorsName" />
      </el-form-item>
      <el-form-item
        style="width: 180px"
        prop="dormNumber">
        <el-input
          placeholder="请输入宿舍名称"
          v-model="staySearchParams.dormNumber" />
      </el-form-item>
      <el-form-item style="width: 180px">
        <el-input
          clearable
          placeholder="请输入留宿学生名"
          v-model="staySearchParams.studentName" />
      </el-form-item>
      <el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="SearchStays"
            >搜索</el-button
          >
          <el-button @click="resetForm(searchRef)">重置</el-button>
        </el-form-item>
      </el-form-item>
    </el-form>
    <!-- 操作 -->
    <OperateButton
      :isOperate="isOperate"
      v-model="stayVisible"
      @delete="deleteStays"
      @excel="expDialog = true" />
    <!-- 表格数据 -->
    <el-table
      ref="refTable"
      :data="stayTableData"
      @selection-change="
        (list) => (list.length ? (isOperate = false) : (isOperate = true))
      "
      border
      :max-height="525">
      <el-table-column
        type="selection"
        fixed
        width="55" />
      <el-table-column
        width="55"
        type="index"
        label="#" />
      <el-table-column
        prop="stayDate"
        label="留宿时间"
        width="200"
        align="center">
        <template #default="{ row, column, $index }">
          <el-text truncated>
            {{ row.stayTime.startTime }}~{{ row.stayTime.endTime }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column
        prop="studentName"
        label="留宿学生"
        width="120"
        align="center" />
      <el-table-column
        prop="stayCause"
        label="留宿原因"
        width="120"
        align="center">
        <template #default="{ row, column, $index }">
          <el-tooltip
            class="box-item"
            effect="light"
            :content="`${row.stayCause}`"
            placement="top">
            <el-text
              type="primary"
              class="w-150px mb-2"
              truncated>
              {{ row.stayCause }}
            </el-text>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="floorsName"
        label="宿舍楼"
        width="120"
        align="center" />
      <el-table-column
        prop="dormNumber"
        label="宿舍"
        align="center"
        width="120" />
      <el-table-column
        prop="instructor"
        label="辅导员"
        align="center"
        width="120" />
      <el-table-column
        prop="opinions"
        label="审核意见"
        align="center"
        width="120">
        <template #default="{ row, column, $index }">
          <el-tag :type="stateTag(row.opinions)">{{ row.opinions }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="操作"
        label="操作"
        align="center">
        <template #default="{ row, column, $index }">
          <TableButton
            :row="row"
            @merge="stayVisible = true"
            @delete="deleteStays"
            v-model="stayEditParams" />
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      @getCurrentPage="getStays"
      @getPageSizes="getStays" />
    <!-- 对话框 -->
    <FormDialog
      @close="Form.resetFields()"
      v-model="stayVisible"
      v-model:params="stayEditParams"
      :title="stayEditParams.id ? `修改留宿申请` : `添加留宿申请`">
      <el-form
        ref="Form"
        :rules="formRules"
        :model="stayEditParams"
        label-width="auto">
        <el-form-item
          label="留宿时间"
          prop="stayTime">
          <el-date-picker
            v-model="stayEditParams.stayTime"
            type="daterange"
            format="YYYY-MM-DD"
            start-placeholder="Start date"
            end-placeholder="End date"
            value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item
          label="宿舍楼"
          prop="floorsName">
          <el-input
            placeholder="请选择宿舍楼"
            v-model="stayEditParams.floorsName" />
        </el-form-item>
        <el-form-item
          label="宿舍编号"
          prop="dormNumber">
          <el-input
            placeholder="请选择宿舍"
            v-model="stayEditParams.dormNumber" />
        </el-form-item>
        <el-form-item
          label="留宿学生"
          prop="studentName">
          <el-input v-model="stayEditParams.studentName" />
        </el-form-item>
        <el-form-item
          label="留宿原因"
          prop="stayCause">
          <el-input
            v-model="stayEditParams.stayCause"
            placeholder="请输入内容"
            type="textarea" />
        </el-form-item>
        <el-form-item
          label="辅导员"
          prop="instructor">
          <el-input
            v-model="stayEditParams.instructor"
            placeholder="请输入辅导员" />
        </el-form-item>
        <el-form-item
          label="意见"
          prop="opinions">
          <el-select
            v-model="stayEditParams.opinions"
            placeholder="请选择意见">
            <el-option
              label="同意"
              value="同意" />
            <el-option
              label="不同意"
              value="不同意" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="stayEditParams.id ? updateStays() : createStays()"
            type="success"
            >{{ stayEditParams.id ? "更新" : "添加" }}</el-button
          >
          <el-button
            @click="resetForm(Form)"
            type="primary"
            >重置</el-button
          >
        </el-form-item>
      </el-form></FormDialog
    >
    <ExportDialog
      v-model="expDialog"
      @select="exportTable" />
  </div>
</template>
@/server/MG/stay/stay @/rules/dormRules

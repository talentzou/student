<script setup>
import {
  getRepairResponse,
  updateRepairResponse,
  createRepairResponse,
  deleteRepairResponse
} from "@/api/Repair/repair"
import { GetFloorWithDormList } from "@/api/Dorm/floors"

import { useRules } from "@/rules/maintenanceRules"
import { resetForm, submitForm } from "@/utils/rules"
import { floorDormRule } from "@/rules/dormRules"
import { Notification } from "@/utils/notification"
import { authFields } from "@/utils/authFields"
import { FormatTime } from "@/utils/time"
import { userStore } from "@/stores/user"
const $userStore = userStore()
const userInfo = computed(() => $userStore.userInfo)
const { operate_auth, table_auth } = authFields("repair")
const refTable = ref(null)
const Form = ref(null)
const searchRef = ref(null)
let maintenanceSearchParams = reactive({
  floorDorm: "",
  repairStatus: ""
})
//导出对话框
const expDialog = ref(false)
let isOperate = ref(true)
let repairVisible = ref(false)
let maintenanceEditParams = ref({
  dormId: "",
  problems: "",
  submitDate: "",
  repairStatus: "",
  reportMan: "",
  phone: "",
  repairer: ""
})

const formRules = useRules(maintenanceEditParams.value)


/* 接口 */
let repairTableData = ref([])
const total = ref(0)
let Pages = ref({
  PageSize: 10,
  Page: 1
})
// 获取
async function getRepairs() {
  console.log("发起请求")
  const { code, data } = await getRepairResponse(
    maintenanceSearchParams,
    Pages.value
  )
  if (code == 200) {
    console.log("9kkkk+++", data)
    repairTableData.value = data.list
    total.value = data.total
  }
}
// 更新
async function updateRepairs() {
  const valid = await submitForm(Form.value)
  if (valid) {
    const { code, msg } = await updateRepairResponse(
      maintenanceEditParams.value
    )
    repairVisible.value = false
    const status = Notification(code, msg)
    status ? getRepairs() : ""
  }
}
// 删除
async function deleteRepairs(list) {
  if (list === undefined) {
    list = refTable.value.getSelectionRows().map((item) => toRaw(item))
    // list=toRaw(refTable.value.getSelectionRows())
  }
  console.log("LIST", list)
  const { code, msg } = await deleteRepairResponse(list)
  const status = Notification(code, msg)
  status ? getRepairs() : ""
}
// 添加
async function createRepairs() {
  const valid = await submitForm(Form.value)
  if (valid) {
    let list = toRaw(maintenanceEditParams.value)
    console.log("list", list)
    list = {
      dormId: list.dormId,
      problems: list.problems,
      submitDate: list.submitDate,
      repairStatus: list.repairStatus,
      reportMan: list.reportMan,
      phone: list.phone,
      repairer: list.repairer
    }
    const { code, msg } = await createRepairResponse([list])
    repairVisible.value = false
    const status = Notification(code, msg)
    status ? getRepairs() : ""
  }
}
//搜索栏
async function SearchRepairs() {
  const query = maintenanceSearchParams
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
  console.log("校验+++++++", valid)
  if (valid) {
    getRepairs()
  }
}
const options = ref([])
const getFloorWithDorm = async () => {
  const { code, data } = await GetFloorWithDormList()
  console.log("ppp", data)
  if (code == 200) {
    options.value = data.list
  }
}
onMounted(() => {
  getFloorWithDorm()
  getRepairs()
})
//页码数发生改变
const HandlePageChange = async (page) => {
  Pages.value = page
  const { code, data } = await getRepairResponse(maintenanceSearchParams, page)
  if (code == 200) {
    repairTableData.value = data.list
  }
}
</script>

<template>
  <div>
    <!-- 搜索 -->
    <el-form
      ref="searchRef"
      :model="maintenanceSearchParams"
      :rules="floorDormRule"
      style="line-height: 50px"
      inline>
      <el-form-item prop="floorDorm">
        <el-input
          clearable
          style="width: 200px"
          v-model="maintenanceSearchParams.floorDorm"
          placeholder="请输入宿舍" />
      </el-form-item>
      <el-form-item>
        <el-select
          style="width: 200px"
          clearable
          v-model="maintenanceSearchParams.repairStatus"
          placeholder="维修状态">
          <el-option
            label="未完成"
            value="未完成" />
          <el-option
            label="已完成"
            value="已完成" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="SearchRepairs"
          >搜索</el-button
        >
        <el-button @click="resetForm(searchRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <OperateButton
      :isOperate="isOperate"
      :authBtn="operate_auth"
      v-model="repairVisible"
      @delete="deleteRepairs"
      @excel="expDialog = true" />
    <!-- 表格数据 -->
    <el-table
      ref="refTable"
      :data="repairTableData"
      @selection-change="
        (list) => (list.length ? (isOperate = false) : (isOperate = true))
      "
      border
      :max-height="525">
      <el-table-column
        type="selection"
        fixed
        width="50" />
      <el-table-column
        width="55"
        type="index"
        label="#" />
      <el-table-column
        prop="dormNumber"
        label="宿舍"
        width="80"
        align="center">
        <template #default="{ row }">
          {{ row.dorm.floorsName + "-" + row.dorm.dormNumber }}</template
        >
      </el-table-column>
      <el-table-column
        prop="problems"
        label="问题描述"
        width="250"
        align="center">
        <!-- <template #default="{ row, column, $index }"> </template> -->
      </el-table-column>
      <el-table-column
        prop="repairStatus"
        label="维修状态"
        width="100"
        align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.repairStatus === `已完成` ? `success` : `danger`"
            >{{ row.repairStatus }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="reportMan"
        label="报修人"
        width="120"
        align="center" />
      <el-table-column
        prop="phone"
        label="联系方式"
        width="120"
        align="center" />
      <el-table-column
        prop="submitDate"
        label="报修时间"
        width="150"
        align="center"
        ><template #default="{ row }">
          {{ FormatTime(row.submitDate) }}
        </template></el-table-column
      >
      <el-table-column
        prop="finishDate"
        label="完成时间"
        width="150"
        align="center"
        ><template #default="{ row }">
          {{
            FormatTime(row.finishDate) === "0001-01-01"
              ? "无"
              : FormatTime(row.finishDate)
          }}
        </template></el-table-column
      >
      <el-table-column
        prop="repairer"
        label="维修人"
        width="120"
        align="center" />
      <el-table-column
        fixed="right"
        width="200"
        prop="操作"
        label="操作"
        align="center">
        <template #default="{ row }">
          <TableButton
            :row="row"
            :authBtn="table_auth"
            @delete="deleteRepairs"
            @merge="repairVisible = true"
            v-model="maintenanceEditParams" />
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      @getCurrentPage="HandlePageChange"
      @getPageSizes="HandlePageChange" />
    <!-- 对话框 -->
    <FormDialog
      @close="Form.resetFields()"
      :width="50"
      v-model="repairVisible"
      v-model:params="maintenanceEditParams"
      :title="maintenanceEditParams.id ? `修改维修信息` : `添加维修信息`">
      <el-form
        ref="Form"
        inline
        :rules="formRules"
        :model="maintenanceEditParams"
        label-width="auto">
        <el-form-item
          style="width: 300px"
          label="上报时间"
          prop="submitDate">
          <el-date-picker
            v-model="maintenanceEditParams.submitDate"
            type="date"
            format="YYYY-MM-DD"
            placeholder="Start date" />
        </el-form-item>
        <el-form-item
          label="宿舍"
          prop="dormId">
          <el-select
            v-model="maintenanceEditParams.dormId"
            placeholder="请选择宿舍"
            style="width: 200px">
            <el-option-group
              v-for="group in options"
              :key="group.floorsName"
              :label="group.floorsName">
              <el-option
                v-for="item in group.dormList"
                :key="item.id"
                :label="group.floorsName + `-` + item.dormNumber"
                :value="item.id" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="userInfo.roleId !== 3"
          label="维修状态"
          prop="repairStatus">
          <el-select
            style="width: 195px"
            v-model="maintenanceEditParams.repairStatus"
            placeholder="请选择维修状态">
            <el-option
              label="未完成"
              value="未完成" />
            <el-option
              label="已完成"
              value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="上报人"
          prop="reportMan">
          <el-input
            v-model="maintenanceEditParams.reportMan"
            placeholder="请输入上报人" />
        </el-form-item>
        <el-form-item
          label="联系方式"
          prop="phone">
          <el-input
            v-model="maintenanceEditParams.phone"
            placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item
          v-if="userInfo.roleId !== 3"
          label="维修人员"
          prop="repairer">
          <el-input
            v-model="maintenanceEditParams.repairer"
            placeholder="请输入维修人员" />
        </el-form-item>
        <el-form-item
          style="width: 100%"
          label="故障问题描述"
          prop="problems">
          <el-input
            v-model="maintenanceEditParams.problems"
            placeholder="请输入内容"
            type="textarea" />
        </el-form-item>
        <el-form-item style="display: block">
          <el-button
            @click="
              maintenanceEditParams.id ? updateRepairs() : createRepairs()
            "
            type="success"
            >{{ maintenanceEditParams.id ? "更新" : "添加" }}</el-button
          >
          <el-button
            @click="resetForm(Form)"
            type="primary"
            >重置</el-button
          >
        </el-form-item></el-form
      ></FormDialog
    >
    <!-- <ExportDialog
      v-model="expDialog"
      @select="exportTable" /> -->
  </div>
</template>

<style lang="scss" scoped></style>
@/rules/maintenanceRules

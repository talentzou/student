<script setup>
import { add } from 'lodash';

const props = defineProps({
  isOperate: {
    require: true,
    type: Boolean,
    default: true
  },
  authBtn: {
    type: Object
  }
})
const emits = defineEmits(["excel", "delete","add"])
let visible = defineModel()
const operateIsTrue = ref(true)
function addBtn() {
  visible.value = true
  emits("add")
}
function deleteBtn() {
  emits("delete")
}
function exportBtn() {
  emits("excel")
}
</script>
<template>
  <div>
  <!-- 操作 -->
  <div class="operate">
    <el-button
      v-auth="`${authBtn.increase}`"
      size="small"
      type="success"
      @click="addBtn">
      <template #icon>
        <svg-icon
          name="plus"
          color="white"></svg-icon> </template
      >添加
    </el-button>

    <el-button
      v-auth="`${authBtn.delete}`"
      type="danger"
      @click="deleteBtn"
      :disabled="props.isOperate"
      size="small">
      <template #icon>
        <svg-icon
          name="delete"
          color="white"></svg-icon> </template
      >批量删除
    </el-button>

    <!-- <el-button
      type="warning"
      :disabled="props.isOperate"
      size="small"
      @click="exportBtn">
      <template #icon>
        <svg-icon
          name="export"
          color="white"></svg-icon> </template
      >导出
    </el-button> -->
  </div>
</div>
</template>
<style>
.operate {
  line-height: 32px;
  margin-bottom: 8px;
}
</style>

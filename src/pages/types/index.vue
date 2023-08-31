<template>
  <div
      v-loading = "loading"
      element-loading-text="Загрузка данных..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="type-container"
  >
    <br/>
    <el-row>
      <el-col :span="24">
        <el-table
            :data="tableData_types"
            border
        >
          <el-table-column  type="expand" width="100" label="Задачи">
            <template #default="scope">
                <el-row v-if="scope.row.task_templates.length > 0">
                  <el-col :span = 20 style="margin-left: 90px">
                    <el-table
                        :data="scope.row.task_templates"
                        border
                        style="padding: 0px"

                    >
                      <el-table-column  prop="id"        label="ID" width="60px" />
                      <el-table-column  prop="type"      label="Тип" />
                      <el-table-column  prop="name"      label="Название" />
                      <el-table-column  prop="content"   label="Содержание" />
                      <el-table-column  prop="criterion" label="Критерии" />
                    </el-table>
                  </el-col>
                </el-row>
                <span v-else>У этого типа смарт-карт нет шаблонов задач.</span>
            </template>

          </el-table-column>
          <el-table-column  prop="name" label="Название Eng" width="250"/>
          <el-table-column  prop="translate_name" label="Название Rus" width="300"/>
          <el-table-column  label="Индикаторы" >
            <template #default="scope">
              <p  v-for="item in scope.row.indicators" style="margin: 0px">
                <span>{{item.name}}</span>
              </p>
            </template>
          </el-table-column>
          <el-table-column  width="160">
            <template #header>
              Настройки &nbsp;
              <el-switch
                  v-model="activeTypes"
                  @change="getData"
              />
            </template>

            <template #default="scope">
              <el-button
                  size="small"
                  type="info"
                  @click="router.push({name:'typeEdit', params : {id : scope.row.id}})"
              >
                <el-icon><Tools /></el-icon>
              </el-button>
              <el-switch
                  v-model="statusTypes[scope.row.id]"
                  size="small"
                  :active-icon="Check"
                  :inactive-icon="Close"
                  style="margin-left: 15px"
                  @click="changeActive(scope.$index, scope.row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-col>

    </el-row>
  </div>
</template>

<script>
import { Check, Close } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router';
import {inject, reactive, ref} from "vue";
import  {ElMessageBox }  from 'element-plus';
import Default_tasks from "@/pages/task_templates";

export default {
  name: "typesIndex",
  components: {Default_tasks},
  setup(){
    const loadJson           = inject('loadJson');
    const svg                = inject('svg');
    const notify             = inject('notify');
    const userId             = inject('userId');

    const router             = useRouter();

    let loading              = ref(false);
    let tableData_types      = reactive([]);

    let activeTypes          = ref(true);
    let statusTypes          = reactive({});


    async function getData(){
      loading.value = true;
      //ниже получили типы SMART-карт
      let result = await loadJson('/smart-card/type/list', {user_id : userId.value, active : activeTypes.value ? 1 : 0});
      if (result.status =='success' && result.data) {

        tableData_types.length = 0;
        for (let prop of Object.getOwnPropertyNames(statusTypes)) {
          delete statusTypes[prop];
        }
       // statusTypes = reactive({});

        result.data.forEach(
            el => {tableData_types.push(el); statusTypes[el.id] = el.active == 1 ? true : false});
      };
      loading.value = false;
    };
    getData();

    function changeActive(index, row){
        ElMessageBox.confirm(`Вы уверены, что хотите ${statusTypes[row.id] ? ' активировать ' : ' дективировать '} тип смар карты ${row.name} ?`)
          .then(async () => {
            let sendIndicators = row.indicators.map(el => {el.action = 'none'; return el})
            loading.value = true;
            let result = await loadJson('/smart-card/type/edit',  {
              type_id        : row.id,
              name           : row.name,
              translate_name : row.translate_name,
              indicators     : sendIndicators,
              user_id        : userId.value,
              active         : statusTypes[row.id] ? 1 : 0,
            });

            if (result.status =='success') tableData_types.splice(index,1);
            loading.value = false;
            notify(`Деактивация типа`, result.message, result.status);
            })
          .catch(() => {
            statusTypes[row.id] = !statusTypes[row.id]
          })
      };

    return{
      tableData_types, loading, svg, activeTypes, Check, Close, statusTypes, router,
      changeActive, getData
    }
  }
}
</script>

<style scoped>

</style>
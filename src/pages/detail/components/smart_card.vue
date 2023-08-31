<template>
  <div
      class="info-container"
      v-loading = "loading"
       element-loading-text="Загрузка данных..."
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
  >
    <el-row>
      <el-col :span="10">
        <div>
          <el-row class="executor-row">
            <el-col :span="12" class="info-title" > <label>Исполнитель:</label></el-col>
            <el-col :span="12">
              <el-row class="executor">
                <el-col :span="20" class="executor">
                  <label>{{value.executor.label}}</label>
                </el-col>
                <el-col :span="4" align="left" >
                  <span class="userPhoto">
                    <a :href="value.executor.link">
                      <img :src="value.executor.photo" alt="фото"/>
                    </a>
                </span>
                </el-col>
              </el-row>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12" class="info-title" > <label>Департамент:</label></el-col>
            <el-col :span="12"> <label>{{value.department.label}}</label></el-col>
          </el-row>

          <el-row>
            <el-col :span="12" class="info-title"> <label>Номер:</label></el-col>
            <el-col :span="12"> <label>{{route.params.id}}</label></el-col>
          </el-row>

          <el-row>
            <el-col :span="12" class="info-title"> <label>Вид:</label></el-col>
            <el-col :span="12"> <label>{{kindList.find(el => {return el.value === value.kind}).label}}</label></el-col>
          </el-row>

          <el-row v-if="value.type_id">
            <el-col :span="12" class="info-title"> <label>Тип:</label></el-col>
            <el-col :span="12"> <label>{{typeList.find(el => {return el.value === value.type_id}).label}}</label></el-col>
          </el-row>

          <el-row>
            <el-col :span="12" class="info-title"> <label>Период:</label></el-col>
            <el-col :span="12"> <label>{{periodList.find(el => {return el.value === value.period_type}).label}}</label></el-col>
          </el-row>

          <el-row v-if="value.period_type !== 'year'">
            <el-col :span="12" class="info-title"> <label>Отчетный период:</label></el-col>
            <el-col :span="12"> <label>{{value.period_type === 'month' ?  monthList.find(el => {return el.value === value.period_value}).label : value.period_value}}</label></el-col>
          </el-row>

          <el-row>
            <el-col :span="12" class="info-title"> <label>Год отчетного периода:</label></el-col>
            <el-col :span="12"> <label>{{value.year}}</label></el-col>
          </el-row>

          <el-row>
            <el-col :span="12" class="info-title"> <label>Статус:</label></el-col>
            <el-col :span="12"> <label>{{map[smartCardStatus]}}{{(smartCardStatus==='completed' && value.kind==='card' ) ? ' к оплате' : ''}}</label></el-col>
          </el-row>

          <el-row>
            <el-col :span="12" class="info-title"> <label :class="weights != 100 ? 'weight-red' : ''" >Суммарный вес задач:</label></el-col>
            <el-col :span="12"> <label :class="weights != 100 ? 'weight-red' : ''" >{{weights ? weights : '0'}}%</label></el-col>
          </el-row>

          <br/>
          <div
              v-if="smartCardStatus==='report_completed'"
              class="info-footer"
          >
            <el-button
                v-if="value.calculator"
                class="approving"
                @click="page='businessProcess'"
            >
              Принять к оплате
            </el-button>
          </div>
          <div
              v-if="smartCardStatus!=='report_completed' && full_access"
              class="info-footer"
          >
            <el-button
                v-if="smartCardStatus === 'created' || smartCardStatus === 'working' || smartCardStatus === 'report_prepare'"
                class="approving"
                @click="approvingSmartCard"
            >
              {{showButtonLabel}}
            </el-button>
            <el-button
                v-if="smartCardStatus === 'created'"
                class="editing"
                @click="editSmartCard"
            >
              Редактировать
            </el-button>
            <el-button
                v-if="smartCardStatus === 'created'"
                class="deleting"
                @click="deleteSmartCard"
            >
              Удалить
            </el-button>
          </div>

          <div
              v-if="['report_prepare', 'report_approving', 'report_completed', 'completed'].includes(smartCardStatus) && value.kind==='card'"
              style="display: flex; justify-content: center; margin-top: 70px"
          >
            <chart
                :per="valuation ? valuation : 0"
                :full-text="true"
                color="#3BC8F5"
                color-bg="#fff"
                text-size="35"
                radius-out="250"
                radius-in="25"
            />
          </div>

        </div>
      </el-col>
      <el-col :span="14" style="padding-left: 40px ">
        <el-table
            :data="tableDataTasks"
            :row-class-name="tableRowClassName"
            :row-style="tableRowStyle"
            style="border: #ebeef5 1px solid"
        >
          <el-table-column  prop="name" label="Наименование задачи"/>
          <el-table-column  prop="plan" label="План">
            <template #default="scope">
              {{formatNumber(scope.row.plan)}}
            </template>
          </el-table-column>
          <el-table-column  prop="fact" label="Факт">
            <template #default="scope">
              {{formatNumber(scope.row.fact)}}
            </template>
          </el-table-column>
          <el-table-column  prop="fact_percent" label="Факт %"/>
          <el-table-column
              width="110px"
              v-if="['report_prepare', 'report_approving', 'report_completed', 'completed'].includes(smartCardStatus) && value.kind==='card'"
              label="Оценка Y"
          >
            <template #default="scope">
              <div style="display: flex; justify-content: center">
                <chart
                    :per="scope.row.fact_calculated ? scope.row.fact_calculated : 0"
                    :full-text="false"
                    color="#3BC8F5"
                    color-bg="#fff"
                    text-size="10"
                    radius-out="45"
                    radius-in="8"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>

import {computed, inject, reactive, ref} from 'vue'
import { useRouter, useRoute } from 'vue-router';
import  {ElMessageBox }  from 'element-plus';
import chart from '../../../components/chart'

export default {
  name: "smart_card",
  props: ['value', 'history'],
  components : {chart},
  setup(){
    const loadJson          = inject('loadJson');
    const map               = inject('map');
    const smartCardId       = inject('smartCardId');
    const smartCardStatus   = inject('smartCardStatus');
    const kindList          = inject('kindList');
    const periodList        = inject('periodList');
    const typeList          = inject('typeList');
    const monthList         = inject('monthList');
    const userId            = inject('userId');
    const full_access       = inject('full_access');
    const svg               = inject('svg');
    const notify            = inject('notify');
    const formatNumber      = inject('formatNumber');
    let page                = inject('page');
    let weights             = inject('weights');
    let valuation           = inject('valuation');

    const loading         = ref(false);
    const showButtonLabel   = computed(() => {
      let showValue = 'Согласовать план';
      smartCardStatus.value === 'working'         ? showValue = 'Сформировать отчет' : ''
      smartCardStatus.value === 'report_prepare'  ? showValue = 'Согласовать отчет' : ''
      return showValue
    })

    const router          = useRouter();
    const route           = useRoute();

    const tableDataTasks  = reactive([]);

    function tableRowClassName({row, rowIndex}) {
      return 'task_table_row_width'
    }
    function tableRowStyle(row){
       let Y = row.row.fact_percent ? +row.row.fact_percent + '%' : 0 + '%';
       return  {'--percent-result' : Y}
    }

    async function getData(){
      loading.value = true;
      let result = await loadJson('/smart-card/get-tasks', {smartcard_id : smartCardId.value, user_id : userId.value});
      loading.value = false;
      if (result.status === 'success' && result.data) {
        tableDataTasks.length = 0;

        result.data.sort(function (a, b){
          return a.fact_percent - b.fact_percent
        })
        result.data.forEach(el => {tableDataTasks.push(el)});
      }
    }
    getData();

    async function approvingSmartCard(){
      if(smartCardStatus.value === 'working') {
        ElMessageBox.confirm(`Вы уверены, что хотите перейти к подготовке отчета для SMART-карты с ID - ${smartCardId.value}?`)
            .then(async() => {
              loading.value = true;
              let result = await loadJson('/smart-card/change-status', {
                smartcard_id : smartCardId.value,
                user_id      : userId.value,
                status   : 'report_prepare'
              });
              loading.value = false;
              if (result.status == 'success') {
                smartCardStatus.value = 'report_prepare';
                page.value = 'tasks';
              } else  notify('Ошибка изменения статуса SMART-карты', `При изменении статуса SMART-карты возникла ошибка!`, 'error');
            })
            .catch(() => {})
      } else page.value = 'businessProcess';

    };

    function editSmartCard(){
      if (smartCardStatus.value != 'created') return notify('Редактирование SMART-карты', `Редактирование допускается только на этапе подготовки SMART-карты! Текущий статус SMART-карты - ${smartCardStatus.value}.`, 'error');

      ElMessageBox.confirm(`Вы уверены, что хотите редактировать SMART-карту с ID - ${smartCardId.value}?`)
          .then(() => {
            router.push({name:'smartCardEdit', params: { id: smartCardId.value}});
          })
          .catch(() => {})
    };

    function deleteSmartCard(){
       if (smartCardStatus.value != 'created') return notify('Удаление SMART-карты', `Удаление SMART-карты допускается только на этапе подготовки! Текущий статус SMART-карты - ${smartCardStatus.value}.`, 'error');

       ElMessageBox.confirm(`Вы уверены, что хотите удалить SMART-карту с ID - ${smartCardId.value}?`)
          .then(async() => {
            loading.value = true;
            let result = await loadJson('/smart-card/delete', {smartcard_id : smartCardId.value, user_id : userId.value});
            loading.value = false;

            if(result.status === 'success') {
              smartCardId.value = null;
              router.push({name:'listAll'});
            };
            notify('Удаление SMART-карты ', result.message, result.status);
          })
          .catch(() => {})
    };

    return{
      loading, svg, map, smartCardStatus,showButtonLabel, weights, valuation, page, route, typeList, monthList,
      periodList, kindList, full_access, tableDataTasks,
      approvingSmartCard, editSmartCard, deleteSmartCard, tableRowClassName, tableRowStyle, formatNumber
    }
  },
}
</script>

<style scoped>

el-table__row .task_table_row_width{
  position: relative;
}

.info-container >>> tr.el-table__row.task_table_row_width:after {
  content: "";
  display: block;
  position: absolute;
  width: var(--percent-result);
  height: 100%;
  background-color: #d8effd;
  left: 0;
}

.info-container >>> .el-table__header
{
  min-height:62px;
}


</style>